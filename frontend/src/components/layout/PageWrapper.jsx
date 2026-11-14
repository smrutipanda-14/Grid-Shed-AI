import React from 'react';

export function PageWrapper({ children }) {
  return (
    <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full cyber-grid">
      {children}
    </main>
  );
}
