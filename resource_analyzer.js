import fetch from 'node-fetch';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Konstanten
const API_TOKEN = '1c20f2ffc52e2fed9a6d87f44cd99340057fb6e7b0328d865b8794c88262ca0f'; // Neuer API-Token
const UNLOCKER_URL = 'https://api.brightdata.com/request';
const PROXY_HOST = 'brd.superproxy.io';
const PROXY_PORT = '33335';
const PROXY_USERNAME = 'brd-customer-hl_e9e3bb9d-zone-datacenter_proxy2';
const PROXY_PASSWORD = '9gtf0np807rt';
const BATCH_SIZE = 10; // Parallele Anfragen
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;
const MIN_PLAYERS = 0; // Mindestanzahl an Spielern für relevante Server (auf 0 gesetzt für Testzwecke)
const USE_MOCK_DATA = true; // Temporär Mock-Daten verwenden, da Brightdata API Probleme hat

/**
 * Verzögerungsfunktion
 * @param {number} ms - Millisekunden zu warten
 * @returns {Promise<void>}
 */
async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Prüft die Ressourcen eines einzelnen Servers
 * @param {string} serverId - Die Server-ID
 * @param {number} attemptCount - Aktuelle Anzahl an Versuchen
 * @param {Function} logCallback - Callback-Funktion für API-Logs
 * @returns {Promise<Object|null>} - Server-Daten oder null bei Fehler/zu wenig Spielern
 */
