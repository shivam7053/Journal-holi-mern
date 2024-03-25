import React from "react";

const Logout = () => {
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token from local storage
    // Perform any additional logout actions (e.g., redirect user)
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;
