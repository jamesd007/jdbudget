// ChartComponent.js
import React from "react";
import { Bar } from "react-chartjs-2";
// import useTransactions from "./useTransactions";
// import processData from "./processData";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ChartComponent = ({ data, selectedCategory }) => {
  const categoryData = data.find((item) => item.category === selectedCategory);

  if (!categoryData) {
    return <p>No data available for the selected category.</p>;
  }

  const labels = Object.keys(categoryData).filter(
    (key) => key !== "category" && key !== "totalAmount"
  );
  const values = labels.map((label) => categoryData[label]);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: selectedCategory,
        data: values,
        backgroundColor: "rgba(75, 192, 192, 0.4)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default ChartComponent;

// const ChartComponent = () => {
//     const months=['Mar','Apr','May']
//   const transactions = useTransactions();
//   const dataByCategoryAndMonth = processData(transactions);

// const chartData = {
//   labels: dataByCategoryAndMonth[0].data.map((d) => d.month),
//   datasets: dataByCategoryAndMonth.map((categoryData) => ({
//     label: categoryData.category,
//     data: categoryData.data.map((d) => d.total),
//     backgroundColor: "rgba(75,192,192,0.4)",
//     borderColor: "rgba(75,192,192,1)",
//     borderWidth: 1,
//   })),
// };
//   const options = {
//     scales: {
//       y: {
//         beginAtZero: true,
//       },
//     },
//   };

//   return;
<>{/* // <Bar data={chartData} options={options} />; */}</>;
// };

// export default ChartComponent;
