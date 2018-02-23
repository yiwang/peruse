import pkg from 'appPackage';
import logger from 'logger';
import * as remoteCallActions from 'actions/remoteCall_actions';
import safe from '@maidsafe/safe-node-app';
import { PROTOCOLS } from 'appConstants';

import { LISTENER_TYPES } from 'extensions/safe/auth-constants';
import { manifest as authManifest } from 'extensions/safe/auth-api/manifest';

const VERSION = pkg.version;

const pendingCalls = {};

window.eval = global.eval = () =>
{
    throw new Error( 'Sorry, this app does not support window.eval().' );
};

const setupPreloadedSafeAuthAPIs = ( store ) =>
{
    window.safeApp = { ...safe, fromAuthURI: null };
    window[pkg.name] = { version: VERSION };

    if ( !window.location.protocol === PROTOCOLS.SAFE_AUTH )
    {
        return;
    }

    window.safeAuthenticator = {};
    const safeAppGroupId = ( Math.random() * 1000 | 0 ) + Date.now();
    window.safeAppGroupId = safeAppGroupId;

    authManifest.forEach( ( func ) =>
    {
        window.safeAuthenticator[func] = createRemoteCall( func, store );
    } );

    window.safeAuthenticator.getNetworkState = ( ) =>
    {
        const state = store.getState();
        logger.info( 'getting the network state!', state.authenticator.networkState );
        console.log( 'getting the network state!', state.authenticator.networkState );
        return { state: state.authenticator.networkState };
    };

    window.safeAuthenticator.getAuthenticatorHandle = ( ) =>
    {
        logger.info( 'window method for get auth handle being called' );
        const state = store.getState();
        return state.authenticator.authenticatorHandle;
    };

    window.safeAuthenticator.getLibStatus = ( ) =>
    {
        const state = store.getState();
        return state.authenticator.libStatus;
    };

    window.safeAuthenticator.setReAuthoriseState = ( ) =>
    {
        // TODO: Reauth action
        // const state = store.getState();
        // return state.authenticator.authenticatorHandle;

    };


    // Add custom and continual listeners.
    window.safeAuthenticator.setNetworkListener = ( cb ) =>
    {
        const callId = Math.random().toString( 36 );

        store.dispatch( remoteCallActions.addRemoteCall(
            {
                id         : callId,
                name       : 'setNetworkListener',
                isListener : true
            }
        ) );

        pendingCalls[callId] = {
            resolve : cb
        };
    };

    window.safeAuthenticator.setAppListUpdateListener = ( cb ) =>
    {
        const callId = Math.random().toString( 36 );

        logger.info( 'about to add in APP LIST listener' );

        store.dispatch( remoteCallActions.addRemoteCall(
            {
                id         : callId,
                name       : 'setAppListUpdateListener',
                isListener : true
            }
        ) );

        pendingCalls[callId] = {
            resolve : cb
        };
    };


    const stopListening = store.subscribe( async () =>
    {
        const state = store.getState();
        const calls = state.remoteCalls;

        calls.forEach( theCall =>
        {
            if ( theCall === pendingCalls[theCall.id] )
            {
                return;
            }

            const callPromises = pendingCalls[theCall.id];

            if ( theCall.done && callPromises.resolve )
            {
                pendingCalls[theCall.id] = theCall;

                logger.silly( '::::::remoteCall', theCall.name, 'IS RESOLVED w/', theCall.response );

                let callbackArgs = theCall.response;

                callbackArgs = [theCall.response];

                store.dispatch( remoteCallActions.removeRemoteCall(
                    theCall
                ) );

                if ( theCall.isListener )
                {
                    // error first
                    return callPromises.resolve( null, ...callbackArgs );
                }
                return callPromises.resolve( ...callbackArgs );
            }
            else if ( theCall.error && callPromises.reject )
            {
                logger.silly( '::::::remoteCall', theCall.name, 'IS REJECTED w/', theCall.response );
                console.log('thecalllll errrrrr', theCall.error);
                return callPromises.reject( new Error( theCall.error.message || theCall.error ) );
            }
        } );
    } );
};


const createRemoteCall = ( functionName, store ) =>
{
    if ( !functionName )
    {
        throw new Error( 'Remote calls must have a functionName to call.' );
    }

    const remoteCall = ( ...args ) => new Promise( ( resolve, reject ) =>
    {
        console.log( 'doing remote calllll', functionName );
        const callId = Math.random().toString( 36 );

        logger.info( 'about to add ', functionName );
        const theCall = {
            id   : callId,
            name : functionName,
            args
        };

        // but we need store.
        store.dispatch( remoteCallActions.addRemoteCall( theCall ) );

        pendingCalls[theCall.id] = {
            resolve, reject
        };
    } );

    return remoteCall;
};
export default setupPreloadedSafeAuthAPIs;
