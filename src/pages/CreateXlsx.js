import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

import "../styles.css"; // Import styles

const CreateXlsx = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const navigate = useNavigate();


  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please upload a file or provide questions.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("type", "quiz_xlsx"); // Add the required "type" field

    const response = await axios.post("https://quizure.com/api/quiz_xlsx", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true, // Include credentials for CORS
    });

    if (response.status === 200) {
      const { id } = response.data; // Assuming the response contains the quiz JSON with an `id`
      navigate(`/editquiz/${id}`); // Navigate to the edit page with the quiz ID
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "50px auto", padding: 20 }}>
      <h2>Create Quiz</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 20 }}>
          <label>
            Title:
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: "100%", padding: "10px", marginTop: "5px" }}
              required
            />
          </label>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label>
            Upload XLSX File:
            <input
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              style={{ display: "block", marginTop: "5px" }}
            />
          </label>
        </div>
        <button type="submit" style={{ padding: "10px 20px" }}>
          Submit
        </button>
      </form>
    </div>
  );
};

export default CreateXlsx;
