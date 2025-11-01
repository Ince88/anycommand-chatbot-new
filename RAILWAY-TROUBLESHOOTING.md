# Railway Deployment Troubleshooting

## Common Railway Deployment Errors

### 1. ❌ "Module not found" or "Cannot find module"

**Cause**: Missing dependencies or wrong Node version

**Solution**:
```bash
# Make sure all dependencies are in package.json (not devDependencies)
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push origin main
```

**Check Railway Settings**:
- Go to Settings → Environment
- Make sure Node version is `20.x` or higher

---

### 2. ❌ "Port already in use" or "EADDRINUSE"

**Cause**: Railway sets the PORT environment variable automatically

**Solution**: 
✅ **Already handled in code** - `src/server.ts` uses `process.env.PORT || 3000`

**Do NOT** set a custom PORT variable in Railway - let Railway handle it automatically.

---

### 3. ❌ "Cannot find 'tsx'" or "Command not found"

**Cause**: `tsx` is in devDependencies but needs to be in dependencies for Railway

**Solution**:
```bash
cd anycommand-chatbot-new
npm install --save tsx
git add package.json package-lock.json
git commit -m "Move tsx to dependencies"
git push origin main
```

---

### 4. ❌ "Environment variable not set" or "AI_API_KEY is undefined"

**Cause**: Missing environment variables in Railway

**Solution**:
1. Go to Railway Project → Variables tab
2. Add these variables:
   ```
   AI_API_KEY=your-openai-api-key
   AI_BASE_URL=https://api.openai.com
   AI_MODEL=gpt-4o-mini
   EMBED_MODEL=text-embedding-3-small
   ```
3. Click "Deploy" or wait for auto-deploy

---

### 5. ❌ "Health check failed" or "Service unhealthy"

**Cause**: The `/health` endpoint might not be responding

**Solution**:
1. Check Railway logs for actual error
2. Test health endpoint locally:
   ```bash
   npm run dev
   # In another terminal:
   curl http://localhost:3000/health
   ```
3. If logs show "Cannot find module", see solution #3 above

---

### 6. ❌ "Build succeeded but deploy failed"

**Cause**: Runtime error after build

**Solution**:
1. Click on your Railway deployment
2. Check the "Deployments" tab
3. Click on the failed deployment
4. Read the deploy logs for the actual error
5. Common issues:
   - Missing API key → Add environment variables
   - Wrong start command → Check `package.json` scripts
   - Missing dependencies → Move tsx to dependencies

---

## Quick Fix Checklist

Try these in order:

### ✅ Step 1: Move tsx to dependencies
```bash
cd anycommand-chatbot-new
npm uninstall tsx
npm install --save tsx
git add package.json package-lock.json
git commit -m "Move tsx to production dependencies"
git push origin main
```

### ✅ Step 2: Verify environment variables in Railway
- AI_API_KEY ✓
- AI_BASE_URL ✓
- AI_MODEL ✓
- EMBED_MODEL ✓
- **DO NOT** set PORT (Railway handles this)

### ✅ Step 3: Check Railway Settings
- Go to Settings → General
- Build Command: (leave empty, npm install runs automatically)
- Start Command: `npm start`

### ✅ Step 4: Create data directory
The app needs a `data/` folder. Add a placeholder:
```bash
cd anycommand-chatbot-new
mkdir -p data
echo "# Data directory for embeddings" > data/README.md
git add data/README.md
git commit -m "Add data directory"
git push origin main
```

---

## View Railway Logs

1. Go to your Railway project
2. Click on your service
3. Click "Deployments" tab
4. Click on the latest deployment
5. Scroll down to see build and deploy logs

**Look for these errors:**
- `Error: Cannot find module 'tsx'` → Move tsx to dependencies (Step 1)
- `AI_API_KEY is not defined` → Add environment variables (Step 2)
- `EADDRINUSE` → Remove PORT from variables (Step 2)

---

## Test Locally Before Deploying

Always test locally first:

```bash
cd anycommand-chatbot-new

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
AI_API_KEY=your-key-here
AI_BASE_URL=https://api.openai.com
AI_MODEL=gpt-4o-mini
EMBED_MODEL=text-embedding-3-small
PORT=3000
EOF

# Run the server
npm start

# Test in browser
open http://localhost:3000
open http://localhost:3000/health
```

If it works locally, it should work on Railway!

---

## Still Having Issues?

1. **Check Railway Status**: https://status.railway.app
2. **Railway Docs**: https://docs.railway.app
3. **Railway Discord**: https://discord.gg/railway
4. **Share your deploy logs** with me and I can help diagnose

---

## Most Common Fix (90% of cases)

The most common issue is **tsx in devDependencies**. Run this:

```bash
cd anycommand-chatbot-new
npm install --save tsx
git add package.json
git commit -m "Fix: Move tsx to dependencies for Railway"
git push origin main
```

Then wait 1-2 minutes for Railway to auto-deploy. ✅

