import React, { useState, useEffect, useContext, useRef } from "react";
import dayjs from "dayjs";
import Modals from "../utils/Modals";
import "../styles/Budget.css";
import styles from "../styles/Budget.module.css";
import "../styles/Modals.css";
import "../styles/MainStyles.css";
import db from "../store/Dexie";
import {
  getAllBudgets,
  getAllCategories,
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
import { UserContext } from "../contexts/UserContext";
import CategoryModal from "./categories/CategoryModal";

const CustomCaption = ({ date, localeUtils }) => {
  const monthName = date.toLocaleString("default", { month: "long" });
  return <div className="custom-caption">{monthName}</div>;
};

const DailyBudget = () => {
  const [currentYear, setCurrentYear] = useState();
  const [startFinYr, setStartFinYr] = useState();
  // const { currentUser } = useDataContext();
  const { user } = useContext(UserContext);
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
  const [openingBalance, setOpeningBalance] = useState();
  // const [firstItem, setFirstItem] = useState(true);
  const [budgetData, setBudgetData] = useState({
    user_id: user.id,
    budgetName: "",
    date: currentDate,
    description: "",
    category: "",
    transactiontype: "expenses",
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
  const [repeatMonthly, setRepeatMonthly] = useState();
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
  const [allCategories, setAllCategories] = useState([]);
  const { currentBudgetName, setCurrentBudgetName } = useDataContext();
  // const [transactionType, setTransactionType] = useState("expenses");
  const [recurYears, setRecurYears] = useState(1);
  const [yearlyRecurMonth, setYearlyRecurMonth] = useState();
  const [yearlyRecurDate, setYearlyRecurDate] = useState();
  const [yearlyOnDateDay, setYearlyOnDateDay] = useState();
  const [yearlyFreqOption, setYearlyFreqOption] = useState("first");
  const daysOfYearlyFreq = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
    "day",
    "weekday",
    "weekend_day",
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
  const dayPickerRef = useRef();
  const daySecondPickerRef = useRef();
  const dayThirdPickerRef = useRef();
  const currentDateRef = useRef(null);
  const [continuousBalance, setContinuousBalance] = useState(0);
  const [startBalance, setStartBalance] = useState(null);
  const continuousBalanceRef = useRef(null); // Ref to hold the continuous balance
  const initialCalculationDoneRef = useRef(false); // Flag to ensure single execution
  const [calculatedBalances, setCalculatedBalances] = useState([]); // To store balances after calculation
  const [openCatModal, setOpenCatModal] = useState(false);
  // useEffect(() => {
  //   if (currentDateRef.current) {
  //     currentDateRef.current.scrollIntoView({
  //       behavior: "auto",
  //       block: "start",
  //     });
  //   }
  // }, [calendar]);

  // useEffect(() => {
  //   if (lastViewedDateRef.current) {
  //     lastViewedDateRef.current.scrollIntoView({
  //       behavior: "auto",
  //       block: "start",
  //     });
  //   }
  // }, [calendar]);

  useEffect(() => {
    //getExistingCategories from dbase
    const getTheCategories = async () => {
      try {
        let catRecs = await getAllCategories();
        setAllCategories(catRecs);
      } catch (error) {
        console.error("Error retrieving categories:", error);
      }
    };
    getTheCategories();
  }, [openCatModal]);

  const SearchableDropdown = ({ allCategories }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const sortedCategories = [...allCategories].sort((a, b) =>
      a.category_description.localeCompare(b.category_description)
    );

    const handleSearchChange = (e) => {
      setSearchTerm(e.target.value);
    };

    const filteredCategories = sortedCategories.filter((catRec) =>
      catRec.category_description
        .toLowerCase()
        .startsWith(searchTerm.toLowerCase())
    );

    return (
      <div style={{ width: "15rem", marginBottom: "0.5rem" }}>
        <label>
          Category:
          <input
            style={{ display: "none" }}
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <select
            onChange={(e) => {
              const selectedValue = e.target.value;
              if (selectedValue === "new") {
                handleCreateNewCategory();
              } else {
                handleInputChange(currentDate, "category", selectedValue);
              }
            }}
            value={budgetData.category || ""}
          >
            {filteredCategories.map((catRec) => (
              // <option key={catRec.id} value={catRec.id}>
              <option key={catRec.id} value={catRec.category_description}>
                {catRec.category_description}
              </option>
            ))}
            <option value="new" style={{ fontWeight: "bold" }}>
              New Category
            </option>{" "}
            <option disabled value="">
              -- select an option --{" "}
            </option>
          </select>
        </label>
      </div>
    );
  };

  const convertToFullDateString = (dateStr) => {
    // Create a Date object from the string
    const [day, month, year] = dateStr.split(" ");
    const date = new Date(`${month} ${day}, ${year}`);

    // Convert to full string format
    return date.toString();
  };

  useEffect(() => {
    if (currentDate) {
      // const fullDateString = convertToFullDateString(currentDate);
      // const dateObject = new Date(fullDateString);
      setYearlyRecurDate(currentDate);
    }
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
    setCurrentDate(new Date());
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

  const [lastViewedDate, setLastViewedDate] = useState(() => {
    return (
      sessionStorage.getItem("lastViewedDate") ||
      formatDate(new Date(), "DD MMM YYYY")
    );
  });
  const lastViewedDateRef = useRef(null);

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
      date: date || new Date(),
      user_id: prevData.user_id || user.id,
    }));
  };

  const resetVars = () => {
    setBudgetData({
      user_id: user.id,
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
    setRepeatMonthly();
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

  // Calculate balances
  const calcBalances = (item) => {
    if (
      !item ||
      item.amount === 0 ||
      item.amount === null ||
      isNaN(parseFloat(item.amount))
    ) {
      return continuousBalanceRef.current.toFixed(2);
    }
    if (item !== null && continuousBalanceRef.current !== null) {
      let amountNum = parseFloat(item.amount);
      if (item.transactiontype === "expenses")
        continuousBalanceRef.current -= amountNum;
      else continuousBalanceRef.current += amountNum;
    }
    return continuousBalanceRef?.current?.toFixed(2);
  };

  useEffect(() => {
    if (!initialCalculationDoneRef?.current && calendar?.length > 0) {
      const balances = calendar?.map((dateObj) => {
        const date = getDateFromObject(dateObj);
        const dayRecords = getDaysRecords(formatDate(date, "DD MMM YYYY"));
        if (!dayRecords || dayRecords?.length === 0) {
          // If no records, return an array with the current balance
          return [continuousBalanceRef.current.toFixed(2)];
          // [openingBalance.toFixed(2)];
          // return [continuousBalanceRef?.current.toFixed(2)];
        }
        return dayRecords?.map((item) => calcBalances(item));
      });

      setCalculatedBalances(balances);
      initialCalculationDoneRef.current = true; // Prevent further calculations
    }
  }, [calendar, startBalance, allBudgets]); // Trigger calculation only when calendar or start balance changes

  const getOpeningBalance = async () => {
    // Fetch the opening balance from budgetdetails table for the relevant account
    try {
      let temp = parseFloat(user.id);
      // let tempacc = parseFloat(accountId);
      const bal = await db.budgetdetails
        .where({ user_id: temp, name: currentBudgetName })
        .first();
      return parseFloat(bal.openingbalance);
    } catch (error) {
      console.error("Error fetching opening balance:", error);
      return null; // or handle the error as needed
    }
  };

  const handleSave = async () => {
    try {
      let budgetsAmount = 0;
      let amount = budgetData.amount;
      if (typeof amount !== "string") amount = amount.toString();
      // Check if amount is defined and is a string, and allow '0' as a valid amount
      if (amount !== undefined && typeof amount === "string") {
        // Remove any non-numeric characters (except the decimal point)
        amount = amount.replace(/[^\d.-]/g, "");

        // Parse the sanitized amount
        let parsedAmount = parseFloat(amount);

        if (!isNaN(parsedAmount)) {
          budgetsAmount = parsedAmount.toFixed(2);
        } else {
          console.error("Parsed amount is NaN");
        }
      } else {
        console.error("amount is not a valid string:", amount);
      }
      //the repeat options to go here

      if (repeat) {
        let repeatOptions = null;
        if (frequency === "daily") {
          repeatOptions = {
            frequency: frequency,
            endSpec: endSpec,
            endAfterOccurrences: endAfterOccurrences,
            selectedDay: selectedDay,
            endSelectedDay: endSelectedDay,
            repeatFreq: repeatFreq,
            repeatFreqDays: repeatFreqDays,
          };
        } else if (frequency === "weekly") {
          repeatOptions = {
            frequency: frequency,
            endSpec: endSpec,
            endAfterOccurrences: endAfterOccurrences,
            selectedDay: selectedDay,
            endSelectedDay: endSelectedDay,
            repeatWeeklyWeeks: repeatWeeklyWeeks,
            days: days,
          };
        } else if (frequency === "monthly") {
          repeatOptions = {
            frequency: frequency,
            endSpec: endSpec,
            endAfterOccurrences: endAfterOccurrences,
            selectedDay: selectedDay,
            endSelectedDay: endSelectedDay,
            numberOfMonths: numberOfMonths,
            numberOfMonthsMonthly: numberOfMonthsMonthly,
            repeatMonthly: repeatMonthly,
            dayOfMonth: dayOfMonth,
            monthFreqOption: monthFreqOption,
            monthFreqOptionDay: monthFreqOptionDay,
          };
        } else if (frequency === "yearly") {
          repeatOptions = {
            frequency: frequency,
            endSpec: endSpec,
            selectedDay: selectedDay,
            endSelectedDay: endSelectedDay,
            yearlyFreqOption: yearlyFreqOption,
            yearlyFreqOptionDay: yearlyFreqOptionDay,
            yearlyOnDayRecurMonth: yearlyOnDayRecurMonth,
            yearlyOnDate: yearlyOnDate,
            yearlyRecurDate: yearlyRecurDate,
          };
        }

        const dataToSave = {
          user_id: budgetData.user_id || "default_user_id", // Replace 'default_user_id' with an appropriate default value
          currentYear: currentYear,
          startFinYr: startFinYr,
          name: budgetData.name || "",
          type: budgetData.type || "",
          category: budgetData.category || "",
          transactiontype: budgetData.transactiontype || "expenses",
          description: budgetData.description || "",
          date: budgetData.date || new Date(), // Set the default date to the current date
          amount: budgetsAmount || 0, // Assuming amount should be a number; default to 0
          repeat_options: repeatOptions || {}, // Default to an empty object if not provided
          growth_options: budgetData.growth_options || {}, // Default to an empty object if not provided
          extras: budgetData.extras || "", // Default to an empty string if not provided
        };
        handleRecurrence(dataToSave);
        handleCloseModal();
        resetVars();
      } else {
        // Ensure all fields have default values if not provided
        const dataToSave = {
          user_id: budgetData.user_id || "default_user_id", // Replace 'default_user_id' with an appropriate default value
          name: budgetData.name || "",
          type: budgetData.type || "",
          category: budgetData.category || "",
          transactiontype: budgetData.transactiontype || "expenses",
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
            dataToSave.transactiontype,
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
    continuousBalanceRef.current = startBalance;
    const dateObj = new Date(date);
    // Extract the current month from the dateObj-
    // current month is the month on which the user is currently positioned in the budget
    const currentMonth = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
    // Set the currentMonth state
    setCurrentMonth(currentMonth);
    setSelectedDay(dateObj);
    setIsModalOpen(true);
    setLastViewedDate(date);
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
                // opacity: repeatMonthly === "day" ? "1" : "0.5",
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
              <label htmlFor="numberofmonths">month(s)</label>
            </div>
            <div
              style={{
                // opacity: repeatMonthly === "the" ? "1" : "0.5",
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
                <div className="picker-popup" ref={dayThirdPickerRef}>
                  <DayPicker
                    captionLayout="dropdown-months"
                    mode="single"
                    selected={yearlyRecurDate}
                    onSelect={handleYearlyRecurDate}
                    month={currentMonth}
                    onMonthChange={(month) => setCurrentMonth(month)}
                    // month={yearlyRecurDate}
                  />
                </div>
              )}
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
    continuousBalanceRef.current = startBalance;
    setCurrentDate(date);
    setIsModalOpen(true);
    setEditMode(true);
    setEditId(item.id);
    setBudgetData({
      user_id: user.id,
      budgetName: budgetName,
      date: formatDate(item.date, "DD MMM YYYY"),
      description: item.description,
      transactiontype: item.transactiontype,
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
  };

  useEffect(() => {
    const getBudgetData = async () => {
      if (currentBudgetName) {
        try {
          const budgetDetail = await db.budgetdetails
            .where("name")
            .equals(currentBudgetName)
            .first();
          if (budgetDetail) {
            setCurrentBudgetName(currentBudgetName);
            setStartFinYr(budgetDetail.startmonth);
            setCurrentYear(budgetDetail.year);
            setOpeningBalance(budgetDetail.openingbalance);
          } else {
            console.warn(
              "Budget name not found in database:",
              currentBudgetName
            );
            // setCurrentBudgetName(null);
            localStorage.removeItem("currentBudgetName"); // Optionally clear invalid budget name
          }
        } catch (error) {
          console.error("Failed to fetch budget detail from database:", error);
        }
      }
    };
    getBudgetData();
  }, []);

  // const handleIncExp = (event) => {
  //   setTransactionType(event.target.value);
  // };

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

  const handleEndAfterOccurrences = (e) => {
    setEndAfterOccurrences(e.target.value);
  };

  const handleTestrepeat = (repeat) => {
    setRepeat(!repeat);
  };

  // const handleDaySelect = (day) => {
  //   setSelectedDay(day);
  //   setIsPickerVisible(false); // Close the picker when a date is selected
  // };

  const handleOutsideClick = (event) => {
    if (dayPickerRef.current && !dayPickerRef.current.contains(event.target)) {
      setIsPickerVisible(false);
    }
  };

  const handleDaySelect = (date) => {
    // Prevent deselecting the same date
    if (date && date.toDateString() !== selectedDay?.toDateString()) {
      setSelectedDay(date);
    }
    setIsPickerVisible(false); // Close the DayPicker after selecting a date
  };

  useEffect(() => {
    if (isPickerVisible) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isPickerVisible]);

  const handleSecondOutsideClick = (event) => {
    if (
      daySecondPickerRef.current &&
      !daySecondPickerRef.current.contains(event.target)
    ) {
      setIsSecondPickerVisible(false);
    }
  };

  const handleEndDaySelect = (date) => {
    if (date && date.toDateString() !== endSelectedDay?.toDateString()) {
      setEndSelectedDay(date);
    }
    setIsSecondPickerVisible(false); // Close the DayPicker after selecting a date
  };

  useEffect(() => {
    if (isSecondPickerVisible) {
      document.addEventListener("mousedown", handleSecondOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleSecondOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleSecondOutsideClick);
    };
  }, [isSecondPickerVisible]);

  const handleThirdOutsideClick = (event) => {
    if (
      dayThirdPickerRef.current &&
      !dayThirdPickerRef.current.contains(event.target)
    ) {
      setIsThirdPickerVisible(false);
    }
  };

  const handleYearlyRecurDate = (date) => {
    // Prevent deselecting the same date
    if (date && date.toDateString() !== yearlyRecurDate?.toDateString()) {
      setYearlyRecurDate(date);
    }
    setIsThirdPickerVisible(false); // Close the DayPicker after selecting a date
  };

  useEffect(() => {
    if (isThirdPickerVisible) {
      document.addEventListener("mousedown", handleThirdOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleThirdOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleThirdOutsideClick);
    };
  }, [isThirdPickerVisible]);

  const handleCreateNewCategory = async () => {
    setOpenCatModal(true);
  };

  useEffect(() => {
    const fetchOpeningBalance = async () => {
      const balance = await getOpeningBalance();
      setStartBalance(balance);
      continuousBalanceRef.current = balance;
      initialCalculationDoneRef.current = false; // Reset flag when opening balance is fetched
    };
    fetchOpeningBalance();
  }, []); // Empty dependency array ensures this effect runs only once when the component mounts

  useEffect(() => {
    initialCalculationDoneRef.current = false; // Reset flag when budget data changes
  }, [allBudgets]);

  return (
    <div className={styles.tablecontainer}>
      <div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.date}>Date</th>
              <th className={styles.day}>Day</th>
              <th className={styles.description}>Description</th>
              <th className={styles.category}>Category</th>
              <th className={styles.dr}>Dr</th>
              <th className={styles.cr}>Cr</th>
              <th className={styles.balance}>Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.date}></td>
              <td className={styles.day}></td>
              <td className={styles.description}>Opening Balance</td>
              <td className={styles.category}></td>
              <td className={styles.dr}></td>
              <td className={styles.cr}></td>
              <td className={styles.balance}>
                {(startBalance || 0.0).toFixed(2)}
              </td>
            </tr>
            {calendar.map((dateObj, index) => {
              let dayRecords = [];
              const date = getDateFromObject(dateObj);
              dayRecords = getDaysRecords(formatDate(date, "DD MMM YYYY"));
              const formattedDate = formatDate(date, "DD MMM YYYY");
              const isLastViewedDate = formattedDate === lastViewedDate;
              // const isCurrentDate =
              //   formattedDate === formatDate(new Date(), "DD MMM YYYY");
              return (
                <tr
                  key={index}
                  ref={
                    isLastViewedDate
                      ? lastViewedDateRef
                      : // : isCurrentDate
                        // ? currentDateRef
                        null
                  }
                >
                  <td className={styles.date}>{formattedDate}</td>
                  <td className={styles.day}>{getDayOfWeek(date)}</td>
                  <td
                    className={styles.description}
                    style={{ position: "relative" }}
                  >
                    <div
                      style={{
                        minWidth: "60px",
                        minHeight: "20px",
                      }}
                    >
                      {dayRecords?.map((item, idx) => {
                        return (
                          <div
                            className="dayRecords"
                            style={{ cursor: "pointer" }}
                            key={idx}
                            onClick={() => handleEditRec(item.date, item, idx)}
                          >
                            <span>{item.description}</span>
                            {/* {item.repeat_options &&
                              Object.keys(item.repeat_options).length > 0 && (
                                <span
                                  style={{
                                    color: "red",
                                    fontSize: "0.75em",
                                  }}
                                >
                                  {"   "}repeats
                                </span>
                              )} */}
                          </div>
                        );
                      })}
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
                          className={styles.description}
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
                  <td className={styles.category}>
                    {dayRecords?.map((item, idx) => {
                      return (
                        <div className="dayRecords" key={idx}>
                          {item.category}
                        </div>
                      );
                    })}
                  </td>
                  <td className={styles.dr}>
                    {dayRecords?.map((item, idx) => {
                      return (
                        <div
                          className="dayRecords"
                          key={idx}
                          style={{ minHeight: "1em" }}
                        >
                          {item.transactiontype === "expenses" && item.amount}
                        </div>
                      );
                    })}
                  </td>
                  <td className={styles.cr}>
                    {dayRecords?.map((item, idx) => (
                      <div
                        className="dayRecords"
                        key={idx}
                        style={{ minHeight: "1em" }}
                      >
                        {item.transactiontype === "income" && item.amount}
                      </div>
                    ))}
                  </td>
                  <td className={styles.balance}>
                    {calculatedBalances[index]?.map((balance, idx) => (
                      <div
                        className="dayRecords"
                        key={idx}
                        style={{ minHeight: "1em" }}
                      >
                        {balance}
                      </div>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* </div> */}
      {/* } */}
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
                  !budgetData.transactiontype ||
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
            <div>current user: {user.id}</div>
            {/* <div>current user: {currentUser}</div> */}
            <div>current budget: {currentBudgetName}</div>
            <div>{currentDate}</div>
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
                <SearchableDropdown allCategories={allCategories} />
                {/* <label>
                  Category:
                  <select
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      if (selectedValue === "new") {
                        handleCreateNewCategory(); 
                      } else {
                        handleInputChange(
                          currentDate,
                          "category",
                          e.target.value
                        );
                      }
                    }}
                    value={budgetData.category}
                  >
                    {(allCategories || []).map((catRec) => {
                      return (
                        <option
                          key={catRec.id}
                          value={catRec.category_description}
                        >
                          {catRec.category_description}
                        </option>
                      );
                    })}
                    <option value="new">New Category</option>{" "}
                    <option disabled selected value="">
                      {" "}
                      -- select an option --{" "}
                    </option>
                  </select>
                </label> */}
              </div>
            </div>
            <div>
              <label htmlFor="income">
                <input
                  type="radio"
                  id="income"
                  name="transactiontype"
                  value="income"
                  checked={budgetData.transactiontype === "income"}
                  onChange={(e) =>
                    handleInputChange(
                      currentDate,
                      "transactiontype",
                      e.target.value
                    )
                  }
                />
                Income
              </label>
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              <label htmlFor="expenses">
                <input
                  type="radio"
                  id="expenses"
                  name="transactiontype"
                  value="expenses"
                  checked={budgetData.transactiontype === "expenses"}
                  onChange={(e) =>
                    handleInputChange(
                      currentDate,
                      "transactiontype",
                      e.target.value
                    )
                  }
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
                      <div className="picker-popup" ref={dayPickerRef}>
                        <DayPicker
                          mode="single"
                          captionLayout="dropdown"
                          selected={selectedDay}
                          onSelect={handleDaySelect}
                          month={currentMonth}
                          onMonthChange={(month) => setCurrentMonth(month)}
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
                        <div className="picker-popup" ref={daySecondPickerRef}>
                          <DayPicker
                            mode="single"
                            captionLayout="dropdown"
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
      {openCatModal && (
        <CategoryModal
          title="Categories"
          setOpenCatModal={setOpenCatModal}
          db={db}
          setCatDescription={(val) =>
            handleInputChange(currentDate, "category", val)
          }
        />
      )}
    </div>
  );
};

export default DailyBudget;
