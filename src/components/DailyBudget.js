import React, { useState, useEffect, useContext } from "react";
import dayjs from "dayjs";
import Modals from "../utils/Modals";
import "../styles/Budget.css";
import "../styles/Modals.css";
import "../styles/MainStyles.css";
import {
  getAllBudgets,
  addBudget,
  // deleteBudget,
  // updateBudget,
} from "../store/Dexie";
import { useDataContext } from "../providers/DataProvider";

const DailyBudget = () => {
  const [startFinYr, setStartFinYr] = useState();
  const { currentUser } = useDataContext();
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
  const [calendar, setCalendar] = useState([]);
  const [currentDate, setCurrentDate] = useState(null);
  const [budgetName, setBudgetName] = useState("");
  const [budgetData, setBudgetData] = useState({
    user_id: currentUser,
    budgetName: "",
    date: currentDate,
    description: "",
    category: "",
    amount: 0,
    // Add other fields with initial values if needed
  });
  const dateFormats = [
    "DD/MMM/YYYY",
    "DD/MM/YY",
    "DD/MM/YYYY",
    "MM/DD/YYYY",
    "DD MMM YYYY",
    "DD MMMM YYYY dddd",
  ];
  const weekEnd = "Saturday";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [frequency, setFrequency] = useState("");
  const [repeatFreq, setRepeatFreq] = useState("");
  const [repeatFreqDays, setRepeatFreqDays] = useState(1);
  const [repeatWeeklyDays, setRepeatWeeklyDays] = useState(1);
  const [repeatMonthly, setRepeatMonthly] = useState(false);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [numberOfMonths, setNumberOfMonths] = useState(1);
  const [days, setDays] = useState({
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false,
    Saturday: false,
    Sunday: false,
  });
  const monthFreq = ["first", "second", "third", "forth", "last"];
  const [monthFreqOption, setMonthFreqOption] = useState("");
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const [monthFreqOptionDay, setMonthFreqOptionDay] = useState("");
  const [numberOfMonthsMonthly, setNumberOfMonthsMonthly] = useState(1);
  const [allBudgets, setAllBudgets] = useState([]);

  const handleChangeDays = (event) => {
    const { name, checked } = event.target;
    setDays((prevDays) => ({
      ...prevDays,
      [name]: checked,
    }));
  };

  const getDayOfWeek = (date) => {
    return dayjs(date).format("ddd");
  };

  const formatDate = (date, format) => {
    return dayjs(date).format(format);
  };

  const makeCalendar = () => {
    const startIndex = months.indexOf(startFinYr);

    const calendar = [];
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );
    const currentYear = new Date().getFullYear();
    let year = currentYear;
    for (let i = 0; i < 12; i++) {
      const monthIndex = (startIndex + i) % 12;
      if (monthIndex === 0 && i > 0) year++; // Increment year after December

      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate(); // Get the number of days in the month

      for (let day = 1; day <= daysInMonth; day++) {
        calendar.push({ day, month: months[monthIndex], year });
      }
    }
    return calendar;
  };

  useEffect(() => {
    const getTheBudgets = async () => {
      try {
        let budgetRecs = await getAllBudgets();
        setAllBudgets(budgetRecs);
      } catch (error) {
        console.error("Error retrieving transactions:", error);
      }
    };
    getTheBudgets();
  }, []);

  useEffect(() => {
    if (months.includes(startFinYr)) {
      setCalendar(makeCalendar());
      console.log("tedtest calendar=", calendar);
    }
  }, [startFinYr]);

  const handleStartFinYr = (e) => {
    console.log("tedtest e.target.value=", e.target.value);
    setStartFinYr(e.target.value);
  };

  const handleInputChange = (date, field, value) => {
    console.log("tedtestW this is handleInputChange");
    setBudgetData((prevData) => ({
      ...prevData,
      budgetName: budgetName,
      [field]: value,
      date: prevData.date || date,
      user_id: prevData.user_id || currentUser,
    }));

    // if (!budgetData.user_id) budgetData.user_id = currentUser;
    // if (!budgetData.date) budgetData.date = date;
    // budgetData[field] = value;
  };

  const handleSave = async () => {
    try {
      console.log("tedtestU budgetData=", budgetData);

      // Ensure all fields have default values if not provided
      const dataToSave = {
        user_id: budgetData.user_id || "default_user_id", // Replace 'default_user_id' with an appropriate default value
        name: budgetData.name || "",
        type: budgetData.type || "",
        category: budgetData.category || "",
        description: budgetData.description || "",
        date: budgetData.date || new Date(), // Set the default date to the current date
        amount: budgetData.amount || 0, // Assuming amount should be a number; default to 0
        repeat_options: budgetData.repeat_options || {}, // Default to an empty object if not provided
        growth_options: budgetData.growth_options || {}, // Default to an empty object if not provided
        extras: budgetData.extras || "", // Default to an empty string if not provided
      };

      // This should write data to the database
      await addBudget(
        dataToSave.user_id,
        dataToSave.name,
        dataToSave.type,
        dataToSave.category,
        dataToSave.description,
        dataToSave.date,
        dataToSave.amount,
        dataToSave.repeat_options,
        dataToSave.growth_options,
        dataToSave.extras
      );

      // handleInputChange(currentDate, field, value);
      handleCloseModal();
    } catch (error) {
      console.error("Error saving budget:", error);
    }
  };

  useEffect(() => {
    console.log("tedtestWW budgetData=", budgetData);
  }, [budgetData]);

  const handleOpenModal = (date, index) => {
    setCurrentDate(date);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentDate(null);
  };

  const getDateFromObject = ({ day, month, year }) => {
    const monthIndex = months.indexOf(month); // Convert month name to index
    return new Date(year, monthIndex, day);
  };

  const getRepeatFrequencyDetails = (frequency) => {
    switch (frequency) {
      case "daily":
        return (
          <div>
            <input
              type="radio"
              id="everyDay"
              name="everyDay"
              value="everyDay"
              checked={repeatFreq === "everyDay"}
              onChange={(e) => setRepeatFreq("everyDay")}
            />
            <label htmlFor="everyDay">every day</label>
            <input
              type="radio"
              id="everyWeekDay"
              name="everyWeekDay"
              value="everyWeekDay"
              checked={repeatFreq === "everyWeekDay"}
              onChange={(e) => setRepeatFreq("everyWeekDay")}
            />
            <label htmlFor="everyWeekDay">every weekday</label>
            {repeatFreq === "everyDay" && (
              <div>
                <label>Days</label>
                <input
                  type="number"
                  value={repeatFreqDays}
                  onChange={(e) => setRepeatFreqDays(e.target.value)}
                ></input>
              </div>
            )}
          </div>
        );
      case "weekly":
        return (
          <div>
            <label>Repeat every</label>
            <input
              type="number"
              value={repeatWeeklyDays}
              onChange={(e) => setRepeatWeeklyDays(e.target.value)}
            ></input>
            <label>week(s) on</label>
            {Object.keys(days).map((day) => (
              <div key={day}>
                <label>
                  <input
                    type="checkbox"
                    name={day}
                    checked={days[day]}
                    onChange={handleChangeDays}
                  />
                  {day}
                </label>
              </div>
            ))}
          </div>
        );
      case "monthly":
        return (
          <div>
            <div style={{ opacity: repeatMonthly === "day" ? "1" : "0.5" }}>
              <input
                type="radio"
                id="repeatMonthlyDay"
                name="repeatMonthlyDay"
                value="day"
                checked={repeatMonthly === "day"}
                onChange={(e) => setRepeatMonthly("day")}
              />
              <label htmlFor="repeatMonthlyDay">Day</label>
              <input
                style={{ width: "2rem" }}
                type="number"
                id="dayofmonth"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(e.target.value)}
              ></input>
              <label htmlFor="dayofmonth">of every</label>
              <input
                style={{ width: "2rem" }}
                type="number"
                id="numberofmonths"
                value={numberOfMonths}
                onChange={(e) => setNumberOfMonths(e.target.value)}
              ></input>
              <label htmlFor="numberofmonths">month(s)</label>
            </div>
            <div style={{ opacity: repeatMonthly === "the" ? "1" : "0.5" }}>
              <input
                type="radio"
                id="repeatMonthlyThe"
                name="repeatMonthlyThe"
                value="the"
                checked={repeatMonthly === "the"}
                onChange={(e) => setRepeatMonthly("the")}
              />
              <label htmlFor="repeatMonthlyThe">The</label>
              <select onChange={(e) => setMonthFreqOption(e.target.value)}>
                <option value="">Select frequency</option>
                {monthFreq.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select onChange={(e) => setMonthFreqOptionDay(e.target.value)}>
                <option value="">Select day</option>
                {daysOfWeek.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              of every
              <input
                style={{ width: "2rem" }}
                type="number"
                id="numberofmonthsmonthly"
                value={numberOfMonths}
                onChange={(e) => setNumberOfMonthsMonthly(e.target.value)}
              ></input>
              <label htmlFor="numberofmonthsmonthly">month(s)</label>
            </div>
          </div>
        );
      // case "yearly":
      //   return <div>Yearly</div>;
      default:
        return null;
    }
  };

  const getDaysRecords = (formattedDate) => {
    // console.log("tedtestggGGG allBudgets=", allBudgets);
    const budgetsForDate = allBudgets.filter(
      (budget) => formatDate(budget.date, "DD MMM YYYY") === formattedDate
    );
    if (budgetsForDate.length > 0)
      console.log("tedtestggGGG budgetsfordate=", budgetsForDate[0]);
    if (budgetsForDate.length === 0) {
      return null; // No records found for the given date
    } else return budgetsForDate;
  };

  const handleEditRec = (date, item, index) => {
    console.log("tedtest item=", item, " index=", index);
    setCurrentDate(date);
    setIsModalOpen(true);
    setBudgetData({
      user_id: currentUser,
      date: item.Date,
      description: item.description,
      category: item.category,
      amount: item.amount,
    });
  };

  // const getBudgetNames = () => {
  //   allBudgets;
  // };

  return (
    <div className="budget-display-container">
      <label>Enter name of budget</label>
      <div style={{ marginBottom: "1rem" }}>
        <label>Enter start month of financial year</label>
        <select
          // title={header}
          value={startFinYr || ""}
          onChange={(e) => handleStartFinYr(e)}
        >
          <option value="" disabled>
            Select a month
          </option>
          {months.map((mnth) => (
            <option key={mnth}>{mnth}</option>
          ))}
        </select>
      </div>
      <span>Budget name: {budgetName}</span>
      <span>year: {}</span>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "5rem 4rem 12rem 5rem 4rem 4rem 4rem",
          fontSize: "0.9rem",
          textAlign: "left",
        }}
      >
        <span>Date</span>
        <span>Day</span>
        <span>Transaction</span>
        <span>Category</span>
        <span>Dr</span>
        <span>Cr</span>
        <span>Balance</span>
      </div>
      <div
        style={{
          overflow: "hidden",
          overflowY: "auto",
          width: "100%",
          height: "calc(90vh - 6rem)",
        }}
      >
        {calendar.map((dateObj, index) => {
          const date = getDateFromObject(dateObj);
          return (
            <div
              key={index}
              className="date-row"
              style={{
                borderBottom:
                  getDayOfWeek(date) === "Sunday" ||
                  getDayOfWeek(date) === "Sun"
                    ? "1px solid black"
                    : "",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  display: "grid",
                  gridTemplateColumns: "5rem 4rem 12rem 5rem 4rem 4rem 4rem",
                }}
              >
                <span className="date">{formatDate(date, "DD MMM YYYY")}</span>
                <span className="day">{getDayOfWeek(date)}</span>
                <span
                // className="placeholder"
                // onDoubleClick={() =>
                //   handleOpenModal(formatDate(date, "DD MMM YYYY"))
                // }
                >
                  {getDaysRecords(formatDate(date, "DD MMM YYYY")) &&
                    getDaysRecords(formatDate(date, "DD MMM YYYY")).map(
                      (item, index) => (
                        <div
                          key={index}
                          onClick={() => handleEditRec(item.date, item, index)}
                        >
                          {item.description}
                        </div>
                      )
                    )}
                  {/* getDaysRecords(formatDate(date, "DD MMM YYYY")).map(
                      (item) => item.description
                    )} */}
                  <span
                    style={{ opacity: "0.5", fontStyle: "italic" }}
                    onDoubleClick={() =>
                      handleOpenModal(formatDate(date, "DD MMM YYYY"))
                    }
                  >
                    Double click to enter new{" "}
                  </span>
                </span>
                <span>
                  {getDaysRecords(formatDate(date, "DD MMM YYYY")) &&
                    getDaysRecords(formatDate(date, "DD MMM YYYY")).map(
                      (item, index) => <div key={index}>{item.category}</div>
                    )}
                </span>
                <span>
                  {getDaysRecords(formatDate(date, "DD MMM YYYY")) &&
                    getDaysRecords(formatDate(date, "DD MMM YYYY")).map(
                      (item, index) => <div key={index}>{item.amount}</div>
                    )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {isModalOpen && (
        <Modals
          title="Budget entry"
          noBckgrnd={true}
          onClose={() => handleCloseModal()}
          footer={
            <div>
              <button
                className="main_buttons"
                type="button"
                onClick={() => {
                  handleSave();
                }}
              >
                Submit
              </button>
              <button onClick={handleCloseModal}>Close</button>
            </div>
          }
        >
          <div>current user: {currentUser}</div>
          <div>
            <label>budget name: </label>
            <input
              type="text"
              value={budgetData.name}
              onChange={(e) => setBudgetName(e.target.value)}
            ></input>
          </div>
          <div>{currentDate}</div>
          <div>
            <label>Description: </label>
            <input
              type="text"
              placeholder="description"
              value={budgetData.description}
              onChange={(e) =>
                handleInputChange(currentDate, "description", e.target.value)
              }
            ></input>
          </div>
          <div className="form">
            <input
              type="number"
              placeholder="amount"
              value={budgetData.amount}
              onChange={(e) =>
                handleInputChange(currentDate, "amount", e.target.value)
              }
            />

            {/* <input
              type="number"
              placeholder="Expenses"
              onChange={(e) =>
                handleInputChange(currentDate, "expenses", e.target.value)
              }
            /> */}
            <select
              onChange={(e) =>
                handleInputChange(currentDate, "category", e.target.value)
              }
              value={budgetData.category}
            >
              <option value="">Select Category</option>
              {[
                "Food",
                "Transport",
                "Utilities",
                "Entertainment",
                "Others",
              ].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Repeat: </label>{" "}
            <input type="checkbox" onChange={(e) => setRepeat(!repeat)} />
          </div>
          {repeat && (
            <div>
              <label>Frequency: </label>
              <div>
                <input
                  type="radio"
                  id="daily"
                  name="frequency"
                  value="daily"
                  checked={frequency === "daily"}
                  onChange={(e) => setFrequency("daily")}
                />
                <label htmlFor="daily">Daily</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="weekly"
                  name="frequency"
                  value="weekly"
                  checked={frequency === "weekly"}
                  onChange={(e) => setFrequency("weekly")}
                />
                <label htmlFor="weekly">Weekly</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="monthly"
                  name="frequency"
                  value="monthly"
                  checked={frequency === "monthly"}
                  onChange={(e) => setFrequency("monthly")}
                />
                <label htmlFor="monthly">Monthly</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="yearly"
                  name="frequency"
                  value="yearly"
                  checked={frequency === "yearly"}
                  onChange={(e) => setFrequency("yearly")}
                />
                <label htmlFor="yearly">Yearly</label>
              </div>
            </div>
          )}
          {frequency && getRepeatFrequencyDetails(frequency)}
        </Modals>
      )}
    </div>
  );
};

export default DailyBudget;
