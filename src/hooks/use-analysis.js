import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useAnalyzeContent(options) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ data }) => {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Analysis failed" }));
        throw new Error(err.message || "Analysis failed");
      }
      return res.json();
    },
    ...options?.mutation,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      if (options?.mutation?.onSuccess) {
        options.mutation.onSuccess(data, variables, context);
      }
    },
  });
}

export function useStats(options) {
  return useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    ...options?.query,
  });
}

export function useHistory(options) {
  return useQuery({
    queryKey: ["/api/history"],
    queryFn: async () => {
      const res = await fetch("/api/history");
      if (!res.ok) throw new Error("Failed to fetch history");
      return res.json();
    },
    ...options?.query,
  });
}
