// following @pfrazee's beaker pattern again here.
    // import { ipcRenderer } from 'electron';
// import rpc from 'pauls-electron-rpc';
import pkg from 'appPackage';
import logger from 'logger';
import * as remoteCallActions from 'actions/remoteCall_actions';
// import { safeAuthApi } from 'extensions/safe/auth-api'
import safe from '@maidsafe/safe-node-app';
import { PROTOCOLS } from 'appConstants';
// import
import { manifest as authManifest } from 'extensions/safe/auth-api/manifest'

const VERSION = pkg.version;

window.eval = global.eval = () => {
  throw new Error(`Sorry, this app does not support window.eval().`)
}

export const setupPreloadedSafeAuthAPIs = ( store ) =>
{
    window.safeApp = { ...safe, fromAuthURI: null };


    // safe = null;
    // mark the safe protocol as 'secure' to enable all DOM APIs
    // webFrame.registerURLSchemeAsSecure('safe');
    window[ pkg.name ] = { version: VERSION };

    logger.info('SETTING UP PRELOADED SAFEEFEFESSSSS')
    if( window.location.protocol === PROTOCOLS.SAFE_AUTH )
    {
        logger.info('auth api setup=================', authManifest)
        // we need the auth apis.
        // logger.info( safeAuthApi.manifest );

    }
    window.safeAuthenticator = {};
    const safeAppGroupId = ( Math.random() * 1000 | 0 ) + Date.now();
    window.safeAppGroupId = safeAppGroupId;

    authManifest.forEach( (func) => {
        logger.info('making funccc');
        window.safeAuthenticator[func] = createRemoteCall( func, store );
    });

}

const setupPreloadAPIs = ( store ) =>
{
    logger.info('setting up preloads');

    const listeners = [];

    window.testAPI = createRemoteCall( 'boom', store );
}


const createRemoteCall = ( functionName, store ) =>
{
    if( !functionName )
    {
        throw new Error( 'Remote calls must have a functionName to call.')
    }
    logger.info('creating remote calllll', functionName)
    const remoteCall = ( ...args ) =>  new Promise( ( resolve, reject ) =>
    {
        logger.info('doing remote calllll', functionName)
        const callId = Math.random().toString( 36 );

        //but we need store.
        store.dispatch( remoteCallActions.addRemoteCall(
            {
                id: callId,
                name: functionName
            }
        ) );

        addListenerForCall( store, callId, resolve, reject );
    } );

    return remoteCall;
}

const addListenerForCall = ( store, callId, resolve, reject ) =>
{
    let listener = store.subscribe( async () =>
    {
        const state = store.getState();
        const calls = state.remoteCalls;
        console.log('store channngeedddd', calls );

        let call = calls.find( c => c.id === callId );

        if( call.done )
        {
            console.log('GOT SOME DATAAA', call.replyArgs)
            logger.info('GOT SOME DATAAA', call.replyArgs)
            listener = null;

            resolve( calls[0].replyArgs )
        }
        else if( call.error )
        {
            reject( e )
        }
        // handlePeruseStoreChanges( store );
    }  );
}

export default setupPreloadAPIs;
