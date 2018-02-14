/* eslint global-require: 1, flowtype-errors/show-errors: 0 */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
// import { remote } from 'electron';
import logger from 'logger';
// import { isRunningUnpacked, isRunningPackaged, PROTOCOLS } from 'appConstants';
// import { parse as parseURL } from 'url';
// import pkg from 'appPackage';

import * as authAPI from 'extensions/safe/auth-api';
import ipc from 'extensions/safe/ffi/ipc';

import { configureStore } from 'store/configureStore';
import { initAnon, initMock } from 'extensions/safe/network';

// TODO This handling needs to be imported via extension apis more seemlessly
// import handleStoreChanges from 'extensions/safe/background-work/handleStoreChanges';

// const { Menu, Tray } = remote;
// const app = remote.require('app');
const initialState = {};

// Add middleware from extensions here.
const loadMiddlewarePackages = [];
const store = configureStore( initialState, loadMiddlewarePackages );


// const init = async () =>
// {
//     logger.info('initttttttttttttttttttttttttt')
//
//     try
//     {
//         // setup auth
//         authAPI.ffi.ffiLoader.loadLibrary();
//
//         // dont do this inside if auth ffi as circular dep
//         ipc();
//
//         if ( isRunningProduction )
//         {
//             await initAnon( store );
//         }
//         else
//         {
//             await initMock( store );
//         }
//     }
//     catch ( e )
//     {
//         logger.info( 'Problems initing SAFE extension' );
//         logger.info( e.message );
//         logger.info( e );
//     }
// }

store.subscribe( async () =>
{
    logger.info('STORE UPDATED IN BG PROCESSSSS')
    // logger.info('STORE UPDATED IN BG PROCESSSSS', handleStoreChanges)
    // handleStoreChanges( store );
} );

// init();
logger.info('xxxxxxxxxxxxxxxxxxxxxxxxxxBG PROCESSSS PAGGE LOADEDED', store.getState());


// let tray = null;
