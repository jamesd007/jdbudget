import Dexie from "dexie";

const db = new Dexie("BudgetAppDB");
db.version(4).stores({
  users:
    "++id,username,hashedPassword,email,address, telephone,last_budget,last_account",
  budgetdetails: "++id,user_id,name,type,lock,year,startmonth,openingbalance",
  budgettransactions:
    "++id,user_id,name,date,transactiontype,amount,category,description,repeat_options,growth_options,extras",
  //i need to decide - is transactiontype income and expenses or dr and cr?
  transactiondetails: "++id,user_id,account_id,openingbalance",
  transactions:
    "++id,user_id,account_id,date,day,type,description,category_code,category_description,transactiontype,amount,balance,bank_code,group,subgroup,subsubgroup,timestamp,extras",
  headers: "++id,user_id,account_id,headers",
  category_descriptions:
    "++id,user_id,description,category_code,category_description",
  //category_code is to be used with importing data from banks, it will, hopefully, tie up with bank codes
  //the description refers to a bank decription- think about this
});

db.open().catch((err) => {
  console.error("Failed to open database:", err);
});

async function getDatabaseSize() {
  let totalSize = 0;

  // Loop through each table
  for (const table of db.tables) {
    // Retrieve all records from the table
    const records = await table.toArray();
    // Calculate the size of each record and add it to the total size
    records.forEach((record) => {
      totalSize += new Blob([JSON.stringify(record)]).size;
    });
  }

  return totalSize;
}

async function getAllBudgets() {
  // return await db.budget.toArray();
  try {
    const budgets = await db.budgettransactions.toArray();
    return budgets;
  } catch (error) {
    console.error("Error getting budgets:", error);
    if (error.name === "NotFoundError") {
      console.log("No budgets found.");
      throw new Error("No budgets found.");
    }
  }
}

async function addBudget(
  user_id,
  name,
  type,
  category,
  description,
  date,
  transactiontype,
  amount,
  repeat_options,
  growth_options,
  extras
) {
  return await db.budgettransactions.add({
    user_id: user_id || "default_user_id", // Replace 'default_user_id' with an appropriate default value
    name: name || "",
    type: type || "",
    category: category || "",
    description: description || "",
    date: date || new Date(), // Set the default date to the current date
    transactiontype: transactiontype || "",
    amount: amount || 0, // Assuming amount should be a number, default to 0
    repeat_options: repeat_options || {}, // Default to an empty object if not provided
    growth_options: growth_options || {}, // Default to an empty object if not provided
    extras: extras || "", // Default to an empty string if not provided
  });
}

async function addBudgets(budgets) {
  return await db.budgettransactions.bulkPut(budgets);
}

// async function getBudgetsByType(type) {
//   return await db.budgets.where("type").equals(type).toArray();
// }

async function deleteBudget(id) {
  try {
    await db.budgettransactions.delete(id);
  } catch (error) {
    console.error("Error deleting budget:", error);
  }
}

async function getAllTransactions(account_id) {
  console.log(
    "account_id:",
    account_id,
    "  typeof account_id=",
    typeof account_id
  );
  try {
    const transactions = await db.transactions
      .where("account_id")
      .equals(account_id)
      .toArray();
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
    await db.budgettransactions.update(id, updatedData);
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

async function getAllCategories() {
  return await db.category_descriptions.toArray();
}

async function addCategory(categoryData) {
  return await db.category_descriptions.add(categoryData);
}

async function updateCategories(id, updatedData) {
  try {
    await db.category_descriptions.update(id, updatedData);
  } catch (error) {
    console.error("Error updating categories:", error);
  }
}

export {
  getAllBudgets,
  addBudget,
  addBudgets,
  // getBudgetsByType,
  deleteBudget,
  updateBudget,
  getAllTransactions,
  addTransaction,
  deleteTransaction,
  updateTransaction,
  getAllCategories,
  addCategory,
  updateCategories,
  db,
  getDatabaseSize,
};

export default db;
