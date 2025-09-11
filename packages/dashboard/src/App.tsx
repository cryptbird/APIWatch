import React, { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';

function Fallback(): React.ReactElement {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-accent font-mono">Loading…</div>
    </div>
  );
}

function App(): React.ReactElement {
  return (
    <Suspense fallback={<Fallback />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;
