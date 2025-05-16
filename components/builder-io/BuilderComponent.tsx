"use client";
import React, { useEffect, useState } from 'react';

interface BuilderComponentProps {
  apiKey: string;
  model: string;
  entry?: string;
}

/**
 * BuilderComponent loads and renders content from Builder.io
 */
const BuilderComponent: React.FC<BuilderComponentProps> = ({ 
  apiKey, 
  model, 
  entry 
}) => {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        
        // Construct the API URL
        let url = `https://cdn.builder.io/api/v2/content/${model}?apiKey=${apiKey}&cachebust=true`;
        
        if (entry) {
          url += `&entry=${entry}`;
        }
        
        // Fetch the content
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch content: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data && data.results && data.results.length > 0) {
          setContent(data.results[0]);
        } else {
          setError('No content found');
        }
      } catch (err) {
        console.error('Error fetching Builder.io content:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [apiKey, model, entry]);

  if (loading) {
    return (
      <div className="w-[414px] h-[896px] mx-auto bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-monumental-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-monumental-purple font-manrope">Loading Builder.io content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-[414px] h-[896px] mx-auto bg-gray-100 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-monumental-purple mb-2 font-klasik">Error Loading Content</h2>
          <p className="text-monumental-purple/70 font-manrope mb-4">{error}</p>
          <div className="bg-white rounded-lg p-4 text-left text-sm text-monumental-purple/70 font-manrope">
            <p className="mb-2">Please check:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your API key is correct</li>
              <li>The model name is valid</li>
              <li>The entry ID exists (if provided)</li>
              <li>Your network connection</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="w-[414px] h-[896px] mx-auto bg-gray-100 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-monumental-purple mb-2 font-klasik">No Content Found</h2>
          <p className="text-monumental-purple/70 font-manrope">
            No content was found for the specified model and entry.
          </p>
        </div>
      </div>
    );
  }

  // Render the content
  return (
    <div className="builder-component">
      <pre className="w-[414px] h-[896px] mx-auto bg-gray-100 p-4 overflow-auto">
        {JSON.stringify(content, null, 2)}
      </pre>
    </div>
  );
};

export default BuilderComponent;
