import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { Paper, Box, Typography } from "@mui/material";
import Chart from "chart.js/auto";

export default function Chart3({ startDate, endDate }) {
  const [rows, setRows] = useState([]);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    axios
      .get("http://localhost:8085/reports/getCombinedInvoiceReports", { params })
      .then((res) => setRows(res?.data?.response || []))
      .catch(() => setRows([]));
  }, [startDate, endDate]);

  const grouped = useMemo(() => {
    const acc = {};
    rows.forEach((r) => {
      const d = new Date(r.inv_createddate).toLocaleDateString();
      acc[d] = acc[d] || { revenue: 0, income: 0 };
      acc[d].revenue += Number(r.total_revenue || 0);
      acc[d].income += Number(r.total_income || 0);
    });
    const dates = Object.keys(acc);
    return {
      dates,
      revenues: dates.map((d) => acc[d].revenue),
      incomes: dates.map((d) => acc[d].income),
    };
  }, [rows]);

  useEffect(() => {
    if (chartInstance.current) chartInstance.current.destroy();
    if (!grouped.dates.length || !chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");
    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: grouped.dates,
        datasets: [
          {
            label: "Total Revenue",
            data: grouped.revenues,
            backgroundColor: "rgba(99, 132, 255, 0.2)",
            borderColor: "rgba(99, 132, 255, 1)",
            borderWidth: 1,
          },
          {
            label: "Total Income",
            data: grouped.incomes,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: { title: { display: true, text: "Date" } },
          y: { beginAtZero: true, title: { display: true, text: "Amount (LKR)" } },
        },
      },
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [grouped]);

  const today = new Date().toLocaleDateString();
  const todaysRevenue = rows
    .filter((r) => new Date(r.inv_createddate).toLocaleDateString() === today)
    .reduce((acc, r) => acc + Number(r.total_revenue || 0), 0);

  return (
    <Paper elevation={0} sx={{ p: 0, height: "100%" }}>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
        Revenue vs Income (by Day)
      </Typography>
      <Box sx={{ height: 300 }}>
        <canvas ref={chartRef} />
      </Box>
      <Typography variant="caption" color="text.secondary">
        Today: Rs. {todaysRevenue.toLocaleString()}
      </Typography>
    </Paper>
  );
}