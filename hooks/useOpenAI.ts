import { useState, useCallback } from 'react';
import { OpenAIConfig, OpenAIResponse } from '../types';
import toast from 'react-hot-toast';

const DEFAULT_PROMPT = `Analyze the following transcribed text and provide insights:

{text}

Please provide:
1. Key themes and topics discussed
2. Main points and conclusions
3. Any action items or next steps mentioned
4. Areas that might need clarification or follow-up`;

const validateApiKey = (key: string): string => {
  const cleanKey = key.trim();
  
  if ((!cleanKey.startsWith('sk-') && !cleanKey.startsWith('sk-proj-')) || cleanKey.length < 40) {
    throw new Error('Invalid API key format. Key should start with "sk-" or "sk-proj-" and be at least 40 characters long.');
  }
  
  return cleanKey;
};

export const useOpenAI = (configApiKey?: string) => {
  const [response, setResponse] = useState<OpenAIResponse>({
    status: 'idle',
    data: null,
    error: null
  });

  const sendToOpenAI = useCallback(async (config: OpenAIConfig, text: string) => {
    try {
      setResponse({ status: 'loading', data: null, error: null });

      if (!text.trim()) {
        throw new Error('No text provided for analysis');
      }

      const apiKey = configApiKey || config.apiKey;
      
      if (!apiKey) {
        throw new Error('OpenAI API key not provided');
      }

      const validatedKey = validateApiKey(apiKey);
      
      if (!config.prompt) {
        throw new Error('Analysis prompt not provided');
      }

      // Include context files in the analysis if available
      let contextText = '';
      if (config.contextFiles && config.contextFiles.length > 0) {
        contextText = '\n\nAdditional Context:\n' + config.contextFiles.map(file => 
          `File: ${file.name}\nContent:\n${file.content}\n---\n`
        ).join('\n');
      }

      const processedPrompt = config.prompt
        .replace('{text}', text)
        + contextText;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${validatedKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant analyzing transcribed text and additional context files. Provide clear, concise insights and recommendations.'
            },
            {
              role: 'user',
              content: processedPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData?.error?.message || `OpenAI API error (${response.status}): ${response.statusText}`;
        console.error('OpenAI API Error:', errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from OpenAI');
      }

      const analysisResult = data.choices[0].message.content;
      
      setResponse({
        status: 'success',
        data: analysisResult,
        error: null
      });

      return {
        response: {
          data: analysisResult,
          error: null
        }
      };
    } catch (error) {
      let errorMessage: string;
      
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('OpenAI API Error:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      } else {
        errorMessage = 'An unexpected error occurred while connecting to OpenAI';
        console.error('OpenAI API Error:', error);
      }
      
      toast.error(errorMessage);
      
      setResponse({
        status: 'error',
        data: null,
        error: errorMessage
      });

      return {
        response: {
          data: null,
          error: errorMessage
        }
      };
    }
  }, [configApiKey]);

  return {
    response,
    sendToOpenAI,
    DEFAULT_PROMPT
  };
};