import { AiFillHome } from "react-icons/ai";
import { FaFileImport } from "react-icons/fa";
import { FaFileExport } from "react-icons/fa";
import { FaCalculator } from "react-icons/fa";
import { BsGraphUpArrow } from "react-icons/bs";
import { FaPrint } from "react-icons/fa";
import { FaCog } from "react-icons/fa";
import { GrTransaction } from "react-icons/gr";
import { FiLogOut } from "react-icons/fi";

export const menuMainItems = [
  {
    title: "Home",
    url: "/",
    icon: <AiFillHome size={24} />,
    cName: "main-menu-text",
  },
  {
    title: "Budget",
    url: "/budget",
    icon: <FaCalculator size={24} />,
    cName: "main-menu-text",
  },
  {
    title: "Transactions",
    url: "/transactions",
    icon: <GrTransaction size={24} />,
    cName: "main-menu-text",
  },
  // {
  //   title: "Import",
  //   url: "/importdata",
  //   icon: <FaFileImport size={24} />,
  //   cName: "main-menu-text",
  // },
  // {
  //   title: "Export",
  //   url: "/exportdata",
  //   icon: <FaFileExport size={24} />,
  //   cName: "main-menu-text",
  // },
  {
    title: "Analysis",
    url: "/analysis",
    icon: <BsGraphUpArrow size={24} />,
    cName: "main-menu-text",
  },
  {
    title: "Reports",
    url: "/reports",
    icon: <FaPrint size={24} />,
    cName: "main-menu-text",
  },
  {
    title: "System",
    url: "/system",
    icon: <FaCog size={24} />,
    cName: "main-menu-text",
  },
  {
    title: "Log out",
    url: "/",
    icon: <FiLogOut size={24} />,
    cName: "main-menu-text",
  },
];
