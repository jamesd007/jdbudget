import React, { createContext, useState, useContext, useMemo } from "react";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [delimiter, setDelimiter] = useState(",");
  const [lines, setLines] = useState([]);
  const [editableHeaders, setEditableHeaders] = useState([]);
  //   "ignore",
  //   "date",
  //   "ignore",
  //   "amount",
  //   "type",
  //   "description",
  //   "category",
  //   "ignore",
  // ]);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);

  const contextValue = useMemo(
    () => ({
      selectedFile,
      setSelectedFile,
      delimiter,
      setDelimiter,
      lines,
      setLines,
      editableHeaders,
      setEditableHeaders,
      selectedCheckboxes,
      setSelectedCheckboxes,
      scrollPosition,
      setScrollPosition,
    }),
    [
      selectedFile,
      delimiter,
      lines,
      editableHeaders,
      selectedCheckboxes,
      scrollPosition,
    ]
  );

  return (
    <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  );
};

export const useDataContext = () => useContext(DataContext);
