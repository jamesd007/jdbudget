import React, { useState } from "react";
import { FaRegCheckSquare } from "react-icons/fa";
import DropdownMenu from "../utils/DropDownMenu";
import { menuMainItems } from "../data/MenuMainItems";
import { BsThreeDotsVertical } from "react-icons/bs";
import { RiArrowGoBackFill } from "react-icons/ri";
import { RiPlayReverseFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

const System = () => {
  const [openSystemMenu, setOpenSystemMenu] = useState(true);
  const [showDots, setShowDots] = useState(true);
  const navigate = useNavigate();

  const handleDiagnostics = () => {
    console.log("diagnostics");
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
