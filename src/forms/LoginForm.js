import React, { useState, useRef, useEffect, useContext } from "react";
import db from "../store/Dexie";
import "../styles/Login.css";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import RegistrationForm from "../forms/RegistrationForm";
import { UserContext } from "../contexts/UserContext";
import Modals from "../utils/Modals";
import { useDataContext } from "../providers/DataProvider";

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordShown, setPasswordShown] = useState(false);
  const inputRef = useRef(null);
  const [remember, setRemember] = useState(false);
  const [showReg, setShowReg] = useState(false);
  const { login } = useContext(UserContext);
  const {
    currentBudgetName,
    setCurrentBudgetName,
    currentAccNumber,
    setCurrentAccNumber,
  } = useDataContext();

  useEffect(() => {
    // Set focus when the component mounts
    inputRef?.current?.focus();
  }, []);

  const hashPassword = (password) => {
    // Implement your password hashing logic here
    // Use a secure hashing algorithm (e.g., bcrypt)
    // For this example, we're using a simple hash function (not secure for production)
    return password; // Replace with actual hashing
  };

  const togglePassword = () => {
    setPasswordShown(!passwordShown);
  };

  const goLogin = async (event) => {
    event.preventDefault();

    try {
      // Ensure that username is defined and not empty
      if (!username) {
        return;
      }
      // Fetch user data from Dexie
      const chkUser = await db.users
        .where("username")
        .equalsIgnoreCase(username.toLowerCase()) // Ensure case-insensitive search
        .first();
      if (chkUser && verifyPassword(password, chkUser.hashedPassword)) {
        let obj = {
          id: chkUser.id,
        };
        setCurrentBudgetName(chkUser.last_budget);
        setCurrentAccNumber(chkUser.last_account);
        login(obj);
      } else {
        window.alert("ERROR user or password not on system");
      }
    } catch (error) {
      console.error("ERROR Error fetching user:", error);
    }
  };

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const verifyPassword = (password, hashedPassword) => {
    // Implement your password verification logic here
    // Compare the hashed password with the hash of the entered password
    // You'll need to use a suitable hashing algorithm and verify the password with the salt

    // For the sake of example, we're using a simple comparison
    return password === hashedPassword;
  };

  const handleRegister = () => {
    setShowReg(true);
  };

  const handleSuccess = (val) => {
    //user has registered successfully
    if (val === "success") {
      setShowReg(false);
    }
  };

  const handleRemember = (remember) => {
    setRemember(!remember);
  };

  const handleCloseModal = () => {
    setShowReg(false);
  };

  return (
    <div id="container">
      {!showReg && (
        <div className="hollow-text-container">
          <div
            className="hollow-text"
            style={{ position: "absolute", lineHeight: "5rem", bottom: "15%" }}
          >
            sign in
          </div>
          <form
            style={{
              display: "flex",
              flexDirection: "column",
              position: "absolute",
              alignItems: "center",
              fontSize: "1.25rem",
              zIndex: "9",
              width: "100%",
              height: "100%",
            }}
            onSubmit={goLogin}
          >
            <div style={{ marginTop: "5%", width: "80%" }}>
              <input
                className="login-input"
                style={{
                  marginBottom: "0.5rem",
                  boxShadow:
                    "inset -3px -3px 4px 0px rgba(255, 255, 255, 1),0px 3px 2px 0px rgba(0, 0, 0, 0.2)",
                }}
                ref={inputRef}
                type="text"
                placeholder="username"
                value={username}
                onChange={handleUsernameChange}
              />
              <div className="password-holder">
                <input
                  style={{
                    border: "none",
                    width: "90%",
                    boxShadow: "inset 0px -2px 0px 0px rgba(255, 255, 255, 1)",
                    backgroundColor: "transparent",
                  }}
                  className="login-input"
                  placeholder="password"
                  value={password}
                  onChange={handlePasswordChange}
                  type={passwordShown ? "text" : "password"}
                />
                <button
                  className="show-password-button"
                  type="button"
                  onClick={togglePassword}
                >
                  {passwordShown ? (
                    <AiOutlineEyeInvisible size={22} />
                  ) : (
                    <AiOutlineEye size={22} />
                  )}
                </button>
              </div>
              <button className="forgotten-password">
                forgotten password?
              </button>
              <label htmlFor="remember" className="remember-checkbox">
                <input
                  type="checkbox"
                  id="remember"
                  checked={remember}
                  onChange={(e) => handleRemember(remember)}
                />
                remember me
              </label>
            </div>
            <button
              style={{ position: "absolute", right: "1rem", bottom: "1rem" }}
              type="submit"
              disabled={!username || !password}
              className="button_login"
            >
              Sign in
            </button>
          </form>
        </div>
      )}
      <div
        className="hollow-text-container"
        style={{
          position: "absolute",
          top: "calc( 5% + 15rem + 5%)",
          opacity: showReg ? "0.25" : "1",
        }}
      >
        <div
          className="hollow-text"
          style={{ position: "absolute", lineHeight: "5rem", bottom: "18%" }}
        >
          sign up
        </div>
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "5%",
            color: "white",
          }}
        >
          Not yet registered? Click the button below to sign up.
        </div>
        <button
          style={{
            position: "absolute",
            right: "1rem",
            bottom: "1rem",
            cursor: "pointer",
          }}
          type="button"
          className="button_signup"
          onClick={() => handleRegister()}
        >
          Sign up
        </button>
      </div>
      <div
        className="hollow-text"
        style={{
          position: "absolute",
          bottom: "5%",
          right: "5%",
          fontSize: "2.5rem",
        }}
      >
        the budget app
      </div>
      {showReg && (
        <Modals
          // title={showLogin ? "Login" : "Registration"}
          onClose={() => handleCloseModal()}
          noBckgrnd={true}
          buttonStyle={{}}
          style={{
            backgroundColor: "rgba(250, 235, 215,1)",
            boxShadow: "2px 2px 8px 2px rgba(140,150,155,0.2)",
            border: "solid 2px rgba(140,150,155,1)",
          }}
          // footer={}
        >
          <RegistrationForm success={(val) => handleSuccess(val)} />
        </Modals>
      )}
    </div>
  );
}

export default LoginForm;
