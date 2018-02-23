// @flow
import { createActions }from 'redux-actions';
import initialAppState from './initialAppState';

import { TYPES } from 'actions/authenticator_actions';

const initialState = initialAppState.authenticator;

export default function ui( state: array = initialState, action )
{
    const payload = action.payload;

    switch ( action.type )
    {
        case TYPES.SET_AUTH_LIB_STATUS :
        {
            return { ...state, libStatus : payload };
        }
        case TYPES.SET_AUTH_HANDLE :
        {
            return { ...state, authenticatorHandle : payload };
        }
        case TYPES.SET_AUTH_NETWORK_STATUS :
        {
            return { ...state, networkState : payload };
        }

        default:
            return state;
    }
}
