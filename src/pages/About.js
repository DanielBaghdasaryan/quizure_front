import React from "react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div>
      <h2>About Page</h2>
      <p>This is the about page of our React app.</p>
      <Link to="/">Go to Home</Link>
    </div>
  );
};

export default About;
