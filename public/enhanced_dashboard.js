// Enhanced Dashboard JavaScript - Static Version
class EnhancedDashboard {
  constructor() {
    // Removed socket.io for static hosting
    this.currentSection = 'dashboard';
    this.serverData = [];
    this.filteredServerData = [];
    this.resourceData = [];
    this.statistics = {};
    this.currentPage = 1;
    this.itemsPerPage = 20;
    this.sortColumn = 'players';
    this.sortDirection = 'desc';
    this.activeFilters = {};
    this.charts = {};
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.setupSocketListeners();
    this.loadInitialData();
    this.initializeCharts();
  }
  
  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        this.switchSection(section);
      });
    });
    
    // Action buttons
    document.getElementById('collect-servers-btn').addEventListener('click', () => {
      this.startServerCollection();
    });
    
    document.getElementById('analyze-resources-btn').addEventListener('click', () => {
      this.startResourceAnalysis();
    });
    
    // Search
    document.getElementById('global-search').addEventListener('input', (e) => {
      this.performGlobalSearch(e.target.value);
    });
    
    // Resource search
    const resourceSearch = document.getElementById('resource-search');
    if (resourceSearch) {
      resourceSearch.addEventListener('input', (e) => {
        this.filterResources(e.target.value);
      });
    }
    
    // Filters
    document.getElementById('apply-advanced-filters').addEventListener('click', () => {
      this.applyAdvancedFilters();
    });
    
    document.getElementById('clear-advanced-filters').addEventListener('click', () => {
      this.clearAdvancedFilters();
    });
    
    // Filter presets
    document.querySelectorAll('[data-preset]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const preset = e.target.dataset.preset;
        this.applyFilterPreset(preset);
      });
    });
    
    // Quick filters
    document.getElementById('framework-filter').addEventListener('change', (e) => {
      if (e.target.value) {
        this.activeFilters.framework = e.target.value;
      } else {
        delete this.activeFilters.framework;
      }
      this.applyLocalFilters();
    });
    
    document.getElementById('language-filter').addEventListener('change', (e) => {
      if (e.target.value) {
        this.activeFilters.language = e.target.value;
      } else {
        delete this.activeFilters.language;
      }
      this.applyLocalFilters();
    });
    
    // Export
    document.getElementById('export-servers').addEventListener('click', () => {
      this.exportServers();
    });
    
    // Table sorting
    document.querySelectorAll('[data-sort]').forEach(header => {
      header.addEventListener('click', () => {
        const column = header.dataset.sort;
        this.sortTable(column);
      });
    });
    
    // Pagination
    document.getElementById('prev-page').addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.updateServerTable();
      }
    });
    
    document.getElementById('next-page').addEventListener('click', () => {
      const totalPages = Math.ceil(this.filteredServerData.length / this.itemsPerPage);
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.updateServerTable();
      }
    });
    
    // Modal controls
    document.getElementById('close-progress-modal').addEventListener('click', () => {
      this.hideProgressModal();
    });
    
    document.getElementById('close-server-modal').addEventListener('click', () => {
      this.hideServerModal();
    });
    
    // Filter presets
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset;
        this.applyFilterPreset(preset);
      });
    });
    
    // Activity feed
    document.getElementById('clear-activity').addEventListener('click', () => {
      this.clearActivityFeed();
    });
    
    // Resource search
    document.getElementById('resource-search').addEventListener('input', (e) => {
      this.filterResources(e.target.value);
    });
    
    // Refresh buttons
    document.getElementById('refresh-servers').addEventListener('click', () => {
      this.refreshServerData();
    });
    
    document.getElementById('refresh-framework-chart').addEventListener('click', () => {
      this.updateFrameworkChart();
    });
    
    document.getElementById('refresh-player-chart').addEventListener('click', () => {
      this.updatePlayerChart();
    });
  }
  
  // Static version - no socket listeners needed
  setupSocketListeners() {
    // Removed for static hosting
    this.updateConnectionStatus(true);
    this.addActivity('Statische Daten geladen', 'success');
  }
  
  switchSection(section) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // Update content
    document.querySelectorAll('.content-section').forEach(sec => {
      sec.classList.remove('active');
    });
    document.getElementById(`${section}-section`).classList.add('active');
    
    // Update header
    const titles = {
      dashboard: { title: 'Dashboard', subtitle: 'Übersicht über alle FiveM-Server und Ressourcen' },
      servers: { title: 'Server-Übersicht', subtitle: 'Detaillierte Server-Informationen und Filter' },
      resources: { title: 'Ressourcen-Analyse', subtitle: 'Analyse der verwendeten Server-Ressourcen' },
      analytics: { title: 'Erweiterte Analytics', subtitle: 'Detaillierte Statistiken und Trends' },
      filters: { title: 'Erweiterte Filter', subtitle: 'Komplexe Filterkriterien erstellen' }
    };
    
    const titleInfo = titles[section] || titles.dashboard;
    document.getElementById('page-title').textContent = titleInfo.title;
    document.getElementById('page-subtitle').textContent = titleInfo.subtitle;
    
    this.currentSection = section;
    
    // Load section-specific data
    if (section === 'servers' && this.serverData.length === 0) {
      this.loadServerData();
    } else if (section === 'resources' && this.resourceData.length === 0) {
      this.loadResourceData();
    }
  }
  
  startServerCollection() {
    this.addActivity('Server-Sammlung nicht verfügbar in statischer Version', 'warning');
  }
  
  startResourceAnalysis() {
    this.addActivity('Ressourcen-Analyse wird gestartet...', 'info');
    
    // Simulate analysis with existing data
    setTimeout(() => {
      if (this.resourceData && this.resourceData.length > 0) {
        this.addActivity(`Analyse abgeschlossen: ${this.resourceData.length} Ressourcen analysiert`, 'success');
        
        // Update resource statistics
        const topResources = this.resourceData
          .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
          .slice(0, 5);
          
        this.addActivity(`Top 5 Ressourcen: ${topResources.map(r => r.name).join(', ')}`, 'info');
      } else {
        this.addActivity('Keine Ressourcen-Daten verfügbar', 'warning');
      }
    }, 1000);
  }
  
  async loadInitialData() {
    try {
      this.addActivity('Lade statische Daten...', 'info');
      await this.loadServerData();
      await this.loadResourceData();
      this.updateStatistics();
      this.addActivity('Statische Daten erfolgreich geladen', 'success');
    } catch (error) {
      console.error('Error loading static data:', error);
      this.addActivity('Fehler beim Laden der statischen Daten', 'error');
    }
  }
  
  async loadServerData() {
    try {
      const response = await fetch('./data/servers.json');
      const data = await response.json();
      
      this.serverData = data;
      this.filteredServerData = [...this.serverData];
      this.currentPage = 1;
      this.updateServerTable();
      document.getElementById('active-servers').textContent = data.length;
    } catch (error) {
      console.error('Fehler beim Laden der Server-Daten:', error);
      this.addActivity('Fehler beim Laden der Server-Daten', 'error');
    }
  }
  
  async loadResourceData() {
    try {
      const response = await fetch('./data/resources.json');
      const data = await response.json();
      
      this.resourceData = data;
      this.updateResourcesGrid();
      document.getElementById('total-resources').textContent = data.length;
    } catch (error) {
      console.error('Fehler beim Laden der Ressourcen-Daten:', error);
      this.addActivity('Fehler beim Laden der Ressourcen-Daten', 'error');
    }
  }
  
  updateServerTable() {
    const tbody = document.getElementById('servers-tbody');
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pageData = this.filteredServerData.slice(startIndex, endIndex);
    
    // Optimierte DOM-Manipulation: Erstelle ein DocumentFragment
    const fragment = document.createDocumentFragment();
    
    pageData.forEach(server => {
      const row = this.createServerRow(server);
      fragment.appendChild(row);
    });
    
    // Leere den Tabellenkörper und füge alle Zeilen auf einmal hinzu
    tbody.innerHTML = '';
    tbody.appendChild(fragment);
    
    this.updatePagination();
    document.getElementById('filtered-server-count').textContent = `${this.filteredServerData.length} Server`;
  }
  
  createServerRow(server) {
    const row = document.createElement('tr');
    
    const framework = this.getServerFramework(server);
    const languageFlag = this.getLanguageFlag(server.language);
    
    row.innerHTML = `
      <td>
        <div class="server-name">
          <strong>${this.escapeHtml(server.name)}</strong>
          <small>${server.id}</small>
        </div>
      </td>
      <td>
        <span class="player-count">${server.players}/${server.maxPlayers}</span>
        <div class="player-bar">
          <div class="player-fill" style="width: ${(server.players / server.maxPlayers) * 100}%"></div>
        </div>
      </td>
      <td>
        <span class="language-flag">
          ${languageFlag} ${server.language.toUpperCase()}
        </span>
      </td>
      <td>
        <span class="resource-count">${server.resourceCount || 0}</span>
      </td>
      <td>
        <span class="framework-badge ${framework.toLowerCase()}">${framework}</span>
      </td>
      <td>
        <button class="action-btn" onclick="dashboard.showServerDetails('${server.id}')">
          <i class="fas fa-eye"></i> Details
        </button>
      </td>
    `;
    
    return row;
  }
  
  updateResourcesGrid() {
    const grid = document.getElementById('resources-grid');
    
    // Optimierte DOM-Manipulation: Erstelle ein DocumentFragment
    const fragment = document.createDocumentFragment();
    
    // Begrenze die Anzahl der angezeigten Ressourcen auf 100, um Performance zu verbessern
    const limitedData = this.resourceData.slice(0, 100);
    
    limitedData.forEach(resource => {
      const card = this.createResourceCard(resource);
      fragment.appendChild(card);
    });
    
    // Leere das Grid und füge alle Karten auf einmal hinzu
    grid.innerHTML = '';
    grid.appendChild(fragment);
    
    document.getElementById('total-resource-count').textContent = 
      `${this.resourceData.length} Ressourcen${this.resourceData.length > 100 ? ' (100 angezeigt)' : ''}`;
  }
  
  createResourceCard(resource) {
    const card = document.createElement('div');
    card.className = 'resource-card';
    card.onclick = () => this.showResourceDetails(resource);
    
    const usageCount = resource.usageCount || resource.serverCount || 0;
    
    card.innerHTML = `
      <h3>
        <i class="fas fa-code"></i>
        ${this.escapeHtml(resource.name)}
      </h3>
      <div class="resource-stats">
        <span>Verwendet von:</span>
        <span class="server-count-badge">${usageCount} Server</span>
      </div>
      <div class="resource-category">
        <span class="category-badge ${resource.category.toLowerCase()}">${resource.category}</span>
      </div>
    `;
    
    return card;
  }
  

  
  applyAdvancedFilters() {
    const filters = {
      minPlayers: parseInt(document.getElementById('adv-min-players').value) || undefined,
      maxPlayers: parseInt(document.getElementById('adv-max-players').value) || undefined,
      namePattern: document.getElementById('adv-name-pattern').value || undefined,
      minUptime: parseInt(document.getElementById('adv-min-uptime').value) * 3600 || undefined
    };
    
    // Handle resource filters
    const hasAllResources = document.getElementById('adv-has-all-resources').value;
    if (hasAllResources) {
      filters.hasAllResources = hasAllResources.split(',').map(r => r.trim()).filter(r => r);
    }
    
    const hasAnyResources = document.getElementById('adv-has-any-resources').value;
    if (hasAnyResources) {
      filters.hasAnyResources = hasAnyResources.split(',').map(r => r.trim()).filter(r => r);
    }
    
    // Remove undefined filters but keep zero values
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined || (Array.isArray(filters[key]) && filters[key].length === 0)) {
        delete filters[key];
      }
    });
    
    this.activeFilters = { ...this.activeFilters, ...filters };
    this.applyLocalFilters();
    this.addActivity('Erweiterte Filter werden angewendet...', 'info');
  }
  
  applyFilterPreset(preset) {
    // Clear existing filters first
    this.clearAdvancedFilters();
    
    const presets = {
      'german-rp': {
        namePattern: 'RP|Roleplay|Leben',
        minPlayers: 10
      },
      'high-pop': {
        minPlayers: 50
      },
      'esx-servers': {
        hasResource: 'esx'
      },
      'new-servers': {
        minPlayers: 5
      }
    };
    
    const filterConfig = presets[preset];
    if (filterConfig) {
      // Apply filter configuration to advanced filters
      if (filterConfig.namePattern) {
        document.getElementById('adv-name-pattern').value = filterConfig.namePattern;
      }
      if (filterConfig.minPlayers) {
        document.getElementById('adv-min-players').value = filterConfig.minPlayers;
      }
      if (filterConfig.hasResource) {
        document.getElementById('adv-has-any-resources').value = filterConfig.hasResource;
      }
      
      // Apply the advanced filters
      this.applyAdvancedFilters();
      this.addActivity(`Filter-Preset "${preset}" angewendet`, 'info');
    }
  }
  
  applyLocalFilters() {
    if (!this.serverData || this.serverData.length === 0) {
      this.filteredServerData = [];
      this.updateServerTable();
      return;
    }

    this.filteredServerData = this.serverData.filter(server => {
      // Min/Max Players Filter
      if (this.activeFilters.minPlayers && server.players < this.activeFilters.minPlayers) {
        return false;
      }
      if (this.activeFilters.maxPlayers && server.players > this.activeFilters.maxPlayers) {
        return false;
      }

      // Name Pattern Filter
      if (this.activeFilters.namePattern) {
        const pattern = new RegExp(this.activeFilters.namePattern, 'i');
        if (!pattern.test(server.name)) {
          return false;
        }
      }

      // Resource Filters
      if (this.activeFilters.hasAllResources && this.activeFilters.hasAllResources.length > 0) {
        const hasAll = this.activeFilters.hasAllResources.every(resource => 
          server.resources && server.resources.includes(resource)
        );
        if (!hasAll) return false;
      }

      if (this.activeFilters.hasAnyResources && this.activeFilters.hasAnyResources.length > 0) {
        const hasAny = this.activeFilters.hasAnyResources.some(resource => 
          server.resources && server.resources.includes(resource)
        );
        if (!hasAny) return false;
      }

      // Framework Filter
      if (this.activeFilters.framework) {
        const serverFramework = this.getServerFramework(server).toLowerCase();
        if (serverFramework !== this.activeFilters.framework.toLowerCase()) {
          return false;
        }
      }

      // Language Filter
      if (this.activeFilters.language) {
        if (server.language !== this.activeFilters.language) {
          return false;
        }
      }

      return true;
    });

    this.currentPage = 1; // Reset to first page
    this.updateServerTable();
  }

  clearBasicFilters() {
    this.activeFilters = {};
    this.applyLocalFilters();
    this.filteredServerData = [...this.serverData];
    this.currentPage = 1;
    this.updateServerTable();
  }
  
  clearAdvancedFilters() {
    document.getElementById('adv-min-players').value = '';
    document.getElementById('adv-max-players').value = '';
    document.getElementById('adv-name-pattern').value = '';
    document.getElementById('adv-min-uptime').value = '';
    document.getElementById('adv-has-all-resources').value = '';
    document.getElementById('adv-has-any-resources').value = '';
    
    this.clearBasicFilters();
  }
  
  sortTable(column) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'desc';
    }
    
    this.filteredServerData.sort((a, b) => {
      let aVal = a[column];
      let bVal = b[column];
      
      if (column === 'framework') {
        aVal = this.getServerFramework(a);
        bVal = this.getServerFramework(b);
      }
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (this.sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    this.currentPage = 1;
    this.updateServerTable();
    this.updateSortIndicators();
  }
  
  updateSortIndicators() {
    document.querySelectorAll('[data-sort] i').forEach(icon => {
      icon.className = 'fas fa-sort';
    });
    
    const activeHeader = document.querySelector(`[data-sort="${this.sortColumn}"] i`);
    if (activeHeader) {
      activeHeader.className = `fas fa-sort-${this.sortDirection === 'asc' ? 'up' : 'down'}`;
    }
  }
  
  updatePagination() {
    const totalPages = Math.ceil(this.filteredServerData.length / this.itemsPerPage);
    const paginationInfo = document.getElementById('pagination-info');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const paginationNumbers = document.getElementById('pagination-numbers');
    
    // Aktualisiere Paginierungsinformationen
    const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endItem = Math.min(startItem + this.itemsPerPage - 1, this.filteredServerData.length);
    
    if (this.filteredServerData.length === 0) {
      paginationInfo.textContent = 'Keine Server gefunden';
    } else {
      paginationInfo.textContent = `Zeige ${startItem}-${endItem} von ${this.filteredServerData.length} Servern`;
    }
    
    // Aktiviere/Deaktiviere Vor- und Zurück-Buttons
    prevButton.disabled = this.currentPage === 1;
    nextButton.disabled = this.currentPage === totalPages || totalPages === 0;
    
    // Optimierte Erstellung der Seitenzahlen
    // Verwende DocumentFragment für bessere Performance
    const fragment = document.createDocumentFragment();
    
    // Begrenze die Anzahl der angezeigten Seitenzahlen
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Passe startPage an, wenn endPage am Maximum ist
    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Erstelle Seitenzahlen
    for (let i = startPage; i <= endPage; i++) {
      const pageButton = document.createElement('button');
      pageButton.textContent = i;
      pageButton.classList.add('page-number');
      if (i === this.currentPage) {
        pageButton.classList.add('active');
      }
      
      pageButton.addEventListener('click', () => {
        this.currentPage = i;
        this.updateServerTable();
      });
      
      fragment.appendChild(pageButton);
    }
    
    // Füge alle Seitenzahlen auf einmal hinzu
    paginationNumbers.innerHTML = '';
    paginationNumbers.appendChild(fragment);
  }
  
  async performGlobalSearch(query) {
    if (!query.trim()) {
      this.filteredServerData = [...this.serverData];
      this.updateServerTable();
      return;
    }
    
    const searchTerm = query.toLowerCase();
    this.filteredServerData = this.serverData.filter(server => {
      // Search in server name
      if (server.name.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // Search in server ID
      if (server.id.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // Search in resources
      if (server.resources && server.resources.some(resource => 
        resource.toLowerCase().includes(searchTerm)
      )) {
        return true;
      }
      
      // Search in language
      if (server.language && server.language.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // Search in framework
      const framework = this.getServerFramework(server).toLowerCase();
      if (framework.includes(searchTerm)) {
        return true;
      }
      
      return false;
    });
    
    this.currentPage = 1;
    this.updateServerTable();
    this.addActivity(`Suche nach "${query}" - ${this.filteredServerData.length} Ergebnisse`, 'info');
  }
  
  filterResources(query) {
    if (!query.trim()) {
      this.loadResourceData();
      return;
    }
    
    const filtered = this.resourceData.filter(resource => 
      resource.name.toLowerCase().includes(query.toLowerCase())
    );
    
    const grid = document.getElementById('resources-grid');
    
    // Optimierte DOM-Manipulation: Erstelle ein DocumentFragment
    const fragment = document.createDocumentFragment();
    
    // Begrenze die Anzahl der angezeigten Ressourcen auf 100, um Performance zu verbessern
    const limitedData = filtered.slice(0, 100);
    
    limitedData.forEach(resource => {
      const card = this.createResourceCard(resource);
      fragment.appendChild(card);
    });
    
    // Leere das Grid und füge alle Karten auf einmal hinzu
    grid.innerHTML = '';
    grid.appendChild(fragment);
    
    document.getElementById('total-resource-count').textContent = 
      `${filtered.length} Ressourcen${filtered.length > 100 ? ' (100 angezeigt)' : ''}`;
    
    // Also filter servers that use this resource
    this.filterServersByResource(query);
    
    this.addActivity(`Ressourcen gefiltert: ${filtered.length} Ergebnisse für "${query}"`, 'info');
  }
  
  filterServersByResource(resourceName) {
    if (!resourceName.trim()) {
      this.filteredServerData = [...this.serverData];
      this.updateServerTable();
      return;
    }
    
    const searchTerm = resourceName.toLowerCase();
    this.filteredServerData = this.serverData.filter(server => {
      if (server.resources && Array.isArray(server.resources)) {
        return server.resources.some(resource => 
          resource.toLowerCase().includes(searchTerm)
        );
      }
      return false;
    });
    
    this.currentPage = 1;
    this.updateServerTable();
    this.addActivity(`Server mit Ressource "${resourceName}": ${this.filteredServerData.length} gefunden`, 'info');
  }
  
  async exportServers() {
    try {
      const response = await fetch('/api/export/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ criteria: this.activeFilters })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fivem_servers_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.addActivity('Server-Daten erfolgreich exportiert', 'success');
      }
    } catch (error) {
      console.error('Export-Fehler:', error);
      this.addActivity('Export fehlgeschlagen', 'error');
    }
  }
  
  async showServerDetails(serverId) {
    try {
      const response = await fetch(`/api/servers/${serverId}`);
      const data = await response.json();
      
      if (data.success) {
        this.displayServerModal(data.data);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Server-Details:', error);
    }
  }
  
  displayServerModal(server) {
    const modal = document.getElementById('server-modal');
    const title = document.getElementById('server-modal-title');
    const body = document.getElementById('server-modal-body');
    
    title.textContent = server.name;
    
    const framework = this.getServerFramework(server);
    const languageFlag = this.getLanguageFlag(server.language);
    
    // Begrenze die Anzahl der angezeigten Ressourcen, um Performance zu verbessern
    const maxResourcesToShow = 100;
    const resourcesCount = server.resources.length;
    const limitedResources = server.resources.slice(0, maxResourcesToShow);
    
    body.innerHTML = `
      <div class="server-details">
        <div class="detail-section">
          <h4>Grundinformationen</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Server-ID:</label>
              <span>${server.id}</span>
            </div>
            <div class="detail-item">
              <label>Name:</label>
              <span>${this.escapeHtml(server.name)}</span>
            </div>
            <div class="detail-item">
              <label>Spieler:</label>
              <span>${server.players}/${server.maxPlayers}</span>
            </div>
            <div class="detail-item">
              <label>Sprache:</label>
              <span>${languageFlag} ${server.language.toUpperCase()}</span>
            </div>
            <div class="detail-item">
              <label>Framework:</label>
              <span class="framework-badge ${framework.toLowerCase()}">${framework}</span>
            </div>
            <div class="detail-item">
              <label>Endpoint:</label>
              <span>${server.endpoint || 'Nicht verfügbar'}</span>
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <h4>Ressourcen (${resourcesCount}${resourcesCount > maxResourcesToShow ? ` - erste ${maxResourcesToShow} angezeigt` : ''})</h4>
          <div class="resources-list">
            ${limitedResources.map(resource => 
              `<span class="resource-tag">${this.escapeHtml(resource)}</span>`
            ).join('')}
          </div>
        </div>
        
        ${server.tags && server.tags.length > 0 ? `
          <div class="detail-section">
            <h4>Tags</h4>
            <div class="tags-list">
              ${server.tags.map(tag => 
                `<span class="tag">${this.escapeHtml(tag)}</span>`
              ).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
    
    modal.classList.add('active');
  }
  
  showResourceDetails(resource) {
    const modal = document.getElementById('resource-modal');
    if (!modal) {
      // Create a simple alert if modal doesn't exist
      alert(`Ressource: ${resource.name}\nVerwendet von: ${resource.usageCount || resource.serverCount || 0} Servern\nKategorie: ${resource.category || 'Unbekannt'}\nBeschreibung: ${resource.description || 'Keine Beschreibung verfügbar'}`);
      return;
    }
    
    const title = document.getElementById('resource-modal-title');
    const body = document.getElementById('resource-modal-body');
    
    if (title) title.textContent = resource.name;
    
    if (body) {
      body.innerHTML = `
        <div class="resource-details">
          <div class="detail-section">
            <h4>Grundinformationen</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Name:</label>
                <span>${this.escapeHtml(resource.name)}</span>
              </div>
              <div class="detail-item">
                <label>Kategorie:</label>
                <span class="category-badge ${(resource.category || 'other').toLowerCase()}">${resource.category || 'Unbekannt'}</span>
              </div>
              <div class="detail-item">
                <label>Verwendet von:</label>
                <span>${resource.usageCount || resource.serverCount || 0} Servern</span>
              </div>
              <div class="detail-item">
                <label>Beschreibung:</label>
                <span>${resource.description || 'Keine Beschreibung verfügbar'}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }
    
    modal.classList.add('active');
  }
  
  showProgressModal(title, message) {
    const modal = document.getElementById('progress-modal');
    document.getElementById('progress-title').textContent = title;
    document.getElementById('progress-message').textContent = message;
    document.getElementById('progress-fill').style.width = '0%';
    document.getElementById('progress-current').textContent = '0';
    document.getElementById('progress-total').textContent = '0';
    document.getElementById('progress-percentage').textContent = '0%';
    
    modal.classList.add('active');
  }
  
  updateProgress(current, total, message) {
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    
    document.getElementById('progress-fill').style.width = `${percentage}%`;
    document.getElementById('progress-current').textContent = current;
    document.getElementById('progress-total').textContent = total;
    document.getElementById('progress-percentage').textContent = `${percentage}%`;
    
    if (message) {
      document.getElementById('progress-message').textContent = message;
    }
  }
  
  hideProgressModal() {
    document.getElementById('progress-modal').classList.remove('active');
  }
  
  hideServerModal() {
    document.getElementById('server-modal').classList.remove('active');
  }
  
  addActivity(message, type = 'info') {
    const feed = document.getElementById('activity-feed');
    const item = document.createElement('div');
    item.className = `activity-item ${type}`;
    
    const icons = {
      info: 'fa-info-circle',
      success: 'fa-check-circle',
      warning: 'fa-exclamation-triangle',
      error: 'fa-times-circle'
    };
    
    item.innerHTML = `
      <div class="activity-icon">
        <i class="fas ${icons[type] || icons.info}"></i>
      </div>
      <div class="activity-content">
        <p>${this.escapeHtml(message)}</p>
        <span class="activity-time">${new Date().toLocaleTimeString()}</span>
      </div>
    `;
    
    feed.insertBefore(item, feed.firstChild);
    
    // Keep only last 50 items
    while (feed.children.length > 50) {
      feed.removeChild(feed.lastChild);
    }
  }
  
  clearActivityFeed() {
    document.getElementById('activity-feed').innerHTML = `
      <div class="activity-item info">
        <div class="activity-icon"><i class="fas fa-info-circle"></i></div>
        <div class="activity-content">
          <p>Aktivitäts-Feed geleert</p>
          <span class="activity-time">${new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    `;
  }
  
  updateConnectionStatus(connected) {
    const dot = document.getElementById('connection-status');
    const text = document.getElementById('connection-text');
    
    if (connected) {
      dot.style.background = 'var(--success-color)';
      text.textContent = 'Verbunden';
    } else {
      dot.style.background = 'var(--danger-color)';
      text.textContent = 'Getrennt';
    }
  }
  
  async updateStatistics() {
    try {
      const response = await fetch('./data/statistics.json');
      const data = await response.json();
      
      this.statistics = data;
      this.updateDashboardStats();
      this.updateCharts();
    } catch (error) {
      console.error('Fehler beim Laden der Statistiken:', error);
      this.addActivity('Fehler beim Laden der Statistiken', 'error');
    }
  }
  
  updateDashboardStats() {
    if (!this.statistics) return;
    
    document.getElementById('total-servers').textContent = this.statistics.totalServers || 0;
    document.getElementById('active-servers').textContent = this.statistics.activeServers || 0;
    document.getElementById('total-resources').textContent = this.statistics.totalResources || 0;
    
    // Update language count if element exists
    const langElement = document.getElementById('total-languages');
    if (langElement) {
      langElement.textContent = Object.keys(this.statistics.languages || {}).length;
    }
  }
  
  initializeCharts() {
    // Initialize Chart.js charts
    const frameworkCtx = document.getElementById('framework-chart')?.getContext('2d');
    const playerCtx = document.getElementById('player-chart')?.getContext('2d');
    
    if (frameworkCtx) {
      this.charts.framework = new Chart(frameworkCtx, {
        type: 'doughnut',
        data: {
          labels: ['ESX', 'QBCore', 'VRP', 'Standalone'],
          datasets: [{
            data: [0, 0, 0, 0],
            backgroundColor: [
              '#10b981',
              '#3b82f6',
              '#f59e0b',
              '#6b7280'
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#a1a1aa',
                usePointStyle: true
              }
            }
          }
        }
      });
    }
    
    if (playerCtx) {
      this.charts.player = new Chart(playerCtx, {
        type: 'bar',
        data: {
          labels: ['0-50', '51-100', '101-250', '251-500', '500+'],
          datasets: [{
            label: 'Server',
            data: [0, 0, 0, 0, 0],
            backgroundColor: '#8b5cf6',
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#a1a1aa'
              }
            },
            y: {
              grid: {
                color: '#374151'
              },
              ticks: {
                color: '#a1a1aa'
              }
            }
          }
        }
      });
    }
  }
  
  updateCharts() {
    if (!this.statistics) return;
    
    // Update framework chart
    if (this.charts.framework && this.statistics.frameworks) {
      const frameworks = this.statistics.frameworks;
      this.charts.framework.data.datasets[0].data = [
        frameworks.esx || 0,
        frameworks.qbcore || 0,
        frameworks.vrp || 0,
        frameworks.standalone || 0
      ];
      this.charts.framework.update();
    }
    
    // Update player chart
    if (this.charts.player && this.statistics.playerDistribution) {
      const dist = this.statistics.playerDistribution;
      this.charts.player.data.datasets[0].data = [
        dist['0-50'] || 0,
        dist['51-100'] || 0,
        dist['101-250'] || 0,
        dist['251-500'] || 0,
        dist['500+'] || 0
      ];
      this.charts.player.update();
    }
  }
  
  updateFrameworkChart() {
    this.updateCharts();
    this.addActivity('Framework-Chart aktualisiert', 'info');
  }
  
  updatePlayerChart() {
    this.updateCharts();
    this.addActivity('Spieler-Chart aktualisiert', 'info');
  }
  

  
  refreshServerData() {
    this.loadServerData();
    this.addActivity('Server-Daten aktualisiert', 'info');
  }
  
  addServerToTable(server) {
    // Add server to existing data for real-time updates
    const existingIndex = this.serverData.findIndex(s => s.id === server.id);
    if (existingIndex >= 0) {
      this.serverData[existingIndex] = server;
    } else {
      this.serverData.push(server);
    }
    
    // Update filtered data if no filters are active
    if (Object.keys(this.activeFilters).length === 0) {
      this.filteredServerData = [...this.serverData];
      this.updateServerTable();
    }
  }
  
  getServerFramework(server) {
    if (server.hasESX) return 'ESX';
    if (server.hasQBCore) return 'QBCore';
    if (server.hasVRP) return 'VRP';
    return 'Other';
  }
  
  getLanguageFlag(language) {
    const flags = {
      'de': '🇩🇪',
      'en': '🇺🇸',
      'fr': '🇫🇷',
      'es': '🇪🇸',
      'it': '🇮🇹',
      'pt': '🇵🇹',
      'ru': '🇷🇺',
      'pl': '🇵🇱',
      'nl': '🇳🇱',
      'tr': '🇹🇷'
    };
    return flags[language] || '🌐';
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize dashboard when DOM is loaded
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
  dashboard = new EnhancedDashboard();
  window.dashboard = dashboard; // Make it globally accessible
});

// Handle modal clicks
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('active');
  }
});

// Handle escape key for modals
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal.active').forEach(modal => {
      modal.classList.remove('active');
    });
  }
});