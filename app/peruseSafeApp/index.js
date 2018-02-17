import { shell } from 'electron';
import {
    saveConfigToSafe,
    readConfigFromSafe
} from './manageBrowserConfig';
import { initializeApp, fromAuthURI } from '@maidsafe/safe-node-app';
// import { handleSafeAuthUrlReception } from 'extensions/safe/network';
import { APP_INFO, CONFIG, SAFE, PROTOCOLS } from 'appConstants';
//
// import { requestAuth, clearAppObj } from 'extensions/safe/network';
import * as safeActions from 'actions/peruse_actions';
import * as notificationActions from 'actions/notification_actions';
import logger from 'logger';
// import { openExternal } from 'extensions/safe/ffi/ipc';
const authingStates = [
    SAFE.APP_STATUS.TO_AUTH,
    SAFE.APP_STATUS.AUTHORISING,
    SAFE.APP_STATUS.AUTHORISATION_FAILED,
    SAFE.APP_STATUS.AUTHORISATION_DENIED
];

let appObj;
/**
 * Setup actions to be triggered in response to store state changes.
 * @param  { ReduxStore } store [description]
 */
const handlePeruseStoreChanges = ( store ) =>
{
    manageSaveStateActions( store );
    manageReadStateActions( store );
    manageAuthorisationActions( store );
}

// NEEDED???
export const parseUrl = url => (
  (url.indexOf('safe-auth://') === -1) ? url.replace('safe-auth:', 'safe-auth://') : url
);

const authPeruseApp = async () =>
{
    try
    {
        appObj = await initializeApp( APP_INFO.info, null, { libPath: CONFIG.LIB_PATH } );

        const authReq = await appObj.auth.genAuthUri( APP_INFO.permissions, APP_INFO.opts );

        global.browserAuthReqUri = authReq.uri;
        logger.info('TRYING TO AUTH EPRUSEEEEE', authReq.uri)

        //here send to authenticator in main process for now.
        // handleSafeAuthUrlReception( authReq.uri );
        // shell.openExternal( authReq.uri );
        await appObj.auth.openUri(parseUrl(authReq.uri));

        logger.info('AFTER THE AWAITING FOR YOUU', appObj)
        return appObj;
    }
    catch ( err )
    {
        logger.error( err );
        throw err;
    }
};

/**
 * Handle triggering actions and related functionality for Authorising on the SAFE netowrk
 * based upon the application auth state
 * @param  {Object} state Application state (from redux)
 */
const manageAuthorisationActions = async ( store ) =>
{
    const state = store.getState();

    if ( state.peruseApp.appStatus === SAFE.APP_STATUS.TO_AUTH )
    {
        logger.info('SHOULD EB AUTHINGGG')
        store.dispatch( safeActions.setAuthAppStatus( SAFE.APP_STATUS.AUTHORISING ) );
        const app = await authPeruseApp();
    }
};


const peruseAppIsConnected = ( state ) =>
{
    const peruseApp = state.peruseApp;

    if ( peruseApp.appStatus === SAFE.NETWORK_STATE.LOGGED_IN ||
        authingStates.includes( peruseApp.appStatus ) )
    {
        return true
    }
    else
    {
        return false;
    }
}

/**
 * Handle triggering actions and related functionality for saving to SAFE netowrk
 * based upon the application stateToSave
 * @param  {Object} state Application state (from redux)
 */
