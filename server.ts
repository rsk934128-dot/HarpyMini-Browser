import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', browser: 'HarpyMini Browser Engine', version: '2.5.0' });
  });

  // AI Assistant Chat Route
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { messages, pageContext } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
      }

      let systemInstruction = `You are HarpyMini AI Assistant, the intelligent companion integrated directly into the HarpyMini web browser. 
You are fast, helpful, concise, and privacy-oriented.
Help users understand web pages, answer questions, provide summaries, explain complex technical or science topics, and assist with browser workflows.
Format with clean markdown with bolding, lists, and code blocks where helpful.`;

      if (pageContext?.content || pageContext?.title) {
        systemInstruction += `\n\nCURRENT BROWSING CONTEXT:
Page Title: ${pageContext.title || 'Untitled'}
Page URL: ${pageContext.url || 'Internal'}
Page Content Excerpt:
${(pageContext.content || '').slice(0, 4000)}

Ground your answers in this webpage context when the user asks questions about what they are reading.`;
      }

      const contents = (messages || []).map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      if (contents.length === 0) {
        contents.push({ role: 'user', parts: [{ text: 'Hello!' }] });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ reply: response.text || 'No response generated.' });
    } catch (err: any) {
      console.error('AI Chat Error:', err);
      res.status(500).json({ error: err.message || 'Failed to generate AI response' });
    }
  });

  // Page Summarization Route
  app.post('/api/ai/summarize', async (req, res) => {
    try {
      const { title, url, content } = req.body;
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'Page content is required for summarization.' });
      }

      const prompt = `Please provide a structured, crisp executive summary of the following webpage:
Title: ${title || 'Web Document'}
URL: ${url || 'Unknown'}

Content:
${content.slice(0, 8000)}

Structure your response with:
1. **TL;DR** (2-3 concise sentences)
2. **Key Takeaways** (3 to 5 bullet points with bold highlights)
3. **Important Entities / Technologies / Concepts mentioned**
4. **Estimated Reading Time Saved** (e.g. "Saved ~5 minutes of reading")
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are HarpyMini Browser Page Summarizer. Provide clear, highly readable executive summaries.',
          temperature: 0.3,
        },
      });

      res.json({ summary: response.text || 'Unable to generate summary.' });
    } catch (err: any) {
      console.error('Summarize Error:', err);
      res.status(500).json({ error: err.message || 'Failed to summarize page' });
    }
  });

  // Reader Mode Text & Structure Clean Extraction
  app.post('/api/ai/reader-extract', async (req, res) => {
    try {
      const { title, content, url } = req.body;
      const prompt = `Clean and format this web page into an elegant Reader Mode article.
Original Title: ${title || 'Article'}
Source: ${url || ''}

Raw Content:
${(content || '').slice(0, 10000)}

