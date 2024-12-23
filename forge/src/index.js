const express = require('express');
  const http = require('http');
  const socketIo = require('socket.io');
  const treasureMap = require('./treasureMap');

  const app = express();
  const server = http.createServer(app);
  const io = socketIo(server);

  class ForgePlatform {
    constructor() {
      this.setupRoutes();
      this.setupSocketEvents();
    }

    setupRoutes() {
      // Search projects
      app.get('/projects/search', (req, res) => {
        try {
          const searchResults = treasureMap.searchProjects(req.query);
          res.json(searchResults);
        } catch (error) {
          res.status(400).json({ error: error.message });
        }
      });

      // Get project recommendations
      app.post('/projects/recommendations', (req, res) => {
        try {
          const recommendations = treasureMap.recommendProjects(req.body);
          res.json(recommendations);
        } catch (error) {
          res.status(400).json({ error: error.message });
        }
      });
    }

    setupSocketEvents() {
      io.on('connection', (socket) => {
        console.log('New explorer connected to the Treasure Map');

        // Create a new project
        socket.on('create_project', (projectDetails) => {
          try {
            const project = treasureMap.createProject(projectDetails);
            socket.emit('project_created', project);
            
            // Broadcast to other users
            socket.broadcast.emit('new_project_discovered', project);
          } catch (error) {
            socket.emit('error', { 
              message: `Failed to chart new project: ${error.message}` 
            });
          }
        });

        // Add collaboration to a project
        socket.on('add_collaboration', (collaborationDetails) => {
          try {
            const collaboration = treasureMap.addCollaboration(
              collaborationDetails.projectId, 
              collaborationDetails
            );
            socket.emit('collaboration_added', collaboration);
          } catch (error) {
            socket.emit('error', { 
              message: `Failed to log collaboration: ${error.message}` 
            });
          }
        });

        // Start a project discussion
        socket.on('start_discussion', (discussionDetails) => {
          try {
            const discussion = treasureMap.startDiscussion(
              discussionDetails.projectId, 
              discussionDetails
            );
            socket.emit('discussion_started', discussion);
          } catch (error) {
            socket.emit('error', { 
              message: `Failed to start discussion: ${error.message}` 
            });
          }
        });

        // Add message to a discussion
        socket.on('add_discussion_message', (messageDetails) => {
          try {
            const message = treasureMap.addDiscussionMessage(
              messageDetails.projectId,
              messageDetails.discussionId,
              messageDetails
            );
            socket.emit('discussion_message_added', message);
          } catch (error) {
            socket.emit('error', { 
              message: `Failed to add message: ${error.message}` 
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
    console.log(`⚓ Treasure Map unfurled on port ${PORT}`);
  });
