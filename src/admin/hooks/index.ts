// ============================================================================
// ADMIN HOOKS - Barrel Export
// ============================================================================

// Legacy hooks
export {
  useTalentList,
  useTalentDetail,
  useSponsorList,
  useSponsorDetail,
  useRequestList,
  useRequestDetail,
  useMessageList,
  useMessageDetail,
  useDashboardMetrics,
  useAnalytics,
  useActivityLogs,
  useStatusCounts,
  useUnreadMessagesCount,
} from './useAdminData';

// Robust query hooks
export {
  useRobustQuery,
  useRobustMutation,
} from './useRobustQuery';
export type {
  QueryState,
  QueryOptions,
  MutationState,
  MutationOptions,
} from './useRobustQuery';
