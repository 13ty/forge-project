const fs = require('fs');
  const path = require('path');
  const { EventEmitter } = require('events');

  class TreasureMap extends EventEmitter {
    constructor() {
      super();
      this.projectsDirectory = path.join(__dirname, '../treasure-vault');
      this.ensureProjectDirectoryExists();
      this.projects = new Map();
      this.loadExistingProjects();
    }

    ensureProjectDirectoryExists() {
      if (!fs.existsSync(this.projectsDirectory)) {
        fs.mkdirSync(this.projectsDirectory, { recursive: true });
      }
    }

    loadExistingProjects() {
      const projectFiles = fs.readdirSync(this.projectsDirectory)
        .filter(file => file.endsWith('.json'));
      
      projectFiles.forEach(file => {
        const projectPath = path.join(this.projectsDirectory, file);
        try {
          const project = JSON.parse(fs.readFileSync(projectPath, 'utf8'));
          this.projects.set(project.id, project);
        } catch (error) {
          console.error(`Failed to load project ${file}`, error);
        }
      });
    }

    createProject(projectDetails) {
      const project = {
        id: this.generateProjectId(),
        name: projectDetails.name,
        description: projectDetails.description,
        tags: projectDetails.tags || [],
        visibility: projectDetails.visibility || 'private',
        creator: projectDetails.creator,
        createdAt: new Date(),
        collaborators: [projectDetails.creator],
        technologies: projectDetails.technologies || [],
        status: 'planning',
        contributions: [],
        discussions: []
      };

      // Save project to file
      const projectPath = path.join(
        this.projectsDirectory, 
        `${project.id}.json`
      );
      fs.writeFileSync(projectPath, JSON.stringify(project, null, 2));

      this.projects.set(project.id, project);
      
      this.emit('project_created', project);

      return project;
    }

    searchProjects(criteria) {
      return Array.from(this.projects.values()).filter(project => {
        return Object.entries(criteria).every(([key, value]) => {
          if (Array.isArray(project[key])) {
            return project[key].some(item => 
              item.toString().toLowerCase().includes(value.toString().toLowerCase())
            );
          }
          return project[key]?.toString().toLowerCase().includes(value.toString().toLowerCase());
        });
      });
    }

    addCollaboration(projectId, collaborationDetails) {
      const project = this.projects.get(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      const collaboration = {
        id: this.generateCollaborationId(),
        type: collaborationDetails.type, // 'code', 'idea', 'resource'
        contributor: collaborationDetails.contributor,
        description: collaborationDetails.description,
        timestamp: new Date(),
        status: 'pending'
      };

      project.contributions.push(collaboration);

      // Update project file
      const projectPath = path.join(
        this.projectsDirectory, 
        `${projectId}.json`
      );
      fs.writeFileSync(projectPath, JSON.stringify(project, null, 2));

      this.emit('collaboration_added', {
        projectId,
        collaboration
      });

      return collaboration;
    }

    startDiscussion(projectId, discussionDetails) {
      const project = this.projects.get(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      const discussion = {
        id: this.generateDiscussionId(),
        title: discussionDetails.title,
        initiator: discussionDetails.initiator,
        content: discussionDetails.content,
        timestamp: new Date(),
        messages: [],
        status: 'open'
      };

      project.discussions.push(discussion);

      // Update project file
      const projectPath = path.join(
        this.projectsDirectory, 
        `${projectId}.json`
      );
      fs.writeFileSync(projectPath, JSON.stringify(project, null, 2));

      this.emit('discussion_started', {
        projectId,
        discussion
      });

      return discussion;
    }

    addDiscussionMessage(projectId, discussionId, messageDetails) {
      const project = this.projects.get(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      const discussion = project.discussions.find(d => d.id === discussionId);
      if (!discussion) {
        throw new Error('Discussion not found');
      }

      const message = {
        id: this.generateMessageId(),
        sender: messageDetails.sender,
        content: messageDetails.content,
        timestamp: new Date()
      };

      discussion.messages.push(message);

      // Update project file
      const projectPath = path.join(
        this.projectsDirectory, 
        `${projectId}.json`
      );
      fs.writeFileSync(projectPath, JSON.stringify(project, null, 2));

      this.emit('discussion_message_added', {
        projectId,
        discussionId,
        message
      });

      return message;
    }

    generateProjectId() {
      return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateCollaborationId() {
      return `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateDiscussionId() {
      return `disc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateMessageId() {
      return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Pirate-themed project recommendation system
    recommendProjects(userProfile) {
      const allProjects = Array.from(this.projects.values());
      
      // Simple recommendation based on technologies and tags
      return allProjects
        .filter(project => project.visibility === 'public')
        .map(project => ({
          project,
          matchScore: this.calculateProjectMatchScore(project, userProfile)
        }))
        .filter(({ matchScore }) => matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5)
        .map(({ project }) => project);
    }

    calculateProjectMatchScore(project, userProfile) {
      let score = 0;

      // Match technologies
      const techMatch = project.technologies.filter(tech => 
        userProfile.technologies.includes(tech)
      ).length;
      score += techMatch * 2;

      // Match tags
      const tagMatch = project.tags.filter(tag => 
        userProfile.interests.includes(tag)
      ).length;
      score += tagMatch;

      return score;
    }
  }

  module.exports = new TreasureMap();
