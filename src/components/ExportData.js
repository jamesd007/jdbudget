import React, { useEffect, useState } from "react";
import { Container, Typography } from "@mui/material";
import DateRangePicker from "../utils/DateRangePicker";
import db from "../store/Dexie";
import "../styles/MainStyles.css";
import "../styles/ExportStyles.css";
import { formatISO } from "date-fns";

const ExportData = () => {
  const [delimiter, setDelimiter] = useState(",");
  const [transactionsForExport, setTransactionsForExport] = useState([]);
  const [formattedStartDate, setFormattedStartDate] = useState();
  const [formattedEndDate, setFormattedEndDate] = useState();

  const stripTimeComponent = (isoDateString) => {
    return isoDateString.split("T")[0];
  };

  const formatDateToISOWithoutTime = (date) => {
    return formatISO(date, { representation: "date" });
  };

  const getDataForExport = async (startDate, endDate) => {
    const isoStartDate = formatDateToISOWithoutTime(startDate);
    // const isoEndDate = formatDateToISOWithoutTime(endDate);
    endDate.setHours(23, 59, 59, 999);
    const isoEndDate = endDate.toISOString();
    if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
      alert("Invalid date selection. Please select valid dates.");
      return;
    }
    try {
      const transactions = await db.transactions
        .where("date")
        .between(isoStartDate, isoEndDate, true, true)
        .toArray();
      const transForExport = transactions.map((transaction) => {
        return {
          ...transaction,
          date: stripTimeComponent(transaction.date),
        };
      });
      setTransactionsForExport(transForExport);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  //start of tedtest
  const exportToCSV = (data, delimiter = ",") => {
    // Get the keys from the first object to use as the header row
    const headers = [
      "id",
      "date",
      "day",
      "bankcode",
      "type",
      "description",
      "category_code",
      "category_description",
      "amount1",
      "amount2",
      "balance",
    ];

    // Create the header row
    let csvContent = headers.join(delimiter) + "\n";

    // Create the data rows
    data.forEach((row) => {
      let rowContent = headers
        .map((header) => {
          // Check if the value is defined
          let value = row[header];

          // Format dates to ISO string without time component
          if (value instanceof Date) {
            value = formatISO(value, { representation: "date" });
          }

          return value !== undefined ? value : "";
        })
        .join(delimiter);
      csvContent += rowContent + "\n";
    });

    return csvContent;
  };

  // const csv = exportToCSV(transactionsForExport);
  // console.log(csv);
  //end of tedtest

  const displayData = () => {
    let csv = exportToCSV(transactionsForExport);
    return <div>{csv}</div>;
  };

  const exportDataToFile = () => {
    // const header = ["ID", "Date", "Type", "Description", "Category", "Amount"];
    // const rows = transactionsForExport.map((row) => [
    //   row.id,
    //   row.date,
    //   row.type,
    //   row.description,
    //   row.category,
    //   row.amount,
    // ]);

    // const csvContent = [header, ...rows]
    //   .map(
    //     (e) =>
    //       e
    //         .map((field) => `"${String(field).replace(/"/g, '""')}"`)
    //         .join(`${delimiter}`) //","
    //   )
    //   .join("\n");
    let csv = exportToCSV(transactionsForExport);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `export_${formattedStartDate}_to_${formattedEndDate}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelimiterChange = (e) => {
    setDelimiter(e.target.value);
  };

  return (
    <div className="export-work-container">
      <Container>
        {/* <Typography variant="h4" gutterBottom>
          Export Data by Date Range
        </Typography> */}
        <DateRangePicker onExport={getDataForExport} />
      </Container>
      {transactionsForExport && (
        <div>
          <div>
            <label>delimiter: </label>
            <input
              className="delimiterStyle"
              value={delimiter}
              type="text"
              onChange={handleDelimiterChange}
            ></input>
          </div>
          <div>
            <b>File Content:</b>
            <pre
              className="export-file-content"
              style={{
                fontSize: "0.7rem",
              }}
            >
              {displayData()}
            </pre>
          </div>
        </div>
      )}
      <button className="main_buttons" onClick={() => exportDataToFile()}>
        Export
      </button>
    </div>
  );
};

export default ExportData;
