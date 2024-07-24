import React, { useEffect, useState } from "react";
import { BiSolidUpArrow } from "react-icons/bi";
import { BiSolidDownArrow } from "react-icons/bi";
import "../styles/ReportsStyles.css";

const ReportsTable = ({ allTrans, colWidthArr, headers, ...props }) => {
  const [selectedRows, setselectedRows] = useState([]);
  const [sortedTrans, setSortedTrans] = useState([]);
  useEffect(() => {
    setSortedTrans(allTrans);
  }, [allTrans]);
  // const [sortConfig, setSortConfig] = useState({
  //   key: null,
  //   direction: "ascending",
  // });

  // const sortedTrans = React.useMemo(() => {
  //   console.log("tedtest sortedtrans allTrans=", allTrans);
  //   if (!sortConfig.key) return allTrans;

  //   const sortedArray = [...allTrans].sort((a, b) => {
  //     if (a[sortConfig.key] < b[sortConfig.key]) {
  //       return sortConfig.direction === "ascending" ? -1 : 1;
  //     }
  //     if (a[sortConfig.key] > b[sortConfig.key]) {
  //       return sortConfig.direction === "ascending" ? 1 : -1;
  //     }
  //     return 0;
  //   });

  //   return sortedArray;
  // }, [allTrans, sortConfig]);

  // const handleSort = (key) => {
  //   let direction = "ascending";
  //   if (sortConfig.key === key && sortConfig.direction === "ascending") {
  //     direction = "descending";
  //   }
  //   setSortConfig({ key, direction });
  // };

  // const getArrow = (key) => {
  //   if (sortConfig.key === key) {
  //     return sortConfig.direction === "ascending" ? (
  //       <BiSolidUpArrow />
  //     ) : (
  //       <BiSolidDownArrow />
  //     );
  //   }
  //   return "";
  // };

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

  const generateGridTemplateColumns = () => {
    if (props?.colWidth) {
      return `repeat(${headers?.length + 1}, ${props?.colWidth})`;
    } else if (colWidthArr && colWidthArr.length > 0) {
      return `${colWidthArr.join(" ")}`;
    } else {
      return `repeat(${headers?.length + 2}, 3rem)`; // +2 for the extra column with 2rem width
    }
  };

  const handleSelectAll = () => {
    if (selectedRows?.length === sortedTrans?.length) {
      setselectedRows([]);
    } else {
      setselectedRows(sortedTrans?.map((item) => item.id));
    }
  };

  return (
    <div className="reports-table-content">
      {sortedTrans && sortedTrans.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th
                className="reports-checkbox-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: generateGridTemplateColumns(),
                  fontSize: "0.9rem",
                  borderBottom: "1px solid black",
                }}
              >
                {headers.map((item, index) => (
                  <span key={index}>{item}</span>
                ))}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTrans.map((item, index) => {
              return (
                <tr
                  key={index}
                  className="reports-checkbox-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: generateGridTemplateColumns(),
                  }}
                >
                  {headers.map((key, keyIndex) => (
                    <td key={keyIndex}>
                      <span>{item[key]}</span>
                    </td>
                  ))}
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
