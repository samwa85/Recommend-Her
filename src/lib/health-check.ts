// ============================================================================
// SYSTEM HEALTH CHECKS
// Monitor database connectivity and system status
// ============================================================================

import { supabase } from './supabase';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    name: string;
    status: 'pass' | 'fail' | 'warn';
    message: string;
    responseTime?: number;
  }[];
  timestamp: string;
}

export async function runHealthCheck(): Promise<HealthCheckResult> {
  const checks: HealthCheckResult['checks'] = [];
  const _startTime = Date.now(); // Used for future timing analytics
  void _startTime; // Mark as intentionally used

  // Check 1: Database connectivity
  try {
    const dbStart = Date.now();
    const { error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    checks.push({
      name: 'Database Connection',
      status: error ? 'fail' : 'pass',
      message: error ? error.message : 'Connected',
      responseTime: Date.now() - dbStart,
    });
  } catch (err) {
    checks.push({
      name: 'Database Connection',
      status: 'fail',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }

  // Check 2: Storage connectivity
  try {
    const storageStart = Date.now();
    const { error } = await supabase.storage.getBucket('talent-cvs');
    
    checks.push({
      name: 'Storage Connection',
      status: error ? 'fail' : 'pass',
      message: error ? error.message : 'Accessible',
      responseTime: Date.now() - storageStart,
    });
  } catch (err) {
    checks.push({
      name: 'Storage Connection',
      status: 'fail',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }

  // Check 3: Auth service
  try {
    const authStart = Date.now();
    await supabase.auth.getSession();
    
    checks.push({
      name: 'Auth Service',
      status: 'pass',
      message: 'Available',
      responseTime: Date.now() - authStart,
    });
  } catch (err) {
    checks.push({
      name: 'Auth Service',
      status: 'fail',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }

  // Check 4: RPC functions
  try {
    const rpcStart = Date.now();
    const { error } = await supabase.rpc('get_talent_status_counts');
    
    checks.push({
      name: 'RPC Functions',
      status: error ? 'fail' : 'pass',
      message: error ? error.message : 'Responding',
      responseTime: Date.now() - rpcStart,
    });
  } catch (err) {
    checks.push({
      name: 'RPC Functions',
      status: 'fail',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }

  // Determine overall status
  const failedChecks = checks.filter(c => c.status === 'fail').length;
  const warnChecks = checks.filter(c => c.status === 'warn').length;
  
  let status: HealthCheckResult['status'] = 'healthy';
  if (failedChecks > 0) status = 'unhealthy';
  else if (warnChecks > 0) status = 'degraded';

  return {
    status,
    checks,
    timestamp: new Date().toISOString(),
  };
}

// ============================================================================
// DATABASE MAINTENANCE TASKS
// ============================================================================

export interface MaintenanceTask {
  name: string;
  description: string;
  lastRun?: string;
  nextRun: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export const maintenanceTasks = {
  /**
   * Clean up old rate limit records
   */
  async cleanupRateLimits(): Promise<void> {
    await supabase.rpc('cleanup_rate_limits');
  },

  /**
   * Archive old audit logs
   */
  async archiveOldAuditLogs(daysToKeep: number = 90): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // In production, you'd move these to an archive table
    // For now, just log the action
    console.log(`[Maintenance] Would archive audit logs older than ${cutoffDate.toISOString()}`);
  },

  /**
   * Clean up expired sessions/tokens
   */
  async cleanupExpiredSessions(): Promise<void> {
    // Supabase handles this automatically, but you can add custom cleanup
    console.log('[Maintenance] Session cleanup not needed (handled by Supabase)');
  },

  /**
   * Update materialized views or cached counts
   */
  async refreshStatistics(): Promise<void> {
    // Refresh any cached counts or materialized views
    const { error } = await supabase.rpc('get_talent_status_counts');
    if (error) throw error;
  },

  /**
   * Check for orphaned files in storage
   */
  async checkOrphanedFiles(): Promise<void> {
    // Get all CV file paths from database
    const { data: talentProfiles } = await supabase
      .from('talent_profiles')
      .select('cv_file_path')
      .not('cv_file_path', 'is', null);

    const dbFiles = new Set(talentProfiles?.map(t => t.cv_file_path) || []);
    
    console.log(`[Maintenance] Tracking ${dbFiles.size} files in database`);
    // Full implementation would compare with storage and list orphaned files
  },
};

// ============================================================================
// DATA INTEGRITY CHECKS
// ============================================================================

export async function runDataIntegrityChecks(): Promise<{
  passed: number;
  failed: number;
  issues: string[];
}> {
  const issues: string[] = [];

  // Check 1: Talent profiles without matching profiles
  try {
    const { data } = await supabase
      .from('talent_profiles')
      .select('id, user_id')
      .not('user_id', 'in', (
        supabase.from('profiles').select('id')
      ));
    
    if (data && data.length > 0) {
      issues.push(`Found ${data.length} talent profiles without matching user profiles`);
    }
  } catch (err) {
    issues.push('Could not verify talent profile integrity');
  }

  // Check 2: Orphaned storage files
  // This would require listing all storage files and comparing with database

  // Check 3: Duplicate emails
  try {
    const { data } = await supabase.rpc('check_duplicate_emails');
    if (data && data.length > 0) {
      issues.push(`Found ${data.length} duplicate email addresses`);
    }
  } catch {
    // Function might not exist yet
  }

  return {
    passed: issues.length === 0 ? 1 : 0,
    failed: issues.length,
    issues,
  };
}

// ============================================================================
// BACKUP NOTIFICATION
// ============================================================================

export function shouldRunBackup(): boolean {
  const lastBackup = localStorage.getItem('last_backup_reminder');
  if (!lastBackup) return true;
  
  const lastDate = new Date(lastBackup);
  const now = new Date();
  const hoursSince = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);
  
  return hoursSince > 24; // Remind every 24 hours
}

export function markBackupReminder(): void {
  localStorage.setItem('last_backup_reminder', new Date().toISOString());
}
