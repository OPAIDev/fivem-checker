import fetch from 'node-fetch';
import fs from 'fs';

const date = new Date().toISOString().split('T')[0];
const API_TOKEN = '75d3aa33e817cbd532c8410f5ec447661f59f12b833479e747ef6607ff80104f';
const UNLOCKER_URL = 'https://api.brightdata.com/request';
const BATCH_SIZE = 10; // Parallele Anfragen
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;

const serverIds = JSON.parse(fs.readFileSync(`serverids_${date}.json`));

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkServerResources(serverId, attemptCount = 0) {
    try {
        const response = await fetch(UNLOCKER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_TOKEN}`
            },
            body: JSON.stringify({
                zone: 'gamblingfivem',
                url: `https://servers-frontend.fivem.net/api/servers/single/${serverId}`,
                format: 'raw',
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "accept": "application/json, text/plain, */*",
                    "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
                    "Origin": "https://servers.fivem.net",
                    "Referer": "https://servers.fivem.net/"
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.Data.clients >= 20) {
            return {
                id: serverId,
                name: data.Data.hostname,
                language: data.Data.vars.locale,
                resources: data.Data.resources || [],
                players: data.Data.clients || 0
            };
        }
        console.error(`Low Players for ${data.Data.hostname} ${data.Data.clients} Players`);
        return null;
    } catch (error) {
        if (attemptCount < RETRY_ATTEMPTS) {
            console.error(`Fehler bei Server ${serverId}, Versuch ${attemptCount + 1}/${RETRY_ATTEMPTS}: ${error.message}`);
            await delay(RETRY_DELAY);
            return checkServerResources(serverId, attemptCount + 1);
        }
        console.error(`Endgültiger Fehler bei Server ${serverId}:`, error.message);
        return null;
    }
}

async function processBatch(batch) {
    return Promise.all(batch.map(serverId => checkServerResources(serverId)));
}

async function analyzeServers() {
    console.log(`Starte Turbo-Analyse von ${serverIds.length} Servern...`);
    
    const results = [];
    let lastSaveTime = Date.now();
    
    // Verarbeite Server in Batches
    for (let i = 0; i < serverIds.length; i += BATCH_SIZE) {
        const batch = serverIds.slice(i, i + BATCH_SIZE);
        console.log(`Verarbeite Batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(serverIds.length/BATCH_SIZE)}...`);
        
        const batchResults = await processBatch(batch);
        const validResults = batchResults.filter(result => result !== null);
        results.push(...validResults);

        // Speichere Ergebnisse nur alle 30 Sekunden oder beim letzten Batch
        const currentTime = Date.now();
        if (currentTime - lastSaveTime > 30000 || i + BATCH_SIZE >= serverIds.length) {
            fs.writeFileSync(
                `server_resources_${date}.json`,
                JSON.stringify(results.sort((a,b) => b.players - a.players), null, 2)
            );
            lastSaveTime = currentTime;
            console.log(`Zwischenergebnisse gespeichert: ${results.length} Server`);
        }

        // Kleine Pause zwischen Batches
        if (i + BATCH_SIZE < serverIds.length) {
            await delay(500);
        }
    }

    console.log('Turbo-Analyse abgeschlossen!');
    console.log(`${results.length} Server erfolgreich analysiert`);
}

analyzeServers().catch(console.error);
