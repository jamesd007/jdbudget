import React, { useContext } from "react";
import "../styles/Dashboard.css";
import { useDataContext } from "../providers/DataProvider";
import { UserContext } from "../contexts/UserContext";

const Home = () => {
  const {
    // currentUser,
    selectedFile,
    delimiter,
  } = useDataContext();
  const { user } = useContext(UserContext);

  return (
    <div>
      <div
      // className="hollow-text-container-main"
      >
        <div
          className="hollow-text"
          style={{
            position: "absolute",
            bottom: "5%",
            right: "5%",
            fontSize: "2.5rem",
          }}
        >
          the budget app
        </div>
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
          <div>currrent user: {user.id}</div>
          <div>selected file: {selectedFile}</div>
          <div>delimiter: {delimiter}</div>
        </div>
      </div>
    </div>
  );
};

export default Home;
