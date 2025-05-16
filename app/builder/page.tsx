"use client";

import React, { useState } from "react";
import BuilderComponent from "@/components/builder-io/BuilderComponent";
import BuilderRenderer from "@/components/builder-io/BuilderRenderer";

export default function BuilderPage() {
  const [apiKey, setApiKey] = useState("b005d95b3da34ec394ccc1e42c518d50");
  const [model, setModel] = useState("page");
  const [entry, setEntry] = useState("7726a92f2fca4f4dafce69379ed927c2");
  const [isLoading, setIsLoading] = useState(false);
  const [showComponent, setShowComponent] = useState(false);
  const [renderMode, setRenderMode] = useState<"basic" | "advanced">("advanced");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate a short loading time
    setTimeout(() => {
      setShowComponent(true);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-monumental-purple mb-6 font-klasik text-center">
          Builder.io Integration
        </h1>

        <div className="bg-white rounded-[24px] p-6 shadow-sm mb-8">
          <h2 className="text-xl font-medium text-monumental-purple mb-4 font-klasik">
            Load Builder.io Content
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-monumental-purple/70 mb-1 font-manrope">
                API Key
              </label>
              <input
                type="text"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg font-manrope"
                placeholder="Enter your Builder.io API key"
                required
              />
            </div>

            <div>
              <label htmlFor="model" className="block text-sm font-medium text-monumental-purple/70 mb-1 font-manrope">
                Model
              </label>
              <input
                type="text"
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg font-manrope"
                placeholder="e.g., page, section, etc."
                required
              />
            </div>

            <div>
              <label htmlFor="entry" className="block text-sm font-medium text-monumental-purple/70 mb-1 font-manrope">
                Entry ID (optional)
              </label>
              <input
                type="text"
                id="entry"
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg font-manrope"
                placeholder="Enter a specific entry ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-monumental-purple/70 mb-1 font-manrope">
                Render Mode
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="renderMode"
                    value="basic"
                    checked={renderMode === "basic"}
                    onChange={() => setRenderMode("basic")}
                    className="mr-2"
                  />
                  <span className="text-monumental-purple/70 font-manrope">Basic (JSON)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="renderMode"
                    value="advanced"
                    checked={renderMode === "advanced"}
                    onChange={() => setRenderMode("advanced")}
                    className="mr-2"
                  />
                  <span className="text-monumental-purple/70 font-manrope">Advanced (Visual)</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-full bg-gradient-to-r from-monumental-orange to-monumental-red text-white font-medium shadow-sm font-manrope ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                'Load Content'
              )}
            </button>
          </form>
        </div>

        {showComponent && (
          <div className="mb-8">
            <h2 className="text-xl font-medium text-monumental-purple mb-4 font-klasik">
              Builder.io Content ({renderMode === "basic" ? "JSON View" : "Visual Render"})
            </h2>

            {renderMode === "basic" ? (
              <BuilderComponent apiKey={apiKey} model={model} entry={entry} />
            ) : (
              <BuilderRenderer apiKey={apiKey} model={model} entry={entry} />
            )}

            <div className="mt-4 text-center">
              <button
                onClick={() => setRenderMode(renderMode === "basic" ? "advanced" : "basic")}
                className="px-4 py-2 bg-gray-100 text-monumental-purple/70 font-manrope rounded-lg hover:bg-gray-200 transition-colors"
              >
                Switch to {renderMode === "basic" ? "Visual" : "JSON"} View
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-[24px] p-6 shadow-sm">
          <h2 className="text-xl font-medium text-monumental-purple mb-4 font-klasik">
            About Builder.io Integration
          </h2>
          <div className="text-monumental-purple/70 font-manrope space-y-4">
            <p>
              This page demonstrates integration with Builder.io, a visual content management system.
              You can use it to load and display content created in the Builder.io platform.
            </p>
            <p>
              To use this integration:
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Enter your Builder.io API key</li>
              <li>Specify the model (content type) you want to load</li>
              <li>Optionally, provide a specific entry ID</li>
              <li>Click "Load Content" to fetch and display the content</li>
            </ol>
            <p className="text-sm bg-gray-100 p-4 rounded-lg">
              Note: The content is currently displayed as JSON. In a production environment,
              you would use the Builder.io SDK to render the content properly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
