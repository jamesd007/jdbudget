import React, { useState, useEffect } from "react";
import { getAllCategories, getAllTransactions } from "../store/Dexie";
import "../styles/CatEdit.css";
import db from "../store/Dexie";

const CatEdit = () => {
  const [catData, setCatData] = useState([]);
  const [missingCatDesc, setMissingCatDesc] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        getAllCategories();
        const cats = await getAllCategories();
        setCatData(cats);
      } catch (error) {
        console.error("Error retrieving categories:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const transactions = await getAllTransactions(needs an account_id here currentAccNo from dataprovider);
        // console.log("transactions :", transactions);
        // let tedtest = transactions.filter(
        //   (transaction) =>
        //     transaction.category_description === null ||
        //     transaction.category_description === "" ||
        //     transaction.category_description === undefined ||
        //     !transaction.category_description
        // );
        // console.log("tedtest tedtest=", tedtest);
        const cats = await db.transactions
          .filter(
            (transaction) =>
              transaction.category_description === null ||
              transaction.category_description === "" ||
              transaction.category_description === undefined
          )
          .toArray();
        setMissingCatDesc(cats);
        console.log("tedtest Fetched categories:", cats);
      } catch (error) {
        console.error("Error retrieving categories:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="category-work-container">
      {missingCatDesc && missingCatDesc?.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Code</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {missingCatDesc.map((item) => (
              <tr key={item.id}>
                <td>{item.category_description}</td>
                <td>{item.category_code}</td>
                <td>{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p> No transaction with missing category descriptions</p>
      )}
    </div>
  );
};

export default CatEdit;
