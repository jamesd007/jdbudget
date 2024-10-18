import React, { useContext, useState, useEffect, useRef } from "react";
import "./BudgetTest.css";
import styles from "../../styles/Budget.module.css";
import { useDataContext } from "../../providers/DataProvider";
import { UserContext } from "../../contexts/UserContext";
import db from "../../store/Dexie";
import dayjs from "dayjs";
import DailyBudget from "../../components/DailyBudget";
import Modals from "../../utils/Modals";
import { BiImport } from "react-icons/bi";
import { BiExport } from "react-icons/bi";
import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";

const BudgetTest = () => {
  const { currentBudgetName, setCurrentBudgetName } = useDataContext();
  const { user } = useContext(UserContext);
  const [userBudgets, setUserBudgets] = useState([]);
  const [budgetView, setBudgetView] = useState("daily");
  const [displayYear, setDisplayYear] = useState(new Date().getFullYear());
  const [startMonth, setStartMonth] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const iconSize = 20;
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
  const budget_details_container = useRef(null);
  const [detailsSpaceHgt, setDetailsSpaceHgt] = useState(0);

  useEffect(() => {
    if (openModal && budgetNameRef.current) {
      budgetNameRef.current.focus();
    }
  }, [openModal]);

  useEffect(() => {
    if (budget_details_container?.current) {
      setDetailsSpaceHgt(budget_details_container?.current?.offsetHeight);
    }
  }, [budget_details_container?.current?.offsetHeight]);

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
    //returns all budgets for this user
    const getBudgetsForUser = async () => {
      try {
        const budgets = await db.budgetdetails
          .where({ user_id: user.id })
          .toArray();

        if (budgets && budgets.length > 0) {
          let tmpBudgetName = await getLastBudgetName();
          setCurrentBudgetName(tmpBudgetName);
        }
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

  const handleSearch = () => {
    console.log("tedtest handlesearch");
  };

  const handleGoto = () => {
    console.log("tedtest handleGoto");
  };

  return (
    <div className="work-container">
      <span style={{ fontSize: "1.25rem", marginLeft: "1rem" }}>
        Budget - Edit
      </span>
      {/* <div className="budget-main-container"> */}
      <div //container top
        className="budget-details-container"
        ref={budget_details_container}
      >
        <div className="budget-details-rowone">
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
        // style={{
        //   height:
        //     detailsSpaceHgt > 0
        //       ? `calc(100vh - ${detailsSpaceHgt} - 5rem)`
        //       : "calc(100vh - 10rem)",
        // }}
      >
        <div
          className={styles.budget_button_grid}
          // style={{ gridTemplateColumns: "repeat(4, 7rem)" }}
        >
          {/* <button
            className={styles.budget_main_buttons}
            // disabled={checkedTransactions?.length <= 0}
            // onClick={() => setDeleteConfirm(true)}
          >
            <FaRegTrashAlt size={iconSize * 0.9} />
            Delete
          </button> */}
          {/* <button
            className={styles.budget_main_buttons}
            disabled={checkedTransactions?.length <= 0}
            onClick={() => setAddEntry(true)}
          >
            <MdAddCircle size={24} />
            <MdAddCircleOutline size={24} />
            Add
          </button> */}
          <Link to="/import" className={styles.budget_main_buttons}>
            <BiImport size={24} />
            {/* <FaFileImport size={20} /> */}
            Import
          </Link>
          <button
            className={styles.budget_main_buttons}
            // onClick={() => handleExport()}
          >
            <BiExport size={24} />
            {/* <FaFileExport size={20} /> */}
            Export
          </button>
          <button
            className={styles.budget_main_buttons}
            onClick={() => handleSearch()}
          >
            <FaSearch size={iconSize * 0.8} />
            Search
          </button>
          <button
            className={styles.budget_main_buttons}
            onClick={() => handleGoto()}
          >
            <FaArrowUpRightFromSquare size={iconSize * 0.8} />
            Goto
          </button>
        </div>
        {startMonth && displayYear ? (
          <DailyBudget startFinYr={startMonth} year={displayYear} />
        ) : currentBudgetName ? (
          <p>Loading...</p> // or any other placeholder content
        ) : (
          <p>No current budget found...</p>
        )}
      </div>
      {/* </div> */}
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
