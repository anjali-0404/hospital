import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateCaseInput } from "@shared/routes";

// GET /api/cases
export function useCases() {
  return useQuery({
    queryKey: [api.cases.list.path],
    queryFn: async () => {
      const res = await fetch(api.cases.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch cases");
      return api.cases.list.responses[200].parse(await res.json());
    },
  });
}

// GET /api/cases/:id
export function useCase(id: number) {
  return useQuery({
    queryKey: [api.cases.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.cases.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) throw new Error("Case not found");
      if (!res.ok) throw new Error("Failed to fetch case details");
      return api.cases.get.responses[200].parse(await res.json());
    },
    // Poll every 5 seconds if status is pending
    refetchInterval: (data) => (data?.status === "pending" ? 5000 : false),
  });
}

// POST /api/cases
export function useCreateCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCaseInput) => {
      const res = await fetch(api.cases.create.path, {
        method: api.cases.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.cases.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create case");
      }
      return api.cases.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.cases.list.path] }),
  });
}

// DELETE /api/cases/:id
export function useDeleteCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.cases.delete.path, { id });
      const res = await fetch(url, { 
        method: api.cases.delete.method, 
        credentials: "include" 
      });
      
      if (!res.ok && res.status !== 404) throw new Error("Failed to delete case");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.cases.list.path] }),
  });
}

// POST /api/transcribe
export function useTranscribeAudio() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(api.transcribe.upload.path, {
        method: api.transcribe.upload.method,
        body: formData,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Transcription failed");
      return api.transcribe.upload.responses[200].parse(await res.json());
    },
  });
}
