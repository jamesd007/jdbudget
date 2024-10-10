import React, { useEffect, useState, useContext } from "react";
import dayjs from "dayjs";
import { UserContext } from "../../contexts/UserContext";
import db from "../../store/Dexie";
import { formatISO } from "date-fns";
import styles from "../../styles/Budget.module.css";

const CalendarDay = ({ index, style, currentDate }) => {
  const [budgetEntries, setBudgetEntries] = useState([]);
  const { user } = useContext(UserContext);

  const formatDate = (date, format) => {
    return dayjs(date).format(format);
  };

  const formatDateToISOWithoutTime = (date) => {
    return formatISO(date, { representation: "date" });
  };

  useEffect(() => {
    // Fetch data from Dexie for the specific date
    const getBudgetsForUserForDate = async () => {
      try {
        const budgets = await db.budgettransactions
          .where({
            user_id: user.id,
            date: formatDate(currentDate, "DD MMM YYYY"),
          })
          .toArray();
        console.log("tedtestR budgets =", budgets);
        setBudgetEntries(budgets); // Update state with fetched budgets
      } catch (error) {
        console.error("Error fetching budgets", error);
        setBudgetEntries([]); // Handle error with an empty state
      }
    };

    getBudgetsForUserForDate();
  }, [currentDate]);

  const getDayOfWeek = (date) => {
    return dayjs(date).format("ddd");
  };

  return (
    <div style={style}>
      {/* <table className={styles.table}>
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
        </thead> */}
      {/* <tbody>
          <tr> */}
      <td className={styles.date}>{formatDate(currentDate, "DD MMM YYYY")}</td>
      <td className={styles.day}>
        {getDayOfWeek(formatDate(currentDate, "DD MMM YYYY"))}
      </td>
      <td>
        {budgetEntries.length > 0 ? (
          <ul>
            {budgetEntries.map((entry) => (
              <li key={entry.id}>
                {entry.description}: {entry.amount}
              </li>
            ))}
          </ul>
        ) : (
          <p>No entries for this day</p>
        )}
      </td>
      {/* </tr>
        </tbody>
      </table> */}
    </div>
  );
};

export default CalendarDay;

// import React, { useState, useContext, useEffect } from "react";
// import { format, addDays } from "date-fns";
// import { useDataContext } from "../../providers/DataProvider";
// import { UserContext } from "../../contexts/UserContext";
// import db from "../../store/Dexie";
// import dayjs from "dayjs";

// const CalendarDay = ({ index, style }) => {
//   const baseDate = new Date(); // You could start this from today or another fixed date
//   const currentDate = addDays(baseDate, index); // Calculate date based on the index
//   const { user } = useContext(UserContext);
//   const { currentBudgetName, setCurrentBudgetName } = useDataContext();
//   // const [userBudgets, setUserBudgets] = useState([]);
//   const [budgetEntries, setBudgetEntries] = useState([]);

//   const getLastBudgetName = async () => {
//     console.log("tedtest getlastbudgetname");
//     let rec;
//     try {
//       rec = await db.users.where("id").equals(user.id).first();
//       return rec.last_budget;
//       // setCurrentBudgetName(rec.last_budget);
//     } catch (error) {
//       console.error("Error getting last budget name", error);
//     }
//   };

//   const formatDate = (date, format) => {
//     return dayjs(date).format(format);
//   };

//   // Fetch budget entries for the specific day
//   useEffect(() => {
//     console.log("Fetching budgets for date:", currentDate);

//     // Function to fetch budgets from Dexie DB
//     const getBudgetsForUserForDate = useCallback(async () => {
//       try {
//         const budgets = await db.budgettransactions
//           .where({
//             user_id: user.id,
//             date: formatDate(currentDate, "dd MMM yyyy"),
//           })
//           .toArray();

//         if (budgets && budgets.length > 0) {
//           const tmpBudgetName = await getLastBudgetName(); // If this is necessary for your logic
//           setCurrentBudgetName(tmpBudgetName);
//         }

//         // Return budget names or an empty array if no budgets exist
//         return budgets.map((budget) => budget.name);
//       } catch (error) {
//         console.error("Error fetching budgets", error);
//         return []; // Return an empty array to prevent further issues
//       }
//     },[user.id,currentDate];

//     // Fetch budgets and update state
//     const fetchBudgets = async () => {
//       const budgetNames = await getBudgetsForUserForDate();
//       setBudgetEntries(budgetNames); // Ensure this updates the state correctly
//     };

//     fetchBudgets();
//   }, [currentDate]);

//   // useEffect(() => {
//   //   console.log("tedtestWWW fetchbudgets currentDate=", currentDate);
//   //   //returns all budgets for this user
//   //   const getBudgetsForUserForDate = async () => {
//   //     try {
//   //       const budgets = await db.budgettransactions
//   //         .where({
//   //           user_id: user.id,
//   //           date: formatDate(currentDate, "dd MMM yyyy"),
//   //         })
//   //         .toArray();
//   //       if (budgets && budgets.length > 0) {
//   //         let tmpBudgetName = await getLastBudgetName();
//   //         setCurrentBudgetName(tmpBudgetName);
//   //       }
//   //       return budgets.map((budget) => budget.name);
//   //     } catch (error) {
//   //       console.error("Error fetching budgets", error);
//   //       return null; // or handle the error as needed
//   //     }
//   //   };
//   //   const fetchBudgets = async () => {
//   //     setBudgetEntries(await getBudgetsForUserForDate());
//   //   };

//   //   fetchBudgets();

//   // }, [currentDate]);

//   // useEffect(() => {
//   //   console.log("tedtest budgetentries=", budgetEntries);
//   // }, [budgetEntries]);

//   return (
//     <div style={style}>
//       <p>{format(currentDate, "yyyy-MM-dd")}</p>
//       {/* {budgetEntries.length > 0 ? (
//         <ul>
//           {budgetEntries.map((entry) => (
//             <li key={entry.id}>
//               {entry.description}: {entry.amount}
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p>No entries for this day</p>
//       )} */}
//     </div>
//   );
// };

// export default CalendarDay;
