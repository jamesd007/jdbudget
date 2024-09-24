import React, { useState, useContext, useRef } from "react";
import Modals from "./Modals";
import db from "../store/Dexie";
import { UserContext } from "../contexts/UserContext";
import { useDataContext } from "../providers/DataProvider";

// src\utils\CreateNewAccount.js
//   Line 31:13:  'setOpenModal' is not defined         no-undef
//   Line 45:26:  'handleCloseModal' is not defined     no-undef
//   Line 83:28:  'handleChangeOpenBal' is not defined  no-undef

const CreateNewAccount = () => {
  const [newAccNumber, setNewAccNumber] = useState("");
  const { user } = useContext(UserContext);
  const [openingBalance, setOpeningBalance] = useState();
  const [userAccounts, setUserAccounts] = useState([]);
  const { setCurrentAccNumber } = useDataContext();
  const accNumberRef = useRef(null);

  const handleChangeOpenBal = (e) => {
    e.preventDefault();
    const value = e.target.value.trim();
    const floatValue = parseFloat(value);
    console.log(`parseFloat(${value}) = ${floatValue}`);
    setOpeningBalance(parseFloat(parseFloat(e.target.value).toFixed(2)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //see if newAccNumber exists on dbase
    let numberExist;
    try {
      numberExist = await db.transactiondetails
        .where({ account_id: newAccNumber })
        .first();
    } catch (error) {
      console.error("error check on newAccNumber", error);
    }
    if (numberExist)
      alert("Account number, " + newAccNumber + ", already exists");
    else {
      try {
        await db.transactiondetails.add({
          user_id: user.id,
          account_id: newAccNumber,
          openingbalance: openingBalance,
        });
        if (userAccounts && userAccounts.length > 0)
          setUserAccounts([...userAccounts, newAccNumber]);
        else setUserAccounts([newAccNumber]);
        setCurrentAccNumber(newAccNumber);
        await db.users.update(user.id, { last_account: newAccNumber });
        // setOpenModal(false);
      } catch (error) {
        console.error("Error adding new account number:", error);
      }
    }
  };

  return (
    <div>
      {/* {openModal && ( */}
      <Modals
        title="Add account"
        noBckgrnd={true}
        onClickOutside={false}
        // onClose={() => handleCloseModal()}
        footer={
          <div>
            <button
              style={{
                marginTop: "1rem",
                marginBottom: "0.5rem",
              }}
              type="submit"
              disabled={!newAccNumber}
              className="button-submit"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              account number:
              <input
                ref={accNumberRef}
                type="text"
                onChange={(e) => setNewAccNumber(e.target.value)}
                placeholder="account number"
              ></input>
            </label>
          </div>
          <div>
            <label>
              opening balance:
              <input
                style={{ width: "10rem" }}
                type="number"
                value={openingBalance}
                onChange={
                  (e) => handleChangeOpenBal(e)
                  // setOpeningBalance(
                  //   parseFloat(parseFloat(e.target.value).toFixed(2))
                  // )
                }
              ></input>
            </label>
          </div>
        </form>
      </Modals>
      {/* )} */}
    </div>
  );
};

export default CreateNewAccount;
