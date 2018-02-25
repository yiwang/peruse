/* eslint-disable func-names */
import remote_calls from 'reducers/remote_calls';
import { TYPES } from 'actions/remote_call_actions';
import initialState from 'reducers/initialAppState';

describe( 'notification reducer', () =>
{
    let aCall;
    beforeEach( ()=>
    {
        aCall = { id: 'A', args: [] };
    });

    it( 'should return the initial state', () =>
    {
        expect( remote_calls( undefined, {} ) ).toEqual( initialState.remote_calls );
    } );

    describe( 'ADD_REMOTE_CALL', () =>
    {
        it( 'should handle adding a remote call', () =>
        {
            expect(
                remote_calls( {}, {
                    type    : TYPES.ADD_REMOTE_CALL,
                    payload : aCall
                } )
            ).toEqual( [ aCall ] );
        } );
    })

    describe( 'REMOVE_REMOTE_CALL', () =>
    {
        it( 'should handle removing a remote call', () =>
        {
            expect(
                remote_calls( [ {id: 'unimportant'}, aCall], {
                    type    : TYPES.REMOVE_REMOTE_CALL,
                    payload:  aCall
                } )
            ).toEqual( [ {id: 'unimportant'} ] );
        } );
    })

    describe( 'UPDATE_REMOTE_CALL', () =>
    {
        it( 'should handle updating a call', () =>
        {
            expect(
                remote_calls( [aCall ], {
                    type    : TYPES.UPDATE_REMOTE_CALL,
                    payload: {
                        id: 'A',
                        data: ['hi']
                    }
                } )
            ).toEqual( [
                {
                    ...aCall,
                    data: ['hi']
                }
            ] );
        } );
    })

})
