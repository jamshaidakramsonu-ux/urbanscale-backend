# Your Independent Backend (Node + Express + Render)

Plain Node.js/Express code — fully yours. Render just hosts it; if you ever
want to move, this exact code runs on any VPS or other host unchanged.

## What's here
- `server.js` — the whole backend: one endpoint handling all 3 forms
- `package.json` — tells Node what packages to install
- `.env.example` — template for your keys

## One-time setup

### 1. Resend account (sends the emails)
https://resend.com → sign up → API Keys → create one → copy it.

### 2. Test it locally (optional but recommended)
```
npm install
cp .env.example .env
# edit .env: paste your Resend key and your email
npm run dev
```
Visit http://localhost:3000 — should say "Server is running."

### 3. Deploy to Render (free tier)
1. Go to https://render.com → sign up
2. Push this folder to a GitHub repo (or use Render's "deploy from folder" if offered)
3. Render dashboard → "New" → "Web Service" → connect your repo
4. Settings:
   - Build command: `npm install`
   - Start command: `npm start`
5. Under "Environment," add:
   - `RESEND_API_KEY`
   - `NOTIFY_EMAIL`
6. Deploy — Render gives you a live URL like `https://your-app.onrender.com`

Your forms endpoint is now: `https://your-app.onrender.com/api/submit-form`

## Connecting your frontend forms
Once you send me your exported Base44 frontend, I'll wire each form's submit
button to call this endpoint directly with the right fields. You won't need
to touch this part yourself.

## If you ever want off Render
This code has zero Render-specific dependencies. Copy the folder to any
machine with Node installed, run `npm install && npm start`, done.
