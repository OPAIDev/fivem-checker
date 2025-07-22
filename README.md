# 🚀 FiveM Resource Checker Dashboard

Ein modernes, responsives Dashboard zur Überwachung und Analyse von FiveM Server-Ressourcen und Statistiken.

## ✨ Features

- 🔍 **Erweiterte Server-Filter** - Filtere nach Spieleranzahl, Ressourcen, Namen und mehr
- 📊 **Echtzeit-Statistiken** - Live-Updates der Server-Daten
- 🎨 **Modernes UI** - Glassmorphism Design mit dunklem Theme
- 📱 **Responsive Design** - Optimiert für Desktop und Mobile
- ⚡ **Schnelle Performance** - Optimierte Datenverarbeitung

## 🌐 Live Demo

**Cloudflare Pages:** [Deine-Domain.pages.dev](https://deine-domain.pages.dev)

## 🚀 Deployment auf Cloudflare Pages

### Voraussetzungen
- GitHub Account
- Cloudflare Account (kostenlos)

### Schritt-für-Schritt Anleitung

#### 1. Repository auf GitHub erstellen
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/DEIN-USERNAME/resource-checker.git
git push -u origin main
```

#### 2. Cloudflare Pages Setup
1. Gehe zu [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigiere zu **Pages** → **Create a project**
3. Wähle **Connect to Git** → **GitHub**
4. Wähle dein Repository aus

#### 3. Build-Konfiguration
```
Framework preset: None
Build command: npm run build
Build output directory: public
Root directory: /
```

#### 4. Environment Variables (Optional)
Falls du API-Keys benötigst:
- Gehe zu **Settings** → **Environment variables**
- Füge deine Variablen hinzu (niemals im Code!)

### 🔧 Lokale Entwicklung

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Build für Production
npm run build

# Mit Wrangler deployen
npm run deploy
```

## 📁 Projekt-Struktur

```
resource_checker/
├── public/                 # Static files für Cloudflare Pages
│   ├── enhanced_dashboard.html
│   ├── enhanced_dashboard.js
│   ├── enhanced_styles.css
│   ├── _headers           # Security headers
│   └── _redirects         # URL redirects
├── enhanced_server.js     # Backend server (für lokale Entwicklung)
├── wrangler.toml         # Cloudflare configuration
├── package.json          # Dependencies und Scripts
└── .gitignore           # Git ignore rules
```

## 🔒 Sicherheit

- ✅ **HTTPS erzwungen** - Automatische Weiterleitung
- ✅ **Security Headers** - XSS, CSRF, Clickjacking Schutz
- ✅ **Content Security Policy** - Verhindert Code-Injection
- ✅ **Cache-Optimierung** - Schnelle Ladezeiten

## 🛠️ Technologien

- **Frontend:** Vanilla JavaScript, CSS3, HTML5
- **Hosting:** Cloudflare Pages
- **CDN:** Cloudflare Global Network
- **Icons:** Font Awesome
- **Fonts:** Google Fonts

## 📊 Performance

- ⚡ **Global CDN** - Weltweite Verfügbarkeit
- 🚀 **Edge Computing** - Minimale Latenz
- 📈 **Unlimited Bandwidth** - Keine Traffic-Limits
- 🔄 **Auto-Deployments** - Bei jedem Git Push

Ein hochmodernes, effizientes System zur Sammlung, Analyse und Filterung von FiveM-Servern mit erweiterten Funktionen und einem modernen Dashboard.

## ✨ Features

### 🎯 Kernfunktionen
- **Intelligente Server-Sammlung**: Automatisierte Sammlung von Server-IDs mit Duplikatserkennung
- **Erweiterte Datenanalyse**: Detaillierte Analyse von Server-Ressourcen, Frameworks und Eigenschaften
- **Hochperformante Filter**: Komplexe Filterkriterien mit Echtzeit-Ergebnissen
- **Modernes Dashboard**: Responsive Web-Interface mit dunklem Design
- **Real-time Updates**: Live-Updates über WebSocket-Verbindungen

### 🔧 Erweiterte Funktionen
- **Framework-Erkennung**: Automatische Erkennung von ESX, QBCore, VRP
- **Ressourcen-Analyse**: Detaillierte Analyse verwendeter Server-Ressourcen
- **Statistiken & Analytics**: Umfassende Statistiken und Visualisierungen
- **Export-Funktionen**: CSV-Export mit benutzerdefinierten Filtern
- **Batch-Verarbeitung**: Effiziente Verarbeitung großer Datenmengen
- **Rate Limiting**: Intelligente Anfragenbegrenzung
- **Caching**: Optimierte Performance durch Caching

### 🎨 Dashboard-Features
- **Server-Übersicht**: Detaillierte Tabelle mit Sortierung und Pagination
- **Erweiterte Filter**: Komplexe Filterkriterien und Presets
- **Ressourcen-Analyse**: Visualisierung der beliebtesten Ressourcen
- **Analytics**: Detaillierte Statistiken und Charts
- **Real-time Logs**: Live-Aktivitätsfeed
- **Export-Funktionen**: Datenexport in verschiedenen Formaten

## 🚀 Installation

### Voraussetzungen
- Node.js (v16 oder höher)
- npm oder yarn
- Chrome/Chromium (für Puppeteer)

### Setup
```bash
# Repository klonen
git clone <repository-url>
cd resource_checker

# Dependencies installieren
npm install

# Server starten
npm start
```

### Alternative: Enhanced Server
```bash
# Enhanced Server mit erweiterten Features
node enhanced_server.js
```

## 📖 Verwendung

### Dashboard öffnen
Öffne deinen Browser und navigiere zu:
```
http://localhost:3000
```

### Server sammeln
1. Klicke auf "Server sammeln" im Dashboard
2. Der Browser öffnet sich automatisch und sammelt Server-IDs
3. Fortschritt wird in Echtzeit angezeigt
4. Sammlung stoppt automatisch bei ausreichender Anzahl

### Server analysieren
1. Klicke auf "Ressourcen analysieren"
2. System analysiert gesammelte Server-IDs
3. Daten werden in Echtzeit verarbeitet
4. Ergebnisse werden automatisch gespeichert

### Filter verwenden

#### Basis-Filter
- **Mindest-Spieler**: Minimale Spieleranzahl
- **Sprache**: Server-Sprache (de, en, fr, etc.)
- **Framework**: ESX, QBCore, VRP
- **Ressourcen**: Server mit bestimmten Ressourcen

#### Erweiterte Filter
- **Spieler-Bereich**: Min/Max Spieleranzahl
- **Spieler-Dichte**: Verhältnis Spieler/Max-Spieler
- **Name-Pattern**: Regex-Pattern für Server-Namen
- **Uptime**: Minimale Server-Laufzeit
- **Ressourcen-Kombinationen**: Komplexe Ressourcen-Filter

#### Filter-Presets
- **German RP**: Deutsche Roleplay-Server
- **High Population**: Server mit vielen Spielern
- **ESX Servers**: Nur ESX-Framework Server
- **New Servers**: Kürzlich gestartete Server

## 🏗️ Architektur

### Komponenten

#### Backend
- **enhanced_server.js**: Hauptserver mit Express und Socket.io
- **advanced_server_manager.js**: Kernlogik für Server-Management
- **server_checker.js**: Legacy Server-Sammlung
- **resource_checker.js**: Legacy Ressourcen-Analyse

#### Frontend
- **enhanced_dashboard.html**: Modernes Dashboard-Interface
- **enhanced_dashboard.js**: Client-seitige Logik
- **enhanced_styles.css**: Modernes dunkles Design

### Datenfluss
1. **Sammlung**: Puppeteer sammelt Server-IDs von servers.fivem.net
2. **Analyse**: Node-fetch ruft Server-Daten über BrightData API ab
3. **Verarbeitung**: Daten werden gefiltert und analysiert
4. **Speicherung**: Ergebnisse werden in JSON-Dateien gespeichert
5. **Darstellung**: Dashboard zeigt Daten in Echtzeit an

## 🔧 Konfiguration

### Umgebungsvariablen
```env
# BrightData Proxy (optional)
BRIGHTDATA_USERNAME=your_username
BRIGHTDATA_PASSWORD=your_password
BRIGHTDATA_ENDPOINT=your_endpoint

# Server-Konfiguration
PORT=3000
HEADLESS=true
```

### Erweiterte Einstellungen
```javascript
// In advanced_server_manager.js
const config = {
  maxConcurrentRequests: 10,
  requestDelay: 100,
  retryAttempts: 3,
  cacheTimeout: 300000, // 5 Minuten
  batchSize: 50
};
```

## 📊 API-Endpunkte

### Server-Daten
```http
GET /api/servers          # Alle Server
GET /api/servers/:id      # Einzelner Server
POST /api/servers/filter  # Gefilterte Server
```

### Statistiken
```http
GET /api/statistics       # Gesamtstatistiken
GET /api/resources        # Ressourcen-Daten
```

### Export
```http
POST /api/export/csv      # CSV-Export
POST /api/export/json     # JSON-Export
```

### Suche
```http
POST /api/search          # Erweiterte Suche
```

## 🎨 Anpassung

### Design anpassen
Bearbeite `enhanced_styles.css` für Design-Änderungen:
```css
:root {
  --primary-color: #8b5cf6;    # Hauptfarbe
  --background-dark: #0f172a;  # Hintergrund
  --surface-color: #1e293b;    # Oberflächen
}
```

### Filter erweitern
Füge neue Filter in `advanced_server_manager.js` hinzu:
```javascript
filterServers(servers, criteria) {
  // Neue Filterlogik hier
}
```

## 🚀 Performance-Optimierungen

### Implementierte Optimierungen
- **Batch-Verarbeitung**: Verarbeitung in kleinen Gruppen
- **Rate Limiting**: Schutz vor API-Überlastung
- **Caching**: Zwischenspeicherung häufiger Anfragen
- **Lazy Loading**: Daten werden bei Bedarf geladen
- **Pagination**: Große Datensätze werden aufgeteilt

### Empfohlene Einstellungen
```javascript
// Für große Datenmengen
const optimizedConfig = {
  batchSize: 25,
  maxConcurrentRequests: 5,
  requestDelay: 200,
  cacheTimeout: 600000 // 10 Minuten
};
```

## 🔍 Troubleshooting

### Häufige Probleme

#### Server sammelt keine Daten
- Überprüfe Internetverbindung
- Stelle sicher, dass Chrome/Chromium installiert ist
- Prüfe Firewall-Einstellungen

#### Analyse schlägt fehl
- Überprüfe BrightData-Konfiguration
- Stelle sicher, dass Server-IDs vorhanden sind
- Prüfe API-Rate-Limits

#### Dashboard lädt nicht
- Überprüfe Port 3000
- Stelle sicher, dass alle Dependencies installiert sind
- Prüfe Browser-Konsole auf Fehler

### Debug-Modus
```bash
# Mit Debug-Ausgabe starten
DEBUG=* node enhanced_server.js
```

## 📈 Statistiken

Das System sammelt umfassende Statistiken:
- **Server-Verteilung**: Nach Framework, Sprache, Spieleranzahl
- **Ressourcen-Popularität**: Meist verwendete Ressourcen
- **Trends**: Zeitliche Entwicklung der Server-Landschaft
- **Performance-Metriken**: Sammlung- und Analyse-Geschwindigkeit

## 🤝 Beitragen

### Entwicklung
1. Fork das Repository
2. Erstelle einen Feature-Branch
3. Implementiere deine Änderungen
4. Teste gründlich
5. Erstelle einen Pull Request

### Code-Style
- Verwende ESLint-Konfiguration
- Folge bestehenden Namenskonventionen
- Dokumentiere neue Features
- Schreibe Tests für neue Funktionen

## 📄 Lizenz

MIT License - siehe LICENSE-Datei für Details.

## 🙏 Danksagungen

- **FiveM Community**: Für die offene Server-API
- **Puppeteer Team**: Für das großartige Browser-Automation-Tool
- **Chart.js**: Für die Visualisierungs-Bibliothek
- **Socket.io**: Für Real-time-Kommunikation

## 📞 Support

Bei Fragen oder Problemen:
1. Überprüfe die Dokumentation
2. Suche in den Issues
3. Erstelle ein neues Issue mit detaillierter Beschreibung

---

**Entwickelt mit ❤️ für die FiveM-Community**

*Dieses Tool ist darauf ausgelegt, die FiveM-Server-Landschaft zu analysieren und Entwicklern sowie Server-Betreibern wertvolle Einblicke zu geben.*