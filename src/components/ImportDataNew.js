import React, { useState, useEffect, useContext } from "react";
import { useDataContext } from "../providers/DataProvider";
import db from "../store/Dexie";
import Modals from "../utils/Modals";
import "../styles/Modals.css";
import "../styles/ImportData.css";
import CheckboxTable from "../utils/CheckBoxTable";
import {
  FaBalanceScaleLeft,
  FaInfoCircle,
  FaRegSave,
  FaRegTrashAlt,
} from "react-icons/fa";
import EditTable from "../utils/EditTable";
import { parse, formatISO, isValid, set } from "date-fns";
import { updateTransaction } from "../store/Dexie";
import possHeaders from "../data/possHeaders";
import { UserContext } from "../contexts/UserContext";
import CreateNewAccount from "../utils/CreateNewAccount";
import { useNavigate } from "react-router-dom";

const ImportDataNew = (props) => {
  const [openBalance, setOpenBalance] = useState(0);
  const [transactionOpenBalance, setTransactionOpenBalance] = useState(0);
  const [closeBalance, setCloseBalance] = useState(0);
  const [fileContent, setFileContent] = useState(null);
  const [newAccountId, setNewAccountId] = useState("");
  const [numberHeaders, setNumberHeaders] = useState(0);
  const [getAccNumber, setGetAccNumber] = useState(false);
  const [noOpenBalance, setNoOpenBalance] = useState(false);
  const [newOpenBalance, setNewOpenBalance] = useState(0);
  const [confirmations, setConfirmations] = useState(false);
  const [balanceUnequal, setBalanceUnequal] = useState(false);
  const [dbaseBalance, setdbaseBalance] = useState(0);
  const [modalGone, setModalGone] = useState(false);
  const [dataSaved, setDataSaved] = useState(false);
  const [loadedIds, setLoadedIds] = useState([]);
  const [loadedTransactions, setLoadedTransactions] = useState([]);
  const [checkedTransactions, setCheckedTransactions] = useState([]);
  const [editedTrans, setEditedTrans] = useState([]);
  const [originalValue, setOriginalValue] = useState({});
  const [uniqueKeys, setUniqueKeys] = useState([]);
  const [colWidths, setColWidths] = useState([]);
  const [selectedEditCatCheckboxes, setSelectedEditCatCheckboxes] = useState(
    []
  );
  const [fixOpenBal, setFixOpenBal] = useState(false);
  let countRecords = 0;
  let countDuplicates = 0;
  const iconSize = 20;
  const {
    selectedFile,
    setSelectedFile,
    delimiter,
    setDelimiter,
    lines,
    setLines,
    editableHeaders,
    setEditableHeaders,
    selectedCheckboxes,
    setSelectedCheckboxes,
    currentAccNumber,
    setCurrentAccNumber,
  } = useDataContext();
  const [possAccNo, setPossAccNo] = useState(null);
  const [userAccounts, setUserAccounts] = useState([]);
  const [accForDataModal, setAccForDataModal] = useState(false);
  const dateFormats = [
    "dd-MMM-yy",
    "dd MMM yy",
    "yyyy-MMM-dd",
    "ddMMyyyy",
    "MM/dd/yyyy",
    "yyyy-MM-dd",
    "do MMM yyyy",
    "MMM d, yyyy",
    "yyyy.MM.dd",
    "yyyyMMdd",
    "EEEE, MMMM d, yyyy",
    "d/M/yyyy",
    "d MMMM yyyy",
    "dd-MMM-yyyy",
    "dd-MM-yy",
    "d MMM yyyy",
    "d MMM yy",
  ];
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const showInfoHeaders = () => {
    alert(
      "The header name will be used to populate the column in the database." +
        "\n" +
        "Choose 'ignore' if you do not want a column to appear in the database." +
        "\n" +
        "Ignore will remove the column from the preview, it can be recovered by selecting a different header name" +
        "\n" +
        "\n" +
        "If only one amount column use account_dr, if both amount columns are present use amount_dr for debits and amount_cr for credits" +
        "\n" +
        "\n" +
        "Headers are saved for account IDs. If your input file contains the account ID, the headers will be fetched for that account. You may still change them."
    );
  };

  const getLastAccountNumber = async () => {
    let rec;
    try {
      rec = await db.users.where("id").equals(user.id).first();
      return rec.last_account;
    } catch (error) {
      console.error("Error getting last account number", error);
      return null;
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
          if (tmpAccNumber) {
            setCurrentAccNumber(tmpAccNumber);
            setGetAccNumber(true);
          } else {
            alert(
              "No account number found for this user, please enter or create account"
            );
            return null;
            // setGetAccNumber(false);
          }
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
    const getOpeningBalance = async () => {
      try {
        const accounts = await db.transactiondetails
          .where({
            user_id: user.id,
            account_id: currentAccNumber.toString(),
          })
          .first();
        if (accounts.openingbalance)
          setTransactionOpenBalance(accounts.openingbalance);
      } catch (error) {
        console.log("error getting opening balance", error);
      }
    };
    if (currentAccNumber) {
      getOpeningBalance();
    }
  }, [currentAccNumber]);

  function findPotentialAccountNumber(fieldsData) {
    const minLength = 6; // Assume a minimum length for account numbers
    let potentialAccountNumber = null;

    fieldsData.forEach((field) => {
      // Remove any non-numeric characters (optional, depending on your criteria)
      const sanitizedField = field.replace(/\D/g, "");

      // Check length and ensure it is numeric
      if (sanitizedField.length >= minLength && !isNaN(sanitizedField)) {
        potentialAccountNumber = sanitizedField;
      }
    });

    return potentialAccountNumber;
  }

  async function accountExists(accountID) {
    const accountTest = await db.transactions.account_id;
    const account = await db.transactions
      .where("account_id")
      .equals(accountID)
      .first();
    if (account === undefined) {
      return false;
    } else {
      return !!account; // Returns true if account exists, false otherwise
    }
  }

  const expandYear = (year) => {
    const currentYear = new Date().getFullYear();
    const currentCentury = Math.floor(currentYear / 100) * 100;
    const threshold = currentYear % 100;
    if (year <= threshold) {
      return currentCentury + year;
    } else {
      return currentCentury - 100 + year;
    }
  };

  const preprocessDateString = (dateString) => {
    // Regular expression to match two-digit years
    const twoDigitYearRegex =
      /(\d{1,2})([-./ ])(\w{3}|\d{1,2})([-./ ])(\d{2})(?!\d)/;
    const match = dateString.match(twoDigitYearRegex);
    if (match) {
      const year = parseInt(match[5], 10);
      const expandedYear = expandYear(year);
      const expandedDateString = dateString.replace(match[5], expandedYear);
      return expandedDateString;
    }
    return dateString;
  };

  const parseDate = (dateString) => {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (isoDateRegex.test(dateString)) {
      return dateString + "T00:00:00.000Z"; // Append time to make it a valid ISO string
    }

    dateString = preprocessDateString(dateString);
    for (let formatString of dateFormats) {
      try {
        const parsedDate = parse(dateString, formatString, new Date());
        if (isValid(parsedDate)) {
          const isoDate = formatISO(parsedDate, { representation: "date" });
          // const isoDate = parsedDate.
          // toISOString(); // Full ISO date-time string
          return isoDate;
        }
      } catch (error) {
        // Continue to next format if there's an error
        continue;
      }
    }
    return null;
  };

  // GetFileData
  const FileUpload = () => {
    const handleFileChange = (event) => {
      setSelectedFile(event.target.files[0]);
      setEditableHeaders([]);
      let reader = new FileReader();
      reader.onload = handleFileRead;
      reader.readAsText(event.target.files[0]);
    };

    const handleButtonClick = () => {
      document.getElementById("fileInput").click();
    };

    const handleFileRead = async (event) => {
      function isValidLine(variable) {
        // Check if the variable is undefined or null
        if (
          variable === undefined ||
          variable === null ||
          variable?.length <= 0
        ) {
          return false;
        }
        // If all checks pass, return true
        return true;
      }

      let content = event.target.result;
      setFileContent(content);
      let dataLines = content.split("\n"); // Split the text into dataLines
      let tmpArr = [];
      for (let i = 0; i < dataLines.length; i++) {
        if (isValidLine(dataLines[i])) {
          tmpArr.push({ id: i, data: dataLines[i] });
        }
      }
      setLines(tmpArr);
    };

    return (
      <div>
        <div className="indent-left-margin">
          <input
            id="fileInput"
            type="file"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          {(!loadedTransactions || loadedTransactions?.length <= 0) &&
            !dataSaved && (
              <button onClick={handleButtonClick}>Select File</button>
            )}
          {selectedFile && (
            <span style={{ fontSize: "0.9rem" }}> {selectedFile.name}</span>
          )}
        </div>
      </div>
    );
  };

  //get open and close balances on file
  useEffect(() => {
    const getOpenCloseBalances = async () => {
      let noHeaders = 0;
      let startBal;
      lines.forEach((record) => {
        let fields = record.data.split(delimiter);
        if (fields?.length > noHeaders) {
          noHeaders = fields.length;
        }
        for (let count = 0; count < fields.length; count++) {
          if (
            fields[count].toLowerCase().includes("open balance") ||
            fields[count].toLowerCase().includes("opening balance")
          ) {
            setOpenBalance((-1 * parseFloat(fields[count - 1]))?.toFixed(2));
            startBal = (-1 * parseFloat(fields[count - 1]))?.toFixed(2);
          }
          if (
            fields[count].toLowerCase().includes("close balance") ||
            fields[count].toLowerCase().includes("closing balance")
          ) {
            setCloseBalance(parseFloat(fields[count - 1])?.toFixed(2));
          }
        }
      });
      let chkbal = null;
      try {
        chkbal = await db.transactiondetails
          .where("account_id")
          .equals(currentAccNumber)
          .first();
      } catch (error) {
        console.error("ERROR checking for opening balance:", error);
      }
      if (!chkbal) {
        try {
          await db.transactiondetails.add({
            // id: user.id,
            account_id: currentAccNumber,
            openingbalance: startBal,
          });
          console.log("opening balance saved");
        } catch (error) {
          console.error("ERROR saving opening balance:", error);
        }
      } else if (!chkbal?.openingbalance) {
        try {
          await db.transactiondetails.update({
            id: user.id,
            account_id: currentAccNumber,
            openingbalance: startBal,
          });
          console.log("opening balance saved");
        } catch (error) {
          console.error("ERROR saving opening balance:", error);
        }
      }
      setNumberHeaders(noHeaders);
    };
    if (!lines || lines.length <= 0) {
      return;
    }
    if (lines) getOpenCloseBalances();
  }, [lines]);

  //getaccount_id
  useEffect(() => {
    // this looks at import file for possible account no.
    //it must check this account no against the current account no from user.last_account
    //if it matches do nothing
    // if it does not match ask user if current account must be changed

    function isNumeric(value) {
      return !isNaN(value) && isFinite(value);
    }

    const getAccountNumber = async () => {
      // let foundAccNo = false;
      let potentialAccountNumber;
      for (const record of lines) {
        let fields = record.data.split(delimiter);
        if (fields.includes("ACC-NO")) {
          potentialAccountNumber = findPotentialAccountNumber(fields);
          if (potentialAccountNumber !== currentAccNumber) {
            setPossAccNo(potentialAccountNumber);
            setAccForDataModal(true);
          }
          break;
        }
      }
    };

    const checkAccountNumber = async () => {
      //now we have currentAccNumber, do we need this? TODO tedtest
      let found = await getAccountNumber();
      if (!found) {
        setGetAccNumber(true);
      } else {
      }
    };

    if (!fileContent) {
      return;
    }
    checkAccountNumber();
  }, [lines]);

  //get Headers
  useEffect(() => {
    const getHeaders = async () => {
      let dbaseHeaders = [];
      //already have accountID, just look for accountID in the headers table and populate the headers
      //if cannot find accountID then ask user
      dbaseHeaders = await db.headers
        .where({ account_id: currentAccNumber })
        .first();
      if (dbaseHeaders) {
        // Populate dbaseHeaders with the headers element from the existing header
        const existHeaders = dbaseHeaders.headers;
        // Populate editableHeaders with the names found in dbaseHeaders
        setEditableHeaders(existHeaders);
      } else {
        window.alert(
          `No headers for Account ID, ${currentAccNumber}, were found in the headers table. Please enter headers manually.`
        );
        setEditableHeaders(Array.from({ length: numberHeaders }, () => ""));
      }
    };
    if (!currentAccNumber) {
      return;
    }
    if (lines && fileContent && numberHeaders > 0 && !accForDataModal)
      getHeaders();
  }, [currentAccNumber, numberHeaders, lines, accForDataModal]);

  const handleNewAccountId = (e) => {
    setNewAccountId(e.target.value);
  };

  const validAccId = (accId) => {
    if (!accId || accId.length <= 0) return false;
    else return true;
  };

  const handleSubmitAccNo = (accId) => {
    if (validAccId(accId)) {
      setCurrentAccNumber(accId);
      // setGetAccNumber(false); //tdtest do we need this?
    } else {
      window.alert("Please enter valid account ID; cannot be empty string");
    }
  };

  const createColWidthsArray = (headerArray) => {
    return headerArray.reduce((acc, header) => {
      if (header !== "ignore") {
        const foundHeader = possHeaders.find(
          (possHeader) => possHeader.title === header
        );
        if (foundHeader) {
          acc.push(foundHeader.colWidth);
        } else if (header === "") {
          acc.push("5rem");
        }
      }
      return acc;
    }, []);
  };

  const DisplayLinesData = () => {
    //if editableHeaders.length<=0 then we can try to calculate the number of columns by looking at lines.split by commas
    let tempArr;
    if (editableHeaders.length <= 0) {
      tempArr = Array.from({ length: numberHeaders }, () => "");
    } else tempArr = editableHeaders.filter((item) => item !== "ignore");
    return (
      <div style={{ marginBottom: "0.5rem" }}>
        <CheckboxTable
          lines={lines}
          array={true}
          objects={false}
          // colWidth="5rem"
          colWidthArr={createColWidthsArray(tempArr)}
          headers={tempArr}
        />
      </div>
    );
  };

  const handleHeaderChange = (e, index) => {
    const newHeaders = [...editableHeaders];
    newHeaders[index] = e.target.value;
    setEditableHeaders(newHeaders);
  };

  const getColumnHeaders = () => {
    return (
      <div className="indent-left-margin">
        {/* Account ID:{currentAccNumber} */}
        <table>
          <thead>
            <tr
              className="header-row"
              style={{
                gridTemplateColumns: props?.colWidth
                  ? `${props?.colWidth} repeat(${editableHeaders.length},${props?.colWidth})${props?.colWidth}`
                  : `6rem repeat(${editableHeaders.length},4rem)`,
                overflowX: "auto",
                maxWidth: "90vw",
              }}
            >
              <th
                style={{
                  fontSize: "0.9rem",
                  gridTemplateColumns: props?.colWidth
                    ? `repeat(${editableHeaders.length},${props?.colWidth}) ${props?.colWidth}`
                    : `repeat(${editableHeaders.length},4rem) 4rem`,
                }}
              >
                <span style={{ display: "flex", alignItems: "center" }}>
                  <span>Headers </span>
                  <span style={{ marginLeft: "0.5rem" }}>
                    <FaInfoCircle onClick={() => showInfoHeaders()} size={24} />
                  </span>
                </span>
              </th>
              <td
                style={{
                  display: "grid",
                  gridTemplateColumns: props?.colWidth
                    ? `repeat(${editableHeaders.length},${props?.colWidth}) ${props?.colWidth}`
                    : `repeat(${editableHeaders.length},4rem) 4rem`,
                }}
              >
                {editableHeaders?.map((header, index) => (
                  <select
                    key={index}
                    title={header}
                    value={header || ""}
                    onChange={(e) => handleHeaderChange(e, index)}
                  >
                    <option value="" disabled>
                      Select a header
                    </option>
                    {possHeaders.map((hdr) => (
                      <option key={hdr.title}>{hdr.title}</option>
                    ))}
                  </select>
                ))}
              </td>
            </tr>
          </thead>
        </table>
      </div>
    );
  };

  const handleDelete = () => {
    if (selectedCheckboxes?.length > 0) {
      const newLines = lines.filter(
        (_, index) => !selectedCheckboxes.includes(index)
      );
      // Update the id fields to be sequential
      const updatedLines = newLines.map((item, index) => ({
        ...item,
        id: index, // Reassign ids to be sequential
      }));
      // Update the state with the new array and clear selected checkboxes
      setLines(updatedLines);
      setSelectedCheckboxes([]);
    }
  };

  const handleEditCatDelete = () => {
    if (selectedEditCatCheckboxes?.length > 0) {
      const newLines = lines.filter(
        (_, index) => !selectedEditCatCheckboxes.includes(index)
      );
      // Update the id fields to be sequential
      const updatedLines = newLines.map((item, index) => ({
        ...item,
        id: index, // Reassign ids to be sequential
      }));
      // Update the state with the new array and clear selected checkboxes
      // setLines(updatedLines);
      setSelectedEditCatCheckboxes([]);
    }
  };

  async function getLatestBalance(accountID) {
    try {
      const transactions = await db.transactions
        .where("account_id")
        .equals(accountID)
        .toArray();

      if (transactions.length === 0) {
        console.error("No transactions found for accountID:", accountID);
        return 0;
      }
      // Sort transactions by timestamp in descending order
      const latestTransaction = transactions.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      )[0];
      return latestTransaction ? latestTransaction.balance : 0;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return 0;
    }
  }

  const checkClosingBalances = () => {
    //we need the closeBal and we need to calculate the closingBalance so we need transactions with the amounts
    let checkBal = getLatestBalance(currentAccNumber);
    if (checkBal !== closeBalance) {
      alert(
        "Closing balance on import file does not match latestBalance on database. You will need to check your records"
      );
    } else {
      alert(
        "Closing balance on import file matchex latestBalance on database."
      );
    }
  };

  const addNewTransactions = async (newTransactions) => {
    let closingBalance;
    let idArr = [];
    let accountPresent = await accountExists(currentAccNumber);
    if (accountPresent) {
      closingBalance = await getLatestBalance(currentAccNumber);
    } else {
      if (typeof newOpenBalance === "string")
        closingBalance = parseFloat(parseFloat(newOpenBalance).toFixed(2));
      else closingBalance = newOpenBalance;
    }
    for (const transaction of newTransactions) {
      transaction.account_id = currentAccNumber;
      // Skip transactions with invalid dates
      if (
        transaction?.date === "19700101" ||
        transaction?.date === "0" ||
        transaction?.date?.length < 6 ||
        transaction?.date?.length > 18 ||
        transaction?.date === currentAccNumber
      ) {
        continue;
      } else {
        const parsed = parseDate(transaction.date);
        if (parsed) {
          transaction.date = parsed;
        }
      }
      //check for existence of amount2
      let twoCols = false;
      if (
        editableHeaders.includes("amount_dr") &&
        editableHeaders.includes("amount_cr")
      )
        twoCols = true;
      if (!twoCols) {
        if (transaction.amount > 0) {
          transaction.amount = parseFloat(transaction.amount).toFixed(2);
          transaction.transactiontype = "expenses";
        } else {
          transaction.amount = parseFloat(
            parseFloat(transaction.amount) * -1
          ).toFixed(2);
          transaction.transactiontype = "income";
        }
        if (isNaN(transaction.amount)) {
          transaction.amount = 0;
        }
      } else {
        if (transaction.amount_dr) {
          if (parseFloat(transaction.amount_dr) > 0) {
            transaction.amount = parseFloat(
              (parseFloat(transaction.amount_dr) * -1).toFixed(2)
            );
          } else if (parseFloat(transaction.amount_dr) < 0) {
            transaction.amount = parseFloat(
              parseFloat(transaction.amount_dr).toFixed(2)
            );
          }
          transaction.transactiontype = "expenses";
        }
        if (transaction.amount_cr) {
          if (parseFloat(transaction.amount_cr) < 0) {
            transaction.amount = parseFloat(
              (
                parseFloat(transaction.amount_cr) * -1 +
                transaction.amount
              ).toFixed(2)
            );
          } else if (parseFloat(transaction.amount_cr) > 0) {
            transaction.amount = parseFloat(
              (parseFloat(transaction.amount_cr) + transaction.amount).toFixed(
                2
              )
            );
          }
          transaction.transactiontype = "income";
        }
        transaction.amount = parseFloat(transaction.amount).toFixed(2);
        if (isNaN(transaction.amount)) {
          transaction.amount = 0;
        }
      }
      const duplicate = await db.transactions
        .where("[date+description+amount]")
        .equals([transaction.date, transaction.description, transaction.amount])
        .first();
      // If no duplicate found, add the transaction
      let toBeAdded = true;
      if (duplicate) {
        toBeAdded = window.confirm(
          transaction.date +
            "  " +
            transaction.description +
            "transaction looks like duplicate- confirm add to database?"
        );
      }
      if (toBeAdded) {
        //look through category_descriptions table, if transaction.description does not exist
        //add transaction.description, transaction.category_code,transaction.category_description
        if (
          transaction.category_description &&
          transaction.category_description?.length > 0
        ) {
          let existingCategory = await db.category_descriptions
            .where("category_description")
            .equals(transaction.category_description)
            .first();
          if (!existingCategory) {
            await db.category_descriptions.add({
              description: transaction.description,
              category_code: transaction.category_code || "",
              category_description: transaction.category_description || "",
            });
          }
        }
        // if (!duplicate) {
        transaction.timestamp = new Date().toISOString();
        transaction.user_id = user.id;
        countRecords++;
        let id = await db.transactions.add(transaction);
        idArr.push(id);
      } else countDuplicates++;
    }
    setLoadedIds(idArr); //tedtest not used myabe useful ?? leave in or take out??
    checkClosingBalances();
  };

  const isValidHdrs = editableHeaders.some(
    (header) =>
      header && possHeaders.some((possHeader) => possHeader.title === header)
  );

  const processData = () => {
    function isValidObject(variable) {
      // Check if the variable is undefined or null
      if (variable === undefined || variable === null) {
        return false;
      }
      // Check if the variable is an object
      if (typeof variable !== "object") {
        return false;
      }
      // Check if the variable is an array and if it is not empty
      if (Array.isArray(variable)) {
        return variable.length > 0;
      }
      // Check if the variable is an empty object
      if (Object.keys(variable).length === 0) {
        return false;
      }
      // If all checks pass, return true
      return true;
    }

    const result = [];
    let dblVal = false;
    lines?.forEach((line) => {
      const dataValues = line?.data?.split(",");
      const entry = {};
      dblVal = false;
      editableHeaders.forEach((header, index) => {
        if (
          header !== "ignore" &&
          dataValues[index] !== "undefined" &&
          dataValues[index] !== undefined
        ) {
          if (header !== "date") {
            const originalValue = dataValues[index].trim();
            const valueWithoutSpaces = originalValue.replace(/\s+/g, "");
            // Attempt to parse the value as a float
            const parsedValue = parseFloat(valueWithoutSpaces);
            if (header === "amount_dr" || header === "amount_cr") {
              if (!isNaN(parsedValue)) {
                if (header === "amount_dr" && parsedValue !== 0) {
                  let crValue = dataValues[index + 1]?.replace(/\s+/g, "");
                  if (
                    parseFloat(crValue?.trim()) &&
                    !isNaN(parseFloat(crValue?.trim())) &&
                    parseFloat(crValue?.trim()) !== 0
                  ) {
                    dblVal = true;
                    let valAmount = 0;
                    if (parseFloat(crValue?.trim()) > parsedValue) {
                      valAmount = parseFloat(crValue?.trim()) - parsedValue;
                      entry["amount"] = parseFloat((valAmount * 1).toFixed(2));
                      entry["transactiontype"] = "income";
                    } else {
                      valAmount = parsedValue - parseFloat(crValue?.trim());
                      entry["amount"] = parseFloat((valAmount * 1).toFixed(2));
                      entry["transactiontype"] = "expenses";
                    }
                  } else if (header === "amount_dr") {
                    entry["amount"] = parseFloat((parsedValue * 1).toFixed(2));
                    entry["transactiontype"] = "expenses";
                  }
                } else if (header === "amount_cr") {
                  if (dblVal) {
                    //do nothing?
                  } else {
                    entry["amount"] = parseFloat((parsedValue * 1).toFixed(2));
                    entry["transactiontype"] = "income";
                  }
                }
                // entry["amount"] = parseFloat((parsedValue * 1).toFixed(2));
                // if (header === "amount_dr")
                //   entry["transactiontype"] = "expenses";
                // if (header === "amount_cr") entry["transactiontype"] = "income";
              }
            } else {
              //Determine if the value is a valid number
              if (!isNaN(parsedValue)) {
                // If it is a number, use the parsed value
                entry[header] = parsedValue;
              } else {
                // If it's not a number, retain the original string
                entry[header] = originalValue;
              }
            }
          } else entry[header] = dataValues[index];
        }
      });
      if (isValidObject(entry)) result.push(entry);
    });
    return result;
  };

  const addOrUpdateHeaders = async (accountID, editableHeaders) => {
    if (accountID) {
      try {
        // Fetch the existing header with the given account_id
        const existingHeader = await db.headers
          .where({ account_id: accountID })
          .first();

        if (existingHeader) {
          // Check if headers are the same
          const headersAreSame =
            JSON.stringify(existingHeader.headers) ===
            JSON.stringify(editableHeaders);

          if (headersAreSame) {
            // Headers are the same, no need to add
            alert("Headers are already up-to-date.");
          } else {
            // Headers are different, ask the user if they want to replace
            let replaceHdrs = window.confirm(
              "Headers already exist for this account. Do you want to replace them?"
            );
            if (replaceHdrs) {
              await db.headers.update(existingHeader.id, {
                headers: editableHeaders,
              });
              alert("Headers updated");
            } else {
              alert("Headers not updated");
            }
          }
        } else {
          // account_id does not exist, add new headers
          let addHdrs = window.confirm("Save Headers to file? Y/N");
          if (addHdrs && accountID) {
            await db.headers.add({
              account_id: accountID,
              headers: editableHeaders,
            });
            alert("Headers saved");
          }
        }
      } catch (error) {
        console.error("Error accessing the database", error);
      }
    }
  };

  const reInitialise = () => {
    setSelectedFile(null);
    setFileContent(null);
    setOpenBalance(0);
    setCloseBalance(0);
    setNewAccountId("");
    setNumberHeaders(0);
    setNoOpenBalance(false);
    setNewOpenBalance(0);
    setConfirmations(false);
    setBalanceUnequal(false);
    setdbaseBalance(0);
  };
  const handleSave = async () => {
    let proceed = true;
    if (selectedCheckboxes?.length > 0) {
      proceed = window.confirm(
        "There are checked boxes. Do you wish to proceed?"
      );
    }
    if (isValidHdrs && proceed) {
      const processedData = processData();
      //for each record in processeddata check if it hs category_description
      //if not, look in table category_description for a record with description===processedData's description
      //if found, add field and field details to processedData
      processedData.map((item) => {
        if (!item.category_description) {
          db.category_descriptions
            .where({ description: item.description })
            .first()
            .then((result) => {
              if (result) {
                item.category_description = result.category_description;
              }
            });
        }
      });
      addNewTransactions(processedData)
        .then(() => {
          alert(
            "Transactions added successfully! " +
              countRecords +
              " records added, and " +
              countDuplicates +
              " records duplicated"
          );
          setDataSaved(true);
          reInitialise();
        })
        .catch((error) => {
          alert("Error adding transactions:", error);
        });
      addOrUpdateHeaders(currentAccNumber, editableHeaders);
      if (window.history.length > 1) navigate(-1);
    } else alert("Invalid headers. Please select valid headers.");
  };

  const handleEditCatSave = () => {};

  useEffect(() => {
    if (dataSaved) {
      // Async function to fetch the filtered transactions
      const fetchEmptyCategoryDescriptions = async () => {
        try {
          // Fetch transactions where category_description is missing or empty and newly loaded transactions
          const tempArr = await db.transactions
            .filter(
              (item) =>
                // loadedIds.includes(item.id) ||
                !item.category_description ||
                item.category_description.length === 0
            )
            .toArray();
          setLoadedTransactions(tempArr);
          const keys = new Set();
          tempArr.forEach((item) => {
            Object.keys(item).forEach((key) => keys.add(key));
          });
          if (!keys.has("category_description")) {
            keys.add("category_description");
          }
          // Convert the set to an array and sort the keys as needed
          const orderedKeys = Array.from(keys);

          // Specify the keys to appear first
          const predefinedOrder = [
            "id",
            "date",
            "type",
            "description",
            "category_description",
            "amount_dr",
            "amount_cr",
            "balance",
          ];

          // Sort the keys based on predefined order and then alphabetically
          orderedKeys.sort((a, b) => {
            const indexA = predefinedOrder.indexOf(a);
            const indexB = predefinedOrder.indexOf(b);

            if (indexA === -1 && indexB === -1) {
              // Both keys are not in the predefined order, sort alphabetically
              return a.localeCompare(b);
            }
            if (indexA === -1) {
              // Only a is not in the predefined order, so b should come first
              return 1;
            }
            if (indexB === -1) {
              // Only b is not in the predefined order, so a should come first
              return -1;
            }
            // Both keys are in the predefined order, sort by predefined order
            return indexA - indexB;
          });

          setUniqueKeys(orderedKeys);
          setColWidths(createColWidthsArray(orderedKeys));
        } catch (error) {
          console.error("Error fetching transactions:", error);
        }
      };

      fetchEmptyCategoryDescriptions();
    } else {
      console.log("dataSaved is not yet true");
    }
  }, [dataSaved]);

  const handleClickOutside = () => {
    setModalGone(true);
    setNoOpenBalance(false);
    setBalanceUnequal(false);
  };

  const handleSubmit = (newBal) => {
    setModalGone(false);
    setNoOpenBalance(false);
    setBalanceUnequal(false);
    setNewOpenBalance(newBal);
    setConfirmations(true);
  };

  const handleOpenBalanceChange = (e) => {
    setNewOpenBalance(e.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSubmitAccNo(newAccountId);
    }
  };

  const handleKeyDownBalance = (event) => {
    if (event.key === "Enter") {
      handleSubmit(newOpenBalance);
    }
  };

  const handleClose = () => {
    setModalGone(true);
    if (noOpenBalance) setNoOpenBalance(false);
    else if (balanceUnequal) setBalanceUnequal(false);
  };

  const handleCloseAccModal = () => {
    // setAccForDataModal(false);
  };

  const handleBlur = async (e, index, updatedTransactions, key) => {
    const item = updatedTransactions[index];
    if (originalValue[index] && originalValue[index][key] !== item[key]) {
      console.log(`Field ${key} for item ${index} was changed`);
      await updateTransaction(item.id, { [key]: item[key] });
      try {
        await db.category_descriptions.add({
          description: item.description,
          category_code: item.category_code,
          category_description: item.category_description,
        });
        console.log("description saved");
      } catch (error) {
        console.error("ERROR saving description:", error);
        alert("description save failed");
      }
      // check if description is in table category_descriptions
      //if not then add "++id,description,category_code,category_description"
      //if it is there ask user if the category_description for this description should change
      //if yes change it, no don't do anything
    } else {
      console.log(`Field ${key} for item ${index} was not changed`);
    }
  };

  const handleFocus = (e, index) => {
    const { name, value } = e.target;
    setOriginalValue({
      ...originalValue,
      [index]: { ...originalValue[index], [name]: value },
    });
  };

  const handleFixOpenBal = () => {
    setFixOpenBal(true);
  };

  const handleChangeCurrAccNo = () => {
    setCurrentAccNumber(possAccNo);
    setAccForDataModal(false);
  };

  const handleNewCurrAccNo = () => {
    alert(
      "use dropdown menu on Account No. and select New to enter new account number"
    );
    setAccForDataModal(false);
  };

  const handleChangeAccNo = async (val) => {
    setCurrentAccNumber(val);
    // try {
    // const transactions = await getAllTransactions(val);
    // if (!transactions || transactions?.length === 0)
    //   setOpenTransactionsMenu(true);
    // setAllTrans(transactions);
    // await db.users.update(user.id, { last_account: newAccNumber });
    // } catch (error) {
    //   console.error("Error retrieving transactions:", error);
    // }
  };

  return (
    // <div>
    <div
      className="work-container"
      style={{
        backgroundColor: "lightsteelblue",
      }}
    >
      <span style={{ fontSize: "1.25rem", marginLeft: "1rem" }}>
        Transactions - Import
      </span>
      <div className="transaction_details_container">
        <label>
          account no.
          <select
            onChange={(e) => {
              const selectedValue = e.target.value;
              if (selectedValue === "new") {
                <CreateNewAccount />;
                // handleCreateNewAccount(); // This function should open a modal or prompt for budget creation
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

      <FileUpload></FileUpload>
      {!currentAccNumber && alert("Please enter or create an account number")}
      {/* {!getAccNumber && ( //put getaccnumber here but tie it to no current account number
        <Modals
          title="Account number"
          onClose={() => setGetAccNumber(true)}
          onClickOutside={() => setGetAccNumber(true)}
          footer={
            <div>
              <button
                className="UI-button-service"
                type="button"
                onClick={() => {
                  handleSubmitAccNo(newAccountId);
                }}
              >
                Submit
              </button>
              <button
                className="UI-button-service"
                type="button"
                onClick={() => {
                  setGetAccNumber(false);
                }}
              >
                Cancel
              </button>
            </div>
          }
        >
          <p>No account ID was found.</p>
          <label className="modal-label-new">Enter account ID</label>
          <input
            value={newAccountId}
            type="text"
            onChange={handleNewAccountId}
            onKeyDown={handleKeyDown}
          ></input>
        </Modals>
      )} */}
      {fileContent && currentAccNumber && currentAccNumber.length > 0 && (
        <div className="indent-left-margin" style={{ width: "100%" }}>
          <b>File Content:</b>
          <pre
            className="import-file-content"
            style={{
              fontSize: "0.7rem",
            }}
          >
            {fileContent}
          </pre>
          <div>
            {getColumnHeaders()}
            <DisplayLinesData />
            <div
              className="button_grid"
              style={{
                gridTemplateColumns: modalGone
                  ? "repeat(3, 7rem)"
                  : "repeat(2, 7rem)",
              }}
            >
              <button
                className="main_buttons"
                disabled={selectedCheckboxes?.length <= 0}
                onClick={handleDelete}
              >
                <FaRegTrashAlt
                  size={iconSize * 0.9}
                  style={{ marginRight: "0.5rem" }}
                />
                Delete
              </button>
              <button
                title="Only active when opening balance exists"
                className="main_buttons"
                onClick={handleSave}
                disabled={!editableHeaders || !lines || !transactionOpenBalance}
              >
                <FaRegSave size={iconSize} style={{ marginRight: "0.5rem" }} />
                Save
              </button>
              {modalGone && (
                <button
                  className="main_buttons"
                  onClick={() => {
                    setNoOpenBalance(true);
                  }}
                >
                  <FaBalanceScaleLeft
                    size={iconSize}
                    style={{ marginRight: "0.5rem" }}
                  />
                  Set Opening Balance
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {loadedTransactions && loadedTransactions?.length > 0 && dataSaved && (
        <div className="display-container">
          {/* {loadedTransactions && loadedTransactions?.length > 0 ? ( */}
          <p>
            These transactions are transactions saved and transactions without
            category descriptions. For the App to work category descriptions
            must exist for each transaction. The App will learn the category
            descriptions for certain descriptions. Please edit the categories
            here if they are incorrect and fill in missing descriptions.
          </p>
          <EditTable
            transactions={loadedTransactions}
            setTransactions={setEditedTrans}
            checkedTransactions={setCheckedTransactions}
            handleBlur={handleBlur}
            handleFocus={handleFocus}
          />
          <button
            className="main_buttons"
            disabled={selectedEditCatCheckboxes?.length <= 0}
            onClick={handleEditCatDelete}
          >
            <FaRegTrashAlt
              size={iconSize * 0.9}
              style={{ marginRight: "0.5rem" }}
            />
            Delete
          </button>
          <button
            title="Only active when opening balance exists"
            className="main_buttons"
            onClick={handleEditCatSave}
            disabled={!confirmations}
          >
            <FaRegSave size={iconSize} style={{ marginRight: "0.5rem" }} />
            Save
          </button>
        </div>
      )}
      {accForDataModal && (
        <Modals
          title="Account number"
          onClose={() => handleCloseAccModal()}
          footer={
            <div>
              <button
                className="UI-button-service"
                type="button"
                onClick={() => {
                  setAccForDataModal(false);
                }}
              >
                Proceed
              </button>
              <button
                className="UI-button-service"
                type="button"
                onClick={() => {
                  handleChangeCurrAccNo();
                }}
              >
                Change
              </button>
              <button
                className="UI-button-service"
                type="button"
                onClick={() => {
                  handleNewCurrAccNo();
                }}
              >
                New
              </button>
            </div>
          }
        >
          <div>
            <p>
              The current account number selected, {currentAccNumber} does not
              match an account number found in the import file, {possAccNo}
            </p>
            <p>
              proceed with current account number - {currentAccNumber} - click
              Proceed
            </p>
            <p>
              {" "}
              or change current account number to match import file account
              number {possAccNo} - click Change
            </p>
            <p>or enter a new account number - click New</p>
          </div>
        </Modals>
      )}
    </div>
  );
};

export default ImportDataNew;
