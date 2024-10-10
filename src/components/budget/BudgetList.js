import React, { useContext, useState, useEffect, useRef } from "react";
import { FixedSizeList as List } from "react-window";
import { useDataContext } from "../../providers/DataProvider";
import { UserContext } from "../../contexts/UserContext";
import db from "../../store/Dexie";
import { getAllBudgets } from "../../store/Dexie";

const BudgetList = () => {
  const { user } = useContext(UserContext);
  const { currentBudgetName, setCurrentBudgetName } = useDataContext();
  const [userBudgets, setUserBudgets] = useState([]);
  const [allBudgets, setAllBudgets] = useState([]);

  const getLastBudgetName = async () => {
    let rec;
    try {
      rec = await db.users.where("id").equals(user.id).first();
      return rec.last_budget;
      // setCurrentBudgetName(rec.last_budget);
    } catch (error) {
      console.error("Error getting last budget name", error);
    }
  };

  useEffect(() => {
    const getTheBudgets = async () => {
      try {
        let budgetRecs = await getAllBudgets();
        setAllBudgets(budgetRecs);
      } catch (error) {
        console.error("Error retrieving transactions:", error);
      }
    };
    getTheBudgets();
  }, []);

  useEffect(() => {
    //returns all budgets for this user
    const getBudgetsForUser = async () => {
      try {
        const budgets = await db.budgetdetails
          .where({ user_id: user.id })
          .toArray();
        if (budgets && budgets.length > 0) {
          let tmpBudgetName = await getLastBudgetName();
          setCurrentBudgetName(tmpBudgetName);
        }
        return budgets.map((budget) => budget.name);
      } catch (error) {
        console.error("Error fetching budgets", error);
        return null; // or handle the error as needed
      }
    };
    const fetchBudgets = async () => {
      setUserBudgets(await getBudgetsForUser());
    };

    fetchBudgets();
  }, []);

  return (
    <List
      height={500} // Height of the scrollable area
      itemCount={allBudgets.length}
      itemSize={50} // Height of each row
      width={1000} // Width of the list
    >
      {({ index, style }) => (
        <div style={style}>
          {/* Render transaction data here */}
          {allBudgets.map((item, index) => {
            return <div key={index}>{item.description}</div>;
          })}
        </div>
      )}
    </List>
  );
};

export default BudgetList;
