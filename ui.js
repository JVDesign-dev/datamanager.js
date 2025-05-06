import * as DataManager from './datamanager.js';

export function refresh() {
    function localStorageKeys() {
        const keys = Object.keys(localStorage);
        const datalist = document.getElementById('localStorageKeys');
        datalist.textContent = '';
        for(const key of keys) {
            const option = document.createElement('option');
            option.value = key;
            datalist.appendChild(option);
        }
    }

    localStorageKeys();
}

export function init({ triggerFileDownload, triggerFileUpload }) {
    document.getElementById('submitStorage').addEventListener('click', () => {
        DataManager.storage.prefix = document.getElementById('localStoragePrefix').value || 'datamanager';
    })
    document.getElementById('startButton').addEventListener('click', triggerFileDownload);
    document.getElementById('fileInput').addEventListener('change', (event) => triggerFileUpload(event));
    document.getElementById('fileExtensionSelect').addEventListener('change', (event) => {
        if(event.target.value === 'grde') document.documentElement.style.setProperty('--encryptedFileDisplay', 'flex');
        else document.documentElement.style.setProperty('--encryptedFileDisplay', 'none');
    });
    document.getElementById('copyRecoveryKey').addEventListener('click', async function () {
        await navigator.clipboard.writeText(document.getElementById('recoveryKey').textContent)
    })
}

export function error(message, errorCode) {
    alert(`
        An Error occurred:
        ${message}
        ${errorCode}
    `)
}