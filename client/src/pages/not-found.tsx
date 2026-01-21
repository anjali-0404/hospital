import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>
        
        <h1 className="text-4xl font-bold text-slate-900 mb-3 font-display">404 Page Not Found</h1>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <Link href="/" className="
          inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white
          bg-primary shadow-lg shadow-blue-500/25
          hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5
          transition-all duration-200
        ">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
