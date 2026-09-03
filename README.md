# Employee Attendance Portal

A small React + Express attendance gateway. It checks the requesting network's public IP on the **server** before the React interface shows a button for the Google Form. MongoDB is intentionally not included: there is no need to persist data for this access check, and the app does not log employee IP addresses.

## Project layout

```text
attendance-system/
├── client/                 # React + Vite user interface
│   ├── src/App.jsx
│   ├── src/main.jsx
│   ├── src/styles.css
│   └── .env.example
├── server/                 # Express API
│   ├── routes/ip.js
│   ├── server.js
│   └── .env.example
└── package.json
```

## Setup

Prerequisite: install Node.js 20 LTS or newer.

```powershell
Copy-Item client/.env.example client/.env
Copy-Item server/.env.example server/.env
npm install
npm run install:all
npm run dev
```

Open `http://localhost:5173`. Set `VITE_GOOGLE_FORM_URL` in `client/.env` to the real Google Form URL before use. The Vite development server forwards `/api` requests to Express at port 5000.

For a production client build:

```powershell
npm run build
npm run start
```

Serve `client/dist` with a web server and configure that web server to forward `/api` to the Express service. Set `CLIENT_ORIGIN` in `server/.env` to the exact HTTPS origin of the deployed client, for example `https://attendance.example.org`.

## Environment variables

`client/.env`

```dotenv
VITE_GOOGLE_FORM_URL=https://forms.gle/your-real-form-id
```

`server/.env`

```dotenv
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
TRUST_PROXY=false
ALLOWED_PUBLIC_IP=196.188.112.77
```

Restart the relevant development process after changing either `.env` file. Do not commit the real `.env` files.

## API

`GET /api/check-ip` returns a non-cacheable response:

```json
{ "allowed": true, "ip": "196.188.112.77" }
```

The route reads the connecting address through Express's `req.ip`, normalizes IPv4-mapped IPv6 values such as `::ffff:196.188.112.77`, and compares it on the server. The browser cannot authorize itself by changing the React code; the UI only reflects the server response.

## Deploying safely behind a proxy

By default `TRUST_PROXY=false`, which means Express ignores forwarded-IP headers and uses the direct socket address. This is the safe setting for a directly exposed Express app.

If Express is behind exactly one trusted reverse proxy or load balancer that removes/replaces incoming `X-Forwarded-For`, set `TRUST_PROXY=1`. Alternatively, use a narrow Express/proxy-addr range such as `loopback` if that precisely describes your deployment. Never set `TRUST_PROXY=true` on a publicly reachable server: a client could send a spoofed `X-Forwarded-For` header. Configure the proxy to overwrite, not append to, the client-supplied forwarding headers.

Test deployment from a real organization Wi-Fi connection. Local development normally reports `::1` or `127.0.0.1`, which correctly will not match the organization public IP.

## Important network limitation

This rule works only when the organization's internet gateway actually has the fixed public IP `196.188.112.77`. If its ISP changes that public IP, an administrator must update `ALLOWED_PUBLIC_IP` and restart the backend. Employees using mobile data, a VPN, another Wi-Fi network, or any other internet connection will normally have another public IP and will be denied.

The Google Form URL is necessarily visible to an authorized browser after the Continue button is displayed. If the form itself must be protected from direct-link sharing, also configure access controls in Google Forms (for example, organization sign-in restrictions); IP gating alone cannot make a third-party form private.
