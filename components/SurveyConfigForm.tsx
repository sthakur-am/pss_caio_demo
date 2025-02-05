import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { SurveyConfig, QuestionType } from '../types';

interface SurveyConfigFormProps {
  config: SurveyConfig;
  onChange: (config: SurveyConfig) => void;
}

export const SurveyConfigForm: React.FC<SurveyConfigFormProps> = ({
  config,
  onChange
}) => {
  const addQuestion = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (config.questions.length >= 10) {
      alert('Maximum 10 questions allowed');
      return;
    }

    const newQuestion = {
      id: crypto.randomUUID(),
      type: 'multiple_choice' as QuestionType,
      text: '',
      options: [''],
      required: true
    };

    onChange({
      ...config,
      questions: [...config.questions, newQuestion]
    });
  };

  const removeQuestion = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    onChange({
      ...config,
      questions: config.questions.filter(q => q.id !== id)
    });
  };

  const updateQuestion = (id: string, updates: Partial<SurveyConfig['questions'][0]>) => {
    onChange({
      ...config,
      questions: config.questions.map(q =>
        q.id === id ? { ...q, ...updates } : q
      )
    });
  };

  const addOption = (e: React.MouseEvent, questionId: string) => {
    e.preventDefault();
    const question = config.questions.find(q => q.id === questionId);
    if (question && question.options) {
      updateQuestion(questionId, {
        options: [...question.options, '']
      });
    }
  };

  const removeOption = (e: React.MouseEvent, questionId: string, optionIndex: number) => {
    e.preventDefault();
    const question = config.questions.find(q => q.id === questionId);
    if (question && question.options) {
      updateQuestion(questionId, {
        options: question.options.filter((_, i) => i !== optionIndex)
      });
    }
  };

  return (
    <div className="space-y-6 border-t pt-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Survey Configuration</h3>
        
        {/* OpenAI Prompt */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            OpenAI Analysis Prompt
          </label>
          <textarea
            value={config.openaiPrompt || ''}
            onChange={(e) => onChange({ ...config, openaiPrompt: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Enter prompt for OpenAI analysis..."
          />
        </div>

        {/* QR Code Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              QR Code Size (px)
            </label>
            <input
              type="number"
              value={config.qrCodeSize || 128}
              onChange={(e) => onChange({ ...config, qrCodeSize: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="128"
              max="512"
              step="8"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              QR Code Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={config.qrCodeColor || '#000000'}
                onChange={(e) => onChange({ ...config, qrCodeColor: e.target.value })}
                className="h-10 w-20"
              />
              <input
                type="text"
                value={config.qrCodeColor || '#000000'}
                onChange={(e) => onChange({ ...config, qrCodeColor: e.target.value })}
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#000000"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              QR Code Logo URL (Optional)
            </label>
            <input
              type="url"
              value={config.qrCodeLogo || ''}
              onChange={(e) => onChange({ ...config, qrCodeLogo: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/logo.png"
            />
          </div>
        </div>

        {/* Survey Questions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium">Survey Questions</h4>
            <button
              onClick={addQuestion}
              type="button"
              disabled={config.questions.length >= 10}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>

          {config.questions.map((question, index) => (
            <div key={question.id} className="border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <span className="text-sm font-medium text-gray-500">
                  Question {index + 1}
                </span>
                <button
                  onClick={(e) => removeQuestion(e, question.id)}
                  type="button"
                  className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text
                  </label>
                  <input
                    type="text"
                    value={question.text || ''}
                    onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your question..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Type
                    </label>
                    <select
                      value={question.type || 'multiple_choice'}
                      onChange={(e) => updateQuestion(question.id, { 
                        type: e.target.value as QuestionType,
                        options: e.target.value === 'multiple_choice' ? [''] : undefined
                      })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="short_answer">Short Answer</option>
                      <option value="rating_scale">Rating Scale</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Required
                    </label>
                    <div className="flex items-center h-[42px]">
                      <input
                        type="checkbox"
                        checked={question.required}
                        onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        Make this question required
                      </span>
                    </div>
                  </div>
                </div>

                {question.type === 'multiple_choice' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Answer Options
                    </label>
                    <div className="space-y-2">
                      {question.options?.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex gap-2">
                          <input
                            type="text"
                            value={option || ''}
                            onChange={(e) => {
                              const newOptions = [...(question.options || [])];
                              newOptions[optionIndex] = e.target.value;
                              updateQuestion(question.id, { options: newOptions });
                            }}
                            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={`Option ${optionIndex + 1}`}
                          />
                          <button
                            onClick={(e) => removeOption(e, question.id, optionIndex)}
                            type="button"
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={(e) => addOption(e, question.id)}
                        type="button"
                        className="text-sm text-blue-500 hover:text-blue-600"
                      >
                        + Add Option
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};