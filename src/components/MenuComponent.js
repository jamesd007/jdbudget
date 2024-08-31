import React, { useEffect, useState, useContext } from "react";
import "../styles/MenuStyles.css";

// import { BiCollection } from "react-icons/bi";
import { BsThreeDotsVertical } from "react-icons/bs";
// import { FaDev, FaSearch, FaShareAlt } from "react-icons/fa";
// import { FiArrowLeftCircle, FiLogIn, FiLogOut } from "react-icons/fi";
// import { GoCommentDiscussion } from "react-icons/go";
// import { HiOutlineMail } from "react-icons/hi";
// import { IoVolumeMute, IoVolumeHigh } from "react-icons/io5";
// import { BsFileEarmarkMedical } from "react-icons/bs";
// import { HiOutlineUserGroup } from "react-icons/hi";
// import { IoIosLogIn, IoIosLogOut } from "react-icons/io";
// import { IoSettingsSharp } from "react-icons/io5";
// import { MdOutlineEmail, MdOutlinePrivacyTip } from "react-icons/md";
// import { RiInboxUnarchiveLine, RiInboxArchiveLine } from "react-icons/ri";
// import { TiTick } from "react-icons/ti";
// import { VscFolderOpened } from "react-icons/vsc";
// import { AiFillHome } from "react-icons/ai";
// import { FaFileImport } from "react-icons/fa";
// import { FaFileExport } from "react-icons/fa";
// import { FaCalculator } from "react-icons/fa";
// import { BsGraphUpArrow } from "react-icons/bs";
// import { FaPrint } from "react-icons/fa";
// import { FaCog } from "react-icons/fa";
// import { GrTransaction } from "react-icons/gr";
// import { BiSolidCategoryAlt } from "react-icons/bi";
import "../styles/Modals.css";
import "../utils/ClickOutsideDetector";
import DropdownMenu from "../utils/DropDownMenu";
// import { menuItemsDataMain } from "../MenuItemsDataMain";
import { menuMainItems } from "../data/MenuMainItems";
import { useLocation } from "react-router-dom";
// import { useDataContext } from "../providers/DataProvider";
import { UserContext } from "../contexts/UserContext";

