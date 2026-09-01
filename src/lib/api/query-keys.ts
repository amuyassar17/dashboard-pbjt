export const queryKeys = {
  session: ["session"] as const,
  summary: ["dashboard", "summary"] as const,
  sptpdList: (filters: string) => ["sptpd", "list", filters] as const,
  sptpdDetail: (id: string) => ["sptpd", "detail", id] as const,
  sptpdHistory: (id: string) => ["sptpd", "history", id] as const,
  simpakduHistory: (filters: string) => ["simpakdu", "history", filters] as const,
  simpakduHistoryDetail: (id: string) => ["simpakdu", "history", "detail", id] as const,
  staff: ["staff", "list"] as const,
};
