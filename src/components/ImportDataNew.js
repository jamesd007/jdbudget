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
import EditTableNew from "../utils/EditTableNew";
import { parse, formatISO, isValid, set } from "date-fns";
import { updateTransaction } from "../store/Dexie";
import possHeaders from "../data/possHeaders";

const ImportDataNew = (props) => {
  const [openBalance, setOpenBalance] = useState(0);
  const [closeBalance, setCloseBalance] = useState(0);
  const [fileContent, setFileContent] = useState(null);
  const [newAccountId, setNewAccountId] = useState("");
  const [numberHeaders, setNumberHeaders] = useState(0);
  const [accountID, setAccountID] = useState("");
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
  } = useDataContext();

  const cantEditArray = [
    "ignore",
    "account",
    "account_id",
    "amount1",
    "amount2",
    "balance",
    "bank_code",
    "category_code",
    "date",
    "day",
    "description",
    "extra",
    "type",
    "timestamp",
    "id",
  ];
  const defaultWidth = "5rem";
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

  const showInfoHeaders = () => {
    alert(
      "The header name will be used to populate the column in the database." +
        "\n" +
        "Choose 'ignore' if you do not want a column to appear in the database." +
        "\n" +
        "Ignore will remove the column from the preview, it can be recovered by selecting a different header name" +
        "\n" +
        "\n" +
        "Headers are saved for account IDs. If your input file contains the account ID, the headers will be fetched for that account. You may still change them."
    );
  };

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
        console.log("tedtestQQQ dateString=", dateString);
        console.log("tedtestQQQ formatString=", formatString);

        const parsedDate = parse(dateString, formatString, new Date());
        console.log("tedtestQQ parsedDate=", parsedDate);
        if (isValid(parsedDate)) {
          console.log("tedtestQQ parsedDate is valid");
          const isoDate = formatISO(parsedDate, { representation: "date" });
          // const isoDate = parsedDate.
          // toISOString(); // Full ISO date-time string
          console.log(
            `tedtestQQ Successfully parsed with format ${formatString}:`,
            isoDate
          );
          console.log(
            `Successfully parsed with format ${formatString}:`,
            isoDate
          );
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
      setAccountID(null);
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
          }
          if (
            fields[count].toLowerCase().includes("close balance") ||
            fields[count].toLowerCase().includes("closing balance")
          ) {
            setCloseBalance(parseFloat(fields[count - 1])?.toFixed(2));
          }
        }
      });
      setNumberHeaders(noHeaders);
    };
    if (!lines) {
      return;
    }
    getOpenCloseBalances();
  }, [lines]);

  //getaccount_id
  useEffect(() => {
    const getAccountId = async () => {
      let foundAccNo = false;
      for (const record of lines) {
        let fields = record.data.split(delimiter);
        if (fields.includes("ACC-NO")) {
          const potentialAccountNumber = findPotentialAccountNumber(fields);
          if (potentialAccountNumber) {
            foundAccNo = true;
            setAccountID(potentialAccountNumber);
            break; // Exit the loop as soon as we find an account number
          }
        }
      }
      return foundAccNo;
    };

    const checkAccountId = async () => {
      let found = await getAccountId();
      if (!found) {
        setGetAccNumber(true);
      } else {
      }
    };
    if (!fileContent) {
      return;
    }
    checkAccountId();
  }, [fileContent]);

  //get Headers
  useEffect(() => {
    const getHeaders = async () => {
      let dbaseHeaders = [];
      //already have accountID, just look for accountID in the headers table and populate the headers
      //if cannot find accountID then ask user
      dbaseHeaders = await db.headers.where({ account_id: accountID }).first();
      if (dbaseHeaders) {
        // Populate dbaseHeaders with the headers element from the existing header
        const existHeaders = dbaseHeaders.headers;
        // Populate editableHeaders with the names found in dbaseHeaders
        setEditableHeaders(existHeaders);
      } else {
        window.alert(
          `No headers for Account ID, ${accountID}, were found in the headers table. Please enter headers manually.`
        );
        setEditableHeaders(Array.from({ length: numberHeaders }, () => ""));
      }
    };
    if (!accountID) {
      return;
    }
    getHeaders();
  }, [accountID]);

  const handleNewAccountId = (e) => {
    setNewAccountId(e.target.value);
  };

  const validAccId = (accId) => {
    if (!accId || accId.length <= 0) return false;
    else return true;
  };

  const handleSubmitAccNo = (accId) => {
    if (validAccId(accId)) {
      setAccountID(accId);
      setGetAccNumber(false);
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
    let tempArr = editableHeaders.filter((item) => item !== "ignore");
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
        Account ID:{accountID}
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
    let checkBal = getLatestBalance(accountID);
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

  // check for Opening balance on Database
  useEffect(() => {
    const checkOpeningBalanceDatabase = async () => {
      console.log("tedtestQ checkOpenBalanceDatabase");
      let accountPresent = await accountExists(accountID);
      if (accountPresent) {
        //tedtest this still to be tested
        let databaseClosingBalance = await getLatestBalance(accountID);
        databaseClosingBalance = parseFloat(
          parseFloat(databaseClosingBalance).toFixed(2)
        );
        let tempOpenBal = parseFloat(openBalance).toFixed(2);
        if (databaseClosingBalance - tempOpenBal !== 0) {
          setBalanceUnequal(true);
          setdbaseBalance(databaseClosingBalance);
          // setNoOpenBalance(true);
          // setNewOpenBalance(openBalance);
        } else setConfirmations(true);
      } else {
        setNoOpenBalance(true);
        if (typeof openBalance === "string")
          setNewOpenBalance(parseFloat(openBalance).toFixed(2));
        else setNewOpenBalance(openBalance);
      }
    };
    console.log(
      "tedtestQ is this happening??? openBalance=",
      openBalance,
      "  accountID=",
      accountID,
      "  editableHeaders=",
      editableHeaders
    );
    if (!accountID) return;
    //  !openBalance || || !editableHeaders) return;
    checkOpeningBalanceDatabase();
  }, [openBalance, accountID]);

  const addNewTransactions = async (newTransactions) => {
    let closingBalance;
    let idArr = [];
    let accountPresent = await accountExists(accountID);
    if (accountPresent) {
      closingBalance = await getLatestBalance(accountID);
    } else {
      if (typeof newOpenBalance === "string")
        closingBalance = parseFloat(parseFloat(newOpenBalance).toFixed(2));
      else closingBalance = newOpenBalance;
    }
    for (const transaction of newTransactions) {
      transaction.account_id = accountID;
      // Skip transactions with invalid dates
      if (
        transaction?.date === "19700101" ||
        transaction?.date === "0" ||
        transaction?.date?.length < 6 ||
        transaction?.date?.length > 18 ||
        transaction?.date === accountID
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
      if (editableHeaders.includes("amount2")) twoCols = true;
      if (!twoCols) {
        transaction.amount1 = parseFloat(transaction.amount1).toFixed(2);
        if (isNaN(transaction.amount1)) {
          transaction.amount1 = 0;
        }
        if (transaction.amount1 < 0) {
          transaction.amount1 = -1 * transaction.amount1;
          transaction.amount2 = 0;
        } else {
          transaction.amount2 = transaction.amount1;
          transaction.amount1 = 0;
        }
      } else {
        transaction.amount1 = parseFloat(transaction.amount1).toFixed(2);
        if (isNaN(transaction.amount1)) {
          transaction.amount1 = 0;
        }
        transaction.amount2 = parseFloat(transaction.amount2).toFixed(2);
        if (isNaN(transaction.amount2)) {
          transaction.amount2 = 0;
        }
      }
      // Find a duplicate record based on the given criteria
      const duplicate = await db.transactions
        .where({
          date: transaction.date,
          description: transaction.description,
          amount1: transaction.amount1,
          amount2: transaction.amount2,
        })
        .first();
      // If no duplicate found, add the transaction
      let toBeAdded = true;
      if (duplicate) {
        console.log("tedtestQ duplicate: transaction=", transaction);
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
            .where("description")
            .equals(transaction.description)
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
        let transactionAmount = transaction.amount2 - transaction.amount1;
        closingBalance = parseFloat(
          (closingBalance + transactionAmount).toFixed(2)
        );
        transaction.balance = closingBalance;
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

  // const isValidHdrs = editableHeaders.some(
  //   (header) => header && possHeaders.includes(header)
  // );

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
    lines?.forEach((line) => {
      const dataValues = line?.data?.split(",");
      const entry = {};
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
            //Determine if the value is a valid number
            if (!isNaN(parsedValue)) {
              // If it is a number, use the parsed value
              entry[header] = parsedValue;
            } else {
              // If it's not a number, retain the original string
              entry[header] = originalValue;
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
    setConfirmations(false);
    setSelectedFile(null);
    setFileContent(null);
    setOpenBalance(0);
    setCloseBalance(0);
    setNewAccountId("");
    setNumberHeaders(0);
    setAccountID("");
    setGetAccNumber(false);
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
      //tedtest for each record in processeddata check if it hs category_description
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
      addOrUpdateHeaders(accountID, editableHeaders);
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
            "amount1",
            "amount2",
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
      //tedtest check if description is in table category_descriptions
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

  return (
    <div>
      <FileUpload></FileUpload>
      {getAccNumber && (
        <Modals
          title="Account number"
          onClose={() => setGetAccNumber(false)}
          onClickOutside={() => setGetAccNumber(false)}
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
      )}
      {fileContent && accountID && accountID.length > 0 && (
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
                disabled={!confirmations}
              >
                <FaRegSave size={iconSize} style={{ marginRight: "0.5rem" }} />
                Save
              </button>
              {/* <button
                title="Only active when opening balance exists"
                className="main_buttons"
                onClick={handleFixOpenBal}
                disabled={!confirmations}
              >
                <FaRegSave size={iconSize} style={{ marginRight: "0.5rem" }} />
                Fix Open balance
              </button> */}
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
      {(noOpenBalance || balanceUnequal) && (
        <Modals
          // noBckgrnd={true}
          title={
            noOpenBalance ? "Opening balance" : "Warning: Balance mismatch"
          }
          onClose={
            () => handleClose()
            // noOpenBalance ? setNoOpenBalance(false) : setBalanceUnequal(false)
          }
          onClickOutside={() => handleClickOutside()}
          footer={
            <div>
              <button
                className="UI-button-service"
                type="button"
                onClick={() => {
                  handleSubmit(newOpenBalance);
                }}
              >
                Proceed
              </button>
              <button
                className="UI-button-service"
                type="button"
                onClick={() => {
                  setModalGone(true);
                  setNoOpenBalance(false);
                  setBalanceUnequal(false);
                }}
              >
                Cancel
              </button>
            </div>
          }
        >
          {noOpenBalance && (
            <div>
              <p>
                No closing balance was found for account {accountID} on the
                database. The closing balance on the database is used as a check
                against the opening balance on the import file. Please enter
                opening balance. (if a balance exists in the import file it will
                appear below)
              </p>
              <label className="modal-label-new">Enter opening balance</label>
              <input
                value={newOpenBalance}
                type="text"
                onChange={handleOpenBalanceChange}
                onKeyDown={handleKeyDownBalance}
              ></input>
            </div>
          )}
          {balanceUnequal && (
            <p style={{ width: "100%", wordWrap: "break-word" }}>
              The opening balance of the imported data does not match the
              current closing balance in the database.
              <br />
              Current Database Balance: {dbaseBalance}
              <br />
              Imported Data Opening Balance: {openBalance}
              <br />
              To maintain accurate records, the current database balance will be
              used as the starting point for all future transactions. Would you
              like to:
              <br />
              Cancel the import process to review and correct the imported data?
              <br />
              Proceed with the import using the current database balance to
              calculate future balances?
            </p>
          )}
        </Modals>
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
          <EditTableNew
            checkedTransactions={setCheckedTransactions}
            transactions={loadedTransactions}
            setTransactions={setEditedTrans}
            handleBlur={handleBlur}
            handleFocus={handleFocus}
            colWidthArr={colWidths}
            headers={uniqueKeys}
            cantEditArray={cantEditArray}
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
    </div>
  );
};

export default ImportDataNew;