const MenuComponent = (props) => {
  const [showDots, setShowDots] = useState(true);
  const [openMainMenu, setOpenMainMenu] = useState(false);
  const [changeHgt, setChangeHgt] = useState(false);
  const [scrnHgt, setScrnHgt] = useState(0);
  // const [startComponent, setStartComponent] = useState(true);
  const [outClick, setOutClick] = useState(false);
  const location = useLocation();
  const { logout } = useContext(UserContext);

  useEffect(() => {
    function handleResize() {
      setScrnHgt(window.innerHeight * 0.9);
      setChangeHgt(true);
    }
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // const handleClickOutside = () => {
  //   setOutClick(true);
  //   // setStartComponent(false)
  //   props.setModal(undefined);
  // };

  // const handleLogout = () => {
  //   logout();
  // };
  // const goLogout = () => {
  //   setOpenMainMenu(false);
  //   setStartComponent(false);
  //   props.setModal(
  //     <Modals
  //       // noBckgrnd={true}
  //       title="Sign Out"
  //       onClose={() => props.setModal(undefined)}
  //       onClickOutside={() => handleClickOutside()}
  //       footer={
  //         <div>
  //           <button
  //             className="UI-button-service"
  //             type="button"
  //             onClick={() => {
  //               props.setModal(undefined);
  //             }}
  //           >
  //             Sign Out
  //           </button>
  //         </div>
  //       }
  //     >
  //       <label className="modal-label-new">
  //         Are you sure you want to sign out?
  //       </label>
  //     </Modals>
  //   );
  // };

  // const menuItems = [
  //   {
  //     title: "Home",
  //     url: "/",
  //     icon: <AiFillHome size={24} />,
  //     cName: "main-menu-text",
  //   },
  //   {
  //     title: "Budget",
  //     url: "/budget",
  //     icon: <FaCalculator size={24} />,
  //     cName: "main-menu-text",
  //   },
  //   {
  //     title: "Transactions",
  //     url: "/transactions",
  //     icon: <GrTransaction size={24} />,
  //     cName: "main-menu-text",
  //   },
  //   {
  //     title: "Categories",
  //     url: "/categories",
  //     icon: <BiSolidCategoryAlt size={24} />,
  //     cName: "main-menu-text",
  //   },
  //   {
  //     title: "Analysis",
  //     url: "/analysis",
  //     icon: <BsGraphUpArrow size={24} />,
  //     cName: "main-menu-text",
  //   },
  //   {
  //     title: "Reports",
  //     url: "/reports",
  //     icon: <FaPrint size={24} />,
  //     cName: "main-menu-text",
  //   },
  //   {
  //     title: "System",
  //     url: "/system",
  //     icon: <FaCog size={24} />,
  //     cName: "main-menu-text",
  //   },
  //   {
  //     title: "Log out",
  //     url: "/logout",
  //     icon: <FiLogOut size={24} />,
  //     cName: "main-menu-text",
  //   },
  //   // {
  //   //   leftIcon: <FaSearch />,
  //   //   text: "Search Personas",
  //   //   callback: tempMenuTest,
  //   //   permissionLevels: ["admin", "owner", "designer", "tx", "whisper", "rx"],
  //   //   goToMenu: "",
  //   // },
  //   // {
  //   //   leftIcon: <FaSearch />,
  //   //   text: "Search Topics",
  //   //   callback: tempMenuTest,
  //   //   permissionLevels: ["admin", "owner", "designer", "tx", "whisper", "rx"],
  //   //   goToMenu: "",
  //   // },
  //   // {
  //   //   leftIcon: <GoCommentDiscussion strokeWidth={2} />,
  //   //   text: "Create Topic",
  //   //   callback: tempMenuTest,
  //   //   permissionLevels: ["admin", "owner", "designer", "tx", "whisper", "rx"],
  //   //   goToMenu: "",
  //   // },
  //   // {
  //   //   leftIcon: <FaShareAlt />,
  //   //   text: "Share",
  //   //   callback: tempMenuTest,
  //   //   permissionLevels: ["admin", "owner", "designer", "tx", "whisper", "rx"],
  //   //   goToMenu: "",
  //   // },
  //   // {
  //   //   leftIcon: (
  //   //     <TiTick
  //   //       // strokeWidth={0}
  //   //       size={30}
  //   //     />
  //   //   ),
  //   //   text: "Mark all as read",
  //   //   callback: tempMenuTest,
  //   //   permissionLevels: ["admin", "owner", "designer", "tx", "whisper", "rx"],
  //   //   goToMenu: "",
  //   // },
  //   // // {
  //   // // leftIcon: globalState?.displaying_archive ? (
  //   // // <RiInboxUnarchiveLine />
  //   // // ) : (
  //   // // <RiInboxArchiveLine />
  //   // // ),
  //   // // text: globalState?.displaying_archive
  //   // // ? "Show active topics"
  //   // // : "Show archived topics",
  //   // // callback: toggleArchive,
  //   // // permissionLevels: ["admin", "owner", "designer", "tx", "whisper", "rx"],
  //   // // goToMenu: ""
  //   // // },
  //   // {
  //   //   leftIcon: <BiCollection strokeWidth={1} size={20} />,
  //   //   text: "Show folders",
  //   //   callback: tempMenuTest,
  //   //   permissionLevels: ["admin", "owner", "designer", "tx", "whisper", "rx"],
  //   //   goToMenu: "",
  //   // },
  //   // {
  //   //   leftIcon: <IoVolumeMute size={22} />,
  //   //   text: "Mute",
  //   //   callback: tempMenuTest,
  //   //   permissionLevels: ["admin", "owner", "designer", "tx", "whisper", "rx"],
  //   //   goToMenu: "",
  //   // },
  //   // {
  //   //   leftIcon: <BsFileEarmarkMedical strokeWidth={1} size={20} />,
  //   //   text: "Hide Archived",
  //   //   callback: tempMenuTest,
  //   //   permissionLevels: ["admin", "owner", "designer", "tx", "whisper", "rx"],
  //   //   goToMenu: "",
  //   // },
  //   // {
  //   //   leftIcon: <IoSettingsSharp />,
  //   //   text: "Settings",
  //   //   callback: tempMenuTest,
  //   //   permissionLevels: ["admin", "owner", "designer", "tx", "whisper", "rx"],
  //   //   goToMenu: "",
  //   // },
  //   // {
  //   //     leftIcon: <FaDev />,
  //   //     text: "Normal Mode",
  //   //     callback: tempMenuTest,
  //   //     permissionLevels: ["admin", "owner", "designer", "tx", "whisper", "rx"],
  //   //     goToMenu: "",
  //   //   },
  //   // {
  //   //   leftIcon: <FiLogIn strokeWidth={3} size={18} />,
  //   //   text: "Sign in",
  //   //   callback: tempMenuTest,
  //   //   permissionLevels: ["admin", "owner", "designer", "tx", "whisper", "rx"],
  //   //   goToMenu: "",
  //   // },
  // ];

  // const handleClose = () => {
  //   props.setModal(undefined);
  // };

  useEffect(() => {
    // List of paths where the icon should not be displayed
    const hiddenIconPaths = ["/transactions"];
    setShowDots(!hiddenIconPaths.includes(location.pathname));
  }, [location]);

  let content = (
    <div className="menu-dots">
      <div className="main-menu">
        <span style={showDots ? {} : { display: "none" }}>
          <BsThreeDotsVertical
            size={28}
            onClick={() => setOpenMainMenu(!openMainMenu)}
          />
        </span>
        {openMainMenu && (
          <DropdownMenu
            type="links"
            // roles={("admin", "user", "etc")}
            menuItems={menuMainItems}
            onClose={() => setOpenMainMenu(false)}
            mainscreen={true}
          ></DropdownMenu>
        )}
      </div>
    </div>
  );
  return content;
};

export default React.memo(MenuComponent, (prevProps, nextProps) => {
  return JSON.stringify(prevProps) === JSON.stringify(nextProps);
});
