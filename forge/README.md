# 🏴‍☠️ Forge Platform: Collaborative Maker's Toolkit

## 🌊 Prerequisites

### Software Requirements
- Node.js (v14+ recommended)
- MongoDB (v4.4+)
- npm (v6+ recommended)

### 🛠 Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/forge-platform.git
   cd forge-platform
   ```

2. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Fill in the configuration values

   ```bash
   cp .env.example .env
   ```

3. **Configuration Guide**

   #### Required Configurations:
   - `APP_KEY`: Generate a unique application key
     ```bash
     # Generate a random key (Linux/Mac)
     openssl rand -base64 32
     ```

   - `JWT_SECRET`: Create a long, random string
     ```bash
     # Example generation
     openssl rand -hex 32
     ```

   - `MONGODB_URI`: 
     - Default: `mongodb://localhost:27017/forge-platform`
     - If using MongoDB Atlas or remote database, replace with your connection string

   - `OPENAI_API_KEY` (Optional):
     - Visit [OpenAI Platform](https://platform.openai.com/account/api-keys)
     - Create an API key for AI features

4. **Install Dependencies**
   ```bash
   npm install
   ```

5. **Start MongoDB**
   - Ensure MongoDB is running
   - For local installation:
     ```bash
     # Mac
     brew services start mongodb-community
     
     # Linux
     sudo systemctl start mongod
     
     # Windows
     net start MongoDB
     ```

6. **Run the Application**
   ```bash
   # Development Mode
   npm run dev

   # Production Mode
   npm start

   # Run Demo
   npm run demo
   ```

## 🧭 Configuration Details

### Database Configuration
- `MONGODB_URI`: Connection string for MongoDB
- Default points to local MongoDB instance
- For cloud/remote databases, replace with your connection string

### Authentication
- `JWT_SECRET`: Used for generating JSON Web Tokens
- Keep this secret and secure
- Use a long, random string

### AI Features
- `OPENAI_API_KEY`: Optional API key for AI-powered features
- Not required for basic platform functionality

### Logging
- `LOG_LEVEL`: Control verbosity of logs
- `LOG_DIRECTORY`: Where log files are stored

## 🚢 Deployment Considerations

### Production Deployment
- Set `APP_ENV` to `production`
- Use a production-ready MongoDB instance
- Configure proper environment variables
- Consider using PM2 for process management

### Security
- Never commit `.env` file to version control
- Use environment-specific configurations
- Rotate secrets and keys regularly

## 🛡️ Troubleshooting

### Common Issues
- MongoDB Connection: Verify `MONGODB_URI`
- API Key Problems: Check OpenAI key permissions
- Dependency Errors: Run `npm install`

### Logging
- Check `./logs` directory for detailed error logs
- Use `APP_DEBUG=true` for verbose output

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## 📜 License
[Your License Here - e.g., MIT]

## 🏴 Maintainers
- [Your Name]
- [Contributor Names]
```

  <boltAction type="file" filePath="/home/project/forge/config/default.json">
{
  "app": {
    "name": "Forge Platform",
    "version": "0.3.0"
  },
  "server": {
    "port": 3000,
    "host": "localhost"
  },
  "database": {
    "connectionLimit": 10,
    "connectTimeout": 10000
  },
  "security": {
    "saltRounds": 10,
    "tokenExpiration": "7d"
  },
  "features": {
    "userRegistration": true,
    "projectCreation": true,
    "aiAssistance": true
  },
  "logging": {
    "level": "info",
    "directory": "./logs"
  }
}
