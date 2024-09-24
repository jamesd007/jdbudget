// import React, { useState, useEffect, useContext } from "react";
// import "../styles/EditStyles.css";
// import "../styles/MainStyles.css";
// import {
//   deleteTransaction,
//   getAllTransactions,
//   updateTransaction,
// } from "../store/Dexie";
// import EditTable from "../utils/EditTable";
// import { FaRegTrashAlt, FaRegSave } from "react-icons/fa";
// import Modals from "../utils/Modals";
// import { useDataContext } from "../providers/DataProvider";

// const EditData = () => {
//   const [allTrans, setAllTrans] = useState([]);
//   const [checkedTransactions, setCheckedTransactions] = useState([]);
//   const iconSize = 20;
//   const [deleteConfirm, setDeleteConfirm] = useState(false);
//   const [originalValue, setOriginalValue] = useState({});
//   const { currentAccNumber } = useDataContext();
//   const warningText = `
//   WARNING
//   Selected data is deleted from your database.
//   The data cannot be recovered.
//   Backup data first if unsure.
//   `;
//   // Fetch transactions when component mounts
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const transactions = await getAllTransactions(currentAccNumber);
//         setAllTrans(transactions);
//       } catch (error) {
//         console.error("Error retrieving transactions:", error);
//       }
//     };

//     fetchData();
//   }, []);

//   // useEffect(() => {
//   //   getAllTransactions(currentAccNumber)
//   //     .then((item) => {
//   //       setAllTrans(item);
//   //     })
//   //     .catch((error) => {
//   //       console.error("Error retrieving transactions:", error);
//   //     });

//   //   return () => {};
//   // }, []);

//   // const fetchAllTrans = async () => {
//   //   // Fetch transactions from the database and set to allTrans
//   //   const transactions = await getAllTransactions(currentAccNumber);
//   //   setAllTrans(transactions);
//   // };

//   const handleProceed = async () => {
//     if (checkedTransactions.length > 0) {
//       for (let id of checkedTransactions) {
//         await deleteTransaction(id);
//       }
//       setCheckedTransactions([]);
//       setDeleteConfirm(false);

//       // Fetch updated transactions after deletion
//       try {
//         const updatedTransactions = await getAllTransactions(currentAccNumber);
//         setAllTrans(updatedTransactions);
//         console.log("Updated transactions:", updatedTransactions);
//       } catch (error) {
//         console.error("Error retrieving updated transactions:", error);
//       }
//     } else {
//       setDeleteConfirm(false);
//     }
//   };

//   // const handleProceed = async () => {
//   //   if (checkedTransactions?.length > 0) {
//   //     for (let id of checkedTransactions) {
//   //       await deleteTransaction(id);
//   //     }

//   //     getAllTransactions(currentAccNumber)
//   //       .then((item) => {
//   //         setAllTrans(item);
//   //       })
//   //       .catch((error) => {
//   //         console.error("Error retrieving transactions:", error);
//   //       });
//   //     setCheckedTransactions([]);
//   //     // Refresh the transactions list
//   //     // const transactions = await getAllTransactions(currentAccNumber);
//   //     // setAllTrans(transactions);
//   //     // await fetchAllTrans();
//   //   }
//   //   setDeleteConfirm(false);
//   // };

//   // const handleSave = () => {
//   // Save the transactions
//   //can i tell which entries are changed? maybe save whenever an entry is edited?
//   // };

//   const handleFocus = (e, index) => {
//     const { name, value } = e.target;
//     setOriginalValue({
//       ...originalValue,
//       [index]: { ...originalValue[index], [name]: value },
//     });
//   };

//   const handleBlur = async (e, index, updatedTransactions) => {
//     const { name } = e.target;
//     const item = updatedTransactions[index];

//     if (originalValue[index] && originalValue[index][name] !== item[name]) {
//       console.log(`Field ${name} for item ${index} was changed`);
//       await updateTransaction(item.id, { [name]: item[name] });
//     } else {
//       console.log(`Field ${name} for item ${index} was not changed`);
//     }

//     try {
//       const updatedData = await getAllTransactions(currentAccNumber);
//       setAllTrans(updatedData);
//       console.log("Updated transactions:", updatedData);
//     } catch (error) {
//       console.error("Error retrieving updated transactions:", error);
//     }
//   };

//   // const handleBlur = async (e, index) => {
//   //   const { name } = e.target;
//   //   const item = allTrans[index];
//   //   if (originalValue[index] && originalValue[index][name] !== item[name]) {
//   //     await updateTransaction(item.id, { [name]: item[name] });
//   //   }

//   //   try {
//   //     const updatedTransactions = await getAllTransactions(currentAccNumber);
//   //     setAllTrans(updatedTransactions);
//   //     console.log("Updated transactions:", updatedTransactions);
//   //   } catch (error) {
//   //     console.error("Error retrieving updated transactions:", error);
//   //   }
//   // };

//   return (
//     <div>
//       <div className="display-container">
//         {allTrans && allTrans?.length > 0 ? (
//           <EditTable
//             checkedTransactions={setCheckedTransactions}
//             transactions={allTrans}
//             setTransactions={setAllTrans}
//             handleBlur={handleBlur}
//             handleFocus={handleFocus}
//           />
//         ) : (
//           <p>No data found</p>
//         )}
//       </div>
//       <div className="button_grid">
//         <button
//           className="main_buttons"
//           disabled={checkedTransactions?.length <= 0}
//           onClick={() => setDeleteConfirm(true)}
//         >
//           <FaRegTrashAlt size={iconSize * 0.9} />
//           Delete
//         </button>
//         {/* <button className="main_buttons" onClick={handleSave}>
//           <FaRegSave size={iconSize} />
//           Save
//         </button> */}
//       </div>
//       {deleteConfirm && (
//         <Modals
//           title="Delete"
//           noBckgrnd={true}
//           onClose={() => setDeleteConfirm(false)}
//           footer={
//             <div>
//               <button
//                 // className={"UI-button-service"}
//                 type="button"
//                 onClick={handleProceed}
//               >
//                 Proceed
//               </button>
//               <button
//                 // className={"UI-button-service"}
//                 type="button"
//                 onClick={() => setDeleteConfirm(false)}
//               >
//                 Cancel
//               </button>
//             </div>
//           }
//         >
//           <pre>{warningText}</pre>
//         </Modals>
//       )}
//     </div>
//   );
// };

// export default EditData;
