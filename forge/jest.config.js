module.exports = {
    testEnvironment: 'node',
    coveragePathIgnorePatterns: [
      '/node_modules/',
      '/tests/'
    ],
    verbose: true,
    collectCoverage: true,
    testMatch: [
      '**/tests/**/*.test.js'
    ]
  };
