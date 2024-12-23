const mongoose = require('mongoose');
const User = require('../crewRegistry/models/User');

class TreasureMap {
  constructor() {
    this.setupProjectSchema();
  }

  setupProjectSchema() {
    // Create a Mongoose schema for projects
    this.ProjectSchema = new mongoose.Schema({
      name: { 
        type: String, 
        required: true 
      },
      description: String,
      creator: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
      },
      collaborators: [{ 
        user: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'User' 
        },
        role: {
          type: String,
          enum: ['owner', 'maintainer', 'contributor', 'viewer'],
          default: 'viewer'
        },
        joinedAt: {
          type: Date,
          default: Date.now
        }
      }],
      technologies: [String],
      tags: [String],
      visibility: {
        type: String,
        enum: ['private', 'internal', 'public'],
        default: 'private'
      },
      status: {
        type: String,
        enum: ['planning', 'in-progress', 'completed', 'archived'],
        default: 'planning'
      },
      contributions: [{
        contributor: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'User' 
        },
        type: {
          type: String,
          enum: ['code', 'idea', 'resource', 'documentation']
        },
        description: String,
        timestamp: {
          type: Date,
          default: Date.now
        },
        status: {
          type: String,
          enum: ['pending', 'accepted', 'rejected'],
          default: 'pending'
        }
      }],
      createdAt: {
        type: Date,
        default: Date.now
      }
    });

    // Create the Project model
    this.Project = mongoose.model('Project', this.ProjectSchema);
  }

  async createProject(projectDetails, creatorId) {
    try {
      // Create project with creator as the first collaborator
      const project = new this.Project({
        ...projectDetails,
        creator: creatorId,
        collaborators: [{
          user: creatorId,
          role: 'owner'
        }]
      });

      await project.save();

      // Add project to user's projects
      await User.findByIdAndUpdate(creatorId, {
        $push: { projects: project._id }
      });

      return project;
    } catch (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }
  }

  async searchProjects(criteria, userId) {
    try {
      // Build search query
      const query = {};

      // Text search across multiple fields
      if (criteria.query) {
        query.$or = [
          { name: { $regex: criteria.query, $options: 'i' } },
          { description: { $regex: criteria.query, $options: 'i' } },
          { technologies: { $regex: criteria.query, $options: 'i' } },
          { tags: { $regex: criteria.query, $options: 'i' } }
        ];
      }

      // Visibility filtering
      query.$or = [
        { visibility: 'public' },
        { 
          visibility: 'internal', 
          'collaborators.user': userId 
        },
        { creator: userId }
      ];

      // Additional filters
      if (criteria.technologies) {
        query.technologies = { $in: criteria.technologies };
      }

      if (criteria.tags) {
        query.tags = { $in: criteria.tags };
      }

      if (criteria.status) {
        query.status = criteria.status;
      }

      // Perform search
      const projects = await this.Project
        .find(query)
        .populate('creator', 'username profile')
        .populate('collaborators.user', 'username profile')
        .limit(criteria.limit || 20)
        .sort({ createdAt: -1 });

      return projects;
    } catch (error) {
      throw new Error(`Project search failed: ${error.message}`);
    }
  }

  async recommendProjects(userId) {
    try {
      // Find user's skills and interests
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Extract user's skills and technologies
      const userSkills = user.skills.map(skill => skill.name);
      const userTechnologies = userSkills;

      // Recommendation algorithm
      const recommendations = await this.Project.aggregate([
        // Match public or user-related projects
        { 
          $match: { 
            $or: [
              { visibility: 'public' },
              { 'collaborators.user': mongoose.Types.ObjectId(userId) }
            ]
          }
        },
        // Add matching score
        {
          $addFields: {
            matchScore: {
              $size: {
                $setIntersection: [
                  "$technologies", 
                  userTechnologies
                ]
              }
            }
          }
        },
        // Sort by match score
        { $sort: { matchScore: -1 } },
        // Limit recommendations
        { $limit: 10 }
      ]);

      return recommendations;
    } catch (error) {
      throw new Error(`Project recommendations failed: ${error.message}`);
    }
  }

  async getProjectCollaborationOpportunities(userId) {
    try {
      // Find user's skills
      const user = await User.findById(userId);
      
      // Find projects looking for collaborators
      const opportunities = await this.Project.aggregate([
        // Match projects seeking collaborators
        { 
          $match: { 
            status: { $in: ['planning', 'in-progress'] },
            visibility: 'public',
            // Exclude projects user is already part of
            'collaborators.user': { $ne: mongoose.Types.ObjectId(userId) }
          }
        },
        // Add skill match score
        {
          $addFields: {
            skillMatchScore: {
              $size: {
                $setIntersection: [
                  "$technologies", 
                  user.skills.map(skill => skill.name)
                ]
              }
            }
          }
        },
        // Sort by skill match
        { $sort: { skillMatchScore: -1 } },
        // Limit opportunities
        { $limit: 20 }
      ]);

      return opportunities;
    } catch (error) {
      throw new Error(`Collaboration opportunities search failed: ${error.message}`);
    }
  }

  async createProjectInvitation(projectId, inviterId, inviteeEmail) {
    try {
      // Find invitee
      const invitee = await User.findOne({ email: inviteeEmail });
      
      if (!invitee) {
        throw new Error('Invitee not found');
      }

      // Create invitation (could be expanded to a separate Invitation model)
      const invitation = {
        project: projectId,
        inviter: inviterId,
        invitee: invitee._id,
        status: 'pending',
        createdAt: new Date()
      };

      // Notify invitee (could use a notification system)
      // For now, we'll just log it
      console.log(`Project invitation created: ${JSON.stringify(invitation)}`);

      return invitation;
    } catch (error) {
      throw new Error(`Project invitation failed: ${error.message}`);
    }
  }
}

module.exports = new TreasureMap();
