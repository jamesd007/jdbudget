// src/components/DateRangePicker.js

import React, { useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const DateRangePicker = ({ onGetData }) => {
  const [startDate, setStartDate] = useState(new Date(2024, 2, 1));
  const [endDate, setEndDate] = useState(new Date());

  const handleGetData = () => {
    if (startDate && endDate) {
      onGetData(startDate, endDate);
    } else {
      alert("Please select both start and end dates.");
    }
  };

  return (
    <div>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box display="flex" flexDirection="row" alignItems="center" gap={2}>
          <DatePicker
            label="Start Date"
            value={startDate}
            format="dd-MMM-yyyy"
            onChange={(newValue) => setStartDate(newValue)}
            renderInput={(params) => <TextField {...params} />}
            // maxDate={new Date()}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            format="dd-MMM-yyyy"
            onChange={(newValue) => setEndDate(newValue)}
            renderInput={(params) => <TextField {...params} />}
            // maxDate={new Date()}
          />
          <Button variant="contained" onClick={handleGetData}>
            Get Data
          </Button>
        </Box>
      </LocalizationProvider>
    </div>
  );
};

export default DateRangePicker;
