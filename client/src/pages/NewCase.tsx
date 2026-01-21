import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateCase } from "@/hooks/use-cases";
import { insertCaseSchema } from "@shared/schema";
import { AudioUploader } from "@/components/AudioUploader";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

// Extended schema to handle type coercion for age
const formSchema = insertCaseSchema.extend({
  patientAge: z.coerce.number().min(0, "Age must be a positive number"),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewCase() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { mutate: createCase, isPending } = useCreateCase();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      patientName: "",
      clinicalNotes: "",
      transcript: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    createCase(data, {
      onSuccess: (newCase) => {
        toast({
          title: "Case Created",
          description: "Analysis will begin shortly.",
        });
        setLocation(`/cases/${newCase.id}`);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const handleTranscription = (text: string) => {
    const current = form.getValues("transcript");
    form.setValue("transcript", current ? current + "\n\n" + text : text);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">New Patient Case</h1>
          <p className="text-slate-500 mt-1">Create a case to generate AI-driven clinical insights.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-primary rounded-full"/>
                Patient Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Patient Name</label>
                  <input
                    {...form.register("patientName")}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    placeholder="e.g. John Doe"
                  />
                  {form.formState.errors.patientName && (
                    <p className="text-red-500 text-xs">{form.formState.errors.patientName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Age</label>
                  <input
                    type="number"
                    {...form.register("patientAge")}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    placeholder="e.g. 45"
                  />
                  {form.formState.errors.patientAge && (
                    <p className="text-red-500 text-xs">{form.formState.errors.patientAge.message}</p>
                  )}
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-slate-700">Case Title / Reason for Visit</label>
                  <input
                    {...form.register("title")}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    placeholder="e.g. Persistent cough and fatigue"
                  />
                  {form.formState.errors.title && (
                    <p className="text-red-500 text-xs">{form.formState.errors.title.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-primary rounded-full"/>
                Clinical Details
              </h3>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Clinical Notes</label>
                  <textarea
                    {...form.register("clinicalNotes")}
                    className="w-full h-32 px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none"
                    placeholder="Enter doctor's notes, observations, or lab summary..."
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">Voice Transcript</label>
                    <span className="text-xs text-slate-400">Can be auto-populated from audio</span>
                  </div>
                  <textarea
                    {...form.register("transcript")}
                    className="w-full h-48 px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none font-mono text-sm leading-relaxed"
                    placeholder="Patient narrative transcript..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isPending}
                className="
                  inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white
                  bg-primary shadow-lg shadow-blue-500/25
                  hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5
                  active:translate-y-0 active:shadow-md
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200
                "
              >
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Creating Case...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save & Analyze Case
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-lg">
            <h3 className="font-display font-bold text-lg mb-2">Voice Input</h3>
            <p className="text-slate-300 text-sm mb-6">
              Upload a patient interview recording to automatically transcribe and populate the case.
            </p>
            <AudioUploader onTranscribed={handleTranscription} />
          </div>

          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <h4 className="font-semibold text-blue-900 mb-2">How it works</h4>
            <ul className="space-y-3 text-sm text-blue-800/80">
              <li className="flex gap-2">
                <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                Upload patient audio or enter clinical notes.
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                AI analyzes the narrative for missed details.
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                Receive diagnostic blind spots and follow-up questions.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
