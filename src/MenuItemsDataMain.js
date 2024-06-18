import { AiFillHome } from "react-icons/ai";
import { FaFileImport } from "react-icons/fa";
import { FaFileExport } from "react-icons/fa";
import { FaCalculator } from "react-icons/fa";
import { BsGraphUpArrow } from "react-icons/bs";
import { FaPrint } from "react-icons/fa";
import { FaCog } from "react-icons/fa";

export const menuItemsDataMain = [
  {
    title: "Home",
    url: "/",
    icon: <AiFillHome size={24} />,
    cName: "nav-text",
  },
  {
    title: "Budget",
    url: "/budget",
    icon: <FaCalculator size={24} />,
    cName: "nav-text",
  },
  {
    title: "Import",
    url: "/importdata",
    icon: <FaFileImport size={24} />,
    cName: "nav-text",
  },
  {
    title: "Export",
    url: "/exportdata",
    icon: <FaFileExport size={24} />,
    cName: "nav-text",
  },
  {
    title: "Analysis",
    url: "/analysis",
    icon: <BsGraphUpArrow size={24} />,
    cName: "nav-text",
  },
  {
    title: "Reports",
    url: "/reports",
    icon: <FaPrint size={24} />,
    cName: "nav-text",
  },
  {
    title: "System",
    url: "/system",
    icon: <FaCog size={24} />,
    cName: "nav-text",
  },
];
