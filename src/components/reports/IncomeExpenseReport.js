import React, { useState, useEffect } from "react";
import styles from "../../styles/IncomeExpenseReport.module.css";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, addMonths } from "date-fns";

const IncomeExpenseReport = ({ transactions, categories }) => {
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [monthHeaders, setMonthHeaders] = useState([]);
  const [incomeTransactions, setIncomeTransactions] = useState([]);
  const [expenseTransactions, setExpenseTransactions] = useState([]);

  const getPeriod = () => {
    // Check if a time period is stored in sessionStorage, 'reportDates' is an object {start:date1, end:date2}
    const sessionDates = sessionStorage.getItem("reportDates");
    console.log("tedtestS sessionDates=", sessionDates);
    let firstDate, lastDate;

    // If sessionDates exists, parse it into an object
    if (sessionDates) {
      const parsedDates = JSON.parse(sessionDates);
      setStartDate(new Date(parsedDates.start));
      setEndDate(new Date(parsedDates.end));
    } else {
      // If no sessionDates, get first and last dates from the transactions
      const dates = transactions.map((t) => new Date(t.date));

      // Check if dates array is not empty
      if (dates.length) {
        firstDate = new Date(Math.min(...dates)); // Earliest date
        lastDate = new Date(Math.max(...dates)); // Latest date

        // Set the start and end date as default
        setStartDate(firstDate);
        setEndDate(lastDate);
      }
    }
  };

  useEffect(() => {
    console.log("tedtestS startDate=", startDate);
    console.log("tedtestS endDate=", endDate);
  }, [startDate, endDate]);

  useEffect(() => {
    getPeriod(); // Call function to set start and end dates based on session or transactions
  }, []);

  // const getPeriod = () => {
  //   // Check if a time period is stored in sessionStorage, reportDates is an object{start:date1,end:date2}
  //   const sessionDates = sessionStorage.getItem("reportDates");
  //   let firstDate;
  //   let lastDate;
  //   // Get first and last dates from the transactions
  //   if (!sessionDates) {
  //     const dates = transactions.map((t) => new Date(t.date));
  //     firstDate = new Date(Math.min(...dates)); // Earliest date
  //     lastDate = new Date(Math.max(...dates)); // Latest date
  //   }

  //   // Use stored dates if they exist, otherwise default to the calculated first and last dates
  //   setStartDate(sessionDates ? new Date(sessionDates.start) : firstDate);
  //   setEndDate(sessionDates ? new Date(sessionDates.end) : lastDate);
  // };

  const calcTotals = () => {
    let incomeData = {};
    let expenseData = {};
    transactions.forEach((transaction) => {
      // For each transaction, calculate the month index
      const transactionDate = new Date(transaction.date);
      // Calculate the relative month index
      const monthIndex =
        (transactionDate.getFullYear() - startDate.getFullYear()) * 12 +
        transactionDate.getMonth() -
        startDate.getMonth();
      // const monthIndex = new Date(transaction.date).getMonth(); // 0 for Jan, 1 for Feb, etc.
      const category = transaction.category_description;
      const amount = parseFloat(transaction.amount);

      if (transaction.transactiontype === "income") {
        if (!incomeData[category]) incomeData[category] = new Array(12).fill(0); // Initialize array if not exists
        incomeData[category][monthIndex] += amount; // Add amount to the correct month
      } else if (transaction.transactiontype === "expenses") {
        if (!expenseData[category])
          expenseData[category] = new Array(12).fill(0);
        expenseData[category][monthIndex] += amount;
      }
    });
    console.log("tedtest1 incomeData=", incomeData);
    setIncomeTransactions(incomeData);
    console.log("tedtest1 expenseData=", expenseData);
    setExpenseTransactions(expenseData);
  };

  const getDayOfWeek = (date) => {
    return dayjs(date).format("ddd");
  };

  // Function to generate an array of month names between startDate and endDate
  const generateMonths = (startDate, endDate) => {
    console.log(
      "tedtestSS generateMonths startDate=",
      startDate,
      "   endDate=",
      endDate
    );
    const months = [];
    let current = new Date(startDate);

    while (current <= new Date(endDate)) {
      months.push(format(current, "MMM")); // e.g., "Mar 2024"
      current = addMonths(current, 1); // Move to the next month
    }
    console.log("tedtestss months=", months);
    return months;
  };

  // Watch for changes to startDate or endDate and store the new values in sessionStorage
  useEffect(() => {
    if (startDate && endDate) {
      // Ensure the dates are set before storing
      sessionStorage.setItem(
        "reportDates",
        JSON.stringify({
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        })
      );
      calcTotals();
      setMonthHeaders(generateMonths(startDate, endDate));
    }
  }, [startDate, endDate]);

  const onChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <div>
      <div style={{ marginLeft: "2.5%" }}>
        Report period:
        <DatePicker
          id="startDateId"
          selected={startDate}
          selectsRange
          startDate={startDate}
          endDate={endDate}
          placeholderText="placeholder"
          dateFormat="dd/MM/yyyy"
          onChange={onChange}
          showMonthDropdown
          // locale={selectLocale(locale)}
          // customInput={<CustomInput />}
        />
        {/* <input value={`${startDate} - ${endDate}`} /> */}
        {/* <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          dateFormat="dd/MM/yyyy"
        /> */}
      </div>
      <div className={styles.tablecontainer}>
        {incomeTransactions && Object.keys(incomeTransactions).length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.category}>Category</th>
                {/* Render the month headers */}
                {monthHeaders.map((month, index) => (
                  <th key={index} className={styles.month}>
                    {month}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Iterate through each category in the incomeData */}
              <tr>
                <td>Balance b/f</td>
                {monthHeaders.map((month, index) => (
                  <td key={index} className={styles.amount}>
                    0.00
                    {/* {index === 0
                      ? (incomeTransactions["Opening Balance"] || 0).toFixed(2)
                      : 0} */}
                  </td>
                ))}
              </tr>
              <tr
                colSpan={monthHeaders.length + 1}
                className={styles.inc_exp_hdr_row}
              >
                <td>Income</td>
              </tr>
              {Object.keys(incomeTransactions).map(
                (category, categoryIndex) => (
                  <tr key={categoryIndex} className={styles.data_row}>
                    {/* First column: Category name */}
                    <td className={styles.category}>{category}</td>
                    {/* Map the values across the months */}
                    {incomeTransactions[category].map((value, valueIndex) => (
                      <td key={valueIndex} className={styles.amount}>
                        {value !== 0 ? value.toFixed(2) : "-"}{" "}
                        {/* Format non-zero values */}
                      </td>
                    ))}
                  </tr>
                )
              )}
              <tr>
                <td className={styles.inc_exp_totals}>Total income</td>
                {monthHeaders.map((month, index) => (
                  <td key={index} className={styles.amount}>
                    inctot
                    {/* {index === 0
                      ? (incomeTransactions["Opening Balance"] || 0).toFixed(2)
                      : 0} */}
                  </td>
                ))}
              </tr>
              <tr
                colSpan={monthHeaders.length + 1}
                className={styles.inc_exp_hdr_row}
              >
                <td>Expenses</td>
              </tr>
              {Object.keys(expenseTransactions).map(
                (category, categoryIndex) => (
                  <tr key={categoryIndex} className={styles.data_row}>
                    {/* First column: Category name */}
                    <td className={styles.category}>{category}</td>
                    {/* Map the values across the months */}
                    {expenseTransactions[category].map((value, valueIndex) => (
                      <td key={valueIndex} className={styles.amount}>
                        {value !== 0 ? value.toFixed(2) : "-"}{" "}
                        {/* Format non-zero values */}
                      </td>
                    ))}
                  </tr>
                )
              )}
              <tr>
                <td className={styles.inc_exp_totals}>Total expenses</td>
                {monthHeaders.map((month, index) => (
                  <td key={index} className={styles.amount}>
                    exptot
                    {/* {index === 0
                      ? (incomeTransactions["Opening Balance"] || 0).toFixed(2)
                      : 0} */}
                  </td>
                ))}
              </tr>
              <tr>
                <td className={styles.inc_exp_totals}>Net (income-expenses)</td>
                {monthHeaders.map((month, index) => (
                  <td key={index} className={styles.amount}>
                    nettot
                    {/* {index === 0
                      ? (incomeTransactions["Opening Balance"] || 0).toFixed(2)
                      : 0} */}
                  </td>
                ))}
              </tr>
              <tr>
                <td>Balance c/f</td>
                {monthHeaders.map((month, index) => (
                  <td key={index} className={styles.amount}>
                    0.00
                    {/* {index === 0
                      ? (incomeTransactions["Opening Balance"] || 0).toFixed(2)
                      : 0} */}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        ) : (
          <div>No data</div>
        )}
      </div>
    </div>
  );
};

export default IncomeExpenseReport;
