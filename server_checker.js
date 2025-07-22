import fs from 'fs';
import puppeteer from 'puppeteer';

async function getServerIds() {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  
  // Viewport auf 900x600 setzen wie vorgegeben
  await page.setViewport({width: 900, height: 600});
  
  // Zur FiveM Server Liste navigieren
  await page.goto('https://servers.fivem.net/');
  
  // Array für Server IDs
  let serverIds = [];
  let isRunning = true;
  let scrollCount = 0;
  
  // Event Listener für Browser-Schließung
  browser.on('disconnected', () => {
    isRunning = false;
    // Duplikate entfernen
    const uniqueIds = [...new Set(serverIds)];
    
    // Mit Datum in Datei speichern
    const date = new Date().toISOString().split('T')[0];
    fs.writeFileSync(`serverids_${date}.json`, JSON.stringify(uniqueIds, null, 2));
    
    console.log('\nBrowser wurde geschlossen');
    console.log(`${uniqueIds.length} einzigartige Server IDs wurden gespeichert`);
  });
  
  // Endlos-Schleife zum Sammeln der IDs
  while(isRunning) {
    try {
      // Warten bis Server geladen sind
      await page.waitForSelector('.yrEWcTnW');
      
      // Server IDs aus den img src URLs extrahieren
      const newIds = await page.evaluate(() => {
        const servers = document.querySelectorAll('.yrEWcTnW img');
        return Array.from(servers).map(img => {
          const src = img.getAttribute('src');
          if(src && src.includes('servers/icon/')) {
            return src.split('servers/icon/')[1].split('/')[0];
          }
          return null;
        }).filter(id => id !== null);
      });
      
      serverIds = [...serverIds, ...newIds];
      scrollCount++;
      
      // Status-Update im Terminal
      process.stdout.write(`\rGesammelte IDs: ${serverIds.length} | Scrolls: ${scrollCount}`);
      
      // Nach unten scrollen
      await page.evaluate(() => {
        window.scrollBy(0, 1600);
      });
      
      // Kurz warten damit neue Server laden können
      await new Promise(r => setTimeout(r, 1000));
      
    } catch(error) {
      if(!isRunning) break; // Browser wurde geschlossen
      console.error('\nFehler beim Sammeln der IDs:', error);
      break;
    }
  }
}

// Script ausführen
console.log('Server Checker gestartet - Browser wird geöffnet...');
console.log('Sammle kontinuierlich Server IDs. Schließe den Browser um die IDs zu speichern.\n');

getServerIds().catch(error => {
  console.error('Unerwarteter Fehler:', error);
});
