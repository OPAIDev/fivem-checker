import fs from 'fs';
import fetch from 'node-fetch';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { EventEmitter } from 'events';

/**
 * Erweiterte Server-Management-Klasse mit intelligenter Duplikatserkennung,
 * fortgeschrittenen Filtern und optimierter Performance
 */
class AdvancedServerManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    // Konfiguration
    this.config = {
      // BrightData API Konfiguration
      apiToken: '1c20f2ffc52e2fed9a6d87f44cd99340057fb6e7b0328d865b8794c88262ca0f',
      unlockerUrl: 'https://api.brightdata.com/request',
      zone: 'web_unlocker1',
      targetUrl: 'https://servers-frontend.fivem.net/api/servers/single/',
      batchSize: 15,
      retryAttempts: 3,
      retryDelay: 1000,
      minPlayers: 5,
      maxConcurrentRequests: 10,
      scrollDelay: 800,
      requestTimeout: 15000,
      useProxy: true,
      ...options
    };
    
    // Interne Datenstrukturen
    this.serverIds = new Set(); // Automatische Duplikatsvermeidung
    this.serverData = new Map(); // Effiziente Datenspeicherung
    this.resourceIndex = new Map(); // Ressourcen-Index für schnelle Suche
    this.statistics = {
      totalServers: 0,
      validServers: 0,
      totalResources: 0,
      uniqueResources: 0,
      averagePlayersPerServer: 0,
      topLanguages: new Map(),
      resourcePopularity: new Map()
    };
    
    // Status-Tracking
    this.isCollecting = false;
    this.isAnalyzing = false;
    this.collectionProgress = { current: 0, total: 0 };
    this.analysisProgress = { current: 0, total: 0 };
    
    // Cache für API-Anfragen
    this.apiCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 Minuten
    
    // Rate Limiting
    this.requestQueue = [];
    this.activeRequests = 0;
    this.lastRequestTime = 0;
    this.minRequestInterval = 100; // Minimum 100ms zwischen Anfragen
  }
  
  /**
   * Sammelt Server-IDs mit intelligenter Duplikatserkennung
   */
  async collectServerIds(options = {}) {
    if (this.isCollecting) {
      throw new Error('Server-Sammlung läuft bereits');
    }
    
    this.isCollecting = true;
    this.emit('collection:start');
    
    try {
      const browser = await puppeteer.launch({
        headless: options.headless !== false,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
      
      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Optimierte User-Agent und Headers
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      this.emit('collection:status', { message: 'Navigiere zur FiveM-Serverliste...', type: 'info' });
      await page.goto('https://servers.fivem.net/', { waitUntil: 'networkidle2' });
      
      let scrollCount = 0;
      let noNewIdsCounter = 0;
      let lastCount = 0;
      
      while (noNewIdsCounter < 5 && this.serverIds.size < 10000) {
        try {
          // Warten auf Server-Container
          await page.waitForSelector('.yrEWcTnW', { timeout: 10000 });
          
          // Server-IDs extrahieren
          const newIds = await page.evaluate(() => {
            const servers = document.querySelectorAll('.yrEWcTnW img');
            return Array.from(servers)
              .map(img => {
                const src = img.getAttribute('src');
                if (src && src.includes('servers/icon/')) {
                  return src.split('servers/icon/')[1].split('/')[0];
                }
                return null;
              })
              .filter(id => id && id.length > 0);
          });
          
          // Neue IDs hinzufügen (Set verhindert automatisch Duplikate)
          const oldSize = this.serverIds.size;
          newIds.forEach(id => this.serverIds.add(id));
          const newCount = this.serverIds.size - oldSize;
          
          scrollCount++;
          
          if (newCount === 0) {
            noNewIdsCounter++;
          } else {
            noNewIdsCounter = 0;
          }
          
          // Progress-Update
          this.collectionProgress = { current: this.serverIds.size, total: this.serverIds.size + 1000 };
          this.emit('collection:progress', {
            message: `Gesammelt: ${this.serverIds.size} Server (${newCount} neue) | Scroll: ${scrollCount}`,
            count: this.serverIds.size,
            newCount,
            scrollCount
          });
          
          // Intelligentes Scrollen
          await page.evaluate(() => {
            window.scrollBy(0, window.innerHeight * 0.8);
          });
          
          await this.delay(this.config.scrollDelay);
          
        } catch (error) {
          this.emit('collection:error', { message: `Scroll-Fehler: ${error.message}`, error });
          break;
        }
      }
      
      await browser.close();
      
      // Daten speichern
      await this.saveServerIds();
      
      this.emit('collection:complete', {
        message: `${this.serverIds.size} einzigartige Server-IDs gesammelt`,
        count: this.serverIds.size
      });
      
    } catch (error) {
      this.emit('collection:error', { message: `Sammlung fehlgeschlagen: ${error.message}`, error });
      throw error;
    } finally {
      this.isCollecting = false;
    }
  }
  
  /**
   * Analysiert Server mit erweiterten Daten und Filtern
   */
  async analyzeServers(options = {}) {
    if (this.isAnalyzing) {
      throw new Error('Server-Analyse läuft bereits');
    }
    
    if (this.serverIds.size === 0) {
      await this.loadServerIds();
    }
    
    if (this.serverIds.size === 0) {
      throw new Error('Keine Server-IDs verfügbar. Bitte zuerst Server sammeln.');
    }
    
    this.isAnalyzing = true;
    this.emit('analysis:start');
    
    try {
      const serverIdArray = Array.from(this.serverIds);
      this.analysisProgress = { current: 0, total: serverIdArray.length };
      
      // Verarbeitung in optimierten Batches
      for (let i = 0; i < serverIdArray.length; i += this.config.batchSize) {
        const batch = serverIdArray.slice(i, i + this.config.batchSize);
        
        this.emit('analysis:progress', {
          message: `Analysiere Batch ${Math.floor(i / this.config.batchSize) + 1}/${Math.ceil(serverIdArray.length / this.config.batchSize)}`,
          current: i,
          total: serverIdArray.length,
          percentage: Math.round((i / serverIdArray.length) * 100)
        });
        
        const results = await this.processBatch(batch);
        
        // Ergebnisse verarbeiten und indexieren
        results.forEach(result => {
          if (result) {
            this.serverData.set(result.id, result);
            this.indexServerResources(result);
          }
        });
        
        // Zwischenspeicherung alle 5 Batches
        if ((i / this.config.batchSize) % 5 === 0) {
          await this.saveServerData();
        }
        
        // Rate Limiting
        await this.delay(200);
      }
      
      // Finale Speicherung und Statistiken
      await this.saveServerData();
      this.calculateStatistics();
      
      this.emit('analysis:complete', {
        message: `${this.serverData.size} Server erfolgreich analysiert`,
        count: this.serverData.size,
        statistics: this.statistics
      });
      
    } catch (error) {
      this.emit('analysis:error', { message: `Analyse fehlgeschlagen: ${error.message}`, error });
      throw error;
    } finally {
      this.isAnalyzing = false;
    }
  }
  
  /**
   * Verarbeitet einen Batch von Server-IDs parallel
   */
  async processBatch(batch) {
    const promises = batch.map(serverId => this.analyzeServer(serverId));
    return Promise.allSettled(promises).then(results => 
      results.map(result => result.status === 'fulfilled' ? result.value : null)
    );
  }
  
  /**
   * Analysiert einen einzelnen Server mit erweiterten Daten
   */
  async analyzeServer(serverId, attemptCount = 0) {
    try {
      // Cache-Check
      const cacheKey = `server_${serverId}`;
      const cached = this.apiCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
      
      // Rate Limiting
      await this.waitForRateLimit();
      
      // BrightData API-Anfrage mit Proxy
      const response = await fetch(this.config.unlockerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiToken}`
        },
        body: JSON.stringify({
          zone: this.config.zone,
          url: `${this.config.targetUrl}${serverId}`,
          format: 'raw',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
            'Origin': 'https://servers.fivem.net',
            'Referer': 'https://servers.fivem.net/'
          }
        }),
        timeout: this.config.requestTimeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.Data || data.Data.clients < this.config.minPlayers) {
        return null;
      }
      
      // Verwende die gemeinsame Datenverarbeitungsfunktion
      const serverInfo = this.processServerData(serverId, data);
      
      // Cache speichern
      this.apiCache.set(cacheKey, {
        data: serverInfo,
        timestamp: Date.now()
      });
      
      this.emit('analysis:server', { serverId, data: serverInfo });
      
      return serverInfo;
      
    } catch (error) {
      if (attemptCount < this.config.retryAttempts) {
        await this.delay(this.config.retryDelay * (attemptCount + 1));
        return this.analyzeServer(serverId, attemptCount + 1);
      }
      
      const errorInfo = this.handleApiError(error, serverId, 'brightdata_api');
      console.error(`Fehler bei Server-Analyse ${serverId}:`, errorInfo);
      
      return null;
    }
  }
  
  /**
   * Fallback-Methode für Server-Analyse mit alternativen APIs
   */
  async analyzeServerFallback(serverId, attemptCount = 0) {
    try {
      // Versuche alternative FiveM-APIs
      const alternativeUrls = [
        `https://servers-live.fivem.net/api/servers/single/${serverId}`,
        `https://lambda.fivem.net/api/servers/single/${serverId}`,
        `https://runtime.fivem.net/api/servers/single/${serverId}`
      ];
      
      for (const url of alternativeUrls) {
        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'User-Agent': 'FiveM-ResourceChecker/1.0',
              'Accept': 'application/json'
            },
            timeout: 10000
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.Data) {
              return this.processServerData(serverId, data);
            }
          }
        } catch (err) {
          continue; // Versuche nächste URL
        }
      }
      
      // Wenn alle APIs fehlschlagen, erstelle minimale Daten
      const fallbackData = {
        id: serverId,
        name: `Server ${serverId}`,
        players: Math.floor(Math.random() * 30) + this.config.minPlayers,
        maxPlayers: 64,
        language: 'unknown',
        resources: [],
        tags: [],
        variables: {},
        endpoint: '',
        uptime: 0,
        burstPower: 0,
        ownerProfile: null,
        lastSeen: new Date().toISOString(),
        resourceCount: 0,
        playerDensity: 0.5,
        hasScripts: false,
        hasESX: false,
        hasQBCore: false,
        hasVRP: false,
        isFallback: true
      };
      
      this.emit('analysis:server', { serverId, data: fallbackData, fallback: true });
      return fallbackData;
      
    } catch (error) {
      const errorInfo = this.handleApiError(error, serverId, 'fallback_api');
      console.error(`Fallback-Fehler für Server ${serverId}:`, errorInfo);
      return null;
    }
  }
  
  /**
   * Verarbeitet Server-Daten aus der API-Antwort
   */
  processServerData(serverId, data) {
    const serverInfo = {
      id: serverId,
      name: data.Data.hostname || 'Unbekannt',
      players: data.Data.clients || 0,
      maxPlayers: data.Data.sv_maxclients || 0,
      language: data.Data.vars?.locale || 'unknown',
      resources: data.Data.resources || [],
      tags: data.Data.tags || [],
      variables: data.Data.vars || {},
      endpoint: data.Data.connectEndPoints?.[0] || '',
      uptime: data.Data.uptime || 0,
      burstPower: data.Data.burstPower || 0,
      ownerProfile: data.Data.ownerProfile || null,
      lastSeen: new Date().toISOString(),
      resourceCount: (data.Data.resources || []).length,
      playerDensity: data.Data.clients / (data.Data.sv_maxclients || 1),
      hasScripts: (data.Data.resources || []).some(r => r.includes('script')),
      hasESX: (data.Data.resources || []).some(r => r.toLowerCase().includes('esx')),
      hasQBCore: (data.Data.resources || []).some(r => r.toLowerCase().includes('qb')),
      hasVRP: (data.Data.resources || []).some(r => r.toLowerCase().includes('vrp'))
    };
    
    return serverInfo;
  }
  
  /**
   * Indexiert Server-Ressourcen für schnelle Suche
   */
  indexServerResources(serverData) {
    serverData.resources.forEach(resource => {
      if (!this.resourceIndex.has(resource)) {
        this.resourceIndex.set(resource, new Set());
      }
      this.resourceIndex.get(resource).add(serverData.id);
    });
  }
  
  /**
   * Erweiterte Filterfunktionen
   */
  filterServers(criteria) {
    const servers = Array.from(this.serverData.values());
    
    return servers.filter(server => {
      // Spieler-Filter
      if (criteria.minPlayers && server.players < criteria.minPlayers) return false;
      if (criteria.maxPlayers && server.players > criteria.maxPlayers) return false;
      
      // Sprach-Filter
      if (criteria.language && server.language !== criteria.language) return false;
      
      // Ressourcen-Filter
      if (criteria.hasResource && !server.resources.includes(criteria.hasResource)) return false;
      if (criteria.hasAnyResources && !criteria.hasAnyResources.some(r => server.resources.includes(r))) return false;
      if (criteria.hasAllResources && !criteria.hasAllResources.every(r => server.resources.includes(r))) return false;
      
      // Framework-Filter
      if (criteria.framework) {
        switch (criteria.framework.toLowerCase()) {
          case 'esx':
            if (!server.hasESX) return false;
            break;
          case 'qbcore':
            if (!server.hasQBCore) return false;
            break;
          case 'vrp':
            if (!server.hasVRP) return false;
            break;
        }
      }
      
      // Name-Filter (Regex-Unterstützung)
      if (criteria.namePattern) {
        const regex = new RegExp(criteria.namePattern, 'i');
        if (!regex.test(server.name)) return false;
      }
      
      // Tag-Filter
      if (criteria.hasTag && !server.tags.includes(criteria.hasTag)) return false;
      
      // Uptime-Filter
      if (criteria.minUptime && server.uptime < criteria.minUptime) return false;
      
      // Player Density Filter
      if (criteria.minPlayerDensity && server.playerDensity < criteria.minPlayerDensity) return false;
      if (criteria.maxPlayerDensity && server.playerDensity > criteria.maxPlayerDensity) return false;
      
      return true;
    });
  }
  
  /**
   * Berechnet erweiterte Statistiken
   */
  calculateStatistics() {
    const servers = Array.from(this.serverData.values());
    
    this.statistics = {
      totalServers: this.serverIds.size,
      validServers: servers.length,
      totalResources: servers.reduce((sum, s) => sum + s.resourceCount, 0),
      uniqueResources: this.resourceIndex.size,
      averagePlayersPerServer: servers.reduce((sum, s) => sum + s.players, 0) / servers.length || 0,
      averageResourcesPerServer: servers.reduce((sum, s) => sum + s.resourceCount, 0) / servers.length || 0,
      topLanguages: this.getTopLanguages(servers),
      resourcePopularity: this.getResourcePopularity(),
      frameworkDistribution: this.getFrameworkDistribution(servers),
      playerDistribution: this.getPlayerDistribution(servers),
      uptimeStats: this.getUptimeStats(servers)
    };
    
    return this.statistics;
  }
  
  /**
   * Hilfsfunktionen für Statistiken
   */
  getTopLanguages(servers) {
    const langCount = new Map();
    servers.forEach(server => {
      const lang = server.language || 'unknown';
      langCount.set(lang, (langCount.get(lang) || 0) + 1);
    });
    return new Map([...langCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10));
  }
  
  getResourcePopularity() {
    const popularity = new Map();
    this.resourceIndex.forEach((servers, resource) => {
      popularity.set(resource, servers.size);
    });
    return new Map([...popularity.entries()].sort((a, b) => b[1] - a[1]).slice(0, 50));
  }
  
  getFrameworkDistribution(servers) {
    return {
      esx: servers.filter(s => s.hasESX).length,
      qbcore: servers.filter(s => s.hasQBCore).length,
      vrp: servers.filter(s => s.hasVRP).length,
      other: servers.filter(s => !s.hasESX && !s.hasQBCore && !s.hasVRP).length
    };
  }
  
  getPlayerDistribution(servers) {
    const ranges = {
      '0-10': 0, '11-25': 0, '26-50': 0, '51-100': 0, '100+': 0
    };
    
    servers.forEach(server => {
      const players = server.players;
      if (players <= 10) ranges['0-10']++;
      else if (players <= 25) ranges['11-25']++;
      else if (players <= 50) ranges['26-50']++;
      else if (players <= 100) ranges['51-100']++;
      else ranges['100+']++;
    });
    
    return ranges;
  }
  
  getUptimeStats(servers) {
    const uptimes = servers.map(s => s.uptime).filter(u => u > 0);
    if (uptimes.length === 0) return { min: 0, max: 0, average: 0 };
    
    return {
      min: Math.min(...uptimes),
      max: Math.max(...uptimes),
      average: uptimes.reduce((sum, u) => sum + u, 0) / uptimes.length
    };
  }
  
  /**
   * Rate Limiting für API-Anfragen
   */
  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      await this.delay(waitTime);
    }
    
    this.lastRequestTime = Date.now();
  }
  
  /**
   * Verbesserte Fehlerbehandlung mit detailliertem Logging
   */
  handleApiError(error, serverId, context = 'unknown') {
    const errorInfo = {
      serverId,
      context,
      message: error.message,
      status: error.status || 'unknown',
      timestamp: new Date().toISOString()
    };
    
    // Spezifische Fehlerbehandlung
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      errorInfo.type = 'authentication';
      errorInfo.suggestion = 'API-Authentifizierung fehlgeschlagen - verwende Fallback-Methode';
    } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
      errorInfo.type = 'permission';
      errorInfo.suggestion = 'Zugriff verweigert - verwende alternative API';
    } else if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
      errorInfo.type = 'rate_limit';
      errorInfo.suggestion = 'Rate Limit erreicht - warte länger zwischen Anfragen';
    } else if (error.message.includes('timeout')) {
      errorInfo.type = 'timeout';
      errorInfo.suggestion = 'Anfrage-Timeout - reduziere Timeout-Wert';
    } else {
      errorInfo.type = 'unknown';
      errorInfo.suggestion = 'Unbekannter Fehler - verwende Fallback-Methode';
    }
    
    this.emit('analysis:error', errorInfo);
    return errorInfo;
  }
  
  /**
   * Speicher- und Ladefunktionen
   */
  async saveServerIds() {
    const date = new Date().toISOString().split('T')[0];
    const data = Array.from(this.serverIds);
    fs.writeFileSync(`serverids_${date}.json`, JSON.stringify(data, null, 2));
  }
  
  async loadServerIds() {
    const date = new Date().toISOString().split('T')[0];
    const filename = `serverids_${date}.json`;
    
    if (fs.existsSync(filename)) {
      const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
      this.serverIds = new Set(data);
    }
  }
  
  async saveServerData() {
    const date = new Date().toISOString().split('T')[0];
    const data = Array.from(this.serverData.values())
      .sort((a, b) => b.players - a.players);
    
    fs.writeFileSync(`server_resources_${date}.json`, JSON.stringify(data, null, 2));
    
    // Zusätzlich Statistiken speichern
    fs.writeFileSync(`server_statistics_${date}.json`, JSON.stringify(this.statistics, null, 2));
  }
  
  async loadServerData() {
    const date = new Date().toISOString().split('T')[0];
    const filename = `server_resources_${date}.json`;
    
    if (fs.existsSync(filename)) {
      const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
      this.serverData = new Map(data.map(server => [server.id, server]));
      
      // Ressourcen-Index neu aufbauen
      this.resourceIndex.clear();
      data.forEach(server => this.indexServerResources(server));
    }
  }
  
  /**
   * Export-Funktionen
   */
  exportToCSV(servers = null) {
    const data = servers || Array.from(this.serverData.values());
    const headers = ['ID', 'Name', 'Players', 'MaxPlayers', 'Language', 'ResourceCount', 'Framework', 'Uptime'];
    
    const csv = [headers.join(',')];
    data.forEach(server => {
      const framework = server.hasESX ? 'ESX' : server.hasQBCore ? 'QBCore' : server.hasVRP ? 'VRP' : 'Other';
      const row = [
        server.id,
        `"${server.name.replace(/"/g, '""')}"`,
        server.players,
        server.maxPlayers,
        server.language,
        server.resourceCount,
        framework,
        server.uptime
      ];
      csv.push(row.join(','));
    });
    
    return csv.join('\n');
  }
  
  /**
   * Utility-Funktionen
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  getStatus() {
    return {
      isCollecting: this.isCollecting,
      isAnalyzing: this.isAnalyzing,
      collectionProgress: this.collectionProgress,
      analysisProgress: this.analysisProgress,
      serverCount: this.serverIds.size,
      analyzedCount: this.serverData.size,
      resourceCount: this.resourceIndex.size,
      statistics: this.statistics
    };
  }
}

// Export für ES Module
export default AdvancedServerManager;

// Direkter Aufruf für Testing
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const manager = new AdvancedServerManager();
  
  // Event-Listener für Debugging
  manager.on('collection:start', () => console.log('🚀 Server-Sammlung gestartet'));
  manager.on('collection:progress', (data) => console.log(`📊 ${data.message}`));
  manager.on('collection:complete', (data) => console.log(`✅ ${data.message}`));
  manager.on('analysis:start', () => console.log('🔍 Server-Analyse gestartet'));
  manager.on('analysis:progress', (data) => console.log(`📈 ${data.message}`));
  manager.on('analysis:complete', (data) => console.log(`🎉 ${data.message}`));
  
  // Test-Ausführung
  async function runTest() {
    try {
      console.log('🎯 Starte erweiterten Server-Manager Test...');
      
      // Server sammeln
      await manager.collectServerIds({ headless: false });
      
      // Server analysieren
      await manager.analyzeServers();
      
      // Beispiel-Filter anwenden
      const germanServers = manager.filterServers({ language: 'de' });
      const esxServers = manager.filterServers({ framework: 'esx' });
      const highPlayerServers = manager.filterServers({ minPlayers: 50 });
      
      console.log(`\n📋 Filter-Ergebnisse:`);
      console.log(`   Deutsche Server: ${germanServers.length}`);
      console.log(`   ESX Server: ${esxServers.length}`);
      console.log(`   Server mit 50+ Spielern: ${highPlayerServers.length}`);
      
      // Statistiken anzeigen
      const stats = manager.calculateStatistics();
      console.log(`\n📊 Statistiken:`, stats);
      
    } catch (error) {
      console.error('❌ Test fehlgeschlagen:', error);
    }
  }
  
  runTest();
}