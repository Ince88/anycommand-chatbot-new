# Deployment Guide for Any Command Chatbot

## ✅ Repository Setup Complete

Your chatbot is now live on GitHub:
**https://github.com/Ince88/anycommand-chatbot-new**

## 🚀 Next Steps: Deploy to Railway

### 1. Install Dependencies Locally (Optional - for testing)

```bash
cd anycommand-chatbot-new
npm install
```

### 2. Create `.env` File

Create a `.env` file with your OpenAI API key:

```env
AI_API_KEY=your-openai-api-key-here
AI_BASE_URL=https://api.openai.com
AI_MODEL=gpt-4o-mini
EMBED_MODEL=text-embedding-3-small
PORT=3000
```

### 3. Test Locally

```bash
npm run dev
```

Visit: http://localhost:3000

### 4. Deploy on Railway

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `anycommand-chatbot-new`
5. Railway will auto-detect the Node.js setup

### 5. Add Environment Variables on Railway

In Railway dashboard, go to **Variables** tab and add:

```
AI_API_KEY = your-openai-api-key-here
AI_BASE_URL = https://api.openai.com
AI_MODEL = gpt-4o-mini
EMBED_MODEL = text-embedding-3-small
```

**Note:** Don't set `PORT` - Railway sets this automatically.

### 6. Get Your Railway URL

After deployment, Railway will give you a URL like:
`https://anycommand-chatbot-new-production.up.railway.app`

### 7. Update Widget URLs

Edit these files with your Railway URL:

#### `public/widget.html` (line ~441)
```javascript
const CONFIG = {
  apiUrl: 'https://your-railway-url.railway.app/chat',  // ← Update this
  ...
};
```

#### `public/index.html` (line ~287)
```javascript
const widgetUrl = window.location.hostname === 'localhost' 
  ? `${window.location.origin}/widget.html`
  : 'https://your-railway-url.railway.app/widget.html';  // ← Update this
```

### 8. Commit and Push Updates

```bash
git add .
git commit -m "Update widget URLs for Railway deployment"
git push origin main
```

Railway will auto-deploy the changes! 🎉

## 📦 What's Included

✅ **AI Support Bot**
- Built-in troubleshooting guide for Any Command
- Connection issues, firewall, Wi-Fi, etc.
- GPT-4 powered responses

✅ **Beautiful Landing Page**
- Troubleshooting guide at `/`
- Dark theme with Any Command branding
- Embedded chat widget

✅ **Embeddable Widget**
- Uses icon2.png logo
- Auto-expands on click
- Clean, modern UI

✅ **API Endpoints**
- `POST /chat` - Send messages
- `GET /health` - Health check
- `POST /custom-scrape` - Dynamic content (optional)

## 🎨 Customization

### Change Colors
Edit CSS variables in `public/widget.html` and `public/index.html`:
```css
--primary: #667eea;
--secondary: #764ba2;
```

### Update Troubleshooting Guide
Edit `TROUBLESHOOTING_GUIDE` in `src/server.ts` (line ~13)

### Change Bot Personality
Update system prompt in `src/server.ts` (line ~186)

## 🌐 Embedding on Other Sites

Add this to any website before `</body>`:

```html
<iframe 
  src="https://your-railway-url.railway.app/widget.html" 
  style="position:fixed;bottom:0;right:0;width:100px;height:100px;border:none;z-index:9999;background:transparent;pointer-events:auto;"
  allow="clipboard-write"
  title="Any Command Support"
></iframe>

<script>
window.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'CHAT_TOGGLE') {
    var iframe = document.getElementById('chat-widget');
    if (e.data.isOpen) {
      iframe.style.width = '420px';
      iframe.style.height = '620px';
    } else {
      iframe.style.width = '100px';
      iframe.style.height = '100px';
    }
  }
});
</script>
```

## 📊 Monitoring

- Railway provides built-in logs and metrics
- Check `/health` endpoint for uptime monitoring
- Monitor API usage in OpenAI dashboard

## ⚠️ Important Notes

1. **API Key Security**: Never commit `.env` to Git (already in `.gitignore`)
2. **Railway Pricing**: Free tier includes 500 hours/month
3. **OpenAI Costs**: Monitor your usage at platform.openai.com
4. **CORS**: Configured to allow all origins (`*`) - adjust if needed

## 🆘 Troubleshooting

### Bot not responding?
- Check Railway logs
- Verify API key in environment variables
- Test `/health` endpoint

### Widget not loading?
- Check CORS settings
- Verify Railway URL in widget config
- Check browser console for errors

### Connection timeout?
- Increase Railway timeout settings
- Check OpenAI API status

## 📞 Support

- **Repository**: https://github.com/Ince88/anycommand-chatbot-new
- **Any Command Community**: https://reddit.com/r/AnyCommand
- **Patreon**: https://www.patreon.com/c/anycommandremoteapp

---

🎉 **Your Any Command support chatbot is ready to go!**

