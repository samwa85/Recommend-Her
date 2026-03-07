/**
 * ============================================================================
 * INSFORGE INTEGRATION TESTS
 * Tests: Forms → DB Tables → Admin Dashboard → DB Mutations
 * ============================================================================
 * 
 * This test file verifies:
 * 1. Forms submit to real DB tables (talent_profiles, sponsor_profiles, contact_submissions)
 * 2. Admin dashboard reads those same tables
 * 3. Admin delete + bulk actions perform real DB mutations
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@insforge/sdk';
import type { InsForgeClient } from '@insforge/sdk';

// Test Configuration
const TEST_BASE_URL = 'https://aku8v88g.us-east.insforge.app';
const TEST_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNTc4NDd9.449oNdP5vOg1mQHlANE5-YhjB_6uTIZ63sTN6pfnzSQ';

// Test Data
const TEST_TALENT = {
  full_name: 'Test Talent User',
  email: `test-talent-${Date.now()}@example.com`,
  headline: 'Senior Product Manager with 10+ years experience',
  bio: 'Experienced product leader passionate about building great products.',
  years_of_experience: '8',
  industry: 'Technology',
  current_role_title: 'Senior',
  role_category: 'Product',
  seeking_roles: ['Product Manager', 'VP of Product'],
  skills: ['Product Strategy', 'Agile', 'Data Analysis', 'Team Leadership'],
  languages: ['English', 'Swahili'],
  linkedin_url: 'https://linkedin.com/in/testuser',
  website_url: 'https://testuser.dev',
  status: 'pending',
  source: 'test-form',
  gdpr_consent: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const TEST_SPONSOR = {
  full_name: 'Test Sponsor User',
  email: `test-sponsor-${Date.now()}@example.com`,
  job_title: 'VP of Engineering',
  phone: '+255123456789',
  organization: 'Test Company Ltd',
  linkedin_url: 'https://linkedin.com/in/testsponsor',
  industry: 'Technology',
  sponsor_type: 'company',
  focus_areas: ['mentor', 'connector'],
  notes_admin: 'Looking forward to supporting women in leadership.',
  status: 'active', // Note: sponsor_profiles only allows 'active', 'inactive', 'archived'
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const TEST_CONTACT = {
  full_name: 'Test Contact User',
  email: `test-contact-${Date.now()}@example.com`,
  inquiry_type: 'General Inquiry',
  organization: 'Test Organization',
  message: 'This is a test message from the integration test suite.',
  status: 'new',
  created_at: new Date().toISOString(),
};

describe('InsForge Integration Tests', () => {
  let client: InsForgeClient;
  const createdRecords: {
    talent: string[];
    sponsor: string[];
    contact: string[];
  } = {
    talent: [],
    sponsor: [],
    contact: [],
  };

  beforeAll(() => {
    // Initialize InsForge client
    client = createClient({
      baseUrl: TEST_BASE_URL,
      anonKey: TEST_ANON_KEY,
    });
    console.log('✅ InsForge client initialized');
  });

  afterAll(async () => {
    // Clean up test records
    console.log('\n🧹 Cleaning up test records...');
    
    for (const id of createdRecords.talent) {
      try {
        await client.database.from('talent_profiles').delete().eq('id', id);
        console.log(`   Deleted talent: ${id}`);
      } catch (e) {
        console.warn(`   Failed to delete talent ${id}:`, e);
      }
    }
    
    for (const id of createdRecords.sponsor) {
      try {
        await client.database.from('sponsor_profiles').delete().eq('id', id);
        console.log(`   Deleted sponsor: ${id}`);
      } catch (e) {
        console.warn(`   Failed to delete sponsor ${id}:`, e);
      }
    }
    
    for (const id of createdRecords.contact) {
      try {
        await client.database.from('contact_submissions').delete().eq('id', id);
        console.log(`   Deleted contact: ${id}`);
      } catch (e) {
        console.warn(`   Failed to delete contact ${id}:`, e);
      }
    }
    
    console.log('✅ Cleanup complete\n');
  });

  // ============================================================================
  // TEST 1: Forms Submit to Real DB Tables
  // ============================================================================
  
  describe('1. Forms Submit to Real DB Tables', () => {
    
    it('should submit talent profile to talent_profiles table', async () => {
      console.log('\n📝 TEST: Talent Form Submission');
      
      const { data, error } = await client.database
        .from('talent_profiles')
        .insert(TEST_TALENT)
        .select('*')
        .single();

      // Log results
      console.log('   Insert result:', { 
        success: !!data && !error, 
        id: data?.id,
        error: error?.message 
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.id).toBeDefined();
      expect(data.full_name).toBe(TEST_TALENT.full_name);
      expect(data.email).toBe(TEST_TALENT.email);
      expect(data.status).toBe('pending');

      // Track for cleanup
      if (data?.id) {
        createdRecords.talent.push(data.id);
      }
    });

    it('should submit sponsor profile to sponsor_profiles table', async () => {
      console.log('\n📝 TEST: Sponsor Form Submission');
      
      const { data, error } = await client.database
        .from('sponsor_profiles')
        .insert(TEST_SPONSOR)
        .select('*')
        .single();

      console.log('   Insert result:', { 
        success: !!data && !error, 
        id: data?.id,
        error: error?.message 
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.id).toBeDefined();
      expect(data.full_name).toBe(TEST_SPONSOR.full_name);
      expect(data.email).toBe(TEST_SPONSOR.email);
      expect(data.status).toBe('active'); // sponsor_profiles uses 'active', 'inactive', or 'archived'

      if (data?.id) {
        createdRecords.sponsor.push(data.id);
      }
    });

    it('should submit contact form to contact_submissions table', async () => {
      console.log('\n📝 TEST: Contact Form Submission');
      
      const { data, error } = await client.database
        .from('contact_submissions')
        .insert(TEST_CONTACT)
        .select('*')
        .single();

      console.log('   Insert result:', { 
        success: !!data && !error, 
        id: data?.id,
        error: error?.message 
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.id).toBeDefined();
      expect(data.full_name).toBe(TEST_CONTACT.full_name);
      expect(data.email).toBe(TEST_CONTACT.email);
      expect(data.status).toBe('new');

      if (data?.id) {
        createdRecords.contact.push(data.id);
      }
    });
  });

  // ============================================================================
  // TEST 2: Admin Dashboard Reads Those Same Tables
  // ============================================================================
  
  describe('2. Admin Dashboard Reads Same Tables', () => {
    
    it('should read talent_profiles from admin dashboard queries', async () => {
      console.log('\n📊 TEST: Admin Dashboard - Read Talent Profiles');
      
      // Simulate admin dashboard list query with pagination
      const { data, error, count } = await client.database
        .from('talent_profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(10);

      console.log('   Query result:', { 
        recordCount: data?.length,
        totalCount: count,
        error: error?.message 
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      
      // Verify our test record is in the results
      if (createdRecords.talent.length > 0) {
        const testRecord = data?.find(t => t.id === createdRecords.talent[0]);
        expect(testRecord).toBeDefined();
        console.log('   ✅ Test talent record found in query results');
      }
    });

    it('should read sponsor_profiles from admin dashboard queries', async () => {
      console.log('\n📊 TEST: Admin Dashboard - Read Sponsor Profiles');
      
      const { data, error, count } = await client.database
        .from('sponsor_profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(10);

      console.log('   Query result:', { 
        recordCount: data?.length,
        totalCount: count,
        error: error?.message 
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      
      if (createdRecords.sponsor.length > 0) {
        const testRecord = data?.find(s => s.id === createdRecords.sponsor[0]);
        expect(testRecord).toBeDefined();
        console.log('   ✅ Test sponsor record found in query results');
      }
    });

    it('should read contact_submissions from admin dashboard queries', async () => {
      console.log('\n📊 TEST: Admin Dashboard - Read Contact Submissions');
      
      const { data, error, count } = await client.database
        .from('contact_submissions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(10);

      console.log('   Query result:', { 
        recordCount: data?.length,
        totalCount: count,
        error: error?.message 
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      
      if (createdRecords.contact.length > 0) {
        const testRecord = data?.find(c => c.id === createdRecords.contact[0]);
        expect(testRecord).toBeDefined();
        console.log('   ✅ Test contact record found in query results');
      }
    });

    it('should support filtering by status (admin dashboard feature)', async () => {
      console.log('\n📊 TEST: Admin Dashboard - Filter by Status');
      
      const { data, error } = await client.database
        .from('talent_profiles')
        .select('*')
        .eq('status', 'pending')
        .limit(5);

      console.log('   Filter result:', { 
        pendingCount: data?.length,
        error: error?.message 
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      
      // All returned records should have status 'pending'
      data?.forEach(record => {
        expect(record.status).toBe('pending');
      });
      
      console.log('   ✅ All filtered records have correct status');
    });
  });

  // ============================================================================
  // TEST 3: Admin Delete + Bulk Actions Perform Real DB Mutations
  // ============================================================================
  
  describe('3. Admin Delete + Bulk Actions - Real DB Mutations', () => {
    
    it('should perform single record delete (admin delete action)', async () => {
      console.log('\n🗑️ TEST: Admin Delete - Single Record');
      
      // First create a record to delete
      const { data: created } = await client.database
        .from('talent_profiles')
        .insert({
          ...TEST_TALENT,
          email: `delete-test-${Date.now()}@example.com`,
        })
        .select('id')
        .single();

      expect(created?.id).toBeDefined();
      console.log('   Created record to delete:', created?.id);
      if (!created?.id) throw new Error('Failed to create test record for delete flow');

      // Perform delete
      const { error: deleteError } = await client.database
        .from('talent_profiles')
        .delete()
        .eq('id', created.id);

      console.log('   Delete result:', { 
        success: !deleteError,
        error: deleteError?.message 
      });

      expect(deleteError).toBeNull();

      // Verify deletion by trying to fetch
      const { data: verifyData } = await client.database
        .from('talent_profiles')
        .select('*')
        .eq('id', created.id)
        .single();

      expect(verifyData).toBeNull();
      console.log('   ✅ Record successfully deleted and verified');
    });

    it('should perform status update (admin status change action)', async () => {
      console.log('\n✏️ TEST: Admin Status Update');
      
      // Use the talent record created earlier
      if (createdRecords.talent.length === 0) {
        console.log('   ⚠️ Skipping - no talent record available');
        return;
      }

      const talentId = createdRecords.talent[0];
      
      // Update status to 'approved'
      const { data: updated, error: updateError } = await client.database
        .from('talent_profiles')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', talentId)
        .select('*')
        .single();

      console.log('   Update result:', { 
        success: !!updated && !updateError,
        newStatus: updated?.status,
        error: updateError?.message 
      });

      expect(updateError).toBeNull();
      expect(updated?.status).toBe('approved');
      console.log('   ✅ Status successfully updated');

      // Update back to pending for cleanup
      await client.database
        .from('talent_profiles')
        .update({ status: 'pending' })
        .eq('id', talentId);
    });

    it('should perform bulk status update (admin bulk action)', async () => {
      console.log('\n📦 TEST: Admin Bulk Status Update');
      
      // Create multiple records for bulk action
      const bulkEmails = [
        `bulk1-${Date.now()}@example.com`,
        `bulk2-${Date.now()}@example.com`,
      ];
      
      const createdIds: string[] = [];
      
      for (const email of bulkEmails) {
        const { data } = await client.database
          .from('talent_profiles')
          .insert({ ...TEST_TALENT, email, status: 'pending' })
          .select('id')
          .single();
        if (data?.id) createdIds.push(data.id);
      }

      console.log('   Created records for bulk update:', createdIds);
      expect(createdIds.length).toBe(2);

      // Perform bulk update using 'in' filter
      const { error: bulkError } = await client.database
        .from('talent_profiles')
        .update({ 
          status: 'archived',
          updated_at: new Date().toISOString()
        })
        .in('id', createdIds);

      console.log('   Bulk update result:', { 
        success: !bulkError,
        error: bulkError?.message 
      });

      expect(bulkError).toBeNull();

      // Verify all records were updated
      const { data: verifyData } = await client.database
        .from('talent_profiles')
        .select('id, status')
        .in('id', createdIds);

      expect(verifyData?.length).toBe(2);
      verifyData?.forEach(record => {
        expect(record.status).toBe('archived');
      });

      console.log('   ✅ All records successfully updated in bulk');

      // Cleanup
      for (const id of createdIds) {
        await client.database.from('talent_profiles').delete().eq('id', id);
      }
    });

    it('should perform bulk delete (admin bulk delete action)', async () => {
      console.log('\n🗑️ TEST: Admin Bulk Delete');
      
      // Create multiple records for bulk delete
      const bulkEmails = [
        `bulk-delete1-${Date.now()}@example.com`,
        `bulk-delete2-${Date.now()}@example.com`,
        `bulk-delete3-${Date.now()}@example.com`,
      ];
      
      const createdIds: string[] = [];
      
      for (const email of bulkEmails) {
        const { data } = await client.database
          .from('talent_profiles')
          .insert({ ...TEST_TALENT, email })
          .select('id')
          .single();
        if (data?.id) createdIds.push(data.id);
      }

      console.log('   Created records for bulk delete:', createdIds);
      expect(createdIds.length).toBe(3);

      // Perform bulk delete using 'in' filter
      const { error: bulkDeleteError } = await client.database
        .from('talent_profiles')
        .delete()
        .in('id', createdIds);

      console.log('   Bulk delete result:', { 
        success: !bulkDeleteError,
        error: bulkDeleteError?.message 
      });

      expect(bulkDeleteError).toBeNull();

      // Verify all records were deleted
      const { data: verifyData } = await client.database
        .from('talent_profiles')
        .select('id')
        .in('id', createdIds);

      expect(verifyData?.length || 0).toBe(0);
      console.log('   ✅ All records successfully deleted in bulk');
    });
  });

  // ============================================================================
  // TEST 4: Integration Verification
  // ============================================================================
  
  describe('4. End-to-End Integration Verification', () => {
    
    it('should verify complete flow: form submit → dashboard read → status update → delete', async () => {
      console.log('\n🔄 TEST: Complete End-to-End Flow');
      
      // Step 1: Form submission
      console.log('   Step 1: Submitting form...');
      const { data: submitted } = await client.database
        .from('talent_profiles')
        .insert({
          ...TEST_TALENT,
          email: `e2e-${Date.now()}@example.com`,
          status: 'pending',
        })
        .select('*')
        .single();

      expect(submitted?.id).toBeDefined();
      console.log('   ✅ Form submitted, ID:', submitted.id);

      // Step 2: Dashboard read
      console.log('   Step 2: Reading from dashboard...');
      const { data: fetched } = await client.database
        .from('talent_profiles')
        .select('*')
        .eq('id', submitted.id)
        .single();

      expect(fetched?.id).toBe(submitted.id);
      console.log('   ✅ Record found in dashboard');

      // Step 3: Status update
      console.log('   Step 3: Updating status...');
      const { data: updated } = await client.database
        .from('talent_profiles')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', submitted.id)
        .select('*')
        .single();

      expect(updated?.status).toBe('approved');
      console.log('   ✅ Status updated to approved');

      // Step 4: Delete
      console.log('   Step 4: Deleting record...');
      const { error: deleteError } = await client.database
        .from('talent_profiles')
        .delete()
        .eq('id', submitted.id);

      expect(deleteError).toBeNull();
      console.log('   ✅ Record deleted');

      // Final verification
      const { data: finalCheck } = await client.database
        .from('talent_profiles')
        .select('*')
        .eq('id', submitted.id)
        .single();

      expect(finalCheck).toBeNull();
      console.log('   ✅ Complete flow verified successfully!');
    });
  });
});

console.log(`
================================================================================
INSFORGE INTEGRATION TESTS
================================================================================
Backend: ${TEST_BASE_URL}

Test Coverage:
1. ✅ Forms submit to real DB tables (talent_profiles, sponsor_profiles, contact_submissions)
2. ✅ Admin dashboard reads those same tables
3. ✅ Admin delete + bulk actions perform real DB mutations
4. ✅ End-to-end integration verification

Run with: npm test -- src/test/insforge-integration.test.ts
================================================================================
`);
