import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { FaSpinner } from "react-icons/fa"; // Import spinner icon
import { FaPlay, FaEdit } from "react-icons/fa";


import "../styles.css"; // Import styles

const CreateAI = () => {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [popup, setPopup] = useState(null);
  const [progress, setProgress] = useState(0);
  const [createId, setCreateId] = useState(null);
  const [attempts, setAttempts] = useState(0);

  const navigate = useNavigate();

  React.useEffect(() => {
    if (popup === 'spinner') {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1.25; // ~8 seconds total (100 / 1.25 = 80 steps)
        });
      }, 100); // update every 100ms

      return () => clearInterval(interval);
    }
  }, [popup, attempts]);


  const handleSubmit = async (e, localAttempts = attempts) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Title cannot be empty.");
      return;
    }

    setPopup('spinner'); // Show spinner popup

    try {
      const response = await axios.post(
        "https://quizure.com/api/quiz_ai",
        { title, details },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        const { id } = response.data;
        setPopup('finished');
        setCreateId(id);
      } else {
        alert("Error: " + (response.data?.error || "Unexpected server response."));
        setPopup(null);
      }
    } catch (error) {
      if (localAttempts >= 2) {
        alert("Something went wrong, please try again later.");
        setPopup(null);
      } else {
        const nextAttempt = localAttempts + 1;
        setAttempts(nextAttempt);
        handleSubmit(e, nextAttempt); // retry with updated value
      }
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "50px auto", padding: 20 }}>
      {popup && (
        <div className="popup-overlay" onClick={() => setPopup(false)}>
          {
            popup === 'spinner'
              ? <div style={{ textAlign: 'center', color: '#fff' }}>
                <FaSpinner className="spinner" style={{ fontSize: "5rem", color: "#fff" }} />
                {
                  attempts > 0 && (
                    <div style={{ marginTop: "20px" }}>
                      Attempt {attempts + 1} of 3
                    </div>
                  )
                }
                <div style={{
                  marginTop: "20px",
                  width: "80%",
                  height: "10px",
                  backgroundColor: "#444",
                  borderRadius: "5px",
                  overflow: "hidden",
                  margin: "20px auto"
                }}>
                  <div style={{
                    height: "100%",
                    width: `${progress}%`,
                    backgroundColor: "#00c2ff",
                    transition: "width 0.1s linear"
                  }} />
                </div>
                <div>{Math.round(progress)}%</div>
              </div>
              : popup === 'finished'
              && <div className="popup" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                <div>Your quiz has been created!</div>
                <button
                  onClick={() => {
                    setPopup(null);
                    navigate(`/quiz/${createId}/10`);
                  }}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "#4CAF50",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    marginTop: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <FaPlay /> Play
                </button>

                <button
                  onClick={() => {
                    setPopup(null);
                    navigate(`/editquiz/${createId}`);
                  }}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "#4CAF50",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    marginTop: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <FaEdit /> Review / Edit
                </button>
              </div>
          }


        </div>
      )}

      <h2>Create a Quiz with AI</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 20 }}>
          <label>
            Title *:
            <input
              type="text"
              maxLength={50}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: "100%", padding: "10px", marginTop: "5px" }}
              required
            />
          </label>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label>
            Details (optional):
            <input
              type="text"
              maxLength={200}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              style={{ width: "100%", padding: "10px", marginTop: "5px" }}
            />
          </label>
        </div>
        <button type="submit"
          style={{
            padding: "5px 10px",
            backgroundColor: "#4CAF50",
            borderRadius: "10px",
            marginRight: "10px",
            cursor: "pointer",
            color: "#fff",
            border: "none",
          }}>
          Submit
        </button>
      </form>
    </div>
  );
};

export default CreateAI;
