"use client";

import Link from "next/link";
import { useRef, useState } from "react";

type Payment = {
  payment_id: number;
  customer_id: number;
  staff_id: number;
  rental_id: number;
  amount: number;
  payment_date: string;
};

type PaymentPagination = {
  next_cursor: string | null;
  limit: number;
  has_more_data: boolean;
};

type PaymentsResponse = {
  data: Payment[];
  pagination: PaymentPagination;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const LIMIT = 20;
const FIRST_CURSOR: string | null = null;

function parsePaymentsResponse(payload: unknown): PaymentsResponse {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid response: expected object");
  }
  const root = payload as Record<string, unknown>;
  if (!Array.isArray(root.data)) {
    throw new Error("Invalid response: expected `data` array");
  }
  const pagination = root.pagination;
  if (!pagination || typeof pagination !== "object") {
    throw new Error("Invalid response: expected `pagination` object");
  }
  const pg = pagination as Record<string, unknown>;
  if (typeof pg.limit !== "number") {
    throw new Error("Invalid response: expected numeric `pagination.limit`");
  }
  if (pg.next_cursor !== null && typeof pg.next_cursor !== "string") {
    throw new Error("Invalid response: expected string/null `pagination.next_cursor`");
  }
  if (typeof pg.has_more_data !== "boolean") {
    throw new Error("Invalid response: expected boolean `pagination.has_more_data`");
  }

  return {
    data: root.data as Payment[],
    pagination: {
      next_cursor: pg.next_cursor as string | null,
      limit: pg.limit as number,
      has_more_data: pg.has_more_data as boolean,
    },
  };
}

export default function CursorPaginationPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [currentCursor, setCurrentCursor] = useState<string | null>(FIRST_CURSOR);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  async function fetchPayments(targetCursor: string | null, prevHistory?: string[]) {
    setLoading(true);
    setError(null);

    try {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      const url = new URL("/payments", API_BASE_URL);
      url.searchParams.set("limit", String(LIMIT));
      if (targetCursor) {
        url.searchParams.set("cursor", targetCursor);
      }
      const res = await fetch(url.toString(), { cache: "no-store", signal: controller.signal });
      if (!res.ok) {
        throw new Error(`Request failed (${res.status})`);
      }

      const body = parsePaymentsResponse(await res.json());
      setPayments(body.data);
      setCurrentCursor(targetCursor);
      setNextCursor(body.pagination.next_cursor);
      if (prevHistory) setCursorHistory(prevHistory);
      setHasLoaded(true);
    } catch (requestError) {
      if (requestError instanceof Error && requestError.name === "AbortError") {
        return;
      }
      setError(requestError instanceof Error ? requestError.message : "Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  }

  function handleRetrieve() {
    void fetchPayments(FIRST_CURSOR, []);
  }

  function handleNext() {
    if (nextCursor == null) return;
    const nextHistory = currentCursor ? [...cursorHistory, currentCursor] : [...cursorHistory];
    void fetchPayments(nextCursor, nextHistory);
  }

  function handlePrev() {
    if (cursorHistory.length === 0) return;
    const prevHistory = cursorHistory.slice(0, -1);
    const prevCursor = cursorHistory[cursorHistory.length - 1];
    void fetchPayments(prevCursor, prevHistory);
  }

  const canGoPrev = hasLoaded && !loading && cursorHistory.length > 0;
  const canGoNext = hasLoaded && !loading && nextCursor != null;

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
          <h1 className="text-xl font-semibold tracking-tight text-[#e6edf3]">Payments</h1>
          <p className="mt-1 text-sm text-[#8b949e]">
            Cursor pagination ·{" "}
            <code className="rounded bg-[#21262d] px-1.5 py-0.5 text-xs text-[#79c0ff]">
              {API_BASE_URL}/payments?cursor=&lt;encoded-string&gt;&limit={LIMIT}
            </code>
          </p>
          {!hasLoaded ? (
            <button
              type="button"
              disabled={loading}
              onClick={handleRetrieve}
              className="mt-6 inline-flex items-center justify-center rounded-md bg-[#238636] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#2ea043] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Loading..." : "Retrieve payments"}
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={() => void fetchPayments(currentCursor, cursorHistory)}
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
              {loading ? "Updating..." : `Showing ${payments.length} payments`}
            </p>

            {loading && payments.length === 0 ? (
              <p className="py-12 text-center text-sm text-[#8b949e]">Loading...</p>
            ) : (
              <ul className="space-y-4">
                {payments.map((p) => (
                  <li
                    key={p.payment_id}
                    className="rounded-md border border-[#30363d] bg-[#161b22] p-4 transition hover:border-[#444c56]"
                  >
                    <div className="flex gap-3">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#21262d] text-xs font-semibold text-[#58a6ff]"
                        aria-hidden
                      >
                        $
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-semibold text-[#58a6ff]">
                          Payment #{p.payment_id}
                        </p>
                        <p className="mt-1 text-sm text-[#8b949e]">
                          Amount: ${p.amount.toFixed(2)} · Customer {p.customer_id}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#6e7681]">
                          <span>Staff {p.staff_id}</span>
                          <span>Rental {p.rental_id}</span>
                          <span>{new Date(p.payment_date).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {hasLoaded && !loading && payments.length === 0 && !error ? (
              <p className="py-8 text-center text-sm text-[#8b949e]">No payments for this cursor.</p>
            ) : null}

            <nav
              className="mt-8 flex flex-wrap items-center justify-center gap-2 border-t border-[#30363d] pt-6"
              aria-label="Cursor Pagination"
            >
              <button
                type="button"
                disabled={!canGoPrev}
                onClick={handlePrev}
                className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-[#58a6ff] hover:bg-[#21262d] disabled:cursor-not-allowed disabled:text-[#484f58]"
              >
                <span aria-hidden>‹</span> Previous
              </button>
              <span className="rounded-md bg-[#21262d] px-3 py-1.5 text-xs text-[#8b949e]">
                Cursor {currentCursor ? `${currentCursor.slice(0, 16)}...` : "start"}
              </span>
              <button
                type="button"
                disabled={!canGoNext}
                onClick={handleNext}
                className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-[#58a6ff] hover:bg-[#21262d] disabled:cursor-not-allowed disabled:text-[#484f58]"
              >
                Next <span aria-hidden>›</span>
              </button>
            </nav>
          </>
        ) : null}
      </main>
    </div>
  );
}
