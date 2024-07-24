import React, {
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
  useCallback,
} from "react";
import "../styles/CheckBox.css";
import db from "../store/Dexie";

const EditTableNew = ({
  transactions,
  setTransactions,
  checkedTransactions,
  handleBlur,
  handleFocus,
  colWidthArr,
  headers,
  cantEditArray,
  ...props
}) => {
  const [selectedRows, setselectedRows] = useState([]);
  const [editableTransactions, setEditableTransactions] =
    useState(transactions);
  const [categories, setCategories] = useState([]);
  //   "new",
  //   // "salary after deductions",
  //   // "commission",
  //   // "pension",
  //   // "provident fund",
  //   // "investments",
  //   // "interest received",
  //   // "other",
  //   // "mortgage/bond repayments",
  //   // "hire purchase payments",
  //   // "rent",
  //   // "loan repayments",
  //   // "insurance",
  //   // "utilities",
  //   // "communications",
  // ];
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editedTransactions, setEditedTransactions] = useState(transactions);

  useEffect(() => {
    setEditableTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const uniqueCategories = await db.transactions
          .orderBy("category_description")
          .uniqueKeys();
        console.log("tedtesta uniquecategories=", uniqueCategories);
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // useEffect(() => {
  //   const keys = new Set();
  //   transactions.forEach((transaction) => {
  //     Object.keys(transaction).forEach((key) => keys.add(key));
  //   });
  //   setUniqueKeys(Array.from(keys));
  // }, [transactions]);

  const handleCheckboxChange = (event, id) => {
    const isChecked = event.target.checked;
    // setScrollPosition(tableRef.current.scrollTop);
    if (isChecked) {
      setselectedRows((prevState) => [...prevState, id]);
    } else {
      setselectedRows((prevState) => prevState.filter((item) => item !== id));
    }
  };

  useEffect(() => {
    checkedTransactions(selectedRows);
  }, [selectedRows]);

  // useLayoutEffect(() => {
  // Restore the scroll position after the state has been updated and the component has re-rendered
  // if (tableRef.current) {
  //   tableRef.current.scrollTop = scrollPosition;
  // }
  // });

  const handleSelectAll = () => {
    if (selectedRows?.length === transactions?.length) {
      setselectedRows([]);
    } else {
      setselectedRows(transactions?.map((item) => item.id));
    }
  };

  const generateGridTemplateColumns = () => {
    if (props?.colWidth) {
      return `repeat(${headers?.length + 1}, ${props?.colWidth})`;
    } else if (colWidthArr && colWidthArr.length > 0) {
      return `${colWidthArr.join(" ")}`;
    } else {
      return `repeat(${headers?.length + 2}, 3rem)`; // +2 for the extra column with 2rem width
    }
  };

  const handleDataChange = (e, index) => {
    const { name, value } = e.target;
    const updatedTransactions = [...editableTransactions];
    updatedTransactions[index] = {
      ...updatedTransactions[index],
      [name]: value,
    };
    setEditableTransactions(updatedTransactions);
    setTransactions(updatedTransactions); // Update parent state
  };

  // const handleDataChange = (e, index, key) => {
  //   const newTransactions = [...editedTransactions];
  //   newTransactions[index] = {
  //     ...newTransactions[index],
  //     [key]: e.target.value,
  //   };
  //   setEditedTransactions(newTransactions);
  // };

  const handleCategoryChange = (e, index) => {
    setSelectedCategory(e.target.value);
    const { name, value } = e.target;
    const updatedTransactions = [...editableTransactions];
    updatedTransactions[index] = {
      ...updatedTransactions[index],
      category_description: e.target.value,
    };
    setEditableTransactions(updatedTransactions);
    setTransactions(updatedTransactions); // Update parent state
  };

  return (
    <div>
      <div className="edit-table-content">
        {transactions && transactions?.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th
                  className="checkbox-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: generateGridTemplateColumns(),
                    fontSize: "0.9rem",
                    borderBottom: "1px solid black",
                  }}
                >
                  {/* <span></span> */}
                  {headers.map((item, index) => (
                    <span key={index}>{item}</span>
                  ))}
                </th>
              </tr>
              {/* <div style={{ marginLeft: "2rem" }}>
                <label
                  // className="checkbox-row no-scrollbar"
                  style={{ width: "90vw", maxWidth: "fit-content" }}
                >
                  <input
                    style={{
                      marginLeft: "0",
                    }}
                    type="checkbox"
                    checked={selectedRows?.length === transactions?.length}
                    onChange={handleSelectAll}
                  />
                  Select All
                </label>
              </div> */}
            </thead>
            <tbody>
              {editableTransactions.map((transaction, index) => {
                return (
                  <tr key={transaction.id} className="header-row">
                    <td
                      className="edit-checkbox-row"
                      style={{
                        display: "grid",
                        gridTemplateColumns: generateGridTemplateColumns(),
                      }}
                    >
                      {/* <input
                        type="checkbox"
                        checked={selectedRows.includes(transaction.id)}
                        onChange={(e) =>
                          handleCheckboxChange(e, transaction.id)
                        }
                      /> */}
                      {/* {headers.map((key, keyIndex) => (
                        <td key={keyIndex}>
                          {transaction[key] !== undefined
                            ? transaction[key]
                            : ""}
                        </td>
                      ))} */}
                      {headers.map((key, keyIndex) => (
                        <td key={keyIndex}>
                          {key === "category_description" ? (
                            <select
                              style={{
                                width: colWidthArr[keyIndex],
                                // backgroundColor: (transaction[key] = ""
                                //   ? "yellow"
                                //   : {}),
                              }}
                              value={transaction[key] || ""}
                              onChange={(e) => handleCategoryChange(e, index)}
                              onFocus={(e) => handleFocus(e, index)}
                              onBlur={(e) =>
                                handleBlur(e, index, editableTransactions, key)
                              }
                            >
                              <option value="" disabled>
                                Select a category
                              </option>
                              {categories?.map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>
                          ) : cantEditArray.includes(key) ? (
                            <span>{transaction[key]}</span>
                          ) : (
                            <input
                              style={{
                                width: colWidthArr[keyIndex],
                              }}
                              type="text"
                              value={transaction[key] || ""}
                              onChange={(e) => handleDataChange(e, index, key)}
                              onFocus={(e) => handleFocus(e, index)}
                              onBlur={(e) =>
                                handleBlur(e, index, editedTransactions)
                              }
                            />
                          )}
                        </td>
                        // <td key={keyIndex}>
                        //   {key === "category_description" ? (
                        //     <select
                        //       style={{
                        //         width: colWidthArr[keyIndex],
                        //       }}
                        //       value={transaction[key] || selectedCategory}
                        //       onChange={(e) => handleChange(e, index)}
                        //     >
                        //       <option value="" disabled>
                        //         Select a category
                        //       </option>
                        //       {categories.map((category) => (
                        //         <option key={category} value={category}>
                        //           {category}
                        //         </option>
                        //       ))}
                        //     </select>
                        //   ) : (
                        //     <input
                        //       style={{
                        //         width: colWidthArr[keyIndex],
                        //       }}
                        //       type="text"
                        //       value={transaction[key]}
                        //       onChange={(e) => handleDataChange(e, index)}
                        //       onFocus={(e) => handleFocus(e, index)}
                        //       onBlur={(e) => handleBlur(e, index, transactions)}
                        //     ></input>
                        //   )}
                        //   {/* {transaction[key] !== undefined
                        //     ? transaction[key]
                        //     : ""} */}
                        // </td>
                      ))}
                      {/* <input
                        type="text"
                        name="date"
                        value={transaction.date}
                        onChange={(e) => handleDataChange(e, index)}
                        onFocus={(e) => handleFocus(e, index)}
                        onBlur={(e) =>
                          handleBlur(e, index, transactions)
                        }
                      /> */}
                    </td>
                    {/* {headers.map((key, keyIndex) => (
                    <td key={keyIndex}>
                      {transaction[key] !== undefined ? transaction[key] : ""}
                    </td>
                  ))} */}
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p>No data found</p>
        )}
      </div>
    </div>
  );
};

export default EditTableNew;
