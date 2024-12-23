const express = require('express');
  const router = express.Router();
  const aiCompanionService = require('./aiCompanionService');

  // Add AI Provider
  router.post('/providers', async (req, res) => {
    try {
      const provider = await aiCompanionService.addAPIKey(
        req.user._id, 
        req.body
      );
      res.status(201).json(provider);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // List AI Providers
  router.get('/providers', async (req, res) => {
    try {
      const providers = await aiCompanionService.listProviders(req.user._id);
      res.json(providers);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Generate Code
  router.post('/generate-code', async (req, res) => {
    try {
      const generatedCode = await aiCompanionService.generateCode(
        req.user._id, 
        req.body
      );
      res.json({ code: generatedCode });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  module.exports = router;
