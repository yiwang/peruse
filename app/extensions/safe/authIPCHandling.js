import { ipcMain } from 'electron';
import logger from 'logger';
import * as notificationActions from 'actions/notification_actions';
import { inRendererProcess } from 'appConstants';
let isSafeAppAuthenticating = false;
let safeAuthNetworkState = -1;
const safeAuthData = null;


export const CLIENT_TYPES = {
    DESKTOP : 'DESKTOP',
    WEB     : 'WEB'
};

export const REQ_TYPES = {
    AUTH      : 'AUTH',
    CONTAINER : 'CONTAINER',
    MDATA     : 'MDATA'
};


export const handleSafeAuthAuthentication = ( req, type ) =>
{
    // ipcMain.send( 'decryptRequest', req, type || CLIENT_TYPES.DESKTOP );
};


function authDecision( isAllowed, data, reqType )
{
    isSafeAppAuthenticating = true;

    if ( reqType === REQ_TYPES.AUTH )
    {
        // return ipcMain.send( 'registerAuthDecision', data, isAllowed );
    }
    else if ( reqType === REQ_TYPES.CONTAINER )
    {
        // return ipcMain.send( 'registerContainerDecision', data, isAllowed );
    }
    // ipcMain.send( 'registerSharedMDataDecision', data, isAllowed );
}

const addAuthNotification = ( data, app, addNotification, clearNotification, ignoreRequest ) =>
{
    let text = `${app.name} Requests Auth Permission`;
    let reqType = REQ_TYPES.AUTH;

    if ( data.contReq )
    {
        text = `${app.name} Requests Container Access`;
        reqType = REQ_TYPES.CONTAINER;
    }

    if ( data.mDataReq )
    {
        text = `${app.name} Requests mData Access`;
        reqType = REQ_TYPES.MDATA;
    }

    const success = () =>
    {
        authDecision( true, data, reqType );
        clearNotification();
    };

    const denial = () =>
    {
        authDecision( false, data, reqType );
        clearNotification();
    };

    addNotification( { text, onAccept: success, onDeny: denial, onDimiss: ignoreRequest } );
};

/**
 * binds listeners for authenticsator handling and triggers addition of Notifications for each
 * @param  {[type]} addNotification   [description]
 * @param  {[type]} clearNotification [description]
 * @return {[type]}                   [description]
 */
const setupAuthHandling = ( store ) =>
{
    logger.verbose('setting up handling of auth in render?:', inRendererProcess)
    const  addNotification = payload => store.dispatch( notificationActions.addNotification( payload ) )
    const  clearNotification = () => store.dispatch( notificationActions.clearNotification( ) )
    // clearNotification
    const ignoreRequest = ( data ) =>
    {
        logger.info('replace these ipcMain.send calls')
        // ipcMain.send( 'skipAuthRequest', true );
        clearNotification();
    };

    // safe app plugin
    // ipcMain.send( 'registerSafeApp' );

    ipcMain.on( 'webClientAuthReq', ( event, req ) =>
    {
        logger.info( 'on.....webClientAuthReq' );
        handleSafeAuthAuthentication( req, CLIENT_TYPES.WEB );
    } );


    // safe authenticator plugin
    // ipcMain.send( 'registerSafeNetworkListener' );
    // ipcMain.send( 'registerOnAuthReq' );
    // ipcMain.send( 'registerOnContainerReq' );
    // ipcMain.send( 'registerOnSharedMDataReq' );
    // ipcMain.send( 'registerOnReqError' );

    ipcMain.on( 'onNetworkStatus', ( event, status ) =>
    {
        logger.info( 'on.....onNetworkStatus' );
        safeAuthNetworkState = status;
        logger.info( 'Network state changed to: ', safeAuthNetworkState );

        if ( status === -1 )
        {
            // hideSafeAuthPopup();
            // startSafeConnectionCountdown();
        }
        // else
        // {
        //     const safeConnectionIntervalId = getSafeConnectionIntervalId();
        //     clearInterval( safeConnectionIntervalId );
        // }
    } );

    ipcMain.on( 'onAuthReq', ( event, data ) =>
    {
        logger.verbose( 'onAuthReq triggered' );
        const app = data.authReq.app;

        addAuthNotification( data, app, addNotification, clearNotification, ignoreRequest );
    } );

    ipcMain.on( 'onContainerReq', ( event, data ) =>
    {
        logger.verbose( 'onContainerReq triggered' );
        if ( data )
        {
            const app = data.contReq.app;
            addAuthNotification( data, app, addNotification, clearNotification, ignoreRequest );
        }
    } );

    ipcMain.on( 'onSharedMDataReq', ( event, data ) =>
    {
        logger.verbose( 'onSharedMDataReq triggered' );

        if ( data )
        {
            const app = data.mDataReq.app;

            addAuthNotification( data, app, addNotification, clearNotification, ignoreRequest );
        }
    } );

    ipcMain.on( 'onAuthDecisionRes', ( event, res ) =>
    {
        logger.info( 'on.....onAuthDecisionRes', res );

        // const browserAuthReqUri = remote.getGlobal( 'browserAuthReqUri' );
        // const peruseRequestUri = remote.getGlobal( 'peruseRequestUri' );

        // if( res.uri === browserAuthReqUri || res.uri === peruseRequestUri )
        // {
        //     // ipcMain.send('browserAuthenticated', res.res, res.uri === browserAuthReqUri )
        // }

        isSafeAppAuthenticating = false;
        if ( res.type === CLIENT_TYPES.WEB )
        {
            event.sender.send( 'webClientAuthRes', res );
        }
    } );

    ipcMain.on( 'onContDecisionRes', ( event, res ) =>
    {
        logger.info( 'on.....onContDecisionRes', res );
        isSafeAppAuthenticating = false;
        if ( res.type === CLIENT_TYPES.WEB )
        {
            event.sender.send( 'webClientContainerRes', res );
        }
    } );

    ipcMain.on( 'onUnAuthDecisionRes', ( event, res ) =>
    {
        logger.info( 'on.....onUnAuthDecisionRes', res );
        if ( res.type === CLIENT_TYPES.WEB )
        {
            event.sender.send( 'webClientAuthRes', res );
        }
    } );

    ipcMain.on( 'onSharedMDataRes', ( event, res ) =>
    {
        logger.info( 'on.....onSharedMDataRes', res );
        isSafeAppAuthenticating = false;
        if ( res.type === CLIENT_TYPES.WEB )
        {
            event.sender.send( 'webClientSharedMDataRes', res );
        }
    } );

    ipcMain.on( 'onAuthResError', ( event, res ) =>
    {
        logger.info( 'on.....onAuthResError', res );
        isSafeAppAuthenticating = false;
        if ( res && res.error && ( res.error.toLowerCase() === 'unauthorised' ) )
        {
            // onClickOpenSafeAuthHome();
        }
        if ( res.type === CLIENT_TYPES.WEB )
        {
            event.sender.send( 'webClientErrorRes', res );
        }
    } );

    ipcMain.on( 'onUnAuthResError', ( event, res ) =>
    {
        logger.info( 'on.....onUnAuthResError' );
        if ( res.type === CLIENT_TYPES.WEB )
        {
            event.sender.send( 'webClientErrorRes', res );
        }
    } );
};


export default setupAuthHandling;
