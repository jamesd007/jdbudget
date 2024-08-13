import React, { useState, useEffect } from "react";
import { useDataContext } from "../providers/DataProvider";
import "../styles/BudgetSelect.css";
import db from "../store/Dexie";
import Modals from "../utils/Modals";
import "../styles/Modals.css";

const BudgetSelect = () => {
  const { currentBudgetName, setCurrentBudgetName } = useDataContext();
  const [budgetNames, setBudgetNames] = useState([]);
  const [thisBudgetName, setThisBudgetName] = useState();
  const [selectedBudget, setSelectedBudget] = useState("");
  const currentYear = new Date().getFullYear();
  const [budgetStartYear, setBudgetStartYear] = useState(currentYear);
  // const defaultBudgetMonths = [
  //   "March",
  //   "April",
  //   "May",
  //   "June",
  //   "July",
  //   "August",
  //   "September",
  //   "October",
  //   "November",
  //   "December",
  //   "January",
  //   "February",
  // ];
  // const [budgetMonths, setBudgetMonths] = useState(defaultBudgetMonths);
  const [startMonth, setStartMonth] = useState("March");
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getMonthIndex = (month) => {
    return months.indexOf(month);
  };

  const fetchUniqueBudgetNames = async () => {
    try {
      const allBudgets = await db.budgetdetails.toArray();
      const uniqueNames = [...new Set(allBudgets.map((budget) => budget.name))];
      return uniqueNames;
    } catch (error) {
      console.error("Failed to fetch budget names:", error);
      return [];
    }
  };

  useEffect(() => {
    const loadBudgetNames = async () => {
      const names = await fetchUniqueBudgetNames();
      setBudgetNames(names);
    };

    loadBudgetNames();
  }, []);

  const handleChange = (event) => {
    setSelectedBudget(event.target.value);
  };

  const handleBudgetName = (e) => {
    setThisBudgetName(e.target.value);
  };

  const saveBudget = async () => {
    // Save the user's details to the Dexie database
    try {
      await db.budgetdetails.add({
        name: thisBudgetName,
        year: currentYear,
        startmonth: startMonth,
      });
      alert("budget saved");
      setCurrentBudgetName(thisBudgetName);
      localStorage.setItem("currentBudgetName", thisBudgetName);
    } catch (error) {
      console.error("ERROR saving budget:", error);
      alert("budget save failed");
    }
  };

  const handleStartYear = (e) => {
    setBudgetStartYear(e.target.value);
  };

  const handleRadioChange = (e) => {
    setStartMonth(e.target.value);
    let tempBudgetMonths = [];
    for (let x = getMonthIndex(e.target.value); x < months.length; x++) {
      tempBudgetMonths.push(months[x]);
    }
    for (let x = 0; x < getMonthIndex(e.target.value); x++) {
      tempBudgetMonths.push(months[x]);
    }
    // setBudgetMonths(tempBudgetMonths);
  };

  const handleCloseModal = () => {};

  return (
    <div>
      {currentBudgetName ? (
        <div>
          <h3>{currentBudgetName}</h3>
        </div>
      ) : budgetNames.length > 0 ? (
        <div>
          <label htmlFor="budget-select">Select a Budget:</label>
          <select
            id="budget-select"
            value={selectedBudget}
            onChange={handleChange}
          >
            <option value="">--Please choose an option--</option>
            {budgetNames.map((name, index) => (
              <option key={index} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <Modals
          title="Budget entry"
          noBckgrnd={true}
          onClose={() => handleCloseModal()}
          footer={
            <div>
              <button
                className="main_buttons"
                type="button"
                disabled={!thisBudgetName || !budgetStartYear || !startMonth}
                onClick={() => {
                  saveBudget();
                }}
              >
                Submit
              </button>
            </div>
          }
        >
          <div>
            <p>
              No budgets were found in the database. Please enter details of
              budget to be created.
            </p>
            <label>budget name : </label>
            <input onChange={handleBudgetName}></input>
            <label>Enter start year of budget</label>
            <input
              value={budgetStartYear}
              onChange={handleStartYear}
              placeholder={currentYear}
            ></input>
            <form>
              <label>Enter start month of financial year</label>
              {months.map((month, index) => (
                <div key={index}>
                  <label key={month}>
                    <input
                      type="radio"
                      value={month}
                      checked={startMonth === month}
                      onChange={handleRadioChange}
                    />
                    {month}
                  </label>
                  <br />
                </div>
              ))}
            </form>
          </div>
        </Modals>
      )}
    </div>
  );
};

export default BudgetSelect;
