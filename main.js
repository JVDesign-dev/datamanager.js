// main.js — Demo Entry Point
// Initializes the UI and preloads storage for demonstration.
// In a real application, main.js would manage app state and UI logic.


import * as DataManager from './datamanager.js';
import * as UI from './ui.js';

window.addEventListener('DOMContentLoaded', () => {
    initStorage();
    initFileEngine();
    UI.init();
    UI.refresh();
})

function initStorage() {
    const prefix = document.getElementById('localStoragePrefix')?.value || 'datamanager';
    DataManager.storage.prefix = prefix;

    // Set templates for storage values
    DataManager.storage.templates = {
        subjects: {
            version: undefined,
            sessions: []
        },
        settings: {
            lang: undefined,
            examName: 'Schulaufgaben',
            showMultiplier: false,
            darkmode: true,
            activeSession: undefined,
            seenDownloadMessage: false,
            offline: false,
            seenStoragePolicy: false
        }
    }
    
    // Set keys that should be automatically set on storage initialization based on their template
    DataManager.storage.defaults = ['subjects', 'settings'];

    const initData = DataManager.storage.init();

    console.log(initData)

    window.demoData = {
        ...initData.content
    }

    if(initData.persistent) console.log(`Loaded demo data: ${JSON.stringify(window.demoData, null, 2)}`);
}

function initFileEngine() {
    DataManager.file.formats = {
        'datamanager-dtm': {
            encrypted: false,
            extension: 'dtm',
            fileName: 'datamanager_demo_unencrypted',
            minVersion: 'Version 1.0',
            currVersion: 'Version 1.0'
        },
        'datamanager-dtme': {
            encrypted: true,
            extension: 'dtme',
            fileName: 'datamanager_demo_encrypted',
            minVersion: 'Version 1.1',
            currVersion: 'Version 1.1'
        }
    }
}