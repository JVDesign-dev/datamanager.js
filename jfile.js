import { encrypt, decrypt, generateRecoveryKey } from './crypto.js';

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

async function start() {
    const obj = {
        "version": "Version 1.0",
        "format": "gradia-grd",
        "metadata": {
            "created": "2025-03-13T12:00:00Z"
        },
        "sessions": [
            {
                "name": "2023/24",
                "grades": [
                    {
                        "name": "Biologie",
                        "grades": [
                            {
                                "grade": 3,
                                "weight": 1,
                                "description": "1. Kurzarbeit"
                            },
                            {
                                "grade": 1,
                                "weight": 1,
                                "description": "schriftliche Ausfrage"
                            },
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "2. Kurzarbeit"
                            },
                            {
                                "grade": 1,
                                "weight": 1,
                                "description": "Referat Fructoseintoleranz"
                            },
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "Gruppenpuzzle Embolie"
                            }
                        ]
                    },
                    {
                        "name": "Chemie",
                        "grades": [
                            [
                                {
                                    "grade": 2,
                                    "weight": 1,
                                    "description": "1. Schulaufgabe"
                                },
                                {
                                    "grade": 2,
                                    "weight": 1,
                                    "description": "2. Schulaufgabe"
                                }
                            ],
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "Ausfrage"
                            },
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "mündlich"
                            },
                            {
                                "grade": 1,
                                "weight": 1,
                                "description": "Titration"
                            },
                            {
                                "grade": 1,
                                "weight": 1,
                                "description": "mündlich"
                            },
                            {
                                "grade": 3,
                                "weight": 1,
                                "description": "2. Kurzarbeit"
                            }
                        ],
                        "examWeight": 1
                    },
                    {
                        "name": "Deutsch",
                        "grades": [
                            [
                                {
                                    "grade": 3,
                                    "weight": 1,
                                    "description": "1. Schulaufgabe"
                                },
                                {
                                    "grade": 2,
                                    "weight": 1,
                                    "description": "2. Schulaufgabe"
                                },
                                {
                                    "grade": 2,
                                    "weight": 1,
                                    "description": "3. Schulaufgabe"
                                }
                            ],
                            {
                                "grade": 3,
                                "weight": 1,
                                "description": "1. Kurzarbeit"
                            },
                            {
                                "grade": 3,
                                "weight": 1,
                                "description": "mündlich"
                            },
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "mündlich"
                            },
                            {
                                "grade": 1,
                                "weight": 1,
                                "description": "Referat"
                            },
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "mündlich"
                            },
                            {
                                "grade": 1,
                                "weight": 1,
                                "description": "mündlich"
                            }
                        ],
                        "examWeight": 2
                    },
                    {
                        "name": "Englisch",
                        "grades": [
                            [
                                {
                                    "grade": 2,
                                    "weight": 1,
                                    "description": "1. Schulaufgabe"
                                },
                                {
                                    "grade": 2,
                                    "weight": 1,
                                    "description": "2. Schulaufgabe"
                                },
                                {
                                    "grade": 2,
                                    "weight": 1,
                                    "description": "3. Schulaufgabe"
                                }
                            ],
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "mündlich"
                            },
                            {
                                "grade": 1,
                                "weight": 1,
                                "description": "Referat"
                            },
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "mündlich"
                            },
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "Ex"
                            },
                            {
                                "grade": 1,
                                "weight": 1,
                                "description": "Gedicht"
                            }
                        ],
                        "examWeight": 2
                    },
                    {
                        "name": "Geschichte",
                        "grades": [
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "1. Kurzarbeit"
                            },
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "mündlich"
                            },
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "2. Kurzarbeit"
                            },
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "2. Kurzarbeit"
                            },
                            {
                                "grade": 1,
                                "weight": 1,
                                "description": "mündlich"
                            }
                        ]
                    },
                    {
                        "name": "Kunst",
                        "grades": [
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "Zeichnung"
                            },
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "Upcycling"
                            },
                            {
                                "grade": 1,
                                "weight": 0.5,
                                "description": "Bilder"
                            },
                            {
                                "grade": 2,
                                "weight": 0.5,
                                "description": "Bilder"
                            },
                            {
                                "grade": 1,
                                "weight": 0.5,
                                "description": "Bilder"
                            },
                            {
                                "grade": 2,
                                "weight": 0.5,
                                "description": "Stancil Vorlage"
                            },
                            {
                                "grade": 1,
                                "weight": 0.5,
                                "description": "Stancil"
                            }
                        ]
                    },
                    {
                        "name": "Latein",
                        "grades": [
                            [
                                {
                                    "grade": 4,
                                    "weight": 1,
                                    "description": "1. Schulaufgabe"
                                },
                                {
                                    "grade": 3,
                                    "weight": 1,
                                    "description": "2. Schulaufgabe"
                                },
                                {
                                    "grade": 4,
                                    "weight": 1,
                                    "description": "3. Schulaufgabe"
                                }
                            ],
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "Ausfrage"
                            },
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "mündlich"
                            },
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "2. Ex"
                            }
                        ],
                        "examWeight": 2
                    },
                    {
                        "name": "Mathe",
                        "grades": [
                            [
                                {
                                    "grade": 3,
                                    "weight": 1,
                                    "description": "1. Schulaufgabe"
                                },
                                {
                                    "grade": 2,
                                    "weight": 1,
                                    "description": "2. Schulaufgabe"
                                },
                                {
                                    "grade": 1,
                                    "weight": 1,
                                    "description": "3. Schulaufgabe"
                                }
                            ],
                            {
                                "grade": 4,
                                "weight": 1,
                                "description": "BMT"
                            },
                            {
                                "grade": 3,
                                "weight": 1,
                                "description": "mündlich"
                            },
                            {
                                "grade": 1,
                                "weight": 1,
                                "description": "1. Ex"
                            },
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "mündlich"
                            },
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "mündlich"
                            }
                        ],
                        "examWeight": 2
                    },
                    {
                        "name": "Musik",
                        "grades": [
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "1. Kurzarbeit"
                            },
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "mündlich"
                            },
                            {
                                "grade": 1,
                                "weight": 1,
                                "description": "Musique Concreté"
                            }
                        ]
                    },
                    {
                        "name": "Physik",
                        "grades": [
                            [
                                {
                                    "grade": 1,
                                    "weight": 1,
                                    "description": "1. Schulaufgabe"
                                },
                                {
                                    "grade": 2,
                                    "weight": 1,
                                    "description": "2. Schulaufgabe"
                                }
                            ],
                            {
                                "grade": 1,
                                "weight": 1,
                                "description": "Ausfrage"
                            },
                            {
                                "grade": 1,
                                "weight": 1,
                                "description": "2. Ex"
                            },
                            {
                                "grade": 1,
                                "weight": 1,
                                "description": "mündlich"
                            },
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "Ausfrage"
                            },
                            {
                                "grade": 1,
                                "weight": 1,
                                "description": "Ausfrage"
                            },
                            {
                                "grade": 1,
                                "weight": 1,
                                "description": "Ex"
                            }
                        ],
                        "examWeight": 1
                    },
                    {
                        "name": "Religion",
                        "grades": [
                            {
                                "grade": 4,
                                "weight": 1,
                                "description": "1. Kurzarbeit"
                            },
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "mündlich"
                            },
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "mündlich"
                            },
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "AksL Buddhismus"
                            }
                        ]
                    },
                    {
                        "name": "Sport",
                        "grades": [
                            {
                                "grade": 3,
                                "weight": 1,
                                "description": "Volleyball-Technik"
                            },
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "Volleyball-Spiel"
                            },
                            {
                                "grade": 1,
                                "weight": 1,
                                "description": "Ausdauerlauf"
                            }
                        ]
                    },
                    {
                        "name": "Wirtschaft",
                        "grades": [
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "1. Kurzarbeit"
                            },
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "mündlich"
                            },
                            {
                                "grade": 1,
                                "weight": 1.5,
                                "description": "Pitch"
                            },
                            {
                                "grade": 1,
                                "weight": 1,
                                "description": "Praktikumsbericht"
                            },
                            {
                                "grade": 1,
                                "weight": 1,
                                "description": "mündlich"
                            }
                        ]
                    },
                    {
                        "name": "Politik",
                        "grades": [
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "mündlich"
                            },
                            {
                                "grade": 1,
                                "weight": 1,
                                "description": "1. Kurzarbeit"
                            },
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "Kurzarbeit"
                            }
                        ]
                    },
                    {
                        "name": "Geographie",
                        "grades": [
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "mündlich"
                            },
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "1. Kurzarbeit"
                            },
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "mündlich"
                            },
                            {
                                "grade": 1,
                                "weight": 1,
                                "description": "2. Kurzarbeit"
                            },
                            {
                                "grade": 2,
                                "weight": 1,
                                "description": "Erklärvideo"
                            }
                        ]
                    }
                ]
            }
        ]
    };

    const recov = await generateRecoveryKey();
    console.log(recov);
    downloadAsFile(obj, "test_full_encr_download", "grde",{password:"pass",recoveryKey: recov});
}

export async function downloadAsFile(content, fileName = "gradia_save", extension = "grd", encryptParameters = {password, recoveryKey}) {
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

function customError(errorMessage, errorCode) {
    const error = new Error(errorMessage);
    error.code = errorCode;

    return error;
}