"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Customer = {
  id?: string | number;
  name?: string;
  email?: string;
  [key: string]: unknown;
};

type CustomersResponse = {
  customers: Customer[];
  total?: number;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const LIMIT = 20;

export default function OffsetPaginationPage() {
  const [page, setPage] = useState(1);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const totalPages = useMemo(() => {
    if (!total) return null;
    return Math.ceil(total / LIMIT);
  }, [total]);

  async function fetchPage(targetPage: number, opts?: { replacePage?: boolean }) {
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

      const data = (await res.json()) as CustomersResponse;

      setCustomers(Array.isArray(data.customers) ? data.customers : []);
      setTotal(typeof data.total === "number" ? data.total : null);
      if (opts?.replacePage !== false) {
        setPage(safePage);
      }
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

  useEffect(() => {
    void fetchPage(1);
    return () => controllerRef.current?.abort();
  }, []);

  const canGoPrev = page > 1 && !loading;
  const canGoNext = !loading && (totalPages ? page < totalPages : customers.length === LIMIT);

  return (
    <main className="container">
      <h1>Offset Pagination</h1>
      <p>GET {API_BASE_URL}/customers?page={page}&limit={LIMIT}</p>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
        <button onClick={() => fetchPage(page - 1)} disabled={!canGoPrev}>
          Prev
        </button>
        <button onClick={() => fetchPage(page + 1)} disabled={!canGoNext}>
          Next
        </button>
        <button onClick={() => fetchPage(page)} disabled={loading}>
          Reload
        </button>
      </div>

      <p style={{ marginTop: "1rem" }}>
        Page: <strong>{page}</strong> | Limit: <strong>{LIMIT}</strong> | Returned: <strong>{customers.length}</strong>
        {typeof total === "number" ? (
          <>
            {" "}
            | Total: <strong>{total}</strong>
          </>
        ) : null}
      </p>

      {error ? <p style={{ color: "crimson" }}>Error: {error}</p> : null}

      <pre
        style={{
          marginTop: "1rem",
          padding: "0.75rem",
          border: "1px solid #ddd",
          borderRadius: 8,
          overflowX: "auto",
        }}
      >
        {loading ? "Loading..." : JSON.stringify(customers, null, 2)}
      </pre>
    </main>
  );
}
