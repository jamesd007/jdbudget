import React, { useState } from "react";
// import './styles.css'; // Import your CSS file

function YearPicker() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const handleChange = (event) => {
    const inputYear = parseInt(event.target.value);
    if (!isNaN(inputYear)) {
      setSelectedYear(inputYear);
    }
  };

  const handleIncrement = () => {
    setSelectedYear(selectedYear + 1);
  };

  const handleDecrement = () => {
    setSelectedYear(selectedYear - 1);
  };

  return (
    <div className="year-picker">
      <label htmlFor="yearInput" className="label">
        Year:
      </label>
      <div className="dropdown">
        <button onClick={handleDecrement}>-</button>
        <input
          type="text"
          id="yearInput"
          className="input"
          value={selectedYear}
          onChange={handleChange}
        />
        <button onClick={handleIncrement}>+</button>
      </div>
    </div>
  );
}

export default YearPicker;
