import React, { useState, useEffect, useRef } from "react";
import db from "../store/Dexie";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

function RegistrationForm(props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [passwordShown, setPasswordShown] = useState(false);
  const emailInputRef = useRef(null);
  useEffect(() => {
    // Set focus when the component mounts
    emailInputRef?.current?.focus();
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

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const updateRegDetails = async (event) => {
    event.preventDefault();
    if (!username || !password || !email) {
      alert("Please fill in all fields");
      return;
    }
    // Hash the user's password (you should use a secure hashing library)
    // const hashedPassword = hashPassword(password);

    // Save the user's details to the Dexie database
    try {
      await db.users.add({
        user_id: "",
        username: username.toLowerCase(),
        email: email,
        hashedPassword: password,
        address: "",
        telephone: "",
        last_budget: "",
      });
      alert("Registration successful");
      props.success("success");
    } catch (error) {
      console.error("ERROR registering user:", error);
      props.success("error" + error);
      alert("Registration failed");
    }
  };

  // useEffect(() => {
  //   const updateRegDetails = async () => {
  //     if (!username || !password || !email) {
  //       alert("Please fill in all fields");
  //       return;
  //     }
  //     // Hash the user's password (you should use a secure hashing library)
  //     // const hashedPassword = hashPassword(password);

  //     // Save the user's details to the Dexie database
  //     try {
  //       await db.users.add({
  //         username: username,
  //         email: email,
  //         hashedPassword: password,
  //         address: "",
  //         telephone: "",
  //       });
  //       alert("Registration successful");
  //       props.success("success");
  //     } catch (error) {
  //       console.error("ERROR registering user:", error);
  //       props.success("error" + error);
  //       alert("Registration failed");
  //     }
  //   };
  //   if (props.updateDatabase) updateRegDetails();
  // }, [props.updateDatabase]);

  // const handleRegistration = async (event) => {
  // event.preventDefault();
  // Validate user input (e.g., check for empty fields)
  // if (!username || !password || !email) {
  // alert('Please fill in all fields');
  // return;
  // }

  // // Hash the user's password (you should use a secure hashing library)
  // const hashedPassword = hashPassword(password);

  // // Save the user's details to the Dexie database
  // try {
  // await db.users.add({ username, hashedPassword });
  // alert('Registration successful');
  // props.success("success")
  // } catch (error) {
  // console.error('ERROR registering user:', error);
  // alert('Registration failed');
  // props.success("error")
  // }
  // };

  return (
    <div>
      <form
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: "1.25rem",
        }}
        onSubmit={(event) => updateRegDetails(event)}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "7rem 15rem",
            marginBottom: "0.5rem",
          }}
        >
          <label style={{ textAlign: "right" }} htmlFor="email">
            email:
          </label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={handleEmailChange}
            ref={emailInputRef}
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "7rem 15rem",
            marginBottom: "0.5rem",
          }}
        >
          <label style={{ textAlign: "right" }} htmlFor="username">
            Username:
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={handleUsernameChange}
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "7rem 15rem 3rem",
          }}
        >
          <label style={{ textAlign: "right" }} htmlFor="regpassword">
            Password:
          </label>
          <input
            id="regpassword"
            value={password}
            onChange={handlePasswordChange}
            type={passwordShown ? "text" : "password"}
          />
          <button
            type="button"
            onClick={togglePassword}
            style={{
              // width: "1.5rem",
              border: "none",
              backgroundColor: "transparent",
              margin: "0",
            }}
          >
            {passwordShown ? (
              <AiOutlineEyeInvisible size={22} />
            ) : (
              <AiOutlineEye size={22} />
            )}
          </button>
        </div>
        <div
          style={{
            alignSelf: "flex-end",
            marginTop: "1rem",
            marginBottom: "0.5rem",
          }}
        >
          <button className="button_login">
            {/* onClick={handleRegister}> */}
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
}

export default RegistrationForm;
