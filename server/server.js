import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ipRouter from './routes/ip.js';

const app = express();
const port = Number(process.env.PORT || 5000);
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const clientDistDirectory = path.resolve(currentDirectory, '../client/dist');

function trustProxySetting(value = 'false') {
  const trimmed = value.trim().toLowerCase();
  if (trimmed === 'false') return false;
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  // Express supports named proxy-addr trust ranges such as "loopback".
  return trimmed.split(',').map((item) => item.trim());
}

app.set('trust proxy', trustProxySetting(process.env.TRUST_PROXY));

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((origin) => origin.trim());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use('/api', ipRouter);

// Render builds the React client before starting this service. Serve those
// static files from the same origin so browser requests to /api stay local.
app.use(express.static(clientDistDirectory));
app.get(/^(?!\/api(?:\/|$)).*/, (_req, res) => {
  res.sendFile(path.join(clientDistDirectory, 'index.html'));
});

app.use((error, _req, res, _next) => {
  console.error('Unhandled API error:', error);
  res.status(500).json({ error: 'Unable to check network access.' });
});

app.listen(port, () => console.log(`Attendance API listening on port ${port}`));
