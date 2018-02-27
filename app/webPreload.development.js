// following @pfrazee's beaker pattern again here.
import setupPreloadAPIs, { setupPreloadedSafeAuthAPIs } from './setupPreloadAPIs';

import { configureStore } from 'store/configureStore';
// import { init } from  'extensions/safe/init-safe-background-processes';
// TODO This handling needs to be imported via extension apis more seemlessly
// import handlePeruseStoreChanges from './peruseSafeApp';

const initialState = {};

// Add middleware from extensions here. TODO: this should be be unified somewhere.
const loadMiddlewarePackages = [];
const store = configureStore( initialState, loadMiddlewarePackages );

// init();

// store.subscribe( async () =>
// {
//     // handlePeruseStoreChanges( store );
// } );

setupPreloadedSafeAuthAPIs( store );
setupPreloadAPIs( store );

window.onerror = function(error, url, line) {
    ipcRenderer.send('errorInWindow', error);
};
