import React, { useEffect, useState } from "react";
import db from "../store/Dexie";
import ReportsTable from "./ReportsTable";

const CategoryDropdown = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [transactionsFound, setTransactionsFound] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const uniqueCategories = await db.transactions
          .orderBy("category_code")
          .uniqueKeys();
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (event) => {
    setSelectedCategory(Number(event.target.value));
  };

  //   const getTransactionsByCategory = async () => {
  //     try {
  //       const transactions = await db.transactions
  //         .where("category")
  //         .equalsIgnoreCase(selectedCategory)
  //         .toArray();
  //       return transactions;
  //     } catch (error) {
  //       console.error("Failed to get transactions: " + error);
  //     }
  //   };

  // useEffect(() => {
  //   const fetchTransactions = async () => {
  //     try {
  //       const filteredTransactions = await db.transactions
  //         .filter((transaction) => {
  //           console.log("tedtest transaction=", transaction);
  //           console.log(
  //             "tedtest transaction.category_code.toString()=",
  //             transaction.category_code.toString()
  //           );
  //           console.log(
  //             "tedtest selectedCategory.toString()=",
  //             selectedCategory.toString()
  //           );

  //           return (
  //             transaction.category_code.toString() ===
  //               selectedCategory.toString() ||
  //             transaction.category_description.toString() ===
  //               selectedCategory.toString()
  //           );
  //         })
  //         .toArray();
  //       console.log(
  //         "tedtest Filtered transactions fetched:",
  //         filteredTransactions
  //       );
  //       // setTransactionsFound(filteredTransactions);

  //       // const allTransactions = await db.transactions.toArray();
  //       // console.log("All transactions fetched:", allTransactions);
  //       // setTransactionsFound(allTransactions);

  //       const transactions = await db.transactions
  //         .where("category_code")
  //         .equals(selectedCategory)
  //         .toArray();
  //       setTransactionsFound(transactions);
  //     } catch (error) {
  //       console.error("Failed to get transactions:", error);
  //     }
  //   };

  //   if (selectedCategory) {
  //     console.log("tedtest selectedCategory=", selectedCategory);
  //     fetchTransactions();
  //   }
  // }, [selectedCategory]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        if (selectedCategory) {
          const transactions = await db.transactions
            .where("category_code")
            .equals(parseInt(selectedCategory, 10)) // Ensure category code is a number
            .toArray();
          setTransactionsFound(transactions);
          console.log("Filtered transactions fetched:", transactions);
        }
      } catch (error) {
        console.error("Failed to get transactions:", error);
      }
    };

    fetchTransactions();
  }, [selectedCategory]);

  return (
    <div>
      <select value={selectedCategory || -1} onChange={handleChange}>
        <option value="" disabled>
          Select a category
        </option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      {transactionsFound ? (
        <ReportsTable allTrans={transactionsFound} />
      ) : (
        <p>no data found</p>
      )}
    </div>
  );
};

export default CategoryDropdown;
