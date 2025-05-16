#!/usr/bin/env node

/**
 * Script to start the Figma Developer MCP server
 * This script will start the Figma Developer MCP server with the provided API key
 */

const { spawn } = require('child_process');
const path = require('path');

// The Figma API key
const FIGMA_API_KEY = 'figd_Y73rZqlZ2muODPJ8aLu2lmnX1mo_AO8qVo6NpdVv';

console.log('Starting Figma Developer MCP server...');
console.log(`Using API key: ${FIGMA_API_KEY.substring(0, 8)}...`);

// Start the Figma Developer MCP server
const figmaMCP = spawn('npx', ['figma-developer-mcp', `--figma-api-key=${FIGMA_API_KEY}`, '--stdio'], {
  stdio: 'inherit',
  shell: true
});

figmaMCP.on('error', (error) => {
  console.error('Failed to start Figma Developer MCP server:', error);
  process.exit(1);
});

figmaMCP.on('close', (code) => {
  if (code !== 0) {
    console.error(`Figma Developer MCP server exited with code ${code}`);
    process.exit(code);
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Stopping Figma Developer MCP server...');
  figmaMCP.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Stopping Figma Developer MCP server...');
  figmaMCP.kill('SIGTERM');
});
