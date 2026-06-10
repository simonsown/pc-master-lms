'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Question, QuestionOption } from '@/types/quiz';

interface QuestionCardProps {
  question: Question;
  selectedOptionId?: string;
  textAnswer?: string;
  onSelectOption: (optionId: string) => void;
  onTextAnswerChange: (text: string) => void;
  disabled?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedOptionId,
  textAnswer,
  onSelectOption,
  onTextAnswerChange,
  disabled = false
}) => {
  return (
    <div className="glass-panel p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <span className="text-sm font-semibold text-brand-light bg-brand-subtle px-2 py-1 rounded">
          {question.points} {question.points > 1 ? 'points' : 'point'}
        </span>
        <span className="text-xs text-text-muted uppercase tracking-wider">
          {question.type.replace('_', ' ')}
        </span>
      </div>

      <h3 className="text-lg font-medium text-text-primary mb-6 leading-relaxed">
        {question.content}
      </h3>

      {/* Multiple Choice or True/False */}
      {(question.type === 'multiple_choice' || question.type === 'true_false') && (
        <div className="grid gap-3">
          {question.options?.map((option) => (
            <button
              key={option.id}
              onClick={() => !disabled && onSelectOption(option.id)}
              disabled={disabled}
              className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                selectedOptionId === option.id
                  ? 'bg-brand-subtle border-brand-primary text-brand-light shadow-[0_0_15px_rgba(0,198,174,0.2)]'
                  : 'bg-bg-elevated border-border-default text-text-secondary hover:border-brand-light hover:bg-bg-hover'
              } ${disabled ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedOptionId === option.id ? 'border-brand-primary' : 'border-text-muted'
                }`}>
                  {selectedOptionId === option.id && (
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-primary" />
                  )}
                </div>
                <span>{option.content}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Fill in the blank */}
      {question.type === 'fill_blank' && (
        <div className="mt-4">
          <input
            type="text"
            value={textAnswer || ''}
            onChange={(e) => onTextAnswerChange(e.target.value)}
            disabled={disabled}
            placeholder="Type your answer here..."
            className="w-full p-4 bg-bg-elevated border border-border-default rounded-lg text-text-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
          />
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
