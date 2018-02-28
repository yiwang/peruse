import { createActions } from 'redux-actions';

export const TYPES = {
    SET_AUTH_LIB_STATUS     : 'SET_AUTH_LIB_STATUS',
    SET_AUTH_NETWORK_STATUS : 'SET_AUTH_NETWORK_STATUS',
    // ADD_LOCAL_NOTIFICATION : 'ADD_LOCAL_NOTIFICATION',
    // CLEAR_NOTIFICATION     : 'CLEAR_NOTIFICATION'
};

export const {
    setAuthLibStatus,
    setAuthNetworkStatus,
    // addLocalNotification,
    // clearNotification
} = createActions( {
    [TYPES.SET_AUTH_NETWORK_STATUS] : payload => payload,
    [TYPES.SET_AUTH_LIB_STATUS]     : payload => payload,
    // [TYPES.ADD_LOCAL_NOTIFICATION] : [
    //     payload => ( { ...payload } ),
    //     meta => (
    //         {
    //             scope : 'local'
    //         } )
    // ],
    // [TYPES.CLEAR_NOTIFICATION] : payload => ( {} )
} );
