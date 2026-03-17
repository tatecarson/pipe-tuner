import { PipeLengthCalculator } from "@/components/PipeLengthCalculator";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-zinc-800/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
              Pipe Tuner
            </h1>
            <span className="text-xs font-mono text-zinc-600 tracking-wider">
              v1.0
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Calculate pipe lengths for musical instruments across tuning systems
          </p>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <PipeLengthCalculator />
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <p className="text-xs text-zinc-600 font-mono">
            Open-open pipe · λ = 2L · v = 331.3 + 0.606T
          </p>
        </div>
      </footer>
    </main>
  );
}
