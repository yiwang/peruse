/* eslint global-require: 1, flowtype-errors/show-errors: 0 */

import logger from 'logger';
import { configureStore } from 'store/configureStore';

// TODO This handling needs to be imported via extension apis more seemlessly
import handlePeruseStoreChanges from './peruseSafeApp';
import * as authActions from 'actions/authenticator_actions';
import * as remoteCallActions from 'actions/remoteCall_actions';

// TODO: Dont use client when the same. Offer up original where worded differently
// aim to deprecate client file.
import * as theAPI from 'extensions/safe/auth-api/authFuncs';

import { isRunningProduction, SAFE } from 'appConstants';


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

    // TODO: Curerently this is duplicated in BG and netowrk....
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


    // Lets check the auth lib status:
    const authLibStatus = theAPI.getLibStatus();
    logger.verbose( 'Authenticator lib status: ', authLibStatus );
    store.dispatch( authActions.setAuthLibStatus( authLibStatus ) );
};

init( store );

let cachedRemoteCallArray = [];
const pendingCallIds = {};

const getStore = () => store;

const manageAuthAPICalls = async ( store ) =>
{
    const state = store.getState();
    const remoteCalls = state.remoteCalls;
    if ( cachedRemoteCallArray !== remoteCalls )
    {
        cachedRemoteCallArray = remoteCalls;

        if ( !remoteCalls.length )
        {
            return;
        }

        remoteCalls.forEach( async ( theCall ) =>
        {
            if ( !theCall.inProgress && !pendingCallIds[theCall.id] )
            {
                const thePendingCallPosition = pendingCallIds.length;

                // hack to prevent multi store triggering.
                // not needed for auth via redux.
                pendingCallIds[theCall.id] = 'pending';

                if ( theAPI[theCall.name] )
                {
                    // we should have actual auth reducer...
                    store.dispatch( remoteCallActions.updateRemoteCall( { ...theCall, inProgress: true } ) );
                    const theArgs = theCall.args;

                    // IF LISTENER
                    if ( theCall.isListener )
                    {
                        // register listener with auth
                        theAPI[theCall.name]( ( error, ...args ) =>
                        {
                            if ( theCall.name === 'setNetworkListener' )
                            {
                                store.dispatch( authActions.setAuthNetworkStatus( ...args ) );

                                const authenticatorHandle = theAPI.getAuthenticatorHandle();
                                store.dispatch( authActions.setAuthHandle( authenticatorHandle ) );
                            }
                            store.dispatch( remoteCallActions.updateRemoteCall( { ...theCall, done: true, response: args } ) );
                        } );

                        return;
                    }

                    try
                    {
                        // call the API.
                        const argsForCalling = theArgs || [];
                        const response = await theAPI[theCall.name]( ...argsForCalling );
                        store.dispatch( remoteCallActions.updateRemoteCall( { ...theCall, done: true, response } ) );
                    }
                    catch ( e )
                    {
                        store.dispatch( remoteCallActions.updateRemoteCall( { ...theCall, error: e.message || e } ) );
                    }
                }
                else
                {
                    console.log( theCall.name, ' does not exist' );
                }
            }
        } );
    }
};


store.subscribe( async () =>
{
    manageAuthAPICalls( store );
    handlePeruseStoreChanges( store );
} );

window.onerror = function ( error, url, line )
{
    logger.error( 'errorInWindow', error );
};
