// following @pfrazee's beaker pattern again here.
    // import { ipcRenderer } from 'electron';
// import rpc from 'pauls-electron-rpc';
import pkg from 'appPackage';
// import logger from 'logger';
import * as remoteCallActions from 'actions/remoteCall_actions';
// import { safeAuthApi } from 'extensions/safe/auth-api'
import safe from '@maidsafe/safe-node-app';
import { PROTOCOLS } from 'appConstants';

import {LISTENER_TYPES} from 'extensions/safe/auth-constants';
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

    console.log('SETTING UP PRELOADED SAFEEFEFESSSSS')
    if( window.location.protocol === PROTOCOLS.SAFE_AUTH )
    {
        console.log('auth api setup=================', authManifest)
        // we need the auth apis.
        // console.log( safeAuthApi.manifest );

    }
    window.safeAuthenticator = {};
    const safeAppGroupId = ( Math.random() * 1000 | 0 ) + Date.now();
    window.safeAppGroupId = safeAppGroupId;

    authManifest.forEach( (func) => {
        console.log('making funccc');
        window.safeAuthenticator[func] = createRemoteCall( func, store );
    });

    // overwrite those that need to set listeners for auth web app
    // export const setNetworkListener = (cb) =>
    //   authenticator.setListener(CONSTANTS.LISTENER_TYPES.NW_STATE_CHANGE, cb);
    //
    // export const setAppListUpdateListener = (cb) =>
    //   authenticator.setListener(CONSTANTS.LISTENER_TYPES.APP_LIST_UPDATE, cb);

    // Auth App Hack.
    window.safeAuthenticator.setNetworkListener = ( cb ) =>
    {
        console.log('ipcRenderer callback happening cis it was received.')

        return true;
        // ipcRenderer.on( LISTENER_TYPES.NW_STATE_CHANGE, cb );
    }

    // BUTTTTT we need to the webview ID to send...

    window.safeAuthenticator.setNetworkListener = ( cb ) =>
    {
        console.log('ipcRenderer callback happening cis it was received.')
        return true;
        // ipcRenderer.on( LISTENER_TYPES.APP_LIST_UPDATE, cb );
    }
}

const setupPreloadAPIs = ( store ) =>
{
    console.log('setting up preloads');

    const listeners = [];
}


const createRemoteCall = ( functionName, store ) =>
{
    if( !functionName )
    {
        throw new Error( 'Remote calls must have a functionName to call.')
    }
    console.log('creating remote calllll', functionName)
    const remoteCall = ( ...args ) =>  new Promise( ( resolve, reject ) =>
    {
        console.log('doing remote calllll', functionName)
        const callId = Math.random().toString( 36 );

        //but we need store.
        store.dispatch( remoteCallActions.addRemoteCall(
            {
                id: callId,
                name: functionName,
                args
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
        // console.log('store channngeedddd', calls );

        let theCall = calls.find( c => c.id === callId );

        if( !theCall )
        {
            return;
        }

        if( theCall.done && resolve )
        {
            console.log('GOT SOME DATAAA', theCall )
            // listener = null;
            //unsubscirbes!
            listener();
            let callbackArgs = theCall.response;

            if( !Array.isArray( theCall.response ) )
            {
                callbackArgs = [ theCall.response ];
            }
            //
            console.log('callbackArgssssss', callbackArgs)
            resolve( ...callbackArgs );

            store.dispatch( remoteCallActions.removeRemoteCall(
                theCall
            ) );
        }
        else if( theCall.error )
        {
            reject( e )
        }
        // handlePeruseStoreChanges( store );
    }  );
}

export default setupPreloadAPIs;
