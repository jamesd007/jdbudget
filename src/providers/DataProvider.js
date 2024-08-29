import React, { createContext, useState, useContext, useMemo } from "react";
import { UserProvider } from "../contexts/UserContext";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  // const [currentUser, setCurrentUser] = useState(null);
  //tedtest todo program for users this must change to null or empty string
  const [selectedFile, setSelectedFile] = useState(null);
  const [delimiter, setDelimiter] = useState(",");
  const [lines, setLines] = useState([]);
  const [editableHeaders, setEditableHeaders] = useState([]);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [currentBudgetName, setCurrentBudgetName] = useState("");

  const contextValue = useMemo(
    () => ({
      // currentUser,
      // setCurrentUser,
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
      currentBudgetName,
      setCurrentBudgetName,
    }),
    [
      // currentUser,
      selectedFile,
      delimiter,
      lines,
      editableHeaders,
      selectedCheckboxes,
      scrollPosition,
      currentBudgetName,
    ]
  );

  return (
    // <UserProvider>
    <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
    // {children}
    // </UserProvider>
  );
};

export const useDataContext = () => useContext(DataContext);
