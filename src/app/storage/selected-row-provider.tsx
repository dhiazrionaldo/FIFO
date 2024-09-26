"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the type for selected rows
type SelectedRowContextType = {
  selectedRows: any[];
  setSelectedRows: (rows: any[]) => void;
  clearSelectedRows: () => void; // New function to clear selected rows
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

  // Function to clear the selected rows
  const clearSelectedRows = () => {
    setSelectedRows([]); // Clear the array
  };

  return (
    <SelectedRowContext.Provider value={{ selectedRows, setSelectedRows, clearSelectedRows }}>
      {children}
    </SelectedRowContext.Provider>
  );
};

// "use client";

// import React, { createContext, useState, useContext, ReactNode } from 'react';

// // Define the type for selected rows
// type SelectedRowContextType = {
//   selectedRows: any[];
//   setSelectedRows: (rows: any[]) => void;
//   clearSelectedRows: () => void; 
// };

// // Create context
// const SelectedRowContext = createContext<SelectedRowContextType | undefined>(undefined);

// // Custom hook to use the context
// export const useSelectedRow = () => {
//   const context = useContext(SelectedRowContext);
//   if (!context) {
//     throw new Error('useSelectedRow must be used within a SelectedRowProvider');
//   }
//   return context;
// };

// // Provider component
// export const SelectedRowProvider = ({ children }: { children: ReactNode }) => {
//   const [selectedRows, setSelectedRows] = useState<any[]>([]);
//   console.log('selectedrowprovider rendered')

//   const clearSelectedRows = () => {
//     setSelectedRows([]); // Clear the array
//   };
  
//   return (
//     <SelectedRowContext.Provider value={{ selectedRows, setSelectedRows, clearSelectedRows }}>
//       {children}
//     </SelectedRowContext.Provider>
//   );
// };
