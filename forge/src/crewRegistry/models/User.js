const mongoose = require('mongoose');
  const bcrypt = require('bcrypt');

  const UserSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    profile: {
      firstName: String,
      lastName: String,
      avatar: String,
      bio: String
    },
    skills: [{
      name: String,
      level: {
        type: String,
        enum: ['Novice', 'Apprentice', 'Journeyman', 'Master', 'Legendary']
      },
      endorsements: Number
    }],
    roles: [{
      type: String,
      enum: ['sailor', 'captain', 'navigator', 'quartermaster', 'admin'],
      default: 'sailor'
    }],
    projects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    }],
    reputation: {
      points: { type: Number, default: 0 },
      level: {
        type: String,
        enum: ['Landlubber', 'Deck Hand', 'First Mate', 'Captain', 'Pirate Legend'],
        default: 'Landlubber'
      }
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastLogin: Date
  });

  // Hash password before saving
  UserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  });

  // Method to check password
  UserSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };

  // Generate pirate-themed reputation level
  UserSchema.methods.updateReputation = function(points) {
    this.reputation.points += points;
    
    const levels = [
      { threshold: 0, level: 'Landlubber' },
      { threshold: 100, level: 'Deck Hand' },
      { threshold: 500, level: 'First Mate' },
      { threshold: 1000, level: 'Captain' },
      { threshold: 5000, level: 'Pirate Legend' }
    ];

    const currentLevel = levels.reverse().find(l => 
      this.reputation.points >= l.threshold
    );

    this.reputation.level = currentLevel.level;
    return this;
  };

  module.exports = mongoose.model('User', UserSchema);
