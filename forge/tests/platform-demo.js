const axios = require('axios');
  require('dotenv').config();

  class ForgePlatformDemo {
    constructor() {
      this.baseURL = `http://localhost:${process.env.PORT || 3000}`;
      this.token = null;
      this.userId = null;
    }

    async request(method, url, data = null, headers = {}) {
      try {
        const config = {
          method,
          url: `${this.baseURL}${url}`,
          ...(data ? { data } : {}),
          headers: {
            ...headers,
            ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {})
          }
        };

        const response = await axios(config);
        return response.data;
      } catch (error) {
        console.error(`Request failed: ${method} ${url}`, 
          error.response?.data || error.message
        );
        throw error;
      }
    }

    async registerUser() {
      const userData = {
        username: `pirate_${Math.random().toString(36).substr(2, 9)}`,
        email: `pirate_${Math.random().toString(36).substr(2, 9)}@forge.com`,
        password: 'SecurePassword123!'
      };

      const result = await this.request('POST', '/auth/register', userData);
      this.token = result.token;
      this.userId = result.user._id;

      console.log('🏴 User Registration Successful');
      return result;
    }

    async addUserSkills() {
      const skills = [
        { name: 'JavaScript', level: 'Journeyman' },
        { name: 'Python', level: 'Apprentice' },
        { name: 'React', level: 'Apprentice' }
      ];

      const skillResults = await Promise.all(
        skills.map(skill => 
          this.request('POST', `/auth/${this.userId}/skills`, skill)
        )
      );

      console.log('🛠️ Skills Added Successfully');
      return skillResults;
    }

    async createProject() {
      const projectDetails = {
        name: `Treasure Hunt Project ${Math.random().toString(36).substr(2, 9)}`,
        description: 'An epic project to find digital treasure',
        technologies: ['JavaScript', 'React'],
        tags: ['web', 'adventure']
      };

      const project = await this.request('POST', '/projects', projectDetails);
      console.log('🚢 Project Created Successfully');
      return project;
    }

    async searchProjects() {
      const searchResults = await this.request('GET', '/projects/search?query=treasure');
      console.log('🔍 Project Search Successful');
      return searchResults;
    }

    async addAIProvider() {
      const providerDetails = {
        provider: 'openai',
        apiKey: process.env.OPENAI_API_KEY || 'sk-dummy-key-for-testing',
        nickname: 'GPT Companion'
      };

      const provider = await this.request('POST', '/ai/providers', providerDetails);
      console.log('🤖 AI Provider Added Successfully');
      return provider;
    }

    async generateProjectCode() {
      const codeGenerationContext = {
        projectType: 'web',
        language: 'JavaScript',
        framework: 'React',
        description: 'Simple todo list application'
      };

      const generatedCode = await this.request('POST', '/ai/generate-code', codeGenerationContext);
      console.log('💻 Code Generation Successful');
      return generatedCode;
    }

    async runFullDemoScenario() {
      try {
        console.log('🏴‍☠️ Starting Forge Platform Demo Scenario 🏴‍☠️');
        
        await this.registerUser();
        await this.addUserSkills();
        const project = await this.createProject();
        await this.searchProjects();
        await this.addAIProvider();
        const generatedCode = await this.generateProjectCode();

        console.log('\n🎉 Forge Platform Demo Completed Successfully! 🎉');
        return {
          user: this.userId,
          project: project,
          generatedCode: generatedCode
        };
      } catch (error) {
        console.error('❌ Demo Scenario Failed', error);
        throw error;
      }
    }
  }

  // Run demo if script is executed directly
  if (require.main === module) {
    const demo = new ForgePlatformDemo();
    demo.runFullDemoScenario()
      .then(result => console.log('Demo Result:', result))
      .catch(error => console.error('Demo Error:', error));
  }

  module.exports = ForgePlatformDemo;
