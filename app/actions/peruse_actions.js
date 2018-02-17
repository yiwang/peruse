import { createActions } from 'redux-actions';

export const TYPES = {
    SET_AUTH_APP_STATUS    : 'SET_AUTH_APP_STATUS',
    SET_READ_CONFIG_STATUS     : 'SET_READ_CONFIG_STATUS',
    SET_SAVE_CONFIG_STATUS : 'SET_SAVE_CONFIG_STATUS',
    AUTHORISED_APP         : 'AUTHORISED_APP',

    //read status from network
    RECEIVED_CONFIG : 'RECEIVED_CONFIG',
    RECEIVED_AUTH_RESPONSE : 'RECEIVED_AUTH_RESPONSE',

    SET_INITIALIZER_TASK        : 'SET_INITIALIZER_TASK',
    STORE_NEW_ACCOUNT           : 'STORE_NEW_ACCOUNT',
    RECONNECT_SAFE_APP          : 'RECONNECT_SAFE_APP',
    PERUSE_APP_STATUS_CHANGED : 'PERUSE_APP_STATUS_CHANGED',

    RESET_STORE : 'RESET_STORE'
};

export const {
    setAuthAppStatus,
    setReadConfigStatus,
    setSaveConfigStatus,
    authorisedApp,

    receivedConfig,
    receivedAuthResponse,

    setInitializerTask,
    storeNewAccount,
    peruseAppStatusChanged,
    reconnectSafeApp,

    resetStore
} = createActions(
    TYPES.SET_AUTH_APP_STATUS,
    TYPES.SET_READ_CONFIG_STATUS,
    TYPES.SET_SAVE_CONFIG_STATUS,
    TYPES.AUTHORISED_APP,

    TYPES.RECEIVED_CONFIG,
    TYPES.RECEIVED_AUTH_RESPONSE,

    TYPES.SET_INITIALIZER_TASK,
    TYPES.STORE_NEW_ACCOUNT,
    TYPES.PERUSE_APP_STATUS_CHANGED,
    TYPES.RECONNECT_SAFE_APP,

    TYPES.RESET_STORE
);
