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
    document.getElementById('localStorageContent').addEventListener('change', (event) => {
        const content = `{${event.target.value}}`;
        console.log(content)
        console.log('h')
        try {
            const parsed = JSON.parse(content);
            event.target.setCustomValidity('');
            console.log('t')
        }
        catch(e) {
            console.log('e')
            event.target.setCustomValidity('No valid JSON');
            event.target.reportValidity();
        }
    })
    document.getElementById('setStorage').addEventListener('click', () => {
        const textArea = document.getElementById('localStorageContent');
        if(!textArea.checkValidity() || textArea.validity.customError) return;

        DataManager.storage.prefix = document.getElementById('localStoragePrefix').value || 'datamanager';
        console.log(textArea.value)
        const content = JSON.parse(`{${textArea.value}}`);
        for(let key in content) {
            DataManager.storage.set(key, content[key]);
        }
    });
    document.getElementById('getStorage').addEventListener('click', () => {
        DataManager.storage.prefix = document.getElementById('localStoragePrefix').value || 'datamanager';
        renderLocalStorageContent();
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

    renderLocalStorageContent();

    function renderLocalStorageContent() {
        const content = JSON.parse(localStorage.getItem(DataManager.storage.prefix));
        const list = Object.keys(content);
        const result = [];
        for(let key of list) {
            result.push(`"${key}": ${JSON.stringify(content[key], null, 2)}`);
        }
        document.getElementById('localStorageContent').value = result.join(',\n');
    }
}

export function error(message, errorCode) {
    alert(`
        An Error occurred:
        ${message}
        ${errorCode}
    `)
}