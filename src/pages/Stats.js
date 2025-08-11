import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "../styles.css"; // Import styles

const Stats = () => {
  // call route https://quizure.com/api/stats which and store the data in stats
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://quizure.com/api/quiz_play`, {
        withCredentials: true,
      });
      setStats(response.data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading stats</div>;

  // my stats has following structure:
  //   [
  //   {
  //     "id": 35,
  //     "quiz_id": 113,
  //     "finished": false,
  //     "created_at": "2025-08-11T20:16:20.998Z",
  //     "session_id": "Z6ufckP6oZusFEfija_-BcIHlAYwbBVh",
  //     "user_id": 3,
  //     "country": "AM",
  //     "region": "ER",
  //     "user_name": "daniel_baghdasaryan_eidn",
  //     "quiz_title": "React js"
  //   },
  //   {
  //     "id": 34,
  //     "quiz_id": 109,
  //     "finished": false,
  //     "created_at": "2025-08-11T20:16:09.924Z",
  //     "session_id": "Z6ufckP6oZusFEfija_-BcIHlAYwbBVh",
  //     "user_id": 3,
  //     "country": "AM",
  //     "region": "ER",
  //     "user_name": "daniel_baghdasaryan_eidn",
  //     "quiz_title": "phylosophy"
  //   },
  //   {
  //     "id": 33,
  //     "quiz_id": 109,
  //     "finished": false,
  //     "created_at": "2025-08-11T19:54:31.533Z",
  //     "session_id": "Z6ufckP6oZusFEfija_-BcIHlAYwbBVh",
  //     "user_id": 3,
  //     "country": "AM",
  //     "region": "ER",
  //     "user_name": "daniel_baghdasaryan_eidn",
  //     "quiz_title": "phylosophy"
  //   }
  // ]

  // create an array of objects of following format:
  // {
  //   title: "Quiz Title",
  //   plays: 5,
  //   finished: 2
  // }
  const formattedStats = stats.reduce((acc, stat) => {
    const existingStat = acc.find(s => s.title === stat.quiz_title);
    if (existingStat) {
      existingStat.plays += 1;
      if (stat.finished) existingStat.finished += 1;
    } else {
      acc.push({
        title: stat.quiz_title,
        plays: 1,
        finished: stat.finished ? 1 : 0,
      });
    }
    return acc;
  }, []);

  // formattedStats is of following format:
  // [
  //   { title: "React js", plays: 1, finished: 0 },
  //   { title: "phylosophy", plays: 2, finished: 0 }
  // ]

  // display the stats in a table format
  return (
    <div style={{ maxWidth: 800, margin: "50px auto", padding: 20 }}>
      <h2>Quiz Stats</h2>
      {formattedStats.length === 0 ? (
        <p>No stats available.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>Quiz Title</th>
              <th style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>Plays</th>
              <th style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>Finished</th>
            </tr>
          </thead>
          <tbody>
            {formattedStats.map((stat, index) => (
              <tr key={index}>
                <td style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                  {stat.title}
                </td>
                <td style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>{stat.plays}</td>
                <td style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>{stat.finished}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Stats;
