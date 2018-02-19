/* eslint-disable func-names */
import peruseApp from 'reducers/peruseApp';
import { TYPES } from 'actions/peruse_actions';
import initialState from 'reducers/initialAppState';
import { SAFE, CONFIG } from 'appConstants';

const safeInitialState = initialState.peruseApp;

describe( 'Peruse App reducer', () =>
{
    it( 'should return the initial state', () =>
    {
        expect( peruseApp( undefined, {} ) ).toEqual( initialState.peruseApp );
    } );

    describe( 'SET_INITIALIZER_TASK', () =>
    {
        it( 'should handle setting a task', () =>
        {
            const payload =  'well hi';

            expect(
                peruseApp( safeInitialState, {
                    type    : TYPES.SET_INITIALIZER_TASK,
                    payload
                } ).tasks
            ).toEqual( [ payload ] );
        } );
    });

    describe( 'SET_AUTH_APP_STATUS', () =>
    {
        it( 'should handle app authorisation', () =>
        {
            const payload =   SAFE.APP_STATUS.AUTHORISING;

            expect(
                peruseApp( safeInitialState, {
                    type    : TYPES.SET_AUTH_APP_STATUS,
                    payload
                } )
            ).toMatchObject( {
                appStatus     : SAFE.APP_STATUS.AUTHORISING,
            });
        } );
    });


    describe( 'AUTHORISED_APP', () =>
    {
        it( 'should handle app authorisation', () =>
        {
            const payload =  { fakeApp: 'yesIam' };

            expect(
                peruseApp( safeInitialState, {
                    type    : TYPES.AUTHORISED_APP,
                    payload
                } )
            ).toMatchObject( {
                app           : { ...payload },
                appStatus     : SAFE.APP_STATUS.AUTHORISED,
                networkStatus : CONFIG.NET_STATUS_CONNECTED
            });
        } );
    });

    describe( 'SET_SAVE_CONFIG_STATUS', () =>
    {
        it( 'should handle saving browser', () =>
        {
            const payload =  SAFE.SAVE_STATUS.TO_SAVE;

            expect(
                peruseApp( safeInitialState, {
                    type    : TYPES.SET_SAVE_CONFIG_STATUS,
                    payload
                } )
            ).toMatchObject( { saveStatus : SAFE.SAVE_STATUS.TO_SAVE } );
        } );
    });


    describe( 'RECEIVED_AUTH_RESPONSE', () =>
    {
        it( 'should handle saving browser', () =>
        {
            const payload =  'URLofAUTHResponse';

            expect(
                peruseApp( safeInitialState, {
                    type    : TYPES.RECEIVED_AUTH_RESPONSE,
                    payload
                } )
            ).toMatchObject( { authResponseUri : payload } );
        } );
    });

    describe( 'SAFE_NETWORK_STATUS_CHANGED', () =>
    {
        it( 'should handle a change in network state', () =>
        {
            const payload =  'testing';

            expect(
                peruseApp( safeInitialState, {
                    type    : TYPES.SAFE_NETWORK_STATUS_CHANGED,
                    payload
                } ).networkStatus
            ).toEqual( payload );
        } );
    })


})