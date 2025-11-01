import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import crypto from 'crypto';
import { scrapeUrl } from './scraper-lib.js';
import { parseAndEmbed, type Doc } from './ingest-lib.js';

const app = express();

// Built-in troubleshooting knowledge for Any Command
const TROUBLESHOOTING_GUIDE = `
🚨 ANY COMMAND TROUBLESHOOTING GUIDE

Common Connection Issues and Solutions:

1. SAME WI-FI REQUIREMENT
   - Both your Android device and Windows PC must be on the same local network
   - Hotspots, mobile data, or hotel Wi-Fi can cause problems
   - Solution: Connect both devices to the same Wi-Fi network

2. LATEST VERSION
   - Always use the latest PC server from anycommand.io
   - Outdated versions may have connection issues
   - Solution: Download the latest version from anycommand.io

3. FIREWALL BLOCKING
   - Windows may ask for firewall permissions when first running the server
   - You must allow both private and public networks
   - Manual check: Control Panel > Windows Defender Firewall > Allow an app
   - Make sure pythonw.exe or Any Command server is allowed through
   - Solution: Allow the server through Windows Firewall

4. ADMINISTRATOR MODE
   - Running as Administrator can help eliminate issues
   - Right-click the server → "Run as administrator"
   - Not always necessary but helpful for troubleshooting

5. HOTEL WI-FI OR PUBLIC NETWORKS
   - Some networks isolate devices for security
   - Your phone won't see your PC even on the same Wi-Fi
   - Unfortunately, there's no workaround for restricted networks
   - Solution: Use a home or private Wi-Fi network, or create a mobile hotspot

6. RESTART BOTH DEVICES
   - Restart the app on your phone
   - Restart the server on your PC
   - Make sure you're using the latest version (check anycommand.io)
   - Double-check you entered the correct PIN and IP address
   - Join the community on Reddit if you need more help

COMMON QUESTIONS:

Q: Is this safe to use?
A: Yes — the app doesn't access your files or send data anywhere. It only works over your local network and requires a PIN to connect.

Q: Why does Windows say it's from an unknown source?
A: Until the app is signed with an official code signing certificate (in progress), Windows might show that message. You can safely run it by right-clicking and selecting "Run anyway".

Q: It doesn't connect, what's wrong?
A: Make sure your PC and phone are on the same Wi-Fi. Some networks (like hotel or office wifi) may block local connections. Try using a mobile hotspot or home network if possible.

COMMUNITY SUPPORT:
- Reddit: r/AnyCommand
- Patreon: patreon.com/c/anycommandremoteapp
- Buy Me a Coffee: buymeacoffee.com/anycommand8
`;

// Session storage for multi-user demos
const sessions = new Map<string, { docs: Doc[]; createdAt: number; status: 'scraping' | 'ready' }>();

// Cleanup old sessions every 10 minutes (older than 30 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.createdAt > 30 * 60 * 1000) {
      sessions.delete(sessionId);
      console.log(`Cleaned up session: ${sessionId}`);
    }
  }
}, 10 * 60 * 1000);

// Enable CORS for all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

app.use(express.json({ limit: '1mb' }));

const ChatSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string().optional(),
  metadata: z.object({ userId: z.string().optional() }).optional()
});

const ScrapeSchema = z.object({
  url: z.string().url()
});

const EMB_PATH = path.join(process.cwd(), 'data', 'embeddings.json');
const DOCS: Doc[] = fs.existsSync(EMB_PATH) ? JSON.parse(fs.readFileSync(EMB_PATH, 'utf8')) : [];

function dot(a: number[], b: number[]) { let s = 0; for (let i=0;i<a.length;i++) s += a[i]*b[i]; return s; }
function norm(a: number[]) { return Math.sqrt(dot(a,a)); }
function cos(a: number[], b: number[]) { return dot(a,b) / (norm(a)*norm(b) + 1e-12); }

