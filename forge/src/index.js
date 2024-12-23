require('dotenv').config();
  const express = require('express');
  const http = require('http');
  const socketIo = require('socket.io');
  const database = require('./config/database');
  const authMiddleware = require('./middleware/authMiddleware');

  // Import route modules
  const authRoutes = require('./crewRegistry/authRoutes');
  const projectRoutes = require('./treasureMap/projectRoutes');
  const aiRoutes = require('./aiCompanion/aiRoutes');

  const app = express();
  const server = http.createServer(app);
  const io = socketIo(server);

  // Middleware
  app.use(express.json());

  // Routes
  app.use('/auth', authRoutes);
  app.use('/projects', authMiddleware, projectRoutes);
  app.use('/ai', authMiddleware, aiRoutes);

  // Database connection
  database.connect().then(() => {
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`⚓ Forge Platform sailing on port ${PORT}`);
    });
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await database.disconnect();
    process.exit(0);
  });
