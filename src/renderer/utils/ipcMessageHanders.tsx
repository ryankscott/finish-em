import { toast } from 'react-toastify'
console.log(window.electron)
export const registerHandlers = () => {
  window.electron.ipcRenderer.on('send-notification', (_, arg) => {
    // TODO: Implement multiple notification types
    toast.dark(`${arg.text}`)
  })

  window.electron.ipcRenderer.on('syncing-calendar-start', (_, arg) => {
    console.log('Calendar sync start')
  })

  window.electron.ipcRenderer.on('events-refreshed', () => {
    console.log('refreshed events')
  })

  window.electron.ipcRenderer.on('syncing-calendar-finished', (_, arg) => {
    console.log('Calendar sync finished')
  })

  window.electron.ipcRenderer.on('new-version', (_, arg) => {
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
    )
  })
}
