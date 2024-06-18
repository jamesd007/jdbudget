import React from "react";
import "../styles/MainStyles.css";
import { Routes, Route } from "react-router-dom";
import Budget from "./Budget";
import ImportData from "./ImportData";
// import ExportData from "./ExportData";
import Analysis from "./Analysis";
import Reports from "./Reports";
import System from "./System";
import NavBar from "./NavBar";
import Home from "./Home";
import MenuComponent from "./MenuComponent";
import Transactions from "./Transactions";
import { DataProvider } from "../providers/DataProvider";

function FrontPage() {
  return (
    <div>
      <MenuComponent />
      {/* <NavBar /> */}

      <DataProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/transactions" element={<Transactions />} />
          {/* <Route path="/importdata" element={<ImportData />} />
          <Route path="/exportdata" element={<ExportData />} /> */}
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/system" element={<System />} />
        </Routes>
      </DataProvider>
    </div>
  );
}

export default FrontPage;
