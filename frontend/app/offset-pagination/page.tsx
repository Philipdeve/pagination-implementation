"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";

type Customer = {
  customer_id: number;
  first_name: string;
  last_name: string;
};


type PaginationMeta = {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
  has_next_page: boolean;
};

type CustomersListResponse = {
  data: Customer[];
  pagination: PaginationMeta;
};

function parseCustomersListResponse(payload: unknown): CustomersListResponse {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid response: expected a JSON object with `data` and `pagination`");
  }
  const root = payload as Record<string, unknown>;
  if (!Array.isArray(root.data)) {
    throw new Error("Invalid response: expected `data` to be an array");
  }
  const p = root.pagination;
  if (!p || typeof p !== "object") {
    throw new Error("Invalid response: expected `pagination` object");
  }
  const pg = p as Record<string, unknown>;
  const page = pg.page;
  const limit = pg.limit;
  const total_items = pg.total_items;
  const total_pages = pg.total_pages;
  const has_next_page = pg.has_next_page;
  if (
    typeof page !== "number" ||
    typeof limit !== "number" ||
    typeof total_items !== "number" ||
    typeof total_pages !== "number" ||
    typeof has_next_page !== "boolean"
  ) {
    throw new Error(
      "Invalid response: `pagination` must include page, limit, total_items, total_pages, has_next_page",
    );
  }
  return {
    data: root.data as Customer[],
    pagination: {
      page,
      limit,
      total_items,
      total_pages,
      has_next_page,
    },
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const LIMIT = 10;

function getPaginationSlots(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 1) return total === 1 ? [1] : [];
  const set = new Set<number>();
  set.add(1);
  set.add(total);
  for (let i = current - 2; i <= current + 2; i++) {
    if (i >= 1 && i <= total) set.add(i);
  }
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "ellipsis")[] = [];
  let prev = 0;
  for (const n of sorted) {
    if (prev && n - prev > 1) out.push("ellipsis");
    out.push(n);
    prev = n;
  }
  return out;
}

