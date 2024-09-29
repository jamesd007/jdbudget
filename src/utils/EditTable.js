import React, { useEffect, useState, useContext } from "react";
import styles from "../styles/EditTable.module.css";
import dayjs from "dayjs";
import { getAllCategories, updateTransaction } from "../store/Dexie";
import CategoryModal from "./../components/categories/CategoryModal";
import db from "../store/Dexie";
import { useDataContext } from "../providers/DataProvider";
import { UserContext } from "../contexts/UserContext";

const EditTable = ({
  transactions,
  setTransactions,
  checkedTransactions,
  handleBlur,
  handleFocus,
  ...props
}) => {
  const [selectedRows, setselectedRows] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [openCatModal, setOpenCatModal] = useState(false);
  const [startBalance, setStartBalance] = useState(null);
  const [editableTransactions, setEditableTransactions] = useState([]);
  const [transactionsWithBalance, setTransactionsWithBalance] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const { currentAccNumber, setCurrentAccNumber } = useDataContext();
  const { user } = useContext(UserContext);
  const [userAccounts, setUserAccounts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [currentId, setCurrentId] = useState(null);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const incexpcats = ["income", "expenses"];

  const getLastAccountNumber = async () => {
    let rec;
    try {
      rec = await db.users.where("id").equals(user.id).first();
      return rec.last_account;
    } catch (error) {
      console.error("Error getting last account number", error);
    }
  };

  useEffect(() => {
    //returns all transaction accounts for this user
    const getAccountsForUser = async () => {
      try {
        const accounts = await db.transactiondetails
          .where({ user_id: user.id })
          .toArray();

        if (accounts && accounts.length > 0) {
          let tmpAccNumber = await getLastAccountNumber();
          setCurrentAccNumber(tmpAccNumber);
        }
        return accounts.map((acc) => acc.account_id);
      } catch (error) {
        console.error("Error fetching transaction accounts", error);
        return null; // or handle the error as needed
      }
    };
    const fetchAccNumber = async () => {
      setUserAccounts(await getAccountsForUser());
    };

    fetchAccNumber();
  }, []);

  // const getDateFromObject = ({ day, month, year }) => {
  //   const monthIndex = months.indexOf(month); // Convert month name to index
  //   return new Date(year, monthIndex, day);
  // };

  const getDayOfWeek = (date) => {
    return dayjs(date).format("ddd");
  };

  useEffect(() => {
    if (startBalance !== null && editableTransactions.length > 0) {
      let currentBalance = startBalance;
      const updatedTransactions = editableTransactions.map((transaction) => {
        if (transaction.transactiontype === "expenses")
          currentBalance -= parseFloat(
            parseFloat(transaction.amount).toFixed(2)
          );
        else
          currentBalance += parseFloat(
            parseFloat(transaction.amount).toFixed(2)
          );
        return {
          ...transaction,
          balance: currentBalance.toFixed(2),
        };
      });
      setTransactionsWithBalance(updatedTransactions);
    }
  }, [startBalance, editableTransactions]);

  useEffect(() => {
    const getOpeningBalance = async () => {
      try {
        const accounts = await db.transactiondetails
          .where({
            user_id: user.id,
            account_id: currentAccNumber.toString(),
          })
          .first();

        if (accounts && accounts.openingbalance) {
          setStartBalance(parseFloat(accounts.openingbalance));
        } else {
          setStartBalance(0); // Or handle the case where openingBalance is not available
        }
        await db.users.update(user.id, { last_account: currentAccNumber });
      } catch (error) {
        console.log("Error getting opening balance", error);
        setStartBalance(0); // Handle error by setting a default value
      }
    };
    getOpeningBalance();
  }, [currentAccNumber]);

  useEffect(() => {
    setEditableTransactions(transactions);
  }, [transactions]);

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

  // const handleEditTransaction = (id, updatedData) => {
  //   setTransactionsWithBalance((prevTransactions) =>
  //     prevTransactions.map((transaction) =>
  //       transaction.id === id ? { ...transaction, ...updatedData } : transaction
  //     )
  //   );
  // };

  const handleDataChange = (e, index, id) => {
    const { name, value } = e.target;
    let newVal;
    if (name === "amount" && typeof value === "string")
      newVal = parseFloat(value);
    else newVal = value;
    const updatedTransactions = [...editableTransactions];
    updatedTransactions[index] = {
      ...updatedTransactions[index],
      [name]: newVal,
    };
    setEditableTransactions(updatedTransactions);
    setTransactions(updatedTransactions); // Update parent state
    // setTransactionsWithBalance(updatedTransactions);
  };

  const handleSelectAll = () => {
    if (selectedRows?.length === transactions?.length) {
      setselectedRows([]);
    } else {
      setselectedRows(transactions?.map((item) => item.id));
    }
  };

  // const formatDate = (date, format) => {
  //   return dayjs(date).format(format);
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

  const handleCreateNewCategory = async (index, id) => {
    setOpenCatModal(true);
    setCurrentIndex(index);
    setCurrentId(id);
  };

  // const handleCategoryChange = (e, index) => {
  //   setSelectedCategory(e.target.value);
  //   const { name, value } = e.target;
  //   const updatedTransactions = [...editableTransactions];
  //   updatedTransactions[index] = {
  //     ...updatedTransactions[index],
  //     category_description: e.target.value,
  //   };
  //   setTransactionsWithBalance(updatedTransactions);
  //   setTransactions(updatedTransactions); // Update parent state
  // };

  const handleInputChange = async (field, value, index, id) => {
    const updatedTransactions = [...transactionsWithBalance];
    updatedTransactions[index] = {
      ...updatedTransactions[index],
      [field]: value,
    };
    // setTransactionsWithBalance(updatedTransactions);
    setTransactions(updatedTransactions);
    try {
      let result = await updateTransaction(id, {
        [field]: updatedTransactions[index][field],
      });
      if (result) {
        console.log("updated Category successful");
      }
    } catch (error) {
      console.error("Error adding new transaction:", error.message);
    }
  };

  const SearchableDropdown = ({ allCategories, index, id }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const sortedCategories = [...allCategories].sort((a, b) =>
      a.category_description.localeCompare(b.category_description)
    );

    const handleSearchChange = (e) => {
      setSearchTerm(e.target.value);
    };

    const filteredCategories = sortedCategories.filter((catRec) =>
      catRec.category_description
        .toLowerCase()
        .startsWith(searchTerm.toLowerCase())
    );

    return (
      <div
        className={styles.category}
        name={styles.category}
        style={{ width: "100%" }}
      >
        <input
          style={{ display: "none" }}
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <select
          style={{ padding: "0.1rem" }}
          onChange={(e) => {
            const selectedValue = e.target.value;
            if (selectedValue === "new") {
              handleCreateNewCategory(index, id);
            } else {
              handleInputChange(
                "category_description",
                selectedValue,
                index,
                id
              );
            }
          }}
          value={transactions[index].category_description || ""}
        >
          {filteredCategories.map((catRec) => (
            <option key={catRec.id} value={catRec.category_description}>
              {catRec.category_description}
            </option>
          ))}
          <option value="new" style={{ fontWeight: "bold" }}>
            New Category
          </option>{" "}
          <option disabled value="">
            -- select an option --{" "}
          </option>
        </select>
      </div>
    );
  };

  return (
    <div>
      {transactions && transactions?.length > 0 ? (
        <div>
          <table className={styles.edittable}>
            <thead>
              <tr>
                <th className={styles.editcheckbox}></th>
                <th className={styles.date}>Date</th>
                <th className={styles.day}>Day</th>
                <th className={styles.description}>Description</th>
                <th className={styles.category}>Category</th>
                <th className={styles.incexp}>inc/exp</th>
                <th className={styles.dr}>Dr</th>
                <th className={styles.cr}>Cr</th>
                <th className={styles.balance}>Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="8">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedRows?.length === transactions?.length}
                  />
                  Select all
                </td>
              </tr>
              <tr>
                <td className={styles.editcheckbox}></td>
                <td className={styles.date}> </td>
                <td className={styles.day}></td>
                <td className={styles.description}>Opening balance</td>
                <td className={styles.category}></td>
                <td className={styles.incexp}></td>
                <td className={styles.dr}></td>
                <td className={styles.cr}></td>

                <td className={styles.balance}>
                  {(startBalance || 0.0).toFixed(2)}
                </td>
              </tr>
              {startBalance !== null && editableTransactions.length > 0 ? (
                transactionsWithBalance.map((item, index) => {
                  return (
                    <tr key={item.id}>
                      <td //checkbox
                        className={styles.editcheckbox}
                        style={{
                          width: "1rem",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(item.id)}
                          onChange={(e) => handleCheckboxChange(e, item.id)}
                        />
                      </td>
                      <td //date
                        className={styles.date}
                      >
                        <input
                          className={styles.date}
                          type="date"
                          name="date"
                          value={
                            //TODO tedtest if a line has incorrect format it may cause an item.date with invalid data
                            //TODO tedtest need to check the format - that it is a date- as well as existence of item.date
                            item.date
                              ? new Date(item.date).toISOString().split("T")[0] // Format as YYYY-MM-DD
                              : ""
                          }
                          onChange={(e) => handleDataChange(e, index, item.id)}
                          onFocus={(e) => handleFocus(e, index)}
                          onBlur={(e) =>
                            handleBlur(e, index, editableTransactions)
                          }
                        />
                      </td>
                      <td //day
                        className={styles.day}
                      >
                        {getDayOfWeek(item.date)}
                      </td>
                      <td //description
                        className={styles.description}
                      >
                        <input
                          className="tableinput"
                          style={{ width: "100%", boxSizing: "border-box" }}
                          type="text"
                          name="description"
                          value={item.description}
                          onChange={(e) => handleDataChange(e, index, item.id)}
                          onFocus={(e) => handleFocus(e, index)}
                          onBlur={(e) =>
                            handleBlur(e, index, editableTransactions)
                          }
                        />
                      </td>
                      <td //category"
                      // className={styles.category}
                      >
                        <SearchableDropdown
                          allCategories={allCategories}
                          index={index}
                          id={item.id}
                        />
                      </td>
                      <td className={styles.incexp}>
                        <select
                          name="transactiontype"
                          onFocus={(e) => handleFocus(e, index)}
                          onBlur={(e) =>
                            handleBlur(e, index, editableTransactions)
                          }
                          onChange={(e) => {
                            // const selectedValue = e.target.value;
                            handleDataChange(e, index);
                          }}
                          value={item.transactiontype}
                        >
                          {incexpcats.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td //dr"
                        className={styles.dr}
                      >
                        <input
                          className={styles.dr}
                          type="number"
                          name="amount"
                          value={
                            item.transactiontype === "expenses" &&
                            // parseFloat(item.amount).toFixed(2)
                            item.amount
                          }
                          onChange={(e) => handleDataChange(e, index)}
                          onFocus={(e) => handleFocus(e, index)}
                          onBlur={(e) =>
                            handleBlur(e, index, editableTransactions)
                          }
                        />
                      </td>
                      <td className={styles.cr}>
                        <input
                          className={styles.cr}
                          type="number"
                          name="amount"
                          value={
                            item.transactiontype === "income" && item.amount
                          }
                          onChange={(e) => handleDataChange(e, index, item.id)}
                          onFocus={(e) => handleFocus(e, index)}
                          onBlur={(e) =>
                            handleBlur(e, index, editableTransactions)
                          }
                        />
                      </td>
                      <td className={styles.balance}>{item.balance}</td>
                      {/* <td className={styles.balance}>
                      {calcContinuousBalance(item)}
                    </td> */}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td>Loading...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No data found</p>
      )}

      {openCatModal && (
        <CategoryModal
          title="Categories"
          setOpenCatModal={setOpenCatModal}
          db={db}
          setCatDescription={(val) => {
            handleInputChange(
              "category_description",
              val,
              currentIndex,
              currentId
            );
          }}
        />
      )}
    </div>
  );
};

export default EditTable;
