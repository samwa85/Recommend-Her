// ============================================================================
// CREATE ADMIN USER - Script to create the initial admin user
// Run this once to set up the admin account
// ============================================================================

import { getInsforgeClient } from '@/lib/insforge/client';

const ADMIN_EMAIL = 'admin@recommendher.africa';
const ADMIN_PASSWORD = 'qwerty7890@';

export async function createAdminUser(): Promise<{ success: boolean; message: string }> {
  try {
    const client = getInsforgeClient();
    
    console.log('Creating admin user...');
    console.log('Email:', ADMIN_EMAIL);
    
    // Sign up the admin user
    const { data, error } = await client.auth.signUp({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    if (error) {
      // Check if user already exists
      if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
        console.log('Admin user already exists');
        return { success: true, message: 'Admin user already exists' };
      }
      
      console.error('Failed to create admin:', error);
      return { success: false, message: error.message || 'Failed to create admin user' };
    }

    if (!data) {
      return { success: false, message: 'No data returned from sign up' };
    }

    console.log('✅ Admin user created successfully!');
    console.log('User ID:', data.user?.id);
    
    // Set admin profile
    try {
      await client.auth.setProfile({
        nickname: 'Super Admin',
        bio: 'Recommend Her Administrator',
      });
      console.log('✅ Admin profile set');
    } catch (profileError) {
      console.warn('Could not set profile, but user was created');
    }
    
    return { 
      success: true, 
      message: `Admin user created successfully! Email: ${ADMIN_EMAIL}` 
    };
    
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Error creating admin:', error);
    return { success: false, message: error.message };
  }
}

// Note: This file is for browser use only
// To create admin, visit /admin/setup in your browser
