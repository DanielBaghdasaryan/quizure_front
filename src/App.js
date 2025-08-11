import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import Create from "./pages/Create";
import EditQuiz from "./pages/EditQuiz";
import Quiz from "./pages/Quiz";
import Stats from "./pages/Stats";
import { MdLogin, MdHome, MdAdd } from "react-icons/md";
import logo from "./quizure_logo-Recovered_240.png";

import "./styles.css";
import CreateXlsx from "./pages/CreateXlsx";
import CreateAI from "./pages/CreateAI";
import { FaSpinner, FaTimes } from "react-icons/fa"; // Import icons
import axios from "axios";



const AppContent = ({ user, setUser, showPopup, setShowPopup, logout }) => {
  const location = useLocation();
  const [username, setUsername] = useState(user ? user.name : "");
  const [spinner, setSpinner] = useState(null);

  const handleUsernameUpdate = async () => {
    setSpinner("username");
    await axios.put(
      "https://quizure.com/api/update_user/name",
      { value: username },
      { withCredentials: true }
    );

    setUser((prevUser) => ({ ...prevUser, name: username }));
    setSpinner(null);
  }

  useEffect(() => {
    setUsername(user ? user.name : "");
  }, [user]);

  return (
    <div className="app-container">
      <div className="nav-login">
        {user ? (
          <>
            <div style={{
              width: "30px",
              height: "30px",
              marginTop: "-5px",
              backgroundImage: `url("https://quizure.com/images/users/${user.picture_id}.jpg")`,
              backgroundSize: "cover",         // makes image fill the box
              backgroundPosition: "center",    // centers the image
              backgroundRepeat: "no-repeat",   // prevents tiling
              borderRadius: "50%",
              // border: "3px solid white",
              cursor: "pointer",
            }}
              onClick={() => setShowPopup(true)}
            />

            {showPopup && (
              <div className="popup-overlay" onClick={() => setShowPopup(false)}>
                <div className="popup" onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: "flex", marginBottom: "10px", alignItems: "center" }}>
                    <h2>Account Details</h2>
                    <FaTimes
                      onClick={() => setShowPopup(false)} // Close the popup when clicked
                      style={{
                        marginLeft: "auto", // Move the icon to the right
                        cursor: "pointer",
                        fontSize: "1.5rem",
                        color: "#777",
                      }}
                    />
                  </div>
                  <p style={{ lineHeight: "1.5" }}>
                    <span style={{
                      color: "rgb(141, 175, 187)",

                    }}>Email:</span><br />
                    {user.email}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", height: 20, color: "rgb(141, 175, 187)", marginBottom: 5 }}>
                    <div>
                      Username:
                    </div>
                    <div>
                      {spinner === "username" && <FaSpinner className="spinner" style={{ fontSize: "1rem", color: "#777", marginLeft: "10px" }} />}
                    </div>
                  </div>
                  <div onBlur={handleUsernameUpdate}>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      style={{
                        width: "90%",
                        borderRadius: "10px",
                        border: "1px solid #aaa",
                        padding: "5px",
                        outline: "none",
                      }}
                      required
                    />
                  </div>
                  <div style={{ display: "flex" }}>

                    <div
                      onClick={logout}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "5px 10px",
                        backgroundColor: "#eaeff4",
                        borderRadius: "10px",
                        cursor: "pointer",
                        marginTop: "20px",
                      }}
                    >
                      Logout
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <Link to="/signin" className="nav-link">
            Log In
            <MdLogin size={23} style={{ marginLeft: "10px", verticalAlign: "middle" }} />
          </Link>
        )}
      </div>

      {/* Replace "hello" with icons */}
      {location.pathname !== "/" ? (
        <div
          style={{
            position: "absolute",
            top: "0px",
            paddingTop: "10px",
            display: "flex",
            gap: "15px",
            alignItems: "center",
            color: "#fff",
          }}
        >
          <Link to="/" style={{ textDecoration: "none", color: "#396792" }}>
            <MdHome size={30} style={{ cursor: "pointer" }} />
          </Link>
          {
            location.pathname !== "/create" && (
              <Link to={user ? "/create" : "/signin"} style={{ textDecoration: "none", color: "#396792" }}>
                <MdAdd size={30} style={{ cursor: "pointer" }} />
              </Link>
            )
          }
        </div>
      ) : (
        <div
          style={{
            position: "absolute",
            top: "0px",
            paddingTop: "10px",
            display: "flex",
            gap: "15px",
            alignItems: "center",
            color: "#fff",
          }}
        >
          <img
            src={logo} // Path to the logo
            alt="Quizure Logo"
            style={{ height: "30px", cursor: "pointer" }} // Adjust height and styling
          />
        </div>
      )

      }

      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/signin" element={<SignIn user={user} />} />
        <Route path="/create" element={<Create />} />
        <Route path="/create_xlsx" element={<CreateXlsx />} />
        <Route path="/create_ai" element={<CreateAI />} />
        <Route path="/editquiz/:id" element={<EditQuiz />} />
        <Route path="/quiz/:id/:num" element={<Quiz />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    document.title = "Quizure - Create & Play Quizzes Online";
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("https://quizure.com/api/user", { credentials: "include" });
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const { user } = await response.json();
        setUser(user);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUser();
  }, []);

  const logout = async () => {
    try {
      const response = await fetch("https://quizure.com/api/log_out", {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        setUser(null);
        setShowPopup(false);
      } else {
        console.error("Failed to log out");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <Router>
      <div
        style={{
          // background: "linear-gradient(to bottom, #eaeff4, #c6d4df)", // Vertical gradient
          backgroundColor: "#eaeff4",
          height: "50px",
          width: "100%",
        }}
      ></div>
      <AppContent
        user={user}
        setUser={setUser}
        showPopup={showPopup}
        setShowPopup={setShowPopup}
        logout={logout}
      />
    </Router>
  );
};

export default App;
