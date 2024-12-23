
  const mongoose = require('mongoose');
  const User = require('./crewRegistry/models/User');

  // Extend existing TreasureMap with user-centric features
  class EnhancedTreasureMap {
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
        discussions: [{
          title: String,
          initiator: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User' 
          },
          messages: [{
            sender: { 
              type: mongoose.Schema.Types.ObjectId, 
              ref: 'User' 
            },
            content: String,
            timestamp: {
              type: Date,
              default: Date.now
            }
          }],
          status: {
            type: String,
            enum: ['open', 'closed'],
            default: 'open'
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

    async inviteCollaborator(projectId, inviterId, collaboratorEmail, role = 'contributor') {
      try {
        // Find the collaborator by email
        const collaborator = await User.findOne({ email: collaboratorEmail });
        
        if (!collaborator) {
          throw new Error('Collaborator not found');
        }

        // Update project with new collaborator
        const project = await this.Project.findByIdAndUpdate(
          projectId,
          {
            $push: { 
              collaborators: {
                user: collaborator._id,
                role: role
              }
            }
          },
          { new: true }
        );

        // Add project to collaborator's projects
        await User.findByIdAndUpdate(collaborator._id, {
          $push: { projects: projectId }
        });

        return project;
      } catch (error) {
        throw new Error(`Failed to invite collaborator: ${error.message}`);
      }
    }

    async submitContribution(projectId, contributorId, contributionDetails) {
      try {
        const project = await this.Project.findByIdAndUpdate(
          projectId,
          {
            $push: { 
              contributions: {
                contributor: contributorId,
                ...contributionDetails
              }
            }
          },
          { new: true }
        );

        // Award reputation points for contribution
        const contributor = await User.findById(contributorId);
        contributor.updateReputation(50);
        await contributor.save();

        return project;
      } catch (error) {
        throw new Error(`Failed to submit contribution: ${error.message}`);
      }
    }

    async searchProjects(criteria, userId) {
      try {
        // Build search query
        const query = {};

        // Add visibility filtering
        query.$or = [
          { visibility: 'public' },
          { 
            visibility: 'internal', 
            'collaborators.user': userId 
          },
          { creator