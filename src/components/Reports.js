import React, { useState, useEffect } from "react";
import { getAllTransactions } from "../store/Dexie";
import "../styles/ReportsStyles.css";
import ReportsTable from "./ReportsTable";
import { Container, Typography } from "@mui/material";
import DateRangePicker from "../utils/DateRangePicker";
import db from "../store/Dexie";
import { menuMainItems } from "../data/MenuMainItems";
import { FaDatabase } from "react-icons/fa";
import { MdAccessTimeFilled } from "react-icons/md";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { MdDescription } from "react-icons/md";
import { FaBalanceScaleRight } from "react-icons/fa";
import { RiPlayReverseFill } from "react-icons/ri";
import { RiArrowGoBackFill } from "react-icons/ri";
import { BsThreeDotsVertical } from "react-icons/bs";
import DropdownMenu from "../utils/DropDownMenu";
import { useNavigate } from "react-router-dom";
import CategoryDropdown from "./CategoryDropdown";

const Reports = () => {
  const [allTrans, setAllTrans] = useState([]);
  const [datesData, setDatesData] = useState();
  const [openReportsMenu, setOpenReportsMenu] = useState(true);
  const [showDots, setShowDots] = useState(true);
  const [databaseOption, setDatabaseOption] = useState(false);
  const [timePeriodOption, setTimePeriodOption] = useState(false);
  const [categoryOption, setCategoryOption] = useState(false);
  const navigate = useNavigate();

  const handleMenuClick = () => {
    setOpenReportsMenu((prevOpen) => !prevOpen);
  };

  const handleDatabaseReport = () => {
    setOpenReportsMenu(false);
    setDatabaseOption(true);
    setTimePeriodOption(false);
    setCategoryOption(false);
  };

  const handleDataForTimePeriod = () => {
    setOpenReportsMenu(false);
    setTimePeriodOption(true);
    setDatabaseOption(false);
    setCategoryOption(false);
  };

  const handleCategoryReport = () => {
    setOpenReportsMenu(false);
    setDatabaseOption(false);
    setTimePeriodOption(false);
    setCategoryOption(true);
  };

  const handleDescriptionReport = () => {
    setOpenReportsMenu(false);
    setDatabaseOption(false);
    setTimePeriodOption(false);
    setCategoryOption(false);
  };

  const handleBudgetComparisonReport = () => {
    setOpenReportsMenu(false);
    setDatabaseOption(false);
    setTimePeriodOption(false);
  };

  const handleClose = () => {
    navigate("/");
  };

  const menuItems = [
    {
      leftIcon: <FaDatabase size={24} />,
      text: "Database",
      callback: handleDatabaseReport,
      permissionLevels: ["any"],
      goToMenu: "",
    },
    // {
    //   leftIcon: <MdAccessTimeFilled size={24} />,
    //   text: "Time period",
    //   callback: handleDataForTimePeriod,
    //   permissionLevels: ["any"],
    //   goToMenu: "",
    // },
    {
      leftIcon: <BiSolidCategoryAlt size={24} />,
      text: "Category",
      callback: handleCategoryReport,
      permissionLevels: ["any"],
      goToMenu: "",
    },
    {
      leftIcon: <MdDescription size={24} />,
      text: "Description",
      callback: handleDescriptionReport,
      permissionLevels: ["any"],
      goToMenu: "",
    },
    {
      leftIcon: <FaBalanceScaleRight size={24} />,
      text: "Budget comparison",
      callback: handleBudgetComparisonReport,
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const transactions = await getAllTransactions();
        setAllTrans(transactions);
        console.log("Fetched transactions:", transactions);
      } catch (error) {
        console.error("Error retrieving transactions:", error);
      }
    };

    fetchData();
  }, []);

  const dataForTimePeriod = async (startDate, endDate) => {
    if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
      alert("Invalid date selection. Please select valid dates.");
      return;
    }
    // Convert dates to YYYYMMDD string format
    const formattedStartDate = startDate
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "");
    const inclusiveEndDate = new Date(endDate);

    inclusiveEndDate.setDate(inclusiveEndDate.getDate() + 1);
    const formattedEndDate = inclusiveEndDate
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "");
    try {
      // Fetch data from Dexie.js database
      const transactions = await db.transactions
        .where("date")
        .between(formattedStartDate, formattedEndDate, true, true)
        .toArray();

      setDatesData(transactions);
      // Handle data export (e.g., create a CSV file)
      const header = [
        "ID",
        "Date",
        "Type",
        "Description",
        "Category",
        "Amount",
      ];
      const rows = transactions.map((row) => [
        row.id,
        row.date,
        row.type,
        row.description,
        row.category,
        row.amount,
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div
    // className="work-container"
    // style={{
    //   backgroundColor: "lightsteelblue",
    // }}
    >
      <div className="menu-dots">
        <div className="main-menu">
          <span style={showDots ? {} : { display: "none" }}>
            <BsThreeDotsVertical size={28} onClick={() => handleMenuClick()} />
          </span>
          {openReportsMenu && (
            <DropdownMenu
              type="items"
              secType="links"
              roles={"any"}
              menuItems={menuItems}
              secMenuItem={menuMainItems}
              onClose={() => setOpenReportsMenu(false)}
              mainscreen={true}
            />
          )}
        </div>
      </div>
      <div
        className="work-container"
        style={{
          backgroundColor: "#d8d8d4",
        }}
      >
        <span style={{ fontSize: "2rem", marginLeft: "1rem" }}>Reports</span>
        {databaseOption && (
          <>
            <span
              style={{
                fontSize: "1.5rem",
                display: databaseOption ? {} : "none",
              }}
            >
              {" "}
              - Database report
            </span>
            <ReportsTable allTrans={allTrans} />
          </>
        )}
        {timePeriodOption && (
          <>
            <span
              style={{
                fontSize: "1.5rem",
                display: timePeriodOption ? {} : "none",
              }}
            >
              {" "}
              - Period report
            </span>
            <div>
              <Container>
                <DateRangePicker onExport={dataForTimePeriod} />
              </Container>
              <ReportsTable allTrans={datesData} />
            </div>
          </>
        )}
        {categoryOption && (
          <>
            <span
              style={{
                fontSize: "1.5rem",
                display: categoryOption ? {} : "none",
              }}
            >
              {" "}
              - Categories
            </span>
            <CategoryDropdown />
          </>
        )}
        {}
      </div>
    </div>
  );
};

export default Reports;
