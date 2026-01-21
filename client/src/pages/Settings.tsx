import { Sidebar } from "@/components/Sidebar";

export default function Settings() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Settings</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚙️</span>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Configuration</h3>
        <p className="text-slate-500 max-w-md mx-auto">
          Settings configuration is not yet implemented in this demo version of Case → Care.
        </p>
      </div>
    </div>
  );
}
