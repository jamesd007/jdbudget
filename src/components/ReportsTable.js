import React, { useState } from "react";
import { BiSolidUpArrow } from "react-icons/bi";
import { BiSolidDownArrow } from "react-icons/bi";
import "../styles/ReportsStyles.css";

const ReportsTable = ({ allTrans }) => {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  const sortedTrans = React.useMemo(() => {
    if (!sortConfig.key) return allTrans;

    const sortedArray = [...allTrans].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });

    return sortedArray;
  }, [allTrans, sortConfig]);

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getArrow = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "ascending" ? (
        <BiSolidUpArrow />
      ) : (
        <BiSolidDownArrow />
      );
    }
    return "";
  };

  const parseDate = (dateStr) => {
    // Ensure the date string is in the expected format: YYYYMMDD
    if (dateStr.length !== 8) {
      return null;
    }
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return new Date(`${year}-${month}-${day}`);
  };

  return (
    <div className="reports-table-content">
      {sortedTrans && sortedTrans.length > 0 ? (
        <table>
          <thead>
            <tr className="header-row">
              <th className="reports-checkbox-row" style={{ fontSize: "1rem" }}>
                <span>account_id</span>
                <span onClick={() => handleSort("date")}>
                  Date{getArrow("date")}
                </span>
                <span>day</span>
                <span>bank_code</span>
                <span>type</span>
                <span>Description</span>
                {/* <span onClick={() => handleSort("description")}>
                  Description
                </span> */}
                <span>cat_code</span>
                <span>category</span>
                <span>Dr</span>
                <span>Cr</span>
                <span>balance</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTrans.map((item, index) => {
              console.log("tedtestG item=", item);
              // let tmpDate = parseDate(item.date);
              // const formattedDate = new Date(tmpDate).toLocaleDateString(
              //   "en-US",
              //   {
              //     year: "numeric",
              //     month: "long",
              //     day: "numeric",
              //   }
              // );

              return (
                <tr key={index} className="reports-checkbox-row">
                  {/* <td>
                    {item.date} */}
                  {/* {formattedDate} */}
                  {/* </td> */}
                  {/* return (
                <tr key={index} className="reports-checkbox-row">
                  <td>
                    {item.date}
                  </td> */}
                  <td>{item.account_id}</td>
                  <td>{item.date}</td>
                  <td>{item.day}</td>
                  <td>{item.bank_code}</td>
                  <td>{item.type}</td>
                  <td>{item.description}</td>
                  <td>{item.category_code}</td>
                  <td>{item.category_description}</td>
                  <td>{item.amount1}</td>
                  <td>{item.amount2}</td>
                  <td>{item.balance}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>No data found</p>
      )}
    </div>
  );
};

export default ReportsTable;
