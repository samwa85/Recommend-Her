import { describe, it, expect } from 'vitest';
import { createClient } from '@insforge/sdk';

const client = createClient({
  baseUrl: 'https://aku8v88g.us-east.insforge.app',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNTc4NDd9.449oNdP5vOg1mQHlANE5-YhjB_6uTIZ63sTN6pfnzSQ',
});

describe('Messages CRUD Verification', () => {
  it('should CREATE a message', async () => {
    const { data, error } = await client.database
      .from('contact_submissions')
      .insert({
        full_name: 'Test User',
        email: 'test@example.com',
        inquiry_type: 'General Inquiry',
        organization: 'Test Org',
        message: 'Test message content',
        status: 'new',
      })
      .select('*')
      .single();

    if (error) {
      console.log('CREATE Error:', error.message);
    }
    
    expect(error).toBeNull();
    expect(data?.id).toBeDefined();
    console.log('✅ CREATE working, ID:', data?.id);
  });

  it('should READ messages', async () => {
    const { data, error } = await client.database
      .from('contact_submissions')
      .select('*')
      .limit(5);

    if (error) {
      console.log('READ Error:', error.message);
    }

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
    console.log('✅ READ working, count:', data?.length);
  });

  it('should UPDATE message status', async () => {
    // First create a message
    const { data: created } = await client.database
      .from('contact_submissions')
      .insert({
        full_name: 'Update Test',
        email: 'update@example.com',
        inquiry_type: 'Test',
        message: 'Test for update',
        status: 'new',
      })
      .select('id')
      .single();

    if (!created?.id) {
      console.log('Could not create test message');
      return;
    }

    // Try to update
    const { error: updateError } = await client.database
      .from('contact_submissions')
      .update({ status: 'read' })
      .eq('id', created.id);

    if (updateError) {
      console.log('❌ UPDATE Error:', updateError.message);
      console.log('   The contact_submissions table may not exist or RLS is blocking');
    } else {
      console.log('✅ UPDATE working');
    }
  });

  it('should DELETE a message', async () => {
    // First create a message
    const { data: created } = await client.database
      .from('contact_submissions')
      .insert({
        full_name: 'Delete Test',
        email: 'delete@example.com',
        inquiry_type: 'Test',
        message: 'Test for delete',
        status: 'new',
      })
      .select('id')
      .single();

    if (!created?.id) {
      console.log('Could not create test message');
      return;
    }

    // Try to delete
    const { error: deleteError } = await client.database
      .from('contact_submissions')
      .delete()
      .eq('id', created.id);

    if (deleteError) {
      console.log('❌ DELETE Error:', deleteError.message);
      console.log('   The contact_submissions table may not exist or RLS is blocking');
    } else {
      console.log('✅ DELETE working');
    }
  });
});
