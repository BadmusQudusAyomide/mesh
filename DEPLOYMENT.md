# Mesh - Deployment Guide

## 🚀 Deploying to Vercel

### 1. Frontend Deployment (Vercel)

The `vercel.json` file is already configured to handle client-side routing. This prevents 404 errors when refreshing pages.

### 2. Environment Variables

Before deploying, set these environment variables in your Vercel project:

```bash
# Backend API URL (Railway deployment)
VITE_API_URL=https://mezzzzhh-production.up.railway.app/api

# Optional
VITE_APP_NAME=Mesh
VITE_APP_VERSION=1.0.0
```

**✅ Backend Deployed**: Your Railway backend is now live at `https://mezzzzhh-production.up.railway.app`

### 3. Backend Deployment

You'll need to deploy your backend separately. Options include:

- **Railway**: Easy deployment with MongoDB integration
- **Render**: Free tier available
- **Heroku**: Paid service
- **DigitalOcean**: More control

### 4. Update Backend URL

After deploying your backend, update the `VITE_API_URL` environment variable in Vercel with your actual backend URL.

### 5. CORS Configuration

Make sure your backend allows requests from your Vercel domain. Update your backend CORS settings:

```javascript
// In your backend server.js
app.use(
  cors({
    origin: ["https://mesh-blush.vercel.app", "http://localhost:5173"],
    credentials: true,
  })
);
```

## 🔧 Local Development

1. **Frontend**: `npm run dev` (runs on http://localhost:5173)
2. **Backend**: `npm start` (runs on http://localhost:5000)

## 📝 Notes

- The `vercel.json` file handles client-side routing
- Environment variables must be prefixed with `VITE_` to be accessible in the frontend
- Make sure your backend is deployed and accessible before setting the `VITE_API_URL`
