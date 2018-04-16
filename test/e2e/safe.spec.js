import opn from 'opn';
import { parse as urlParse } from 'url';
import {removeTrailingSlash} from 'utils/urlHelpers';
import {
    navigateTo,
    newTab,
    setClientToMainBrowserWindow,
    setClientToBackgroundProcessWindow,
    delay
} from './lib/browser-driver';
import { createSafeApp, createRandomDomain } from './lib/safe-helpers';
import { BROWSER_UI, AUTH_UI, WAIT_FOR_EXIST_TIMEOUT } from './lib/constants';
import setupSpectronApp from './lib/setupSpectronApp';
import {
    CONFIG,
    isRunningSpectronTestingPackagedApp,
    isCI,
    travisOS
} from 'appConstants';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000;
jest.unmock( 'electron' );

describe( 'SAFE network webFetch operation', async () =>
{
    let safeApp;
    const app = setupSpectronApp( ['--debug'], isRunningSpectronTestingPackagedApp );

    const appInfo = {
        id: "net.peruse.test",
        name: 'SAFE App Test',
        vendor: 'Peruse'
    };


    beforeAll( async () =>
    {
        await app.start();
        await setClientToMainBrowserWindow( app );
        await app.client.waitUntilWindowLoaded();
    } );

    afterAll( () =>
    {
        if ( app && app.isRunning() )
        {
            return app.stop();
        }
    } );

    test( 'window loaded', async () =>
    {
        let loaded = await app.browserWindow.isVisible() ;
        await delay(3500)
        return loaded;
    })

    // console.log('DEBUG:::: (do the libs exist?)', CONFIG );
    it( 'populates the DOM api in the tab window:', async( ) =>
    {
        expect.assertions(5);
        await setClientToMainBrowserWindow( app );

        const { client } = app;
        const tabIndex = await newTab( app );

        await navigateTo( app, 'safeAPI.com' );
        await delay( 2500 );

        const windows = await client.getWindowCount()

        // TODO: Why -1 here? when others not... ? Something is hanging around...
        await client.windowByIndex( tabIndex - 1 );
        await client.pause( 2500 );

        let theSafeClient = await client.execute( function (){ return window.safe } );
        theSafeClient = theSafeClient.value;
        await delay( 2500 );
        // await client.pause(1500)


        expect( theSafeClient ).toHaveProperty('CONSTANTS');
        expect( theSafeClient ).toHaveProperty('VERSION');
        expect( theSafeClient ).toHaveProperty('authorise');
        expect( theSafeClient ).toHaveProperty('initializeApp');
        expect( theSafeClient ).toHaveProperty('fromAuthURI');
    })


    it( 'has safe:// protocol', async () =>
    {
        expect.assertions( 2 );

        await setClientToMainBrowserWindow( app );
        const { client } = await app;
        const tabIndex = await newTab( app );
        await delay(500)
        await client.waitForExist( BROWSER_UI.ADDRESS_INPUT );

        await navigateTo( app, 'test-url.com' );

        const address = await client.getValue( BROWSER_UI.ADDRESS_INPUT );

        await client.windowByIndex( tabIndex - 1 );
        await delay(500)
        const clientUrl = await client.getUrl();
        const parsedUrl = urlParse( clientUrl );

        expect( address ).toBe( 'safe://test-url.com' );
        expect( parsedUrl.protocol ).toBe( 'safe:' );
    } );

    if( !isRunningSpectronTestingPackagedApp )
    {

        it( 'fetches content from network', async () =>
        {
            safeApp = await createSafeApp(appInfo);

            await safeApp.auth.loginForTest();

            expect.assertions(4);
            const content = `hello world, on ${Math.round(Math.random() * 100000)}`;
        	const domain = await createRandomDomain(content, '', '', safeApp);
        	const data = await safeApp.webFetch(`safe://${domain}`);

        	expect(data.body.toString()).toBe( content );

            const { client } = app;
            const tabIndex = await newTab( app );
            await navigateTo( app, `safe://${domain}` );
            await delay(3500)

            await client.waitForExist( BROWSER_UI.ADDRESS_INPUT );

            await client.windowByIndex( tabIndex );
            await client.pause(3500);

            let text = await client.getText( 'body' );
            expect( text ).not.toBeNull( );
            expect( text ).toBe( content );
            expect( text.length ).toBe( content.length );
        } );
    }


    if( isRunningSpectronTestingPackagedApp )
    {
        console.log('testing prod')

        it( 'fetches live content from network', async () =>
        {
            expect.assertions(4);
            const domain = 'some.tester';

            const { client } = app;
            const tabIndex = await newTab( app );
            await navigateTo( app, `safe://${domain}` );
            await delay(3500)

            await client.waitForExist( BROWSER_UI.ADDRESS_INPUT );

            await client.windowByIndex( tabIndex );
            await client.pause(3500);

            let text = await client.getText( 'body' );
            expect( text ).not.toBeNull( );
            expect( text ).not.toBe( 'Requested public name is not found' );
            expect( text.length ).toBe( content.length );
        } );
    }


    if( travisOS !== 'linux' )
    {

        it( 'is registered to handle safe:// requests:', async( ) =>
        {
            opn('safe://blabla');

            setClientToMainBrowserWindow(app);
            const { client } = app;
            await delay(1500)

            await client.waitForExist( BROWSER_UI.ADDRESS_INPUT );
            const address = await client.getValue( BROWSER_UI.ADDRESS_INPUT );

            expect( address ).toBe('safe://blabla');
        })
    }


} );
