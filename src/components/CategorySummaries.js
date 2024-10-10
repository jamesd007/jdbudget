import React, { useEffect, useState } from "react";
import { Container, TextField } from "@mui/material";
import {
  formatISO,
  addMonths,
  getYear,
  getMonth,
  lastDayOfMonth,
  startOfMonth,
} from "date-fns";
import db from "../store/Dexie";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import "../styles/CategorySummaries.css";
import ChartComponent from "./ChartComponent";

const CategorySummaries = () => {
  const [transactionsForSummary, setTransactionsForSummary] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  // const stripTimeComponent = (isoDateString) => {
  //   return isoDateString.split("T")[0];
  // };

  const formatDateToISOWithoutTime = (date) => {
    return formatISO(date, { representation: "date" });
  };

  // const getData = async (startMonth, endMonth) => {
  //   // Set start date to the first day of the startMonth
  //   const startDate = new Date(
  //     startMonth.getFullYear(),
  //     startMonth.getMonth(),
  //     1
  //   );
  //   // Set end date to the last day of the endMonth
  //   const endDate = new Date(
  //     endMonth.getFullYear(),
  //     endMonth.getMonth() + 1,
  //     0
  //   );

  //   const isoStartDate = formatDateToISOWithoutTime(startDate);
  //   endDate.setHours(23, 59, 59, 999);
  //   const isoEndDate = endDate.toISOString();
  //   if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
  //     alert("Invalid date selection. Please select valid dates.");
  //     return;
  //   }
  //   try {
  //     const transactions = await db.transactions
  //       .where("date")
  //       .between(isoStartDate, isoEndDate, true, true)
  //       .toArray();
  //     const transForSummary = transactions.map((transaction) => {
  //       return {
  //         ...transaction,
  //         date: stripTimeComponent(transaction.date),
  //       };
  //     });
  //     setTransactionsForSummary(transForSummary);
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };

  // useEffect(() => {
  //   getData(startDate, endDate);
  // }, [startDate, endDate]);

  const fetchTransactions = async (startMonth, endMonth) => {
    let currentMonth = startMonth;
    const transactionsByMonth = {};

    while (currentMonth <= endMonth) {
      const startDate = startOfMonth(currentMonth);
      const endDate = lastDayOfMonth(currentMonth);

      const isoStartDate = formatDateToISOWithoutTime(startDate);
      endDate.setHours(23, 59, 59, 999);
      const isoEndDate = endDate.toISOString();

      try {
        const transactions = await db.transactions
          .where("date")
          .between(isoStartDate, isoEndDate, true, true)
          .toArray();

        const monthYear = `${currentMonth.toLocaleString("default", {
          month: "short",
        })}-${getYear(currentMonth)}`;
        transactionsByMonth[monthYear] = transactions;
      } catch (error) {
        console.error("Error fetching data:", error);
      }

      currentMonth = addMonths(currentMonth, 1);
    }
    return transactionsByMonth;
  };

  const summarizeTransactions = (transactionsByMonth) => {
    const summary = {};

    Object.keys(transactionsByMonth).forEach((monthYear) => {
      const transactions = transactionsByMonth[monthYear];
      transactions.forEach((transaction) => {
        const category = transaction.category_description || "Unalllocated";
        if (!summary[category]) {
          summary[category] = {};
        }
        if (!summary[category][monthYear]) {
          summary[category][monthYear] = 0;
        }
        let floatAmount1;
        if (typeof transaction.amount1 === "string")
          floatAmount1 = parseFloat(parseFloat(transaction.amount1).toFixed(2));
        else floatAmount1 = transaction.amount1;
        let floatAmount2;
        if (typeof transaction.amount2 === "string")
          floatAmount2 = parseFloat(parseFloat(transaction.amount2).toFixed(2));
        else floatAmount2 = transaction.amount2;
        summary[category][monthYear] += floatAmount1 - floatAmount2;
      });
    });
    // Transform the summary object into an array of objects
    const summaryArray = Object.keys(summary).map((category) => {
      const totalPerMonth = summary[category];
      const totalAmount = Object.values(totalPerMonth).reduce(
        (sum, amount) => sum + amount,
        0
      );
      return { category, totalAmount, ...totalPerMonth };
    });

    // Sort the array based on totalAmount in descending order
    // summaryArray.sort((a, b) => b.totalAmount - a.totalAmount);
    summaryArray.sort((a, b) => a.category.localeCompare(b.category));

    return summaryArray;
  };

  useEffect(() => {
    const fetchAndSummarize = async () => {
      const transactionsByMonth = await fetchTransactions(startDate, endDate);
      const summary = summarizeTransactions(transactionsByMonth);
      setTransactionsForSummary(summary);
    };

    fetchAndSummarize();
  }, [startDate, endDate]);

  const renderSummaryTable = () => {
    const monthKeys =
      transactionsForSummary.length > 0
        ? Object.keys(transactionsForSummary[0]).filter(
            (key) => key !== "category" && key !== "totalAmount"
          )
        : [];

    return (
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Category</th>
              {monthKeys.map((month) => (
                <th key={month}>{month}</th>
              ))}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {transactionsForSummary.map((summary) => (
              <tr key={summary.category}>
                <td>{summary.category}</td>
                {monthKeys.map((month) => (
                  <td key={month} style={{ textAlign: "right" }}>
                    {typeof summary[month] === "string" ||
                    typeof summary[month] === "number"
                      ? parseFloat(parseFloat(summary[month]).toFixed(2)) || 0
                      : summary[month] || 0}
                  </td>
                ))}
                <td style={{ textAlign: "right" }}>
                  {" "}
                  {parseFloat(summary.totalAmount.toFixed(2))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container>
        <DatePicker
          label="Start Date - month and year"
          views={["year", "month"]}
          value={startDate}
          onChange={(newValue) => setStartDate(newValue)}
          renderInput={(params) => <TextField {...params} />}
          // maxDate={new Date()}
        />
        <DatePicker
          label="End Date - month and year"
          views={["year", "month"]}
          value={endDate}
          onChange={(newValue) => setEndDate(newValue)}
          renderInput={(params) => <TextField {...params} />}
          // maxDate={new Date()}
        />
      </Container>
      {renderSummaryTable()}
      {/* //tedtest the following is only for testing */}
      {/* <div style={{ height: "50vh", overflow: "hidden", overflow: "auto" }}>
        {transactionsForSummary.map((transaction) => (
          <div key={transaction.id}>{transaction.date}</div>
        ))}
      </div> */}
      {/* <ChartComponent  */}
      <label htmlFor="category-select">Select a category:</label>
      <select
        id="category-select"
        value={selectedCategory}
        onChange={handleCategoryChange}
      >
        <option value="">--Please choose a category--</option>
        {transactionsForSummary.map((item) => (
          <option key={item.category} value={item.category}>
            {item.category}
          </option>
        ))}
      </select>
      {selectedCategory && (
        <ChartComponent
          data={transactionsForSummary}
          selectedCategory={selectedCategory}
        />
      )}
      {/* /> */}
    </LocalizationProvider>
  );
};

export default CategorySummaries;
