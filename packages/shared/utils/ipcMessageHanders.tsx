import { toast } from 'react-toastify';
export const registerHandlers = () => {
  window.electronAPI.ipcRenderer.onReceiveMessage(
    'send-notification',
    (_, arg) => {
      // TODO: Implement multiple notification types
      toast.dark(`${arg.text}`);
    }
  );

  window.electronAPI.ipcRenderer.onReceiveMessage(
    'syncing-calendar-start',
    (_, arg) => {
      console.log('Calendar sync start');
    }
  );

  window.electronAPI.ipcRenderer.onReceiveMessage('events-refreshed', () => {
    console.log('refreshed events');
  });

  window.electronAPI.ipcRenderer.onReceiveMessage(
    'syncing-calendar-finished',
    (_, arg) => {
      console.log('Calendar sync finished');
    }
  );

  window.electronAPI.ipcRenderer.onReceiveMessage('new-version', (_, arg) => {
    toast(
      <div>
        <p>
          <strong>New version available 🎉</strong>
          <br />
          Download the new version <a href={arg.downloadUrl}>here </a>
          <br />
          {`Or checkout the release <a href={arg.releaseURL}> notes</a> for
              what's changed`}
        </p>
      </div>,
      { autoClose: false }
    );
  });
};
