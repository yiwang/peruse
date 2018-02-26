import logger from 'logger';
import { isRunningProduction, SAFE } from 'appConstants';
// import ipc from './ffi/ipc';

import { initAnon, initMock } from './network';

import * as authAPI from './auth-api';
// import { setupWebAPIs } from './safeWebAPIs';

// import handleMainStoreChanges from './network/handleStoreChanges';


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

// const middleware = store => next => action =>
// {
//     logger.info( 'ACTION:paylos', action.payload.url );
//
//     if ( action.type === tabsActions.TYPES.ADD_TAB && action.payload.url && action.payload.url.startsWith( 'http' ) )
//     {
//         let newAction = { ...action, type: 'cancelled' }
//         return 'boop';
//     }
//
//     // return next( action );
// };
//


export default {
    init,
    // setupRoutes,
    // middleware
};
