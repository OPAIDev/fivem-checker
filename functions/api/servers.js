// Cloudflare Workers Function für Server API
// Diese Datei wird automatisch als API-Endpoint unter /api/servers verfügbar

export async function onRequest(context) {
  const { request, env } = context;
  
  // CORS Headers für Cross-Origin Requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    const url = new URL(request.url);
    const method = request.method;

    // GET /api/servers - Hole Server-Daten
    if (method === 'GET') {
      // Hier könntest du deine Server-Daten aus einer Datenbank oder externen API laden
      // Für jetzt verwenden wir Mock-Daten
      const mockServers = [
        {
          id: '1',
          name: 'Example RP Server',
          players: 45,
          maxPlayers: 64,
          language: 'DE',
          framework: 'ESX',
          resources: ['esx_menu_default', 'esx_basicneeds'],
          uptime: 98.5
        },
        {
          id: '2', 
          name: 'Another Server',
          players: 23,
          maxPlayers: 32,
          language: 'EN',
          framework: 'QBCore',
          resources: ['qb-core', 'qb-inventory'],
          uptime: 95.2
        }
      ];

      return new Response(JSON.stringify({
        success: true,
        data: mockServers,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    // POST /api/servers - Füge neuen Server hinzu (falls implementiert)
    if (method === 'POST') {
      const body = await request.json();
      
      // Hier würdest du den Server in einer Datenbank speichern
      // Für jetzt geben wir nur eine Bestätigung zurück
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Server erfolgreich hinzugefügt',
        data: { id: Date.now().toString(), ...body }
      }), {
        status: 201,
        headers: corsHeaders
      });
    }

    // Methode nicht unterstützt
    return new Response(JSON.stringify({
      success: false,
      error: 'Methode nicht unterstützt'
    }), {
      status: 405,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('API Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Interner Server-Fehler',
      message: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

// Rate Limiting (optional)
export async function onRequestGet(context) {
  // Implementiere Rate Limiting hier falls nötig
  return onRequest(context);
}

export async function onRequestPost(context) {
  // Implementiere Rate Limiting hier falls nötig  
  return onRequest(context);
}