
export const manifest = {
  setNetworkListener: 'async',
  setAppListUpdateListener: 'async',
  getNetworkState: 'sync',
  getAuthenticatorHandle: 'sync',
  setReAuthoriseState: 'sync',
  getLibStatus: 'sync',
  logout: 'sync',
  login: 'promise',
  createAccount: 'promise',
  getAuthorisedApps: 'promise',
  getAccountInfo: 'promise',
  revokeApp: 'promise',
  reconnect: 'promise'
};
