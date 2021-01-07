const { ipcRenderer } = require('electron');

const checkConnection = () => {
    ipcRenderer.send('update-online-connection', navigator.onLine ? 'online' : 'offline');
};

window.addEventListener('online', checkConnection);
window.addEventListener('offline', checkConnection);

checkConnection();