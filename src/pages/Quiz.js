import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { MdArrowForward, MdWarning } from "react-icons/md"; // Import the icons
import { FaCheckSquare, FaRegSquare } from "react-icons/fa"; // Import checkbox icons
import "../styles.css"; // Import styles

const Quiz = () => {
  const { id, num } = useParams(); // Get the quiz ID from the route
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [trueIndex, setTrueIndex] = useState(null); // Track the index of the correct answer
  const [wrongIndex, setWrongIndex] = useState(null); // Track the index of the wrong answer
  const [selectedAnswers, setSelectedAnswers] = useState([]); // Track selected answers for multiple choice
  const [submitted, setSubmitted] = useState(false); // Track if the quiz has been submitted
  const [showNext, setShowNext] = useState(false); // Track if the "Next" button should be shown
  const [progress, setProgress] = useState([null]);
  const [popup, setPopup] = useState(false); // Track if the quiz is finished
  const [title, setTitle] = useState(""); // Track the quiz title
  const [playId, setPlayId] = useState(null); // Track the play ID


  const fetchQuestions = useCallback(async () => {
    const response = await axios.get(`https://quizure.com/api/quiz_play/${id}/${num}`, {
      withCredentials: true,
    });
    const { title: quizTitle, questions } = response.data; // Destructure title and questions from the response

    const shuffledQuestions = questions.map((question) => {
      const originalFirstAnswer = question.answers[0]; // Store the original first answer
      const shuffledAnswers = [...question.answers].sort(() => Math.random() - 0.5); // Shuffle the answers

      // Find the new position of the original first answer
      const trueIndex = shuffledAnswers.indexOf(originalFirstAnswer);

      return {
        ...question,
        answers: shuffledAnswers,
        true: trueIndex, // Attach the new position of the original first answer
      };
    });
    setQuestions(shuffledQuestions); // Update the state with shuffled questions
    setTitle(quizTitle); // Set the quiz title from the first question
  }, [id, num]); // Memoize the function and include dependencies

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]); // Include fetchQuestions in the dependency array
  useEffect(() => {
    const startQuiz = async () => {
      const response = await axios.post("https://quizure.com/api/quiz_play", { quiz_id: id }, { withCredentials: true });
      setPlayId(response.data.id);
    };
    startQuiz();
  }, [id]);

  useEffect(() => {
    const finishQuiz = async () => {
      if (popup && playId) {
        await axios.put(`https://quizure.com/api/quiz_play_finish/${playId}`, {}, { withCredentials: true });
      }
    };
    finishQuiz();
  }, [popup, playId]);

  useEffect(() => {
    if (questions && questions.length > 0) {
      setProgress(Array(questions.length).fill(null))
    }
  }, [questions]); // Update progress when questions change

  const handleAnswerClick = (answerIndex) => {
    if (multipleChoice) {
      setSelectedAnswers((prevSelected) =>
        prevSelected.includes(answerIndex)
          ? prevSelected.filter((index) => index !== answerIndex) // Remove if already present
          : [...prevSelected, answerIndex] // Add if not present
      );
    } else {
      if (answerIndex === questions[questionIndex].true) {
        setTrueIndex(answerIndex); // Set the index of the correct answer
        setTimeout(() => {
          if (questionIndex === questions.length - 1) {
            setPopup(true); // Set finished to true if it's the last question
          } else {
            setQuestionIndex(questionIndex + 1);
          }
          setTrueIndex(null);
        }, 500); // Wait for 1 second before moving to the next question
        setProgress((prevProgress) => {
          const newProgress = [...prevProgress];
          newProgress[questionIndex] = 1; // Mark as correct
          return newProgress;
        });
      } else {
        setWrongIndex(answerIndex); // Set the index of the wrong answer
        setTrueIndex(questions[questionIndex].true); // Show the correct answer
        setProgress((prevProgress) => {
          const newProgress = [...prevProgress];
          newProgress[questionIndex] = 0; // Mark as incorrect
          return newProgress;
        });
      }
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const indexes = questions[questionIndex].answers
      .map((answer, index) => (answer.startsWith("<*>") ? index : null)) // Map to index if it starts with "<*>"
      .filter((index) => index !== null); // Filter out null values
    const areIdentical = JSON.stringify(indexes.sort()) === JSON.stringify(selectedAnswers.sort()); // Check if arrays are identical, ignoring order
    if (areIdentical) {
      setTimeout(() => {
        if (questionIndex === questions.length - 1) {
          setPopup(true); // Set finished to true if it's the last question
        } else {
          setQuestionIndex(questionIndex + 1);
        }
        setSelectedAnswers([]); // Reset selected answers when moving to the next question
        setSubmitted(false); // Reset submitted state when moving to the next question
      }, 500); // Wait for 0.5 seconds before moving to the next question
      setProgress((prevProgress) => {
        const newProgress = [...prevProgress];
        newProgress[questionIndex] = 1; // Mark as correct
        return newProgress;
      });
    } else {
      setShowNext(true); // Show the "Next" button if answers are not identical
      setProgress((prevProgress) => {
        const newProgress = [...prevProgress];
        newProgress[questionIndex] = 0; // Mark as incorrect
        return newProgress;
      }
      );
    }
  }

  const multipleChoice = questions && questions[questionIndex] && questions[questionIndex].answers.some((answer) => answer.startsWith("<*>"));
  return (
    <div style={{ maxWidth: 600, marginTop: 10 }}>
      {popup && (
        <div className="popup-overlay" onClick={() => setPopup(false)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ display: "flex", marginBottom: "20px", justifyContent: "center", alignItems: "center" }}>
                {
                  `Your score is ${progress.filter(x => x !== 0).length} out of ${questions.length}.`
                }
              </div>

              <Link to={`/`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "5px 10px",
                  backgroundColor: "#4CAF50",
                  borderRadius: "10px",
                  marginRight: "10px",
                  cursor: "pointer",
                  color: "#fff",
                  textDecoration: "none",
                }}
              >
                Got it!
              </Link>
            </div>
          </div>
        </div>
      )}
      <div style={{
        color: "#777",
      }}>
        <b>{title}</b>
      </div>

      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
          color: "#888",
        }}
      >
        {`${progress.filter(x => x !== null).length} / ${questions.length}`}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "30px",
        }}
      >
        {progress.map((x, index) => (
          <div
            key={index}
            style={{
              width: `${100 / questions.length}%`,
              height: "10px",
              borderTopLeftRadius: index === 0 && "10px",
              borderTopRightRadius: index === questions.length - 1 && "10px",
              borderBottomLeftRadius: index === 0 && "10px",
              borderBottomRightRadius: index === questions.length - 1 && "10px",
              backgroundColor: (
                x === null
                  ? "#eee"
                  : x === 1
                    ? "#c6d4df"
                    : "#c6d4df"
              ),
            }}
          ></div>))}
      </div>
      {questions && questions.length > 0 ? (
        <div>
          <div style={{
            border: "3px solid #999",
            borderRadius: "10px",
            padding: "20px",
            marginBottom: "20px",
          }}>
            {
              questions[questionIndex].picture_id && <img
                src={`https://quizure.com/images/quizes/${id}/${questions[questionIndex].picture_id}`}
                alt="User"
                style={{
                  width: "auto",
                  maxWidth: "100%",
                  maxHeight: "300px",
                  objectFit: "contain",
                  marginBottom: "15px",
                }}
              />
            }

            <div style={{ marginBottom: "10px", lineHeight: "1.5" }}>
              <b>{questions[questionIndex].question}</b>
            </div>

            {multipleChoice && (
              <div style={{ color: "#FFA500", display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                <MdWarning style={{ marginRight: "8px", fontSize: "1.2rem" }} /> {/* Add the warning icon */}
                <b>Multi-select</b>
              </div>
            )}
          </div>


          {questions[questionIndex].answers.map((option, answerIndex) => {
            let bgCollor = "#eaeff4"; // Default background color
            if (submitted && option.startsWith("<*>")) {
              bgCollor = "#98e698"; // Correct answer background color
            } else if (!submitted && selectedAnswers.includes(answerIndex)) {
              bgCollor = "#c6d4df"; // Selected answer background color
            } else if (trueIndex === answerIndex) {
              bgCollor = "#98e698"; // Correct answer background color
            } else if (wrongIndex === answerIndex) {
              bgCollor = "#f8d7da"; // Wrong answer background color
            }
            return (
              <div
                key={answerIndex}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    padding: "10px 15px",
                    borderRadius: "10px",
                    backgroundColor: bgCollor,
                    cursor: "pointer",
                    color: submitted && (
                      (
                        !option.startsWith("<*>")
                        && selectedAnswers.includes(answerIndex)
                      ) || (
                        option.startsWith("<*>")
                        && !selectedAnswers.includes(answerIndex)
                      )
                    ) && "red", // Change text color based on selection
                  }}
                  // if wrongIndex is not null or showNext is true, then onClick should be disabled
                  onClick={() => {
                    if (wrongIndex === null && !showNext) {
                      handleAnswerClick(answerIndex);
                    }
                  }}
                >
                  {
                    multipleChoice && (
                      <div style={{ marginRight: "10px", display: "flex", alignItems: "center" }}>
                        {selectedAnswers.includes(answerIndex) ? (
                          <FaCheckSquare style={{ fontSize: "1.2rem", color: "#777" }} /> // Selected checkbox
                        ) : (
                          <FaRegSquare style={{ fontSize: "1.2rem", color: "#777" }} /> // Unselected checkbox
                        )}
                      </div>
                    )

                  }
                  <div>{
                    option.replace(/^<\*>/, "")
                  }</div>
                </div>
              </div>
            )
          })}
          {(wrongIndex !== null || showNext) && (
            <div
              onClick={() => {
                if (questionIndex === questions.length - 1) {
                  setPopup(true); // Set finished to true if it's the last question
                } else {
                  setQuestionIndex(questionIndex + 1);
                }
                setTrueIndex(null);
                setWrongIndex(null);
                setSelectedAnswers([]);
                setShowNext(false); // Reset showNext when moving to the next question
                setSubmitted(false); // Reset submitted state when moving to the next question
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "15px 10px",
                backgroundColor: "#4CAF50",
                borderRadius: "10px",
                cursor: "pointer",
                color: "#fff",
              }}
            >{
                questionIndex !== questions.length - 1
                  ? <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >Next < MdArrowForward style={{ marginLeft: "8px", fontSize: "1.2rem" }} /></div>
                  : <div>Finish</div>
              }
            </div>

          )}
          {(selectedAnswers.length > 0 && !submitted) && (
            <div
              onClick={handleSubmit}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "15px 10px",
                backgroundColor: "#4CAF50",
                borderRadius: "10px",
                cursor: "pointer",
                color: "#fff",
              }}
            >
              Submit
            </div>

          )}

        </div>
      ) : (
        <p>Loading questions...</p>
      )}
    </div>
  );
};

export default Quiz;
