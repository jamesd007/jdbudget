import React from "react";
import { FixedSizeList as List } from "react-window";
import { addDays, subDays } from "date-fns";
import CalendarDay from "./CalendarDay";
import styles from "../../styles/Budget.module.css";

// InfiniteCalendar Component without loadDay
const InfiniteCalendar = () => {
  const middleIndex = 5000; // Start in the middle
  const itemCount = 10000; // Simulate an infinite calendar

  return (
    <List
      height={600}
      itemCount={itemCount}
      itemSize={50}
      width={400}
      initialScrollOffset={middleIndex * 100} // Start in the middle
    >
      {({ index, style }) => {
        // Calculate the current date based on index
        const baseDate = new Date();
        // const currentDate = addDays(baseDate, index);
        // Calculate date based on the middle index
        const dayOffset = index - middleIndex;
        const currentDate =
          dayOffset >= 0
            ? addDays(baseDate, dayOffset)
            : subDays(baseDate, Math.abs(dayOffset));

        return (
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
                <CalendarDay
                  index={index}
                  style={style}
                  currentDate={currentDate} // Pass currentDate to CalendarDay
                />
              </tr>
            </tbody>
          </table>
        );
      }}
    </List>
  );
};

export default InfiniteCalendar;

// import React, { useState, useEffect, useContext, useCallback } from "react";
// import { FixedSizeList as List } from "react-window";
// import InfiniteLoader from "react-window-infinite-loader";
// import { format, addDays } from "date-fns";
// import { useDataContext } from "../../providers/DataProvider";
// import { UserContext } from "../../contexts/UserContext";
// import db from "../../store/Dexie";
// import dayjs from "dayjs";
// // import CalendarDay from "./CalendarDay"; // The component we created earlier

// // CalendarDay Component to Render Each Day
// const CalendarDay = ({ index, style, data }) => {
//   const { loadedDays, loadDay } = data;
//   const baseDate = new Date(); // Start date (can be today)
//   const currentDate = addDays(baseDate, index); // Calculate date based on index
//   const { user } = useContext(UserContext);
//   const { currentBudgetName, setCurrentBudgetName } = useDataContext();
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

//   const getBudgetsForUserForDate = useCallback(async () => {
//     try {
//       const budgets = await db.budgettransactions
//         .where({
//           user_id: user.id,
//           date: formatDate(currentDate, "dd MMM yyyy"),
//         })
//         .toArray();

//       if (budgets && budgets.length > 0) {
//         const tmpBudgetName = await getLastBudgetName(); // If this is necessary for your logic
//         setCurrentBudgetName(tmpBudgetName);
//       }

//       // Return budget names or an empty array if no budgets exist
//       return budgets.map((budget) => budget.name);
//     } catch (error) {
//       console.error("Error fetching budgets", error);
//       return []; // Return an empty array to prevent further issues
//     }
//   }, [user.id, currentDate]);

//   // Fetch budget entries for the specific day
//   useEffect(() => {
//     console.log("Fetching budgets for date:", currentDate);

//     // Function to fetch budgets from Dexie DB

//     // Fetch budgets and update state
//     const fetchBudgets = async () => {
//       const budgetNames = await getBudgetsForUserForDate();
//       setBudgetEntries(budgetNames); // Ensure this updates the state correctly
//     };

//     fetchBudgets();
//   }, [currentDate]);

//   useEffect(() => {
//     if (!loadedDays[index]) {
//       loadDay(index);
//     }
//   }, [index, loadDay, loadedDays]);

//   return (
//     <div style={style}>
//       <p>{format(currentDate, "yyyy-MM-dd")}</p>
//       {loadedDays[index] ? (
//         loadedDays[index].length > 0 ? (
//           <ul>
//             {loadedDays[index].map((entry) => (
//               <li key={entry.id}>
//                 {entry.description}: {entry.amount}
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <p>No entries for this day</p>
//         )
//       ) : (
//         <p>Loading...</p> // Show a loading message while data is fetched
//       )}
//     </div>
//   );
// };

// const InfiniteCalendar = () => {
//   const [loadedDays, setLoadedDays] = useState({});
//   console.log("tedtestR this in InfiniteCalendar");
//   const loadDay = async (index) => {
//     const baseDate = new Date();
//     const currentDate = addDays(baseDate, index);
//     // // Simulate an API call
//     // const response = await fetch(
//     //   `/api/budget?date=${format(currentDate, "yyyy-MM-dd")}`
//     // );
//     // const data = await response.json();
//     // setLoadedDays((prev) => ({
//     //   ...prev,
//     //   [index]: data,
//     // }));
//   };
//   console.log("tedtestr loadDay=", loadDay);

//   const isItemLoaded = (index) => !!loadedDays[index]; // Check if a day is already loaded
//   console.log("tedtestr isItemLoaded=", isItemLoaded);
//   const itemCount = 100000; // Set a large number to simulate an infinite calendar

//   return (
//     <InfiniteLoader
//       isItemLoaded={isItemLoaded} // Check if the item is already loaded
//       itemCount={itemCount} // Total items (can be set to a very large number)
//       loadMoreItems={loadDay} // Function to load more items
//     >
//       {({ onItemsRendered, ref }) => (
//         <List
//           height={600}
//           itemCount={itemCount}
//           itemSize={100}
//           width={400}
//           onItemsRendered={onItemsRendered} // Inform InfiniteLoader about rendered items
//           ref={ref}
//           itemData={{ loadedDays, loadDay }} // Pass state and load function to each item
//         >
//           {CalendarDay} {/* Render each day with data */}
//         </List>
//       )}
//     </InfiniteLoader>
//   );
// };

// //   return (
// //     <div>
// //       {/* <p>Calendar</p> */}

// //       <List
// //         height={600} // Adjust based on your desired height for the calendar
// //         itemCount={Infinity} // Infinite scroll
// //         itemSize={25} // Each row height in pixels
// //         width={400} // Width of the calendar container
// //         initialScrollOffset={0} // You could set this to start at a specific date
// //       >
// //         {CalendarDay}
// //         {/*This renders each day, calculated by its index */}
// //       </List>
// //     </div>
// //   );
// // };

// export default InfiniteCalendar;
