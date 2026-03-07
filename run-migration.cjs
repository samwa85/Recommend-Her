#!/usr/bin/env node
// ============================================================================
// RUN SQL MIGRATION - Using InsForge PostgREST API
// ============================================================================

const https = require('https');
const fs = require('fs');
const path = require('path');

const INSFORGE_URL = 'https://aku8v88g.us-east.insforge.app';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNTc4NDd9.449oNdP5vOg1mQHlANE5-YhjB_6uTIZ63sTN6pfnzSQ';

async function makeRequest(method, endpoint, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, INSFORGE_URL);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        ...headers
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function checkTable() {
  console.log('Checking if sponsor_showcase table exists...');
  
  const result = await makeRequest('GET', '/rest/v1/sponsor_showcase?limit=1');
  console.log('Result status:', result.status);
  
  if (result.status === 200) {
    console.log('Table exists!');
    return true;
  } else if (result.status === 404) {
    console.log('Table does not exist.');
    return false;
  } else {
    console.log('Unexpected response:', result.data);
    return false;
  }
}

async function main() {
  console.log('=== InsForge Migration Runner ===\n');
  
  await checkTable();
}

main().catch(console.error);
