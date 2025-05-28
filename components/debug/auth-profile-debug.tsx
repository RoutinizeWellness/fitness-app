'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { useProfile } from '@/lib/contexts/profile-context';
import { useState } from 'react';

export function AuthProfileDebug() {
  const { user, session, isLoading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const [testResult, setTestResult] = useState<any>(null);

  const testAPICall = async () => {
    if (!user) {
      setTestResult({ error: 'No user found' });
      return;
    }

    try {
      console.log('Testing DEBUG API call with userId:', user.id);

      const response = await fetch('/api/profile/debug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
        credentials: 'include'
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('Response text:', responseText);

      try {
        const result = JSON.parse(responseText);
        if (response.ok) {
          setTestResult({ success: true, data: result });
        } else {
          setTestResult({ success: false, error: result, status: response.status });
        }
      } catch (parseError) {
        setTestResult({ success: false, error: 'Failed to parse response', responseText, status: response.status });
      }
    } catch (error) {
      console.error('Test API call error:', error);
      setTestResult({ success: false, error: error.message });
    }
  };

  if (authLoading) {
    return <div className="p-4 bg-yellow-100">Loading auth...</div>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg space-y-4">
      <h3 className="font-bold text-lg">Auth & Profile Debug</h3>

      <div className="space-y-2">
        <div><strong>User:</strong> {user ? `${user.id} (${user.email})` : 'None'}</div>
        <div><strong>Session:</strong> {session ? 'Active' : 'None'}</div>
        <div><strong>Profile Loading:</strong> {profileLoading ? 'Yes' : 'No'}</div>
        <div><strong>Profile:</strong> {profile ? `${profile.fullName} (${profile.id})` : 'None'}</div>
      </div>

      <button
        onClick={testAPICall}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        disabled={!user}
      >
        Test API Call
      </button>

      {testResult && (
        <div className="p-3 bg-white rounded border">
          <strong>Test Result:</strong>
          <pre className="mt-2 text-sm overflow-auto">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
