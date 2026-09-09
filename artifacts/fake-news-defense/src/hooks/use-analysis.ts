import { useQueryClient } from "@tanstack/react-query";
import {
  useAnalyzeContent as useGeneratedAnalyzeContent,
  useGetStats as useGeneratedGetStats,
  useGetHistory as useGeneratedGetHistory,
  getGetStatsQueryKey,
  getGetHistoryQueryKey,
} from "@workspace/api-client-react";

export function useAnalyzeContent() {
  const queryClient = useQueryClient();
  
  return useGeneratedAnalyzeContent({
    mutation: {
      onSuccess: () => {
        // Invalidate history and stats to keep dashboard fresh
        queryClient.invalidateQueries({ queryKey: getGetHistoryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
      },
    },
  });
}

// Re-export standard query hooks for convenience
export const useStats = useGeneratedGetStats;
export const useHistory = useGeneratedGetHistory;
