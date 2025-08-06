#!/usr/bin/env node

const { rebuild } = require('@electron/rebuild');
const path = require('path');

// Rebuild native modules for Linux
console.log('Rebuilding native modules for Linux...');

rebuild({
  buildPath: path.resolve(__dirname),
  electronVersion: process.versions.electron,
  force: true,
  types: ['prod', 'dev'],
})
  .then(() => {
    console.log('Rebuild complete!');
  })
  .catch((err) => {
    console.error('Rebuild failed:', err);
    process.exit(1);
  });