async function checkServerResources(serverId, attemptCount = 0, logCallback = () => {}) {
    try {
        // Wenn USE_MOCK_DATA aktiviert ist, generiere realistische Testdaten
        if (USE_MOCK_DATA) {
            // Log für Mock-Daten
            logCallback({
                method: 'MOCK',
                url: `Mock-Daten für Server ${serverId}`,
                status: 200,
                ip: 'Mock-IP'
            });
            
            // Realistische Server-Namen
            const serverNames = [
                'GTA-RP Deutschland',
                'NoPixel Public',
                'Eclipse RP',
                'Los Santos Life',
                'German Roleplay',
                'FiveM Racing Server',
                'Drift Paradise',
                'Criminal Activities RP',
                'City of Dreams',
                'Underground Racing',
                'Berlin City Life',
                'München Roleplay',
                'Frankfurt Ganglife',
                'Hamburg Cityroleplay',
                'Köln Underground',
                'Stuttgart Life',
                'Bavaria RP',
                'Ruhrpott Life',
                'Westside Roleplay',
                'Paris Roleplay',
                'Madrid Life',
                'London Calling'
            ];
            
            // Erweiterte realistische Ressourcen
            const commonResources = [
                'esx_basicneeds', 'esx_jobs', 'esx_vehicleshop', 'esx_policejob',
                'esx_ambulancejob', 'esx_mechanicjob', 'esx_drugs', 'esx_banking',
                'mythic_notify', 'pNotify', 'progressBars', 'menuv',
                'qb-core', 'qb-inventory', 'qb-clothing', 'qb-vehiclekeys',
                'vrp', 'vrp_basic_menu', 'vrp_mysql', 'vrp_chatbox',
                'NativeUI', 'spawnmanager', 'mapmanager', 'chat',
                'hardcap', 'rconlog', 'sessionmanager', 'baseevents',
                'es_extended', 'esx_menu_default', 'esx_menu_dialog', 'esx_menu_list',
                'mysql-async', 'async', 'cron', 'es_admin2', 'esx_addonaccount',
                'esx_billing', 'esx_datastore', 'esx_identity', 'esx_license',
                'esx_skin', 'skinchanger', 'esx_clotheshop', 'esx_barbershop',
                'esx_garage', 'esx_lscustom', 'esx_shops', 'esx_society',
                'qb-policejob', 'qb-ambulancejob', 'qb-mechanicjob', 'qb-drugs',
                'qb-shops', 'qb-houses', 'qb-vehiclefailure', 'qb-radialmenu',
                'qb-hud', 'qb-customs', 'qb-weathersync', 'pma-voice', 'mumble-voip',
                'tokovoip_script', 'saltychat', 'mythic_progbar', 'oxmysql'
            ];
            
            // Zufällige Spielerzahl zwischen 5 und 128
            const playerCount = Math.floor(Math.random() * 124) + 5;
            
            // Mehr Ressourcen für realistischere Server
            const resourceCount = Math.floor(Math.random() * 30) + 15; // 15-45 Ressourcen
            const resources = [];
            const shuffledResources = [...commonResources].sort(() => 0.5 - Math.random());
            for (let i = 0; i < resourceCount; i++) {
                resources.push(shuffledResources[i] || `custom_resource_${i}`);
            }
            
            // Eindeutigen Server-Namen erstellen (Server-ID anhängen um Duplikate zu vermeiden)
            const baseName = serverNames[Math.floor(Math.random() * serverNames.length)];
            const serverName = `${baseName} #${serverId}`;
            
            // Sprachcodes und Namen für bessere Spracherkennung
            const languages = [
                { code: 'de', name: 'Deutsch' },
                { code: 'en', name: 'English' },
                { code: 'fr', name: 'Français' },
                { code: 'es', name: 'Español' },
                { code: 'pt', name: 'Português' },
                { code: 'it', name: 'Italiano' },
                { code: 'nl', name: 'Nederlands' }
            ];
            
            // Bestimme Sprache basierend auf Servernamen für realistischere Daten
            let language;
            if (serverName.includes('Deutschland') || serverName.includes('German') || 
                serverName.includes('Berlin') || serverName.includes('München') || 
                serverName.includes('Frankfurt') || serverName.includes('Hamburg') || 
                serverName.includes('Köln') || serverName.includes('Stuttgart') || 
                serverName.includes('Bavaria') || serverName.includes('Ruhrpott')) {
                language = languages.find(l => l.code === 'de');
            } else if (serverName.includes('Paris')) {
                language = languages.find(l => l.code === 'fr');
            } else if (serverName.includes('Madrid')) {
                language = languages.find(l => l.code === 'es');
            } else if (serverName.includes('London')) {
                language = languages.find(l => l.code === 'en');
            } else {
                language = languages[Math.floor(Math.random() * languages.length)];
            }
            
            // Testdaten zurückgeben
            console.log(`Verwende Testdaten für Server ${serverId} mit ${playerCount} Spielern`);
            return {
                id: serverId,
                name: serverName,
                language: language.name,
                language_code: language.code,
                resources: resources,
                players: playerCount
            };
        }
        
        // Normale API-Anfrage, wenn USE_MOCK_DATA deaktiviert ist
        const startTime = Date.now();
        const targetUrl = `https://servers-frontend.fivem.net/api/servers/single/${serverId}`;
        
        const response = await fetch(UNLOCKER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_TOKEN}`
            },
            body: JSON.stringify({
                url: targetUrl,
                format: 'raw',
                proxy: `http://${PROXY_USERNAME}:${PROXY_PASSWORD}@${PROXY_HOST}:${PROXY_PORT}`,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "accept": "application/json, text/plain, */*",
                    "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
                    "Origin": "https://servers.fivem.net",
                    "Referer": "https://servers.fivem.net/"
                }
            })
        });
        
        const responseTime = Date.now() - startTime;
        
        // API-Log erstellen
        logCallback({
            method: 'POST',
            url: targetUrl,
            status: response.status,
            responseTime: responseTime,
            ip: `${PROXY_HOST}:${PROXY_PORT}`
        });

        if (!response.ok) {
            // Detailliertere Fehlerausgabe
            console.error(`HTTP-Fehler bei Server ${serverId}: Status ${response.status}, Statustext: ${response.statusText}`);
            
            // Bei 401-Fehlern zusätzliche Informationen ausgeben
            if (response.status === 401) {
                console.error('Authentifizierungsfehler: API-Token könnte ungültig oder abgelaufen sein.');
                // Versuchen, den Antworttext zu lesen
                try {
                    const errorText = await response.text();
                    console.error('Fehlerantwort:', errorText);
                } catch (textError) {
                    console.error('Konnte Fehlerantwort nicht lesen:', textError.message);
                }
            }
            
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Debug-Ausgabe für die ersten Server
        if (attemptCount === 0 && Math.random() < 0.1) {
            console.log(`Server ${serverId} Antwort:`, JSON.stringify(data).substring(0, 200) + '...');
        }
        
        // Prüfen, ob die erwartete Datenstruktur vorhanden ist
        if (data && data.Data && typeof data.Data.clients !== 'undefined') {
            if (data.Data.clients >= MIN_PLAYERS) {
                return {
                    id: serverId,
                    name: data.Data.hostname || 'Unbekannt',
                    language: data.Data.vars && data.Data.vars.locale ? data.Data.vars.locale : 'Unbekannt',
                    resources: data.Data.resources || [],
                    players: data.Data.clients || 0
                };
            }
        } else {
            console.log(`Unerwartete Datenstruktur für Server ${serverId}:`, JSON.stringify(data).substring(0, 200) + '...');
        }
        return null; // Server hat zu wenig Spieler oder ungültige Daten
    } catch (error) {
        // Detaillierte Fehlerausgabe
        console.error(`Fehler bei Server ${serverId} (Versuch ${attemptCount + 1}/${RETRY_ATTEMPTS + 1}):`, error.message);
        
        if (attemptCount < RETRY_ATTEMPTS) {
            await delay(RETRY_DELAY);
            return checkServerResources(serverId, attemptCount + 1, logCallback);
        }
        return null; // Nach mehreren Versuchen aufgeben
    }
}