/** Full name for the card title (API may send SHOUTCASE; display as title case). */
function displayFullName(c: Customer): string {
  const first = c.first_name?.trim() ?? "";
  const last = c.last_name?.trim() ?? "";
  const raw = `${first} ${last}`.trim();
  if (!raw) {
    return `Customer #${c.customer_id}`;
  }
  return raw
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function avatarLetter(c: Customer): string {
  const ch = c.first_name?.trim().charAt(0) || c.last_name?.trim().charAt(0);
  return ch ? ch.toUpperCase() : "?";
}

export default function OffsetPaginationPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const slots = useMemo(() => {
    if (!meta || meta.total_pages < 1) return [];
    return getPaginationSlots(meta.page, meta.total_pages);
  }, [meta]);

  async function fetchPage(targetPage: number) {
    setLoading(true);
    setError(null);

    try {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      const safePage = Math.max(1, targetPage);
      const url = `${API_BASE_URL}/customers?page=${safePage}&limit=${LIMIT}`;
      const res = await fetch(url, { cache: "no-store", signal: controller.signal });
      if (!res.ok) {
        throw new Error(`Request failed (${res.status})`);
      }

      const body = parseCustomersListResponse(await res.json());

      setCustomers(body.data);
      setMeta(body.pagination);
      setHasLoaded(true);
    } catch (requestError) {
      if (requestError instanceof Error && requestError.name === "AbortError") {
        return;
      }
      setError(
        requestError instanceof Error ? requestError.message : "Failed to fetch customers",
      );
    } finally {
      setLoading(false);
    }
  }

  const canGoPrev = hasLoaded && meta != null && meta.page > 1 && !loading;
  const canGoNext = hasLoaded && meta != null && meta.has_next_page && !loading;

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <main className="mx-auto max-w-[1012px] px-4 py-8">
        <header className="mb-8 border-b border-[#30363d] pb-6">
          <Link
            href="/"
            className="mb-4 inline-block text-sm font-medium text-[#58a6ff] hover:underline"
          >
            ← Back to home
          </Link>
          <h1 className="text-xl font-semibold tracking-tight text-[#e6edf3]">
            Customers
          </h1>
          <p className="mt-1 text-sm text-[#8b949e]">
            Offset pagination · <code className="rounded bg-[#21262d] px-1.5 py-0.5 text-xs text-[#79c0ff]">{API_BASE_URL}/customers</code>
          </p>
          {!hasLoaded ? (
            <button
              type="button"
              disabled={loading}
              onClick={() => void fetchPage(1)}
              className="mt-6 inline-flex items-center justify-center rounded-md bg-[#238636] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#2ea043] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Loading…" : "Retrieve customers"}
            </button>
          ) : (
            <button
              type="button"
              disabled={loading || !meta}
              onClick={() => meta && void fetchPage(meta.page)}
              className="mt-4 text-sm text-[#58a6ff] hover:underline disabled:opacity-50"
            >
              Refresh this page
            </button>
          )}
        </header>

        {error ? (
          <p className="mb-4 rounded-md border border-[#f85149]/40 bg-[#f85149]/10 px-3 py-2 text-sm text-[#ff7b72]">
            {error}
          </p>
        ) : null}

        {hasLoaded ? (
          <>
            <p className="mb-4 text-sm text-[#8b949e]">
              {loading ? "Updating…" : null}
              {!loading && meta ? (
                <>
                  Showing {(meta.page - 1) * meta.limit + 1}–
                  {Math.min(meta.page * meta.limit, meta.total_items)} of {meta.total_items}{" "}
                  customers
                </>
              ) : null}
            </p>
            {loading && customers.length === 0 ? (
              <p className="py-12 text-center text-sm text-[#8b949e]">Loading…</p>
            ) : (
              <ul className="space-y-4">
                {customers.map((c) => (
                  <li
                    key={c.customer_id}
                    className="rounded-md border border-[#30363d] bg-[#161b22] p-4 transition hover:border-[#444c56]"
                  >
                    <div className="flex gap-3">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#21262d] text-xs font-semibold text-[#58a6ff]"
                        aria-hidden
                      >
                        {avatarLetter(c)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          className="text-left text-base font-semibold text-[#58a6ff] hover:underline"
                        >
                          {displayFullName(c)}
                        </button>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#6e7681]">
                          <span className="inline-flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#d29922]" />
                            Customer ID {c.customer_id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {hasLoaded && !loading && customers.length === 0 && !error ? (
              <p className="py-8 text-center text-sm text-[#8b949e]">No customers on this page.</p>
            ) : null}

            <nav
              className="mt-8 flex flex-wrap items-center justify-center gap-1 border-t border-[#30363d] pt-6"
              aria-label="Pagination"
            >
              <button
                type="button"
                disabled={!canGoPrev}
                onClick={() => meta && void fetchPage(meta.page - 1)}
                className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-[#58a6ff] hover:bg-[#21262d] disabled:cursor-not-allowed disabled:text-[#484f58]"
              >
                <span aria-hidden>‹</span> Previous
              </button>

              {meta && meta.total_pages > 0
                ? slots.map((slot, idx) =>
                    slot === "ellipsis" ? (
                      <span
                        key={`e-${idx}`}
                        className="px-2 text-[#8b949e]"
                        aria-hidden
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={slot}
                        type="button"
                        disabled={loading || slot === meta.page}
                        onClick={() => void fetchPage(slot)}
                        className={
                          slot === meta.page
                            ? "min-w-[2rem] rounded-md bg-[#1f6feb] px-2 py-1.5 text-sm font-medium text-white"
                            : "min-w-[2rem] rounded-md px-2 py-1.5 text-sm text-[#e6edf3] hover:bg-[#21262d] disabled:opacity-100"
                        }
                      >
                        {slot}
                      </button>
                    ),
                  )
                : null}

              <button
                type="button"
                disabled={!canGoNext}
                onClick={() => meta && void fetchPage(meta.page + 1)}
                className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-[#58a6ff] hover:bg-[#21262d] disabled:cursor-not-allowed disabled:text-[#484f58]"
              >
                Next <span aria-hidden>›</span>
              </button>
            </nav>

            {hasLoaded && meta ? (
              <p className="mt-4 text-center text-xs text-[#6e7681]">
                Page {meta.page} of {meta.total_pages} · Limit {meta.limit} per page
              </p>
            ) : null}
          </>
        ) : null}
      </main>
    </div>
  );
}
