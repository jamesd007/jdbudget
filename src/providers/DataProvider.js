import React, { createContext, useState, useContext, useMemo } from "react";
import { UserProvider } from "../contexts/UserContext";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  // const [currentUser, setCurrentUser] = useState(null);
  //tedtest TODO program for users this must change to null or empty string
  const [selectedFile, setSelectedFile] = useState(null);
  const [delimiter, setDelimiter] = useState(",");
  const [lines, setLines] = useState([]);
  const [editableHeaders, setEditableHeaders] = useState([]);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [currentBudgetName, setCurrentBudgetName] = useState("");
  const [currentAccNumber, setCurrentAccNumber] = useState(null);

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
      currentAccNumber,
      setCurrentAccNumber,
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
      currentAccNumber,
      setCurrentAccNumber,
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
