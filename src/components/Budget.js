// import React, { useEffect, useState } from "react";
// import categoryDefaults from "../data/categoryDefaults";
// import CheckboxTable from "../utils/CheckBoxTable";
// import "../styles/Budget.css";
// import YearPicker from "../utils/YearPicker";
// import {
//   getAllBudgets,
//   // addBudget,
//   // deleteBudget,
//   // updateBudget,
// } from "../store/Dexie";
// import db from "../store/Dexie";

// const Budget = () => {
//   const [income, setIncome] = useState();
//   const [startMonth, setStartMonth] = useState("March");
//   const currentYear = new Date().getFullYear();
//   const [budgetStartYear, setBudgetStartYear] = useState(currentYear);
//   const [budgetEndYear, setBudgetEndYear] = useState(currentYear);
//   const [categories, setCategories] = useState(categoryDefaults);
//   const [checkedAccs, setCheckedAccs] = useState();
//   const defaultBudgetMonths = [
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//     "January",
//     "February",
//   ];
//   const [budgetMonths, setBudgetMonths] = useState(defaultBudgetMonths);
//   const [budgetData, setBudgetData] = useState([]);
//   const [allBudgets, setAllBudgets] = useState();
//   const [budgetName, setBudgetName] = useState();
//   const months = [
//     "January",
//     "February",
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//   ];

//   useEffect(() => {
//     getAllBudgets()
//       .then((budget) => {
//         setAllBudgets(budget);
//       })
//       .catch((error) => {
//         console.error("Error retrieving accounts:", error);
//       });
//     // setDbChange(false);
//     return () => {};
//   }, []);

//   useEffect(() => {
//     const tempArray = [];
//     categories.forEach((category) => {
//       const categoryData = Array.from(
//         { length: defaultBudgetMonths.length },
//         () => 0
//       );
//       tempArray.push({ category, data: categoryData, total: 0 });
//     });
//     setBudgetData(tempArray);
//   }, []);

//   const handleAddCategory = (type) => {
//     const newCategory = prompt(`Enter new ${type}:`);
//     if (newCategory) {
//       setCategories([
//         ...categories,
//         { name: newCategory, type: { type }, group: "none" },
//       ]);
//     }
//   };

//   const handleDeleteCategory = (index) => {
//     const newCategory = [...categoryDefaults];
//     newCategory.splice(index, 1);
//     setCategories(newCategory);
//   };

//   const handleIncome = (val) => {
//     setIncome(val);
//   };

//   const getMonthIndex = (month) => {
//     return months.indexOf(month);
//   };

//   const getEndMonth = (month) => {
//     if (getMonthIndex(month) === 0) return months.length - 1;
//     else return getMonthIndex(month) - 1;
//   };

//   const handleRadioChange = (e) => {
//     setStartMonth(e.target.value);
//     let tempBudgetMonths = [];
//     for (let x = getMonthIndex(e.target.value); x < months.length; x++) {
//       tempBudgetMonths.push(months[x]);
//     }
//     for (let x = 0; x < getMonthIndex(e.target.value); x++) {
//       tempBudgetMonths.push(months[x]);
//     }
//     setBudgetMonths(tempBudgetMonths);
//   };

//   const handleStartYear = (e) => {
//     setBudgetStartYear(e.target.value);
//   };

//   useEffect(() => {
//     if (getEndMonth(startMonth) === 0) setBudgetEndYear(budgetStartYear);
//     else setBudgetEndYear(budgetStartYear + 1);
//   }, [budgetStartYear]);

//   const handleDataChange = (categoryName, index, e) => {
//     const inputValue = e.target.value;
//     const numericValue = inputValue.replace(/[^0-9.,]/g, "");
//     setBudgetData((prevBudgetData) => {
//       const newData = prevBudgetData.map((item) => {
//         if (item.category === categoryName) {
//           // Create a new array with the updated value
//           const updatedData = [...item.data];
//           updatedData[index] = numericValue;
//           let total = 0;
//           for (let i = 0; i < 12; i++) total = parseFloat(item.data[i]) + total;
//           return { ...item, data: updatedData, total: total };
//         }
//         return item;
//       });
//       return newData;
//     });
//   };

//   const handleBudgetName = (e) => {
//     setBudgetName(e.target.value);
//   };

