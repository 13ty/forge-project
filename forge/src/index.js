const express = require('express');
  const http = require('http');
  const socketIo = require('socket.io');
  const mongoose = require('mongoose');
  const authService = require('./crewRegistry/authService');
  const User = require('./crewRegistry/models/User');

  const app = express();
  const server = http.createServer(app);
  const io = socketIo(server);

  // Middleware
  app.use(express.json());

  // MongoDB Connection
  mongoose.connect('mongodb://localhost:27017/forge-platform', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  class ForgePlatform {
    constructor() {
      this.setupRoutes();
      this.setupSocketEvents();
    }

    setupRoutes() {
      // User Registration
      app.post('/auth/register', async (req, res) => {
        try {
          const result = await authService.registerUser(req.body);
          res.status(201).json(result);
        } catch (error) {
          res.status(400).json({ error: error.message });
        }
      });

      // User Login
      app.post('/auth/login', async (req, res) => {
        try {
          const result = await authService.loginUser(req.body);
          res.json(result);
        } catch (error) {
          res.status(401).json({ error: error.message });
        }
      });

      // Add User Skill
      app.post('/users/:userId/skills', async (req, res) => {
        try {
          const skill = await authService.addUserSkill(
            req.params.userId, 
            req.body
          );
          res.status(201).json(skill);
        } catch (error) {
          res.status(400).json({ error: error.message });
        }
      });

      // Endorse Skill
      app.post('/users/:userId/skills/:skillId/endorse', async (req, res) => {
        try {
          const user = await authService.endorseSkill(
            req.body.endorserId,
            req.params.userId,
            req.params.skillId
          );
          res.json(user);
        } catch (error) {
          res.status(400).json({ error: error.message });
        }
      });
    }

    setupSocketEvents() {
      io.on('connection', (socket) => {
        console.log('New crew member connected');

        // Socket events for real-time user interactions
        socket.on('update_profile', async (profileData) => {
          try {
            const user = await User.findByIdAndUpdate(
              profileData.userId, 
              { profile: profileData.profile },
              { new: true }
            );
            
            socket.emit('profile_updated', authService.sanitizeUser(user));
          } catch (error) {
            socket.emit('error', { 
              message: `Failed to update profile: ${error.message}` 
            });
          }
        });
      });
    }
  }

  // Initialize Forge Platform
  const forge = new ForgePlatform();

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`⚓ Crew Registry operational on port ${PORT}`);
  });
