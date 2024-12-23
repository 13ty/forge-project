const fs = require('fs');
  const path = require('path');
  const { v4: uuidv4 } = require('uuid');

  class AlexandriaLibrary {
    constructor() {
      this.libraryPath = path.join(__dirname, '../library');
      this.ensureLibraryStructure();
    }

    ensureLibraryStructure() {
      const directories = [
        'templates',
        'projects',
        'snippets',
        'documentation'
      ];

      directories.forEach(dir => {
        const fullPath = path.join(this.libraryPath, dir);
        if (!fs.existsSync(fullPath)) {
          fs.mkdirSync(fullPath, { recursive: true });
        }
      });
    }

    createProjectTemplate(templateDetails) {
      const templateId = uuidv4();
      const templatePath = path.join(
        this.libraryPath, 
        'templates', 
        `${templateId}_${templateDetails.name}`
      );

      // Create template metadata
      const templateMetadata = {
        id: templateId,
        name: templateDetails.name,
        type: templateDetails.type,
        description: templateDetails.description,
        createdAt: new Date(),
        tags: templateDetails.tags || []
      };

      // Write metadata
      fs.writeFileSync(
        path.join(templatePath, 'template.json'),
        JSON.stringify(templateMetadata, null, 2)
      );

      // Create basic template structure
      fs.mkdirSync(templatePath, { recursive: true });
      
      return {
        id: templateId,
        path: templatePath
      };
    }

    listTemplates(filters = {}) {
      const templatesDir = path.join(this.libraryPath, 'templates');
      const templates = fs.readdirSync(templatesDir)
        .filter(file => fs.statSync(path.join(templatesDir, file)).isDirectory())
        .map(templateDir => {
          const metadataPath = path.join(templatesDir, templateDir, 'template.json');
          return JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        });

      // Simple filtering logic
      return templates.filter(template => {
        return Object.entries(filters).every(([key, value]) => 
          template[key] === value
        );
      });
    }

    generateProjectFromTemplate(templateId, projectName) {
      const templatePath = path.join(
        this.libraryPath, 
        'templates', 
        `${templateId}_*`
      );

      // In a real implementation, this would use more robust path matching
      const matchingTemplates = fs.readdirSync(
        path.join(this.libraryPath, 'templates')
      ).filter(dir => dir.startsWith(templateId));

      if (matchingTemplates.length === 0) {
        throw new Error('Template not found');
      }

      const sourcePath = path.join(
        this.libraryPath, 
        'templates', 
        matchingTemplates[0]
      );
      const destinationPath = path.join(
        __dirname, 
        '../projects', 
        `${projectName}_${uuidv4()}`
      );

      // Copy template files
      this.copyRecursiveSync(sourcePath, destinationPath);

      return {
        projectPath: destinationPath,
        templateId: templateId
      };
    }

    copyRecursiveSync(src, dest) {
      const exists = fs.existsSync(src);
      const stats = exists && fs.statSync(src);
      const isDirectory = exists && stats.isDirectory();
      
      if (isDirectory) {
        fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach(childItemName => {
          this.copyRecursiveSync(
            path.join(src, childItemName),
            path.join(dest, childItemName)
          );
        });
      } else {
        fs.copyFileSync(src, dest);
      }
    }
  }

  module.exports = new AlexandriaLibrary();
