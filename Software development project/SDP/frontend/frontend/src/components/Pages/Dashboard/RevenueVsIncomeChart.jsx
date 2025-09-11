import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Paper, Box, Typography } from "@mui/material";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler);

function groupByDay(rows) {
  const map = new Map();
  for (const r of rows) {
    const d = (r.inv_createddate || "").slice(0, 10);
    if (!d) continue;
    const prev = map.get(d) || { revenue: 0, income: 0, discount: 0 };
    prev.revenue += Number(r.total_revenue || 0);
    prev.income += Number(r.total_income || 0);
    prev.discount += Number(r.discount || 0);
    map.set(d, prev);
  }
  const sorted = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  return sorted.map(([date, v]) => ({ date, ...v }));
}

export default function RevenueVsIncomeChart({ startDate, endDate }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    axios
      .get("http://localhost:8085/reports/getCombinedInvoiceReports", { params })
      .then((res) => setRows(res.data.response || []))
      .catch(() => setRows([]));
  }, [startDate, endDate]);

  const dataByDay = useMemo(() => groupByDay(rows), [rows]);

  const data = {
    labels: dataByDay.map((r) => r.date),
    datasets: [
      {
        label: "Cash Collected",
        data: dataByDay.map((r) => r.revenue),
        borderWidth: 2,
        tension: 0.25,
      },
      {
        label: "Billed (Net)",
        data: dataByDay.map((r) => r.income - r.discount),
        borderWidth: 2,
        tension: 0.25,
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { position: "top" },
      tooltip: { callbacks: {
        label: (ctx) => `Rs. ${Number(ctx.raw).toLocaleString()}`
      } },
    },
    scales: {
      y: { ticks: { callback: (v) => `Rs. ${Number(v).toLocaleString()}` } },
    },
  };

  return (
    <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
        Revenue vs. Billed (Net)
      </Typography>
      <Box sx={{ height: 300 }}>
        <Line data={data} options={options} />
      </Box>
    </Paper>
  );
}