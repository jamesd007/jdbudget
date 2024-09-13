// import React, { useState } from "react";
// import { AiOutlineClose } from "react-icons/ai";
// import { FaBars } from "react-icons/fa";
// import { IoLogOutOutline } from "react-icons/io5";
// import { Link } from "react-router-dom";
// import "../styles/Navbar.css";
// import { menuItemsDataMain } from "../MenuItemsDataMain";

// const NavBar = () => {
//   const menuItems = menuItemsDataMain;
//   const minIconSize = 40;
//   const [sideBar, setSideBar] = useState(false);

//   const showSideBar = () => setSideBar(!sideBar);

//   return (
//     <div className="navbar">
//       <Link to="#" className="menu-bars-hamburger">
//         <FaBars
//           size={`${Math.round((window.innerWidth - 600) * 0.02) + minIconSize}`}
//           onClick={showSideBar}
//         />
//       </Link>

//       <nav className={sideBar ? "nav-menu active" : "nav-menu"}>
//         <ul className="nav-menu-items" onClick={showSideBar}>
//           <li>
//             <Link to="#" className="menu-bars">
//               <AiOutlineClose onClick={showSideBar} />
//             </Link>
//           </li>
//           {menuItems.map((item, index) => {
//             return (
//               <li key={index} className={item.cName}>
//                 <Link to={item.url}>
//                   {item.icon}
//                   <span className="nav-menu-text">{item.title}</span>
//                 </Link>
//               </li>
//             );
//           })}
//           <li className="nav-text" onClick={handleLogout}>
//             <Link to="#">
//               <IoLogOutOutline size={28} />
//               <span className="nav-menu-text">Logout</span>
//             </Link>
//           </li>
//         </ul>
//       </nav>
//     </div>
//   );
// };

// export default NavBar;
