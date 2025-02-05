import React, { useState } from 'react';
import { SurveyQuestion } from '../types';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface SurveyFormProps {
  questions: SurveyQuestion[];
  sessionId: string;
  siteName: string;
  onSubmit: () => void;
}

export const SurveyForm: React.FC<SurveyFormProps> = ({
  questions,
  sessionId,
  siteName,
  onSubmit
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const missingRequired = questions.filter(
        q => q.required && !answers[q.id]
      );

      if (missingRequired.length > 0) {
        toast.error('Please answer all required questions');
        setSubmitting(false);
        return;
      }

      const responses = Object.entries(answers).map(([questionId, answer]) => ({
        question_id: questionId,
        answer,
        session_id: sessionId,
        site_name: siteName,
        timestamp: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('survey_responses')
        .insert(responses);

      if (error) {
        console.error('Error submitting survey:', error);
        toast.error('Failed to submit survey. Please try again.');
        setSubmitting(false);
        return;
      }

      toast.success('Thank you for your submission!');
      onSubmit();
    } catch (err) {
      console.error('Error submitting survey:', err);
      toast.error('Failed to submit survey. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: SurveyQuestion) => {
    switch (question.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={(e) => setAnswers({
                    ...answers,
                    [question.id]: e.target.value
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'rating_scale':
        return (
          <div className="flex items-center justify-between max-w-xs">
            {[1, 2, 3, 4, 5].map((value) => (
              <label key={value} className="flex flex-col items-center">
                <input
                  type="radio"
                  name={question.id}
                  value={value}
                  checked={answers[question.id] === value.toString()}
                  onChange={(e) => setAnswers({
                    ...answers,
                    [question.id]: e.target.value
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="mt-1 text-sm text-gray-600">{value}</span>
              </label>
            ))}
          </div>
        );

      case 'short_answer':
        return (
          <textarea
            value={answers[question.id] || ''}
            onChange={(e) => setAnswers({
              ...answers,
              [question.id]: e.target.value
            })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Enter your answer..."
          />
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {questions.map((question, index) => (
        <div key={question.id} className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium text-gray-500">
              {index + 1}.
            </span>
            <div>
              <label className="block text-lg font-medium text-gray-900">
                {question.text}
                {question.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
              <div className="mt-4">
                {renderQuestion(question)}
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="pt-6">
        <button
          type="submit"
          disabled={submitting}
          className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Survey'}
        </button>
      </div>
    </form>
  );
};