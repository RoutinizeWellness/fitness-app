'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { importAllPplTemplatesToSupabase } from '@/lib/supabase-training-templates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircleIcon, AlertTriangleIcon, LoaderIcon, LockIcon, DatabaseIcon, FileTextIcon } from 'lucide-react';

export default function ImportTemplatesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  const handleImportTemplates = async () => {
    if (!user) {
      setError('You must be logged in to import templates');
      return;
    }

    // Check if user is admin
    if (user.email !== 'admin@routinize.com') {
      setError('Only administrators can import templates');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await importAllPplTemplatesToSupabase(user.id);

      if (result.success) {
        setSuccess(true);
        setImportedCount(result.importedCount);
      } else {
        setError('Failed to import templates: ' + JSON.stringify(result.error));
      }

      setLoading(false);
    } catch (err) {
      console.error('Error importing templates:', err);
      setError('An unexpected error occurred while importing templates');
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You must be logged in to access this page.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/login')}>
          Go to Login
        </Button>
      </div>
    );
  }

  if (user.email !== 'admin@routinize.com') {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <Alert variant="destructive" className="mb-4">
          <LockIcon className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            Only administrators can access this page.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/training')}>
          Go to Training
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Import Training Templates</CardTitle>
          <CardDescription>
            Import all Push/Pull/Legs templates to Supabase for use in the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangleIcon className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200 mb-4">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                Successfully imported {importedCount} templates to Supabase.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-lg font-medium text-blue-800 mb-2">Templates to Import</h3>
              <p className="text-sm text-blue-700 mb-4">
                The following training templates will be imported to Supabase:
              </p>

              <div className="space-y-3">
                <div className="bg-white p-3 rounded border border-blue-100">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Standard PPL Templates</h4>
                    <Badge variant="outline">6-day split</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Balanced Push/Pull/Legs templates for beginners, intermediates, and advanced lifters.
                  </p>
                </div>

                <div className="bg-white p-3 rounded border border-blue-100">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Jeff Nippard PPL Templates</h4>
                    <Badge variant="outline">6-day split</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Scientific approach to Push/Pull/Legs with emphasis on optimal volume and frequency.
                  </p>
                </div>

                <div className="bg-white p-3 rounded border border-blue-100">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">CBUM PPL Templates</h4>
                    <Badge variant="outline">6-day split</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    High-volume Push/Pull/Legs templates based on Chris Bumstead's training methodology.
                  </p>
                </div>

                <div className="bg-white p-3 rounded border border-blue-100">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Upper/Lower Templates</h4>
                    <Badge variant="outline">5-day split</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Upper/Lower body split for intermediate and advanced lifters.
                  </p>
                </div>

                <div className="bg-white p-3 rounded border border-blue-100">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Specialized Split Templates</h4>
                    <Badge variant="outline">7-day split</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Full-body split with specialization days for advanced lifters.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
              <h3 className="text-lg font-medium text-amber-800 mb-2">Important Notes</h3>
              <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                <li>This action will import all templates to Supabase.</li>
                <li>Existing templates with the same name, level, goal, and frequency will be skipped.</li>
                <li>This process may take a few moments to complete.</li>
                <li>Templates will be available for all users to select when creating a new training plan.</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push('/admin')}>
            Cancel
          </Button>
          <Button
            onClick={handleImportTemplates}
            disabled={loading || success}
            className={success ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {loading ? (
              <>
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : success ? (
              <>
                <CheckCircleIcon className="mr-2 h-4 w-4" />
                Imported Successfully
              </>
            ) : (
              <>
                <DatabaseIcon className="mr-2 h-4 w-4" />
                Import Templates
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
