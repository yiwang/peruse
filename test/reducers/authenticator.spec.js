/* eslint-disable func-names */
import authenticator from 'reducers/authenticator';
import { TYPES } from 'actions/authenticator_actions';
import initialState from 'reducers/initialAppState';

describe( 'authenticator reducer', () =>
{
    it( 'should return the initial state', () =>
    {
        expect( authenticator( undefined, {} ) ).toEqual( initialState.authenticator );
    } );

    describe( 'SET_AUTH_NETWORK_STATUS', () =>
    {
        it( 'should handle setting authenticator netork state', () =>
        {
            const state = 0;
            expect(
                authenticator( {}, {
                    type    : TYPES.SET_AUTH_NETWORK_STATUS,
                    payload: state
                } )
            ).toMatchObject( { networkState: state } );
        } );
    })
    describe( 'SET_AUTH_LIB_STATUS', () =>
    {
        const state = false;

        it( 'should handle setting auth lib status', () =>
        {
            expect(
                authenticator( {}, {
                    type    : TYPES.SET_AUTH_LIB_STATUS,
                    payload: state
                } )
            ).toMatchObject( { libStatus: state } );
        } );
    })

    describe( 'SET_AUTH_HANDLE', () =>
    {
        it( 'should handle blurring address bar focus', () =>
        {
            const handle = '111111';
            expect(
                authenticator( {}, {
                    type    : TYPES.SET_AUTH_HANDLE,
                    payload: handle
                } )
            ).toMatchObject( { authenticatorHandle: handle } );
        } );
    })

})
