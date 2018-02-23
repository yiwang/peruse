import EventEmitter from 'events';
import { Writable } from 'stream';
import { ipcRenderer } from 'electron';
import { valueToIPCValue, duplex } from  './rpcUtils' ;


module.exports = function ( channelName, manifest, methods, globalPermissionCheck )
{
    const api = new EventEmitter();
    const webcontentsStreams = {};

    ipcRenderer.send('hireBouncer', channelName );
    // wire up handler
    ipcRenderer.on( channelName, async function ( event, methodName, isDestroyed, requestId, ...args )
    {
    // watch for a navigation event
        let hasNavigated = false;

        function onDidNavigate()
        {
            hasNavigated = true;
        }

        ipcRenderer.on( 'did-navigate', onDidNavigate );

        // helper to send
        const send = function ( msgName, err, value, keepListeningForDidNavigate = false )
        {
            if ( isDestroyed ) return; // dont send response if destroyed
            if ( !keepListeningForDidNavigate ) event.sender.removeListener( 'did-navigate', onDidNavigate );
            if ( hasNavigated ) return; // dont send response if the page changed
            event.sender.send( channelName, msgName, requestId, err, value );
        };

        // handle special methods
        if ( methodName == 'stream-request-write' )
        {
            event.returnValue = true;
            return streamRequestWrite( event.sender.id, requestId, args );
        }
        if ( methodName == 'stream-request-end' )
        {
            event.returnValue = true;
            return streamRequestEnd( event.sender.id, requestId, args );
        }
        if ( methodName == 'stream-request-close' )
        {
            event.returnValue = true;
            return streamRequestClose( event.sender.id, requestId, args );
        }

        // look up the method called
        const type = manifest[methodName];
        const method = methods[methodName];
        if ( !type || !method )
        {
            api.emit( 'error', new Error( `Method not found: "${methodName}"` ), arguments );
            return;
        }

        // global permission check
        if ( globalPermissionCheck && !globalPermissionCheck( event, methodName, args ) )
        {
            // repond according to method type
            if ( type == 'async' || type == 'promise' )
            {
                send( 'async-reply', 'Denied' );
            }
            else
            {
                event.returnValue = { error: 'Denied' };
            }
            return;
        }

        // run method by type
        if ( type == 'sync' )
        {
            // call sync
            try
            {
                event.returnValue = { success: valueToIPCValue( method.apply( event, args ) ) };
            }
            catch ( e )
            {
                event.returnValue = { error: e.message };
            }
            return;
        }
        if ( type == 'async' )
        {
            // create a reply cb
            const replyCb = ( err, value ) =>
            {
                if ( err ) err = err.message || err;
                send( 'async-reply', err, valueToIPCValue( value ) );
            };
            args.push( replyCb );

            // call async
            method.apply( event, args );
            return;
        }
        if ( type == 'promise' )
        {
            // call promise
            let p;
            try
            {
                p = method.apply( event, args );
                if ( !p )
                {
                    p = Promise.resolve();
                }
            }
            catch ( e )
            {
                p = Promise.reject( errorObject( e ) );
            }

            // handle response
            p.then(
                value => send( 'async-reply', null, valueToIPCValue( value ) ),
                error => send( 'async-reply', errorObject( error ) )
            );
            return;
        }

        const streamTypes = {
            readable : createReadableEvents,
            writable : createWritableEvents,
            duplex   : createDuplexEvents
        };

        if ( streamTypes[type] )
        {
            return await handleStream( event, method, requestId, args, streamTypes[type], send );
        }

        api.emit( 'error', new Error( `Invalid method type "${type}" for "${methodName}"` ), arguments );
    } );

    async function handleStream( event, method, requestId, args, createStreamEvents, send )
    {
    // call duplex
        let stream;
        try
        {
            stream = method.apply( event, args );
            if ( !stream )
            {
                event.returnValue = { success: false };
                return;
            }
        }
        catch ( e )
        {
            event.returnValue = { error: e.message };
            return;
        }

        // handle promises
        if ( stream && stream.then )
        {
            event.returnValue = { success: true };
            try
            {
                stream = await stream; // wait for it
            }
            catch ( e )
            {
                send( 'stream-error', `${e}` );
                return;
            }
        }

        trackWebcontentsStreams( event.sender, requestId, stream );
        const events = createStreamEvents( event, stream, requestId, send );
        hookUpEventsAndUnregister( stream, events );

        // done
        event.returnValue = { success: true };
    }

    function hookUpEventsAndUnregister( stream, events )
    {
        Object.keys( events ).forEach( key => stream.on( key, events[key] ) );
        stream.unregisterEvents = () =>
        {
            Object.keys( events ).forEach( key => stream.removeListener( key, events[key] ) );
        };
    }

    function createReadableEvents( event, stream, requestId, send )
    {
        return {
            data     : chunk => send( 'stream-data', valueToIPCValue( chunk ), undefined, true ),
            readable : () => send( 'stream-readable', undefined, undefined, true ),
            close    : () => send( 'stream-close' ),
            error    : err =>
            {
                stream.unregisterEvents();
                send( 'stream-error', ( err ) ? err.message : '' );
            },
            end : () =>
            {
                stream.unregisterEvents(); // TODO does calling this in 'end' mean that 'close' will never be sent?
                send( 'stream-end' );
                webcontentsStreams[event.sender.id][requestId] = null;
            }
        };
    }

    function createWritableEvents( event, stream, requestId, send )
    {
        return {
            drain : () => send( 'stream-drain', undefined, undefined, true ),
            close : () => send( 'stream-close' ),
            error : err =>
            {
                stream.unregisterEvents();
                send( 'stream-error', ( err ) ? err.message : '' );
            },
            finish : () =>
            {
                stream.unregisterEvents();
                send( 'stream-finish' );
                webcontentsStreams[event.sender.id][requestId] = null;
            }
        };
    }

    function createDuplexEvents( event, stream, requestId, send )
    {
        return Object.assign(
            createWritableEvents( event, stream, requestId, send ),
            createReadableEvents( event, stream, requestId, send ) );
    }

    // special methods
    function trackWebcontentsStreams( webcontents, requestId, stream )
    {
    // track vs. sender's lifecycle
        if ( !webcontentsStreams[webcontents.id] )
        {
            webcontentsStreams[webcontents.id] = {};
            // listen for webcontent close event
            webcontents.once( 'did-navigate', closeAllWebcontentsStreams( webcontents.id ) );
            webcontents.once( 'destroyed', closeAllWebcontentsStreams( webcontents.id ) );
        }
        webcontentsStreams[webcontents.id][requestId] = stream;
    }

    function streamRequestWrite( webcontentsId, requestId, args )
    {
        const stream = webcontentsStreams[webcontentsId][requestId];

        if ( stream && typeof stream.write === 'function' )
        {
            // massage data
            if ( stream._writableState && !stream._writableState.objectMode && !Buffer.isBuffer( args[0] ) )
            {
                args[0] = `${args[0]}`;
            }

            // write
            stream.write( ...args );
        }
    }
    function streamRequestEnd( webcontentsId, requestId, args )
    {
        const stream = webcontentsStreams[webcontentsId][requestId];
        if ( stream && typeof stream.end === 'function' )
        {
            stream.end( ...args );
        }
    }
    function streamRequestClose( webcontentsId, requestId, args )
    {
        const stream = webcontentsStreams[webcontentsId][requestId];
        if ( !stream )
        {
            return;
        }
        // try .close
        if ( typeof stream.close === 'function' )
        {
            stream.close( ...args );
        }
        // hmm, try .destroy
        else if ( typeof stream.destroy === 'function' )
        {
            stream.destroy( ...args );
        }
        // oye, last shot: end()
        else if ( typeof stream.end === 'function' )
        {
            stream.end( ...args );
        }
    }

    // helpers
    function closeAllWebcontentsStreams( webcontentsId )
    {
        return e =>
        {
            if ( !webcontentsStreams[webcontentsId] )
            {
                return;
            }

            // close all of the open streams
            for ( const requestId in webcontentsStreams[webcontentsId] )
            {
                if ( webcontentsStreams[webcontentsId][requestId] )
                {
                    webcontentsStreams[webcontentsId][requestId].unregisterEvents();
                    streamRequestClose( webcontentsId, requestId, [] );
                }
            }

            // stop tracking
            delete webcontentsStreams[webcontentsId];
        };
    }

    return api;
};

function errorObject( err )
{
    if ( err.name || err.message )
    {
        return { name: err.name, message: err.message };
    }
    return err.toString();
}
