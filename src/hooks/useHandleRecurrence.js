// src/hooks/useHandleRecurrence.js

import { useCallback, useEffect } from "react";
import dayjs from "dayjs";
import { addBudgets } from "../store/Dexie";

const useHandleRecurrence = (setAllBudgets) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayToNumber = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const yearlyDayToNumber = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    day: 7,
    weekday: 8,
    weekend_day: 9,
  };

  const getFinancialYearEndDate = (startDate) => {
    const startMonth = dayjs(startDate).month(); // Get the month of the start date
    const startYear = dayjs(startDate).year(); // Get the year of the start date

    let endYear;
    if (startMonth >= 2) {
      // If the start date is in March or later
      endYear = startYear + 1;
    } else {
      // If the start date is in January or February
      endYear = startYear;
    }

    return dayjs(`${endYear}-02-28`).toDate(); // Return the end date as 28th Feb
  };

  // const getDayOfWeek = (date) => {
  //   return dayjs(date).format("ddd");
  // };

  const calcMonthlyDate = (
    monthNo,
    monthFreqOption,
    monthFreqOptionDay,
    year
  ) => {
    let date = new Date(year, monthNo, 1);
    let days = new Date(year, monthNo + 1, 0).getDate();
    let mfoIndex = 0;
    switch (monthFreqOption) {
      case "first":
        mfoIndex = 1;
        break;
      case "second":
        mfoIndex = 2;
        break;
      case "third":
        mfoIndex = 3;
        break;
      case "forth":
        mfoIndex = 4;
        break;
      case "last":
        mfoIndex = 5;
        break;
      default:
        mfoIndex = 0;
        break;
    }
    let mfoCounter = 0;
    let lastMatchingDate = null;

    for (let count = 1; count <= days; count++) {
      let newDate = new Date(year, monthNo, count);
      if (newDate.getMonth() !== monthNo) {
        break; // Exit the loop if the month has ended
      }
      let dayNumber = dayToNumber[monthFreqOptionDay];
      if (newDate.getDay() === dayNumber) {
        mfoCounter++;
        lastMatchingDate = newDate;
        if (mfoCounter === mfoIndex) {
          return newDate;
        }
      }
    }

    if (monthFreqOption === "last") {
      return lastMatchingDate;
    }

    return null; // If no matching date is found
  };

  const calcYearlyDate = (
    monthNo,
    yearlyFreqOption,
    yearlyFreqOptionDay,
    year
  ) => {
    const getNthDayOfMonth = (year, month, dayType, occurrence) => {
      month = month - 1; // Convert month to 0-indexed

      let count = 0;
      let date;
      let lastOccurrence;

      if (occurrence === 5 && dayType === "weekday")
        for (let x = days; x > 0; x--) {
          date = new Date(year, month, x);
          if (date.getDay() >= 1 && date.getDay() <= 5) {
            return date;
          }
        }

      for (let i = 1; i <= 31; i++) {
        date = new Date(year, month, i);

        if (date.getMonth() !== month) break; // Exit the loop if the month has ended

        const day = date.getDay();
        const isCurrentWeekday = day >= 1 && day <= 5; // Monday to Friday
        const isCurrentWeekendDay = day === 0 || day === 6; // Sunday or Saturday

        if (dayType === "weekday" && isCurrentWeekday) {
          count++;
          lastOccurrence = date;
          if (count === occurrence) {
            return date;
          }
        }
        if (dayType === "weekend_day" && isCurrentWeekendDay) {
          count++;
          lastOccurrence = date;
          if (count === occurrence) {
            return date;
          }
        }
      }
      return null; // If the x-th occurrence doesn't exist
    };

    // let date = new Date(year, monthNo, 1);
    let days = new Date(year, monthNo + 1, 0).getDate();
    let yfoIndex = 0;
    switch (yearlyFreqOption) {
      case "first":
        yfoIndex = 1;
        break;
      case "second":
        yfoIndex = 2;
        break;
      case "third":
        yfoIndex = 3;
        break;
      case "forth":
        yfoIndex = 4;
        break;
      case "last":
        yfoIndex = 5;
        break;
      default:
        yfoIndex = 0;
        break;
    }
    let yfoCounter = 0;
    let lastMatchingDate = null;
    if (yearlyFreqOptionDay === "day") {
      if (yearlyFreqOption === "last") {
        let date = new Date(year, monthNo, days);
        return date;
      } else {
        let date = new Date(year, monthNo, 1);
        return date;
      }
    }
    if (
      yearlyFreqOptionDay === "weekday" ||
      yearlyFreqOptionDay === "weekend_day" ||
      yearlyFreqOptionDay === "day"
    ) {
      let date = getNthDayOfMonth(
        year,
        monthNo + 1,
        yearlyFreqOptionDay,
        //  === "weekday",
        yfoIndex
      );
      return date;
    }
    for (let count = 1; count <= days; count++) {
      let newDate = new Date(year, monthNo, count);
      if (newDate.getMonth() !== monthNo) {
        break; // Exit the loop if the month has ended
      }
      let yearlyDayNumber = yearlyDayToNumber[yearlyFreqOptionDay];
      if (newDate.getDay() === yearlyDayNumber) {
        yfoCounter++;
        lastMatchingDate = newDate;
        if (yfoCounter === yfoIndex) {
          return newDate;
        }
      }
    }

    if (yearlyFreqOption === "last") {
      return lastMatchingDate;
    }

    return null; // If no matching date is found
  };

  const handleRecurrence = useCallback((data) => {
    // Perform the recurrence calculations
    const repeatedData = calculateRecurrence(data);
  }, []);

  const calculateRecurrence = async (data) => {
    const formatDate = (date, format) => {
      return dayjs(date).format(format);
    };
    // Add your recurrence calculation logic here
    let repeatedData = [data]; // Placeholder for recurrence logic
    // Example: Add logic for daily, weekly, monthly, yearly recurrence
    let repeatData = data.repeat_options;
    const initialDate = new Date(repeatData.selectedDay); // Convert string to Date object
    let dataToSave = [];
    let selectedDay = new Date(repeatData.selectedDay);
    let endSelectedDay = new Date(repeatData.endSelectedDay);

    if (repeatData.frequency === "daily") {
      // Calculate daily recurrence
      if (repeatData.repeatFreq === "everyDay") {
        if (repeatData.endSpec === "endBy") {
          // Calculate the difference in milliseconds
          const differenceInMilliseconds = endSelectedDay - selectedDay;
          // Convert milliseconds to days
          const millisecondsPerDay = 1000 * 60 * 60 * 24;
          const occurrences = differenceInMilliseconds / millisecondsPerDay + 1;
          let daysToRepeat = parseFloat(repeatData.repeatFreqDays);
          for (
            let count = 0;
            count < occurrences;
            count = count + daysToRepeat
          ) {
            let newDate = new Date(initialDate);
            newDate.setDate(initialDate.getDate() + count); // Add count days to the initial date
            let entry = {
              user_id: data.user_id || "default_user_id",
              budgetName: data.name || "",
              date: formatDate(newDate, "DD MMM YYYY"), // Format date as 'YYYY-MM-DD'
              description: data.description || "",
              category: data.category || "",
              amount: Math.abs(data.amount) || 0,
              repeat_options: data.repeat_options || {},
              growth_options: data.growth_options || {},
              extras: data.extras || "",
            };
            dataToSave.push(entry);
          }
          if (dataToSave?.length > 0) await saveToDatabase(dataToSave);
        } else if (repeatData.endSpec === "endAfter") {
          if (repeatData.endAfterOccurrences > 0) {
            const occurrences = repeatData.endAfterOccurrences || 1;
            let daysToRepeat = parseFloat(repeatData.repeatFreqDays);
            for (let count = 0; count < occurrences; count++) {
              let newDate = new Date(initialDate);
              newDate.setDate(initialDate.getDate() + count * daysToRepeat); // Add count days to the initial date
              let entry = {
                user_id: data.user_id || "default_user_id",
                budgetName: data.name || "",
                date: formatDate(newDate, "DD MMM YYYY"), // Format date as 'YYYY-MM-DD'
                description: data.description || "",
                category: data.category || "",
                amount: Math.abs(data.amount) || 0,
                repeat_options: data.repeat_options || {},
                growth_options: data.growth_options || {},
                extras: data.extras || "",
              };
              dataToSave.push(entry);
            }
            await saveToDatabase(dataToSave);
          }
        } else if ((repeatData.endSpec = "noEndDate")) {
          endSelectedDay = getFinancialYearEndDate(initialDate);
          // Calculate the difference in milliseconds
          const differenceInMilliseconds = endSelectedDay - initialDate;
          // Convert milliseconds to days
          const millisecondsPerDay = 1000 * 60 * 60 * 24;
          const occurrences = differenceInMilliseconds / millisecondsPerDay + 1;
          let daysToRepeat = parseFloat(repeatData.repeatFreqDays);
          for (
            let count = 0;
            count < occurrences;
            count = count + daysToRepeat
          ) {
            let newDate = new Date(initialDate);
            newDate.setDate(newDate.getDate() + count); // Add count days to the initial date
            let entry = {
              user_id: data.user_id || "default_user_id",
              budgetName: data.name || "",
              date: formatDate(newDate, "DD MMM YYYY"), // Format date as 'DD MMM YYYY'
              description: data.description || "",
              category: data.category || "",
              amount: Math.abs(data.amount) || 0,
              repeat_options: data.repeat_options || {},
              growth_options: data.growth_options || {},
              extras: data.extras || "",
            };
            dataToSave.push(entry);
          }
          await saveToDatabase(dataToSave);
        }
      } else if (repeatData.repeatFreq === "everyWeekDay") {
        if (repeatData.endSpec === "endBy") {
          // Calculate the difference in milliseconds
          const differenceInMilliseconds = endSelectedDay - selectedDay;
          // Convert milliseconds to days
          const millisecondsPerDay = 1000 * 60 * 60 * 24;
          const occurrences = differenceInMilliseconds / millisecondsPerDay + 1;
          for (let count = 0; count < occurrences; count++) {
            let newDate = new Date(initialDate);
            newDate.setDate(initialDate.getDate() + count); // Add count days to the initial date
            //check if the day is a weekday
            if (newDate.getDay() !== 6 && newDate.getDay() !== 0) {
              let entry = {
                user_id: data.user_id || "default_user_id",
                budgetName: data.name || "",
                date: formatDate(newDate, "DD MMM YYYY"), // Format date as 'YYYY-MM-DD'
                description: data.description || "",
                category: data.category || "",
                amount: Math.abs(data.amount) || 0,
                repeat_options: data.repeat_options || {},
                growth_options: data.growth_options || {},
                extras: data.extras || "",
              };
              if (entry) dataToSave.push(entry);
            }
          }
          if (dataToSave) await saveToDatabase(dataToSave);
        } else if (repeatData.endSpec === "endAfter") {
          if (repeatData.endAfterOccurrences > 0) {
            const occurrences = repeatData.endAfterOccurrences || 1;
            // let daysToRepeat = parseFloat(repeatData.repeatFreqDays);
            let newDate = new Date(initialDate);
            newDate.setDate(initialDate.getDate());
            for (let count = 0; count < occurrences; count++) {
              while (newDate.getDay() === 6 || newDate.getDay() === 0) {
                newDate.setDate(newDate.getDate() + 1);
              }
              let entry = {
                user_id: data.user_id || "default_user_id",
                budgetName: data.name || "",
                date: formatDate(newDate, "DD MMM YYYY"), // Format date as 'YYYY-MM-DD'
                description: data.description || "",
                category: data.category || "",
                amount: Math.abs(data.amount) || 0,
                repeat_options: data.repeat_options || {},
                growth_options: data.growth_options || {},
                extras: data.extras || "",
              };
              dataToSave.push(entry);
              newDate.setDate(newDate.getDate() + 1);
            }
            await saveToDatabase(dataToSave);
          }
        } else if (repeatData.endSpec === "noEndDate") {
          endSelectedDay = getFinancialYearEndDate(initialDate);
          // Calculate the difference in milliseconds
          const differenceInMilliseconds = endSelectedDay - initialDate;
          // Convert milliseconds to days
          const millisecondsPerDay = 1000 * 60 * 60 * 24;
          const occurrences = differenceInMilliseconds / millisecondsPerDay + 1;
          for (let count = 0; count < occurrences; count++) {
            let newDate = new Date(initialDate);
            newDate.setDate(initialDate.getDate() + count); // Add count days to the initial date
            while (newDate.getDay() === 6 || newDate.getDay() === 0) {
              newDate.setDate(newDate.getDate() + 1);
            }
            let entry = {
              user_id: data.user_id || "default_user_id",
              budgetName: data.name || "",
              date: formatDate(newDate, "DD MMM YYYY"), // Format date as 'DD MMM YYYY'
              description: data.description || "",
              category: data.category || "",
              amount: Math.abs(data.amount) || 0,
              repeat_options: data.repeat_options || {},
              growth_options: data.growth_options || {},
              extras: data.extras || "",
            };
            dataToSave.push(entry);
          }
          await saveToDatabase(dataToSave);
        }
      }
    } else if (repeatData.frequency === "weekly") {
      const daysArray = Object.keys(repeatData.days)
        .filter((day) => repeatData.days[day] === true)
        .map((day) => dayToNumber[day]);
      if (repeatData.endSpec === "endBy") {
        const endSelectedDay = new Date(repeatData.endSelectedDay);
        const selectedDay = new Date(repeatData.selectedDay);
        // Calculate the difference in milliseconds
        const differenceInMilliseconds = endSelectedDay - selectedDay;
        // Convert milliseconds to days
        const millisecondsPerDay = 1000 * 60 * 60 * 24;

        const occurrences = differenceInMilliseconds / millisecondsPerDay + 1;
        let newDate = new Date(initialDate);
        let count = 0;
        let weekCount = 0;
        while (count < occurrences) {
          if (
            daysArray.includes(newDate.getDay()) &&
            (weekCount % repeatData.repeatWeeklyWeeks === 0 || weekCount === 0)
          ) {
            let entry = {
              user_id: data.user_id || "default_user_id",
              budgetName: data.name || "",
              date: formatDate(newDate, "DD MMM YYYY"), // Format date as 'YYYY-MM-DD'
              description: data.description || "",
              category: data.category || "",
              amount: Math.abs(data.amount) || 0,
              repeat_options: data.repeat_options || {},
              growth_options: data.growth_options || {},
              extras: data.extras || "",
            };
            dataToSave.push(entry);
          }
          count++;
          newDate.setDate(newDate.getDate() + 1);
          if ((newDate - initialDate) % 7 === 0) weekCount++;
        }

        if (dataToSave?.length > 0) await saveToDatabase(dataToSave);
      } else if (repeatData.endSpec === "endAfter") {
        if (repeatData.endAfterOccurrences > 0) {
          const occurrences = repeatData.endAfterOccurrences || 1;
          let newDate = new Date(initialDate);
          let count = 0;
          let weekCount = 0;
          while (count < occurrences) {
            if (
              daysArray.includes(newDate.getDay()) &&
              (weekCount % repeatData.repeatWeeklyWeeks === 0 ||
                weekCount === 0)
            ) {
              let entry = {
                user_id: data.user_id || "default_user_id",
                budgetName: data.name || "",
                date: formatDate(newDate, "DD MMM YYYY"), // Format date as 'YYYY-MM-DD'
                description: data.description || "",
                category: data.category || "",
                amount: Math.abs(data.amount) || 0,
                repeat_options: data.repeat_options || {},
                growth_options: data.growth_options || {},
                extras: data.extras || "",
              };
              dataToSave.push(entry);
              count++;
            }
            newDate.setDate(newDate.getDate() + 1);
            if ((newDate - initialDate) % 7 === 0) weekCount++;
          }
        }
        if (dataToSave?.length > 0) await saveToDatabase(dataToSave);
      } else if (repeatData.endSpec === "noEndDate") {
        const endSelectedDay = getFinancialYearEndDate(initialDate);
        const selectedDay = new Date(repeatData.selectedDay);
        // Calculate the difference in milliseconds
        const differenceInMilliseconds = endSelectedDay - selectedDay;
        // Convert milliseconds to days
        const millisecondsPerDay = 1000 * 60 * 60 * 24;
        const occurrences = differenceInMilliseconds / millisecondsPerDay + 1;

        let newDate = new Date(initialDate);
        let count = 0;
        let weekCount = 0;
        while (count < occurrences) {
          if (
            daysArray.includes(newDate.getDay()) &&
            (weekCount % repeatData.repeatWeeklyWeeks === 0 || weekCount === 0)
          ) {
            let entry = {
              user_id: data.user_id || "default_user_id",
              budgetName: data.name || "",
              date: formatDate(newDate, "DD MMM YYYY"), // Format date as 'YYYY-MM-DD'
              description: data.description || "",
              category: data.category || "",
              amount: Math.abs(data.amount) || 0,
              repeat_options: data.repeat_options || {},
              growth_options: data.growth_options || {},
              extras: data.extras || "",
            };
            dataToSave.push(entry);
          }
          count++;
          newDate.setDate(newDate.getDate() + 1);
          if ((newDate - initialDate) % 7 === 0) weekCount++;
        }

        if (dataToSave?.length > 0) await saveToDatabase(dataToSave);
      }
    } else if (repeatData.frequency === "monthly") {
      // Calculate monthly recurrence
      if (repeatData.repeatMonthly === "day") {
        if (repeatData.endSpec === "endBy") {
          let monthCount = 0;
          let currentMonth = selectedDay.getMonth();
          let currentYear = selectedDay.getFullYear();
          // let newDate = new Date(initialDate);
          let chkInCurrMonthDate = calcMonthlyDate(
            currentMonth,
            repeatData.monthFreqOption,
            repeatData.monthFreqOptionDay,
            currentYear
          );
          if (chkInCurrMonthDate < endSelectedDay)
            //tedtest what happens if the selected day is in the last month of the financial year?
            currentMonth = currentMonth + 1;
          while (selectedDay <= endSelectedDay) {
            // Calculate the offset from the start month
            if (monthCount % repeatData.numberOfMonths === 0) {
              // Determine the date for the current month
              let newDate = new Date(
                currentYear,
                currentMonth,
                repeatData.dayOfMonth
              );
              // Ensure the date is within valid bounds (e.g., February 30th would not be valid)
              if (
                newDate <= endSelectedDay &&
                newDate.getDate() === Number(repeatData.dayOfMonth)
              ) {
                let entry = {
                  user_id: data.user_id || "default_user_id",
                  budgetName: data.name || "",
                  date: formatDate(newDate, "DD MMM YYYY"),
                  description: data.description || "",
                  category: data.category || "",
                  amount: Math.abs(data.amount) || 0,
                  repeat_options: data.repeat_options || {},
                  growth_options: data.growth_options || {},
                  extras: data.extras || "",
                };
                dataToSave.push(entry);
              }
            }
            // Move to the next month
            currentMonth++;
            monthCount++;
            // Handle year transition
            if (currentMonth > 11) {
              currentMonth = 0;
              currentYear++;
            }
            // Set the selectedDay to the 1st of the next month for comparison
            selectedDay = new Date(currentYear, currentMonth, 1);
          }
          if (dataToSave?.length > 0) await saveToDatabase(dataToSave);
        } else if (repeatData.endSpec === "endAfter") {
          endSelectedDay = getFinancialYearEndDate(initialDate);
          const occurrences = repeatData.endAfterOccurrences || 1;
          let monthCount = 0;
          let count = 0;
          let currentMonth = selectedDay.getMonth();
          let currentYear = selectedDay.getFullYear();
          let chkInCurrMonthDate = calcMonthlyDate(
            currentMonth,
            repeatData.monthFreqOption,
            repeatData.monthFreqOptionDay,
            currentYear
          );
          if (chkInCurrMonthDate < endSelectedDay)
            //tedtest what happens if the selected day is in the last month of the financial year?
            currentMonth = currentMonth + 1;
          while (count < occurrences) {
            if (
              monthCount % repeatData.numberOfMonths === 0 ||
              monthCount === 0
            ) {
              let newDate = new Date(
                currentYear,
                currentMonth,
                repeatData.dayOfMonth
              );
              if (
                newDate <= endSelectedDay &&
                newDate.getDate() === Number(repeatData.dayOfMonth) // Ensure both are numbers
              ) {
                let entry = {
                  user_id: data.user_id || "default_user_id",
                  budgetName: data.name || "",
                  date: formatDate(newDate, "DD MMM YYYY"),
                  description: data.description || "",
                  category: data.category || "",
                  amount: Math.abs(data.amount) || 0,
                  repeat_options: data.repeat_options || {},
                  growth_options: data.growth_options || {},
                  extras: data.extras || "",
                };
                dataToSave.push(entry);
                count++;
              }
            }
            currentMonth++;
            monthCount++;
            // Handle year transition
            if (currentMonth > 11) {
              currentMonth = 0;
              currentYear++;
            }
          }
          if (dataToSave?.length > 0) await saveToDatabase(dataToSave);
        } else if (repeatData.endSpec === "noEndDate") {
          let monthCount = 0;
          let currentMonth = selectedDay.getMonth();
          let currentYear = selectedDay.getFullYear();
          endSelectedDay = getFinancialYearEndDate(initialDate);
          let chkInCurrMonthDate = calcMonthlyDate(
            currentMonth,
            repeatData.monthFreqOption,
            repeatData.monthFreqOptionDay,
            currentYear
          );
          if (chkInCurrMonthDate < endSelectedDay)
            //tedtest what happens if the selected day is in the last month of the financial year?
            currentMonth = currentMonth + 1;
          while (selectedDay <= endSelectedDay) {
            // Calculate the offset from the start month
            if (monthCount % repeatData.numberOfMonths === 0) {
              // Determine the date for the current month
              let newDate = new Date(
                currentYear,
                currentMonth,
                repeatData.dayOfMonth
              );
              // Ensure the date is within valid bounds (e.g., February 30th would not be valid)
              if (
                newDate <= endSelectedDay &&
                newDate.getDate() === Number(repeatData.dayOfMonth)
              ) {
                let entry = {
                  user_id: data.user_id || "default_user_id",
                  budgetName: data.name || "",
                  date: formatDate(newDate, "DD MMM YYYY"),
                  description: data.description || "",
                  category: data.category || "",
                  amount: Math.abs(data.amount) || 0,
                  repeat_options: data.repeat_options || {},
                  growth_options: data.growth_options || {},
                  extras: data.extras || "",
                };
                dataToSave.push(entry);
              }
            }
            // Move to the next month
            currentMonth++;
            monthCount++;
            // Handle year transition
            if (currentMonth > 11) {
              currentMonth = 0;
              currentYear++;
            }
            // Set the selectedDay to the 1st of the next month for comparison
            selectedDay = new Date(currentYear, currentMonth, 1);
          }
          if (dataToSave?.length > 0) await saveToDatabase(dataToSave);
        }
      } else if (repeatData.repeatMonthly === "the") {
        if (repeatData.endSpec === "endBy") {
          let currentMonth = selectedDay.getMonth();
          let currentYear = selectedDay.getFullYear();
          let chkInCurrMonthDate = calcMonthlyDate(
            currentMonth,
            repeatData.monthFreqOption,
            repeatData.monthFreqOptionDay,
            currentYear
          );
          if (chkInCurrMonthDate < endSelectedDay)
            //tedtest what happens if the selected day is in the last month of the financial year?
            currentMonth = currentMonth + 1;
          let endMonth;
          let endYear = endSelectedDay.getFullYear();
          if (endYear > currentYear) endMonth = 11;
          else endMonth = endSelectedDay.getMonth();
          let monthNo = 0;
          while (monthNo <= endMonth) {
            if (
              monthNo % repeatData.numberOfMonthsMonthly === 0 ||
              monthNo === 0
            ) {
              let transDate = calcMonthlyDate(
                currentMonth,
                repeatData.monthFreqOption,
                repeatData.monthFreqOptionDay,
                currentYear
              );
              let entry = {
                user_id: data.user_id || "default_user_id",
                budgetName: data.name || "",
                date: formatDate(transDate, "DD MMM YYYY"), // Format date as 'YYYY-MM-DD'
                description: data.description || "",
                category: data.category || "",
                amount: Math.abs(data.amount) || 0,
                repeat_options: data.repeat_options || {},
                growth_options: data.growth_options || {},
                extras: data.extras || "",
              };
              dataToSave.push(entry);
            }
            monthNo++;
            currentMonth++;
            // Handle year transition
            if (currentMonth > 11) {
              currentMonth = 0;
              currentYear++;
            }
          }
          if (dataToSave?.length > 0) await saveToDatabase(dataToSave);
        } else if (repeatData.endSpec === "endAfter") {
          endSelectedDay = getFinancialYearEndDate(initialDate);
          const occurrences = repeatData.endAfterOccurrences || 1;
          let monthCount = 0;
          let count = 0;
          let currentMonth = selectedDay.getMonth();
          let currentYear = selectedDay.getFullYear();
          while (count < occurrences) {
            if (
              monthCount % repeatData.numberOfMonthsMonthly === 0 ||
              monthCount === 0
            ) {
              let transDate = calcMonthlyDate(
                currentMonth,
                repeatData.monthFreqOption,
                repeatData.monthFreqOptionDay,
                currentYear
              );
              let entry = {
                user_id: data.user_id || "default_user_id",
                budgetName: data.name || "",
                date: formatDate(transDate, "DD MMM YYYY"),
                description: data.description || "",
                category: data.category || "",
                amount: Math.abs(data.amount) || 0,
                repeat_options: data.repeat_options || {},
                growth_options: data.growth_options || {},
                extras: data.extras || "",
              };
              dataToSave.push(entry);
              count++;
            }
            currentMonth++;
            monthCount++;
            // Handle year transition
            if (currentMonth > 11) {
              currentMonth = 0;
              currentYear++;
            }
          }
          if (dataToSave?.length > 0) await saveToDatabase(dataToSave);
        } else if (repeatData.endSpec === "noEndDate") {
          endSelectedDay = getFinancialYearEndDate(initialDate);
          let currentMonth = selectedDay.getMonth();
          let currentYear = selectedDay.getFullYear();
          let endYear = endSelectedDay.getFullYear();
          let endMonth;
          if (endYear > currentYear) endMonth = 11;
          else endMonth = endSelectedDay.getMonth();
          let monthNo = 0;
          while (monthNo <= endMonth) {
            if (
              monthNo % repeatData.numberOfMonthsMonthly === 0 ||
              monthNo === 0
            ) {
              let transDate = calcMonthlyDate(
                currentMonth,
                repeatData.monthFreqOption,
                repeatData.monthFreqOptionDay,
                currentYear
              );
              let entry = {
                user_id: data.user_id || "default_user_id",
                budgetName: data.name || "",
                date: formatDate(transDate, "DD MMM YYYY"), // Format date as 'YYYY-MM-DD'
                description: data.description || "",
                category: data.category || "",
                amount: Math.abs(data.amount) || 0,
                repeat_options: data.repeat_options || {},
                growth_options: data.growth_options || {},
                extras: data.extras || "",
              };
              dataToSave.push(entry);
            }
            monthNo++;
            currentMonth++;
            // Handle year transition
            if (currentMonth > 11) {
              currentMonth = 0;
              currentYear++;
            }
          }
          if (dataToSave?.length > 0) await saveToDatabase(dataToSave);
        }
      }
    } else if (repeatData.frequency === "yearly") {
      // Calculate yearly recurrence
      if (repeatData.yearlyOnDate === "onDate") {
        if (repeatData.endSpec === "endBy") {
          let entry = {
            user_id: data.user_id || "default_user_id",
            budgetName: data.name || "",
            date: formatDate(repeatData.yearlyRecurDate, "DD MMM YYYY"), // Format date as 'YYYY-MM-DD'
            description: data.description || "",
            category: data.category || "",
            amount: Math.abs(data.amount) || 0,
            repeat_options: data.repeat_options || {},
            growth_options: data.growth_options || {},
            extras: data.extras || "",
          };
          dataToSave.push(entry);
          if (dataToSave?.length > 0) await saveToDatabase(dataToSave);
        } else if (repeatData.endSpec === "endAfter") {
          let entry = {
            user_id: data.user_id || "default_user_id",
            budgetName: data.name || "",
            date: formatDate(repeatData.yearlyRecurDate, "DD MMM YYYY"), // Format date as 'YYYY-MM-DD'
            description: data.description || "",
            category: data.category || "",
            amount: Math.abs(data.amount) || 0,
            repeat_options: data.repeat_options || {},
            growth_options: data.growth_options || {},
            extras: data.extras || "",
          };
          dataToSave.push(entry);
          if (dataToSave?.length > 0) await saveToDatabase(dataToSave);
        } else if (repeatData.endSpec === "noEndDate") {
          let entry = {
            user_id: data.user_id || "default_user_id",
            budgetName: data.name || "",
            date: formatDate(repeatData.yearlyRecurDate, "DD MMM YYYY"), // Format date as 'YYYY-MM-DD'
            description: data.description || "",
            category: data.category || "",
            amount: Math.abs(data.amount) || 0,
            repeat_options: data.repeat_options || {},
            growth_options: data.growth_options || {},
            extras: data.extras || "",
          };
          dataToSave.push(entry);
          if (dataToSave?.length > 0) await saveToDatabase(dataToSave);
        }
      } else if (repeatData.yearlyOnDate === "onDay") {
        if (repeatData.endSpec === "endBy") {
          let currentYear = selectedDay.getFullYear();
          let transDate = calcYearlyDate(
            months.indexOf(repeatData.yearlyOnDayRecurMonth),
            repeatData.yearlyFreqOption,
            repeatData.yearlyFreqOptionDay,
            currentYear
          );
          let entry = {
            user_id: data.user_id || "default_user_id",
            budgetName: data.name || "",
            date: formatDate(transDate, "DD MMM YYYY"), // Format date as 'YYYY-MM-DD'
            description: data.description || "",
            category: data.category || "",
            amount: Math.abs(data.amount) || 0,
            repeat_options: data.repeat_options || {},
            growth_options: data.growth_options || {},
            extras: data.extras || "",
          };
          dataToSave.push(entry);
          if (dataToSave?.length > 0) await saveToDatabase(dataToSave);
        } else if (repeatData.endSpec === "endAfter") {
          let currentYear = selectedDay.getFullYear();
          let transDate = calcYearlyDate(
            months.indexOf(repeatData.yearlyOnDayRecurMonth),
            repeatData.yearlyFreqOption,
            repeatData.yearlyFreqOptionDay,
            currentYear
          );
          let entry = {
            user_id: data.user_id || "default_user_id",
            budgetName: data.name || "",
            date: formatDate(transDate, "DD MMM YYYY"), // Format date as 'YYYY-MM-DD'
            description: data.description || "",
            category: data.category || "",
            amount: Math.abs(data.amount) || 0,
            repeat_options: data.repeat_options || {},
            growth_options: data.growth_options || {},
            extras: data.extras || "",
          };
          dataToSave.push(entry);
          if (dataToSave?.length > 0) await saveToDatabase(dataToSave);
        } else if (repeatData.endSpec === "noEndDate") {
          let currentYear = selectedDay.getFullYear();
          let transDate = calcYearlyDate(
            months.indexOf(repeatData.yearlyOnDayRecurMonth),
            repeatData.yearlyFreqOption,
            repeatData.yearlyFreqOptionDay,
            currentYear
          );
          let entry = {
            user_id: data.user_id || "default_user_id",
            budgetName: data.name || "",
            date: formatDate(transDate, "DD MMM YYYY"), // Format date as 'YYYY-MM-DD'
            description: data.description || "",
            category: data.category || "",
            amount: Math.abs(data.amount) || 0,
            repeat_options: data.repeat_options || {},
            growth_options: data.growth_options || {},
            extras: data.extras || "",
          };
          dataToSave.push(entry);
          if (dataToSave?.length > 0) await saveToDatabase(dataToSave);
        }
      }
    }
    return repeatedData;
  };

  const saveToDatabase = async (data) => {
    await addBudgets(data);
    setAllBudgets((prevBudgets) => [...prevBudgets, ...data]);
  };

  return handleRecurrence;
};

export default useHandleRecurrence;
