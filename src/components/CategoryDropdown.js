import React, { useEffect, useState } from "react";
import db from "../store/Dexie";
import ReportsTable from "./ReportsTable";
import possHeaders from "../data/possHeaders";

const CategoryDropdown = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [transactionsFound, setTransactionsFound] = useState([]);
  const [colWidths, setColWidths] = useState([]);
  const [headersInfo, setHeadersInfo] = useState([]);

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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const uniqueCategories = await db.transactions
          .orderBy("category_description")
          .uniqueKeys();
        console.log("tedtesta uniquecategories=", uniqueCategories);
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        if (selectedCategory) {
          const transactions = await db.transactions
            .where("category_description")
            .equals(selectedCategory)
            .toArray();
          setTransactionsFound(transactions);
          const keys = new Set();
          transactions.forEach((item) => {
            Object.keys(item).forEach((key) => keys.add(key));
          });
          // Convert the set to an array and sort the keys as needed
          setHeadersInfo(Array.from(keys));
          setColWidths(createColWidthsArray(Array.from(keys)));
        }
      } catch (error) {
        console.error("Failed to get transactions:", error);
      }
    };

    fetchTransactions();
  }, [selectedCategory]);

  return (
    <div>
      <select value={selectedCategory || ""} onChange={(e) => handleChange(e)}>
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
        <ReportsTable
          allTrans={transactionsFound}
          colWidthArr={colWidths}
          headers={headersInfo}
        />
      ) : (
        <p>no data found</p>
      )}
    </div>
  );
};

export default CategoryDropdown;
