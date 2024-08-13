// src/hooks/useHandleRecurrence.js

import { useCallback, useEffect } from "react";
import dayjs from "dayjs";
import { addBudgets } from "../store/Dexie";

const useHandleRecurrence = (setAllBudgets) => {
  const dayToNumber = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
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

  const getDayOfWeek = (date) => {
    return dayjs(date).format("ddd");
  };

  // const formatDate = (date, format) => {
  //   return dayjs(date).format(format);
  // };

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
    if (repeatData.frequency === "daily") {
      // Calculate daily recurrence
      if (repeatData.repeatFreq === "everyDay") {
        if (repeatData.endSpec === "endBy") {
          const endSelectedDay = new Date(repeatData.endSelectedDay);
          const selectedDay = new Date(repeatData.selectedDay);
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
          await saveToDatabase(dataToSave);
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
          const endSelectedDay = getFinancialYearEndDate(initialDate);
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
          const endSelectedDay = new Date(repeatData.endSelectedDay);
          const selectedDay = new Date(repeatData.selectedDay);
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
          const endSelectedDay = getFinancialYearEndDate(initialDate);
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
        // const selectedDay = new Date(repeatData.selectedDay);
        // const endSelectedDay = getFinancialYearEndDate(initialDate);
        // let weeksToRepeat = parseFloat(repeatData.repeatWeeklyWeeks);
        // let weekCounter = 0;
        // // Keep the starting day of the week for reference
        // const startDayOfWeek = selectedDay.getDay();
        // for (
        //   let d = selectedDay;
        //   d <= endSelectedDay;
        //   d.setDate(d.getDate() + 7)
        // ) {
        //   weekCounter++;
        //   // Only repeat on the selected weeks
        //   if (weekCounter % weeksToRepeat === 0) {
        //     // Iterate over each day in daysArray for the current week
        //     for (let i = 0; i < daysArray.length; i++) {
        //       const dayOffset = (daysArray[i] - startDayOfWeek + 7) % 7; // Calculate the day offset
        //       const transactionDate = new Date(d);
        //       transactionDate.setDate(d.getDate() + dayOffset);

        //       // Ensure the transactionDate is within the end date
        //       if (transactionDate <= endSelectedDay) {
        //         let entry = {
        //           user_id: data.user_id || "default_user_id",
        //           budgetName: data.name || "",
        //           date: formatDate(transactionDate, "DD MMM YYYY"), // Format date as 'YYYY-MM-DD'
        //           description: data.description || "",
        //           category: data.category || "",
        //           amount: Math.abs(data.amount) || 0,
        //           repeat_options: data.repeat_options || {},
        //           growth_options: data.growth_options || {},
        //           extras: data.extras || "",
        //         };
        //         dataToSave.push(entry);
        //       }
        //     }
        //   }
        // }
        // if (dataToSave?.length > 0) await saveToDatabase(dataToSave);
      }
    } else if (repeatData.frequency === "monthly") {
      // Calculate monthly recurrence
    } else if (repeatData.frequency === "yearly") {
      // Calculate yearly recurrence
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