const manageReadStateActions = async ( store ) =>
{
    const state = store.getState();
    const peruseApp = state.peruseApp;

    if ( peruseApp.readStatus !== SAFE.READ_STATUS.TO_READ )
    {
        // do nothing
        return;
    }

    if ( peruseApp.appStatus === SAFE.APP_STATUS.AUTHORISED &&
        peruseApp.networkStatus === SAFE.NETWORK_STATE.CONNECTED )
    {
        store.dispatch( safeActions.setReadConfigStatus( SAFE.READ_STATUS.READING ) );
        readConfigFromSafe( store )
            .then( savedState =>
            {
                store.dispatch( safeActions.receivedConfig( savedState ) );
                store.dispatch(
                    safeActions.setReadConfigStatus( SAFE.READ_STATUS.READ_SUCCESSFULLY )
                );
                return null;
            } )
            .catch( e =>
            {
                logger.error( e );
                store.dispatch(
                    safeActions.setSaveConfigStatus( SAFE.SAVE_STATUS.FAILED_TO_READ )
                );
                throw new Error( e );
            } );
    }
    else if ( !peruseAppIsConnected( state ) )
    {
        store.dispatch( safeActions.setReadConfigStatus( SAFE.READ_STATUS.FAILED_TO_READ ) );
        store.dispatch( notificationActions.addNotification(
            {
                text: 'Unable to read the browser state. The network is not yet connected.',
                type: 'error'
            } ) );

    }
    // TODO: Refactor and DRY this out between save/read?
    else if ( !authingStates.includes( peruseApp.appStatus ) )
    {
        store.dispatch( safeActions.setAuthAppStatus( SAFE.APP_STATUS.TO_AUTH ) );
    }


    // TODO: Refactor this: Is it needed?
    if ( peruseApp.readStatus === SAFE.READ_STATUS.FAILED_TO_READ &&
        peruseApp.appStatus === SAFE.APP_STATUS.AUTHORISED )
    {
        store.dispatch( safeActions.setReadConfigStatus( SAFE.READ_STATUS.TO_READ ) );
    }
};



/**
 * Handle triggering actions and related functionality for saving to SAFE netowrk
 * based upon the application stateToSave
 * @param  {Object} state Application state (from redux)
 */
const manageSaveStateActions = async ( store ) =>
{
    const state = store.getState();
    const peruseApp = state.peruseApp;

    // logger.info('MANAGING SAVE STATE')
    if ( peruseApp.saveStatus !== SAFE.SAVE_STATUS.TO_SAVE )
    {
        // logger.info('NOT SET TO SAVE STATE')
        // do nothing
        return;
    }

    if ( peruseAppIsConnected( state ) && peruseApp.readStatus !== SAFE.READ_STATUS.READ_SUCCESSFULLY &&
        peruseApp.readStatus !== SAFE.READ_STATUS.READ_BUT_NONEXISTANT )
    {
        logger.info('NOT SET TO SAVE STATE')
        if ( peruseApp.readStatus !== SAFE.READ_STATUS.TO_READ &&
            peruseApp.readStatus !== SAFE.READ_STATUS.READING )
        {
            logger.verbose( 'Can\'t save, not read yet. Triggering a read.' );
            store.dispatch( safeActions.setReadConfigStatus( SAFE.READ_STATUS.TO_READ ) );
        }

        return;
    }

    if ( peruseApp.appStatus === SAFE.APP_STATUS.AUTHORISED &&
        peruseApp.networkStatus === SAFE.NETWORK_STATE.CONNECTED )
    {
        store.dispatch( safeActions.setSaveConfigStatus( SAFE.SAVE_STATUS.SAVING ) );
        saveConfigToSafe( store )
            .then( () =>
            {
                store.dispatch(
                    safeActions.setSaveConfigStatus( SAFE.SAVE_STATUS.SAVED_SUCCESSFULLY )
                );

                return null;
            } )
            .catch( e =>
            {
                logger.error( e );

                // TODO: Handle errors across the store in a separate error watcher?
                store.dispatch(
                    safeActions.setSaveConfigStatus( SAFE.SAVE_STATUS.FAILED_TO_SAVE )
                );
                throw new Error( e );
            } );
    }
    // else if ( !peruseAppIsConnected( state ) )
    // {
    //     // TODO: Here... this bit o logic needs to be general.
    //     // AND. trigger safe app auth actually.
    //     store.dispatch( safeActions.setSaveConfigStatus( SAFE.SAVE_STATUS.FAILED_TO_SAVE ) );
    //     store.dispatch( notificationActions.addNotification(
    //         {
    //             text: 'Unable to save the browser state. The network is not yet connected.',
    //             type: 'error'
    //         } ) );
    //
    // }
    else if ( !authingStates.includes( state.peruseApp.appStatus ) )
    {
        store.dispatch( safeActions.setAuthAppStatus( SAFE.APP_STATUS.TO_AUTH ) );
    }


    if ( peruseApp.saveStatus === SAFE.SAVE_STATUS.FAILED_TO_SAVE &&
        peruseApp.appStatus === SAFE.APP_STATUS.AUTHORISED )
    {
        store.dispatch( safeActions.setSaveConfigStatus( SAFE.SAVE_STATUS.TO_SAVE ) );
    }
};



export default handlePeruseStoreChanges;
