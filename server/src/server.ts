import dotenv from 'dotenv';
import os from 'os';
import type { Server } from 'http';
import app from './app.js';
import { config } from './config/config.js';

dotenv.config();

const PORT = Number(config.port) || 5000;

// 🔍 Get your local network IP (e.g. 192.168.x.x)
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

const localIP = getLocalIP();

const server: Server = app.listen(PORT, () => {
  console.log(`✅ Server running in ${config.nodeEnv || 'development'} mode`);
  console.log(`🌍 Local:     http://localhost:${PORT}`);
  console.log(`📱 Network:   http://${localIP}:${PORT}`);
});

process.on('unhandledRejection', (err: unknown) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  if (err instanceof Error) {
    console.error(err.name, err.message);
  } else {
    console.error(err);
  }
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
