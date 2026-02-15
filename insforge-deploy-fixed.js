#!/usr/bin/env node
/**
 * Fixed InsForge Deployment Script
 * Works directly with InsForge API without MCP server
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';
import FormData from 'form-data';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const API_KEY = process.env.INSFORGE_API_KEY || 'ik_73120ab8bd730f732dd95bbdc954e38a';
const API_BASE_URL = process.env.INSFORGE_API_URL || 'https://stz6f3dz.us-east.insforge.app';

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Create zip buffer from directory
async function createZipBuffer(sourceDir) {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks = [];
    
    archive.on('data', (chunk) => chunks.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', (err) => reject(err));
    
    const excludePatterns = [
      'node_modules',
      '.git',
      '.next',
      '.env',
      '.env.local',
      'dist',
      'build',
      '.DS_Store',
      '*.log'
    ];
    
    archive.directory(sourceDir, false, (entry) => {
      const normalizedName = entry.name.replace(/\\/g, '/');
      for (const pattern of excludePatterns) {
        if (normalizedName.startsWith(pattern + '/') || 
            normalizedName === pattern || 
            normalizedName.includes('/' + pattern + '/')) {
          return false;
        }
      }
      return entry;
    });
    
    archive.finalize();
  });
}

// Create deployment
async function createDeployment() {
  log('');
  log('🚀 InsForge Deployment (Fixed)', 'cyan');
  log('═══════════════════════════════', 'cyan');
  log('');
  
  const sourceDir = '/Users/samwa/Desktop/CODE ZERO/KIMI/Recommend Her';
  
  log(`📁 Source: ${sourceDir}`, 'blue');
  log(`🔗 API: ${API_BASE_URL}`, 'blue');
  log('');
  
  // Step 1: Create deployment and get upload URL
  log('📦 Step 1: Creating deployment...', 'blue');
  
  const createResponse = await fetch(`${API_BASE_URL}/api/deployments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      projectSettings: {
        buildCommand: 'npm run build',
        outputDirectory: 'dist',
        installCommand: 'npm install'
      },
      envVars: [
        { key: 'VITE_SUPABASE_URL', value: 'https://aku8v88g.us-east.insforge.app' },
        { key: 'VITE_SUPABASE_ANON_KEY', value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNTc4NDd9.449oNdP5vOg1mQHlANE5-YhjB_6uTIZ63sTN6pfnzSQ' }
      ]
    })
  });
  
  if (!createResponse.ok) {
    const error = await createResponse.text();
    throw new Error(`Failed to create deployment: ${error}`);
  }
  
  const { id: deploymentId, uploadUrl, uploadFields } = await createResponse.json();
  log(`   ✅ Deployment ID: ${deploymentId}`, 'green');
  log('');
  
  // Step 2: Create zip file
  log('📦 Step 2: Creating zip archive...', 'blue');
  const zipBuffer = await createZipBuffer(sourceDir);
  log(`   ✅ Zip size: ${(zipBuffer.length / 1024 / 1024).toFixed(2)} MB`, 'green');
  log('');
  
  // Step 3: Upload zip file
  log('📤 Step 3: Uploading files...', 'blue');
  
  const formData = new FormData();
  for (const [key, value] of Object.entries(uploadFields)) {
    formData.append(key, value);
  }
  formData.append('file', zipBuffer, {
    filename: 'deployment.zip',
    contentType: 'application/zip'
  });
  
  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    body: formData
  });
  
  if (!uploadResponse.ok) {
    const error = await uploadResponse.text();
    throw new Error(`Failed to upload: ${error}`);
  }
  
  log('   ✅ Upload complete', 'green');
  log('');
  
  // Step 4: Start deployment
  log('🚀 Step 4: Starting deployment...', 'blue');
  
  const startResponse = await fetch(`${API_BASE_URL}/api/deployments/${deploymentId}/start`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      projectSettings: {
        buildCommand: 'npm run build',
        outputDirectory: 'dist'
      },
      envVars: [
        { key: 'VITE_SUPABASE_URL', value: 'https://aku8v88g.us-east.insforge.app' },
        { key: 'VITE_SUPABASE_ANON_KEY', value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNTc4NDd9.449oNdP5vOg1mQHlANE5-YhjB_6uTIZ63sTN6pfnzSQ' }
      ]
    })
  });
  
  if (!startResponse.ok) {
    const error = await startResponse.text();
    throw new Error(`Failed to start deployment: ${error}`);
  }
  
  const startResult = await startResponse.json();
  log('   ✅ Deployment started', 'green');
  log('');
  
  // Show result
  log('═══════════════════════════════', 'cyan');
  log('🎉 Deployment Initiated!', 'green');
  log('═══════════════════════════════', 'cyan');
  log(`   Deployment ID: ${deploymentId}`, 'cyan');
  if (startResult.url) {
    log(`   Live URL: ${startResult.url}`, 'cyan');
  }
  log('');
  log('⏳ Deployment is building...', 'yellow');
  log('   Check status at:', 'reset');
  log(`   ${API_BASE_URL}/deployments/${deploymentId}`, 'blue');
  log('');
  
  return { deploymentId, url: startResult.url };
}

// Check deployment status
async function checkStatus(deploymentId) {
  const response = await fetch(`${API_BASE_URL}/api/deployments/${deploymentId}`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to check status');
  }
  
  return await response.json();
}

// Main
async function main() {
  try {
    const result = await createDeployment();
    
    // Poll for status
    log('⏳ Checking deployment status in 10 seconds...', 'yellow');
    await new Promise(r => setTimeout(r, 10000));
    
    const status = await checkStatus(result.deploymentId);
    log(`   Status: ${status.status}`, status.status === 'READY' ? 'green' : 'yellow');
    
    if (status.url) {
      log(`   URL: ${status.url}`, 'cyan');
    }
    
  } catch (error) {
    log('');
    log('❌ Deployment failed:', 'red');
    log(`   ${error.message}`, 'red');
    process.exit(1);
  }
}

main();
