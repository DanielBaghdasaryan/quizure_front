import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineFileExcel } from "react-icons/ai";
import { FaRobot, FaRegEdit, FaTimes, FaSpinner } from "react-icons/fa";
import axios from "axios";

import "../styles.css"; // Import styles

const Create = () => {
  const [popup, setPopup] = React.useState(false);
  const [text, setText] = React.useState("");
  const [loadingSubmit, setLoadingSubmit] = React.useState(false);
  const navigate = useNavigate();


  const iconColor = "#396792";

  const handlePopupSubmit = async () => {
    if (!text.trim()) {
      alert("Field cannot be empty.");
      return;
    }

    setLoadingSubmit(true);

    const response = await axios.post(
      "https://quizure.com/api/quiz",
      { title: text }, // Send the title as the request body
      { withCredentials: true } // Include credentials for authentication
    );

    if (response.status === 200) {
      const { id } = response.data; // Assuming the response contains the quiz JSON with an `id`
      navigate(`/editquiz/${id}`); // Navigate to the edit page with the quiz ID
    }
  }

  return (
    <div>
      {popup && (
        <div className="popup-overlay" onClick={() => setPopup(false)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", marginBottom: "10px", alignItems: "center" }}>
              Title
              {loadingSubmit && <FaSpinner className="spinner" style={{ fontSize: "1.2rem", color: "#777", marginLeft: "10px" }} />}
              <FaTimes
                onClick={() => setPopup(false)} // Close the popup when clicked
                style={{
                  marginLeft: "auto", // Move the icon to the right
                  cursor: "pointer",
                  fontSize: "1.5rem",
                  color: "#777",
                }}
              />
            </div>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)} // Update text state on input change
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px",
                marginBottom: "10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
            />
            <div style={{ display: "flex" }}>
              <div
                onClick={handlePopupSubmit}
                style={{
                  padding: "5px 10px",
                  backgroundColor: "#4CAF50",
                  borderRadius: "10px",
                  marginRight: "10px",
                  cursor: "pointer",
                  color: "#fff",
                }}
              >
                Submit
              </div>
              <div
                onClick={() => setPopup(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "5px 10px",
                  backgroundColor: "#F44336",
                  borderRadius: "10px",
                  cursor: "pointer",
                  color: "#fff",
                }}
              >
                Close
              </div>
            </div>
          </div>
        </div>
      )}

      <h2 style={{ marginBottom: "30px" }}>Create a Quiz</h2>

      <Link to="/create_ai" className="create-link">
        <div className="create-button" style={{ color: "#396792", display: "flex", alignItems: "center", gap: "10px" }}>
          <FaRobot size={25} color={iconColor} />
          <span style={{ position: "relative", top: "2px" }}>Generate with AI</span>
        </div>
      </Link>
      <Link to="/create_xlsx" className="create-link">
        <div className="create-button" style={{ color: "#396792", display: "flex", alignItems: "center", gap: "10px" }}>
          <AiOutlineFileExcel size={25} color={iconColor} />
          <span style={{ position: "relative", top: "2px" }}>From XLSX File</span>
        </div>
      </Link>


      <div
        className="create-button"
        style={{ color: "#396792", display: "flex", alignItems: "center", gap: "10px" }}
        onClick={() => setPopup(true)} // Open the popup when clicked
      >
        <FaRegEdit size={25} color={iconColor} />
        <span style={{ position: "relative", top: "2px" }}>Create Manually</span>
      </div>
    </div>
  );
};

export default Create;
