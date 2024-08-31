import React from "react";
import "../styles/MainStyles.css";
import { Routes, Route } from "react-router-dom";
import MenuComponent from "./MenuComponent";
import Home from "./Home";
import BudgetMenu from "./BudgetMenu";
import Transactions from "./Transactions";
import Categories from "./Categories";
import Analysis from "./Analysis";
import Reports from "./Reports";
import System from "./System";
// import LoginForm from "../forms/LoginForm";
// import { DataProvider } from "../providers/DataProvider";
import Logout from "./Logout";
import BudgetTest from "./budget/BudgetTest";

function FrontPage() {
  return (
    // <DataProvider>
    <div>
      <MenuComponent />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/budget" element={<BudgetMenu />} /> */}
        <Route path="/budget" element={<BudgetTest />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/system" element={<System />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </div>
    // </DataProvider>
  );
}

export default FrontPage;
