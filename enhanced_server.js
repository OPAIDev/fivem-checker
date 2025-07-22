import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import AdvancedServerManager from './advanced_server_manager.js';

// ES Module Kompatibilität
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Express App initialisieren
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Server Manager Instanz
const serverManager = new AdvancedServerManager({
  minPlayers: 5,
  batchSize: 20,
  maxConcurrentRequests: 25
});

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// Hauptroute
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'enhanced_dashboard.html'));
});

// API-Endpunkte

// Status-Endpunkt
app.get('/api/status', (req, res) => {
  res.json(serverManager.getStatus());
});

// Server-Daten abrufen
app.get('/api/servers', (req, res) => {
  try {
    const servers = Array.from(serverManager.serverData.values());
    res.json({
      success: true,
      data: servers,
      count: servers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Gefilterte Server abrufen
app.post('/api/servers/filter', (req, res) => {
  try {
    const criteria = req.body;
    const filteredServers = serverManager.filterServers(criteria);
    
    res.json({
      success: true,
      data: filteredServers,
      count: filteredServers.length,
      criteria
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Statistiken abrufen
app.get('/api/statistics', (req, res) => {
  try {
    const stats = serverManager.calculateStatistics();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Ressourcen-Index abrufen
app.get('/api/resources', (req, res) => {
  try {
    const resources = Array.from(serverManager.resourceIndex.entries())
      .map(([resource, servers]) => ({
        name: resource,
        serverCount: servers.size,
        servers: Array.from(servers)
      }))
      .sort((a, b) => b.serverCount - a.serverCount);
    
    res.json({
      success: true,
      data: resources,
      count: resources.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Server-Details abrufen
app.get('/api/servers/:id', (req, res) => {
  try {
    const serverId = req.params.id;
    const server = serverManager.serverData.get(serverId);
    
    if (!server) {
      return res.status(404).json({
        success: false,
        error: 'Server nicht gefunden'
      });
    }
    
    res.json({
      success: true,
      data: server
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// CSV-Export
app.post('/api/export/csv', (req, res) => {
  try {
    const criteria = req.body.criteria || {};
    const servers = criteria && Object.keys(criteria).length > 0 
      ? serverManager.filterServers(criteria)
      : Array.from(serverManager.serverData.values());
    
    const csv = serverManager.exportToCSV(servers);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="fivem_servers_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Erweiterte Suchfunktion
app.post('/api/search', (req, res) => {
  try {
    const { query, type = 'all' } = req.body;
    const results = {
      servers: [],
      resources: []
    };
    
    if (type === 'all' || type === 'servers') {
      const servers = Array.from(serverManager.serverData.values());
      results.servers = servers.filter(server => 
        server.name.toLowerCase().includes(query.toLowerCase()) ||
        server.id.includes(query) ||
        server.language.toLowerCase().includes(query.toLowerCase()) ||
        server.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }
    
    if (type === 'all' || type === 'resources') {
      results.resources = Array.from(serverManager.resourceIndex.keys())
        .filter(resource => resource.toLowerCase().includes(query.toLowerCase()))
        .map(resource => ({
          name: resource,
          serverCount: serverManager.resourceIndex.get(resource).size
        }));
    }
    
    res.json({
      success: true,
      data: results,
      query
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Socket.io Verbindungshandling
io.on('connection', (socket) => {
  console.log(`🔗 Neuer Client verbunden: ${socket.id}`);
  
  // Aktuellen Status senden
  socket.emit('status', serverManager.getStatus());
  
  // Server-IDs sammeln
  socket.on('collect-servers', async (options = {}) => {
    try {
      console.log('🚀 Starte Server-Sammlung...');
      
      // Event-Listener für Updates
      const listeners = {
        'collection:start': () => socket.emit('collection:start'),
        'collection:progress': (data) => socket.emit('collection:progress', data),
        'collection:complete': (data) => socket.emit('collection:complete', data),
        'collection:error': (data) => socket.emit('collection:error', data)
      };
      
      // Listener registrieren
      Object.entries(listeners).forEach(([event, handler]) => {
        serverManager.on(event, handler);
      });
      
      await serverManager.collectServerIds(options);
      
      // Listener entfernen
      Object.entries(listeners).forEach(([event, handler]) => {
        serverManager.removeListener(event, handler);
      });
      
    } catch (error) {
      console.error('❌ Server-Sammlung fehlgeschlagen:', error);
      socket.emit('collection:error', { message: error.message, error });
    }
  });
  
  // Server-Ressourcen analysieren
  socket.on('analyze-resources', async (options = {}) => {
    try {
      console.log('🔍 Starte Server-Analyse...');
      
      // Event-Listener für Updates
      const listeners = {
        'analysis:start': () => socket.emit('analysis:start'),
        'analysis:progress': (data) => socket.emit('analysis:progress', data),
        'analysis:server': (data) => socket.emit('analysis:server', data),
        'analysis:complete': (data) => socket.emit('analysis:complete', data),
        'analysis:error': (data) => socket.emit('analysis:error', data)
      };
      
      // Listener registrieren
      Object.entries(listeners).forEach(([event, handler]) => {
        serverManager.on(event, handler);
      });
      
      await serverManager.analyzeServers(options);
      
      // Listener entfernen
      Object.entries(listeners).forEach(([event, handler]) => {
        serverManager.removeListener(event, handler);
      });
      
    } catch (error) {
      console.error('❌ Server-Analyse fehlgeschlagen:', error);
      socket.emit('analysis:error', { message: error.message, error });
    }
  });
  
  // Filter anwenden
  socket.on('apply-filter', (criteria) => {
    try {
      const filteredServers = serverManager.filterServers(criteria);
      socket.emit('filter:result', {
        servers: filteredServers,
        count: filteredServers.length,
        criteria
      });
    } catch (error) {
      socket.emit('filter:error', { message: error.message, error });
    }
  });
  
  // Statistiken anfordern
  socket.on('get-statistics', () => {
    try {
      const stats = serverManager.calculateStatistics();
      socket.emit('statistics:update', stats);
    } catch (error) {
      socket.emit('statistics:error', { message: error.message, error });
    }
  });
  
  // Daten laden beim Start
  socket.on('load-data', async () => {
    try {
      await serverManager.loadServerIds();
      await serverManager.loadServerData();
      
      socket.emit('data:loaded', {
        serverIds: serverManager.serverIds.size,
        serverData: serverManager.serverData.size,
        resources: serverManager.resourceIndex.size
      });
      
      // Status aktualisieren
      socket.emit('status', serverManager.getStatus());
    } catch (error) {
      socket.emit('data:error', { message: error.message, error });
    }
  });
  
  // Disconnect-Handler
  socket.on('disconnect', () => {
    console.log(`🔌 Client getrennt: ${socket.id}`);
  });
});

// Fehlerbehandlung
app.use((err, req, res, next) => {
  console.error('🚨 Server-Fehler:', err);
  res.status(500).json({
    success: false,
    error: 'Interner Server-Fehler',
    message: err.message
  });
});

// 404-Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpunkt nicht gefunden'
  });
});

// Graceful Shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Server wird heruntergefahren...');
  httpServer.close(() => {
    console.log('✅ Server erfolgreich beendet');
    process.exit(0);
  });
});

// Server starten
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Enhanced FiveM Resource Checker Server läuft auf Port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔧 API: http://localhost:${PORT}/api`);
  
  // Daten beim Start laden
  serverManager.loadServerIds().catch(console.error);
  serverManager.loadServerData().catch(console.error);
});

export default app;