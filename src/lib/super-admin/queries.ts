import { queryOptions } from "@tanstack/react-query";
import {
  getPortfolioById,
  getSystemSettings,
  listActivityLogs,
  listPortfolioAdmins,
  listPortfolios,
} from "./repository";

/** All super-admin query keys live under one namespace. */
const key = (...parts: (string | boolean)[]) => ["super-admin", ...parts];

export const saQ = {
  portfolios: (includeDeleted = false) =>
    queryOptions({
      queryKey: key("portfolios", includeDeleted),
      queryFn: () => listPortfolios(includeDeleted),
    }),
  portfolio: (id: string) =>
    queryOptions({
      queryKey: key("portfolio", id),
      queryFn: () => getPortfolioById(id),
    }),
  admins: queryOptions({
    queryKey: key("admins"),
    queryFn: () => listPortfolioAdmins(),
  }),
  logs: queryOptions({
    queryKey: key("logs"),
    queryFn: () => listActivityLogs(),
  }),
  settings: queryOptions({
    queryKey: key("settings"),
    queryFn: () => getSystemSettings(),
  }),
};

export const SUPER_ADMIN_QUERY_ROOT = ["super-admin"];
