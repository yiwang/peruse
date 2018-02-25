import * as remote_call from 'actions/remote_call_actions';

describe( 'remote call actions', () =>
{
    const payload = { id: 1, data: [] };
    it( 'should have types', () =>
    {
        expect( remote_call.TYPES ).toBeDefined();
    } );

    it( 'should add a remote call', () =>
    {
        const expectedAction = {
            type : remote_call.TYPES.ADD_REMOTE_CALL,
            payload
        };
        expect( remote_call.addRemoteCall( payload ) ).toEqual( expectedAction );
    } );

    it( 'should remove a remote call', () =>
    {
        const expectedAction = {
            type : remote_call.TYPES.REMOVE_REMOTE_CALL,
            payload
        };
        expect( remote_call.removeRemoteCall( payload ) ).toEqual( expectedAction );
    } );

    it( 'should update a remote call', () =>
    {
        const expectedAction = {
            type : remote_call.TYPES.UPDATE_REMOTE_CALL,
            payload
        };
        expect( remote_call.updateRemoteCall( payload ) ).toEqual( expectedAction );
    } );

} );
