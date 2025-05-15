/**
 * Simple test script for testing the publish command
 */
const { execSync } = require('child_process');
const path = require('path');

// Path to the CLI
const CLI_PATH = path.resolve(__dirname, '../cli/dist/index.js');

// Run the publish command
try {
  console.log('Testing publish command...');

  // Login first with test mode
  console.log('Logging in with test mode...');
  execSync(`node ${CLI_PATH} login --test`, { stdio: 'inherit' });

  // Run publish command
  console.log('\nRunning publish command...');
  execSync(`node ${CLI_PATH} publish`, { stdio: 'inherit' });

  console.log('\nTest completed successfully!');
} catch (error) {
  console.error('Test failed:', error.message);
  process.exit(1);
}