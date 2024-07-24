import React from "react";
import { TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";

const MonthPicker = ({ selectedMonth, onMonthChange }) => {
  const handleMonthChange = (date) => {
    if (date) {
      onMonthChange(date);
    }
  };

  return (
    <DatePicker
      views={["year", "month"]}
      label="Year and Month"
      minDate={new Date("2012-03-01")}
      maxDate={new Date("2023-06-01")}
      value={selectedMonth}
      onChange={handleMonthChange}
      renderInput={(params) => <TextField {...params} helperText={null} />}
    />
  );
};

export default MonthPicker;
