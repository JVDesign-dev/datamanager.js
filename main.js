import * as JFile from './jfile.js';
import { generateRecoveryKey } from './crypto.js';

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

    function handle() {
        JFile.handleFile()
            .catch(error => {
                switch(error.code) {
                    case 'NO_KEY':
                        alert('You need to input your password or recovery key');
                        break;
                    case 'INVALID_FILE_STRUCTURE':
                        alert(`The uploaded file's file structure is invalid.`);
                        break;
                    case 'BAD_HMAC':
                        alert('The file decryption failed, because the content seems to be altered or corrupted.');
                        break;
                    default:
                        alert(error.message);
                }
            });
    }
});

function downloadData() {
    const data = {test: 'Y'}
    const extension = document.getElementById('fileExtensionSelect').value;
    const password = document.getElementById('filePasswordInput').value;
    const recoveryKey = generateRecoveryKey();

    JFile.downloadAsFile(data, 'gradia_save', extension, { password, recoveryKey })
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