import { useCase } from "@/hooks/use-cases";
import { Link, useRoute } from "wouter";
import { ArrowLeft, User, Calendar, FileText, AlertTriangle, HelpCircle, Globe, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function CaseDetail() {
  const [, params] = useRoute("/cases/:id");
  const id = parseInt(params?.id || "0");
  const { data: caseData, isLoading, error } = useCase(id);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          <Loader2 className="w-12 h-12 text-primary animate-spin relative z-10" />
        </div>
        <p className="text-slate-500 font-medium">Loading case data...</p>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="p-12 text-center max-w-lg mx-auto mt-20">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Case Not Found</h2>
        <p className="text-slate-500 mb-6">The case you requested does not exist or has been deleted.</p>
        <Link href="/" className="text-primary font-semibold hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  const { insight } = caseData;
  const isPending = caseData.status === "pending";

  return (
    <div className="p-8 max-w-7xl mx-auto pb-20">
      <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8 border-b border-slate-200 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900">{caseData.patientName}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
              caseData.status === 'completed' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-amber-100 text-amber-700'
            }`}>
              {caseData.status}
            </span>
          </div>
          <p className="text-lg text-slate-600 font-medium">{caseData.title}</p>
          <div className="flex items-center gap-6 mt-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <User size={16} />
              Age: {caseData.patientAge || "N/A"}
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              Created: {caseData.createdAt && format(new Date(caseData.createdAt), 'PPP')}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Patient Data */}
        <div className="space-y-8">
          {/* Clinical Notes */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <FileText className="text-slate-400" size={18} />
              <h3 className="font-semibold text-slate-900">Clinical Notes</h3>
            </div>
            <div className="p-6 text-slate-700 leading-relaxed whitespace-pre-wrap">
              {caseData.clinicalNotes || <span className="text-slate-400 italic">No notes provided.</span>}
            </div>
          </section>

          {/* Transcript */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <h3 className="font-semibold text-slate-900">Voice Transcript</h3>
            </div>
            <div className="p-6">
              {caseData.transcript ? (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 font-mono text-sm text-slate-600 leading-relaxed max-h-96 overflow-y-auto">
                  {caseData.transcript}
                </div>
              ) : (
                <span className="text-slate-400 italic">No transcript available.</span>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: AI Insights */}
        <div className="space-y-8">
          {isPending ? (
            <div className="bg-white rounded-2xl shadow-lg border border-primary/20 p-12 text-center">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full animate-pulse" />
                <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Analyzing Case...</h3>
              <p className="text-slate-500 max-w-xs mx-auto">
                Our AI is reviewing the transcript and notes to identify potential blind spots.
              </p>
            </div>
          ) : insight ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl shadow-xl overflow-hidden text-white relative">
                <div className="absolute top-0 right-0 p-32 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                
                <div className="p-6 border-b border-white/10 flex items-center justify-between relative z-10">
                  <h3 className="font-display font-bold text-xl flex items-center gap-2">
                    <Sparkles className="text-blue-400" size={20} />
                    AI Reasoning
                  </h3>
                  {insight.originalLanguage && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-medium backdrop-blur-sm">
                      <Globe size={12} />
                      Translated from {insight.originalLanguage}
                    </div>
                  )}
                </div>

                <div className="p-6 relative z-10">
                  <div className="mb-6">
                    <h4 className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-2">Summary</h4>
                    <p className="text-slate-100 leading-relaxed opacity-90">
                      {insight.summary}
                    </p>
                  </div>
                </div>
              </div>

              {/* Blind Spots */}
              <div className="bg-amber-50 rounded-2xl border border-amber-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-amber-100 flex items-center gap-2 text-amber-900">
                  <AlertTriangle size={20} className="text-amber-600" />
                  <h3 className="font-bold">Diagnostic Blind Spots</h3>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {insight.blindSpots?.map((spot, i) => (
                      <li key={i} className="flex gap-3 text-amber-900/80 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                        {spot}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Follow-up Questions */}
              <div className="bg-blue-50 rounded-2xl border border-blue-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-blue-100 flex items-center gap-2 text-blue-900">
                  <HelpCircle size={20} className="text-blue-600" />
                  <h3 className="font-bold">Recommended Follow-up Questions</h3>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {insight.questions?.map((question, i) => (
                      <li key={i} className="flex gap-3 bg-white p-3 rounded-xl border border-blue-100 shadow-sm text-slate-700 text-sm">
                        <span className="text-blue-500 font-bold">{i + 1}.</span>
                        {question}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center">
              <p className="text-slate-500">Analysis failed or returned no data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
