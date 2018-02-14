// @flow
import { TYPES } from 'actions/peruse_actions';
import initialAppState from './initialAppState';
import logger from 'logger';

import { SAFE, CONFIG } from 'appConstants';

const initialState = initialAppState.peruseApp;

export default function peruseApp( state = initialState, action )
{
    if ( action.error )
    {
        logger.error( 'Error in initializer reducer: ', action, action.error );
        return state;
    }

    const payload = action.payload;

    switch ( action.type )
    {
        case TYPES.SET_INITIALIZER_TASK:
        {
            const oldTasks = state.tasks;
            const tasks = [ ...oldTasks ];
            tasks.push( payload );
            return { ...state, tasks };
        }
        case TYPES.SET_AUTH_APP_STATUS:
        {
            return {
                ...state,
                appStatus     : payload,
            };
        }
        case TYPES.AUTHORISED_APP:
        {
            return { ...state,
                app           : { ...state.app, ...payload },
                appStatus     : SAFE.APP_STATUS.AUTHORISED,
                networkStatus : CONFIG.NET_STATUS_CONNECTED
            };
        }
        case TYPES.SAFE_NETWORK_STATUS_CHANGED:
        {
            return { ...state, networkStatus: payload };
        }
        case TYPES.SET_READ_CONFIG_STATUS:
        {
            return { ...state,
                readStatus : payload,
            };
        }
        case TYPES.RECEIVED_AUTH_RESPONSE:
        {
            return { ...state,
                authResponseUri : payload,
            };
        }
        case TYPES.SET_SAVE_CONFIG_STATUS:
        {
            return { ...state,
                saveStatus : payload,
            };
        }

        default:
            return state;
    }
};
