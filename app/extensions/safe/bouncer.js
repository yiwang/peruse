import { ipcMain } from 'electron';
import logger from 'logger';
// allows a render process to setup to listen to requests from any other
// render process.
const bounce = ( listeningProcess, channelName ) =>
{
    // const listeningProcess = e.sender;
    ipcMain.on( channelName, ( e, ...args ) =>
    {
        //TODO: Pass isDestroyed.?
        listeningProcess.send( channelName, e.sender.isDestroyed(), ...args );
    } )
}

const hireABouncer = ( ) =>
{
    ipcMain.on( 'hireBouncer', ( e, channelName ) =>
    {
        bounce( e.sender,  channelName );
    } );
}
// const hireBouncer = ()
export default hireABouncer;
