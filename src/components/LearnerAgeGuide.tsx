import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Clock, BookOpen, Sparkles } from 'lucide-react';
import { AGE_GROUP_GUIDE } from '../data/content';

interface LearnerAgeGuideProps {
  onSelectProgramForBooking: (programName: string) => void;
}

export const LearnerAgeGuide: React.FC<LearnerAgeGuideProps> = ({ onSelectProgramForBooking }) => {
  const [activeTab, setActiveTab] = useState(0);
  const currentStage = AGE_GROUP_GUIDE[activeTab];

  return (
    <section className="py-14 bg-white border-b border-stone-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-8">
          <p className="text-xs sm:text-sm font-semibold tracking-wider text-[#1A5336] uppercase mb-1">
            Parent Readiness Guide
          </p>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#0F1E36] tracking-tight mb-3">
            Find the Right Learning Stage for Your Child
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Children develop at unique rates. Explore our recommended structures and key focuses based on your child’s age group.
          </p>
        </div>

        {/* Tab buttons (Segmented controls - functional buttons) */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-stone-100 rounded-xl max-w-xl mb-8">
          {AGE_GROUP_GUIDE.map((stage, idx) => (
            <button
              key={stage.ageRange}
              onClick={() => setActiveTab(idx)}
              className={`flex-1 min-w-[120px] py-2.5 px-4 text-xs sm:text-sm font-medium rounded-lg transition-all text-center whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5336] ${
                activeTab === idx
                  ? 'bg-white text-[#0F1E36] shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {stage.ageRange}
            </button>
          ))}
        </div>

        {/* Active Stage Card */}
        <div className="bg-[#FAF9F5] border border-stone-200/90 rounded-2xl p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1A5336] uppercase tracking-wider mb-2">
                <span>STAGE FOCUS</span>
                <span aria-hidden="true">·</span>
                <span>{currentStage.ageRange}</span>
              </div>

              <h3 className="font-display font-bold text-2xl text-[#0F1E36] mb-3">
                {currentStage.stageName}
              </h3>

              <div className="space-y-4 mb-6 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">Core Developmental Focus: </span>
                    <span>{currentStage.focus}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#1A5336] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">Session Structure: </span>
                    <span>{currentStage.idealFormat}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">Recommended Pathway: </span>
                    <span>{currentStage.recommendedProgram}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col justify-center gap-3">
              <div className="bg-white p-5 rounded-xl border border-stone-200 text-center">
                <p className="text-xs text-slate-500 mb-1">Tailored for this age</p>
                <p className="font-display font-bold text-lg text-[#0F1E36] mb-3">
                  {currentStage.recommendedProgram}
                </p>
                <button
                  onClick={() => onSelectProgramForBooking(currentStage.recommendedProgram)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#0F1E36] hover:bg-[#172D52] rounded-lg transition-colors"
                >
                  <span>Book for {currentStage.ageRange}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
