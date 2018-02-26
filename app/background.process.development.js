/* eslint global-require: 1, flowtype-errors/show-errors: 0 */

import logger from 'logger';
import { configureStore } from 'store/configureStore';
// import { init } from  'extensions/safe/init-safe-background-processes';
// TODO This handling needs to be imported via extension apis more seemlessly
import handlePeruseStoreChanges from './peruseSafeApp';

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
    logger.info( 'Init of bg process.' );
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
        logger.info( 'Problems initing SAFE extension' );
        logger.info( e.message );
        logger.info( e );
    }

    // TODO: Reenable this.
    // store.subscribe( async () =>
    // {
    //     handleMainStoreChanges( store );
    // } );
};

init();

store.subscribe( async () =>
{
    handlePeruseStoreChanges( store );
} );

window.onerror = function(error, url, line) {
    logger.error('errorInWindow', error);
};
