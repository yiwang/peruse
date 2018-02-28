import * as authenticator from 'actions/authenticator_actions';

describe( 'authenticator actions', () =>
{
    it( 'should have types', () =>
    {
        expect( authenticator.TYPES ).toBeDefined();
    } );

    it( 'should set authenticator lib status', () =>
    {
        const payload = false;
        const expectedAction = {
            type : authenticator.TYPES.SET_AUTH_LIB_STATUS,
            payload
        };
        expect( authenticator.setAuthLibStatus( payload ) ).toEqual( expectedAction );
    } );


    it( 'should set auth network status', () =>
    {
        const payload = 0;
        const expectedAction = {
            type : authenticator.TYPES.SET_AUTH_NETWORK_STATUS,
            payload
        };
        expect( authenticator.setAuthNetworkStatus( payload ) ).toEqual( expectedAction );
    } );



} );
