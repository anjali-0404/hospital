import { useCases } from "@/hooks/use-cases";
import { Link } from "wouter";
import { Plus, ChevronRight, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function Home() {
  const { data: cases, isLoading } = useCases();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex items-end justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-500">Overview of recent patient cases and insights.</p>
        </div>
        
        <Link href="/new-case" className="
          inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm
          bg-primary text-white shadow-lg shadow-blue-500/25
          hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5
          transition-all duration-200
        ">
          <Plus size={18} strokeWidth={2.5} />
          New Case
        </Link>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Cases</p>
            <h3 className="text-3xl font-bold text-slate-900">{cases?.length || 0}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-primary rounded-xl">
            <Clock size={20} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Pending Analysis</p>
            <h3 className="text-3xl font-bold text-slate-900">
              {cases?.filter(c => c.status === 'pending').length || 0}
            </h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertCircle size={20} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Completed</p>
            <h3 className="text-3xl font-bold text-slate-900">
              {cases?.filter(c => c.status === 'completed').length || 0}
            </h3>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* Case List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Recent Cases</h2>
        </div>
        
        {cases?.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No cases yet</h3>
            <p className="text-slate-500 mb-6">Create your first patient case to get started.</p>
            <Link href="/new-case" className="text-primary font-medium hover:underline">
              Create New Case
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {cases?.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/cases/${c.id}`} className="block p-6 hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold
                        ${c.status === 'completed' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-amber-100 text-amber-700'}
                      `}>
                        {c.patientName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
                          {c.patientName}
                          <span className="ml-2 text-slate-400 font-normal text-sm">#{c.id}</span>
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                          <span>{c.patientAge ? `${c.patientAge} years` : 'N/A'}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <span>{c.createdAt && format(new Date(c.createdAt), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className={`
                        px-3 py-1 rounded-full text-xs font-semibold
                        ${c.status === 'completed' 
                          ? 'bg-green-100 text-green-700' 
                          : c.status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'}
                      `}>
                        {c.status?.toUpperCase() || 'UNKNOWN'}
                      </div>
                      <ChevronRight size={20} className="text-slate-300 group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
