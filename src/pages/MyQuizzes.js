import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { baseUrl } from "../url";
import { FiMenu, FiEdit2 } from "react-icons/fi";
import { FaTimes, FaPlay } from "react-icons/fa"; // Import the close icon


const MyQuizzes = ({ user }) => {
  const [quizes, setQuizes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const lastQuizId = useRef(null);
  const loadingRef = useRef(false); // to avoid stale closures
  const [popup, setPopup] = useState(null);

  const navigate = useNavigate();

  const fetchQuizes = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;

    setLoading(true);
    loadingRef.current = true;

    try {
      const cursorParam = lastQuizId.current ? `cursor=${lastQuizId.current}` : "";
      // with credentials for CORS
      const res = await fetch(`${baseUrl}my_quizzes?${cursorParam}`, {
        credentials: 'include', // Include cookies for CORS
      });
      const data = await res.json();
      console.log('here')

      if (data.quizes.length > 0) {
        setQuizes(prev => [...prev, ...data.quizes]);
        lastQuizId.current = data.quizes[data.quizes.length - 1].id;
      }

      // Stop if fewer than expected
      if (data.quizes.length < 4) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to fetch quizes", err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [hasMore]);

  useEffect(() => {
    fetchQuizes(); // Load first batch
  }, [fetchQuizes]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
        !loadingRef.current &&
        hasMore
      ) {
        fetchQuizes();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchQuizes, hasMore]);

  const handleMenuClick = (e, quiz) => {
    e.preventDefault(); // Prevent the default behavior
    setPopup(quiz); // Set the popup with the selected quiz
  };


  return (
    <div style={{ marginTop: "10px" }}>
      {(popup && popup !== 'title') && (
        <div className="popup-overlay" onClick={() => setPopup(null)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", marginBottom: "10px", alignItems: "center" }}>
              Select play option
              <FaTimes
                onClick={() => setPopup(null)} // Close the popup when clicked
                style={{
                  marginLeft: "auto", // Move the icon to the right
                  cursor: "pointer",
                  fontSize: "1.5rem",
                  color: "#777",
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              {popup.questions.length >= 10 &&
                <button
                  onClick={() => {
                    setPopup(null);
                    navigate(`/quiz/${popup.id}/5`);
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
                  <FaPlay /> Play random <b>5</b>
                </button>
              }
              {popup.questions.length >= 15 &&
                <button
                  onClick={() => {
                    setPopup(null);
                    navigate(`/quiz/${popup.id}/10`);
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
                  <FaPlay /> Play random <b>10</b>
                </button>
              }
              {popup.questions.length >= 20 &&
                <button
                  onClick={() => {
                    setPopup(null);
                    navigate(`/quiz/${popup.id}/15`);
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
                  <FaPlay /> Play random <b>15</b>
                </button>
              }
              {popup.questions.length >= 25 &&
                <button
                  onClick={() => {
                    setPopup(null);
                    navigate(`/quiz/${popup.id}/20`);
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
                  <FaPlay /> Play random <b>20</b>
                </button>
              }
              {popup.questions.length <= 30 &&
                <button
                  onClick={() => {
                    setPopup(null);
                    navigate(`/quiz/${popup.id}/${popup.questions.length}`);
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
                  <FaPlay /> Play all <b>{popup.questions.length}</b>
                </button>
              }
            </div>
          </div>
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {quizes.map((quiz) => (
          <Link key={quiz.id} to={`/quiz/${quiz.id}/10`}
            style={{

              textDecoration: "none",
              color: "inherit",
              width: "200px",
              maxWidth: "calc(50% - 15px)",
              margin: "5px",
              // border: "1px solid #ccc",
              boxSizing: "border-box",
              borderRadius: "15px",
              height: "130px",
              backgroundColor: "#f0f0f0",

            }}>

            <div style={{
              position: "relative",
              width: "100%",
              height: "65px",
              backgroundColor: "gray",
              borderTopLeftRadius: "14px",
              borderTopRightRadius: "14px",
            }}>

              {
                quiz.owner_id === user?.id && <Link style={{
                  position: "absolute",
                  width: 32,
                  height: 32,
                  top: 5,
                  left: 90,
                  backgroundColor: "#00000050",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  textDecoration: "none"
                }}
                  to={`/editquiz/${quiz.id}`}
                >
                  <FiEdit2 size={18} />
                </Link>
              }
              {quiz.questions.length >= 10 && <div style={{
                position: "absolute",
                width: 32,
                height: 32,
                top: 5,
                right: 5,
                backgroundColor: "#00000050",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                textDecoration: "none"
              }}
                onClick={(e) => handleMenuClick(e, quiz)}  // Assuming you have a function to handle menu click
              >
                <FiMenu size={18} />
              </div>}
            </div>
            <div style={{ padding: "10px", height: "80px" }}>
              {quiz.title}
            </div>
            {/* <div style={{
              display: "flex",
              justifyContent: "flex-end",
              height: "calc(50px - 20px",
              width: "calc(100% - 20px)",
              padding: "10px",
              borderBottomLeftRadius: "14px",
              borderBottomRightRadius: "14px",
              fontSize: "0.9rem",
              color: "#555",
            }}>
              {quiz.questions.length} questions
            </div> */}
          </Link>))}

        {loading && <p>Loading...</p>}
      </div>

    </div >

  );
};

export default MyQuizzes;
