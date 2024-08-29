import React, { useState, useContext } from "react";
import "../styles/Login.css";
import LoginForm from "../forms/LoginForm";
import { UserContext } from "../contexts/UserContext";

function Login() {
  const { login } = useContext(UserContext);
  // const [showModal, setShowModal] = useState(true);
  const [showLogin, setShowLogin] = useState(true);
  // const [proceedLogin, setProceedLogin] = useState(false);
  // const [enableLogin, setEnableLogin] = useState(false);

  // const handleResponse = (val) => {
  //   if (val === "invalid") {
  //     setProceedLogin(false);
  //   }
  // };

  // const handleLoggedIn = (val) => {
  //   if (val) {
  //     setShowLogin(false);
  //     // setShowModal(false);
  //   }
  //   login(val.user_id);
  // };

  return (
    <div>
      {showLogin && (
        <LoginForm
        // proceedLogin={proceedLogin}
        // response={(val) => handleResponse(val)}
        // loggedIn={(val) => handleLoggedIn(val)}
        // enableLogin={(val) => setEnableLogin(val)}
        />
      )}
    </div>
  );
}

export default Login;
