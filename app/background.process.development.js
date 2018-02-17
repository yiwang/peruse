/* eslint global-require: 1, flowtype-errors/show-errors: 0 */

import logger from 'logger';

// import * as authAPI from 'extensions/safe/auth-api';
// import ipc from 'extensions/safe/ffi/ipc';

import { configureStore } from 'store/configureStore';

// TODO This handling needs to be imported via extension apis more seemlessly
import handlePeruseStoreChanges from './peruseSafeApp';

const initialState = {};

// Add middleware from extensions here. TODO: this should be be unified somewhere.
const loadMiddlewarePackages = [];
const store = configureStore( initialState, loadMiddlewarePackages );


store.subscribe( async () =>
{
    handlePeruseStoreChanges( store );
} );
