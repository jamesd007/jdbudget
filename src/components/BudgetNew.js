// import React, { useState, useContext } from "react";
// import dayjs from "dayjs";
// import { FaPlus } from "react-icons/fa";
// import { FaRegEdit } from "react-icons/fa";
// import Modals from "../utils/Modals";
// import "../styles/Budget.css";
// import "../styles/Modals.css";
// import "../styles/MainStyles.css";
// import { useDataContext } from "../providers/DataProvider";
// import { addBudget } from "../store/Dexie";

// // Sample categories
// const categories = [
//   //tedtest todo get categories from category dbase
//   //if new category entered here, it needs to be added to category database
//   "Food",
//   "Transport",
//   "Utilities",
//   "Entertainment",
//   "Others",
// ];

// const BudgetNew = () => {
//   const [budgetData, setBudgetData] = useState({});
//   const [tedtestBudget, setTedtestBudget] = useState("");
//   const weekStart = "Sunday";
//   const weekEnd = "Saturday";
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [currentDate, setCurrentDate] = useState(null);
//   const { currentUser } = useDataContext();
//   const { currentBudgetName } = useDataContext();
//   console.log("tedtest currentBudgetName=", currentBudgetName);

//   // Generate a list of dates for the current month
//   const generateDates = () => {
//     const dates = [];
//     const now = new Date();
//     const year = now.getFullYear();
//     const month = now.getMonth() + 3;
//     const lastDay = new Date(year, month + 1, 0).getDate();

//     for (let day = 1; day <= lastDay; day++) {
//       dates.push(new Date(year, month, day));
//       //   dates.push(new Date(year, month, day).toLocaleDateString());
//     }
//     return dates;
//   };

//   const formatDate = (date, format) => {
//     return dayjs(date).format(format);
//   };

//   const dateFormats = [
//     "DD/MMM/YYYY",
//     "DD/MM/YY",
//     "DD/MM/YYYY",
//     "MM/DD/YYYY",
//     "DD MMM YYYY",
//     "DD MMMM YYYY dddd",
//   ];

//   const getDayOfWeek = (date) => {
//     return dayjs(date).format("dddd");
//   };

//   const handleEdit = (e) => {
//     console.log("tedtestnew index=", e);
//   };
//   const handleTedTest = (e) => {
//     setTedtestBudget(e.target.value);
//     console.log("tedtestnew value=", e.target.value);
//   };

//   const handleInputChange = (date, field, value) => {
//     setBudgetData({
//       ...budgetData,
//       [date]: {
//         ...budgetData[date],
//         [field]: value,
//       },
//     });
//   };

//   const handleSave = (field, value) => {
//     handleInputChange(currentDate, field, value);
//     // handleCloseModal();
//   };

//   const handleOpenModal = (date, index) => {
//     console.log("tedtestA date=", date, " index=", index);
//     setCurrentDate(date);
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setCurrentDate(null);
//   };

//   return (
//     <div className="budget-display-container">
//       <h1>Daily Budget</h1>
//       {!currentBudgetName || currentBudgetName === "" ? (
//         <div>Enter budget name</div>
//       ) : (
//         <div>{currentBudgetName}</div>
//       )}
//       <span>budget name</span>
//       {}
//       <div className="date-column">
//         opening balance
//         {generateDates().map((date, index) => (
//           <div
//             key={date.toString()}
//             className="date-row"
//             style={{
//               borderBottom: getDayOfWeek(date) === weekEnd && "1px solid black",
//             }}
//           >
//             <div style={{ display: "flex", flexDirection: "row" }}>
//               <div
//                 style={{
//                   display: "flex",
//                   flexDirection: "column",
//                   alignItems: "flex-end",
//                 }}
//               >
//                 <span className="date">{formatDate(date, "DD MMM YYYY")}</span>
//                 <span className="day">{getDayOfWeek(date)}</span>
//               </div>
//               <div
//                 className="placeholder"
//                 onDoubleClick={() =>
//                   handleOpenModal(formatDate(date, "DD MMM YYYY"))
//                 }
//               >
//                 Double click to enter new
//               </div>

//               {/* <div
//                 value={tedtestBudget}
//                 onChange={(e) => handleTedTest(e)}
//                 placeholder={"eneter details"}
//               ></div> */}
//               {/* <button className="edit-button" onClick={(e) => handleEdit(e)}>
//                 <FaRegEdit size={20} />
//                 <span style={{ marginLeft: "0.5rem" }}>Edit</span>
//               </button> */}
//             </div>
//             {/* <div className="form">
//               <input
//                 type="number"
//                 placeholder="Income"
//                 onChange={(e) =>
//                   handleInputChange(date, "income", e.target.value)
//                 }
//               />
//               <input
//                 type="number"
//                 placeholder="Expenses"
//                 onChange={(e) =>
//                   handleInputChange(date, "expenses", e.target.value)
//                 }
//               />
//               <select
//                 onChange={(e) =>
//                   handleInputChange(date, "category", e.target.value)
//                 }
//               >
//                 <option value="">Select Category</option>
//                 {categories.map((cat) => (
//                   <option key={cat} value={cat}>
//                     {cat}
//                   </option>
//                 ))}
//               </select>
//               <input
//                 type="checkbox"
//                 onChange={(e) =>
//                   handleInputChange(date, "repeat", e.target.checked)
//                 }
//               />{" "}
//               Repeat
//             </div> */}
//           </div>
//         ))}
//       </div>
//       {isModalOpen && (
//         <Modals
//           title="Budget entry"
//           noBckgrnd={true}
//           onClose={() => handleCloseModal()}
//           footer={
//             <div>
//               <button
//                 className="main_buttons"
//                 type="button"
//                 onClick={() => {
//                   handleSave();
//                 }}
//               >
//                 Submit
//               </button>
//               <button onClick={handleCloseModal}>Close</button>
//             </div>
//           }
//         >
//           <div>{currentDate}</div>
//           {/* <h2>{currentDate}</h2> */}
//           <div className="form">
//             <input
//               type="number"
//               placeholder="Income"
//               onChange={(e) => handleSave("income", e.target.value)}
//             />
//             <input
//               type="number"
//               placeholder="Expenses"
//               onChange={(e) => handleSave("expenses", e.target.value)}
//             />
//             <select onChange={(e) => handleSave("category", e.target.value)}>
//               <option value="">Select Category</option>
//               {[
//                 "Food",
//                 "Transport",
//                 "Utilities",
//                 "Entertainment",
//                 "Others",
//               ].map((cat) => (
//                 <option key={cat} value={cat}>
//                   {cat}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </Modals>
//       )}
//     </div>
//   );
// };

// export default BudgetNew;
