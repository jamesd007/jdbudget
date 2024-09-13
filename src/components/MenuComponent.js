import React, { useEffect, useState } from "react";
import "../styles/MenuStyles.css";
import { BsThreeDotsVertical } from "react-icons/bs";
import "../styles/Modals.css";
import "../utils/ClickOutsideDetector";
import DropdownMenu from "../utils/DropDownMenu";
import { menuMainItems } from "../data/MenuMainItems";
import { useLocation } from "react-router-dom";

const MenuComponent = (props) => {
  const [showDots, setShowDots] = useState(true);
  const [openMainMenu, setOpenMainMenu] = useState(false);
  const location = useLocation();

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
