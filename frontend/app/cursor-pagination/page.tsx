"use client";

import { useState } from "react";

type CursorResponse<T> = {
  items?: T[];
  data?: T[];
  results?: T[];
  nextCursor?: string | null;
  prevCursor?: string | null;
};

type RecordItem = Record<string, unknown>;

const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const DEFAULT_PATH = "/items";
const DEFAULT_LIMIT = 5;

function getItems(payload: unknown): RecordItem[] {
  if (Array.isArray(payload)) return payload as RecordItem[];
  if (!payload || typeof payload !== "object") return [];

  const parsed = payload as CursorResponse<RecordItem>;
  return parsed.items ?? parsed.data ?? parsed.results ?? [];
}

function getCursor(payload: unknown, key: "nextCursor" | "prevCursor"): string | null {
  if (!payload || typeof payload !== "object") return null;
  const parsed = payload as CursorResponse<RecordItem>;
  const value = parsed[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

export default function CursorPaginationPage() {
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [path, setPath] = useState(DEFAULT_PATH);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [cursor, setCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [prevCursor, setPrevCursor] = useState<string | null>(null);
  const [items, setItems] = useState<RecordItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchByCursor(targetCursor: string | null) {
    setLoading(true);
    setError(null);

    try {
      const url = new URL(path, baseUrl);
      url.searchParams.set("limit", String(limit));
      if (targetCursor) {
        url.searchParams.set("cursor", targetCursor);
      }

      const res = await fetch(url.toString(), { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Request failed (${res.status})`);
      }

      const payload: unknown = await res.json();
      setCursor(targetCursor);
      setItems(getItems(payload));
      setNextCursor(getCursor(payload, "nextCursor"));
      setPrevCursor(getCursor(payload, "prevCursor"));
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Failed to fetch cursor page",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <h1>Cursor Pagination Demo</h1>
      <p>Uses `limit` + `cursor` query params and server-provided cursors.</p>

      <div style={{ display: "grid", gap: "0.5rem", maxWidth: 720 }}>
        <label>
          API Base URL
          <input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            style={{ width: "100%" }}
          />
        </label>
        <label>
          Endpoint Path
          <input value={path} onChange={(e) => setPath(e.target.value)} style={{ width: "100%" }} />
        </label>
        <label>
          Limit
          <input
            type="number"
            min={1}
            value={limit}
            onChange={(e) => setLimit(Math.max(1, Number(e.target.value) || 1))}
          />
        </label>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
        <button onClick={() => fetchByCursor(null)} disabled={loading}>
          First page
        </button>
        <button onClick={() => fetchByCursor(prevCursor)} disabled={loading || !prevCursor}>
          Prev
        </button>
        <button onClick={() => fetchByCursor(nextCursor)} disabled={loading || !nextCursor}>
          Next
        </button>
      </div>

      <p style={{ marginTop: "1rem" }}>
        Current cursor: <strong>{cursor ?? "none"}</strong> | Next cursor:{" "}
        <strong>{nextCursor ?? "none"}</strong> | Prev cursor: <strong>{prevCursor ?? "none"}</strong>
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
        {loading ? "Loading..." : JSON.stringify(items, null, 2)}
      </pre>
    </main>
  );
}
