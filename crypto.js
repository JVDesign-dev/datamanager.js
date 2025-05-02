// ----- Encryption ----- //

export async function generateRecoveryKey() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
}

async function computeChecksum(data) {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function computeHMAC(key, data) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        key,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const signature = await crypto.subtle.sign(
        "HMAC",
        keyMaterial,
        encoder.encode(data)
    );
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

/**
 * @param {string} data 
 * @param {string} password 
 * @param {string} recoveryKey 
 * @returns 
 */
export async function encrypt(data, password, recoveryKey) {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const dek = crypto.getRandomValues(new Uint8Array(32)); //Data Encryption Key

    async function deriveKey(secret) {
        const keyMaterial = await crypto.subtle.importKey(
            "raw",
            encoder.encode(secret),
            { name: "PBKDF2" },
            false,
            ["deriveKey"]
        );
        return crypto.subtle.deriveKey(
            { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );
    }

    const passwordKey = await deriveKey(password);
    const recoveryKeyKey = await deriveKey(recoveryKey);

    const passwordEncryptedDEK = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, passwordKey, dek);
    const recoveryEncryptedDEK = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, recoveryKeyKey, dek);

    const encryptedData = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await crypto.subtle.importKey(
        "raw", dek, { name: "AES-GCM" }, false, ["encrypt"]
    ), encoder.encode(data));


    return {
        encryption: {
            salt: Array.from(salt),
            iv: Array.from(iv),
            passwordEncryptedDEK: btoa(String.fromCharCode(...new Uint8Array(passwordEncryptedDEK))),
            recoveryEncryptedDEK: btoa(String.fromCharCode(...new Uint8Array(recoveryEncryptedDEK)))
        },
        hmac: await computeHMAC(dek, await computeChecksum(btoa(String.fromCharCode(...new Uint8Array(encryptedData))))),
        content: btoa(String.fromCharCode(...new Uint8Array(encryptedData)))
    }
}



// ----- Decryption ----- //

export async function decrypt(encryptionInfo, passwordOrRecovery, data, hmac) {
    const { salt, iv, passwordEncryptedDEK, recoveryEncryptedDEK } = encryptionInfo;
    const decoder = new TextDecoder();
    const saltArray = new Uint8Array(salt);
    const ivArray = new Uint8Array(iv);

    async function deriveKey(secret) {
        const keyMaterial = await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(secret),
            { name: "PBKDF2" },
            false,
            ["deriveKey"]
        );
        return crypto.subtle.deriveKey(
            { name: "PBKDF2", salt: saltArray, iterations: 100000, hash: "SHA-256" },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            true,
            ["decrypt"]
        );
    }

    const userKey = await (deriveKey(passwordOrRecovery));

    async function tryDecrypt(key, data, iv) {
        try {
            return await crypto.subtle.decrypt(
                { name: "AES-GCM", iv },
                key,
                new Uint8Array(atob(data).split("").map(c => c.charCodeAt(0)))
            );
        } catch {
            return null;
        }
    }
    
    let dek =
        await tryDecrypt(userKey, passwordEncryptedDEK, ivArray) ||
        await tryDecrypt(userKey, recoveryEncryptedDEK, ivArray);
    
    if (!dek) {
        throw customError('DEK decryption failed', 'DEK_DECRYPTION_ERROR');
    }    

    if(hmac && await computeHMAC(dek, await computeChecksum(data)) !== hmac) throw customError('HMAC validation failed', 'BAD_HMAC');

    let decryptedData;
    try {
        console.log('Here')
        decryptedData = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: ivArray },
            await crypto.subtle.importKey("raw", dek, { name: "AES-GCM" }, false, ["decrypt"]),
            new Uint8Array(atob(data).split("").map(c => c.charCodeAt(0)))
        )
    }
    catch {
        throw customError('Decryption failed', 'DECRYPTION_ERROR');
    }

    return decoder.decode(decryptedData);
}

function customError(errorMessage, errorCode) {
    const error = new Error(errorMessage);
    error.code = errorCode;

    return error;
}