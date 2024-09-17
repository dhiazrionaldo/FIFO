"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the type for selected rows
type SelectedRowContextType = {
  selectedRows: any[];
  setSelectedRows: (rows: any[]) => void;
};

// Create context
const SelectedRowContext = createContext<SelectedRowContextType | undefined>(undefined);

// Custom hook to use the context
export const useSelectedRow = () => {
  const context = useContext(SelectedRowContext);
  if (!context) {
    throw new Error('useSelectedRow must be used within a SelectedRowProvider');
  }
  return context;
};

// Provider component
export const SelectedRowProvider = ({ children }: { children: ReactNode }) => {
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  console.log('selectedrowprovider rendered')

  return (
    <SelectedRowContext.Provider value={{ selectedRows, setSelectedRows }}>
      {children}
    </SelectedRowContext.Provider>
  );
};