Instructions:
- Strip away navigation menus, footers, ad mentions, promotional banners, cookie notices, and social share prompts.
- Preserve all primary headlines (##, ###), paragraphs, quotes, and core insights.
- Provide a clean, delightful reading layout in Markdown.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an article reader-mode formatter.',
          temperature: 0.2,
        },
      });

      res.json({ cleanedContent: response.text || content });
    } catch (err: any) {
      console.error('Reader Extract Error:', err);
      res.status(500).json({ error: err.message || 'Failed to extract reader view' });
    }
  });

  // Voice Command Intent Parser
  app.post('/api/ai/voice-intent', async (req, res) => {
    try {
      const { transcript, currentUrl } = req.body;
      if (!transcript) {
        return res.status(400).json({ error: 'Speech transcript is required.' });
      }

      const prompt = `Analyze this browser voice command transcript and parse it into an action for HarpyMini Browser:
User said: "${transcript}"
Current URL: ${currentUrl || 'harpymini://home'}

Recognized browser intents:
- NAVIGATE: Go to a specific URL or well-known site (e.g. "go to wikipedia", "open github", "youtube.com")
- SEARCH: Search the web (e.g. "search for quantum computing", "who won the world cup")
- SUMMARIZE: Summarize current page (e.g. "summarize this", "give me a quick summary")
- READER_MODE: Toggle reader mode (e.g. "read mode", "clean view", "reader view")
- NEW_TAB: Open a new tab (e.g. "open a new tab", "new window")
- CLOSE_TAB: Close current tab (e.g. "close this tab")
- INCOGNITO: Toggle or open incognito mode (e.g. "go incognito", "private browsing")
- DATA_SAVER: Toggle data saving mode (e.g. "turn on data saver", "save data")
- OPEN_PASSWORDS: Open password vault (e.g. "open passwords", "show my logins")
- BOOKMARK: Bookmark this page (e.g. "bookmark this", "save to favorites")
- MINI_APP: Open built-in mini app (e.g. "open calculator", "notes", "speed test", "wallet")
- AI_ANSWER: General question to ask AI (e.g. "what is 42?", "write a poem")

Respond ONLY in valid JSON matching this structure:
{
  "intent": "NAVIGATE" | "SEARCH" | "SUMMARIZE" | "READER_MODE" | "NEW_TAB" | "CLOSE_TAB" | "INCOGNITO" | "DATA_SAVER" | "OPEN_PASSWORDS" | "BOOKMARK" | "MINI_APP" | "AI_ANSWER",
  "target": "string or url or app name",
  "query": "search query if SEARCH",
  "spokenResponse": "Short 1-sentence confirmation to speak back to the user"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (err: any) {
      console.error('Voice Intent Error:', err);
      // Fallback intent
      res.json({
        intent: 'SEARCH',
        query: req.body.transcript,
        spokenResponse: `Searching for ${req.body.transcript}`,
      });
    }
  });

  // Webpage Proxy Route for Real URL fetching with ad/tracker stripping
  app.get('/api/proxy/fetch', async (req, res) => {
    const targetUrl = req.query.url as string;
    const dataSaver = req.query.dataSaver === 'true';

    if (!targetUrl) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    try {
      const parsedUrl = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(parsedUrl.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HarpyMini/2.5 Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const originalText = await response.text();
      const originalSize = Buffer.byteLength(originalText, 'utf8');

      // If data saver is enabled, strip tracking scripts, analytics, iframe ads, video embeds
      let processed = originalText;
      let blockedTrackersCount = 0;

      if (dataSaver) {
        // Strip common tracker & ad script tags
        const scriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
        const matchedScripts = processed.match(scriptRegex) || [];
        blockedTrackersCount += matchedScripts.length;
        processed = processed.replace(scriptRegex, '<!-- [HarpyMini DataSaver: Blocked Script] -->');

        // Strip iframes
        const iframeRegex = /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi;
        blockedTrackersCount += (processed.match(iframeRegex) || []).length;
        processed = processed.replace(iframeRegex, '<div class="harpymini-blocked-ad">[Data Saver: Blocked Embedded Content]</div>');

        // Strip heavy audio/video
        processed = processed.replace(/<video\b[^<]*(?:(?!<\/video>)<[^<]*)*<\/video>/gi, '<div class="harpymini-blocked">[Media paused in Data Saver]</div>');
      }

      const finalSize = Buffer.byteLength(processed, 'utf8');
      const savedBytes = Math.max(0, originalSize - finalSize);

      res.json({
        url: parsedUrl.toString(),
        statusCode: response.status,
        html: processed,
        originalSizeKb: +(originalSize / 1024).toFixed(1),
        finalSizeKb: +(finalSize / 1024).toFixed(1),
        savedKb: +(savedBytes / 1024).toFixed(1),
        blockedTrackersCount,
      });
    } catch (err: any) {
      console.warn('Proxy fetch failed, returning simulated offline response:', err.message);
      res.json({
        url: targetUrl,
        statusCode: 200,
        simulated: true,
        html: `<html><head><title>${targetUrl}</title></head><body><h1>Simulated Page for ${targetUrl}</h1><p>The external host prevented direct cross-origin proxy embedding. HarpyMini Browser reader and AI tools remain fully accessible!</p></body></html>`,
        originalSizeKb: 12.5,
        finalSizeKb: 4.2,
        savedKb: 8.3,
        blockedTrackersCount: 3,
      });
    }
  });

  // --- WEBHOOK ENGINE & GOOGLE INTEGRATION APIS ---
  interface WebhookRecord {
    id: string;
    timestamp: string;
    source: 'incoming' | 'outgoing';
    action: string;
    sender?: string;
    targetUrl?: string;
    title?: string;
    message?: string;
    payload?: any;
    status: 'success' | 'failed' | 'pending';
    responseCode?: number;
    error?: string;
  }

  const webhookHistory: WebhookRecord[] = [
    {
      id: 'wh-seed-1',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      source: 'incoming',
      action: 'notification',
      sender: 'Google Workspace Trigger',
      title: 'Google Form Response',
      message: 'New submission received: "Customer Satisfaction Survey 2026"',
      status: 'success',
      responseCode: 200,
    },
    {
      id: 'wh-seed-2',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      source: 'incoming',
      action: 'open_url',
      sender: 'Google Apps Script Automation',
      targetUrl: 'https://docs.google.com/spreadsheets',
      title: 'Monthly Analytics Report',
      message: 'Opened spreadsheet from remote webhook trigger',
      status: 'success',
      responseCode: 200,
    },
  ];

  const sseClients: express.Response[] = [];

  function broadcastWebhook(record: WebhookRecord) {
    webhookHistory.unshift(record);
    if (webhookHistory.length > 80) {
      webhookHistory.pop();
    }
    const data = `data: ${JSON.stringify(record)}\n\n`;
    for (let i = sseClients.length - 1; i >= 0; i--) {
      try {
        sseClients[i].write(data);
      } catch {
        sseClients.splice(i, 1);
      }
    }
  }

  // Permissive CORS for incoming webhooks so external services (Google, Zapier, curl) can post
  app.use('/api/webhooks', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-HarpyMini-Secret');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // Real-Time SSE Stream for Webhooks
  app.get('/api/webhooks/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Send initial history
    res.write(`data: ${JSON.stringify({ type: 'INIT_HISTORY', events: webhookHistory })}\n\n`);

    sseClients.push(res);

    req.on('close', () => {
      const idx = sseClients.indexOf(res);
      if (idx !== -1) sseClients.splice(idx, 1);
    });
  });

  // Get Webhook History
  app.get('/api/webhooks/history', (req, res) => {
    res.json({ events: webhookHistory, count: webhookHistory.length });
  });

  // Clear Webhook History
  app.post('/api/webhooks/clear', (req, res) => {
    webhookHistory.length = 0;
    res.json({ success: true, message: 'Webhook history cleared.' });
  });

  // Incoming Webhook Receiver & Action Handler
  app.post(['/api/webhooks/incoming', '/api/webhooks/trigger'], async (req, res) => {
    try {
      const body = req.body || {};
      const sender = (req.headers['x-forwarded-for'] as string) || req.headers['user-agent'] || 'External Webhook';

      // Parse action
      let action = (body.action || body.type || 'notification').toLowerCase();
      let targetUrl = body.url || body.targetUrl || body.link || '';
      let title = body.title || body.name || 'Remote Webhook Trigger';
      let message = body.message || body.text || body.content || '';
      const payload = body.payload || body.data || body;

      // Handle standard Google Chat / Slack incoming payloads
      if (body.text && !body.action) {
        action = 'notification';
        message = body.text;
      }

      // If action is search
      if (action === 'search' && (body.query || body.q)) {
        targetUrl = `https://www.google.com/search?q=${encodeURIComponent(body.query || body.q)}`;
        message = `Search query: "${body.query || body.q}"`;
      }

      // If action is ai_summary
      if (action === 'ai_summary' || action === 'ai') {
        const textToSummarize = body.content || body.text || message || 'No content provided';
        try {
          if (process.env.GEMINI_API_KEY) {
            const aiResp = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: `Please summarize or analyze this webhook payload in 2 crisp sentences:\n\n${textToSummarize}`,
            });
            message = aiResp.text || message;
          }
        } catch (aiErr: any) {
          console.warn('Webhook AI summary note:', aiErr.message);
        }
      }

      const eventRecord: WebhookRecord = {
        id: `wh-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        source: 'incoming',
        action,
        sender,
        targetUrl,
        title,
        message,
        payload,
        status: 'success',
        responseCode: 200,
      };

      broadcastWebhook(eventRecord);

      res.status(200).json({
        success: true,
        message: 'Webhook received successfully by HarpyMini Browser',
        event: eventRecord,
      });
    } catch (err: any) {
      console.error('Incoming Webhook Error:', err);
      res.status(500).json({ error: err.message || 'Failed to process webhook' });
    }
  });

  // Outgoing Webhook Dispatcher (Google Chat, Discord, Slack, Google Apps Script, Custom)
  app.post('/api/webhooks/dispatch', async (req, res) => {
    try {
      const { targetUrl, service, payload, title, message } = req.body;

      if (!targetUrl || typeof targetUrl !== 'string') {
        return res.status(400).json({ error: 'Target URL is required for outgoing webhook.' });
      }

      let formattedBody: any = payload;

      // Format payload based on target service standard
      if (service === 'google_chat') {
        formattedBody = {
          text: message || (typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2)),
          cardsV2: [
            {
              cardId: `harpymini-${Date.now()}`,
              card: {
                header: {
                  title: title || '🦅 HarpyMini Browser Dispatch',
                  subtitle: `Sent at ${new Date().toLocaleTimeString()}`,
                  imageUrl: 'https://cdn-icons-png.flaticon.com/512/888/888879.png',
                },
                sections: [
                  {
                    widgets: [
                      {
                        textParagraph: {
                          text: message || 'Browser activity notification dispatch.',
                        },
                      },
                    ],
                  },
                ],
              },
            },
          ],
        };
      } else if (service === 'slack') {
        formattedBody = {
          text: `*${title || 'HarpyMini Browser'}*: ${message || JSON.stringify(payload)}`,
          username: 'HarpyMini Browser Bot',
          icon_emoji: ':globe_with_meridians:',
        };
      } else if (service === 'discord') {
        formattedBody = {
          content: message || '',
          embeds: [
            {
              title: title || 'HarpyMini Browser Notification',
              description: typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2),
              color: 0x06b6d4, // Cyan
              footer: { text: 'HarpyMini Webhook Dispatcher' },
              timestamp: new Date().toISOString(),
            },
          ],
        };
      } else if (!formattedBody) {
        formattedBody = {
          event: 'browser_dispatch',
          title: title || 'HarpyMini Browser Webhook',
          message: message || '',
          data: payload || {},
          timestamp: new Date().toISOString(),
          browser: 'HarpyMini Browser v2.5.0',
        };
      }

      // Dispatch HTTP POST
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'HarpyMini-Browser-Webhook-Engine/2.5.0',
        },
        body: JSON.stringify(formattedBody),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const respText = await response.text();
      const isSuccess = response.ok;

      const eventRecord: WebhookRecord = {
        id: `wh-out-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        source: 'outgoing',
        action: 'custom',
        sender: 'HarpyMini Browser Dispatcher',
        targetUrl,
        title: title || `Dispatch to ${service || 'Custom Webhook'}`,
        message: message || `Status ${response.status}: ${response.statusText}`,
        payload: formattedBody,
        status: isSuccess ? 'success' : 'failed',
        responseCode: response.status,
      };

      broadcastWebhook(eventRecord);

      res.status(response.status).json({
        success: isSuccess,
        statusCode: response.status,
        statusText: response.statusText,
        responsePreview: respText.slice(0, 500),
        event: eventRecord,
      });
    } catch (err: any) {
      console.error('Outgoing Webhook Error:', err);

      const failedRecord: WebhookRecord = {
        id: `wh-fail-${Date.now()}`,
        timestamp: new Date().toISOString(),
        source: 'outgoing',
        action: 'custom',
        targetUrl: req.body?.targetUrl || 'Unknown',
        title: 'Dispatch Failed',
        message: err.message,
        status: 'failed',
        error: err.message,
      };
      broadcastWebhook(failedRecord);

      res.status(502).json({
        success: false,
        error: `Webhook delivery failed: ${err.message}`,
        event: failedRecord,
      });
    }
  });

  // Setup Vite in Dev or static in Prod
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 HarpyMini Browser server running at http://0.0.0.0:${port}`);
  });
}

startServer();