async function embed(text: string): Promise<number[]> {
  const baseUrl = process.env.AI_BASE_URL!;
  const key = process.env.AI_API_KEY!;
  const model = process.env.EMBED_MODEL || 'text-embedding-3-small';
  const res = await fetch(`${baseUrl}/v1/embeddings`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, input: text })
  });
  if (!res.ok) throw new Error(`Embed error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.data[0].embedding;
}

async function chat(messages: {role:'system'|'user'|'assistant'; content:string}[]) {
  const baseUrl = process.env.AI_BASE_URL!;
  const key = process.env.AI_API_KEY!;
  const model = process.env.AI_MODEL || 'gpt-4o-mini';
  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, temperature: 0.2 })
  });
  if (!res.ok) throw new Error(`Model error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

app.post('/chat', async (req, res) => {
  try {
    const { message, sessionId } = ChatSchema.parse(req.body);

    // Use session-specific docs or default DOCS
    let docsToUse: Doc[] = DOCS;
    if (sessionId) {
      console.log(`[Chat] Request with sessionId: ${sessionId}`);
      if (sessions.has(sessionId)) {
        docsToUse = sessions.get(sessionId)!.docs;
        console.log(`[Chat] Using session docs: ${docsToUse.length} documents`);
      }
    }

    // Always include troubleshooting guide for Any Command questions
    const allDocs = docsToUse.length > 0 ? [...docsToUse] : [];
    
    // Add troubleshooting as a synthetic doc
    const troubleshootingDoc: Doc = {
      id: 'troubleshooting-guide',
      url: 'anycommand.io/help',
      title: 'Any Command Troubleshooting Guide',
      text: TROUBLESHOOTING_GUIDE,
      chunks: [TROUBLESHOOTING_GUIDE],
      vectors: [[]]
    };
    
    // Embed troubleshooting guide if needed
    if (troubleshootingDoc.vectors[0].length === 0) {
      troubleshootingDoc.vectors[0] = await embed(TROUBLESHOOTING_GUIDE);
    }
    
    allDocs.push(troubleshootingDoc);

    if (allDocs.length === 0) {
      return res.json({ 
        reply: 'I can help you with Any Command! Ask me anything about the app, connection issues, features, or troubleshooting.', 
        sources: [] 
      });
    }

    // Retrieve relevant chunks
    const qVec = await embed(message);
    type Hit = { score:number; chunk:string; url:string; title:string };
    const hits: Hit[] = [];
    for (const d of allDocs) {
      d.vectors.forEach((v, idx) => {
        hits.push({ score: cos(qVec, v), chunk: d.chunks[idx], url: d.url, title: d.title });
      });
    }
    hits.sort((a,b)=>b.score-a.score);
    const top = hits.slice(0, 5);

    const context = top.map((h, i) => `Source ${i+1} (${h.title}):\n${h.chunk}`).join('\n\n');
    const sources = top.map((h,i)=>`[S${i+1}] ${h.title} — ${h.url}`).join('\n');

    const system = {
      role: 'system' as const,
      content: [
        'You are a helpful support assistant for Any Command, an Android app that lets users control their Windows PC from their phone.',
        'Answer questions using the provided context from the Any Command documentation and troubleshooting guide.',
        'Be friendly, helpful, and encouraging. Use a casual, supportive tone.',
        'Always prioritize connection troubleshooting when users have issues connecting.',
        'If the answer is not in the provided sources, politely say that you don\'t have that information but can help with other questions.',
        'Cite sources inline as [S1], [S2] etc.',
        'Respond in the user\'s language (English by default).'
      ].join(' ')
    };

    const reply = await chat([
      system,
      { role:'user', content:
`User question:
${message}

Context:
${context}

When you answer, include inline citations like [S1], [S2].

Sources:
${sources}`
      }
    ]);

    res.json({ reply, sources: top.map((h,i)=>({ id: `S${i+1}`, title: h.title, url: h.url, score: +h.score.toFixed(3) })) });
  } catch (e:any) {
    res.status(400).json({ error: e.message });
  }
});

// Custom scraping endpoint for multi-user demo (async)
app.post('/custom-scrape', async (req, res) => {
  try {
    const { url } = ScrapeSchema.parse(req.body);
    
    console.log(`[Custom Scrape] Starting for: ${url}`);
    
    // Create session immediately
    const sessionId = crypto.randomUUID();
    sessions.set(sessionId, { docs: [], createdAt: Date.now(), status: 'scraping' });
    
    // Return immediately
    res.json({ 
      sessionId,
      status: 'scraping',
      message: 'Processing started...'
    });
    
    // Scrape in background
    (async () => {
      try {
        console.log(`[Session ${sessionId}] Scraping ${url}...`);
        const pages = await scrapeUrl(url, 20);
        
        if (pages.length === 0) {
          sessions.delete(sessionId);
          console.log(`[Session ${sessionId}] No pages scraped, session deleted`);
          return;
        }
        
        console.log(`[Session ${sessionId}] Scraped ${pages.length} pages, embedding...`);
        
        const docs = await parseAndEmbed(
          pages,
          process.env.AI_BASE_URL!,
          process.env.AI_API_KEY!,
          process.env.EMBED_MODEL || 'text-embedding-3-small'
        );
        
        if (docs.length === 0) {
          sessions.delete(sessionId);
          console.log(`[Session ${sessionId}] No docs extracted, session deleted`);
          return;
        }
        
        // Update session with results
        sessions.set(sessionId, { docs, createdAt: Date.now(), status: 'ready' });
        console.log(`[Session ${sessionId}] Ready! ${docs.length} documents`);
        
      } catch (e: any) {
        console.error(`[Session ${sessionId}] Error:`, e);
        sessions.delete(sessionId);
      }
    })();
    
  } catch (e: any) {
    console.error('[Custom Scrape] Error:', e);
    res.status(500).json({ error: e.message || 'Error processing request.' });
  }
});

// Check session status
app.get('/session-status/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.json({ status: 'not_found' });
  }
  
  if (session.status === 'scraping') {
    return res.json({ status: 'scraping' });
  }
  
  // Ready
  res.json({ 
    status: 'ready',
    message: `Successfully loaded: ${session.docs.length} pages`,
    pages: session.docs.map(d => ({ title: d.title, url: d.url }))
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'anycommand-chatbot' });
});

// Static files
app.use(express.static(path.join(process.cwd(), 'public')));

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`Any Command Chatbot running: http://localhost:${port}`));

