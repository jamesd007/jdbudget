// Logout.js
import React, { useEffect, useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";

function Logout() {
  const { logout } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    logout(); // Clear user data
    navigate("/"); // Redirect to login page
  }, [logout, navigate]);

  return null;
}

export default Logout;
