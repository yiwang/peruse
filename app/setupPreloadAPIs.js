// following @pfrazee's beaker pattern again here.
import { ipcRenderer } from 'electron';
// import rpc from 'pauls-electron-rpc';
import pkg from 'appPackage';
// import logger from 'logger';
import * as remoteCallActions from 'actions/remoteCall_actions';
// import { safeAuthApi } from 'extensions/safe/auth-api'
import safe from '@maidsafe/safe-node-app';
import { PROTOCOLS } from 'appConstants';

import { LISTENER_TYPES } from 'extensions/safe/auth-constants';
// import
import { manifest as authManifest } from 'extensions/safe/auth-api/manifest';

const VERSION = pkg.version;

window.eval = global.eval = () =>
{
    throw new Error( 'Sorry, this app does not support window.eval().' );
};

export const setupPreloadedSafeAuthAPIs = ( store ) =>
{
    window.safeApp = { ...safe, fromAuthURI: null };
    window.ipc = ipcRenderer;

    // safe = null;
    // mark the safe protocol as 'secure' to enable all DOM APIs
    // webFrame.registerURLSchemeAsSecure('safe');
    window[pkg.name] = { version: VERSION };

    console.log( 'SETTING UP PRELOADED SAFEEFEFESSSSS' );
    if ( window.location.protocol === PROTOCOLS.SAFE_AUTH )
    {
        // console.log( 'auth api setup=================', authManifest );
        // we need the auth apis.
        // console.log( safeAuthApi.manifest );
    }
    window.safeAuthenticator = {};
    const safeAppGroupId = ( Math.random() * 1000 | 0 ) + Date.now();
    window.safeAppGroupId = safeAppGroupId;

    authManifest.forEach( ( func ) =>
    {
        // console.log( 'making funccc' );
        window.safeAuthenticator[func] = createRemoteCall( func, store );
    } );

    // overwrite those that need to set listeners for auth web app
    // export const setNetworkListener = (cb) =>
    //   authenticator.setListener(CONSTANTS.LISTENER_TYPES.NW_STATE_CHANGE, cb);
    //
    // export const setAppListUpdateListener = (cb) =>
    //   authenticator.setListener(CONSTANTS.LISTENER_TYPES.APP_LIST_UPDATE, cb);


    window.safeAuthenticator.getNetworkState = ( ) =>
    {
        const state = store.getState();
        console.log('getting the network state!', state.authenticator.networkState)
        return { state: state.authenticator.networkState };
    }

    window.safeAuthenticator.getAuthenticatorHandle = ( ) =>
    {
        const state = store.getState();
        return state.authenticator.authenticatorHandle;
    }

    window.safeAuthenticator.getLibStatus = ( ) =>
    {
        const state = store.getState();
        return state.authenticator.libStatus;
    }

    window.safeAuthenticator.setReAuthoriseState = ( ) =>
    {
        // TODO: Reauth action
        // const state = store.getState();
        // return state.authenticator.authenticatorHandle;
        return;
    }


    // Add custom and continual listeners.
    window.safeAuthenticator.setNetworkListener = ( cb ) =>
    {
        console.log( 'adding custom lstenere callback.' );

        // return true;
        // window.ipc.on( LISTENER_TYPES.NW_STATE_CHANGE, cb );
        const callId = Math.random().toString( 36 );
        store.dispatch( remoteCallActions.addRemoteCall(
            {
                id         : callId,
                name       : 'setNetworkListener',
                isListener : true
            }
        ) );

        addListenerForCall( store, callId, cb );
    };

    window.safeAuthenticator.setAppListUpdateListener = ( cb ) =>
    {
        console.log( 'adding setAppListUpdateListener lstener callback happening is it was received.' );

        // return true;
        // window.ipc.on( LISTENER_TYPES.NW_STATE_CHANGE, cb );
        const callId = Math.random().toString( 36 );
        store.dispatch( remoteCallActions.addRemoteCall(
            {
                id         : callId,
                name       : 'setNetworkListener',
                isListener : true
            }
        ) );

        addListenerForCall( store, callId, cb );
    };

    // BUTTTTT we need to the webview ID to send...

    // window.safeAuthenticator.setNetworkListener = ( cb ) =>
    // {
    //     console.log( 'ipcRenderer callback happening cis it was received.' );
    //     return true;
    //     // ipcRenderer.on( LISTENER_TYPES.APP_LIST_UPDATE, cb );
    // };
};

const setupPreloadAPIs = ( store ) =>
{
    console.log( 'setting up preloads' );

    const listeners = [];
};


const createRemoteCall = ( functionName, store ) =>
{
    if ( !functionName )
    {
        throw new Error( 'Remote calls must have a functionName to call.' );
    }
    // console.log( 'creating remote calllll', functionName );
    const remoteCall = ( ...args ) => new Promise( ( resolve, reject ) =>
    {
        console.log( 'doing remote calllll', functionName );
        const callId = Math.random().toString( 36 );

        // but we need store.
        store.dispatch( remoteCallActions.addRemoteCall(
            {
                id   : callId,
                name : functionName,
                args
            }
        ) );

        addListenerForCall( store, callId, resolve, reject );
    } );

    return remoteCall;
};

const addListenerForCall = ( store, callId, resolve, reject ) =>
{
    let cachedCall = {};

    const stopListening = store.subscribe( async () =>
    {
        const state = store.getState();
        const calls = state.remoteCalls;
        // console.log('store channngeedddd', calls );

        const theCall = calls.find( c => c.id === callId );

        if ( !theCall || theCall === cachedCall )
        {
            return;
        }

        if ( theCall.done && resolve )
        {
            cachedCall = theCall;
            console.log( theCall.name, 'IS RESOLVED', theCall.response );
            // stopListening = null;
            // unsubscirbes!


            let callbackArgs = theCall.response;

            if ( !Array.isArray( theCall.response ) )
            {
                callbackArgs = [theCall.response];
            }
            //
            // if( !theCall.isListener )
            // {
                //redux, triggers unregistering the stopListening
                resolve( ...callbackArgs );
                store.dispatch( remoteCallActions.removeRemoteCall(
                    theCall
                ) );
            // }

            // if( )
            stopListening();
            // console.log( 'callbackArgssssss', callbackArgs );

        }
        else if ( theCall.error && reject )
        {
            reject( theCall.error );
        }
        // handlePeruseStoreChanges( store );
    } );
};

export default setupPreloadAPIs;
