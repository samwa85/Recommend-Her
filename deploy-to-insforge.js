#!/usr/bin/env node
/**
 * InsForge Deployment Script
 * Deploys the built app to InsForge hosting
 */

import { createClient } from '@insforge/sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const INSFORGE_URL = process.env.INSFORGE_URL || 'https://aku8v88g.us-east.insforge.app';
const SITE_NAME = process.env.SITE_NAME || 'recommendher';
const DIST_DIR = process.env.DIST_DIR || './dist';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function deploy() {
  log('🚀 Starting InsForge Deployment...', 'blue');
  log(`   Backend: ${INSFORGE_URL}`, 'reset');
  log(`   Site: ${SITE_NAME}`, 'reset');
  log('');

  // Check if dist directory exists
  const distPath = path.resolve(DIST_DIR);
  if (!fs.existsSync(distPath)) {
    log(`❌ Error: Dist directory not found at ${distPath}`, 'red');
    log('   Run "npm run build" first.', 'yellow');
    process.exit(1);
  }

  // Initialize InsForge client
  const client = createClient({
    baseUrl: INSFORGE_URL
  });

  try {
    // Get all files in dist directory
    log('📦 Collecting files...', 'blue');
    const files = collectFiles(distPath);
    log(`   Found ${files.length} files`, 'green');

    // Try to deploy using the deployment API
    log('');
    log('📤 Uploading to InsForge...', 'blue');

    // Check if client has deployment methods
    if (client.sites || client.deployment) {
      const deploymentApi = client.sites || client.deployment;
      
      // Try to create/update site
      const result = await deploymentApi.deploy({
        name: SITE_NAME,
        files: files.map(f => ({
          path: f.relativePath,
          content: fs.readFileSync(f.absolutePath)
        }))
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      log('');
      log('✅ Deployment successful!', 'green');
      log(`   URL: ${result.data?.url || `${INSFORGE_URL}/sites/${SITE_NAME}`}`, 'green');
    } else {
      // Fallback: Direct HTTP API call
      log('   Using HTTP API...', 'yellow');
      
      const formData = new FormData();
      files.forEach(file => {
        const blob = new Blob([fs.readFileSync(file.absolutePath)]);
        formData.append('files', blob, file.relativePath);
      });
      formData.append('name', SITE_NAME);

      const response = await fetch(`${INSFORGE_URL}/api/v1/sites/deploy`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      const result = await response.json();
      log('');
      log('✅ Deployment successful!', 'green');
      log(`   URL: ${result.url || `${INSFORGE_URL}/sites/${SITE_NAME}`}`, 'green');
    }

  } catch (error) {
    log('');
    log('❌ Deployment failed:', 'red');
    log(`   ${error.message}`, 'red');
    log('');
    log('💡 Alternative deployment options:', 'yellow');
    log('   1. Use InsForge Dashboard to upload the dist/ folder manually', 'yellow');
    log('   2. Deploy to VPS using: ssh root@145.223.96.191', 'yellow');
    log('   3. Use InsForge MCP tools in your editor', 'yellow');
    process.exit(1);
  }
}

function collectFiles(dir, basePath = '') {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relativePath = path.join(basePath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...collectFiles(fullPath, relativePath));
    } else {
      files.push({
        absolutePath: fullPath,
        relativePath: relativePath.replace(/\\/g, '/') // Normalize for web
      });
    }
  }

  return files;
}

// Run deployment
deploy().catch(err => {
  log(`Unexpected error: ${err.message}`, 'red');
  process.exit(1);
});
