import React, { useState, useEffect, useContext } from "react";
import styles from "../../styles/IncomeExpenseReport.module.css";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, addMonths, set } from "date-fns";
import db from "../../store/Dexie";
import { UserContext } from "../../contexts/UserContext";
import { useDataContext } from "../../providers/DataProvider";

const IncomeExpenseReport = ({ transactions, categories }) => {
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [monthHeaders, setMonthHeaders] = useState([]);
  const [incomeTransactions, setIncomeTransactions] = useState([]);
  const [expenseTransactions, setExpenseTransactions] = useState([]);
  const [netTotals, setNetTotals] = useState([]);
  const [incomeTotals, setIncomeTotals] = useState([]);
  const [expenseTotals, setExpenseTotals] = useState([]);
  const { user } = useContext(UserContext);
  const { currentAccNumber } = useDataContext();
  const [balBf, setBalBf] = useState([]);
  const [balCf, setBalCf] = useState([]);
  const [startBalance, setStartBalance] = useState(0);

  const getPeriod = () => {
    // Check if a time period is stored in sessionStorage, 'reportDates' is an object {start:date1, end:date2}
    const sessionDates = sessionStorage.getItem("reportDates");
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
    getPeriod(); // Call function to set start and end dates based on session or transactions
  }, []);

  const calcTotals = () => {
    let incomeData = {};
    let expenseData = {};
    let incTotals = new Array(monthHeaders?.length).fill(0); // Initialize income totals array
    let expTotals = new Array(monthHeaders?.length).fill(0); // Initialize expense totals array
    let netTotals = new Array(monthHeaders?.length).fill(0); // Initialize net totals array
    let tmpBalCf = [];
    let tmpBalBf = [];

    transactions.forEach((transaction) => {
      // For each transaction, calculate the month index
      const transactionDate = new Date(transaction.date);
      const monthIndex =
        (transactionDate.getFullYear() - startDate.getFullYear()) * 12 +
        transactionDate.getMonth() -
        startDate.getMonth();
      if (monthIndex >= 0 && monthIndex <= monthHeaders.length) {
        const category = transaction.category_description;
        const amount = parseFloat(transaction.amount);
        if (transaction.transactiontype === "income") {
          if (!incomeData[category])
            incomeData[category] = new Array(monthHeaders?.length).fill(0); // Initialize array if not exists
          incomeData[category][monthIndex] += amount; // Add amount to the correct month
          incTotals[monthIndex] += amount; // Track the total income for each month
        } else if (transaction.transactiontype === "expenses") {
          if (!expenseData[category])
            expenseData[category] = new Array(monthHeaders?.length).fill(0); // Initialize array if not exists
          expenseData[category][monthIndex] += amount; // Add amount to the correct month
          expTotals[monthIndex] += amount; // Track the total expenses for each month
        }

        // Calculate the net totals as income minus expenses for each month
        netTotals[monthIndex] = incTotals[monthIndex] - expTotals[monthIndex];
      }
    });
    for (let count = 0; count < monthHeaders?.length; count++) {
      if (count === 0) {
        tmpBalBf.push(startBalance);
        tmpBalCf.push(startBalance + incTotals[count] - expTotals[count]);
      } else {
        tmpBalBf.push(tmpBalCf[count - 1]);
        tmpBalCf.push(
          tmpBalCf[count - 1] + incTotals[count] - expTotals[count]
        );
      }
    }
    setIncomeTransactions(incomeData);
    setExpenseTransactions(expenseData);
    setIncomeTotals(incTotals);
    setExpenseTotals(expTotals);
    setNetTotals(netTotals); // Optionally, set net totals to state if needed
    setBalBf(tmpBalBf);
    setBalCf(tmpBalCf);
  };

  const getDayOfWeek = (date) => {
    return dayjs(date).format("ddd");
  };

  //generates the months from the selected dates
  const generateMonths = (startDate, endDate) => {
    const months = [];
    let current = new Date(startDate);
    while (
      current.getFullYear() < new Date(endDate).getFullYear() ||
      (current.getFullYear() === new Date(endDate).getFullYear() &&
        current.getMonth() <= new Date(endDate).getMonth())
    ) {
      // Only push the month and ignore the day part
      months.push(format(current, "MMM")); // e.g., "Mar 2024"
      current = addMonths(current, 1); // Move to the next month
    }
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
      setMonthHeaders(generateMonths(startDate, endDate));
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (monthHeaders?.length) {
      calcTotals();
    }
  }, [monthHeaders]);

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
                <th className={styles.total}>Total</th>
              </tr>
            </thead>
            <tbody>
              {/* Iterate through each category in the incomeData */}
              <tr>
                <td>Balance b/f</td>
                {balBf.map((amt, index) => (
                  <td key={index} className={styles.amount}>
                    {amt.toFixed(2)}
                  </td>
                ))}
              </tr>
              <tr
                colSpan={monthHeaders.length + 2}
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
                    <td className={styles.total}>
                      {incomeTransactions[category]
                        .reduce((acc, curr) => acc + curr, 0)
                        .toFixed(2)}
                    </td>
                  </tr>
                )
              )}
              <tr className={styles.inc_exp_totals_row}>
                <td className={styles.inc_exp_totals}>Total income</td>
                {incomeTotals.map((sum, index) => (
                  <td key={index} className={styles.amount}>
                    {sum.toFixed(2)}
                  </td>
                ))}
                <td className={styles.total}>
                  {incomeTotals.reduce((acc, curr) => acc + curr, 0).toFixed(2)}
                </td>
              </tr>
              <tr
                colSpan={monthHeaders.length + 2}
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
                    <td className={styles.total}>
                      {expenseTransactions[category]
                        .reduce((acc, curr) => acc + curr, 0)
                        .toFixed(2)}
                    </td>
                  </tr>
                )
              )}
              <tr className={styles.inc_exp_totals_row}>
                <td className={styles.inc_exp_totals}>Total expenses</td>
                {expenseTotals.map((sum, index) => (
                  <td key={index} className={styles.amount}>
                    {sum.toFixed(2)}
                  </td>
                ))}
                <td className={styles.total}>
                  {expenseTotals
                    .reduce((acc, curr) => acc + curr, 0)
                    .toFixed(2)}
                </td>
              </tr>
              <tr className={styles.inc_exp_totals_row}>
                <td className={styles.inc_exp_totals}>Net (income-expenses)</td>
                {netTotals.map((sum, index) => (
                  <td key={index} className={styles.amount}>
                    {sum.toFixed(2)}
                    {/* {index === 0
                      ? (incomeTransactions["Opening Balance"] || 0).toFixed(2)
                      : 0} */}
                  </td>
                ))}
                <td className={styles.total}>
                  {(
                    incomeTotals.reduce((acc, curr) => acc + curr, 0) -
                    expenseTotals.reduce((acc, curr) => acc + curr, 0)
                  ).toFixed(2)}
                </td>
              </tr>
              <tr>
                <td>Balance c/f</td>
                {balCf.map((amt, index) => (
                  <td key={index} className={styles.amount}>
                    {amt.toFixed(2)}
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
