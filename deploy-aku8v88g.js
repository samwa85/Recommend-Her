#!/usr/bin/env node
/**
 * Deploy to aku8v88g.us-east.insforge.app
 */

import archiver from 'archiver';
import FormData from 'form-data';
import fetch from 'node-fetch';

const API_KEY = 'ik_964af40fa98a7966a53bc8c77af44d52';
const API_BASE_URL = 'https://aku8v88g.us-east.insforge.app';
const SOURCE_DIR = '/Users/samwa/Desktop/CODE ZERO/KIMI/Recommend Her';

const colors = {
  reset: '\x1b[0m', green: '\x1b[32m', yellow: '\x1b[33m',
  red: '\x1b[31m', blue: '\x1b[34m', cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function createZipBuffer(sourceDir) {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks = [];
    archive.on('data', (chunk) => chunks.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', reject);
    
    const exclude = ['node_modules', '.git', '.next', '.env', '.env.local', 'dist', 'build', '.DS_Store', '*.log'];
    archive.directory(sourceDir, false, (entry) => {
      const name = entry.name.replace(/\\/g, '/');
      for (const p of exclude) if (name.includes(p)) return false;
      return entry;
    });
    archive.finalize();
  });
}

async function deploy() {
  log('');
  log('🚀 Deploying to aku8v88g.us-east.insforge.app', 'cyan');
  log('════════════════════════════════════════════════', 'cyan');
  log('');

  // Step 1: Create deployment
  log('📦 Step 1: Creating deployment...', 'blue');
  const createRes = await fetch(`${API_BASE_URL}/api/deployments`, {
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

  if (!createRes.ok) {
    throw new Error(`Create failed: ${await createRes.text()}`);
  }

  const { id, uploadUrl, uploadFields } = await createRes.json();
  log(`   ✅ Deployment ID: ${id}`, 'green');
  log('');

  // Step 2: Create zip
  log('📦 Step 2: Creating zip archive...', 'blue');
  const zipBuffer = await createZipBuffer(SOURCE_DIR);
  log(`   ✅ Size: ${(zipBuffer.length / 1024 / 1024).toFixed(2)} MB`, 'green');
  log('');

  // Step 3: Upload to S3
  log('📤 Step 3: Uploading to cloud storage...', 'blue');
  const formData = new FormData();
  for (const [key, value] of Object.entries(uploadFields)) {
    formData.append(key, value);
  }
  formData.append('file', zipBuffer, { filename: 'deployment.zip', contentType: 'application/zip' });

  const uploadRes = await fetch(uploadUrl, { method: 'POST', body: formData });
  if (!uploadRes.ok) {
    throw new Error(`Upload failed: ${await uploadRes.text()}`);
  }
  log('   ✅ Uploaded', 'green');
  log('');

  // Step 4: Start deployment
  log('🚀 Step 4: Starting deployment...', 'blue');
  const startRes = await fetch(`${API_BASE_URL}/api/deployments/${id}/start`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      projectSettings: { buildCommand: 'npm run build', outputDirectory: 'dist' },
      envVars: [
        { key: 'VITE_SUPABASE_URL', value: 'https://aku8v88g.us-east.insforge.app' },
        { key: 'VITE_SUPABASE_ANON_KEY', value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNTc4NDd9.449oNdP5vOg1mQHlANE5-YhjB_6uTIZ63sTN6pfnzSQ' }
      ]
    })
  });

  if (!startRes.ok) {
    throw new Error(`Start failed: ${await startRes.text()}`);
  }

  const result = await startRes.json();
  log('   ✅ Deployment started', 'green');
  log('');

  // Show result
  log('════════════════════════════════════════════════', 'cyan');
  log('🎉 Deployment Successful!', 'green');
  log('════════════════════════════════════════════════', 'cyan');
  log(`   Deployment ID: ${id}`, 'cyan');
  log(`   Live URL: ${result.url || 'https://aku8v88g.insforge.site'}`, 'cyan');
  log('');
  log('⏳ Building... (usually takes 1-2 minutes)', 'yellow');
  log('');

  // Poll for status
  await new Promise(r => setTimeout(r, 20000));
  
  log('📊 Checking status...', 'blue');
  const statusRes = await fetch(`${API_BASE_URL}/api/deployments/${id}`, {
    headers: { 'Authorization': `Bearer ${API_KEY}` }
  });
  const status = await statusRes.json();
  
  log(`   Status: ${status.status}`, status.status === 'READY' ? 'green' : 'yellow');
  if (status.url) log(`   URL: ${status.url}`, 'cyan');
  if (status.error) log(`   Error: ${status.error}`, 'red');
  log('');

  return { id, url: result.url || status.url };
}

deploy().catch(err => {
  log('');
  log('❌ Deployment failed:', 'red');
  log(`   ${err.message}`, 'red');
  process.exit(1);
});
