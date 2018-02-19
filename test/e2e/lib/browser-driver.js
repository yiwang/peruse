import { BROWSER_UI } from './constants';
import { parse as urlParse } from 'url';

const addressInput = ( app ) => app.client.element(BROWSER_UI.ADDRESS_INPUT);

let peruseBrowserWindowIndex;

export const setClientToMainBrowserWindow = async( app ) =>
{
    const { client, browserWindow } = app;
    // console.log('parent', await browserWindow.getParentWindow())
    // console.log('getURL', await browserWindow.getURL())
    // console.log('getNativeWindowHandle', await browserWindow.getNativeWindowHandle())
    // // console.log('getOwnerBrowserWindow', await browserWindow.getOwnerBrowserWindow())
    // console.log('visible', await browserWindow.isVisible())
    // console.log('clienwindow', await client.windowByIndex( 0 ))
    // console.log('clienwindow Count', await client.getWindowCount( ))

    const windows =  await client.getWindowCount();

    for (var i = 0; i < windows; i++) {
        // TODO: Use window title to differentiate between PeruseBrowserWindow instances?
        const theWindow = await client.windowByIndex( i );
        const url = await client.getUrl();
        const urlObj = urlParse( url );
        console.log('window', i, url)
        // get the PeruseBrowserWindow
        // TODO: If more than one...? (checkFocus)
        if( urlObj.path.endsWith('app.html') )
        {
            peruseBrowserWindowIndex = i;
            // break;
        }
    }

    console.log('peruseBrowserWindowIndex', peruseBrowserWindowIndex);
    await client.windowByIndex( peruseBrowserWindowIndex );
    // await client.waitUntilWindowLoaded();
}


export const setAddress = async( app, url ) =>
{
    const { client } = app;

    await client.pause( 800 ); // need to wait a sec for the UI to catch up
    await setClientToMainBrowserWindow( app );
    await client.waitUntilWindowLoaded()
    await client.waitForExist( BROWSER_UI.ADDRESS_INPUT );
    await client.click( BROWSER_UI.ADDRESS_INPUT );
    await client.keys( '\uE003' ); // backspace
    await client.setValue( BROWSER_UI.ADDRESS_INPUT, url );
    await client.pause( 500 ); // need to wait a sec for the UI to catch up
    await client.keys( '\uE007' ); // enter

    return

}
export const navigateTo = async ( app, url ) =>
{
    const { client, browserWindow } = app;

    // TODO set tab + then...
    await setAddress( app, url);

    return;


};

export const newTab = async ( app ) =>
{
    const { client } = app;
    const index = await client.getWindowCount();
    await setClientToMainBrowserWindow( app );
    await client.click( BROWSER_UI.ADD_TAB);

    return index;
};
