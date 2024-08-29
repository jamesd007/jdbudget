import React, { useState, useEffect, useContext, useRef } from "react";
import { FaRegCheckSquare } from "react-icons/fa";
import DropdownMenu from "../utils/DropDownMenu";
import { menuMainItems } from "../data/MenuMainItems";
import { BsThreeDotsVertical } from "react-icons/bs";
import { RiArrowGoBackFill } from "react-icons/ri";
import { RiPlayReverseFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import db from "../store/Dexie";
import Modals from "../utils/Modals";

const System = () => {
  const [openSystemMenu, setOpenSystemMenu] = useState(true);
  const [showDots, setShowDots] = useState(true);
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [openModal, setOpenModal] = useState(false);
  const [tempUser, setTempUser] = useState("");
  const usernameInputRef = useRef(null);

  useEffect(() => {
    if (openModal && usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
  }, [openModal]);

  const handleDiagnostics = () => {
    console.log("diagnostics");
    setOpenSystemMenu(false);
  };

  const handleUsername = () => {
    setOpenModal(true);
    setOpenSystemMenu(false);
  };

  const handleClose = () => {
    navigate("/");
  };

  const menuItems = [
    {
      leftIcon: <FaRegCheckSquare size={24} />,
      text: "Diagnostics",
      callback: handleDiagnostics,
      permissionLevels: ["any"],
      goToMenu: "",
    },
    {
      leftIcon: <FaRegCheckSquare size={24} />,
      text: "Username",
      callback: handleUsername,
      permissionLevels: ["any"],
      goToMenu: "",
    },
    {
      leftIcon: <RiPlayReverseFill size={24} />,
      text: "Main menu",
      callback: handleClose,
      permissionLevels: ["any"],
      goToMenu: "secondary",
    },
    {
      leftIcon: <RiArrowGoBackFill size={24} />,
      text: "Close",
      callback: handleClose,
      permissionLevels: ["any"],
      goToMenu: "",
    },
  ];

  const handleMenuClick = () => {
    setOpenSystemMenu((prevOpen) => !prevOpen);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let updatedData = { username: tempUser };
    try {
      await db.users.update(user.id, updatedData);
      setOpenModal(false);
    } catch (error) {
      alert("Error updating username");
    }
  };

  const handleInputChange = (e) => {
    setTempUser(e.target.value);
  };

  return (
    <div>
      <div className="menu-dots">
        <div className="main-menu">
          <span style={showDots ? {} : { display: "none" }}>
            <BsThreeDotsVertical size={28} onClick={() => handleMenuClick()} />
          </span>
          {openSystemMenu && (
            <DropdownMenu
              type="items"
              secType="links"
              roles={"any"}
              menuItems={menuItems}
              secMenuItem={menuMainItems}
              onClose={() => setOpenSystemMenu(false)}
              mainscreen={true}
            />
          )}
        </div>
      </div>
      <div
        className="work-container"
        style={{
          backgroundColor: "lightsteelblue",
        }}
      >
        <span style={{ fontSize: "2rem", marginLeft: "1rem" }}>System</span>
        {openModal && ( //tedtest this should not be used in this form- possibly edit username or user details, needs more research
          <Modals
            title="Username"
            noBckgrnd={true}
            onClickOutside={false}
            onClose={() => handleCloseModal()}
            footer={
              <div>
                <button
                  style={{
                    marginTop: "1rem",
                    marginBottom: "0.5rem",
                  }}
                  type="submit"
                  // disabled={!newBudgetName || !budgetYear || !startFinYr}
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
                  enter new username:
                  <input
                    ref={usernameInputRef}
                    style={{ width: "15rem" }}
                    type="text"
                    placeholder="description"
                    value={tempUser}
                    onChange={(e) => handleInputChange(e)}
                  ></input>
                </label>
                {/* <button onClick={() => setOpenModal(false)}>ok</button> */}
              </div>
            </form>
          </Modals>
        )}
        {/* {importOption && (
          <>
            <span
              style={{
                fontSize: "1.5rem",
                display: importOption ? {} : "none",
              }}
            >
              {" "}
              - Import
            </span>
            <ImportDataNew />
          </>
        )} */}
        {/* {editing && (
          <>
            <span
              style={{
                fontSize: "1.5rem",
                display: editing ? {} : "none",
              }}
            >
              {" "}
              - Edit
            </span>
            <EditData />
          </>
        )} */}
      </div>
    </div>
  );
};

export default System;
