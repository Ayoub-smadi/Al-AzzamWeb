import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/utils";

export type SiteSettings = {
  hero_title_ar: string;
  hero_title_en: string;
  hero_subtitle_ar: string;
  hero_subtitle_en: string;
  footer_about_ar: string;
  footer_about_en: string;
  contact_address_ar: string;
  contact_address_en: string;
  contact_email: string;
  contact_phone: string;
  social_links: string;
  [key: string]: string;
};

export type SocialLink = {
  platform: string;
  url: string;
  label?: string;
};

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function useSiteSettings() {
  return useQuery<SiteSettings>({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/settings`);
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<SiteSettings>) => {
      const res = await fetch(`${BASE}/api/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["site-settings"], data);
    },
  });
}

export async function uploadPropertyImage(file: File): Promise<string> {
  const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
  const token = localStorage.getItem("azzam_token");
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`${BASE}/api/uploads/image`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.url;
}