//   const saveBudget = async () => {
//     // Save the user's details to the Dexie database
//     try {
//       await db.budget.add({
//         name: budgetName,
//         year: currentYear,
//         budgetData: budgetData,
//       });
//       alert("budget saved");
//     } catch (error) {
//       console.error("ERROR saving budget:", error);
//       alert("budget save failed");
//     }
//   };

//   return (
//     <div
//       style={{
//         position: "absolute",
//         marginLeft: "1rem",
//         top: "1rem",
//       }}
//     >
//       <h2>BUDGET</h2>
//       <div
//         style={{
//           // poaition: "absolute",
//           height: "6rem",
//           width: "70vw",
//           backgroundColor: "antiquewhite",
//           // left: "1rem",
//           overflowY: "auto",
//           overflow: "hidden",
//         }}
//       >
//         <span>budget name - </span>
//         <br />
//         <span>current year - </span>
//         <br />
//         <span>start month - </span>
//         <br />
//         <span>budget period -</span>
//       </div>
//       <br />
//       <div
//         style={{
//           height: "50vh",
//           width: "70vw",
//           backgroundColor: "antiquewhite",
//         }}
//       >
//         workspace
//       </div>

//       <h3 title="this is the starting point of all further budgets, month may be in the past. budget are calculated for `12 month period">
//         Select starting month for budget
//       </h3>
//       {/* <YearPicker /> */}
//       <label htmlFor="inputField" className="label">
//         Enter budget year:
//       </label>
//       <input type="text" id="inputField" className="budget-input" />
//       <label>Enter year for budget</label>
//       <input
//         value={budgetStartYear}
//         onChange={handleStartYear}
//         placeholder={currentYear}
//       ></input>

//       <form>
//         {months.map((month, index) => (
//           <div key={index}>
//             <label key={month}>
//               <input
//                 type="radio"
//                 value={month}
//                 checked={startMonth === month}
//                 onChange={handleRadioChange}
//               />
//               {month}
//             </label>
//             <br />
//           </div>
//         ))}
//       </form>
//       <p>Start month: {startMonth}</p>
//       <p>
//         Budgting period: {startMonth} {budgetStartYear} to{" "}
//         {months[getEndMonth(startMonth)]}{" "}
//         {getMonthIndex(startMonth) === 0 ? budgetStartYear : budgetEndYear}
//       </p>
//       {/* <label>
//         Enter Income:
//         <input
//           type="number" // Add this to ensure only numbers can be entered
//           onChange={(e) => {
//             handleIncome(e.target.value); // Pass the new value directly to the handler
//           }}
//         />
//       </label> */}
//       <div>
//         <h2>Categories</h2>
//         <CheckboxTable
//           array={false}
//           objects={true}
//           checkAccs={(chkdArr) => setCheckedAccs(chkdArr)}
//           checkboxData={categoryDefaults}
//           headers={["Name", "Type", "Group"]}
//         />
//       </div>
//       <div className="budget-table-container">
//         <h2>Create / edit Budget</h2>
//         <h3>{currentYear}</h3>
//         <table>
//           <thead>
//             <tr className="budgetRow">
//               <td></td>
//               {budgetMonths?.map((item, index) => (
//                 <td className="budgetCell" key={index}>
//                   {item}
//                 </td>
//               ))}
//               <td
//                 className="budgetCell"
//                 style={{ width: "3rem", fontWeight: "bold" }}
//               >
//                 Total
//               </td>
//             </tr>
//           </thead>
//           <tbody>
//             {categories?.map((category, rowIndex) => (
//               <tr key={rowIndex} className="budgetRow">
//                 <td className="budgetHeader">{category.name}</td>
//                 {budgetData
//                   .find((item) => item.category === category)
//                   ?.data.map((data, colIndex) => (
//                     <td className="budgetCell" key={colIndex}>
//                       <input
//                         style={{
//                           border: "1px blue solid",
//                           width: "4rem",
//                           textAlign: "right",
//                           right: "0",
//                         }}
//                         type="text"
//                         value={data}
//                         onChange={(e) =>
//                           handleDataChange(category, colIndex, e)
//                         }
//                       />
//                     </td>
//                   ))}
//                 <td
//                   className="budgetCell"
//                   style={{ width: "6rem", fontWeight: "bold" }}
//                 >
//                   {budgetData.find((item) => item.category === category)?.total}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//       <label>budget name : </label>
//       <input onChange={handleBudgetName}></input>
//       <button onClick={() => saveBudget()}>Save the budget</button>
//     </div>
//   );
// };

// export default Budget;
