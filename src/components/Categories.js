import React, { useState, useEffect, useContext, useRef } from "react";
import { getAllCategories } from "../store/Dexie";
import { updateCategories } from "../store/Dexie";
import { UserContext } from "../contexts/UserContext";
import db from "../store/Dexie";
import "../styles/CatEdit.css";
import "../styles/MainStyles.css";
import styles from "../styles/Categories.module.css";
import { FaRegTrashAlt, FaRegSave } from "react-icons/fa";
import { MdAddCircleOutline } from "react-icons/md";
import { BiImport } from "react-icons/bi";
import { BiExport } from "react-icons/bi";
import { Link } from "react-router-dom";
import Modals from "../utils/Modals";
import CategoryModal from "../components/categories/CategoryModal";

const Categories = () => {
  const [allCategories, setAllCategories] = useState([]);
  const [selectedRows, setselectedRows] = useState([]);
  const [originalValue, setOriginalValue] = useState({});
  const { user } = useContext(UserContext);
  const [checkedTransactions, setCheckedTransactions] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const iconSize = 20;
  const [addEntry, setAddEntry] = useState(false);
  const [transactionDescriptions, setTransactionDescriptions] = useState([]);
  const [budgetTransactionDescriptions, setBudgetTransactionDescriptions] =
    useState([]);
  const [newCat, setNewCat] = useState(false);
  const lastCategoryRef = useRef(null); // Create a reference for the last category row

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
    setNewCat(false);
  }, [newCat]);

  // Scroll to the last category when newCat changes
  useEffect(() => {
    if (newCat && lastCategoryRef.current) {
      setTimeout(() => {
        lastCategoryRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 0); // Delay scroll to make sure layout updates
    }
  }, [lastCategoryRef.current]);

  const handleCheckboxChange = (event, id) => {
    const isChecked = event.target.checked;
    if (isChecked) {
      setselectedRows((prevState) => [...prevState, id]);
    } else {
      setselectedRows((prevState) => prevState.filter((item) => item !== id));
    }
  };

  const handleNewCat = async (val) => {
    setNewCat(true);
  };

  const handleDataChange = (e, index) => {
    const { name, value } = e.target;
    const updatedRecord = [...allCategories];
    updatedRecord[index] = {
      ...updatedRecord[index],
      [name]: value,
    };
    setAllCategories(updatedRecord);
  };

  const handleFocus = (e, index) => {
    const { name, value } = e.target;
    setOriginalValue({
      ...originalValue,
      [index]: { ...originalValue[index], [name]: value },
    });
  };

  const handleBlur = async (e, index, updatedTransactions) => {
    const { name } = e.target;
    const item = updatedTransactions[index];
    if (originalValue[index] && originalValue[index][name] !== item[name]) {
      console.log(`Field ${name} for item ${index} was changed`);
      await updateCategories(item.id, { [name]: item[name] });
      //update all occurrences of the old category in the budget and in transactions
      //there may be several budgets for this user
      //dbase table for budgets is
      // budgettransactions:"++id,user_id,name,date,amount,category,description,repeat_options,growth_options,extras",
      //dbase table for transactions is
      //transactions:"++id,user_id,account_id,date,day,type,description,category_code,category_description,amount1,amount2,balance,bank_code,group,subgroup,subsubgroup,timestamp,extras",
      //old name=originalValue[index][name]
      //new name=item[name]
      const oldCategory = originalValue[index][name];
      const newCategory = item[name];
      if (oldCategory && newCategory && user) {
        // Ensure vars are valid
        await db.budgettransactions
          .where({ category: oldCategory, user_id: user.id })
          .modify({ category: newCategory });
        await db.transactions
          .where({ category_description: oldCategory, user_id: user.id })
          .modify({ category_description: newCategory });
      }
    } else {
      console.log(`Field ${name} for item ${index} was not changed`);
    }

    try {
      const updatedData = await getAllCategories();
      setAllCategories(updatedData);
      console.log("Updated categories:", updatedData);
    } catch (error) {
      console.error("Error retrieving updated categories:", error);
    }
  };

  const handleSelectAll = () => {
    if (selectedRows?.length === allCategories?.length) {
      setselectedRows([]);
    } else {
      setselectedRows(allCategories?.map((item) => item.id));
    }
  };

  const handleDelete = () => {
    //before deleting check if category is in use, if so, warn user and do not delete-
    //  you can perhaps give user the transactions where the category is used
    // and then ask user to confirm deletion
    setDeleteConfirm(true);
  };

  const handleCloseModal = () => {
    setDeleteConfirm(false);
  };

  const handleCancel = () => {
    setDeleteConfirm(false);
  };

  async function searchSelectedCategories(selectedRows) {
    try {
      // Fetch the corresponding category descriptions from the `categories` table based on selected IDs
      const selectedCategories = await db.category_descriptions
        .where("id")
        .anyOf(selectedRows)
        .toArray();

      // Extract the category descriptions from the results
      const categoryDescriptions = selectedCategories.map(
        (category) => category.category_description
      );

      // Now search for these category descriptions in the `transactions` table
      const transactionMatches = await db.transactions
        .where("category_description")
        .anyOf(categoryDescriptions)
        .toArray();

      // Search for these category descriptions in the `budgettransactions` table
      const budgetTransactionMatches = await db.budgettransactions
        .where("category")
        .anyOf(categoryDescriptions)
        .toArray();

      // Return the results
      return {
        transactionMatches,
        budgetTransactionMatches,
      };
    } catch (error) {
      console.error("Error searching for selected categories:", error);
      throw error;
    }
  }

  const handleFinalDelete = () => {
    setDeleteConfirm(false);
    //delete selected rows
    const updatedCategories = allCategories.filter(
      (item) => !selectedRows.includes(item.id)
    );
    setAllCategories(updatedCategories);
    setselectedRows([]);
    db.category_descriptions.bulkDelete(selectedRows);
  };

  useEffect(() => {
    async function fetchDescriptions() {
      try {
        const results = await searchSelectedCategories(selectedRows);
        // Return an object containing both category_description and description for transactions
        const transactionDesc = results.transactionMatches.map(
          (transaction) => ({
            category_description: transaction.category_description,
            description: transaction.description,
          })
        );
        // Return an object containing both category_description and description for budget transactions
        const budgetTransactionDesc = results.budgetTransactionMatches.map(
          (budgetTransaction) => ({
            category_description: budgetTransaction.category,
            description: budgetTransaction.description,
          })
        );

        // Set the state with the extracted objects
        setTransactionDescriptions(transactionDesc);
        setBudgetTransactionDescriptions(budgetTransactionDesc);
      } catch (error) {
        console.error("Error fetching descriptions:", error);
      }
    }
    if (selectedRows && selectedRows.length > 0) fetchDescriptions();
  }, [selectedRows]);

  return (
    <div
      className="category-main-container"
      style={{
        backgroundColor: "lightsteelblue",
      }}
    >
      <span style={{ fontSize: "1.25rem", marginLeft: "1rem" }}>
        Categories
      </span>
      <div //container
        className={styles.category_work_container}
      >
        <div
          className={styles.category_button_grid}
          style={{ gridTemplateColumns: "repeat(4, 7rem)" }}
        >
          <button
            className={styles.category_main_buttons}
            disabled={selectedRows?.length <= 0}
            onClick={() => handleDelete()}
          >
            <FaRegTrashAlt size={iconSize * 0.9} />
            Delete
          </button>
          <button
            className={styles.category_main_buttons}
            // disabled={checkedTransactions?.length <= 0}
            onClick={() => setAddEntry(true)}
          >
            <MdAddCircleOutline size={24} />
            Add
          </button>
          <Link to="/import" className={styles.category_main_buttons}>
            <BiImport size={24} />
            Import
          </Link>
          <button
            className={styles.category_main_buttons}
            // onClick={() => handleExport()}
          >
            <BiExport size={24} />
            Export
          </button>
        </div>

        {allCategories && (
          <div className={styles.tablecontainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.editcheckbox}></th>
                  <th className={styles.category_description}>Category</th>
                  <th className={styles.category_code}>Code</th>
                  <th className={styles.description}>Description</th>
                </tr>
              </thead>
              <tbody className={styles.tablebody}>
                <tr>
                  <td colSpan="4">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedRows?.length === allCategories?.length}
                    />
                    Select all
                  </td>
                </tr>
                {allCategories.map((item, index) => {
                  console.log(
                    "tedtestB allCategories.length=",
                    allCategories.length,
                    " index=",
                    index,
                    "  item=",
                    item
                  );
                  return (
                    <tr
                      key={item.id}
                      ref={
                        index === allCategories.length - 1
                          ? lastCategoryRef
                          : null
                      } // Attach ref to the last item
                    >
                      <td className={styles.editcheckbox}>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(item.id)}
                          onChange={(e) => handleCheckboxChange(e, item.id)}
                        />
                      </td>
                      <td className={styles.category_description}>
                        <input
                          className={styles.category_description}
                          type="text"
                          name="category_description"
                          value={item.category_description}
                          onChange={(e) => handleDataChange(e, index)}
                          onFocus={(e) => handleFocus(e, index)}
                          onBlur={(e) => handleBlur(e, index, allCategories)}
                        />
                      </td>
                      <td className={styles.category_code}>
                        <input
                          className={styles.category_code}
                          type="text"
                          name="category_code"
                          value={item.category_code}
                          onChange={(e) => handleDataChange(e, index)}
                          onFocus={(e) => handleFocus(e, index)}
                          onBlur={(e) => handleBlur(e, index, allCategories)}
                        />
                      </td>
                      <td className={styles.description}>
                        <input
                          className={styles.description}
                          type="text"
                          name="description"
                          value={item.description}
                          onChange={(e) => handleDataChange(e, index)}
                          onFocus={(e) => handleFocus(e, index)}
                          onBlur={(e) => handleBlur(e, index, allCategories)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {addEntry && (
          <CategoryModal
            title="Categories"
            setOpenCatModal={setAddEntry}
            db={db}
            setCatDescription={(val) => handleNewCat(val)}
          />
        )}
        {deleteConfirm && (
          <Modals
            title="Delete - confirm"
            noBckgrnd={true}
            onClose={() => handleCloseModal()}
            footer={
              <div style={{ display: "flex", flexDirection: "row" }}>
                <button
                  className="main_buttons"
                  type="button"
                  onClick={() => {
                    handleCancel();
                  }}
                >
                  Cancel
                </button>
                <button
                  className="main_buttons"
                  type="button"
                  disabled={
                    transactionDescriptions.length > 0 ||
                    budgetTransactionDescriptions.length > 0
                  }
                  onClick={() => {
                    handleFinalDelete();
                  }}
                >
                  Delete
                </button>
              </div>
            }
          >
            {(transactionDescriptions.length > 0 ||
              budgetTransactionDescriptions.length > 0) && (
              <div style={{ whiteSpace: "nowrap", marginBottom: "0.25rem" }}>
                Category Exists - cannot be deleted
              </div>
            )}
            {transactionDescriptions.length > 0 ? (
              <div>
                Transactions database
                <table
                  className={styles.table}
                  style={{ width: "100%", fontSize: "0.9rem" }}
                >
                  <thead>
                    <tr>
                      <th className={styles.category}>Category</th>
                      <th className={styles.description}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactionDescriptions.map((item, index) => (
                      <tr key={item.id}>
                        <td className={styles.category_description}>
                          {item.category_description}
                        </td>
                        <td className={styles.description}>
                          {item.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No transactions found.</p>
            )}
            {budgetTransactionDescriptions.length > 0 ? (
              <div>
                Budget database
                <table
                  className={styles.table}
                  style={{ width: "100%", fontSize: "0.9rem" }}
                >
                  <thead>
                    <tr>
                      <th className={styles.category}>Category</th>
                      <th className={styles.description}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgetTransactionDescriptions.map((item, index) => (
                      <tr key={item.id}>
                        <td className={styles.category_description}>
                          {item.category_description}
                        </td>
                        <td className={styles.description}>
                          {item.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              // <div>
              //   <ul>
              //     {budgetTransactionDescriptions.map((item, index) => (
              //       <li key={index}>
              //         <strong>Category:</strong> {item.category_description}{" "}
              //         <br />
              //         <strong>Description:</strong> {item.description}
              //       </li>
              //     ))}
              //   </ul>
              // </div>
              <p>No budget transactions found.</p>
            )}
          </Modals>
        )}
      </div>
    </div>
  );
};

export default Categories;
