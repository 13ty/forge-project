const fs = require('fs');
  const path = require('path');
  const { EventEmitter } = require('events');
  const marked = require('marked');

  class Drydock extends EventEmitter {
    constructor() {
      super();
      this.projectThemes = new Map();
      this.projectDocumentations = new Map();
    }

    // The Paint Locker: Theme Management
    createProjectTheme(projectId, themeDetails) {
      const themeId = this.generateThemeId();
      
      const theme = {
        id: themeId,
        name: themeDetails.name,
        type: themeDetails.type || 'custom',
        colors: themeDetails.colors || this.generateDefaultColorPalette(),
        fonts: themeDetails.fonts || this.generateDefaultFonts(),
        backgroundImage: themeDetails.backgroundImage,
        createdAt: new Date()
      };

      // Ensure project themes directory exists
      const themePath = path.join(
        __dirname, 
        '../themes', 
        `${projectId}_${themeId}`
      );
      fs.mkdirSync(themePath, { recursive: true });

      // Save theme configuration
      fs.writeFileSync(
        path.join(themePath, 'theme.json'),
        JSON.stringify(theme, null, 2)
      );

      this.projectThemes.set(projectId, theme);

      this.emit('theme_created', {
        projectId,
        themeId,
        message: 'Yarr! A new theme be born in the Drydock!'
      });

      return themeId;
    }

    generateDefaultColorPalette() {
      return {
        primary: '#3498db',   // Calm Sea Blue
        secondary: '#2ecc71', // Tropical Green
        background: '#ecf0f1', // Misty White
        text: '#2c3e50'        // Deep Ocean Gray
      };
    }

    generateDefaultFonts() {
      return {
        body: "'Roboto', sans-serif",
        heading: "'Montserrat', sans-serif"
      };
    }

    // The Scrivener's Cabin: Documentation Management
    createProjectDocumentation(projectId, docDetails) {
      const docId = this.generateDocumentationId();
      
      const documentation = {
        id: docId,
        title: docDetails.title,
        content: docDetails.content,
        format: docDetails.format || 'markdown',
        sections: this.parseDocumentSections(docDetails.content),
        createdAt: new Date(),
        lastUpdated: new Date()
      };

      // Ensure project documentation directory exists
      const docPath = path.join(
        __dirname, 
        '../documentation', 
        `${projectId}_${docId}`
      );
      fs.mkdirSync(docPath, { recursive: true });

      // Save documentation files
      fs.writeFileSync(
        path.join(docPath, 'doc.md'),
        documentation.content
      );

      // Generate HTML version for web preview
      const htmlContent = marked.parse(documentation.content);
      fs.writeFileSync(
        path.join(docPath, 'doc.html'),
        this.wrapDocumentationInHTML(documentation.title, htmlContent)
      );

      this.projectDocumentations.set(projectId, documentation);

      this.emit('documentation_created', {
        projectId,
        docId,
        message: 'Arr! Documentation be logged in the Scrivener\'s Cabin!'
      });

      return docId;
    }

    parseDocumentSections(content) {
      // Simple markdown section parsing
      const headings = content.match(/^#+\s.+/gm) || [];
      return headings.map(heading => ({
        level: heading.match(/^#+/)[0].length,
        title: heading.replace(/^#+\s/, '').trim()
      }));
    }

    wrapDocumentationInHTML(title, content) {
      return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
            background-color: #f4f4f4;
          }
          h1, h2, h3 { color: #333; }
          code { 
            background-color: #f1f1f1; 
            padding: 2px 4px; 
            border-radius: 4px; 
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${content}
      </body>
      </html>
      `;
    }

    // Utility Methods
    generateThemeId() {
      return `theme_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateDocumentationId() {
      return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Bardic Touch: Project Creation Ballad Generator
    generateProjectBallad(projectDetails) {
      const ballads = [
        `In the realm of ${projectDetails.name}, 
         Where code and dreams entwine,
         A project born of passion's flame, 
         Its destiny shall shine!`,

        `Hark! A new vessel sets its course,
         The ${projectDetails.name} takes flight,
         With ${projectDetails.type} as its source,
         Illuminating digital light!`,

        `From lines of code, a story grows,
         ${projectDetails.name} begins to sing,
         Where creativity freely flows,
         And innovation takes its wing!`
      ];

      return ballads[Math.floor(Math.random() * ballads.length)];
    }
  }

  module.exports = new Drydock();
