import { encrypt, decrypt, generateRecoveryKey } from './crypto.js';


//----- Storage Unit -----//

export const storage = {
    prefix: 'gradia-test',
    available: false,
    cloudSync: false,

    subjects_template: {
        version: undefined,
        sessions: []
    },
    settings_template: {
        lang: undefined,
        examName: 'Schulaufgaben',
        showMultiplier: false,
        darkmode: true,
        activeSession: undefined,
        seenDownloadMessage: false,
        offline: false,
        seenStoragePolicy: false
    },

    init(buildVersion = 'Version 1.0') {
        storage.subjects_template.version = buildVersion;
        try {
            // Check LocalStorage functionality
            const testKey = '__test__';
            localStorage.setItem(testKey, testKey);
            if(localStorage.getItem(testKey) !== testKey) throw new Error("localStorage_altered");
            localStorage.removeItem(testKey);
            storage.available = true;

            // Already known user: Auto-return data
            if(localStorage.getItem(storage.prefix) !== null) return {
                subjects: storage.ensure('subjects', storage.subjects_template), 
                settings: storage.ensure('settings', storage.settings_template),
                persistent: true
            };

            // Initialize Storage
            localStorage.setItem(storage.prefix, '{}');
            storage.set('subjects', storage.subjects_template);
            storage.set('settings', storage.settings_template);
        }
        catch (e) {
            console.warn(`LocalStorage not available: ${e}`);
            storage.available = false;
            return {
                subjects: storage.subjects_template,
                settings: storage.settings_template,
                persistent: false
            }
        }
    },

    ensure(key, fallback) {
        let value = storage.get(key);
        if(!value || typeof(value) !== 'object') {
            storage.set(key, fallback);
            return fallback;
        }
        return value;
    },

    set(key, value) {
        if(!storage.available) return false;

        let data = JSON.parse(localStorage.getItem(storage.prefix)) || {};
        data[key] = value;
        localStorage.setItem(storage.prefix, JSON.stringify(data));
    },

    get(key) {
        if(!storage.available) return null;

        let data = JSON.parse(localStorage.getItem(storage.prefix)) || {};
        return data[key];
    },

    remove(key) {
        let data = JSON.parse(localStorage.getItem(storage.prefix)) || {};
        if(key in data) {
            delete data[key];
            localStorage.setItem(storage.prefix, JSON.stringify(data));
        }
    }
}

//----- File Import -----//

export async function handleFile(file, accessKey) {
    if(!accessKey) throw customError('No key provided', 'NO_KEY');

    const reader = new FileReader();

    const fileContent = await new Promise((resolve, reject) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e.target.error);
        reader.readAsText(file);
    });

    const result = await retrieveContent(fileContent, accessKey);
    return result;
}

async function retrieveContent(data, accessKey) {
    let result;
    const parsedData = JSON.parse(data);

    switch(parsedData.format) {
        case 'gradia-grde':
            if (!(
                typeof parsedData === 'object' &&
                parsedData.version === "Version 1.0" &&
                parsedData.format === "gradia-grde" &&
                parsedData.metadata?.created &&
                parsedData.encryption?.salt instanceof Array &&
                parsedData.encryption?.iv instanceof Array &&
                typeof parsedData.encryption?.passwordEncryptedDEK === 'string' &&
                typeof parsedData.encryption?.recoveryEncryptedDEK === 'string' &&
                typeof parsedData.hmac === 'string' &&
                typeof parsedData.content === 'string'
            )) throw customError('Invalid file structure', 'INVALID_FILE_STRUCTURE');

            result = await decrypt(parsedData.encryption, accessKey, parsedData.content, parsedData.hmac);
            break;
        default:
            if(typeof parsedData !== 'object' || 
                parsedData.version !== 'Version 1.0' || 
                typeof parsedData.content !== 'string'
            ) throw customError('Invalid file structure', 'INVALID_FILE_STRUCTURE');
    }
    
    return result;
}

//----- File Export -----//

export async function download(content, fileName = "gradia_save", extension = "grd", encryptParameters = {password, recoveryKey}) {
    let result;
    switch(extension) {
        case "grde":
            if(!encryptParameters.password || !encryptParameters.recoveryKey) throw customError('Missing Encryption Parameter', 'MISSING_ENCRYPT_PARAM');

            const encryptedContent = await encrypt(JSON.stringify(content), encryptParameters.password, encryptParameters.recoveryKey);
            console.log(encryptedContent)

            encryptedContent.version = "Version 1.0";
            encryptedContent.format = `gradia-${extension}`;
            encryptedContent.metadata ??= {};
            encryptedContent.metadata.created = new Date().toISOString();

            // Correct property order
            result = JSON.stringify(insertProperties(encryptedContent, [
                ["version", encryptedContent.version, 0],
                ["format", encryptedContent.format, 1],
                ["metadata", encryptedContent.metadata, 2]
            ]), null, 2);

            break;
        default:
            const fileContent = {
                version: "Version 1.0",
                format: `gradia-${extension}`,
                metadata: {created: new Date().toISOString()},
                content: JSON.stringify(content, null, 2)
            }
            
            result = JSON.stringify(fileContent, null, 2);
    }

    downloadFile(result, fileName, extension);
}

function downloadFile(content, filename = "gradia_save", extension = "grd") {
    const blob = new Blob([content], { type: `application/vnd.gradia.${extension}` });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url); //Clean up
}

function insertProperties(obj, properties) {
    let entries = Object.entries(obj);
    properties.forEach(([key, value, position]) => {
        entries.splice(position, 0, [key, value]);
    });
    return Object.fromEntries(entries);
}


//----- Utility -----//

function customError(errorMessage, errorCode) {
    const error = new Error(errorMessage);
    error.code = errorCode;

    return error;
}