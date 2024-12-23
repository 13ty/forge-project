const express = require('express');
  const router = express.Router();
  const treasureMap = require('./treasureMap');

  // Create Project
  router.post('/', async (req, res) => {
    try {
      const project = await treasureMap.createProject(
        req.body, 
        req.user._id
      );
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Search Projects
  router.get('/search', async (req, res) => {
    try {
      const projects = await treasureMap.searchProjects(
        req.query, 
        req.user._id
      );
      res.json(projects);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get Project Recommendations
  router.get('/recommendations', async (req, res) => {
    try {
      const recommendations = await treasureMap.recommendProjects(
        req.user._id
      );
      res.json(recommendations);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get Collaboration Opportunities
  router.get('/opportunities', async (req, res) => {
    try {
      const opportunities = await treasureMap.getProjectCollaborationOpportunities(
        req.user._id
      );
      res.json(opportunities);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Invite Collaborator
  router.post('/:projectId/invite', async (req, res) => {
    try {
      const invitation = await treasureMap.createProjectInvitation(
        req.params.projectId,
        req.user._id,
        req.body.inviteeEmail
      );
      res.status(201).json(invitation);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  module.exports = router;
