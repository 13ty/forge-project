const express = require('express');
  const router = express.Router();
  const User = require('./models/User');
  const authService = require('./authService');
  const authMiddleware = require('../middleware/authMiddleware');

  // User Registration
  router.post('/register', async (req, res) => {
    try {
      const result = await authService.registerUser(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // User Login
  router.post('/login', async (req, res) => {
    try {
      const result = await authService.loginUser(req.body);
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  });

  // Add User Skill
  router.post('/:userId/skills', authMiddleware, async (req, res) => {
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
  router.post('/:userId/skills/:skillId/endorse', authMiddleware, async (req, res) => {
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

  // Get User Profile
  router.get('/profile', authMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.user._id)
        .select('-password')
        .populate('projects');
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  module.exports = router;
