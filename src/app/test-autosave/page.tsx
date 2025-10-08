'use client';

import { useState } from 'react';
import { useAutosave } from '@/hooks/useAutosave';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

/**
 * Test page to verify autosave functionality works correctly
 * Visit: http://localhost:3000/test-autosave
 */
export default function TestAutosavePage() {
  const [testData, setTestData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    notes: 'Some notes here'
  });

  // Test autosave with logging
  useAutosave({
    data: testData,
    onSave: (data) => {
      console.log('🧪 TEST: Autosave triggered with data:', data);
      localStorage.setItem('test-autosave-data', JSON.stringify(data));
      console.log('🧪 TEST: Data saved to localStorage');
    },
    delay: 2000,
    enabled: true,
  });

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Autosave Test Page</CardTitle>
          <CardDescription>
            Edit the fields below. After 2 seconds of inactivity, you should see an &quot;Autosaved&quot; toast.
            <br />
            <strong>Open your browser console to see detailed logs.</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              value={testData.name}
              onChange={(e) => {
                console.log('🧪 TEST: Name changed to:', e.target.value);
                setTestData(prev => ({ ...prev, name: e.target.value }));
              }}
              placeholder="Enter name"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              value={testData.email}
              onChange={(e) => {
                console.log('🧪 TEST: Email changed to:', e.target.value);
                setTestData(prev => ({ ...prev, email: e.target.value }));
              }}
              placeholder="Enter email"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Notes</label>
            <Input
              value={testData.notes}
              onChange={(e) => {
                console.log('🧪 TEST: Notes changed to:', e.target.value);
                setTestData(prev => ({ ...prev, notes: e.target.value }));
              }}
              placeholder="Enter notes"
            />
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Instructions:</p>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Type in any field above</li>
              <li>Stop typing for 2 seconds</li>
              <li>Watch for &quot;Autosaved&quot; toast in bottom-right corner</li>
              <li>Check browser console for detailed logs</li>
            </ol>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">Current Data:</p>
            <pre className="text-xs text-blue-700 overflow-auto">
              {JSON.stringify(testData, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

