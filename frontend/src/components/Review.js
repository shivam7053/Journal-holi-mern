import React, { useEffect, useState } from "react";
import axios from "../axios";

const Review = () => {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/entries", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEntries(response.data);
      } catch (error) {
        console.error(error.response.data.error);
      }
    };

    fetchEntries();
  }, []);

  const handleViewPDF = async (pdf) => {
    try {
      const pdfUrl = `/pdf/${pdf}`; // Construct the URL to access PDF files
      const response = await axios.get(pdfUrl, {
        responseType: "blob", // Set responseType to 'blob' to receive binary data
      });
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      window.open(url);
    } catch (error) {
      console.error("Error fetching PDF:", error);
    }
  };

  const handleReview = async (id, reviewStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/entries/${id}`,
        { reviewStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEntries((prevEntries) =>
        prevEntries.filter((entry) => entry._id !== id)
      );
      // Optionally, you can notify the user or update UI
    } catch (error) {
      console.error(error.response.data.error);
    }
  };

  return (
    <div>
      <h2>Review Section</h2>
      <ul>
        {entries.map((entry) => (
          <li key={entry._id}>
            <h3>{entry.title}</h3>
            <p>{entry.content}</p>
            <button onClick={() => handleViewPDF(entry.pdf)}>View PDF</button>
            <button onClick={() => handleReview(entry._id, "approved")}>
              Approve
            </button>
            <button onClick={() => handleReview(entry._id, "rejected")}>
              Reject
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Review;
