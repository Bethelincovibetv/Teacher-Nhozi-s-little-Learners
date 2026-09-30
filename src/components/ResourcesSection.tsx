import React, { useState } from 'react';
import { BookOpen, Clock, ArrowRight, X, Sparkles, Check, Download, Share2 } from 'lucide-react';
import { ResourceArticle } from '../types';
import { RESOURCES_DATA, getWhatsAppUrl } from '../data/content';
import { ParentResourcesSuite } from './ParentResourcesSuite';

interface ResourcesSectionProps {
  whatsappNumber?: string;
}

export const ResourcesSection: React.FC<ResourcesSectionProps> = ({ whatsappNumber }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeArticle, setActiveArticle] = useState<ResourceArticle | null>(null);

  const categories = ['All', 'Phonics', 'Early Reading', 'Literacy', 'Parent Guide'];

  const filteredArticles =
    selectedCategory === 'All'
      ? RESOURCES_DATA
      : RESOURCES_DATA.filter((a) => a.category === selectedCategory);

  return (
    <section id="resources" className="py-16 md:py-24 bg-white border-b border-stone-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <p className="text-xs sm:text-sm font-semibold tracking-wider text-[#1A5336] uppercase mb-2">
              Parent Resource Corner
            </p>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#0F1E36] tracking-tight mb-3">
              Practical Reading & Learning Guides for Families
            </h2>
            <p className="text-base text-slate-700 leading-relaxed">
              Empowering parents with gentle, research-backed literacy tips and home routines that make reading an everyday joy.
            </p>
          </div>

          {/* Interactive Category Filter (Functional buttons with active states) */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-100 rounded-xl">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5336] ${
                  selectedCategory === cat
                    ? 'bg-white text-[#0F1E36] shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className="bg-[#FAF9F5] rounded-2xl border border-stone-200 p-6 flex flex-col justify-between hover:border-[#1A5336]/40 transition-all duration-200 group"
            >
              <div>
                {/* Unboxed metadata line with typographic separator */}
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                  <span className="font-semibold text-[#1A5336]">{article.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{article.readTime}</span>
                </div>

                <h3 className="font-display font-bold text-base sm:text-lg text-[#0F1E36] group-hover:text-[#1A5336] transition-colors mb-3 line-clamp-2">
                  {article.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 line-clamp-3">
                  {article.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-200/70 flex items-center justify-between">
                <button
                  onClick={() => setActiveArticle(article)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F1E36] hover:text-[#1A5336] transition-colors focus:outline-none"
                >
                  <span>Read Full Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <BookOpen className="w-4 h-4 text-stone-400 group-hover:text-[#1A5336] transition-colors" />
              </div>
            </div>
          ))}
        </div>

        {/* High-Fidelity Downloadable Parent Resources Suite (PDF Guide, Phonics Chart, Milestone Checklist) */}
        <ParentResourcesSuite />

        {/* Interactive Parent Question / Resource Support Banner */}
        <div className="mt-12 p-6 sm:p-8 bg-[#FAF9F5] border border-stone-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="font-display font-bold text-lg text-[#0F1E36]">
              Looking for tailored advice on your child's phonics stage?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              Teacher Ngozi provides personalized recommendations for reading materials, decodable books, and home routines.
            </p>
          </div>
          <a
            href={getWhatsAppUrl('Hello Teacher Ngozi, I was reading your parent resource guides and would love advice on books for my child.', whatsappNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#1A5336] bg-[#E6F4EC] hover:bg-[#d8ece1] rounded-xl transition-colors shrink-0"
          >
            <span>Ask for Book Recommendations on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Full Article Modal Reader */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-stone-200 mb-6">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <span className="font-semibold text-[#1A5336]">{activeArticle.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeArticle.readTime}</span>
                </div>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-[#0F1E36]">
                  {activeArticle.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveArticle(null)}
                className="p-1 rounded-lg text-slate-500 hover:bg-stone-100"
                aria-label="Close article"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-700 leading-relaxed mb-8">
              {activeArticle.fullContent.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            {/* Key Takeaways Box */}
            <div className="bg-[#FAF9F5] p-5 rounded-xl border border-stone-200 mb-8">
              <h4 className="font-display font-bold text-sm text-[#0F1E36] mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Key Parent Takeaways</span>
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                {activeArticle.keyTakeaways.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#1A5336] shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row justify-between gap-3">
              <a
                href={getWhatsAppUrl(`Hello Teacher Ngozi, I just read "${activeArticle.title}" and would like to ask a question.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-center text-xs sm:text-sm font-medium text-[#1A5336] bg-[#E6F4EC] hover:bg-[#d8ece1] rounded-lg transition-colors"
              >
                Discuss this topic on WhatsApp
              </a>

              <button
                onClick={() => setActiveArticle(null)}
                className="px-5 py-2 text-xs sm:text-sm font-semibold text-slate-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
