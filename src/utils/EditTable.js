import React, {
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
  useCallback,
} from "react";
import "../styles/CheckBox.css";

const EditTable = ({
  transactions,
  setTransactions,
  checkedTransactions,
  handleBlur,
  handleFocus,
}) => {
  const [selectedRows, setselectedRows] = useState([]);
  const [editableTransactions, setEditableTransactions] =
    useState(transactions);

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

  const handleDataChange = (e, index) => {
    const { name, value } = e.target;
    const updatedTransactions = [...editableTransactions];
    updatedTransactions[index] = {
      ...updatedTransactions[index],
      [name]: value,
    };
    setEditableTransactions(updatedTransactions);
    setTransactions(updatedTransactions); // Update parent state
  };

  // useLayoutEffect(() => {
  // Restore the scroll position after the state has been updated and the component has re-rendered
  // if (tableRef.current) {
  //   tableRef.current.scrollTop = scrollPosition;
  // }
  // });

  const handleSelectAll = () => {
    if (selectedRows?.length === transactions?.length) {
      setselectedRows([]);
    } else {
      setselectedRows(transactions?.map((item) => item.id));
    }
  };

  // const getColumnWidth = (columnIndex) => {
  //   const cells = document.querySelectorAll(
  //     `.editable-transactions tbody td:nth-child(${columnIndex + 1})`
  //   );
  //   let maxWidth = 0;
  //   cells.forEach((cell) => {
  //     maxWidth = Math.max(maxWidth, cell.getBoundingClientRect().width);
  //   });
  //   return `${maxWidth}px`;
  // };

  // const generateGridTemplateColumns = () => {
  //   const numColumns = 5; /* calculate the number of columns dynamically */
  //   let columnsWidth = "";
  //   for (let i = 0; i < numColumns; i++) {
  //     columnsWidth += `minmax(${getColumnWidth(i)}, max-content) `;
  //   }
  //   return columnsWidth;
  // };

  return (
    <div>
      <div className="edit-table-content">
        {transactions && transactions?.length > 0 ? (
          <table>
            <thead>
              <tr className="header-row">
                <th className="edit-checkbox-row" style={{ fontSize: "1rem" }}>
                  <span></span>
                  <span>Date</span>
                  <span>Amount</span>
                  <span>Type</span>
                  <span>Description</span>
                  <span>Category</span>
                </th>
              </tr>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedRows?.length === transactions?.length}
                  />
                  Select all
                </th>
              </tr>
            </thead>
            <tbody>
              {editableTransactions.map((item, index) => {
                return (
                  <tr key={item.id} className="header-row">
                    <td className="edit-checkbox-row">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(item.id)}
                        onChange={(e) => handleCheckboxChange(e, item.id)}
                      />
                      <input
                        type="text"
                        name="date"
                        value={item.date}
                        onChange={(e) => handleDataChange(e, index)}
                        onFocus={(e) => handleFocus(e, index)}
                        onBlur={(e) =>
                          handleBlur(e, index, editableTransactions)
                        }
                      />
                      <input
                        type="text"
                        name="amount"
                        value={item.amount}
                        onChange={(e) => handleDataChange(e, index)}
                        onFocus={(e) => handleFocus(e, index)}
                        onBlur={(e) =>
                          handleBlur(e, index, editableTransactions)
                        }
                      />
                      <input
                        type="text"
                        name="type"
                        value={item.type}
                        onChange={(e) => handleDataChange(e, index)}
                        onFocus={(e) => handleFocus(e, index)}
                        onBlur={(e) =>
                          handleBlur(e, index, editableTransactions)
                        }
                      />
                      <input
                        type="text"
                        name="description"
                        value={item.description}
                        onChange={(e) => handleDataChange(e, index)}
                        onFocus={(e) => handleFocus(e, index)}
                        onBlur={(e) =>
                          handleBlur(e, index, editableTransactions)
                        }
                      />
                      <input
                        type="text"
                        name="category"
                        value={item.category}
                        onChange={(e) => handleDataChange(e, index)}
                        onFocus={(e) => handleFocus(e, index)}
                        onBlur={(e) =>
                          handleBlur(e, index, editableTransactions)
                        }
                      />
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
    </div>
  );
};

export default EditTable;
