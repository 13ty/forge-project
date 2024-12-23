const jwt = require('jsonwebtoken');
  const User = require('./models/User');

  class AuthService {
    constructor() {
      // In a real-world scenario, this would come from environment variables
      this.JWT_SECRET = 'your_super_secret_pirate_treasure_key';
    }

    async registerUser(userData) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({
          $or: [
            { email: userData.email },
            { username: userData.username }
          ]
        });

        if (existingUser) {
          throw new Error('User with this email or username already exists');
        }

        // Create new user
        const user = new User(userData);
        await user.save();

        // Generate JWT token
        const token = this.generateToken(user);

        return {
          user: this.sanitizeUser(user),
          token
        };
      } catch (error) {
        throw error;
      }
    }

    async loginUser(credentials) {
      const { username, password } = credentials;

      const user = await User.findOne({ username });
      if (!user) {
        throw new Error('User not found');
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = this.generateToken(user);

      return {
        user: this.sanitizeUser(user),
        token
      };
    }

    generateToken(user) {
      return jwt.sign(
        { 
          id: user._id, 
          username: user.username,
          roles: user.roles 
        },
        this.JWT_SECRET,
        { expiresIn: '7d' }
      );
    }

    verifyToken(token) {
      try {
        return jwt.verify(token, this.JWT_SECRET);
      } catch (error) {
        throw new Error('Invalid or expired token');
      }
    }

    sanitizeUser(user) {
      const userObject = user.toObject();
      delete userObject.password;
      return userObject;
    }

    async addUserSkill(userId, skillData) {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.skills.push({
        name: skillData.name,
        level: skillData.level || 'Novice',
        endorsements: 0
      });

      await user.save();
      return this.sanitizeUser(user);
    }

    async endorseSkill(endorserId, userId, skillId) {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const skill = user.skills.id(skillId);
      if (!skill) {
        throw new Error('Skill not found');
      }

      skill.endorsements += 1;
      await user.save();

      // Award reputation points for skill endorsement
      user.updateReputation(10);
      await user.save();

      return this.sanitizeUser(user);
    }
  }

  module.exports = new AuthService();
