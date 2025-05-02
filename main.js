import * as DataManager from './datamanager.js';
import { generateRecoveryKey } from './crypto.js';

const buildVersion = 'TTest';
const settings = 'SeTTings';
window.storage = DataManager.storage;

document.getElementById('startButton').addEventListener('click', downloadData);
document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if(!file) return;

    const fileExtension = file.name.split('.').slice(-1)[0];

    if(fileExtension !== 'grde') {
        handle();
        return;
    }
    
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'fileAccessKey';
    document.body.appendChild(input);

    const button = document.createElement('button');
    button.textContent = 'Submit';
    button.id = 'submitUpload';
    button.addEventListener('click', handle);
    document.body.appendChild(button);

    async function handle() {
        const accessKey = document.getElementById('fileAccessKey')?.value;
        const result = await DataManager.handleFile(file, accessKey)
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
        
        document.getElementById('resultContent').textContent = result;
    }
});

async function downloadData() {
    const data = {test: 'Y'}
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