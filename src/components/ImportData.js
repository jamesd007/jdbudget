import React, { useState } from "react";
import "../styles/ImportData.css";
import CheckboxTable from "../utils/CheckBoxTable";
import { useDataContext } from "../providers/DataProvider";
import { FaRegSave } from "react-icons/fa";
import { FaRegTrashAlt } from "react-icons/fa";
import { FaInfoCircle } from "react-icons/fa";
import db from "../store/Dexie";
import { parse, formatISO, isValid } from "date-fns";
import Modals from "../utils/Modals";
import "../styles/Modals.css";

const ImportData = (props) => {
  // const [longestFields, setLongestFields] = useState(0);
  const [fileContent, setFileContent] = useState(null);
  const iconSize = 20;
  const [openBalance, setOpenBalance] = useState(0);
  const [closeBalance, setCloseBalance] = useState(0);
  const [newOpenBalance, setNewOpenBalance] = useState(0);
  const [newAccountId, setNewAccountId] = useState("");
  const [noOpenBalance, setNoOpenBalance] = useState(false);
  const [confirmations, setConfirmations] = useState(false);
  // const DEFAULT_DATE = new Date("1900-01-01"); // Default date value
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
  const [accountID, setAccountID] = useState("");
  const possHeaders = [
    "ignore",
    "account",
    "account_id",
    "amount1",
    "amount2",
    "balance",
    "bank_code",
    "category_code",
    "category_description",
    "date",
    "day",
    "description",
    "extra",
    "headers",
    "type",
  ];
  let countRecords = 0;
  let countDuplicates = 0;
  const dateFormats = [
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
    "dd MMM yy",
  ];
  const [getAccNumber, setGetAccNumber] = useState(false);

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
      console.log("tedtestGGG expandedYear=", expandedYear);
      const expandedDateString = dateString.replace(match[5], expandedYear);
      console.log("tedtestGGG expandedDateString=", expandedDateString);
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
    console.log("tedtestGGG dateString=", dateString);
    for (let formatString of dateFormats) {
      try {
        const parsedDate = parse(dateString, formatString, new Date());
        if (isValid(parsedDate)) {
          const isoDate = formatISO(parsedDate, { representation: "date" });
          // const isoDate = parsedDate.
          // toISOString(); // Full ISO date-time string
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

  async function accountExists(accountID) {
    console.log("tedtestTTT accountExists accountID=", accountID);
    const accountTest = await db.transactions.account_id;
    console.log("tedtestTTT accountTest=", accountTest);
    const account = await db.transactions
      .where("account_id")
      .equals(accountID)
      .first();
    console.log("tedtestTTT account=", account);
    if (account === undefined) {
      console.log(
        "tedtestTTT account is undefined so I am making this return false"
      );
      return false;
    } else {
      console.log("tedtestTTT will be returning !!account");
      return !!account; // Returns true if account exists, false otherwise
    }
  }

  const FileUpload = (fieldsData) => {
    // const [closeBtn, setCloseBtn] = useState(false);

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
      let dataLines = content.split("\n"); // Split the text into dataLines
      let longestLine = 0;
      let shortestLine = -1;
      let shortestFields = -1;
      let longestFieldLen = -1;
      let tmpArr = [];
      let dbaseHeaders = [];
      let foundAccNo = false;
      for (let i = 0; i < dataLines.length; i++) {
        let fields = dataLines[i].split(delimiter);
        // tedtest let's include a function checkAccIDAndBal
        if (fields.includes("ACC-NO")) {
          //tedtest need to see what other banks csv files contain
          if (findPotentialAccountNumber(fields)) {
            foundAccNo = true;
            setAccountID(findPotentialAccountNumber(fields));
            dbaseHeaders = await db.headers
              .where({ account_id: findPotentialAccountNumber(fields) })
              .first();
            if (dbaseHeaders) {
              // Populate dbaseHeaders with the headers element from the existing header
              const existHeaders = dbaseHeaders.headers;
              // Populate editableHeaders with the names found in dbaseHeaders
              setEditableHeaders(existHeaders);
            }
          }
        } else {
          setGetAccNumber(true);
        }
        if (dataLines[i].length > longestLine)
          longestLine = dataLines[i].length;
        if (dataLines[i].length < shortestLine)
          shortestLine = dataLines[i].length;
        if (fields.length > longestFieldLen) longestFieldLen = fields.length;
        if (fields.length < shortestFields || shortestFields === -1)
          shortestFields = fields.length;
        if (isValidLine(dataLines[i])) {
          tmpArr.push({ id: i, data: dataLines[i] });
        }

        //   //are there transactions for the account_id on the database:
        //   // find closingBalance on dbase
        //   // check if equal
        //   // yes: do Nothing
        //   // no: warn user - open bal and close bal not equal -proceed or not

        for (let count = 0; count < fields.length; count++) {
          if (fields[count].toLowerCase().includes("open balance")) {
            setOpenBalance(parseFloat(fields[count - 1])?.toFixed(2));
          }
          if (fields[count].toLowerCase() === "close balance") {
            setCloseBalance(parseFloat(fields[count - 1])?.toFixed(2));
          }
        }

        //     let tempOpenBal = parseFloat(fields[count - 1])?.toFixed(2);
        //     if (isNaN(tempOpenBal)) {
        //       // setOpeningBalance(null);
        //     } else {
        //       if (accountExists(accountID)) {
        //         console.log(
        //           "tedtestAAA accountID=",accountID)
        //         let checkBal = await getLatestBalance(accountID);
        //         checkBal = parseFloat(parseFloat(checkBal).toFixed(2));
        //         console.log(
        //           "tedtestAAA checkBal=",
        //           checkBal,
        //           "........tempOpenBal=",
        //           tempOpenBal
        //         );
        //         if (checkBal !== tempOpenBal)
        //           window.confirm(
        //             "New open balance not equal to close balance in database. Proceed?"
        //           );
        //         else
        //           window.alert(
        //             "New open balance equal to close balance in database. Proceed?"
        //           );
        //       } else {
        //       }
        //       // setOpeningBalance(tempOpenBal);
        //     }
        //   }
        //   // else console.log("tedtestKK fields doe not include open balance",fields[count])
        // }

        // if (dataLines[i]?.data?.toLowerCase().includes("close balance")) {
        //   setClosingBalance(dataLines[i]?.data);
        //   let tempCloseBal = parseFloat(dataLines[i]?.data).toFixed(2);
        //   if (isNaN(tempCloseBal)) {
        //     setClosingBalance(null);
        //   } else setClosingBalance(tempCloseBal);
        // }
      }

      // setLongestFields(longestFieldLen);
      setFileContent(content);
      setLines(tmpArr);
      if (
        (editableHeaders.length <= 0 &&
          (!dbaseHeaders || dbaseHeaders.length <= 0)) ||
        (foundAccNo && (!dbaseHeaders || dbaseHeaders.length <= 0))
      ) {
        setEditableHeaders(Array.from({ length: longestFieldLen }, () => ""));
      }
    };

    const handleFileChange = (event) => {
      setSelectedFile(event.target.files[0]);
      setEditableHeaders([]);
      // setGotHeaders(false);
      setAccountID(null);
      let reader = new FileReader();
      reader.onload = handleFileRead;
      reader.readAsText(event.target.files[0]);
      // setCloseBtn(true);
    };

    const handleButtonClick = () => {
      document.getElementById("fileInput").click();
    };

    return (
      <div>
        <div>
          <input
            id="fileInput"
            type="file"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <button onClick={handleButtonClick}>Choose File</button>
          {selectedFile && (
            <span style={{ fontSize: "0.9rem" }}> {selectedFile.name}</span>
          )}
        </div>
      </div>
    );
  };

  const handleHeaderChange = (e, index) => {
    const newHeaders = [...editableHeaders];
    newHeaders[index] = e.target.value;
    setEditableHeaders(newHeaders);
    console.log("tedtestjj4.newHeaders=", newHeaders);
  };

  const DisplayLinesData = () => {
    return (
      <div style={{ marginBottom: "0.5rem" }}>
        <CheckboxTable array={true} objects={false} colWidth="3rem" />
      </div>
    );
  };

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

  const getColumnHeaders = () => {
    return (
      <div>
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

              {/* {editableHeaders?.map((header, index) => {
                <select>
                  <option
                    value={header || ""}
                    onChange={(e) => handleHeaderChange(e, index)}
                  >
                    Select a header
                  </option>
                  {possHeaders.map((hdr) => (
                    <option key={hdr} value={hdr}>
                      {hdr}
                    </option>
                  ))}
                </select>;
              })} */}

              <td
                // key={index}
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
                      <option
                        key={hdr}
                        // value={hdr}
                      >
                        {hdr}
                      </option>
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

  const handleDelimiterChange = (e) => {
    setDelimiter(e.target.value);
  };

  const handleOpenBalanceChange = (e) => {
    setNewOpenBalance(e.target.value);
  };

  const handleSubmit = (newBal) => {
    setNoOpenBalance(false);
    setConfirmations(true);
  };

  const handleNewAccountId = (e) => {
    console.log("tedtest handlenewaccountid new accid=", e.target.value);
    setNewAccountId(e.target.value);
  };

  const validAccId = (accId) => {
    if (!accId || accId.length <= 0) return false;
    else return true;
  };

  const handleSubmitAccNo = (accId) => {
    console.log("tedtest accid=", accId);
    if (validAccId(accId)) {
      setAccountID(accId);
      setGetAccNumber(false);
    } else {
      window.alert("Please enter valid account ID; cannot be empty string");
    }
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
          entry[header] = dataValues[index];
        }
      });
      // if (entry?.type?.toLowerCase() === "open balance") {
      //   setOpenBalance(entry.amount);
      // }
      // if (entry?.type?.toLowerCase() === "close balance") {
      //   setCloseBalance(entry.amount);
      // }
      if (isValidObject(entry)) result.push(entry);
    });
    return result;
  };

  async function getLatestBalance(accountID) {
    console.log("tedtestIII accountID=", accountID);

    try {
      const transactions = await db.transactions
        .where("account_id")
        .equals(accountID)
        .toArray();

      console.log("tedtestIII transactions for accountID:", transactions);

      if (transactions.length === 0) {
        console.error("No transactions found for accountID:", accountID);
        return 0;
      }

      // Sort transactions by timestamp in descending order
      const latestTransaction = transactions.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      )[0];

      console.log("tedtestIII latestTransaction:", latestTransaction);

      return latestTransaction ? latestTransaction.balance : 0;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return 0;
    }
  }

  const addNewTransactions = async (newTransactions) => {
    let closingBalance = await getLatestBalance(accountID);
    for (const transaction of newTransactions) {
      transaction.account_id = accountID;
      // Skip transactions with invalid dates
      if (transaction?.date === "19700101" || transaction?.date === "0") {
        continue;
      } else {
        const parsed = parseDate(transaction.date);
        if (parsed) {
          transaction.date = parsed;
        }
      }
      if (transaction.amount1) {
        transaction.amount1 = parseFloat(transaction.amount1).toFixed(2);
        if (isNaN(transaction.amount1)) {
          transaction.amount1 = 0;
          // throw new Error(`Invalid amount format: ${transaction.amount1}`);
        }
      }
      if (transaction.amount2) {
        transaction.amount2 = parseFloat(transaction.amount2).toFixed(2);
        if (isNaN(transaction.amount2)) {
          transaction.amount2 = 0;
          // throw new Error(`Invalid amount format: ${transaction.amount1}`);
        }
      }
      if (transaction.amount1 && !transaction.amount2) {
        console.log("tedtestN transaction.amount1=", transaction.amount1);
        console.log("tedtestN transaction.amount2=", transaction.amount2);
        if (transaction.amount1 < 0) {
          transaction.amount1 = -1 * transaction.amount1;
          transaction.amount2 = 0;
        } else {
          transaction.amount2 = parseFloat(transaction.amount1).toFixed(2);
          transaction.amount1 = 0;
        }
        console.log("tedtestN after transaction.amount1=", transaction.amount1);
        console.log("tedtestN after transaction.amount2=", transaction.amount2);
      }
      // transaction.amount1 = parseFloat(transaction.amount1);

      // if (transaction.category_code) {
      //   transaction.category_code = parseInt(transaction.category_code, 10);
      //   if (isNaN(transaction.category_code)) {
      //     throw new Error(`Invalid category code format: ${transaction.category_code}`);
      //   }
      // }
      // Check for duplicates in the database
      const amount1 =
        transaction.amount1 < 0 ? -transaction.amount1 : transaction.amount1;
      const amount2 = transaction.amount2;

      // Find a duplicate record based on the given criteria
      const duplicate = await db.transactions
        .where({
          date: transaction.date,
          description: transaction.description,
          amount1: amount1,
          amount2: amount1 === transaction.amount1 ? amount2 : 0,
        })
        // .or("amount2")
        // .equals(amount2)//tedtest re check this
        .first();
      if (duplicate) {
        console.log("tedtestbbb duplicate found transaction=", transaction);
      } else {
        console.log("tedtestbbb duplicate NOT found transaction=", transaction);
      }
      // If no duplicate found, add the transaction
      if (!duplicate) {
        transaction.timestamp = new Date().toISOString();
        let transactionAmount = transaction.amount2 - transaction.amount1;
        closingBalance = closingBalance + transactionAmount;
        transaction.balance = closingBalance;
        countRecords++;
        await db.transactions.add(transaction);
      } else countDuplicates++;
    }
  };

  const isValidHdrs = editableHeaders.some(
    (header) => header && possHeaders.includes(header)
  );

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

  const handleSave = async () => {
    let proceed = true;
    if (selectedCheckboxes?.length > 0) {
      proceed = window.confirm(
        "There are checked boxes. Do you wish to proceed?"
      );
    }
    if (isValidHdrs && proceed) {
      const processedData = processData();
      let confirmation = false;
      let accountPresent = await accountExists(accountID);
      console.log("tedtestTTT ACCOUNTPRESENT=", accountPresent);
      if (accountPresent) {
        let checkBal = await getLatestBalance(accountID);
        checkBal = parseFloat(parseFloat(checkBal).toFixed(2));
        let tempOpenBal = -1 * parseFloat(openBalance).toFixed(2);
        if (checkBal !== tempOpenBal) {
          confirmation = window.confirm(
            "New open balance not equal to close balance in database. Proceed?"
          );
        } else {
          confirmation = window.confirm(
            "New open balance equal to close balance in database. Proceed?"
          );
        }
        setConfirmations(confirmation);
      } else {
        console.log("tedtestyyy before modal");
        setNoOpenBalance(true);
        // let confirmBal = window.confirm(
        //   "account does not exist in the database. Import File shows open balance as ",
        //   openBalance,
        //   " accept as opening balance?"
        // );
        // console.log(
        //   "tedtestBBB account does not exits but import file opening balance=",
        //   openBalance
        // );
        // if (confirmBal) {
        //   setNewOpenBalance(openBalance);
        // } else {
        //   setNoOpenBalance(true);
        // }
        console.log("tedtestyyy after modal");
      }
      console.log("tedtestAAA confirmation *** ", confirmation, "  ***");
      if (confirmation)
        addNewTransactions(processedData)
          .then(() => {
            alert(
              "Transactions added successfully! " +
                countRecords +
                " records added, and " +
                countDuplicates +
                " records duplicated"
            );
          })
          .catch((error) => {
            alert("Error adding transactions:", error);
          });
      addOrUpdateHeaders(accountID, editableHeaders);
    } else alert("Invalid headers. Please select valid headers.");
  };

  const handleClickOutside = () => {
    setNoOpenBalance(false);
  };

  return (
    <div>
      <FileUpload></FileUpload>
      {fileContent && fileContent.length > 0 && (
        <div style={{ width: "100%" }}>
          <div>
            <label>delimiter: </label>
            <input
              className="delimiterStyle"
              value={delimiter}
              type="text"
              onChange={handleDelimiterChange}
            ></input>
          </div>
          {fileContent && (
            <div style={{ width: "100%" }}>
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
                    ></input>
                  </Modals>
                )}
                {getColumnHeaders()}
                <DisplayLinesData />
                {noOpenBalance && (
                  <Modals
                    // noBckgrnd={true}
                    title="Opening balance"
                    onClose={() => setNoOpenBalance(false)}
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
                          Submit
                        </button>
                        <button
                          className="UI-button-service"
                          type="button"
                          onClick={() => {
                            setNoOpenBalance(false);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    }
                  >
                    <p>
                      No opening balance was found for account {accountID}.
                      Please enter opening balance. (if existing, the opening
                      balance found on your import file appears below)
                    </p>
                    <label className="modal-label-new">
                      Enter opening balance
                    </label>
                    <input
                      value={newOpenBalance}
                      type="text"
                      onChange={handleOpenBalanceChange}
                    ></input>
                  </Modals>
                )}
                <div className="button_grid">
                  <button
                    className="main_buttons"
                    disabled={selectedCheckboxes?.length <= 0}
                    onClick={handleDelete}
                  >
                    <FaRegTrashAlt size={iconSize * 0.9} />
                    Delete
                  </button>
                  <button className="main_buttons" onClick={handleSave}>
                    <FaRegSave size={iconSize} />
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImportData;
