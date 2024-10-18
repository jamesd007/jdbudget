import React, { useEffect, useState, useMemo } from "react";
import { BiSolidUpArrow } from "react-icons/bi";
import { BiSolidDownArrow } from "react-icons/bi";
import "../styles/ReportsStyles.css";
import styles from "../styles/Reports.module.css";
import dayjs from "dayjs";

const ReportsTable = ({ allTrans, colWidthArr, headers, ...props }) => {
  //tedtest TODO colWidthArr not used
  const [sortedTrans, setSortedTrans] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "ascending",
  });

  useEffect(() => {
    setSortedTrans(allTrans);
  }, [allTrans]);

  const sortedTransactions = useMemo(() => {
    const sortedData = [...sortedTrans];
    if (sortConfig.key) {
      let index = sortConfig.key.toLowerCase();
      // Sorting by date
      if (index === "date") {
        sortedData.sort((a, b) => {
          const dateA = new Date(a[index]);
          const dateB = new Date(b[index]);
          return sortConfig.direction === "ascending"
            ? dateA - dateB
            : dateB - dateA;
        });
      }
      // Sorting by numeric amount
      else if (index === "dr") {
        sortedData.sort((a, b) => {
          // Calculate temporary values
          const tempValueA =
            a["transactiontype"] === "income"
              ? 0
              : parseFloat(a["amount"]) || 0;
          const tempValueB =
            b["transactiontype"] === "income"
              ? 0
              : parseFloat(b["amount"]) || 0;

          // Prioritize non-zero values
          if (tempValueA === 0 && tempValueB !== 0) return 1;
          if (tempValueA !== 0 && tempValueB === 0) return -1;

          // If both are non-zero, sort by the value
          return sortConfig.direction === "ascending"
            ? tempValueA - tempValueB
            : tempValueB - tempValueA;
        });
      } else if (index === "cr") {
        sortedData.sort((a, b) => {
          // Calculate temporary values
          const tempValueA =
            a["transactiontype"] === "expenses"
              ? 0
              : parseFloat(a["amount"]) || 0;
          const tempValueB =
            b["transactiontype"] === "expenses"
              ? 0
              : parseFloat(b["amount"]) || 0;

          // Prioritize non-zero values
          if (tempValueA === 0 && tempValueB !== 0) return 1;
          if (tempValueA !== 0 && tempValueB === 0) return -1;

          // If both are non-zero, sort by the value
          return sortConfig.direction === "ascending"
            ? tempValueA - tempValueB
            : tempValueB - tempValueA;
        });
      }

      // Sorting by strings
      else if (typeof sortedData[0][index] === "string") {
        sortedData.sort((a, b) => {
          const valueA = a[index].toLowerCase();
          const valueB = b[index].toLowerCase();
          return sortConfig.direction === "ascending"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        });
      }
      // Sorting for any other type (e.g., numbers)
      else {
        sortedData.sort((a, b) => {
          if (a[index] < b[index]) {
            return sortConfig.direction === "ascending" ? -1 : 1;
          }
          if (a[index] > b[index]) {
            return sortConfig.direction === "ascending" ? 1 : -1;
          }
          return 0;
        });
      }
    }
    return sortedData;
  }, [sortedTrans, sortConfig]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getDayOfWeek = (date) => {
    return dayjs(date).format("ddd");
  };

  return (
    <div className={styles.tablecontainer}>
      {sortedTransactions && sortedTrans.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th
                onClick={() => requestSort("account_id")}
                className={styles.accountid}
              >
                Account_id{" "}
                {sortConfig.key === "account_id" ? (
                  sortConfig.direction === "ascending" ? (
                    <BiSolidUpArrow />
                  ) : (
                    <BiSolidDownArrow />
                  )
                ) : null}
              </th>
              <th onClick={() => requestSort("date")} className={styles.date}>
                Date{" "}
                {sortConfig.key === "date" ? (
                  sortConfig.direction === "ascending" ? (
                    <BiSolidUpArrow />
                  ) : (
                    <BiSolidDownArrow />
                  )
                ) : null}
              </th>
              <th className={styles.day}>Day</th>
              <th
                className={styles.description}
                onClick={() => requestSort("description")}
              >
                Description{" "}
                {sortConfig.key === "description" ? (
                  sortConfig.direction === "ascending" ? (
                    <BiSolidUpArrow />
                  ) : (
                    <BiSolidDownArrow />
                  )
                ) : null}
              </th>
              <th
                className={styles.category}
                onClick={() => requestSort("category_description")}
              >
                Category{" "}
                {sortConfig.key === "category_description" ? (
                  sortConfig.direction === "ascending" ? (
                    <BiSolidUpArrow />
                  ) : (
                    <BiSolidDownArrow />
                  )
                ) : null}
              </th>
              <th
                className={styles.transactiontype}
                onClick={() => requestSort("transactiontype")}
              >
                inc/exp{" "}
                {sortConfig.key === "transactiontype" ? (
                  sortConfig.direction === "ascending" ? (
                    <BiSolidUpArrow />
                  ) : (
                    <BiSolidDownArrow />
                  )
                ) : null}
              </th>
              <th className={styles.dr} onClick={() => requestSort("dr")}>
                Dr{" "}
                {sortConfig.key === "dr" ? (
                  sortConfig.direction === "ascending" ? (
                    <BiSolidUpArrow />
                  ) : (
                    <BiSolidDownArrow />
                  )
                ) : null}
              </th>
              <th className={styles.cr} onClick={() => requestSort("cr")}>
                Cr{" "}
                {sortConfig.key === "cr" ? (
                  sortConfig.direction === "ascending" ? (
                    <BiSolidUpArrow />
                  ) : (
                    <BiSolidDownArrow />
                  )
                ) : null}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map((item, index) => {
              return (
                <tr key={item.id}>
                  <td className={styles.accountid}>{item.account_id}</td>
                  <td className={styles.date}>{item.date}</td>
                  <td //day
                    className={styles.day}
                  >
                    {getDayOfWeek(item.date)}
                  </td>
                  <td //description
                    className={styles.description}
                  >
                    {item.description}
                  </td>
                  <td //category
                    className={styles.category}
                  >
                    {item.category_description}
                  </td>
                  <td //incexp
                    className={styles.incexp}
                  >
                    {item.transactiontype}
                  </td>
                  <td //dr
                    className={styles.dr}
                  >
                    {item.transactiontype === "expenses" && item.amount}
                  </td>
                  <td //cr
                    className={styles.cr}
                  >
                    {item.transactiontype === "income" && item.amount}
                  </td>
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
