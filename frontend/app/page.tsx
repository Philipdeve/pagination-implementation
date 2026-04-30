import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <main className="mx-auto flex min-h-screen w-full max-w-[1012px] flex-col justify-center px-4 py-8">
        <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-8 shadow-[0_0_0_1px_rgba(48,54,61,0.2)]">
          <p className="mb-2 text-sm font-medium text-[#58a6ff]">Pagination Playground</p>
          <h1 className="text-3xl font-semibold tracking-tight">Frontend Integration Demos</h1>
          <p className="mt-3 max-w-2xl text-sm text-[#8b949e]">
            Pick a demo to test your backend pagination behavior with a clean UI.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link
              href="/offset-pagination"
              className="group rounded-lg border border-[#30363d] bg-[#0d1117] p-5 transition hover:border-[#58a6ff] hover:bg-[#111827]"
            >
              <p className="text-base font-semibold text-[#e6edf3]">Offset Pagination</p>
              <p className="mt-1 text-sm text-[#8b949e]">
                Navigate with page and limit values.
              </p>
              <p className="mt-4 text-sm font-medium text-[#58a6ff] group-hover:underline">
                Open offset demo →
              </p>
            </Link>

            <Link
              href="/cursor-pagination"
              className="group rounded-lg border border-[#30363d] bg-[#0d1117] p-5 transition hover:border-[#58a6ff] hover:bg-[#111827]"
            >
              <p className="text-base font-semibold text-[#e6edf3]">Cursor Pagination</p>
              <p className="mt-1 text-sm text-[#8b949e]">
                Navigate using next cursor tokens.
              </p>
              <p className="mt-4 text-sm font-medium text-[#58a6ff] group-hover:underline">
                Open cursor demo →
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
