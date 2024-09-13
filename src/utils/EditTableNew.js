import React, {
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
  useCallback,
} from "react";
import "../styles/CheckBox.css";
import db from "../store/Dexie";
import { getAllCategories } from "../store/Dexie";
import CategoryModal from "./../components/categories/CategoryModal";

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
  const [openCatModal, setOpenCatModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editedTransactions, setEditedTransactions] = useState(transactions);
  const [allCategories, setAllCategories] = useState([]);
  const [currentDate, setCurrentDate] = useState(null);

  useEffect(() => {
    console.log("tedtestcc editableTransactions=", editableTransactions);
  }, [editableTransactions]);

  useEffect(() => {
    console.log("tedtestcc transactions=", transactions);
    setEditableTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    console.log("tedtestCC transactions=", transactions);
    console.log("tedtestCC setTransactions=", setTransactions);
    console.log("tedtestCC checkedTransactions=", checkedTransactions);
    console.log("tedtestCC handleBlur=", handleBlur);
    console.log("tedtestCC handleFocus=", handleFocus);
    console.log("tedtestCC colWidthArr=", colWidthArr);
    console.log("tedtestCC headers=", headers);
    console.log("tedtestCC cantEditArray=", cantEditArray);
    console.log("tedtestCC ...props=", props);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const uniqueCategories = await db.transactions
          .orderBy("category_description")
          .uniqueKeys();
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

  useEffect(() => {
    //getExistingCategories from dbase
    const getTheCategories = async () => {
      try {
        let catRecs = await getAllCategories();
        setAllCategories(catRecs);
      } catch (error) {
        console.error("Error retrieving categories:", error);
      }
    };
    getTheCategories();
  }, [openCatModal]);

  const handleCreateNewCategory = async () => {
    setOpenCatModal(true);
  };

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

  const handleInputChange = (date, field, value) => {
    console.log(
      "tedtestC handleInputChange date=",
      date,
      " field=",
      field,
      " value=",
      value
    );
    // setBudgetData((prevData) => ({
    //   ...prevData,
    //   budgetName: budgetName,
    //   [field]: value,
    //   date: date || new Date(),
    //   user_id: prevData.user_id || user.id,
    // }));
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
                  {headers?.map((item, index) => (
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
              {editableTransactions !== undefined &&
                editableTransactions?.map((transaction, index) => {
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
                                  handleBlur(
                                    e,
                                    index,
                                    editableTransactions,
                                    key
                                  )
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
                                onChange={(e) =>
                                  handleDataChange(e, index, key)
                                }
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
      {openCatModal && (
        <CategoryModal
          title="Categories"
          setOpenCatModal={setOpenCatModal}
          db={db}
          setCatDescription={(val) =>
            handleInputChange(currentDate, "category", val)
          }
        />
      )}
    </div>
  );
};

export default EditTableNew;
