import { useEffect, useMemo, useState } from "react";

export type SortDir = "asc" | "desc";

export type UseCollectionOptions<T> = {
  /** Fields searched by the free-text query. */
  searchFields?: (keyof T | string)[];
  /** Field used for category/tab filtering. */
  filterField?: keyof T | string;
  /** Available sort keys. */
  sortKeys?: { key: string; label: string; dir?: SortDir }[];
  initialSort?: string;
  initialFilter?: string;
  pageSize?: number;
};

const val = (row: any, path: string) => row?.[path];

/**
 * Reusable search + filter + sort + pagination controller for any list.
 */
export function useCollection<T extends Record<string, any>>(
  items: T[],
  {
    searchFields = [],
    filterField,
    sortKeys = [],
    initialSort,
    initialFilter = "All",
    pageSize = 12,
  }: UseCollectionOptions<T> = {},
) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(initialFilter);
  const [sort, setSort] = useState(initialSort ?? sortKeys[0]?.key ?? "");
  const [page, setPage] = useState(1);

  const searched = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return items;
    return items.filter((row) =>
      (searchFields.length ? searchFields : Object.keys(row)).some((f) =>
        String(val(row, String(f)) ?? "").toLowerCase().includes(s),
      ),
    );
  }, [items, search, searchFields]);

  const filtered = useMemo(() => {
    if (!filterField || filter === "All") return searched;
    return searched.filter(
      (row) => String(val(row, String(filterField)) ?? "").toLowerCase() === filter.toLowerCase(),
    );
  }, [searched, filter, filterField]);

  const sorted = useMemo(() => {
    const cfg = sortKeys.find((k) => k.key === sort);
    if (!cfg) return filtered;
    const dir = cfg.dir === "desc" ? -1 : 1;
    return [...filtered].sort((a, b) => {
      const av = val(a, cfg.key);
      const bv = val(b, cfg.key);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir;
    });
  }, [filtered, sort, sortKeys]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [search, filter, sort]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const paged = useMemo(
    () => sorted.slice((page - 1) * pageSize, page * pageSize),
    [sorted, page, pageSize],
  );

  return {
    search,
    setSearch,
    filter,
    setFilter,
    sort,
    setSort,
    page,
    setPage,
    pageCount,
    total: sorted.length,
    items: paged,
    all: sorted,
  };
}
