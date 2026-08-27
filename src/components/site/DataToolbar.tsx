import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DataToolbar({
  search,
  onSearch,
  placeholder = "Search…",
  sort,
  onSort,
  sortOptions = [],
  filters = [],
  filter,
  onFilter,
  resultCount,
}: {
  search: string;
  onSearch: (v: string) => void;
  placeholder?: string;
  sort?: string;
  onSort?: (v: string) => void;
  sortOptions?: { key: string; label: string }[];
  filters?: readonly string[];
  filter?: string;
  onFilter?: (v: string) => void;
  resultCount?: number;
}) {
  return (
    <div className="mb-10 space-y-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <label className="sr-only" htmlFor="collection-search">Search</label>
          <Input
            id="collection-search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={placeholder}
            className="pl-9"
          />
        </div>
        {sortOptions.length > 0 && onSort && (
          <div className="flex items-center gap-2">
            <label htmlFor="collection-sort" className="text-sm text-muted-foreground">Sort</label>
            <select
              id="collection-sort"
              value={sort}
              onChange={(e) => onSort(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {sortOptions.map((o) => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {filters.length > 0 && onFilter && (
        <div className="flex flex-wrap justify-center gap-2" role="tablist" aria-label="Filter">
          {filters.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={filter === c}
              onClick={() => onFilter(c)}
              className={cn(
                "min-h-11 rounded-full border px-4 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                filter === c
                  ? "border-primary bg-primary text-primary-foreground shadow-elegant"
                  : "border-border hover:bg-accent",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {typeof resultCount === "number" && (
        <p className="text-center text-sm text-muted-foreground" aria-live="polite">
          {resultCount} result{resultCount === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );
}

export function Pager({
  page,
  pageCount,
  onPage,
}: {
  page: number;
  pageCount: number;
  onPage: (p: number) => void;
}) {
  if (pageCount <= 1) return null;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      <Button
        variant="outline"
        size="icon"
        aria-label="Previous page"
        disabled={page === 1}
        onClick={() => onPage(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {pages.map((p) => (
        <Button
          key={p}
          variant={p === page ? "default" : "outline"}
          size="icon"
          aria-label={`Page ${p}`}
          aria-current={p === page ? "page" : undefined}
          onClick={() => onPage(p)}
        >
          {p}
        </Button>
      ))}
      <Button
        variant="outline"
        size="icon"
        aria-label="Next page"
        disabled={page === pageCount}
        onClick={() => onPage(page + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
