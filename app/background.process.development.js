/* eslint global-require: 1, flowtype-errors/show-errors: 0 */

import logger from 'logger';
import { configureStore } from 'store/configureStore';
// import { init } from  'extensions/safe/init-safe-background-processes';
// TODO This handling needs to be imported via extension apis more seemlessly
import handlePeruseStoreChanges from './peruseSafeApp';
import * as remoteCallActions from 'actions/remoteCall_actions';

// TODO: Dont use client when the same. Offer up original where worded differently
// aim to deprecate client file.
import * as theAPI from 'extensions/safe/auth-api/authFuncs';

import { isRunningProduction, SAFE } from 'appConstants';
// import ipc from './ffi/ipc';

import { initAnon, initMock } from 'extensions/safe/network';


import * as authAPI from 'extensions/safe/auth-api';
const initialState = {};

// Add middleware from extensions here. TODO: this should be be unified somewhere.
const loadMiddlewarePackages = [];
const store = configureStore( initialState, loadMiddlewarePackages );

const init = async ( store ) =>
{
    console.log( 'Init of bg process.' );
    // ipc();
    //
    // setupWebApis happening via store listeners now... thats it.
    // setupWebAPIs();

    //TODO: Curerently this is duplicated in BG and netowrk....
    try
    {
        // setup auth
        authAPI.ffi.ffiLoader.loadLibrary();

        // dont do this inside if auth ffi as circular dep
        if ( isRunningProduction )
        {
            await initAnon( store );
        }
        else
        {
            await initMock( store );
        }
    }
    catch ( e )
    {
        console.log( 'Problems initing SAFE extension' );
        console.log( e.message );
        console.log( e );
    }

    // TODO: Reenable this.
    // store.subscribe( async () =>
    // {
    //     handleMainStoreChanges( store );
    // } );
};

init();

let cachedRemoteCallArray = [];
let pendingCallIds = {};

const manageAuthAPICalls = async (store) =>
{
    // console.log('managing calls', theAPI)
    const state = store.getState();
    const remoteCalls = state.remoteCalls;

    // const callbackForListeners = ipcRenderer.send()

    // console.log( ':::::::::::::::::::::::::ssss::::::::::::', theAPI );
    // handling the listener setupss....
    theAPI.setNetworkListener( ( stuff ) =>
    {
        console.log('network listener happening', stuff )
        // authenticator.setListener(CONSTANTS.LISTENER_TYPES.NW_STATE_CHANGE, cb);
    })
    //
    theAPI.setAppListUpdateListener( ( stuff ) =>
    {

        console.log('network listener happening', stuff )
        // authenticator.setListener(CONSTANTS.LISTENER_TYPES.APP_LIST_UPDATE, cb);
    })


    if( cachedRemoteCallArray !== remoteCalls )
    {

        // console.log('NOT THE SAMEEEE', remoteCalls )
        cachedRemoteCallArray = remoteCalls;

        if( !remoteCalls.length )
        {
            return
        }

        //DO THE THINGS IN THIS PROCESS
        remoteCalls.forEach( async ( theCall ) =>
        {
            // console.log( 'calllllllll',theCall)
            if( !theCall.inProgress && !pendingCallIds[ theCall.id ] )
            {
                const thePendingCallPosition = pendingCallIds.length;

                //hack to prevent multi store triggering.
                //not needed for auth via redux.
                pendingCallIds[theCall.id] = 'pending';
                console.log('WE GOT A CALL', theCall, !theCall.done , !theCall.inProgress, !theCall.done && !theCall.inProgress);

                if( theAPI[ theCall.name ] )
                {
                    // we should have actual auth reducer...
                    // though that doesnt help w/o changing app...
                    store.dispatch( remoteCallActions.updateRemoteCall({ ...theCall, inProgress: true }) );
                    const theArgs = theCall.args;

                    try
                    {
                        console.log('calllinnggggg', theAPI[ theCall.name ], `with the args`, theArgs)
                        //call the API.
                        let argsForCalling = theArgs || [];
                        let response = theAPI[ theCall.name ]( ...argsForCalling );
                        console.log('DONE===============', response);
                        store.dispatch( remoteCallActions.updateRemoteCall({ ...theCall, done: true, response }) );

                        // this is kinda racy
                        delete pendingCallIds[ theCall.id ];
                    }
                    catch( e )
                    {
                        //TODO: haandle the error properly.
                        store.dispatch( remoteCallActions.updateRemoteCall({ ...theCall, error: e.message}) );
                        console.log('ERRORRRRR===============', e)
                    }

                }
                else{
                    console.log( theCall.name, ' does not exist')
                }
            }
        })
        // if completed? remove... ? if updated with 'done', remove?
    }
}



store.subscribe( async () =>
{
    // console.log('store subbbed', theAPI)
    manageAuthAPICalls( store );
    handlePeruseStoreChanges( store );
} );

window.onerror = function(error, url, line) {
    logger.error('errorInWindow', error);
};
