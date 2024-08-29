import React, { useContext, useEffect, useRef } from "react";
import "./BudgetTest.css";
import { useDataContext } from "../../providers/DataProvider";
import { UserContext } from "../../contexts/UserContext";
import db from "../../store/Dexie";
import { useState } from "react";
import dayjs from "dayjs";
import DailyBudget from "../../components/DailyBudget";
import Modals from "../../utils/Modals";

const BudgetTest = () => {
  const { currentBudgetName, setCurrentBudgetName } = useDataContext();
  const { user } = useContext(UserContext);
  const [userBudgets, setUserBudgets] = useState([]);
  const [budgetView, setBudgetView] = useState("daily");
  const [displayYear, setDisplayYear] = useState(new Date().getFullYear());
  const [startMonth, setStartMonth] = useState(null);
  const [endDate, setEndDate] = useState(null);
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
  const [openModal, setOpenModal] = useState(false);
  const [budgetYear, setBudgetYear] = useState(new Date().getFullYear());
  const [startFinYr, setStartFinYr] = useState();
  const [newBudgetName, setNewBudgetName] = useState("");
  const [openingBalance, setOpeningBalance] = useState(0);
  const budgetNameRef = useRef(null);

  useEffect(() => {
    if (openModal && budgetNameRef.current) {
      budgetNameRef.current.focus();
    }
  }, [openModal]);

  const getLastBudgetName = async () => {
    let rec;
    try {
      rec = await db.users.where("id").equals(user.id).first();
      return rec.last_budget;
      // setCurrentBudgetName(rec.last_budget);
    } catch (error) {
      console.error("Error getting last budget name", error);
    }
  };

  const formatDate = (date, format) => {
    return dayjs(date).format(format);
  };

  const getFinancialYearEndDate = (startDate) => {
    const beginMonth = dayjs(startDate).month(); // Get the month of the start date
    const startYear = dayjs(startDate).year(); // Get the year of the start date
    let endYear;
    if (beginMonth >= 1) {
      // If the start date is in February or later
      endYear = startYear + 1;
    } else {
      // If the start date is in January
      endYear = startYear;
    }
    let endMonth = 1;
    endMonth = beginMonth - 1;
    const daysInMonth = new Date(endYear, endMonth + 1, 0).getDate(); // Get the number of days in the month
    const thisDate = daysInMonth + " " + months[endMonth] + " " + endYear;
    return thisDate;
  };

  const getStartDate = () => {
    if (!startMonth || !displayYear) {
      return null;
    }
    const thisDate = "01 " + startMonth + " " + displayYear;
    return thisDate;
  };

  useEffect(() => {
    const getEndDate = async () => {
      const startDate = await getStartDate();
      setEndDate(getFinancialYearEndDate(startDate));
    };

    getEndDate();
  }, [startMonth, displayYear]);

  useEffect(() => {
    const getBudgetsForUser = async () => {
      try {
        const budgets = await db.budgetdetails
          .where({ user_id: user.id })
          .toArray();

        if (budgets && budgets.length > 0) {
          let tmpBudgetName = await getLastBudgetName();
          setCurrentBudgetName(tmpBudgetName);
        }
        // setCurrentBudgetName(budgets[0]?.name);
        //tedtest is this right, we should look for last used budget, which is in users table
        return budgets.map((budget) => budget.name);
      } catch (error) {
        console.error("Error fetching budgets", error);
        return null; // or handle the error as needed
      }
    };
    const fetchBudgets = async () => {
      setUserBudgets(await getBudgetsForUser());
    };

    fetchBudgets();
  }, []);

  const getStartMonth = async () => {
    if (currentBudgetName) {
      try {
        const mnth = await db.budgetdetails
          .where({
            user_id: user.id,
            name: currentBudgetName,
          })
          .first();
        return mnth.startmonth;
      } catch (error) {
        console.error("Error fetching start month", error);
        return null; // or handle the error as needed
      }
    }
  };

  useEffect(() => {
    const fetchStartMonth = async () => {
      setStartMonth(await getStartMonth());
    };

    fetchStartMonth();
  }, [currentBudgetName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    //see if newBudgetName exists on dbase
    let nameExist;
    try {
      nameExist = await db.budgetdetails.where({ name: newBudgetName }).first();
    } catch (error) {
      console.error("check on newBudgetName", error);
    }
    if (nameExist) alert("Budget name, " + newBudgetName + ", already exists");
    else {
      try {
        await db.budgetdetails.add({
          user_id: user.id,
          name: newBudgetName,
          type: "",
          lock: "",
          year: budgetYear,
          startmonth: startFinYr,
          openingbalance: openingBalance,
        });
        if (userBudgets && userBudgets.length > 0)
          setUserBudgets([...userBudgets, newBudgetName]);
        else setUserBudgets([newBudgetName]);
        setCurrentBudgetName(newBudgetName);
        await db.users.update(user.id, { last_budget: newBudgetName });
        setOpenModal(false);
      } catch (error) {
        console.error("Error adding new budget:", error);
      }
    }
  };

  const handleCreateNewBudget = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <div>
      <div className="budget-main-container">
        <div //container top
          className="budget-details-container"
        >
          <div className="budget-details-rowone">
            {/* <span>budget: {currentBudgetName}</span> */}
            <label>
              Budget:
              <select
                onChange={(e) => {
                  const selectedValue = e.target.value;
                  if (selectedValue === "new") {
                    handleCreateNewBudget(); // This function should open a modal or prompt for budget creation
                  } else {
                    setCurrentBudgetName(selectedValue);
                  }
                }}
                value={currentBudgetName}
              >
                {(userBudgets || []).map((budget) => {
                  return (
                    <option key={budget} value={budget}>
                      {budget}
                    </option>
                  );
                })}
                <option value="new">New Budget</option>{" "}
                {/* Add this option for creating a new budget */}
                {/* <option disabled value="">
                  {" "}
                  -- select an option --{" "}
                </option> */}
                <option disabled selected value="">
                  {" "}
                  -- select an option --{" "}
                </option>
              </select>
            </label>
            <label>
              View:
              <select
                onChange={(e) => setBudgetView(e.target.value)}
                value={budgetView}
              >
                {["daily", "monthly"].map((view) => (
                  //tedtest these selections should be in a var
                  <option key={view} value={view}>
                    {view}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Year:
              <select
                onChange={(e) => setDisplayYear(e.target.value)}
                value={displayYear}
              >
                {["2024", "2025"].map((year) => (
                  //tedtest think this out, years to be got from data in database
                  //need way to show next year and previous year when in budgets
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
          </div>
          Start month:
          {startMonth && startMonth}
          <div>
            Budget period:
            {getStartDate() && (
              <span>
                {getStartDate()} to{" "}
                {getFinancialYearEndDate(new Date(getStartDate()))}
              </span>
            )}
          </div>
        </div>

        <div //container workspace
          className="budget-workspace-container"
        >
          {startMonth && displayYear ? (
            <DailyBudget startFinYr={startMonth} year={displayYear} />
          ) : currentBudgetName ? (
            <p>Loading...</p> // or any other placeholder content
          ) : (
            <p>No current budget found...</p>
          )}
        </div>
      </div>
      {openModal && (
        <Modals
          title="Budget entry"
          noBckgrnd={true}
          onClickOutside={false}
          onClose={() => handleCloseModal()}
          footer={
            <div>
              <button
                style={{
                  marginTop: "1rem",
                  marginBottom: "0.5rem",
                }}
                type="submit"
                disabled={!newBudgetName || !budgetYear || !startFinYr}
                className="button-submit"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          }
        >
          <form onSubmit={handleSubmit}>
            <div>
              <label>
                name:
                <input
                  ref={budgetNameRef}
                  type="text"
                  onChange={(e) => setNewBudgetName(e.target.value)}
                  placeholder="budget name"
                ></input>
              </label>
            </div>
            <div style={{ marginLeft: "1rem" }}>
              <label>
                year:
                <input
                  style={{ width: "3rem" }}
                  type="number"
                  value={budgetYear}
                  onChange={(e) => setBudgetYear(e.target.value)}
                ></input>
              </label>
            </div>
            <div>
              <label>start month of financial year:</label>
              <select
                style={{
                  width: "fit-content",
                  margin: "0 0.5rem 0 0.5rem",
                  fontSize: "0.8rem",
                }}
                onChange={(e) => setStartFinYr(e.target.value)}
              >
                <option value="">Select month</option>
                {months.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>
                opening balance:
                <input
                  style={{ width: "3rem" }}
                  type="number"
                  value={openingBalance}
                  onChange={(e) =>
                    setOpeningBalance(
                      parseFloat(parseFloat(e.target.value).toFixed(2))
                    )
                  }
                ></input>
              </label>
            </div>
          </form>
        </Modals>
      )}
    </div>
  );
};

export default BudgetTest;
