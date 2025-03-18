// Import the default Workers Site handler
import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
  const request = event.request;
  const url = new URL(request.url);
  const path = url.pathname;
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return handleCors(request);
  }
  
  // Handle API proxy
  if (path.startsWith('/api/claude') && request.method === 'POST') {
    return handleClaudeApiProxy(request);
  }
  
  try {
    // Try to serve static assets from KV storage (populated from dist folder)
    const asset = await getAssetFromKV(event, {
      // Add caching options
      cacheControl: {
        browserTTL: 60 * 60 * 24, // 1 day
        edgeTTL: 60 * 60 * 24 * 7, // 7 days
        bypassCache: false,
      },
      // Fall back to index.html for SPA routes
      mapRequestToAsset: req => {
        const url = new URL(req.url);
        // SPA fallback - always serve index.html for paths without file extensions
        if (!url.pathname.includes('.')) {
          return new Request(`${url.origin}/index.html`, req);
        }
        return req;
      },
    });
    
    // Return the asset if we found it
    return asset;
  } catch (e) {
    // If no KV asset was found, serve a basic page
    return new Response(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Intelligent PDF Generator</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f7;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
        }
        h1 {
            color: #2c3e50;
            text-align: center;
        }
        .container {
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            padding: 30px;
            margin-top: 20px;
        }
        button {
            background-color: #3498db;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background-color: #2980b9;
        }
        pre {
            background-color: #f8f8f8;
            padding: 15px;
            border-radius: 5px;
            overflow: auto;
        }
    </style>
</head>
<body>
    <h1>Intelligent PDF Generator</h1>
    
    <div class="container">
        <h2>Worker is Running</h2>
        <p>Your Cloudflare Worker is successfully deployed and running, but no files were found in KV storage.</p>
        
        <h3>API Test</h3>
        <p>To test the Claude API proxy:</p>
        <button onclick="testApi()">Test API Endpoint</button>
        <pre id="result">Results will appear here...</pre>
    </div>
    
    <script>
        async function testApi() {
            const result = document.getElementById('result');
            result.textContent = 'Testing API endpoint...';
            
            try {
                const response = await fetch('/api/claude', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        test: true
                    })
                });
                
                const data = await response.json();
                result.textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                result.textContent = 'Error: ' + error.message;
            }
        }
    </script>
</body>
</html>
    `, {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        'Cache-Control': 'no-cache'
      }
    });
  }
}

function handleCors(request) {
  const origin = request.headers.get('Origin');
  
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400'
    }
  });
}

async function handleClaudeApiProxy(request) {
  try {
    const data = await request.json();
    const { apiKey, model, messages, system } = data;
    
    // Validate required parameters
    if (!apiKey || !messages) {
      return new Response(JSON.stringify({ 
        error: 'Missing required parameters',
        details: 'API key and messages are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Forward request to Claude API
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        system: system,
        messages: messages
      })
    });
    
    const responseData = await claudeResponse.json();
    
    // Return the Claude API response
    return new Response(JSON.stringify(responseData), {
      status: claudeResponse.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error in Claude API proxy:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}