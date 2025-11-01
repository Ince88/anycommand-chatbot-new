# Any Command Support Chatbot

AI-powered support chatbot specifically built for [Any Command](https://anycommand.io) users. Get instant help with connection issues, troubleshooting, and feature questions.

## Features

- 🤖 **AI-Powered Support**: Instant answers powered by GPT-4
- 📚 **Built-in Knowledge**: Pre-loaded with comprehensive troubleshooting guides
- 🌐 **Multi-User Sessions**: Support dynamic website scraping for extended knowledge
- 💬 **Beautiful Chat Widget**: Easy-to-embed widget with the Any Command logo
- 🚀 **Fast & Reliable**: Built with TypeScript, Express, and RAG architecture

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

Create a `.env` file (copy from `env.example`):

```env
AI_API_KEY=your-openai-api-key
AI_BASE_URL=https://api.openai.com
AI_MODEL=gpt-4o-mini
EMBED_MODEL=text-embedding-3-small
PORT=3000
```

### 3. Run Development Server

```bash
npm run dev
```

Visit: **http://localhost:3000**

## Project Structure

```
anycommand-chatbot-new/
├── src/
│   ├── server.ts         # Main Express server with built-in troubleshooting
│   ├── scraper-lib.ts    # Web scraping utilities
│   └── ingest-lib.ts     # Content parsing & embedding
├── public/
│   ├── index.html        # Landing page with troubleshooting guide
│   ├── widget.html       # Embeddable chat widget
│   └── icon2.png         # Any Command app logo
├── data/                 # Session and embeddings storage
├── package.json
├── tsconfig.json
└── .env                  # Your configuration (not committed)
```

## Built-In Knowledge

The chatbot comes pre-loaded with knowledge about:

✅ **Connection Troubleshooting**
- Same Wi-Fi network requirements
- Firewall configuration
- Latest version checks
- Administrator mode
- Public network limitations
- Restart procedures

✅ **Common Questions**
- Safety and security
- Windows warning messages
- Connection issues
- Feature explanations

## Deployment to Railway

### Step 1: Push to GitHub

```bash
# Initialize git repository (if not already)
git init
git add .
git commit -m "Initial commit: Any Command support chatbot"
git branch -M main
git remote add origin https://github.com/Ince88/anycommand-chatbot-new.git
git push -u origin main
```

### Step 2: Deploy on Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `anycommand-chatbot-new` repository
4. Add environment variables:
   - `AI_API_KEY`: Your OpenAI API key
   - `AI_BASE_URL`: `https://api.openai.com`
   - `AI_MODEL`: `gpt-4o-mini`
   - `EMBED_MODEL`: `text-embedding-3-small`
   - `PORT`: (Railway sets this automatically)
5. Deploy! 🚀

### Step 3: Update Widget URLs

After deployment, update the `apiUrl` in:
- `public/widget.html` (line ~441)
- `public/index.html` (line ~287)

Replace with your Railway URL:
```javascript
const widgetUrl = 'https://your-app.railway.app/widget.html';
const apiUrl = 'https://your-app.railway.app/chat';
```

## Embedding the Widget

Add this snippet to any website before `</body>`:

```html
<iframe 
  src="https://your-app.railway.app/widget.html" 
  style="position:fixed;bottom:0;right:0;width:100px;height:100px;border:none;z-index:9999;background:transparent;pointer-events:auto;"
  allow="clipboard-write"
  title="Any Command Support"
></iframe>
```

Or use JavaScript for dynamic loading:

```html
<script>
(function() {
  var iframe = document.createElement('iframe');
  iframe.src = 'https://your-app.railway.app/widget.html';
  iframe.style.cssText = 'position:fixed;bottom:0;right:0;width:100px;height:100px;border:none;z-index:9999;background:transparent;pointer-events:auto;';
  iframe.allow = 'clipboard-write';
  iframe.title = 'Any Command Support';
  document.body.appendChild(iframe);
  
  // Handle chat expansion
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'CHAT_TOGGLE') {
      if (e.data.isOpen) {
        iframe.style.width = '420px';
        iframe.style.height = '620px';
      } else {
        iframe.style.width = '100px';
        iframe.style.height = '100px';
      }
    }
  });
})();
</script>
```

## API Endpoints

### POST `/chat`

Send a message to the chatbot.

**Request:**
```json
{
  "message": "How do I fix connection issues?",
  "sessionId": "optional-session-id",
  "metadata": {
    "userId": "optional-user-id"
  }
}
```

**Response:**
```json
{
  "reply": "To fix connection issues, first make sure...",
  "sources": [
    {
      "id": "S1",
      "title": "Troubleshooting Guide",
      "url": "anycommand.io/help",
      "score": 0.892
    }
  ]
}
```

### POST `/custom-scrape`

Dynamically scrape a website for extended knowledge (optional feature).

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "sessionId": "uuid-session-id",
  "status": "scraping",
  "message": "Processing started..."
}
```

### GET `/session-status/:sessionId`

Check the status of a scraping session.

**Response:**
```json
{
  "status": "ready",
  "message": "Successfully loaded: 5 pages",
  "pages": [...]
}
```

### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "anycommand-chatbot"
}
```

## Customization

### Modify Troubleshooting Guide

Edit the `TROUBLESHOOTING_GUIDE` constant in `src/server.ts` to update the built-in knowledge.

### Change Branding

- Replace `public/icon2.png` with your logo
- Update colors in `public/widget.html` and `public/index.html`
- Modify text in the welcome messages

### Adjust Response Style

Update the system prompt in `src/server.ts` (line ~186) to change the chatbot's personality and tone.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **AI**: OpenAI API (GPT-4 & text-embedding-3-small)
- **Parsing**: jsdom + Mozilla Readability
- **Deployment**: Railway

## Support

For issues with this chatbot:
- Open an issue on GitHub
- Check the [Any Command Reddit](https://reddit.com/r/AnyCommand)

For issues with Any Command itself:
- Use the chatbot! 🎉
- Visit [anycommand.io](https://anycommand.io)
- Join the [Patreon community](https://www.patreon.com/c/anycommandremoteapp)

## License

ISC

---

Made with ❤️ for the Any Command community

