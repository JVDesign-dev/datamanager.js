import * as DataManager from './datamanager.js';
import { generateRecoveryKey } from './crypto.js';
import * as UI from './ui.js';

const subjects = {};
const settings = {};
let data;

initStorage();

function initStorage() {
    const initData = DataManager.storage.init();
    Object.assign(subjects, initData.subjects);
    Object.assign(settings, initData.settings);
    const persistent = initData.persistent;
    if(persistent) rand();
}

window.addEventListener('DOMContentLoaded', () => {
    UI.init({ 
        triggerFileDownload: downloadData,
        triggerFileUpload: fileUpload
     });
    UI.refresh();
})

function fileUpload(event) {
    const file = event.target.files[0];
    if(!file) return;

    const fileExtension = file.name.split('.').slice(-1)[0];

    if(fileExtension !== 'grde') {
        handle(false);
        return;
    }
    
    document.documentElement.style.setProperty('--fileAccessDisplay', 'block');
    document.getElementById('submitUpload').addEventListener('click', () => handle(true));

    async function handle(isEncrypted) {
        const accessKey = document.getElementById('fileAccessKey')?.value;
        const result = await DataManager.handleFile(file, isEncrypted, accessKey)
            .catch(error => {
                switch(error.code) {
                    case 'NO_KEY':
                        alert('You need to input your password or recovery key');
                        break;
                    case 'INVALID_FILE_STRUCTURE':
                        alert(`The uploaded file's file structure is invalid.`);
                        break;
                    case 'DEK_DECRYPTION_ERROR':
                        alert('The provided key is invalid');
                        break;
                    case 'DECRYPTION_ERROR':
                        alert('The decryption failed');
                    case 'BAD_HMAC':
                        alert('The file decryption failed, because the content seems to be altered or corrupted.');
                        break;
                    default:
                        alert(error.message);
                }
            });
        
        data = result;
        document.getElementById('resultContent').textContent = data;
        document.documentElement.style.setProperty('--fileAccessDisplay', 'none');
    }
};

async function downloadData() {
    const data = document.getElementById('fileContent').value || 'Hello World!';
    const extension = document.getElementById('fileExtensionSelect').value;
    const password = document.getElementById('filePasswordInput').value;
    const recoveryKey = await generateRecoveryKey();

    document.getElementById('recoveryKey').textContent = recoveryKey;

    DataManager.download(data, 'gradia_save', extension, { password, recoveryKey })
        .catch(error => {
            switch(error.code) {
                case 'MISSING_ENCRYPT_PARAM':
                    alert('Missing encryption Parameters');
                    break;
                default:
                    console.log(error)
                    alert(error);
            }
        });
}

function rand() {
    console.log(subjects);
    console.log(settings);
}