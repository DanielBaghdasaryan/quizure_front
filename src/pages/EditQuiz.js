import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FaSpinner, FaCheckCircle, FaRegCircle, FaCheckSquare, FaRegSquare, FaTrash, FaTimes, FaPlay } from "react-icons/fa"; // Import icons
import { MdWarning } from "react-icons/md"; // Import warning icon
import { FiEdit2 } from "react-icons/fi"; // Import edit icon
import { FaImage } from "react-icons/fa"; // Add this import at the top if not present


import "../styles.css"; // Import styles

const EditQuiz = () => {
  const { id } = useParams(); // Get the quiz ID from the route
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState([null, null]);
  const [loadingMultiselect, setLoadingMultiselect] = useState(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingPicture, setLoadingPicture] = useState(null);
  const [text, setText] = useState("");
  const [popup, setPopup] = useState(null); // Popup state
  const [editQuestionIndex, setEditQuestionIndex] = useState(null); // Track which question is being edited
  const [editAnswerIndex, setEditAnswerIndex] = useState(null); // Track which answer is being edited
  const navigate = useNavigate(); // Use navigate from react-router-dom

  const fetchQuiz = useCallback(async () => {
    const response = await axios.get(`https://quizure.com/api/quiz/${id}`, {
      withCredentials: true,
    });
    setLoading([null, null]); // Reset loading state after fetching
    setLoadingMultiselect(null); // Reset multiselect loading state
    setLoadingSubmit(false); // Reset submit loading state
    setLoadingPicture(null); // Reset picture loading state
    setQuiz(response.data);
    setPopup(null); // Reset popup state
  }, [id]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  useEffect(() => {
    if (!popup) {
      setEditAnswerIndex(null); // Reset answer index when popup is closed
      setEditQuestionIndex(null); // Reset question index when popup is closed
      setText(""); // Clear text when popup is closed
    }
  }, [popup]);

  // create an array of refs
  const fileInputRefs = useRef([]);

  const handleImageDivClick = (index) => {
    // Delay the file input trigger to ensure state is updated
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index].value = null;
      fileInputRefs.current[index].click();
    }
  };

  const handleFileChange = async (e, questionIndex) => {
    console.log(questionIndex)
    setLoadingPicture(questionIndex);
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);
    formData.append("type", "question");
    formData.append("quiz_id", quiz.id);
    formData.append("question_index", questionIndex);
    // after picture upload, we need to update the user picture_id
    await fetch("https://quizure.com/api/upload", {
      method: "POST",
      body: formData,
      credentials: "include",
    })

    fetchQuiz();

  };


  const handleAnswerClick = async (questionIndex, answerIndex) => {
    const updatedQuestions = [...quiz.questions];
    const { answers } = updatedQuestions[questionIndex];
    const multiselect = answers.some((answer) => answer.startsWith("<*>"));

    if (answerIndex === 0 && !multiselect) return; // If the clicked answer is already the first, do nothing

    setLoading([questionIndex, answerIndex]); // Set loading state to true

    if (multiselect) {
      // Toggle "<*>" prefix for the clicked answer
      answers[answerIndex] = answers[answerIndex].startsWith("<*>")
        ? answers[answerIndex].replace(/^<\*>/, "") // Remove "<*>" prefix
        : `<*>${answers[answerIndex]}`; // Add "<*>" prefix
    } else {
      const [selectedAnswer] = answers.splice(answerIndex, 1); // Remove the selected answer
      answers.unshift(selectedAnswer); // Add it to the beginning
    }

    await axios.put(
      `https://quizure.com/api/quiz/${id}`,
      {
        field: "answers",
        value: answers,
        questionIndex,
      },
      { withCredentials: true }
    );

    // Refetch the quiz after a successful update
    fetchQuiz();
  };

  const handleMultiselectToggle = async (questionIndex) => {
    setLoadingMultiselect(questionIndex); // Set loading state for multiselect toggle
    const answers = quiz.questions[questionIndex].answers;
    const isMulti = answers.some((answer) => answer.startsWith("<*>"));

    // If isMulti is true, remove "<*>" from all answers
    const updatedAnswers = isMulti
      ? answers.map((answer) => answer.replace(/^<\*>/, "")) // Remove "<*>" prefix
      : answers.map((answer, index) => (index === 0 ? `<*>${answer}` : answer)); // Add "<*>" to the first answer if not multi

    await axios.put(
      `https://quizure.com/api/quiz/${id}`,
      {
        field: "answers",
        value: updatedAnswers,
        questionIndex,
      },
      { withCredentials: true }
    );

    // Refetch the quiz after a successful update
    fetchQuiz();// Check if any answer starts with "<*>"
  }

  const handleDeleteField = async () => {
    if (popup === "question") {
      // Delete the question
      await axios.put(
        `https://quizure.com/api/quiz/${id}`,
        {
          field: "delete_question",
          questionIndex: editQuestionIndex, // Specify the question index to delete
        },
        { withCredentials: true }
      );

      // Refetch the quiz after deletion
      fetchQuiz();
    } else if (popup === "answer") {
      // Delete the answer
      await axios.put(
        `https://quizure.com/api/quiz/${id}`,
        {
          field: "delete_answer",
          questionIndex: editQuestionIndex, // Specify the question index
          answerIndex: editAnswerIndex, // Specify the answer index to delete
        },
        { withCredentials: true }
      );

      // Refetch the quiz after deletion
      fetchQuiz();
    }
  }

  const handlePopupSubmit = async () => {
    if (!text.trim()) {
      alert("Field cannot be empty.");
      return;
    }

    setLoadingSubmit(true); // Set loading state for submit

    let textToUpdate = text.trim();

    if (editAnswerIndex !== null && quiz.questions[editQuestionIndex].answers[editAnswerIndex].startsWith("<*>")) {
      textToUpdate = `<*>${textToUpdate}`; // Add "<*>" prefix if editing an answer
    }

    const payload = {
      field: popup, // Use the popup state as the field
      value: textToUpdate, // Use the text state as the value
    };

    // Add questionIndex or answerIndex if editing a question or answer
    if (popup === "question") {
      payload.questionIndex = editQuestionIndex;
    } else if (popup === "answer") {
      payload.questionIndex = editQuestionIndex;
      payload.answerIndex = editAnswerIndex;
    } else if (popup === "Add answer") {
      payload.field = "add_answer";
      payload.questionIndex = editQuestionIndex;
    } else if (popup === "Add question") {
      payload.field = "add_question";
      payload.value = { question: textToUpdate, answers: [] }; // Initialize with an empty answer
    }

    await axios.put(`https://quizure.com/api/quiz/${id}`, payload, {
      withCredentials: true,
    });

    // Refetch the quiz after a successful update
    fetchQuiz();
  };

  const handleDeleteImage = async () => {
    setLoadingSubmit(true); // Set loading state for submit
    console.log('here')

    await axios.put(`https://quizure.com/api/image`, {
      type: "question",
      quiz_id: quiz.id,
      question_index: editQuestionIndex,
    },
      { withCredentials: true },
    );
    console.log('and here')

    // Refetch the quiz after a successful update
    fetchQuiz();
  };

  if (!quiz) {
    return <p>Loading quiz details...</p>;
  }

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      {popup && (
        <div className="popup-overlay" onClick={() => setPopup(false)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            {
              popup === "delete" ? (
                <div style={{ display: "flex", flexDirection: "column", marginBottom: "10px", alignItems: "center" }}>
                  <div>Delete image?</div>
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <div
                      onClick={handleDeleteImage}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#4CAF50",
                        borderRadius: "10px",
                        cursor: "pointer",
                        color: "#fff",
                      }}
                    >
                      Yes
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
                      No
                    </div>
                  </div>
                </div>
              ) : <>
                <div style={{ display: "flex", marginBottom: "10px", alignItems: "center" }}>
                  {((popup !== "Add answer" && popup !== "Add question") ? "Edit " : "") + popup}
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
                  {popup === "question" || popup === "answer" ? (
                    <div
                      onClick={handleDeleteField}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "5px 10px",
                        backgroundColor: "#F44336",
                        borderRadius: "10px",
                        cursor: "pointer",
                        color: "#fff",
                        marginLeft: "auto", // Move the Delete button to the right
                      }}
                    >
                      <FaTrash style={{ fontSize: "1.2rem" }} /> {/* Trash icon */}

                    </div>
                  ) : null}
                </div>

              </>
            }
          </div>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        <h2>Edit Quiz</h2>
        <button
          onClick={() => {
            navigate(`/quiz/${id}/10`);
          }}
          style={{
            display: "flex",
            padding: "5px 10px",
            backgroundColor: "#4CAF50",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            alignItems: "center",
            marginLeft: "auto",
            height: "40px",
          }}
        >
          <FaPlay /> Play
        </button>
      </div>
      <div style={{ color: "#FFA500", display: "flex", alignItems: "center", marginBottom: "20px" }}>
        <MdWarning style={{ marginRight: "8px", fontSize: "1.2rem" }} /> {/* Add the warning icon */}
        <b>Answer order will be randomized during gameplay.</b>
      </div>
      <div
        style={{
          fontSize: "1.2rem",
          fontWeight: "bold",
          padding: "10px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          marginBottom: "30px",
          cursor: "pointer",
        }}
        title="Click to edit title"
        onClick={() => {
          setPopup("title"); // Set popup to "title"
          setText(quiz.title); // Set text to the title content
        }}
      >
        {quiz.title}
      </div>
      <div
        style={{
          border: "1px solid #ddd",
          padding: "15px",
          borderRadius: "10px",
          marginBottom: "20px",
          color: "rgb(141, 175, 187)",
          cursor: "pointer",
          textAlign: "center",
        }}
        onClick={() => {
          setPopup("Add question"); // Set popup to "answer"
          setText(""); // Clear text for new answer
        }}
      >
        + Add Question
      </div>

      {quiz.questions.map((question, questionIndex) => (
        <div
          key={questionIndex}
          style={{
            border: "1px solid #ddd",
            padding: "15px",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              marginBottom: "10px",
              padding: "8px",
              cursor: "pointer",
              backgroundColor: "#fff",
            }}
            title="Click to edit question"
          >




            <div
              style={{ cursor: "pointer" }}
              onClick={() => handleImageDivClick(questionIndex)}
            >
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                ref={(el) => (fileInputRefs.current[questionIndex] = el)}
                onChange={(e) => handleFileChange(e, questionIndex)}
              />
              {
                question.picture_id &&
                <div
                  style={{
                    position: "relative", // Make this the positioning context
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "10px"
                  }}
                >
                  <img
                    src={`https://quizure.com/images/quizes/${quiz.id}/${question.picture_id}`}
                    alt="User"
                    style={{
                      width: "100%",
                      maxWidth: "800px",
                      objectFit: "cover",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "calc(50% - 30px)",
                      transform: "translate(-50%, -50%)", // Center the div
                      width: 50,
                      height: 50,
                      backgroundColor: "#00000070",
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {
                      loadingPicture === questionIndex
                        ? <FaSpinner className="spinner" style={{ fontSize: "1.5rem", color: "#fff" }} />
                        : <FiEdit2 style={{ fontSize: "1.5rem", color: "#fff" }} />
                    }
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "calc(50% + 30px)",
                      width: 50,
                      height: 50,
                      transform: "translate(-50%, -50%)", // Center the div
                      backgroundColor: "#00000070",
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent click from propagating to the question div
                      setPopup("delete");
                      setEditQuestionIndex(questionIndex);
                    }}
                  >
                    <FaTrash style={{ fontSize: "1.5rem", color: "#fff" }} />
                  </div>
                </div>
              }


            </div>



            <div onClick={() => {
              setPopup("question"); // Set popup to "question"
              setText(question.question); // Set text to the question content
              setEditQuestionIndex(questionIndex); // Set the question index being edited
            }}>{question.question}</div>
          </div>

          <div
            style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}
            onClick={() => handleImageDivClick(questionIndex)}
          >
            {!question.picture_id ? <div style={{ color: "rgb(141, 175, 187)", display: "flex", alignItems: "center", gap: "6px" }}>
              <FaImage style={{ fontSize: "1.2rem", margin: 0 }} /> {/* Image icon */}
              Add image
            </div> : <div></div>}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                flexDirection: "row-reverse",
                cursor: "pointer",
                gap: "8px",
                userSelect: "none"
              }}
              onClick={() => handleMultiselectToggle(questionIndex)}
            >
              <div
                style={{
                  display: "flex",
                  width: 36,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: question.answers.some((answer) => answer.startsWith("<*>")) ? "#4CAF50" : "#ccc", // Check if any answer starts with "<*>"
                  position: "relative",
                  transition: "background 0.3s",
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    backgroundColor: "#fff",
                    position: "absolute",
                    top: 2,
                    left: question.answers.some((answer) => answer.startsWith("<*>")) ? 18 : 2, // Adjust position based on condition
                    transition: "left 0.2s",
                  }}
                />
              </div>
              {loadingMultiselect === questionIndex && <FaSpinner className="spinner" style={{ fontSize: "1.2rem", color: "#777" }} />}

              <span style={{ color: "rgb(141, 175, 187)" }}>
                Multi Select
              </span>
            </div>
          </div>


          {question.answers.map((option, answerIndex) => (
            <div
              key={answerIndex}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "5px",
              }}
            >
              <div
                style={{
                  marginRight: "8px",
                  fontSize: "1rem",
                  width: "30px",
                  textAlign: "center",
                  color: "#777",
                  cursor: "pointer",
                }}
                onClick={() => handleAnswerClick(questionIndex, answerIndex)} // Handle click
              >
                {
                  question.answers.some((answer) => answer.startsWith("<*>")) ? (
                    // Render checkboxes
                    loading[0] === questionIndex && loading[1] === answerIndex
                      ? <FaSpinner className="spinner" style={{ fontSize: "1.2rem", color: "#777" }} />
                      : option.startsWith("<*>") ? (
                        <FaCheckSquare style={{ fontSize: "1.2rem", color: "#4CAF50" }} /> // Selected checkbox
                      ) : (
                        <FaRegSquare style={{ fontSize: "1.2rem", color: "#777" }} /> // Unselected checkbox
                      )
                  ) : (
                    // Render radio buttons
                    loading[0] === questionIndex && 0 === answerIndex
                      ? <FaSpinner className="spinner" style={{ fontSize: "1.2rem", color: "#777" }} />
                      : answerIndex === 0 ? (
                        <FaCheckCircle style={{ fontSize: "1.2rem", color: "#4CAF50" }} /> // Selected radio button
                      ) : (
                        <FaRegCircle style={{ fontSize: "1.2rem", color: "#777" }} /> // Unselected radio button
                      )
                  )
                }
              </div>
              <div
                style={{
                  flex: 1,
                  padding: "6px 10px",
                  borderTop: answerIndex === 0 ? null : "1px solid #ddd",
                  cursor: "pointer",
                }}
                title="Click to edit answer"
                onClick={() => {
                  setPopup("answer"); // Set popup to "answer"
                  setText(option.replace(/^<\*>/, "")); // Set text to the answer content
                  setEditQuestionIndex(questionIndex); // Set the question index being edited
                  setEditAnswerIndex(answerIndex); // Set the answer index being edited
                }}
              >
                {option.replace(/^<\*>/, "")}
              </div>
            </div>
          ))}
          <div
            style={{ marginLeft: "10px", marginTop: "10px", cursor: "pointer", color: "rgb(141, 175, 187)" }}
            onClick={() => {
              setPopup("Add answer"); // Set popup to "answer"
              setText(""); // Clear text for new answer
              setEditQuestionIndex(questionIndex); // Set the question index for new answer
            }}
          >
            + Add Answer
          </div>
        </div>
      ))
      }
    </div >
  );
};

export default EditQuiz;
