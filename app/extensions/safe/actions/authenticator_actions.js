import { createActions } from 'redux-actions';

// export const TYPES = {
//     SET_AUTH_ERROR : 'SET_AUTH_ERROR',
//     CLEAR_AUTH_ERROR : 'CLEAR_AUTH_ERROR',
//     SET_CREATE_ACC_NAV_POS : 'SET_CREATE_ACC_NAV_POS',
//     RESET_CREATE_ACC_NAV_POS : 'RESET_CREATE_ACC_NAV_POS',
//     SET_SECRET_STRENGTH : 'SET_SECRET_STRENGTH',
//     SET_PASSWORD_STRENGTH : 'SET_PASSWORD_STRENGTH',
//     SET_ACC_SECRET : 'SET_ACC_SECRET',
//     CLEAR_ACC_SECRET : 'CLEAR_ACC_SECRET',
//     SET_ACC_PASSWORD : 'SET_ACC_PASSWORD',
//     CLEAR_ACC_PASSWORD : 'CLEAR_ACC_PASSWORD',
//     SET_INVITE_CODE : 'SET_INVITE_CODE',
//     CLEAR_INVITE_CODE : 'CLEAR_INVITE_CODE',
//     SET_AUTH_LOADER : 'SET_AUTH_LOADER',
//     CLEAR_AUTH_LOADER : 'CLEAR_AUTH_LOADER',
//     CREATE_ACC : 'CREATE_ACC',
//     TOGGLE_INVITE_POPUP : 'TOGGLE_INVITE_POPUP',
//     LOGIN : 'LOGIN',
//     LOGOUT : 'LOGOUT',
//     SHOW_LIB_ERR_POPUP : 'SHOW_LIB_ERR_POPUP'
// };
//
// export const {
//     addNotification,
//     addLocalNotification,
//     clearNotification
// } = createActions( {
//     [TYPES.ADD_NOTIFICATION]       : payload => ( { ...payload } ),
//     [TYPES.ADD_LOCAL_NOTIFICATION] : [
//         payload => ( { ...payload } ),
//         meta => (
//             {
//                 scope : 'local'
//             } )
//     ],
//     [TYPES.CLEAR_NOTIFICATION] : payload => ( {} )
// } );
//
//
//
