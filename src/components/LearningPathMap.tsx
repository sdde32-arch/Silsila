import React, { useState } from 'react';
import {
  Check,
  Star,
  Lock,
  Sparkles,
  Clock,
  BookOpen,
  RotateCcw,
  Volume2,
  ArrowRight,
  ChevronDown,
  Zap,
  Award,
  Compass,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { LearningPathNode } from '../types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { ProgressBar } from './ui/ProgressBar';

interface LearningPathMapProps {
  nodes: LearningPathNode[];
  onSelectNode: (node: LearningPathNode) => void;
  onStartLesson?: (surahNumber?: number) => void;
  onOpenAudio?: (surahNumber?: number) => void;
  activeNodeId?: string;
}

export const LearningPathMap: React.FC<LearningPathMapProps> = ({
  nodes,
  onSelectNode,
  onStartLesson,
  onOpenAudio,
  activeNodeId = 'node-mulk-2',
}) => {
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(activeNodeId);

  // Group nodes optionally or map sequentially with connecting SVG paths
  return (
    <div className="w-full relative py-2">
      {/* Dynamic Serpentine Journey Path */}
      <div className="relative w-full space-y-6">
        {nodes.map((node, index) => {
          const isCompleted = node.status === 'completed';
          const isCurrent = node.status === 'current' || node.id === activeNodeId;
          const isReview = node.status === 'review';
          const isLocked = node.status === 'locked';
          const isUpcoming = node.status === 'upcoming';
          const isExpanded = expandedNodeId === node.id || isCurrent;
          const nextNode = nodes[index + 1];

          // Check if this is the start of a new Juz section
          const prevNode = nodes[index - 1];
          const isNewJuzSection = !prevNode || prevNode.juzNumber !== node.juzNumber;

          return (
            <div key={node.id} className="relative">
              {/* Optional Section Milestone Header */}
              {isNewJuzSection && (
                <div className="flex items-center gap-3 my-4 px-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200" />
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF9F5] border border-slate-200/80 text-[11px] font-extrabold text-slate-700 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                    <span>{node.juzName || `Juz ${node.juzNumber}`}</span>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200" />
                </div>
              )}

              {/* Main Surah Journey Card with Spine Connector */}
              <div className="relative flex items-start gap-3 sm:gap-4">
                {/* Visual Step Marker & Connecting Spine */}
                <div className="flex flex-col items-center shrink-0 pt-1">
                  {/* Step Node Marker */}
                  <button
                    onClick={() => {
                      if (!isLocked) {
                        onSelectNode(node);
                        setExpandedNodeId(expandedNodeId === node.id ? null : node.id);
                      }
                    }}
                    disabled={isLocked}
                    aria-label={`Select ${node.title}`}
                    className={`relative z-10 w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                      isCurrent
                        ? 'bg-gradient-to-tr from-[#6366F1] to-[#818CF8] text-white shadow-[0_4px_20px_rgba(99,102,241,0.4)] ring-4 ring-[#EEF2FF] scale-110'
                        : isCompleted
                        ? 'bg-[#10B981] hover:bg-[#059669] text-white shadow-xs hover:scale-105 active:scale-95'
                        : isReview
                        ? 'bg-[#F59E0B] hover:bg-[#D97706] text-white shadow-xs ring-3 ring-[#FEF7DA] hover:scale-105 active:scale-95'
                        : isLocked
                        ? 'bg-slate-100 text-slate-400 border border-slate-200/80 cursor-not-allowed'
                        : 'bg-white border-2 border-slate-200 hover:border-[#6366F1] text-slate-700 hover:scale-105'
                    }`}
                  >
                    {isCompleted && <Check className="w-6 h-6 stroke-[3]" />}
                    {isCurrent && <Sparkles className="w-6 h-6 fill-white/20" />}
                    {isReview && <RotateCcw className="w-5 h-5 animate-spin-slow" />}
                    {isLocked && <Lock className="w-4 h-4 text-slate-400" />}
                    {isUpcoming && <BookOpen className="w-5 h-5 text-slate-400" />}

                    {/* Active pulse aura badge */}
                    {isCurrent && (
                      <span className="absolute -inset-1 rounded-2xl bg-[#6366F1]/30 animate-ping pointer-events-none" />
                    )}
                  </button>

                  {/* Connecting Spine Line to Next Node */}
                  {nextNode && (
                    <div className="relative w-0.5 h-full min-h-[40px] my-1 flex justify-center">
                      <div
                        className={`w-1 rounded-full transition-colors ${
                          isCompleted && nextNode.status === 'completed'
                            ? 'bg-[#10B981]'
                            : isCompleted && nextNode.status === 'current'
                            ? 'bg-gradient-to-b from-[#10B981] via-[#6366F1] to-[#6366F1]'
                            : isCurrent
                            ? 'bg-gradient-to-b from-[#6366F1] to-slate-200'
                            : 'bg-slate-200'
                        }`}
                      />
                    </div>
                  )}
                </div>

                {/* Content Journey Card */}
                <div
                  onClick={() => {
                    if (!isLocked) {
                      setExpandedNodeId(expandedNodeId === node.id ? null : node.id);
                    }
                  }}
                  className={`flex-1 rounded-3xl p-4 sm:p-5 transition-all duration-300 cursor-pointer border ${
                    isCurrent
                      ? 'bg-gradient-to-br from-[#FFFFFF] via-[#FAF9F5] to-[#FEF7DA]/30 border-[#F59E0B]/50 shadow-[0_8px_30px_rgba(245,158,11,0.12)] ring-2 ring-[#F59E0B]/30 ring-offset-2 ring-offset-[#FBFBF8]'
                      : isReview
                      ? 'bg-[#FFFFFF] hover:bg-[#FFFBEB]/40 border-[#F59E0B]/30 shadow-xs'
                      : isCompleted
                      ? 'bg-[#FFFFFF] hover:bg-[#F0FDF4]/30 border-slate-200/80 shadow-2xs'
                      : isLocked
                      ? 'bg-[#F9FAFB] border-slate-200/60 opacity-70 cursor-not-allowed'
                      : 'bg-[#FFFFFF] hover:bg-slate-50 border-slate-200/80 shadow-2xs'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isCurrent && (
                          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF7DA] border border-[#F59E0B]/30 text-[#D97706] text-[10px] font-black uppercase tracking-wider animate-pulse">
                            <Zap className="w-3 h-3 fill-[#F59E0B]" />
                            <span>Active Lesson</span>
                          </div>
                        )}
                        {isCompleted && (
                          <Badge variant="success" size="sm">
                            Completed • {node.score}%
                          </Badge>
                        )}
                        {isReview && (
                          <Badge variant="warm" size="sm">
                            Review Due ({node.dueAyahsCount} Ayahs)
                          </Badge>
                        )}
                        {isLocked && (
                          <Badge variant="neutral" size="sm">
                            Locked Milestone
                          </Badge>
                        )}
                        {isUpcoming && (
                          <Badge variant="neutral" size="sm">
                            Next Target
                          </Badge>
                        )}

                        <span className="text-[11px] text-slate-400 font-medium">
                          {node.ayahsRange}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2 pt-0.5">
                        <h3 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                          {node.title}
                        </h3>
                        <span className="text-xs text-slate-400 font-semibold">
                          #{node.surahNumber}
                        </span>
                      </div>
                    </div>

                    {/* Arabic Name Plaque */}
                    <div className="text-right shrink-0">
                      <p className="font-quran text-lg sm:text-xl font-bold text-slate-800 leading-snug dark:text-slate-100" dir="rtl">
                        {node.arabicTitle}
                      </p>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        ⏱️ ~{node.estMinutes}m
                      </span>
                    </div>
                  </div>

                  {/* Verse Preview Snippet */}
                  {node.versePreview && (
                    <div className="mt-3 p-3 rounded-2xl bg-[#FAF9F5] border border-slate-100 space-y-1">
                      <p className="font-quran text-base sm:text-lg text-slate-900 font-bold text-right leading-relaxed dark:text-slate-100" dir="rtl">
                        {node.versePreview}
                      </p>
                      {node.translationSnippet && (
                        <p className="text-[11px] text-slate-500 font-medium italic line-clamp-1">
                          "{node.translationSnippet}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Expanded Detail / Actions Area */}
                  {isExpanded && !isLocked && (
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-3 animate-in fade-in duration-200">
                      {/* Short Description */}
                      {node.description && (
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {node.description}
                        </p>
                      )}

                      {/* Progress bar for active / in-progress nodes */}
                      {(isCurrent || isReview) && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-slate-500">Memorization Progress</span>
                            <span className="text-slate-800">{node.score || 64}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isCurrent
                                  ? 'bg-gradient-to-r from-[#F59E0B] to-[#D97706]'
                                  : 'bg-[#F59E0B]'
                              }`}
                              style={{ width: `${node.score || 64}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Action Button Row */}
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        {isCurrent && (
                          <Button
                            variant="warm"
                            size="md"
                            className="flex-1 min-h-[48px] shadow-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onStartLesson) onStartLesson(node.surahNumber);
                            }}
                            rightIcon={<ArrowRight className="w-4 h-4" />}
                          >
                            Resume Lesson
                          </Button>
                        )}

                        {isReview && (
                          <Button
                            variant="brand"
                            size="md"
                            className="flex-1 min-h-[48px] shadow-xs bg-[#F59E0B] hover:bg-[#D97706]"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onStartLesson) onStartLesson(node.surahNumber);
                            }}
                            leftIcon={<RotateCcw className="w-4 h-4" />}
                          >
                            Start Spaced Review
                          </Button>
                        )}

                        {isCompleted && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 min-h-[48px] bg-white border-slate-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectNode(node);
                            }}
                            leftIcon={<BookOpen className="w-4 h-4 text-slate-600" />}
                          >
                            Explore Verses
                          </Button>
                        )}

                        {/* Audio recitation button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onOpenAudio) onOpenAudio(node.surahNumber);
                          }}
                          className="min-h-[48px] min-w-[48px] w-12 h-12 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center shadow-2xs transition-all active:scale-95 shrink-0"
                          title="Listen to recitation"
                          aria-label="Listen to recitation"
                        >
                          <Volume2 className="w-5 h-5 text-[#6366F1]" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Collapsed Hint for Locked Nodes */}
                  {isLocked && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                      <Lock className="w-3.5 h-3.5" />
                      <span>{node.description || 'Complete previous Surahs to unlock'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
