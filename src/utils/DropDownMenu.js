import React, { useState, useEffect, useRef } from "react";
import { CSSTransition } from "react-transition-group";
import { FaArrowLeft } from "react-icons/fa";
import "../styles/DropDownMenu.css";
import ClickOutsideDetector from "../utils/ClickOutsideDetector";
import { Link } from "react-router-dom";

function DropdownMenu(props) {
  const menuItems = props.menuItems;
  const secMenuItems = props.secMenuItems;
  const [activeMenu, setActiveMenu] = useState("main");
  const [menuHeight, setMenuHeight] = useState(null);
  const dropdownRef = useRef(null);
  const mainMenuRef = useRef(null);
  const secondaryMenuRef = useRef(null);
  const [nopermission, setnopermission] = useState(false);
  const [scrnHgt, setScrnHgt] = useState(window.innerHeight);

  useEffect(() => {
    function handleResize() {
      setScrnHgt(window.innerHeight);
    }
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (dropdownRef.current) {
      setMenuHeight(dropdownRef.current.firstChild.offsetHeight);
    }
  }, []);

  const calcHeight = (el) => {
    if (el) {
      const height = el.offsetHeight;
      dropdownRef.current.style.height = `${height}px`;
    }
  };

  const backItem = [
    {
      leftIcon: <FaArrowLeft />,
      text: "go back",
      permissionLevels: ["admin", "owner", "designer", "tx", "whisper", "rx"],
      goToMenu: "main",
    },
  ];

  const newSecMenuItems = backItem.concat(secMenuItems);

  const chkRolesPermission = (item) => {
    if (item.permissionLevels === "any") return true;
    let i;
    for (i = 0; i < item.permissionLevels?.length; i++) {
      if (props.roles !== undefined) {
        if (props.roles.includes(item.permissionLevels[i])) {
          return true;
        }
      }
    }
    return false;
  };

  useEffect(() => {
    setTimeout(() => setnopermission(false), 1500);
    return () => {};
  }, [nopermission]);

  const dropdownItem = (item, i) => {
    return (
      <div
        key={i}
        className={
          chkRolesPermission(item) ? "menu-item" : "menu-item-disallow"
        }
        onClick={() => {
          chkRolesPermission(item)
            ? item.goToMenu === "" || item.goToMenu === undefined
              ? item.callback()
              : item.goToMenu && setActiveMenu(item.goToMenu)
            : setnopermission(true);
        }}
      >
        <span className="icon-button">{item?.leftIcon}</span>
        <span className="menu-text">{item?.text}</span>
        <span className="icon-right">{item?.rightIcon}</span>
      </div>
    );
  };

  return (
    <div>
      <ClickOutsideDetector
        caller="Modals"
        listen
        onClickOutside={() => {
          props.onClose();
        }}
        onClick={() => {}}
      >
        <div
          className="dropdown"
          style={{
            maxHeight: `${scrnHgt - 100}px`,
            height: menuHeight ? `${menuHeight}px` : "auto", // Apply the calculated height
            overflowY: "scroll",
          }}
          ref={dropdownRef}
        >
          <CSSTransition
            in={activeMenu === "main"}
            timeout={300}
            classNames="menu-primary"
            unmountOnExit
            // onEnter={calcHeight}
            onEnter={() => calcHeight(mainMenuRef.current)}
            nodeRef={mainMenuRef}
          >
            <div className="menu" ref={mainMenuRef}>
              <ul>
                {props.type === "items"
                  ? menuItems.map((item, i) => dropdownItem(item, i))
                  : menuItems.map((item, index) => {
                      return (
                        <li
                          key={index}
                          className={item.cName}
                          onClick={props.onClose}
                        >
                          <Link to={item.url}>
                            {item.icon}
                            <span className="main-menu-text">{item.title}</span>
                          </Link>
                        </li>
                      );
                    })}
              </ul>
            </div>
          </CSSTransition>

          {props.secMenuItem !== undefined && (
            <CSSTransition
              in={activeMenu === "secondary"}
              timeout={300}
              classNames="menu-secondary"
              unmountOnExit
              // onEnter={calcHeight}
              onEnter={() => calcHeight(secondaryMenuRef.current)}
              nodeRef={secondaryMenuRef}
            >
              <div className="menu" ref={secondaryMenuRef}>
                {props.secType === "items"
                  ? props.secMenuItem.map((item, i) => dropdownItem(item, i))
                  : props.secMenuItem.map((item, index) => {
                      return (
                        <li
                          key={index}
                          className={item.cName}
                          onClick={props.onClose}
                        >
                          <Link to={item.url}>
                            {item.icon}
                            <span className="main-menu-text">{item.title}</span>
                          </Link>
                        </li>
                      );
                    })}
              </div>
              {/* ? menuItems.map((item, i) => dropdownItem(item, i))
                   : menuItems.map((item, index) => {
                      return (
                        <li
                          key={index}
                          className={item.cName}
                          onClick={props.onClose}
                        >
                          <Link to={item.url}>
                            {item.icon}
                            <span className="main-menu-text">{item.title}</span>
                          </Link>
                        </li>
                      );
                    })}
              </div> */}
            </CSSTransition>
          )}

          {nopermission && (
            <div className="permission-disallowed">Permission not set</div>
          )}
        </div>
      </ClickOutsideDetector>
    </div>
  );
}

export default DropdownMenu;
