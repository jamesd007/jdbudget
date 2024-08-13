import React, { useContext, useEffect, useState } from "react";
import "../styles/MainStyles.css";
import BudgetNew from "./BudgetNew";
import DropdownMenu from "../utils/DropDownMenu";
import { FaFileImport } from "react-icons/fa";
import { FaFileExport } from "react-icons/fa";
import { FaRegSave } from "react-icons/fa";
import { FaRegEdit } from "react-icons/fa";
import { RiArrowGoBackFill } from "react-icons/ri";
import { RiPlayReverseFill } from "react-icons/ri";
import { BsThreeDotsVertical } from "react-icons/bs";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { menuMainItems } from "../data/MenuMainItems";
import { useDataContext } from "../providers/DataProvider";
import DailyBudget from "./DailyBudget";

const BudgetMenus = () => {
  const [dbOption, setDBOption] = useState(false);
  const [importOption, setImportOption] = useState(false);
  const [monthlyBudgetOption, setMonthlyBudgetOption] = useState(true);
  const [otherOption, setOtherOption] = useState(true);
  const [showDots, setShowDots] = useState(true);
  const navigate = useNavigate();

  const handleDB = () => {
    setDBOption(true);
    setMonthlyBudgetOption(false);
    setImportOption(false);
    setOtherOption(false);
  };

  const handleImport = () => {
    setImportOption(true);
    setMonthlyBudgetOption(false);
    setDBOption(false);
    setOtherOption(false);
  };

  const handleMonthlyBudget = () => {
    setImportOption(false);
    setMonthlyBudgetOption(false);
    setDBOption(false);
    setOtherOption(false);
  };

  const handleOther = () => {
    setOtherOption(true);
    setMonthlyBudgetOption(false);
    setImportOption(false);
    setDBOption(false);
  };

  const handleClose = () => {
    navigate("/");
  };

  const menuItems = [
    {
      leftIcon: <FaRegEdit size={24} />,
      text: "Daily Budget",
      callback: handleDB,
      permissionLevels: ["any"],
      goToMenu: "",
    },
    {
      leftIcon: <FaFileImport size={24} />,
      text: "Import (?)",
      callback: handleImport,
      permissionLevels: ["any"],
      goToMenu: "",
    },
    {
      leftIcon: <FaFileExport size={24} />,
      text: "Monthly budget",
      callback: handleMonthlyBudget,
      permissionLevels: ["any"],
      goToMenu: "",
    },
    {
      leftIcon: <BiSolidCategoryAlt size={24} />,
      text: "Other",
      callback: handleOther,
      permissionLevels: ["any"],
      goToMenu: "",
    },
    {
      leftIcon: <RiPlayReverseFill size={24} />,
      text: "Main menu",
      callback: handleClose,
      permissionLevels: ["any"],
      goToMenu: "secondary",
    },
    {
      leftIcon: <RiArrowGoBackFill size={24} />,
      text: "Close",
      callback: handleClose,
      permissionLevels: ["any"],
      goToMenu: "",
    },
  ];

  const handleMenuClick = () => {
    setMonthlyBudgetOption((prevOpen) => !prevOpen);
  };

  return (
    <div>
      <div className="menu-dots">
        <div className="main-menu">
          <span style={showDots ? {} : { display: "none" }}>
            <BsThreeDotsVertical size={28} onClick={() => handleMenuClick()} />
          </span>
          {monthlyBudgetOption && (
            <DropdownMenu
              type="items"
              secType="links"
              roles={"any"}
              menuItems={menuItems}
              secMenuItem={menuMainItems}
              onClose={() => setMonthlyBudgetOption(false)}
              mainscreen={true}
            />
          )}
        </div>
      </div>
      <div
        className="work-container"
        style={{
          backgroundColor: "lightsteelblue",
        }}
      >
        <span style={{ fontSize: "2rem", marginLeft: "1rem" }}>Budgets</span>
        {dbOption && (
          <>
            <span
              style={{
                fontSize: "1.5rem",
                display: dbOption ? {} : "none",
              }}
            >
              {" "}
              - Calendar
            </span>
            <DailyBudget />
          </>
        )}
        {importOption && (
          <>
            <span
              style={{
                fontSize: "1.5rem",
                display: importOption ? {} : "none",
              }}
            >
              {" "}
              - Edit
            </span>
            {/* <BudgetNew /> */}
          </>
        )}
        {/* {otherOption && (
          <>
            <span
              style={{
                fontSize: "1.5rem",
                display: otherOption ? {} : "none",
              }}
            >
              {" "}
              - Export
            </span>
            <ExportData />
          </>
        )}
        {catEdit && (
          <>
            <span
              style={{
                fontSize: "1.5rem",
                display: catEdit ? {} : "none",
              }}
            >
              {" "}
              - Categories
            </span>
            <CatEdit />
          </>
        )} */}
      </div>
    </div>
  );
};

export default BudgetMenus;
