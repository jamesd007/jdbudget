import React, { useContext, useEffect, useState } from "react";
import "../styles/MainStyles.css";
import ExportData from "./ExportData";
import DropdownMenu from "../utils/DropDownMenu";
import { FaFileImport } from "react-icons/fa";
import { FaFileExport } from "react-icons/fa";
import { FaRegSave } from "react-icons/fa";
import { FaRegEdit } from "react-icons/fa";
import { RiArrowGoBackFill } from "react-icons/ri";
import { RiPlayReverseFill } from "react-icons/ri";
import { BsThreeDotsVertical } from "react-icons/bs";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { menuMainItems } from "../data/MenuMainItems";
import { useDataContext } from "../providers/DataProvider";
import EditData from "./EditData";
import ImportDataNew from "./ImportDataNew";
import CatEdit from "./CatEdit";

const Transactions = () => {
  const [importOption, setImportOption] = useState(false);
  const [editing, setEditing] = useState(false);
  const [exportOption, setExportOption] = useState(false);
  const [openTransactionsMenu, setOpenTransactionsMenu] = useState(true);
  const [showDots, setShowDots] = useState(true);
  const navigate = useNavigate();
  const [catEdit, setCatEdit] = useState(false);
  // const { open, setOpen } = useDataContext();

  const handleImport = () => {
    setImportOption(true);
    setOpenTransactionsMenu(false);
    setEditing(false);
    setExportOption(false);
    setCatEdit(false);
  };

  const handleEdit = () => {
    setEditing(true);
    setOpenTransactionsMenu(false);
    setImportOption(false);
    setExportOption(false);
    setCatEdit(false);
  };

  const handleCategories = () => {
    setEditing(false);
    setOpenTransactionsMenu(false);
    setImportOption(false);
    setExportOption(false);
    setCatEdit(true);
  };

  const handleExport = () => {
    setExportOption(true);
    setOpenTransactionsMenu(false);
    setEditing(false);
    setImportOption(false);
    setCatEdit(false);
  };

  // const handleSave = () => {
  // };

  const handleClose = () => {
    navigate("/");
  };

  const menuItems = [
    {
      leftIcon: <FaFileImport size={24} />,
      text: "Import",
      callback: handleImport,
      permissionLevels: ["any"],
      goToMenu: "",
    },
    {
      leftIcon: <FaRegEdit size={24} />,
      text: "Edit",
      callback: handleEdit,
      permissionLevels: ["any"],
      goToMenu: "",
    },
    {
      leftIcon: <FaFileExport size={24} />,
      text: "Export",
      callback: handleExport,
      permissionLevels: ["any"],
      goToMenu: "",
    },
    {
      leftIcon: <BiSolidCategoryAlt size={24} />,
      text: "Categories",
      callback: handleCategories,
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
    setOpenTransactionsMenu((prevOpen) => !prevOpen);
  };

  return (
    <div>
      <div className="menu-dots">
        <div className="main-menu">
          <span style={showDots ? {} : { display: "none" }}>
            <BsThreeDotsVertical size={28} onClick={() => handleMenuClick()} />
          </span>
          {openTransactionsMenu && (
            <DropdownMenu
              type="items"
              secType="links"
              roles={"any"}
              menuItems={menuItems}
              secMenuItem={menuMainItems}
              onClose={() => setOpenTransactionsMenu(false)}
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
        <span style={{ fontSize: "2rem", marginLeft: "1rem" }}>
          Transactions
        </span>
        {importOption && (
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
        )}
        {editing && (
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
        )}
        {exportOption && (
          <>
            <span
              style={{
                fontSize: "1.5rem",
                display: exportOption ? {} : "none",
              }}
            >
              {" "}
              - Export
            </span>
            <ExportData />
          </>
        )}
        {catEdit && (
          <>
            <span
              style={{
                fontSize: "1.5rem",
                display: catEdit ? {} : "none",
              }}
            >
              {" "}
              - Categories
            </span>
            <CatEdit />
          </>
        )}
      </div>
    </div>
  );
};

export default Transactions;
