'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, XCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface ScoreReportProps {
  score: number;
  totalPoints: number;
  passingScore: number;
  attemptId: string;
}

const ScoreReport: React.FC<ScoreReportProps> = ({ score, totalPoints, passingScore, attemptId }) => {
  const isPassed = score >= passingScore;
  const percentage = (score / totalPoints) * 100;

  return (
    <div className="glass-panel p-8 text-center max-w-2xl mx-auto mt-10">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 12 }}
        className="mb-8"
      >
        <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
          isPassed ? 'bg-success/10 text-success shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'bg-danger/10 text-danger shadow-[0_0_30px_rgba(239,68,68,0.3)]'
        }`}>
          {isPassed ? <Trophy size={48} /> : <XCircle size={48} />}
        </div>

        <h2 className="text-3xl font-bold text-text-primary mb-2">
          {isPassed ? 'Congratulations!' : 'Good Effort!'}
        </h2>
        <p className="text-text-secondary">
          {isPassed 
            ? 'You have successfully passed the quiz.' 
            : 'You did not reach the passing score this time.'}
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-bg-elevated p-6 rounded-2xl border border-border-subtle">
          <p className="text-xs text-text-muted uppercase font-bold mb-1">Your Score</p>
          <p className={`text-4xl font-bold ${isPassed ? 'text-success' : 'text-danger'}`}>
            {score}<span className="text-lg text-text-muted">/{totalPoints}</span>
          </p>
        </div>
        <div className="bg-bg-elevated p-6 rounded-2xl border border-border-subtle">
          <p className="text-xs text-text-muted uppercase font-bold mb-1">Percentage</p>
          <p className="text-4xl font-bold text-brand-light">
            {Math.round(percentage)}%
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link 
          href={`/student/quiz/${attemptId}/results`}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-brand-primary text-white rounded-xl font-bold hover:brightness-110 transition-all shadow-lg"
        >
          Review Answers <ChevronRight size={18} />
        </Link>
        <Link 
          href="/student"
          className="flex items-center justify-center gap-2 px-8 py-4 bg-bg-elevated text-text-primary rounded-xl font-bold border border-border-default hover:bg-bg-hover transition-all"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default ScoreReport;
