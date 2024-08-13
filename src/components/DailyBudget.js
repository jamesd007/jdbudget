import React, { useState, useEffect, useContext, useRef } from "react";
import dayjs from "dayjs";
import Modals from "../utils/Modals";
import "../styles/Budget.css";
import "../styles/Modals.css";
import "../styles/MainStyles.css";
import db from "../store/Dexie";
import {
  getAllBudgets,
  addBudget,
  deleteBudget,
  updateBudget,
} from "../store/Dexie";
import { useDataContext } from "../providers/DataProvider";
import BudgetSelect from "./BudgetSelect";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import "../styles/DatePicker.css"; // Import the custom CSS file
import { FaPlus } from "react-icons/fa";
import useHandleRecurrence from "../hooks/useHandleRecurrence";

const DailyBudget = () => {
  const [currentYear, setCurrentYear] = useState();
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
  const [repeatWeeklyWeeks, setRepeatWeeklyWeeks] = useState(1);
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
  const { currentBudgetName, setCurrentBudgetName } = useDataContext();
  const [transactionType, setTransactionType] = useState("Expenses");
  const [recurYears, setRecurYears] = useState(1);
  const [yearlyRecurMonth, setYearlyRecurMonth] = useState();
  const [yearlyRecurDate, setYearlyRecurDate] = useState();
  const [yearlyOnDateDay, setYearlyOnDateDay] = useState();
  const [yearlyFreqOption, setYearlyFreqOption] = useState("first");
  const daysOfYearlyFreq = [
    "day",
    "weekday",
    "weekend-day",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const [yearlyFreqOptionDay, setYearlyFreqOptionDay] = useState();
  const [yearlyOnDayRecurMonth, setYearlyOnDayRecurMonth] = useState();
  const [yearlyOnDate, setYearlyOnDate] = useState();
  const [currentDay, setCurrentDay] = useState();
  const [currentMonth, setCurrentMonth] = useState("");
  const [selectedDay, setSelectedDay] = useState();
  const [endSpec, setEndSpec] = useState("");
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [isSecondPickerVisible, setIsSecondPickerVisible] = useState(false);
  const [isThirdPickerVisible, setIsThirdPickerVisible] = useState(false);
  const [endSelectedDay, setEndSelectedDay] = useState();
  const [endAfterOccurrences, setEndAfterOccurrences] = useState(1);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState();
  const handleRecurrence = useHandleRecurrence(setAllBudgets);
  const descriptionInputRef = useRef(null);
  const RecurEditText = `
  Open recurring item
  This transaction is one of a series.
  Do you wish to enter only this item,
  or do you wish to edit the series?
  `;
  const [editSeriesConfirm, setEditSeriesConfirm] = useState({});

  useEffect(() => {
    setYearlyRecurDate(currentDate);
  }, [currentDate]);

  const togglePickerVisibility = () => {
    setIsPickerVisible(!isPickerVisible);
  };

  useEffect(() => {
    if (isModalOpen && descriptionInputRef.current) {
      descriptionInputRef.current.focus();
    }
  }, [isModalOpen]);

  const toggleSecondPickerVisibility = () => {
    setIsSecondPickerVisible(!isSecondPickerVisible);
  };

  const toggleThirdPickerVisibility = () => {
    setIsThirdPickerVisible(!isThirdPickerVisible);
  };

  useEffect(() => {
    const now = new Date();
    const month = months[now.getMonth()];
    const day = now.getDate();
    setYearlyRecurMonth(month);
    setCurrentDay(day);
  }, []);

  const handleSetBudgetName = (e) => {
    setCurrentBudgetName(e.target.value);
  };

  const handleChangeDays = (event) => {
    const { name, checked } = event.target;
    setDays((prevDays) => ({
      ...prevDays,
      [name]: checked,
    }));
  };

  const handleChangeNumberOfMonths = (e) => {
    setNumberOfMonths(e.target.value);
  };

  const getDayOfWeek = (date) => {
    return dayjs(date).format("ddd");
  };

  const formatDate = (date, format) => {
    return dayjs(date).format(format);
  };

  const formatDateRepeat = (date) => {
    if (!date) return "Select Date";
    const options = { weekday: "short" };
    const weekday = date.toLocaleDateString("en-ZA", options);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based
    const year = date.getFullYear();
    return `${weekday} ${day}/${month}/${year}`;
  };

  const formatDayMonth = (date) => {
    return `${formatDate(date, "DD MMM")}`;
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
    }
  }, [startFinYr]);

  // const handleStartFinYr = (e) => {
  //   setStartFinYr(e.target.value);
  // };

  const handleInputChange = (date, field, value) => {
    setBudgetData((prevData) => ({
      ...prevData,
      budgetName: budgetName,
      [field]: value,
      date: prevData.date || date,
      user_id: prevData.user_id || currentUser,
    }));
  };

  const resetVars = () => {
    setBudgetData({
      user_id: currentUser,
      budgetName: "",
      date: currentDate,
      description: "",
      category: "",
      amount: 0,
    });
    setRepeat(false);
    setFrequency("");
    setRepeatFreq("");
    setRepeatFreqDays(1);
    setRepeatWeeklyWeeks(1);
    setRepeatMonthly(false);
    setDayOfMonth(1);
    setNumberOfMonths(1);
    setNumberOfMonthsMonthly(1);
    setMonthFreqOption("");
    setMonthFreqOptionDay("");
    setNumberOfMonthsMonthly(1);
    setRecurYears(1);
    setYearlyRecurMonth();
    setYearlyRecurDate();
    setYearlyOnDateDay();
    setYearlyFreqOption();
    setYearlyFreqOptionDay();
    setYearlyOnDayRecurMonth();
    setYearlyOnDate();
    setSelectedDay();
    setEndSpec("");
    setEndSelectedDay();
    setEndAfterOccurrences(1);
    setEditMode(false);
    setDays({
      Monday: false,
      Tuesday: false,
      Wednesday: false,
      Thursday: false,
      Friday: false,
      Saturday: false,
      Sunday: false,
    });
  };

  const handleSave = async () => {
    try {
      let budgetsAmount = 0;
      let amount = budgetData.amount;

      // Check if amount is defined and is a string
      if (amount && typeof amount === "string") {
        // Remove any non-numeric characters (except the decimal point)
        amount = amount.replace(/[^\d.-]/g, "");

        // Parse the sanitized amount
        let parsedAmount = parseFloat(amount);

        if (!isNaN(parsedAmount)) {
          if (transactionType === "Expenses") {
            budgetsAmount = (parsedAmount * -1).toFixed(2);
          } else {
            budgetsAmount = parsedAmount.toFixed(2);
          }
        } else {
          console.error("Parsed amount is NaN");
        }
      } else {
        console.error("amount is not a valid string:", amount);
      }
      //the repeat options to go here

      if (repeat) {
        const repeatOptions = {
          frequency: frequency,
          repeatFreq: repeatFreq,
          repeatFreqDays: repeatFreqDays,
          repeatWeeklyWeeks: repeatWeeklyWeeks,
          days: days,
          repeatMonthly: repeatMonthly,
          dayOfMonth: dayOfMonth,
          numberOfMonths: numberOfMonths,
          monthFreqOption: monthFreqOption,
          monthFreqOptionDay: monthFreqOptionDay,
          numberOfMonthsMonthly: numberOfMonthsMonthly,
          recurYears: recurYears,
          yearlyRecurMonth: yearlyRecurMonth,
          yearlyRecurDate: yearlyRecurDate,
          yearlyOnDateDay: yearlyOnDateDay,
          yearlyFreqOption: yearlyFreqOption,
          yearlyFreqOptionDay: yearlyFreqOptionDay,
          yearlyOnDayRecurMonth: yearlyOnDayRecurMonth,
          yearlyOnDate: yearlyOnDate,
          selectedDay: selectedDay,
          endSpec: endSpec,
          endSelectedDay: endSelectedDay,
          endAfterOccurrences: endAfterOccurrences,
        };
        const dataToSave = {
          user_id: budgetData.user_id || "default_user_id", // Replace 'default_user_id' with an appropriate default value
          currentYear: currentYear,
          startFinYr: startFinYr,
          name: budgetData.name || "",
          type: budgetData.type || "",
          category: budgetData.category || "",
          description: budgetData.description || "",
          date: budgetData.date || new Date(), // Set the default date to the current date
          amount: budgetsAmount || 0, // Assuming amount should be a number; default to 0
          repeat_options: repeatOptions || {}, // Default to an empty object if not provided
          growth_options: budgetData.growth_options || {}, // Default to an empty object if not provided
          extras: budgetData.extras || "", // Default to an empty string if not provided
        };
        // let data = {
        //   repeat: frequency,
        //   selectedDay: selectedDay,
        //   endSpec: endSpec,
        //   endSelectedDay: endSelectedDay,
        //   endAfterOccurrences: endAfterOccurrences,
        //   budgetData: budgetData,
        // };
        handleRecurrence(dataToSave);
        // setAllBudgets((prevBudgets) => [...prevBudgets, dataToSave]);
        handleCloseModal();
        resetVars();
      } else {
        // Ensure all fields have default values if not provided
        const dataToSave = {
          user_id: budgetData.user_id || "default_user_id", // Replace 'default_user_id' with an appropriate default value
          name: budgetData.name || "",
          type: budgetData.type || "",
          category: budgetData.category || "",
          description: budgetData.description || "",
          date: budgetData.date || new Date(), // Set the default date to the current date
          amount: budgetsAmount || 0, // Assuming amount should be a number; default to 0
          repeat_options: budgetData.repeat_options || {}, // Default to an empty object if not provided
          growth_options: budgetData.growth_options || {}, // Default to an empty object if not provided
          extras: budgetData.extras || "", // Default to an empty string if not provided
        };

        // This should write data to the database
        if (editMode) {
          await updateBudget(editId, dataToSave);
          setAllBudgets((prevBudgets) =>
            prevBudgets.map((budget) =>
              budget.id === editId ? { ...budget, ...dataToSave } : budget
            )
          );
          setEditMode(false);
        } else {
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

          // Update the state with the new budget
          setAllBudgets((prevBudgets) => [...prevBudgets, dataToSave]);
        }
        handleCloseModal();
        resetVars();
      }
    } catch (error) {
      console.error("Error saving budget:", error);
    }
  };

  const handleDelete = async (deleteId) => {
    await deleteBudget(editId);

    // Update the state to remove the deleted budget
    setAllBudgets((prevBudgets) =>
      prevBudgets.filter((budget) => budget.id !== editId)
    );
    handleCloseModal();
    resetVars();
  };

  const handleOpenModal = (date, index) => {
    setCurrentDate(date);
    const dateObj = new Date(date);
    // Extract the current month from the dateObj-
    // current month is the month on which the user is currently positioned in the budget
    const currentMonth = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
    // Set the currentMonth state
    setCurrentMonth(currentMonth);
    setSelectedDay(dateObj);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentDate(null);
    resetVars();
  };

  const getDateFromObject = ({ day, month, year }) => {
    const monthIndex = months.indexOf(month); // Convert month name to index
    return new Date(year, monthIndex, day);
  };

  const getRepeatFrequencyDetails = (frequency) => {
    switch (frequency) {
      case "daily":
        return (
          <div className="repeat-details">
            <div className="repeat-details-info">
              <label htmlFor="everyDay">
                <input
                  type="radio"
                  id="everyDay"
                  name="everyDay"
                  value="everyDay"
                  checked={repeatFreq === "everyDay"}
                  onChange={(e) => setRepeatFreq("everyDay")}
                />
                every day
              </label>
              {repeatFreq === "everyDay" && (
                <div style={{ marginLeft: "1rem" }}>
                  <label>days </label>
                  <input
                    style={{ width: "3rem" }}
                    type="number"
                    value={repeatFreqDays}
                    onChange={(e) => setRepeatFreqDays(e.target.value)}
                  ></input>
                </div>
              )}
            </div>
            <label htmlFor="everyWeekDay" className="repeat-details-info">
              <input
                type="radio"
                id="everyWeekDay"
                name="everyWeekDay"
                value="everyWeekDay"
                checked={repeatFreq === "everyWeekDay"}
                onChange={(e) => setRepeatFreq("everyWeekDay")}
              />
              every weekday
            </label>
          </div>
        );
      case "weekly":
        return (
          <div className="repeat-details">
            <div className="repeat-details-info">
              <label>Repeat every </label>
              <input
                style={{
                  width: "3rem",
                  margin: "0 0.5rem 0 0.5rem",
                  fontSize: "0.8rem",
                }}
                type="number"
                value={repeatWeeklyWeeks}
                onChange={(e) => setRepeatWeeklyWeeks(e.target.value)}
              ></input>
              <label> week(s) on</label>
            </div>
            {Object.keys(days).map((day) => (
              <div
                key={day}
                style={{ marginLeft: "0.5rem" }}
                className="repeat-details-info"
              >
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
          <div className="repeat-details">
            <div
              style={{
                opacity: repeatMonthly === "day" ? "1" : "0.5",
                display: "flex",
                alignItems: "center",
              }}
              className="repeat-details-info"
            >
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
                style={{ width: "2rem", margin: "0 0.5rem 0 0.5rem" }}
                type="number"
                id="dayofmonth"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(e.target.value)}
              ></input>
              <label htmlFor="dayofmonth">of every</label>
              <input
                style={{ width: "2rem", margin: "0 0.5rem 0 0.5rem" }}
                type="number"
                id="numberofmonths"
                value={numberOfMonths}
                onChange={(e) => handleChangeNumberOfMonths(e)}
              ></input>
              <label htmlFor="numberofmonths">WWWmonth(s)</label>
            </div>
            <div
              style={{
                opacity: repeatMonthly === "the" ? "1" : "0.5",
                display: "flex",
                alignItems: "center",
              }}
              className="repeat-details-info"
            >
              <input
                type="radio"
                id="repeatMonthlyThe"
                name="repeatMonthlyThe"
                value="the"
                checked={repeatMonthly === "the"}
                onChange={(e) => setRepeatMonthly("the")}
              />
              <label htmlFor="repeatMonthlyThe">The</label>
              <select
                style={{ width: "fit-content", margin: "0 0.5rem 0 0.5rem" }}
                onChange={(e) => setMonthFreqOption(e.target.value)}
              >
                <option value="">Select frequency</option>
                {monthFreq.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                style={{ width: "fit-content", margin: "0 0.5rem 0 0" }}
                onChange={(e) => setMonthFreqOptionDay(e.target.value)}
              >
                <option value="">Select day</option>
                {daysOfWeek.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              of every
              <input
                style={{ width: "3rem", margin: "0 0.5rem 0 0.5rem" }}
                type="number"
                id="numberofmonthsmonthly"
                value={numberOfMonthsMonthly}
                onChange={(e) => setNumberOfMonthsMonthly(e.target.value)}
              ></input>
              <label htmlFor="numberofmonthsmonthly">month(s)</label>
            </div>
          </div>
        );
      case "yearly":
        return (
          <div className="repeat-details">
            <div
              className="repeat-details-info"
              style={{ display: "flex", alignItems: "center" }}
            >
              <label>Recur every </label>
              <input
                style={{ width: "2rem", margin: "0 0.5rem 0 0.5rem" }}
                type="number"
                value={recurYears}
                onChange={(e) => setRecurYears(e.target.value)}
              ></input>
              <label> year(s)</label>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                // flexWrap: "wrap",
                fontSize: "0.8rem",
                gap: "0.5rem", // Add some gap between items for better spacing
              }}
            >
              <label htmlFor="onDate" style={{ fontSize: "0.8rem" }}>
                <input
                  type="radio"
                  id="onDate"
                  name="onDate"
                  value="onDate"
                  checked={yearlyOnDate === "onDate"}
                  onChange={(e) => handleOnDate(e)}
                />
                On:
              </label>
              <button
                onClick={toggleThirdPickerVisibility}
                style={{
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  whiteSpace: "nowrap",
                }}
              >
                {formatDayMonth(yearlyRecurDate)}
              </button>

              {isThirdPickerVisible && (
                <div className="picker-popup">
                  <DayPicker
                    mode="single"
                    selected={yearlyRecurDate}
                    onSelect={handleYearlyRecurDate}
                    month={currentMonth}
                    onMonthChange={(month) => setCurrentMonth(month)}
                    // month={yearlyRecurDate}
                  />
                </div>
              )}

              {/* <select
                style={{
                  width: "fit-content",
                  margin: "0 0.5rem 0 0.5rem",
                  fontSize: "0.8rem",
                }}
                onChange={(e) => setYearlyRecurMonth(e.target.value)}
              >
                <option value="">Select month</option>
                {months.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <input
                style={{ maxWidth: "3rem" }}
                type="number"
                placeholder={currentDay}
                value={yearlyOnDateDay}
                onChange={(e) => handleYearlyOnDateDay(e)}
              /> */}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "center",
                fontSize: "0.8rem",
                // gap: "0.5rem", // Add some gap between items for better spacing
              }}
            >
              <label
                htmlFor="onDay"
                style={{ display: "flex", alignItems: "center" }}
              >
                <input
                  type="radio"
                  id="onDay"
                  name="onDay"
                  value="onDay"
                  checked={yearlyOnDate === "onDay"}
                  onChange={(e) => handleOnDate(e)}
                />
                On the:
              </label>
              <select
                style={{
                  width: "fit-content",
                  margin: "0 0.5rem 0 0.5rem",
                  fontSize: "0.8rem",
                }}
                onChange={(e) => setYearlyFreqOption(e.target.value)}
              >
                <option value="">Select frequency</option>
                {monthFreq.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                style={{
                  width: "fit-content",
                  margin: "0 0.5rem 0 0",
                  fontSize: "0.8rem",
                }}
                onChange={(e) => setYearlyFreqOptionDay(e.target.value)}
              >
                <option value="">Select day</option>
                {daysOfYearlyFreq.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <label>of</label>
              <select
                style={{
                  width: "fit-content",
                  margin: "0 0.5rem 0 0.5rem",
                  fontSize: "0.8rem",
                }}
                onChange={(e) => setYearlyOnDayRecurMonth(e.target.value)}
              >
                <option value="">Select month</option>
                {months.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getDaysRecords = (formattedDate) => {
    const budgetsForDate = allBudgets.filter(
      (budget) => formatDate(budget.date, "DD MMM YYYY") === formattedDate
    );
    if (budgetsForDate.length === 0) {
      return null; // No records found for the given date
    }
    return budgetsForDate;
  };

  const setVarsForEdit = (date, item, recurring) => {
    setCurrentDate(date);
    setIsModalOpen(true);
    setEditMode(true);
    setEditId(item.id);
    setBudgetData({
      user_id: currentUser,
      budgetName: budgetName,
      date: formatDate(item.date, "DD MMM YYYY"),
      description: item.description,
      category: item.category,
      amount: Math.abs(item.amount),
      repeat_options: item.repeat_options,
      growth_options: item.growth_options,
      extras: item.extras,
    });
    if (recurring) {
      if (
        ["daily", "weekly", "monthly", "yearly"].includes(
          item?.repeat_options?.frequency
        )
      ) {
        setRepeat(true);
        setFrequency(item.repeat_options.frequency);
        setRepeatFreq(item.repeat_options.repeatFreq);
        setRepeatFreqDays(item.repeat_options.repeatFreqDays);
        setRepeatWeeklyWeeks(item.repeat_options.repeatWeeklyWeeks);
        setRepeatMonthly(item.repeat_options.repeatMonthly);
        setDayOfMonth(item.repeat_options.dayOfMonth);
        setNumberOfMonths(item.repeat_options.numberOfMonths);
        setMonthFreqOption(item.repeat_options.monthFreqOption);
        setMonthFreqOptionDay(item.repeat_options.monthFreqOptionDay);
        setNumberOfMonthsMonthly(item.repeat_options.numberOfMonthsMonthly);
        setRecurYears(item.repeat_options.recurYears);
        setYearlyRecurMonth(item.repeat_options.yearlyRecurMonth);
        setYearlyOnDateDay(item.repeat_options.yearlyOnDateDay);
        setYearlyFreqOption(item.repeat_options.yearlyFreqOption);
        setYearlyFreqOptionDay(item.repeat_options.yearlyFreqOptionDay);
        setYearlyOnDayRecurMonth(item.repeat_options.yearlyOnDayRecurMonth);
        setYearlyOnDate(item.repeat_options.yearlyOnDate);
        setSelectedDay(item.repeat_options.selectedDay);
        setEndSpec(item.repeat_options.endSpec);
        setEndSelectedDay(item.repeat_options.endSelectedDay);
        setEndAfterOccurrences(item.repeat_options.endAfterOccurrences);
      } else setRepeat(false);
    }
    // else {
    //   setRepeat(false);
    //   setFrequency("");
    //   setRepeatFreq("");
    //   setRepeatFreqDays(1);
    //   setRepeatWeeklyWeeks(1);
    //   setRepeatMonthly(false);
    //   setDayOfMonth(1);
    //   setNumberOfMonths(1);
    //   setMonthFreqOption("");
    //   setMonthFreqOptionDay("");
    //   setNumberOfMonthsMonthly(1);
    //   setRecurYears(1);
    //   setYearlyRecurMonth();
    //   setYearlyOnDateDay();
    //   setYearlyFreqOption();
    //   setYearlyFreqOptionDay();
    //   setYearlyOnDayRecurMonth();
    //   setYearlyOnDate();
    //   setSelectedDay();
    //   setEndSpec("");
    //   setEndSelectedDay();
    //   setEndAfterOccurrences(1);
    // }
  };

  const handleEditSeries = (date, item) => {
    setVarsForEdit(date, item, true);
    setEditSeriesConfirm({ action: false });
  };

  const handleEditSingle = (date, item) => {
    setVarsForEdit(date, item, false);
    setEditSeriesConfirm({ action: false });
  };

  const handleEditRec = (date, item, index) => {
    //check if transaction is recurring- ask if whole series to be edited or this instance
    if (
      item?.repeat_options?.frequency &&
      ["daily", "weekly", "monthly", "yearly"].includes(
        item?.repeat_options?.frequency
      )
    ) {
      setEditSeriesConfirm({ action: true, date: date, item: item });
    } else setVarsForEdit(date, item, item.repeat);
    // setCurrentDate(date);
    // setIsModalOpen(true);
    // setEditMode(true);
    // setEditId(item.id);
    // setBudgetData({
    //   user_id: currentUser,
    //   budgetName: budgetName,
    //   date: formatDate(item.date, "DD MMM YYYY"),
    //   description: item.description,
    //   category: item.category,
    //   amount: Math.abs(item.amount),
    //   repeat_options: item.repeat_options,
    //   growth_options: item.growth_options,
    //   extras: item.extras,
    // });
    // if (
    //   ["daily", "weekly", "monthly", "yearly"].includes(
    //     item.repeat_options.frequency
    //   )
    // ) {
    //   setRepeat(true);
    //   setFrequency(item.repeat_options.frequency);
    //   setRepeatFreq(item.repeat_options.repeatFreq);
    //   setRepeatFreqDays(item.repeat_options.repeatFreqDays);
    //   setRepeatWeeklyWeeks(item.repeat_options.repeatWeeklyWeeks);
    //   setRepeatMonthly(item.repeat_options.repeatMonthly);
    //   setDayOfMonth(item.repeat_options.dayOfMonth);
    //   setNumberOfMonths(item.repeat_options.numberOfMonths);
    //   setMonthFreqOption(item.repeat_options.monthFreqOption);
    //   setMonthFreqOptionDay(item.repeat_options.monthFreqOptionDay);
    //   setNumberOfMonthsMonthly(item.repeat_options.numberOfMonthsMonthly);
    //   setRecurYears(item.repeat_options.recurYears);
    //   setYearlyRecurMonth(item.repeat_options.yearlyRecurMonth);
    //   setYearlyOnDateDay(item.repeat_options.yearlyOnDateDay);
    //   setYearlyFreqOption(item.repeat_options.yearlyFreqOption);
    //   setYearlyFreqOptionDay(item.repeat_options.yearlyFreqOptionDay);
    //   setYearlyOnDayRecurMonth(item.repeat_options.yearlyOnDayRecurMonth);
    //   setYearlyOnDate(item.repeat_options.yearlyOnDate);
    //   setSelectedDay(item.repeat_options.selectedDay);
    //   setEndSpec(item.repeat_options.endSpec);
    //   setEndSelectedDay(item.repeat_options.endSelectedDay);
    //   setEndAfterOccurrences(item.repeat_options.endAfterOccurrences);
    // }
  };

  useEffect(() => {
    const checkAndSetBudgetName = async () => {
      const savedBudgetName = localStorage.getItem("currentBudgetName");
      //check for existence of savedBudgetName on database
      if (savedBudgetName) {
        try {
          const budgetDetail = await db.budgetdetails
            .where("name")
            .equals(savedBudgetName)
            .first();
          if (budgetDetail) {
            setCurrentBudgetName(savedBudgetName);
            setStartFinYr(budgetDetail.startmonth);
            setCurrentYear(budgetDetail.year);
          } else {
            console.warn("Budget name not found in database:", savedBudgetName);
            setCurrentBudgetName(null);
            localStorage.removeItem("currentBudgetName"); // Optionally clear invalid budget name
          }
        } catch (error) {
          console.error("Failed to fetch budget detail from database:", error);
        }
      }
    };
    checkAndSetBudgetName();
  }, []);

  const handleIncExp = (event) => {
    setTransactionType(event.target.value);
  };

  const handleFrequency = (e) => {
    setFrequency(e.target.value);
  };

  const handleEndSpec = (e) => {
    setEndSpec(e.target.value);
    if (e.target.value === "endBy" && !endSelectedDay) {
      setIsSecondPickerVisible(true);
    }
  };

  const handleYearlyOnDateDay = (e) => {
    setYearlyOnDateDay(e.target.value);
  };

  const handleOnDate = (e) => {
    setYearlyOnDate(e.target.value);
  };

  // const handleOnDay = (e) => {
  //   setYearlyOnDay(e.target.value);
  // };

  const handleDaySelect = (day) => {
    setSelectedDay(day);
    setIsPickerVisible(false); // Close the picker when a date is selected
  };

  const handleEndDaySelect = (day) => {
    setEndSelectedDay(day);
    setIsSecondPickerVisible(false); // Hide picker after selection
  };

  const handleYearlyRecurDate = (day) => {
    setYearlyRecurDate(day);
    setIsThirdPickerVisible(false);
  };

  const handleEndAfterOccurrences = (e) => {
    setEndAfterOccurrences(e.target.value);
  };

  const handleTestrepeat = (repeat) => {
    setRepeat(!repeat);
  };

  return (
    <div>
      {!currentBudgetName || currentBudgetName === "" ? (
        <BudgetSelect />
      ) : (
        <div style={{ marginLeft: "1rem" }}>
          <div>
            <span>Current budget: {currentBudgetName}</span>
            <br />
            <span>Current year: {currentYear}</span>
            <br />
            <span>Start month: {startFinYr}</span>
          </div>
          <div className="table-header">
            <table className="table">
              <thead>
                <tr>
                  <th className="date">Date</th>
                  <th className="day">Day</th>
                  <th className="description">Description</th>
                  <th className="category">Category</th>
                  <th className="dr">Dr</th>
                  <th className="cr">Cr</th>
                  <th className="balance">Balance</th>
                </tr>
              </thead>
            </table>
          </div>
          <div className="table-body">
            <table className="table">
              <tbody>
                <tr>
                  <td className="date"></td>
                  <td className="day"></td>
                  <td className="description">Opening Balance</td>
                  <td className="category"></td>
                  <td className="dr"></td>
                  <td className="cr"></td>
                  <td className="balance">XXXXXXXX</td>
                </tr>
                {calendar.map((dateObj, index) => {
                  let dayRecords = [];
                  const date = getDateFromObject(dateObj);
                  dayRecords = getDaysRecords(formatDate(date, "DD MMM YYYY"));
                  return (
                    <tr key={index}>
                      <td className="date">
                        {formatDate(date, "DD MMM YYYY")}
                      </td>
                      <td className="day">{getDayOfWeek(date)}</td>
                      <td
                        className="description"
                        style={{ position: "relative" }}
                      >
                        <div
                          style={{
                            minWidth: "60px",
                            minHeight: "20px",
                          }}
                        >
                          {dayRecords?.map((item, index) => (
                            <div
                              className="dayRecords"
                              style={{ cursor: "pointer" }}
                              key={index}
                              onClick={() =>
                                handleEditRec(item.date, item, index)
                              }
                            >
                              {item.description}
                            </div>
                          ))}
                          {dayRecords?.length > 0 ? (
                            <button
                              className="budget-add-button"
                              style={{ cursor: "pointer" }}
                              onClick={() =>
                                handleOpenModal(formatDate(date, "DD MMM YYYY"))
                              }
                            >
                              <FaPlus />
                            </button>
                          ) : (
                            <div
                              className="description"
                              style={{
                                minHeight: "1.25rem",
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                handleOpenModal(formatDate(date, "DD MMM YYYY"))
                              }
                            ></div>
                          )}
                        </div>
                      </td>
                      <td className="category">
                        {dayRecords?.map((item, index) => (
                          <div className="dayRecords" key={index}>
                            {item.category}
                          </div>
                        ))}
                      </td>
                      <td className="dr">
                        {dayRecords?.map((item, index) => (
                          <div
                            className="dayRecords"
                            key={index}
                            style={{ minHeight: "1em" }}
                          >
                            {item.amount <= 0 && (item.amount * -1).toFixed(2)}
                          </div>
                        ))}
                      </td>
                      <td className="cr">
                        {dayRecords?.map((item, index) => (
                          <div
                            className="dayRecords"
                            key={index}
                            style={{ minHeight: "1em" }}
                          >
                            {item.amount >= 0 && item.amount}
                          </div>
                        ))}
                      </td>
                      <td className="balance">0</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* <div
            style={{
              display: "grid",
              gridTemplateColumns: "5rem 4rem 12rem 10rem 4rem 4rem 4rem",
              fontSize: "0.9rem",
              fontWeight: "bold",
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
                      gridTemplateColumns:
                        "5rem 4rem 12rem 5rem 4rem 4rem 4rem",
                    }}
                  >
                    <span className="date">
                      {formatDate(date, "DD MMM YYYY")}
                    </span>
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
                              onClick={() =>
                                handleEditRec(item.date, item, index)
                              }
                            >
                              {item.description}
                            </div>
                          )
                        )}
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
                          (item, index) => (
                            <div key={index}>{item.category}</div>
                          )
                        )}
                    </span>
                    <span>
                      {getDaysRecords(formatDate(date, "DD MMM YYYY")) &&
                        getDaysRecords(formatDate(date, "DD MMM YYYY")).map(
                          (item, index) => <div key={index}>{item.amount}</div>
                        )}
                    </span>
                    <span>0</span>
                    <span>0</span>
                  </div>
                </div>
              );
            })}
          </div> */}
        </div>
      )}
      {isModalOpen && (
        <Modals
          title="Budget entry"
          noBckgrnd={true}
          onClickOutside={false}
          onClose={() => handleCloseModal()}
          footer={
            <div style={{ display: "flex", flexDirection: "row" }}>
              <button
                className="main_buttons"
                type="button"
                onClick={() => {
                  handleDelete();
                }}
              >
                Delete
              </button>
              <button
                className="main_buttons"
                type="button"
                disabled={
                  !budgetData.description ||
                  !budgetData.category ||
                  !transactionType ||
                  (repeat && !frequency) ||
                  (frequency === "daily" && !repeatFreq) ||
                  (repeatFreq === "everyDay" && repeatFreqDays <= 0) ||
                  (frequency === "weekly" &&
                    (repeatWeeklyWeeks <= 0 ||
                      Object.values(days).every((day) => !day))) || // Check if all days are false
                  (frequency === "monthly" && !repeatMonthly) ||
                  (frequency === "monthly" &&
                    repeatMonthly === "day" &&
                    (dayOfMonth <= 0 || numberOfMonths <= 0)) ||
                  (frequency === "monthly" &&
                    repeatMonthly === "the" &&
                    (!monthFreqOption ||
                      !monthFreqOptionDay ||
                      numberOfMonthsMonthly <= 0)) ||
                  (frequency === "yearly" && recurYears <= 0) ||
                  (frequency === "yearly" && !yearlyOnDate) ||
                  (frequency === "yearly" &&
                    yearlyOnDate === "onDate" &&
                    !yearlyRecurDate) ||
                  (frequency === "yearly" &&
                    yearlyOnDate === "onDay" &&
                    (!yearlyFreqOption ||
                      !yearlyFreqOptionDay ||
                      !yearlyOnDayRecurMonth)) ||
                  //the range
                  (repeat && !selectedDay) ||
                  (repeat && !endSpec) ||
                  (repeat && endSpec === "endBy" && !endSelectedDay) ||
                  (repeat && endSpec === "endAfter" && endAfterOccurrences <= 0)
                }
                onClick={() => {
                  handleSave();
                }}
              >
                Submit
              </button>
            </div>
          }
        >
          <div
            style={{ overflow: "auto", fontSize: "0.8rem", maxHeight: "75vh" }}
          >
            {editMode && (
              <div
                style={{
                  fontSize: "1.2rem",
                  textAlign: "center",
                  backgroundColor: "cornflowerblue",
                  color: "white",
                }}
              >
                EDIT Mode
              </div>
            )}
            <div>current user: {currentUser}</div>
            <div>current budget: {currentBudgetName}</div>
            <div>{currentDate}</div>
            {/* <br /> */}
            <div className="form">
              <div className="form-field" style={{ fontSize: "0.8rem" }}>
                <label>
                  Description:
                  <input
                    ref={descriptionInputRef}
                    style={{ width: "15rem" }}
                    type="text"
                    placeholder="description"
                    value={budgetData.description}
                    onChange={(e) =>
                      handleInputChange(
                        currentDate,
                        "description",
                        e.target.value
                      )
                    }
                  ></input>
                </label>
              </div>
              <div className="form-field">
                <label>
                  Amount:
                  <input
                    type="number"
                    placeholder="amount"
                    value={budgetData.amount}
                    onChange={(e) =>
                      handleInputChange(currentDate, "amount", e.target.value)
                    }
                  />
                </label>
              </div>
              <div
                className="form-field"
                style={{ width: "15rem", marginBottom: "0.5rem" }}
              >
                <label>
                  Category:
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
                </label>
              </div>
            </div>
            <div>
              <label htmlFor="income">
                <input
                  type="radio"
                  id="income"
                  name="transactionType"
                  value="Income"
                  checked={transactionType === "Income"}
                  onChange={handleIncExp}
                />
                Income
              </label>
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              <label htmlFor="expenses">
                <input
                  type="radio"
                  id="expenses"
                  name="transactionType"
                  value="Expenses"
                  checked={transactionType === "Expenses"}
                  onChange={handleIncExp}
                />
                Expenses
              </label>
            </div>
            <div>
              <label>Repeat: </label>{" "}
              <input
                type="checkbox"
                checked={repeat}
                onChange={(e) => handleTestrepeat(repeat)}
              />
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
                    onChange={(e) => handleFrequency(e)}
                  />
                  <label htmlFor="daily">Daily</label>
                  {frequency === "daily" &&
                    getRepeatFrequencyDetails(frequency)}
                </div>
                <div>
                  <input
                    type="radio"
                    id="weekly"
                    name="frequency"
                    value="weekly"
                    checked={frequency === "weekly"}
                    onChange={(e) => handleFrequency(e)}
                  />
                  <label htmlFor="weekly">Weekly</label>
                  {frequency === "weekly" &&
                    getRepeatFrequencyDetails(frequency)}
                </div>
                <div>
                  <input
                    type="radio"
                    id="monthly"
                    name="frequency"
                    value="monthly"
                    checked={frequency === "monthly"}
                    onChange={(e) => handleFrequency(e)}
                  />
                  <label htmlFor="monthly">Monthly</label>
                  {frequency === "monthly" &&
                    getRepeatFrequencyDetails(frequency)}
                </div>
                <div>
                  <input
                    type="radio"
                    id="yearly"
                    name="frequency"
                    value="yearly"
                    checked={frequency === "yearly"}
                    onChange={(e) => handleFrequency(e)}
                  />
                  <label htmlFor="yearly">Yearly</label>
                  {frequency === "yearly" &&
                    getRepeatFrequencyDetails(frequency)}
                </div>
                <hr />
                <div>Range of recurrence</div>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      flexWrap: "nowrap",
                      alignItems: "flex-start", // Aligns items vertically in the center
                    }}
                  >
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center", // Aligns text and button on the same line
                        marginRight: "10px", // Adds space between the label and the picker
                      }}
                    >
                      Start:
                      <button
                        onClick={togglePickerVisibility}
                        style={{
                          cursor: "pointer",
                          fontSize: "0.8rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDateRepeat(selectedDay)}
                      </button>
                    </label>
                    {isPickerVisible && (
                      <div className="picker-popup">
                        <DayPicker
                          mode="single"
                          selected={selectedDay}
                          onSelect={handleDaySelect}
                          month={currentMonth}
                          onMonthChange={(month) => setCurrentMonth(month)}
                          // month={selectedDay || currentDate}
                        />
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="radio"
                        id="endBy"
                        name="endSpec"
                        value="endBy"
                        checked={endSpec === "endBy"}
                        onChange={(e) => handleEndSpec(e)}
                      />
                      <label htmlFor="endBy">End by:</label>
                      <button
                        onClick={toggleSecondPickerVisibility}
                        style={{ cursor: "pointer", fontSize: "0.8rem" }}
                      >
                        {formatDateRepeat(endSelectedDay)}
                      </button>
                      {isSecondPickerVisible && (
                        <div className="picker-popup">
                          <DayPicker
                            mode="single"
                            selected={endSelectedDay}
                            onSelect={handleEndDaySelect}
                            // month={endSelectedDay || currentDate}
                            month={currentMonth}
                            onMonthChange={(month) => setCurrentMonth(month)}
                          />
                        </div>
                      )}
                      {/* {endSpec === "endBy" && getRepeatFrequencyDetails(frequency)} */}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "nowrap",
                        alignItems: "flex-start", // Aligns items vertically in the center
                      }}
                    >
                      <input
                        type="radio"
                        id="endAfter"
                        name="endSpec"
                        value="endAfter"
                        checked={endSpec === "endAfter"}
                        onChange={(e) => handleEndSpec(e)}
                      />
                      <label
                        htmlFor="endAfter"
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          flexWrap: "nowrap",
                          alignItems: "flex-start", // Aligns items vertically in the center
                          whiteSpace: "nowrap",
                        }}
                      >
                        End after:
                        <input
                          style={{
                            width: "2rem",
                            margin: "0 0.5rem 0 0.5rem",
                            fontSize: "0.8rem",
                          }}
                          type="number"
                          placeholder=""
                          value={endAfterOccurrences}
                          onChange={(e) => handleEndAfterOccurrences(e)}
                        />
                        occurrences
                      </label>
                    </div>
                    <div>
                      <input
                        type="radio"
                        id="noEndDate"
                        name="endSpec"
                        value="noEndDate"
                        checked={endSpec === "noEndDate"}
                        onChange={(e) => handleEndSpec(e)}
                      />
                      <label htmlFor="noEndDate">No end date</label>
                      {/* {endSpec === "noEndDate" &&
                    getRepeatFrequencyDetails(frequency)} */}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* {frequency && getRepeatFrequencyDetails(frequency)} */}
        </Modals>
      )}
      {editSeriesConfirm.action && (
        <Modals
          title="Edit Recurring item"
          noBckgrnd={true}
          onClose={() => setEditSeriesConfirm({ action: false })}
          footer={
            <div>
              <button
                // className={"UI-button-service"}
                type="button"
                onClick={() =>
                  handleEditSeries(
                    editSeriesConfirm.date,
                    editSeriesConfirm.item
                  )
                }
              >
                Edit series
              </button>
              <button
                // className={"UI-button-service"}
                type="button"
                onClick={() =>
                  handleEditSingle(
                    editSeriesConfirm.date,
                    editSeriesConfirm.item
                  )
                }
              >
                Edit this item only
              </button>
            </div>
          }
        >
          <pre>{RecurEditText}</pre>
        </Modals>
      )}
    </div>
  );
};

export default DailyBudget;
