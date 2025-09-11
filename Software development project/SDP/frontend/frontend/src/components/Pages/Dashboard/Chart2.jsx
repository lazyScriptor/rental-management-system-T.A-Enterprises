import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Paper, Box, Typography } from "@mui/material";
import Chart from "chart.js/auto";

export default function Chart2({ startDate, endDate }) {
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

  useEffect(() => {
    if (chartInstance.current) chartInstance.current.destroy();
    if (!rows.length || !chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");
    const labels = rows.map((r) => `#${r.invoice_id}`);
    const data = rows.map((r) => Number(r.total_income || 0));

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Total Income",
            data,
            fill: false,
            borderWidth: 2,
            tension: 0.25,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: { ticks: { maxTicksLimit: 12 }, title: { display: true, text: "Invoice" } },
          y: { beginAtZero: true, title: { display: true, text: "Amount (LKR)" } },
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: (items) => {
                const idx = items[0].dataIndex;
                const d = rows[idx]?.inv_createddate;
                return `Created: ${d ? new Date(d).toLocaleString() : ""}`;
              },
              label: (item) => `Income: Rs. ${Number(item.raw).toLocaleString()}`,
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [rows]);

  return (
    <Paper elevation={0} sx={{ p: 0, height: "100%" }}>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
        Income by Invoice
      </Typography>
      <Box sx={{ height: 300 }}>
        <canvas ref={chartRef} />
      </Box>
    </Paper>
  );
}