import React, { useState, useEffect } from "react";
import styles from "../../styles/IncomeExpenseReport.module.css";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const IncomeExpenseReport = ({ transactions, categories }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  let incomeData = {};
  let expenseData = {};

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const calcTotals = () => {
    transactions.forEach((transaction) => {
      const monthIndex = new Date(transaction.date).getMonth(); // 0 for Jan, 1 for Feb, etc.
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
    console.log("tedtest1 expenseData=", expenseData);
  };

  const getDayOfWeek = (date) => {
    return dayjs(date).format("ddd");
  };

  useEffect(() => {
    calcTotals();
  }, []);

  const onChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <div>
      <div style={{ marginLeft: "2.5%" }}>
        <DatePicker
          id="startDateId"
          selected={startDate}
          selectsRange
          startDate={startDate}
          endDate={endDate}
          placeholderText="placeholder"
          dateFormat="dd/MM/yyyy"
          onChange={onChange}
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
      {transactions && transactions.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.accountid}>Account_id</th>
              <th className={styles.date}>Date</th>
              <th className={styles.day}>Day</th>
              <th className={styles.description}>Description</th>
              <th className={styles.category}>Category</th>
              <th className={styles.transactiontype}>inc/exp</th>
              <th className={styles.dr}>Dr</th>
              <th className={styles.cr}>Cr</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((item, index) => {
              return (
                <tr key={item.id}>
                  <td className={styles.accountid}>{item.account_id}</td>
                  <td className={styles.date}>{item.date}</td>
                  <td //day
                    className={styles.day}
                  >
                    {getDayOfWeek(item.date)}
                  </td>
                  <td //description
                    className={styles.description}
                  >
                    {item.description}
                  </td>
                  <td //category
                    className={styles.category}
                  >
                    {item.category_description}
                  </td>
                  <td //incexp
                    className={styles.incexp}
                  >
                    {item.transactiontype}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div>No data</div>
      )}
    </div>
  );
};

export default IncomeExpenseReport;
