import Dexie from "dexie";

const db = new Dexie("BudgetAppDB");
db.version(2).stores({
  budget: "++id,name,year,budgetData",
  // transactions: "++id,date,type,description,category,amount",
  transactions:
    "++id,account,account_id,date,day,type,description,category_code,category_description,amount1,amount2,balance,bank_code,extra,headers,timestamp",
  headers: "++id,account_id,headers",
});

db.open().catch((err) => {
  console.error("Failed to open database:", err);
});

async function getAllBudgets() {
  return await db.budget.toArray();
}
async function addBudget(budgetData) {
  return await db.budget.add(budgetData);
}
async function deleteBudget(id) {
  try {
    await db.budget.delete(id);
  } catch (error) {
    console.error("Error deleting budget:", error);
  }
}
async function getAllTransactions() {
  try {
    const transactions = await db.transactions.toArray();
    return transactions;
  } catch (error) {
    console.error("Error getting transactions:", error);
    if (error.name === "NotFoundError") {
      console.log("No transactions found.");
      throw new Error("No transactions found.");
    }
  }
  // return await db.transactions.toArray();
}

async function addTransaction(transactionData) {
  return await db.transactions.add(transactionData);
}

async function deleteTransaction(id) {
  try {
    await db.transactions.delete(id);
  } catch (error) {
    console.error("Error deleting transaction:", error);
  }
}

async function updateBudget(id, updatedData) {
  try {
    await db.budget.update(id, updatedData);
  } catch (error) {
    console.error("Error updating budget:", error);
  }
}
async function updateTransaction(id, updatedData) {
  try {
    await db.transactions.update(id, updatedData);
  } catch (error) {
    console.error("Error updating transactions:", error);
  }
}

export {
  getAllBudgets,
  addBudget,
  deleteBudget,
  updateBudget,
  getAllTransactions,
  addTransaction,
  deleteTransaction,
  updateTransaction,
};

export default db;
