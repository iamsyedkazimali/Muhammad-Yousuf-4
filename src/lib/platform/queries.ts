import { queryOptions } from "@tanstack/react-query";
import { listBackups } from "./backups";
import { listClients } from "./clients";
import { listDomains } from "./domains";
import { listMedia } from "./media";
import { getHealthReport } from "./monitoring";
import { listNotifications } from "./notifications";

/** Every platform (Phase 4) query key lives under one namespace. */
const key = (...parts: (string | boolean | undefined)[]) => ["platform", ...parts];

export const PLATFORM_QUERY_ROOT = ["platform"];

export const pfQ = {
  domains: (portfolioId?: string) =>
    queryOptions({
      queryKey: key("domains", portfolioId),
      queryFn: () => listDomains(portfolioId),
    }),
  clients: (includeDeleted = false) =>
    queryOptions({
      queryKey: key("clients", includeDeleted),
      queryFn: () => listClients(includeDeleted),
    }),
  media: (portfolioId?: string) =>
    queryOptions({
      queryKey: key("media", portfolioId),
      queryFn: () => listMedia(portfolioId),
    }),
  backups: (portfolioId?: string) =>
    queryOptions({
      queryKey: key("backups", portfolioId),
      queryFn: () => listBackups(portfolioId),
    }),
  notifications: queryOptions({
    queryKey: key("notifications"),
    queryFn: () => listNotifications(),
  }),
  health: queryOptions({
    queryKey: key("health"),
    queryFn: () => getHealthReport(),
    staleTime: 30_000,
  }),
};
