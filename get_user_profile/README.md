
# Display your Spotify Profile Data in a Web App

This is the final code for the Spotify Web API - How to Display your Profile Data in a Web App. You can run this demo directly or [walk through the tutorial](https://developer.spotify.com/documentation/web-api/howtos/web-app-profile).

## Pre-requisites

To run this demo you will need:

- A [Node.js LTS](https://nodejs.org/en/) environment or later.
- A [Spotify Developer Account](https://developer.spotify.com/)

## Usage

Create an app in your [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/), set the redirect URI to match your environment (for example `http://localhost:3000/callback` for local development) and copy your Client ID.

In this directory, create a `.env.local` file and add your Spotify Client ID and redirect URI:

```env
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/callback
```

If you need different redirect URIs for multiple environments (development, production, etc.), create environment specific files such as `.env.development.local` or `.env.production.local` and override `NEXT_PUBLIC_REDIRECT_URI` with the appropriate value.

Install dependencies and start the development server:

```bash
npm install
npm run dev
```
