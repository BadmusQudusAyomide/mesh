# Mesh Frontend

This is the React frontend for Mesh, a social platform with profiles, a feed, messaging, notifications, and PWA support.

## Built With

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Socket.IO client

## Main Features

- Login, signup, OAuth callback handling, and password reset screens
- Protected app routes for feed, profile, followers, inbox, chat, and alerts
- Paginated home feed with posting, likes, comments, and follow actions
- Rich chat experience with media uploads, voice notes, reactions, replies, and search
- Realtime notifications and conversation updates
- Installable PWA with push notification support

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Environment

The frontend reads its API base URL from Vite environment variables.

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=mesh_unsigned
```
