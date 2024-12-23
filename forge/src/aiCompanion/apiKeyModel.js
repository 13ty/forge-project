const mongoose = require('mongoose');

  const AIProviderSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    provider: {
      type: String,
      enum: [
        'openai', 
        'anthropic', 
        'google_vertex', 
        'hugging_face', 
        'custom'
      ],
      required: true
    },
    apiKey: {
      type: String,
      required: true,
      select: false // Hide API key from standard queries
    },
    nickname: {
      type: String,
      default: function() {
        return `${this.provider.charAt(0).toUpperCase() + this.provider.slice(1)} Companion`;
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    permissions: {
      codeGeneration: { type: Boolean, default: true },
      projectAnalysis: { type: Boolean, default: true },
      debugAssistance: { type: Boolean, default: true }
    },
    lastUsed: {
      type: Date,
      default: Date.now
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });

  // Encryption middleware for API key
  AIProviderSchema.pre('save', function(next) {
    if (this.isModified('apiKey')) {
      // In production, use a more robust encryption method
      this.apiKey = Buffer.from(this.apiKey).toString('base64');
    }
    next();
  });

  AIProviderSchema.methods.decryptApiKey = function() {
    // Corresponding decryption method
    return Buffer.from(this.apiKey, 'base64').toString('utf-8');
  };

  module.exports = mongoose.model('AIProvider', AIProviderSchema);
