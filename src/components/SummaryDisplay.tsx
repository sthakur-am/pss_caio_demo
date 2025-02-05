import React from 'react';
import { Summary } from '../types';

interface SummaryDisplayProps {
  summary: Summary | null;
}

export const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary }) => {
  if (!summary) return null;

  return (
    <div className="w-full max-w-3xl mx-auto mt-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Conversation Summary</h2>
        
        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-semibold mb-2 text-blue-600">Main Topics</h3>
            <ul className="list-disc pl-6 space-y-2">
              {summary.topics.map((topic, index) => (
                <li key={index}>{topic}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2 text-green-600">Key Decisions</h3>
            <ul className="list-disc pl-6 space-y-2">
              {summary.decisions.map((decision, index) => (
                <li key={index}>{decision}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2 text-purple-600">Next Steps</h3>
            <ul className="list-disc pl-6 space-y-2">
              {summary.nextSteps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </section>

          {summary.dates.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold mb-2 text-red-600">Important Dates</h3>
              <ul className="list-disc pl-6 space-y-2">
                {summary.dates.map((date, index) => (
                  <li key={index}>{date}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};