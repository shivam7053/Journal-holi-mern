import React, { useEffect, useState } from "react";
import axios from "../axios";

const Journal = () => {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await axios.get("/journal");
        setEntries(response.data);
      } catch (error) {
        console.error(error.response.data.error);
      }
    };

    fetchEntries();
  }, []);

  const handleViewPDF = async (pdfUrl) => {
    try {
      const response = await axios.get(pdfUrl, {
        responseType: "blob", // Set responseType to 'blob' to receive binary data
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      window.open(url);
    } catch (error) {
      console.error("Error fetching PDF:", error);
    }
  };

  return (
    <div>
      <h2>Journal</h2>
      <ul>
        {entries.map((entry) => (
          <li key={entry._id}>
            <h3>{entry.title}</h3>
            <p>{entry.content}</p>
            <button onClick={() => handleViewPDF(entry.pdf)}>View PDF</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Journal;
