"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the type for selected rows
type SelectedRowContextsType = {
  selectedRows: any[];
  setSelectedRows: (rows: any[]) => void;
};

// Create context
const SelectedRowContexts = createContext<SelectedRowContextsType | undefined>(undefined);

// Custom hook to use the context
export const useSelectedRow = () => {
  const context = useContext(SelectedRowContexts);
  if (!context) {
    throw new Error('useSelectedRow must be used within a SelectedRowProvider');
  }
  return context;
};

// Provider component
export const SelectedRowProviders = ({ children }: { children: ReactNode }) => {
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  return (
    <SelectedRowContexts.Provider value={{ selectedRows, setSelectedRows }}>
      {children}
    </SelectedRowContexts.Provider>
  );
};
