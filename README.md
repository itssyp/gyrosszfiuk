# Gyrosszfiuk

Vite + React + TypeScript frontend with Firebase Authentication, Firestore,
Hosting, and local emulator configuration.

## Setup

1. Create a Firebase project and register a web app.
2. Copy `.env.example` to `.env.local` and add the web app configuration.
3. Install and authenticate the Firebase CLI:
   `npm install -g firebase-tools` and `firebase login`.
4. Associate this directory with the project: `firebase use --add`.
5. Start the frontend: `npm run dev`.

Build with `npm run build` and deploy with `firebase deploy`.

The initial Firestore rules require an authenticated user. Adjust them for the
application's data model before production use.