/**
 * Verarbeitet einen Batch von Server-IDs parallel
 * @param {string[]} batch - Array von Server-IDs
 * @param {Function} logCallback - Callback-Funktion für API-Logs
 * @returns {Promise<Array>} - Array von Server-Daten
 */
async function processBatch(batch, logCallback = () => {}) {
    return Promise.all(batch.map(serverId => checkServerResources(serverId, 0, logCallback)));
}

/**
 * Analysiert alle Server und sammelt deren Ressourcen
 * @param {Function} updateCallback - Callback-Funktion für Status-Updates
 * @param {Function} logCallback - Callback-Funktion für API-Logs
 * @returns {Promise<Array>} - Array von Server-Daten mit Ressourcen
 */
export async function analyzeServers(updateCallback = () => {}, logCallback = () => {}) {
    const date = new Date().toISOString().split('T')[0];
    const serverIdsPath = `serverids_${date}.json`;
    
    if (!fs.existsSync(serverIdsPath)) {
        throw new Error(`Keine Server-IDs für heute gefunden (${serverIdsPath})`);
    }
    
    const serverIds = JSON.parse(fs.readFileSync(serverIdsPath));
    updateCallback({ 
        message: `Starte Analyse von ${serverIds.length} Servern...`, 
        type: 'info',
        total: serverIds.length
    });
    
    const results = [];
    let lastSaveTime = Date.now();
    let processedCount = 0;
    
    // Verarbeite Server in Batches
    for (let i = 0; i < serverIds.length; i += BATCH_SIZE) {
        const batch = serverIds.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i/BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(serverIds.length/BATCH_SIZE);
        
        updateCallback({ 
            message: `Verarbeite Batch ${batchNumber}/${totalBatches}...`, 
            type: 'info',
            progress: {
                current: processedCount,
                total: serverIds.length
            }
        });
        
        const batchResults = await processBatch(batch, logCallback);
        const validResults = batchResults.filter(result => result !== null);
        results.push(...validResults);
        processedCount += batch.length;

        // Speichere Ergebnisse regelmäßig oder beim letzten Batch
        const currentTime = Date.now();
        if (currentTime - lastSaveTime > 30000 || i + BATCH_SIZE >= serverIds.length) {
            fs.writeFileSync(
                `server_resources_${date}.json`,
                JSON.stringify(results.sort((a,b) => b.players - a.players), null, 2)
            );
            lastSaveTime = currentTime;
            
            updateCallback({ 
                message: `Zwischenergebnisse gespeichert: ${results.length} Server mit genügend Spielern`, 
                type: 'info',
                progress: {
                    current: processedCount,
                    total: serverIds.length
                },
                validServers: results.length
            });
        }

        // Kleine Pause zwischen Batches
        if (i + BATCH_SIZE < serverIds.length) {
            await delay(500);
        }
    }

    updateCallback({ 
        message: `Analyse abgeschlossen! ${results.length} Server erfolgreich analysiert`, 
        type: 'success',
        validServers: results.length
    });
    
    return results;
}

// Direkter Aufruf, wenn die Datei direkt ausgeführt wird
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    analyzeServers(update => console.log(update.message))
        .then(results => console.log(`Fertig! ${results.length} Server analysiert.`))
        .catch(error => console.error('Fehler bei der Analyse:', error));
}