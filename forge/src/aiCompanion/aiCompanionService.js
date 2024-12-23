const axios = require('axios');
  const AIProvider = require('./apiKeyModel');

  class AICompanionService {
    async addAPIKey(userId, providerDetails) {
      try {
        // Check if user already has this provider
        const existingProvider = await AIProvider.findOne({
          user: userId,
          provider: providerDetails.provider
        });

        if (existingProvider) {
          // Update existing provider
          existingProvider.apiKey = providerDetails.apiKey;
          existingProvider.isActive = providerDetails.isActive ?? true;
          existingProvider.permissions = {
            ...existingProvider.permissions,
            ...providerDetails.permissions
          };

          await existingProvider.save();
          return existingProvider;
        }

        // Create new provider entry
        const newProvider = new AIProvider({
          user: userId,
          ...providerDetails
        });

        await newProvider.save();
        return newProvider;
      } catch (error) {
        throw new Error(`Failed to add AI provider: ${error.message}`);
      }
    }

    async listProviders(userId) {
      return await AIProvider.find({ 
        user: userId 
      }).select('-apiKey');
    }

    async generateCode(userId, projectContext) {
      // Find active providers for the user
      const providers = await AIProvider.find({ 
        user: userId, 
        isActive: true,
        'permissions.codeGeneration': true
      });

      if (providers.length === 0) {
        throw new Error('No active AI providers for code generation');
      }

      // For now, use the first provider
      const provider = providers[0];
      const apiKey = provider.decryptApiKey();

      // Provider-specific code generation logic
      switch(provider.provider) {
        case 'openai':
          return this.openAICodeGeneration(apiKey, projectContext);
        case 'anthropic':
          return this.anthropicCodeGeneration(apiKey, projectContext);
        default:
          throw new Error('Unsupported AI provider');
      }
    }

    async openAICodeGeneration(apiKey, context) {
      try {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system", 
                content: "You are a helpful code generation assistant."
              },
              {
                role: "user", 
                content: `Generate code for: ${JSON.stringify(context)}`
              }
            ]
          },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        return response.data.choices[0].message.content;
      } catch (error) {
        throw new Error(`OpenAI code generation failed: ${error.message}`);
      }
    }

    async anthropicCodeGeneration(apiKey, context) {
      // Similar implementation for Anthropic
      // Placeholder for future implementation
      throw new Error('Anthropic not yet supported');
    }
  }

  module.exports = new AICompanionService();
