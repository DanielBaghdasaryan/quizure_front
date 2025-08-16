import React, { useState } from "react"
import axios from "axios"
import { useNavigate } from 'react-router-dom'
import xlsx from "../xlsx.jpg"
import xlsx1 from "../xlsx1.jpg"
import xlsx2 from "../xlsx2.jpg"


import "../styles.css" // Import styles

const CreateXlsx = () => {
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState("")
  const navigate = useNavigate()


  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!file) {
      alert("Please upload a file or provide questions.")
      return
    }

    const formData = new FormData()
    formData.append("file", file)
    formData.append("title", title)
    formData.append("type", "quiz_xlsx") // Add the required "type" field

    const response = await axios.post("https://quizure.com/api/quiz_xlsx", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true, // Include credentials for CORS
    })

    if (response.status === 200) {
      const { id } = response.data // Assuming the response contains the quiz JSON with an `id`
      navigate(`/editquiz/${id}`) // Navigate to the edit page with the quiz ID
    }
  }

  return (
    <div style={{ maxWidth: 600, padding: 20 }}>
      <h2>Create a Quiz from .xlsx file</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: 50 }}>
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
      <h2>Structure:</h2>
      <p><b>1.</b> Column A = Questions.</p>
      <p><b>2.</b> Columns B, C, D, … = Answer options (2–10 options per question).</p>
      <img
        src={xlsx} // Path to the logo
        alt=''
        style={{ marginBottom: 50, maxWidth: "100%", height: "auto" }}
      />
      <p><b>3. Single Select:</b> If no option starts with <b>&lt;*&gt;</b>, the question is <i>Single Select</i>. First option is correct.</p>
      <p style={{ marginBottom: 20 }}><i>* Options will be shown in random order in the quiz.</i></p>
      <img
        src={xlsx1} // Path to the logo
        alt=''
        style={{ marginBottom: 50, maxWidth: "100%", height: "auto" }}
      />
      <p><b>4. Multi Select:</b> If any option starts with <b>&lt;*&gt;</b>, the question is <i>Multi Select</i>. All options with <b>&lt;*&gt;</b> are correct.</p>
      <img
        src={xlsx2} // Path to the logo
        alt=''
        style={{ marginBottom: 20, maxWidth: "100%", height: "auto" }}
      />
    </div>
  )
}

export default CreateXlsx
