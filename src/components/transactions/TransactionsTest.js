import React, { useState, useEffect, useContext, useRef } from "react";
import "../../styles/EditStyles.css";
import "../../styles/MainStyles.css";
import styles from "../../styles/Transaction.module.css";
import {
  deleteTransaction,
  getAllTransactions,
  updateTransaction,
  getAllCategories,
  addTransaction,
} from "../../store/Dexie";
import EditTable from "../../utils/EditTable";
import { FaRegTrashAlt, FaRegSave } from "react-icons/fa";
import Modals from "../../utils/Modals";
import DropdownMenu from "../../utils/DropDownMenu";
import { menuMainItems } from "../../data/MenuMainItems";
import { FaFileImport } from "react-icons/fa";
import { FaFileExport } from "react-icons/fa";
import { FaRegEdit } from "react-icons/fa";
import { MdAddCircleOutline } from "react-icons/md";
import { MdAddCircle } from "react-icons/md";
import { RiArrowGoBackFill } from "react-icons/ri";
import { RiPlayReverseFill } from "react-icons/ri";
import { BsThreeDotsVertical } from "react-icons/bs";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import ImportDataNew from "../../components/ImportDataNew";
import { UserContext } from "../../contexts/UserContext";
import db from "../../store/Dexie";
import { useDataContext } from "../../providers/DataProvider";
import { set } from "date-fns";
import CategoryModal from "../categories/CategoryModal";
import { Link } from "react-router-dom";

