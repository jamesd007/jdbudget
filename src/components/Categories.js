import React, { useState, useEffect, useContext } from "react";
import { getAllCategories } from "../store/Dexie";
import { updateCategories } from "../store/Dexie";
import { UserContext } from "../contexts/UserContext";
import db from "../store/Dexie";

const Categories = () => {
  const [allCategories, setAllCategories] = useState([]);
  const [selectedRows, setselectedRows] = useState([]);
  //   const [editableRecord, setEditableRecord] = useState([]);
  const [originalValue, setOriginalValue] = useState({});
  const { user } = useContext(UserContext);

  useEffect(() => {
    console.log("tedtestG selectedRows=", selectedRows);
    // console.log("tedtestE editableRecord=", editableRecord);
    console.log("tedtestE originalValue=", originalValue);
  }, [selectedRows, originalValue]);

  useEffect(() => {
    //getExistingCategories from dbase
    const getTheCategories = async () => {
      try {
        let catRecs = await getAllCategories();
        setAllCategories(catRecs);
        // setEditableRecord(catRecs);
      } catch (error) {
        console.error("Error retrieving categories:", error);
      }
    };
    getTheCategories();
  }, []);

  const handleCheckboxChange = (event, id) => {
    const isChecked = event.target.checked;
    // setScrollPosition(tableRef.current.scrollTop);
    if (isChecked) {
      setselectedRows((prevState) => [...prevState, id]);
    } else {
      setselectedRows((prevState) => prevState.filter((item) => item !== id));
    }
  };

  const handleDataChange = (e, index) => {
    const { name, value } = e.target;
    const updatedRecord = [...allCategories];
    updatedRecord[index] = {
      ...updatedRecord[index],
      [name]: value,
    };
    setAllCategories(updatedRecord);
    // setRecord(updatedRecord); // Update parent state
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

  return (
    <div>
      Categories
      {allCategories && (
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Category</th>
              <th>Code</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {allCategories.map((item, index) => (
              <tr key={item.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(item.id)}
                    onChange={(e) => handleCheckboxChange(e, item.id)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    name="category_description"
                    value={item.category_description}
                    onChange={(e) => handleDataChange(e, index)}
                    onFocus={(e) => handleFocus(e, index)}
                    onBlur={(e) => handleBlur(e, index, allCategories)}
                  />
                  {/* {item.category_description} */}
                </td>
                <td>{item.category_code}</td>
                <td>{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* {allCategories && allCategories?.length > 0 ? (
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
      )
            } */}
    </div>
  );
};

export default Categories;
