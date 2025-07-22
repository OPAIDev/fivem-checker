import fs from 'fs';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';

/**
 * Sammelt Server-IDs von der FiveM-Serverliste
 * @param {Function} updateCallback - Callback-Funktion für Status-Updates
 * @returns {Promise<string[]>} - Liste der gesammelten Server-IDs
 */
export async function collectServerIds(updateCallback = () => {}) {
  // Browser starten
  updateCallback({ message: 'Starte Browser...', type: 'info' });
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  // Viewport auf 900x600 setzen
  await page.setViewport({ width: 900, height: 600 });
  
  // Zur FiveM Server Liste navigieren
  updateCallback({ message: 'Navigiere zur FiveM-Serverliste...', type: 'info' });
  await page.goto('https://servers.fivem.net/');
  
  // Array für Server IDs
  let serverIds = [];
  let scrollCount = 0;
  let lastUpdateCount = 0;
  let isComplete = false;
  let noNewIdsCounter = 0;
  
  // Warten bis Server geladen sind
  await page.waitForSelector('.yrEWcTnW');
  updateCallback({ message: 'Server-Liste geladen, beginne mit dem Sammeln...', type: 'info' });
  
  // Sammle IDs bis genug Server gefunden wurden oder keine neuen mehr kommen
  while (!isComplete) {
    try {
      // Server IDs aus den img src URLs extrahieren
      const newIds = await page.evaluate(() => {
        const servers = document.querySelectorAll('.yrEWcTnW img');
        return Array.from(servers).map(img => {
          const src = img.getAttribute('src');
          if (src && src.includes('servers/icon/')) {
            return src.split('servers/icon/')[1].split('/')[0];
          }
          return null;
        }).filter(id => id !== null);
      });
      
      // Neue IDs hinzufügen
      const oldLength = serverIds.length;
      serverIds = [...new Set([...serverIds, ...newIds])];
      scrollCount++;
      
      // Prüfen, ob neue IDs gefunden wurden
      if (serverIds.length === oldLength) {
        noNewIdsCounter++;
      } else {
        noNewIdsCounter = 0;
      }
      
      // Status-Update senden, aber nicht zu oft
      if (serverIds.length - lastUpdateCount >= 50 || noNewIdsCounter >= 3) {
        updateCallback({ 
          message: `Gesammelte IDs: ${serverIds.length} | Scrolls: ${scrollCount}`, 
          type: 'info',
          count: serverIds.length
        });
        lastUpdateCount = serverIds.length;
      }
      
      // Nach unten scrollen
      await page.evaluate(() => {
        window.scrollBy(0, 1600);
      });
      
      // Kurz warten damit neue Server laden können
      await new Promise(r => setTimeout(r, 1000));
      
      // Beenden, wenn genug Server gefunden wurden oder keine neuen mehr kommen
      if (serverIds.length > 5000 || noNewIdsCounter >= 5) {
        isComplete = true;
      }
      
    } catch (error) {
      updateCallback({ message: `Fehler beim Sammeln der IDs: ${error.message}`, type: 'error' });
      break;
    }
  }
  
  // Browser schließen
  await browser.close();
  updateCallback({ message: 'Browser geschlossen', type: 'info' });
  
  // Duplikate entfernen (zur Sicherheit)
  const uniqueIds = [...new Set(serverIds)];
  
  // Mit Datum in Datei speichern
  const date = new Date().toISOString().split('T')[0];
  fs.writeFileSync(`serverids_${date}.json`, JSON.stringify(uniqueIds, null, 2));
  
  updateCallback({ 
    message: `${uniqueIds.length} einzigartige Server IDs wurden gespeichert`, 
    type: 'success',
    count: uniqueIds.length
  });
  
  return uniqueIds;
}

// Direkter Aufruf, wenn die Datei direkt ausgeführt wird
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Server Collector gestartet - Browser wird geöffnet...');
  collectServerIds(update => console.log(update.message))
    .then(ids => console.log(`Fertig! ${ids.length} Server-IDs gesammelt.`))
    .catch(error => console.error('Unerwarteter Fehler:', error));
}