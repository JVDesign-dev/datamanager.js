/**
 * ui.js — Demo Frontend Logic for DataManager
 *
 * This file connects DOM inputs with the DataManager module
 * to demonstrate encryption, decryption, and storage capabilities.
 *
 * NOTE: This is a demo UI. A real application should manage
 * data and errors through app logic, not direct DOM manipulation.
 */


import * as DataManager from './datamanager.js';
import { generateRecoveryKey } from './crypto.js';

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

export function init() {
    document.getElementById('fileConfig').addEventListener('change', (event) => {
        const content = `{${event.target.value}}`;
        console.log('h')
        try {
            const parsed = JSON.parse(content);
            event.target.setCustomValidity('');
        }
        catch(e) {
            event.target.setCustomValidity('No valid JSON');
            event.target.reportValidity();
        }
    });
    document.getElementById('setFileConfig').addEventListener('click', () => {
        const textArea = document.getElementById('fileConfig');
        if(!textArea.checkValidity() || textArea.validity.customError) return;

        const parsed = JSON.parse(`{${textArea.value}}`);
        DataManager.file.formats = parsed;

        const formats = Object.keys(parsed);
        setSelectOptions(document.getElementById('fileFormatInput'), formats);
    })
    document.getElementById('localStorageContent').addEventListener('change', (event) => {
        const content = `{${event.target.value}}`;
        console.log('h')
        try {
            const parsed = JSON.parse(content);
            event.target.setCustomValidity('');
        }
        catch(e) {
            event.target.setCustomValidity('No valid JSON');
            event.target.reportValidity();
        }
    });
    document.getElementById('setStorage').addEventListener('click', () => {
        const textArea = document.getElementById('localStorageContent');
        if(!textArea.checkValidity() || textArea.validity.customError) return;

        DataManager.storage.prefix = document.getElementById('localStoragePrefix').value || 'datamanager';
        const content = JSON.parse(`{${textArea.value}}`);
        for(let key in content) {
            DataManager.storage.set(key, content[key]);
        }
    });
    document.getElementById('getStorage').addEventListener('click', () => {
        DataManager.storage.prefix = document.getElementById('localStoragePrefix').value || 'datamanager';
        renderLocalStorageContent();
    })
    document.getElementById('downloadButton').addEventListener('click', async () => {
        const data = document.getElementById('fileContent').value || 'Hello World!';
        const format = document.getElementById('fileFormatInput').value;
        const password = document.getElementById('filePasswordInput').value;
        const recoveryKey = await generateRecoveryKey();

        document.getElementById('recoveryKey').textContent = recoveryKey;
        DataManager.file.export({data, format, encryptParameters: { password, recoveryKey }})
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
    });
    document.getElementById('fileInput').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if(!file) return;

        const fileExtension = file.name.split('.').slice(-1)[0];

        // Find the format key matching the extension and if encrypted
        const formatEntry = Object.values(DataManager.file.formats).find(format => format.extension === fileExtension);

        if (formatEntry && formatEntry.encrypted) {
            document.getElementById('fileAccessKey').value = '';
            document.documentElement.style.setProperty('--fileAccessDisplay', 'block');
        } 
        else {
            document.documentElement.style.setProperty('--fileAccessDisplay', 'none');
            handleFile();
        }
    });
    document.getElementById('submitUpload').addEventListener('click', handleFile);
    document.getElementById('fileFormatInput').addEventListener('change', (event) => {
        if(DataManager.file.formats[event.target.value]?.encrypted === true) document.documentElement.style.setProperty('--encryptedFileDisplay', 'flex');
        else document.documentElement.style.setProperty('--encryptedFileDisplay', 'none');
    });
    document.getElementById('copyRecoveryKey').addEventListener('click', async function () {
        await navigator.clipboard.writeText(document.getElementById('recoveryKey').textContent)
    })

    async function handleFile() {
        const file = document.getElementById('fileInput').files[0];

        const accessKey = document.getElementById('fileAccessKey')?.value;
        DataManager.file.import(file, accessKey)
            .then((result) =>{
                document.getElementById('resultContent').textContent = result;
                document.documentElement.style.setProperty('--fileAccessDisplay', 'none');
            })
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
                        break;
                    case 'BAD_HMAC':
                        alert('The file decryption failed, because the content seems to be altered or corrupted.');
                        break;
                    default:
                        alert(error.message);
                }
            });
    }

    document.getElementById('fileConfig').addEventListener('keydown', tabReplacer);
    document.getElementById('localStorageContent').addEventListener('keydown', tabReplacer);

    function tabReplacer(e) {
        const textarea = e.target;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;
    
        switch (e.key) {
            case 'Tab':
                e.preventDefault();
                if (start !== end) {
                    if (e.shiftKey) {
                        outdentSelection();
                    } else {
                        indentSelection();
                    }
                } else {
                    if (e.shiftKey) {
                        outdentLine();
                    } else {
                        insertText('    ');
                    }
                }
                break;
            case '{':
            case '[':
                e.preventDefault();
                const pair = e.key === '{' ? ['{', '}'] : ['[', ']'];
                if (start !== end) {
                    const selected = value.substring(start, end);
                    insertText(pair[0] + selected + pair[1], selected.length + 1);
                } else {
                    insertText(pair[0] + pair[1], 1);
                }
                break;
    
            case 'Enter':
                e.preventDefault();
                const indent = getLineIndent(value, start);
                const newline = '\n';
    
                if (value[start - 1] === '{') {
                    const nextChar = value[start] || '';
                    const middleIndent = indent + '    ';
    
                    if (nextChar === '}') {
                        const insertedText = newline + middleIndent + newline + indent;
                        const cursorOffset = newline.length + middleIndent.length;
                        insertText(insertedText, cursorOffset);
                    } else {
                        insertText(newline + middleIndent);
                    }
                } else {
                    insertText(newline + indent);
                }
                break;
    
            case 'Delete':
                e.preventDefault();
                if (start !== end) {
                    insertText('');
                } else if (value.substring(start, start + 4) === '    ') {
                    deleteRange(start, start + 4);
                } else {
                    deleteRange(start, start + 1);
                }
                break;
    
            case 'Backspace':
                e.preventDefault();
                if (start !== end) {
                    insertText('');
                } else if (value.substring(start - 4, start) === '    ') {
                    deleteRange(start - 4, start);
                } else {
                    deleteRange(start - 1, start);
                }
                break;
        }
    
        function insertText(text, cursorOffset = text.length) {
            textarea.value = value.substring(0, start) + text + value.substring(end);
            const cursor = start + cursorOffset;
            textarea.selectionStart = textarea.selectionEnd = cursor;
        }
    
        function deleteRange(from, to) {
            textarea.value = value.substring(0, from) + value.substring(to);
            textarea.selectionStart = textarea.selectionEnd = from;
        }
        
        function getLineIndent(text, index) {
            const lineStart = text.lastIndexOf('\n', index - 1) + 1;
            const match = text.slice(lineStart, index).match(/^\s*/);
            return match ? match[0] : '';
        }
        
        function indentSelection() {
            const lineStart = value.lastIndexOf('\n', start) + 1;
            const lineEnd = value.indexOf('\n', end);
            const actualEnd = lineEnd === -1 ? value.length : lineEnd;
        
            const selectedText = value.substring(lineStart, actualEnd);
            const lines = selectedText.split('\n');
            const indented = lines.map(line => '    ' + line).join('\n');
        
            const addedChars = 4 * lines.length;
        
            textarea.value = value.substring(0, lineStart) + indented + value.substring(actualEnd);
            textarea.selectionStart = start + 4;
            textarea.selectionEnd = end + addedChars;
        }
        
        function outdentSelection() {
            const lineStart = value.lastIndexOf('\n', start) + 1;
            const lineEnd = value.indexOf('\n', end);
            const actualEnd = lineEnd === -1 ? value.length : lineEnd;
        
            const selectedText = value.substring(lineStart, actualEnd);
            const lines = selectedText.split('\n');
        
            let removedChars = 0;
            const outdented = lines.map(line => {
                if (line.startsWith('    ')) {
                    removedChars += 4;
                    return line.slice(4);
                }
                return line;
            }).join('\n');
        
            textarea.value = value.substring(0, lineStart) + outdented + value.substring(actualEnd);
            textarea.selectionStart = Math.max(start - 4, lineStart);
            textarea.selectionEnd = end - removedChars;
        }
        
        function outdentLine() {
            const lineStart = value.lastIndexOf('\n', start - 1) + 1;
            if (value.substring(lineStart, lineStart + 4) === '    ') {
                textarea.value = value.substring(0, lineStart) +
                                 value.substring(lineStart + 4);
                const newCursor = start - 4;
                textarea.selectionStart = textarea.selectionEnd = newCursor;
            }
        }        
    }

    renderLocalStorageContent();
    renderFileConfig();

    function renderLocalStorageContent() {
        const content = JSON.parse(localStorage.getItem(DataManager.storage.prefix));
        const list = Object.keys(content);
        const result = [];
        for(let key of list) {
            result.push(`"${key}": ${JSON.stringify(content[key], null, 2)}`);
        }
        document.getElementById('localStorageContent').value = result.join(',\n');
    }

    function renderFileConfig() {
        const config = DataManager.file.formats;
        const list = Object.keys(config);
        const result = [];
        for(let key of list) {
            result.push(`"${key}": ${JSON.stringify(config[key], null, 2)}`);
        }
        document.getElementById('fileConfig').value = result.join(',\n');

        setSelectOptions(document.getElementById('fileFormatInput'), list);
    }

    function setSelectOptions(node, options) {
        node.innerHTML = '';
        for(const option of options) {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            node.appendChild(opt);
        }
        node.dispatchEvent(new Event('change'))
    }
}

export function error(message, errorCode) {
    alert(`
        An Error occurred:
        ${message}
        ${errorCode}
    `)
}