import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Paper, Box, Typography } from "@mui/material";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function EquipmentUtilizationBar({ startDate, endDate }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const params = {};
    if (startDate) params.startDate = new Date(startDate).toISOString();
    if (endDate) params.endDate = new Date(endDate).toISOString();
    axios
      .get("http://localhost:8085/reports/getEquipmentUtilizationDetails", { params })
      .then((res) => setRows(res.data.response || []))
      .catch(() => setRows([]));
  }, [startDate, endDate]);

  const labels = rows.map((r) => r.eq_name);
  const data = {
    labels,
    datasets: [
      { label: "Total Rentals", data: rows.map((r) => Number(r.total_rentals || 0)), borderWidth: 1 },
      { label: "Total Rental Days", data: rows.map((r) => Number(r.total_rental_days || 0)), borderWidth: 1 },
    ],
  };
  const options = {
    responsive: true,
    plugins: { legend: { position: "top" } },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
        Equipment Utilization
      </Typography>
      <Box sx={{ height: 300 }}>
        <Bar data={data} options={options} />
      </Box>
    </Paper>
  );
}