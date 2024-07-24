import React, { createContext, useState, useContext, useMemo } from "react";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState("1"); //tedtest todo program for users this must change to null or empty string
  const [selectedFile, setSelectedFile] = useState(null);
  const [delimiter, setDelimiter] = useState(",");
  const [lines, setLines] = useState([]);
  const [editableHeaders, setEditableHeaders] = useState([]);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);

  const contextValue = useMemo(
    () => ({
      currentUser,
      setCurrentUser,
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
      currentUser,
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
