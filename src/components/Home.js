import React from "react";
import "../styles/Dashboard.css";
import { useDataContext } from "../providers/DataProvider";

const Home = () => {
  const { currentUser, selectedFile, delimiter } = useDataContext();

  return (
    <div>
      <div className="hollow-text-container">
        <div className="hollow-text">the Budget App</div>
      </div>
      <div className="data-container">
        <div className="data-header">Total Income</div>
        <div className="data-header">Total Expenses</div>
        <div className="data-header">Balance</div>
        <br />
        <div className="data-header" style={{ fontSize: "1.5rem" }}>
          *** more to come piecharts and bright lights ***
        </div>
        <br />
        <div className="data-header" style={{ fontSize: "1rem" }}>
          <div>currrent user: {currentUser}</div>
          <div>selected file: {selectedFile}</div>
          <div>delimiter: {delimiter}</div>
        </div>
      </div>
    </div>
  );
};

export default Home;