const TransactionsTest = () => {
  const [allTrans, setAllTrans] = useState([]);
  const [checkedTransactions, setCheckedTransactions] = useState([]);
  const { user } = useContext(UserContext);
  const { currentAccNumber, setCurrentAccNumber } = useDataContext();
  const iconSize = 20;
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [originalValue, setOriginalValue] = useState({});
  const warningText = `
    WARNING
    Selected data is deleted from your database.
    The data cannot be recovered.
    Backup data first if unsure.
    `;
  const [showDots, setShowDots] = useState(true);
  const [openMainMenu, setOpenMainMenu] = useState(false);
  const [importOption, setImportOption] = useState(false);
  const [editing, setEditing] = useState(true);
  const [exportOption, setExportOption] = useState(false);
  // const [openTransactionsMenu, setOpenTransactionsMenu] = useState(false);
  const navigate = useNavigate();
  // const [catEdit, setCatEdit] = useState(false);
  const [userAccounts, setUserAccounts] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const accNumberRef = useRef(null);
  const [newAccNumber, setNewAccNumber] = useState("");
  const [openingBalance, setOpeningBalance] = useState(0);
  const [addEntry, setAddEntry] = useState(false);
  const [transactionType, setTransactionType] = useState("Expenses");
  const [openCatModal, setOpenCatModal] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [addTransEntry, setAddTransEntry] = useState({
    transactiontype: "expenses",
    user_id: user.id,
    account_id: "",
    date: "",
    description: "",
    category_description: "",
    amount: 0,
  });

  const handleMenuClick = () => {
    setOpenMainMenu((prevOpen) => !prevOpen);
  };

  const handleImport = () => {
    console.log("tedtestK handleimport");
    setImportOption(true);
    // setOpenTransactionsMenu(false);
    setEditing(false);
    setExportOption(false);
    // setCatEdit(false);
  };

  const handleEdit = () => {
    setEditing(true);
    // setOpenTransactionsMenu(false);
    setImportOption(false);
    setExportOption(false);
    // setCatEdit(false);
  };

  // const handleCategories = () => {
  //   setEditing(false);
  //   setOpenTransactionsMenu(false);
  //   setImportOption(false);
  //   setExportOption(false);
  //   setCatEdit(true);
  // };

  const handleExport = () => {
    setExportOption(true);
    // setOpenTransactionsMenu(false);
    setEditing(false);
    setImportOption(false);
    // setCatEdit(false);
  };

  // const handleSave = () => {
  // };

  const handleClose = () => {
    navigate("/");
  };

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

  useEffect(() => {
    console.log("tedtestD currentAccNumber=", currentAccNumber);
    const fetchData = async () => {
      if (currentAccNumber) {
        try {
          const transactions = await getAllTransactions(currentAccNumber);
          // if (!transactions || transactions?.length === 0)
          //   setOpenTransactionsMenu(true);
          const sortedTrans = transactions.sort(
            (a, b) => new Date(a.date) - new Date(b.date)
          );
          setAllTrans(sortedTrans);
          // setAllTrans(transactions);
        } catch (error) {
          console.error("Error retrieving transactions:", error);
        }
      }
    };

    fetchData();
  }, [currentAccNumber]);

  const handleProceed = async () => {
    if (checkedTransactions.length > 0) {
      for (let id of checkedTransactions) {
        await deleteTransaction(id);
      }
      setCheckedTransactions([]);
      setDeleteConfirm(false);

      // Fetch updated transactions after deletion
      try {
        const updatedTransactions = await getAllTransactions(currentAccNumber);
        setAllTrans(updatedTransactions);
        console.log("Updated transactions:", updatedTransactions);
      } catch (error) {
        console.error("Error retrieving updated transactions:", error);
      }
    } else {
      setDeleteConfirm(false);
    }
  };

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
      let result = await updateTransaction(item.id, { [name]: item[name] });

      if (result) {
        const updatedTrans = allTrans.map((transaction, idx) =>
          idx === index ? { ...transaction, [name]: item[name] } : transaction
        );
        const sortedTrans = updatedTrans.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        setAllTrans(sortedTrans);
      }
    } else {
      console.log(`Field ${name} for item ${index} was not changed`);
    }
  };

  //   const handleBlur = async (e, index, updatedTransactions) => {
  //     console.log("tedtestH handleblur");
  //     const { name } = e.target;
  //     const item = updatedTransactions[index];

  //     if (originalValue[index] && originalValue[index][name] !== item[name]) {
  //       console.log(`Field ${name} for item ${index} was changed`);
  //       let result = await updateTransaction(item.id, { [name]: item[name] });
  //       console.log("tedtestH handleblur result=", result);
  // if (result){

  //       let sortedTrans = [...allTrans].sort(
  //         (a, b) => new Date(a.date) - new Date(b.date)
  //       );
  //       const updatedData = await getAllTransactions(currentAccNumber);
  //     //   setAllTrans(updatedData);
  //       setAllTrans(sortedTrans);
  //     }
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

  const menuItems = [
    // {
    //   leftIcon: <FaFileImport size={24} />,
    //   text: "Import",
    //   callback: handleImport,
    //   permissionLevels: ["any"],
    //   goToMenu: "",
    // },
    {
      leftIcon: <FaRegEdit size={24} />,
      text: "Edit",
      callback: handleEdit,
      permissionLevels: ["any"],
      goToMenu: "",
    },
    // {
    //   leftIcon: <FaFileExport size={24} />,
    //   text: "Export",
    //   callback: handleExport,
    //   permissionLevels: ["any"],
    //   goToMenu: "",
    // },
    // {
    //   leftIcon: <BiSolidCategoryAlt size={24} />,
    //   text: "Categories",
    //   callback: handleCategories,
    //   permissionLevels: ["any"],
    //   goToMenu: "",
    // },
    {
      leftIcon: <RiPlayReverseFill size={24} />,
      text: "Main menu",
      callback: handleClose,
      permissionLevels: ["any"],
      goToMenu: "secondary",
    },
    {
      leftIcon: <RiArrowGoBackFill size={24} />,
      text: "Close",
      callback: handleClose,
      permissionLevels: ["any"],
      goToMenu: "",
    },
  ];

  useEffect(() => {
    if (openModal && accNumberRef.current) {
      accNumberRef.current.focus();
    }
  }, [openModal]);

  const handleCreateNewAccount = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //see if newAccNumber exists on dbase
    let numberExist;
    try {
      numberExist = await db.transactiondetails
        .where({ account_id: newAccNumber })
        .first();
    } catch (error) {
      console.error("error check on newAccNumber", error);
    }
    if (numberExist)
      alert("Account number, " + newAccNumber + ", already exists");
    else {
      try {
        await db.transactiondetails.add({
          user_id: user.id,
          account_id: newAccNumber,
          openingbalance: openingBalance,
        });
        if (userAccounts && userAccounts.length > 0)
          setUserAccounts([...userAccounts, newAccNumber]);
        else setUserAccounts([newAccNumber]);
        setCurrentAccNumber(newAccNumber);
        await db.users.update(user.id, { last_account: newAccNumber });
        setOpenModal(false);
      } catch (error) {
        console.error("Error adding new account number:", error);
      }
    }
  };

  const reinitialiseVars = () => {
    setAddTransEntry({
      transactiontype: "expenses",
      user_id: user.id,
      account_id: currentAccNumber,
      date: "",
      description: "",
      category_description: "",
      amount: 0,
    });
  };

  const handleSubmitEntry = async (e) => {
    e.preventDefault();
    try {
      let result = await addTransaction(addTransEntry);
      if (result) {
        let tmpTrans = allTrans;
        tmpTrans.push(addTransEntry);
        let sortedTrans = [...allTrans].sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        setAllTrans(sortedTrans);
      }
    } catch (error) {
      console.error("Error adding new transaction:", error);
    }
    // setAllTrans((prevData) => [...prevData, addTransEntry]);

    // const sortedTransactions = [...allTrans].sort(
    //   (a, b) => new Date(a.date) - new Date(b.date)
    // );
    // setAllTrans(sortedTransactions);
    // Now you can map through sortedTransactions

    setAddEntry(false);
    reinitialiseVars();
  };

  const handleChangeOpenBal = (e) => {
    e.preventDefault();
    const value = e.target.value.trim();
    const floatValue = parseFloat(value);
    console.log(`parseFloat(${value}) = ${floatValue}`);
    setOpeningBalance(parseFloat(parseFloat(e.target.value).toFixed(2)));
  };

  const handleChangeAccNo = async (val) => {
    setCurrentAccNumber(val);
    try {
      const transactions = await getAllTransactions(val);
      // if (!transactions || transactions?.length === 0)
      //   setOpenTransactionsMenu(true);
      setAllTrans(transactions);
      await db.users.update(user.id, { last_account: newAccNumber });
    } catch (error) {
      console.error("Error retrieving transactions:", error);
    }
  };

  const handleInputChange = (field, value) => {
    //used for adding a new transaction, not for changing the value- changing values happens in edittable.js
    setAddTransEntry((prevData) => ({
      ...prevData,
      account_id: currentAccNumber,
      [field]: value,
      user_id: prevData.user_id || user.id,
    }));
  };

  const SearchableDropdown = ({ allCategories }) => {
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

    const handleCreateNewCategory = async () => {
      setOpenCatModal(true);
    };

    return (
      <div style={{ width: "15rem", marginBottom: "0.5rem" }}>
        <label>
          Category:
          <input
            style={{ display: "none" }}
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <select
            onChange={(e) => {
              const selectedValue = e.target.value;
              if (selectedValue === "new") {
                handleCreateNewCategory();
              } else {
                handleInputChange("category_description", selectedValue);
              }
            }}
            value={addTransEntry.category_description || ""}
          >
            {/* <option disabled selected value="">
            {" "}
            -- select an option --{" "}
          </option> */}
            {filteredCategories.map((catRec) => (
              // <option key={catRec.id} value={catRec.id}>
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
        </label>
      </div>
    );
  };

  useEffect(() => {
    let amount = 0;
    if (transactionType === "expenses") {
      if (addTransEntry.amount > 0)
        amount = parseFloat((parseFloat(addTransEntry.amount) * -1).toFixed(2));
      else amount = parseFloat(parseFloat(addTransEntry.amount).toFixed(2));
    } else if (transactionType === "income") {
      if (addTransEntry.amount > 0)
        amount = parseFloat(parseFloat(addTransEntry.amount).toFixed(2));
      else
        amount = parseFloat((parseFloat(addTransEntry.amount) * -1).toFixed(2));
    } else amount = addTransEntry.amount;
    setAddTransEntry((prevData) => ({
      ...prevData,
      account_id: currentAccNumber,
      amount: amount,
      // date: date || new Date(),
      user_id: prevData.user_id || user.id,
    }));
  }, [transactionType, addTransEntry.amount]);

  const handleIncExp = (event) => {
    setTransactionType(event.target.value);
  };

  return (
    <div>
      <div className="menu-dots">
        <div className="main-menu">
          <span style={showDots ? {} : { display: "none" }}>
            <BsThreeDotsVertical size={28} onClick={() => handleMenuClick()} />
          </span>
          {openMainMenu && (
            <DropdownMenu
              type="links"
              // roles={("admin", "user", "etc")}
              menuItems={menuMainItems}
              onClose={() => setOpenMainMenu(false)}
              mainscreen={true}
            ></DropdownMenu>
          )}
          {/* {openTransactionsMenu && (
            <DropdownMenu
              type="items"
              secType="links"
              roles={"any"}
              menuItems={menuItems}
              secMenuItem={menuMainItems}
              onClose={() => setOpenTransactionsMenu(false)}
              mainscreen={true}
            />
          )} */}
        </div>
      </div>
      <div
        className="work-container"
        style={{
          backgroundColor: "lightsteelblue",
        }}
      >
        <span style={{ fontSize: "1.25rem", marginLeft: "1rem" }}>
          Transactions
        </span>
        {importOption && <span> - Import</span>}
        {editing && <span> - Edit</span>}
        {exportOption && <span> - Export</span>}
        <div className={styles.transaction_details_container}>
          <label>
            account no.
            <select
              onChange={(e) => {
                const selectedValue = e.target.value;
                if (selectedValue === "new") {
                  handleCreateNewAccount(); // This function should open a modal or prompt for budget creation
                } else {
                  handleChangeAccNo(selectedValue);
                }
              }}
              value={currentAccNumber}
            >
              {(userAccounts || []).map((acc, index) => {
                return (
                  <option key={index} value={acc}>
                    {acc}
                  </option>
                );
              })}
              <option value="new">New account</option>{" "}
              {/* Add this option for creating a new account */}
              <option disabled selected value="">
                {" "}
                -- select an option --{" "}
              </option>
            </select>
          </label>
        </div>
        <div>
          {editing && (
            <div>
              <div
                className={styles.displaycontainer}
                // className="display-container
              >
                {/* <h1>Edit Data</h1> */}
                {allTrans && allTrans?.length > 0 ? (
                  <EditTable
                    transactions={allTrans}
                    setTransactions={setAllTrans}
                    checkedTransactions={setCheckedTransactions}
                    handleBlur={handleBlur}
                    handleFocus={handleFocus}
                  />
                ) : (
                  <p style={{ marginLeft: "1rem" }}>No data found</p>
                )}
              </div>
              <div
                className="button_grid"
                style={{ gridTemplateColumns: "repeat(4, 7rem)" }}
              >
                <button
                  className="main_buttons"
                  disabled={checkedTransactions?.length <= 0}
                  onClick={() => setDeleteConfirm(true)}
                >
                  <FaRegTrashAlt size={iconSize * 0.9} />
                  Delete
                </button>
                <button
                  className="main_buttons"
                  // disabled={checkedTransactions?.length <= 0}
                  onClick={() => setAddEntry(true)}
                >
                  {/* tedtest filled icons or not filled? */}
                  <MdAddCircle size={24} />
                  {/* <MdAddCircleOutline size={24} /> */}
                  {/* <FaRegTrashAlt size={iconSize * 0.9}/> */}
                  Add
                </button>
                <Link to="/import" className="main_buttons">
                  <FaFileImport size={20} />
                  Import
                </Link>

                <button className="main_buttons" onClick={() => handleImport()}>
                  <FaFileImport size={20} />
                  Import
                </button>
                <button className="main_buttons" onClick={() => handleExport()}>
                  <FaFileExport size={20} />
                  Export
                </button>
              </div>
            </div>
          )}
          {/* {importOption && <ImportDataNew />} */}

          {deleteConfirm && (
            <Modals
              title="Delete"
              noBckgrnd={true}
              onClose={() => setDeleteConfirm(false)}
              footer={
                <div>
                  <button type="button" onClick={handleProceed}>
                    Proceed
                  </button>
                  <button type="button" onClick={() => setDeleteConfirm(false)}>
                    Cancel
                  </button>
                </div>
              }
            >
              <pre>{warningText}</pre>
            </Modals>
          )}
        </div>
      </div>
      {openModal && (
        <Modals
          title="Add account"
          noBckgrnd={true}
          onClickOutside={false}
          onClose={() => handleCloseModal()}
          footer={
            <div>
              <button
                style={{
                  marginTop: "1rem",
                  marginBottom: "0.5rem",
                }}
                type="submit"
                disabled={!newAccNumber}
                className="button-submit"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          }
        >
          <form onSubmit={handleSubmit}>
            <div>
              <label>
                account number:
                <input
                  ref={accNumberRef}
                  type="text"
                  onChange={(e) => setNewAccNumber(e.target.value)}
                  placeholder="account number"
                ></input>
              </label>
            </div>
            <div>
              <label>
                opening balance:
                <input
                  style={{ width: "10rem" }}
                  type="number"
                  value={openingBalance}
                  onChange={
                    (e) => handleChangeOpenBal(e)
                    // setOpeningBalance(
                    //   parseFloat(parseFloat(e.target.value).toFixed(2))
                    // )
                  }
                ></input>
              </label>
            </div>
          </form>
        </Modals>
      )}
      {addEntry && (
        <Modals
          title="Add transaction"
          noBckgrnd={true}
          onClickOutside={false}
          onClose={() => setAddEntry(false)}
          footer={
            <div style={{ display: "flex", flexDirection: "row" }}>
              <button
                className="main_buttons"
                type="button"
                onClick={(e) => {
                  handleSubmitEntry(e);
                }}
              >
                Submit
              </button>
            </div>
          }
        >
          <form onSubmit={handleSubmitEntry}>
            <div>
              <div className={styles.date}>
                <input
                  className={styles.date}
                  type="date"
                  name="date"
                  value={
                    addTransEntry.date
                      ? new Date(addTransEntry.date).toISOString().split("T")[0] // Format as YYYY-MM-DD
                      : ""
                  }
                  onChange={(e) => handleInputChange("date", e.target.value)}
                />
              </div>
              {/* <div className="form-field" style={{ fontSize: "0.8rem" }}>
                <label>
                  Type (optional (not used yet)):
                  <input
                    // ref={descriptionInputRef}
                    style={{ width: "15rem" }}
                    type="text"
                    placeholder="type"
                    value={addTransEntry.type}
                    onChange={(e) => handleInputChange("type", e.target.value)}
                  ></input>
                </label>
              </div> */}
              <div className="form-field" style={{ fontSize: "0.8rem" }}>
                <label>
                  Description:
                  <input
                    // ref={descriptionInputRef}
                    style={{ width: "15rem" }}
                    type="text"
                    placeholder="description"
                    value={addTransEntry.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                  ></input>
                </label>
              </div>
              <label>
                category:
                <SearchableDropdown allCategories={allCategories} />
              </label>
              <div className="form-field">
                <label>
                  Amount:
                  <input
                    type="number"
                    placeholder="amount"
                    value={addTransEntry.amount}
                    onChange={(e) =>
                      handleInputChange("amount", e.target.value)
                    }
                  />
                </label>
              </div>
              <div>
                <label htmlFor="income">
                  <input
                    type="radio"
                    id="income"
                    name="transactionType"
                    value="Income"
                    checked={transactionType === "Income"}
                    onChange={handleIncExp}
                  />
                  Income
                </label>
              </div>
              <div style={{ marginBottom: "0.5rem" }}>
                <label htmlFor="expenses">
                  <input
                    type="radio"
                    id="expenses"
                    name="transactionType"
                    value="Expenses"
                    checked={transactionType === "Expenses"}
                    onChange={handleIncExp}
                  />
                  Expenses
                </label>
              </div>
              {/* "++id,user_id,account_id,date,day,type,description,category_code,category_description,amount,balance,bank_code,group,subgroup,subsubgroup,timestamp,extras", */}
            </div>
          </form>
        </Modals>
      )}
      {openCatModal && ( //CatModal collects info and adds new category to dbase
        <CategoryModal
          title="Categories"
          setOpenCatModal={setOpenCatModal}
          db={db}
          setCatDescription={(val) => handleInputChange("category", val)} //handleInputChange adds new category to addTransEntry
        />
      )}
    </div>
  );
};

export default TransactionsTest;
