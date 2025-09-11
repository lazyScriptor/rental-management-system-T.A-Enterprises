// frontend/src/components/Pages/Dashboard/RevenueTrend.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import { Line } from "react-chartjs-2";
import axios from "axios";
import dayjs from "dayjs";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

export default function RevenueTrend() {
  const [dataRows, setDataRows] = useState([]);
  const [start, setStart] = useState(dayjs().startOf("month").format("YYYY-MM-DD"));
  const [end, setEnd] = useState(dayjs().format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(false);

  const fetchData = async (s, e) => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8085/reports/getCombinedInvoiceReports", {
        params: { start_date: s, end_date: e },
      });
      setDataRows(res?.data?.response || []);
    } catch (e) {
      setDataRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(start, end);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grouped = useMemo(() => {
    const map = {};
    dataRows.forEach((r) => {
      const d = dayjs(r.inv_createddate).format("YYYY-MM-DD");
      const net = (Number(r.total_income || 0) - Number(r.discount || 0));
      map[d] = (map[d] || 0) + net;
    });
    const dates = Object.keys(map).sort();
    return { dates, values: dates.map((d) => map[d]) };
  }, [dataRows]);

  const chartData = {
    labels: grouped.dates,
    datasets: [
      {
        label: "Net Revenue",
        data: grouped.values,
        borderWidth: 2,
        tension: 0.25,
      },
    ],
  };

  const reload = () => {
    const s = start || dayjs().startOf("month").format("YYYY-MM-DD");
    const e = end || dayjs().format("YYYY-MM-DD");
    fetchData(s, e);
  };

  return (
    <Paper elevation={2} sx={{ p: 2, borderRadius: 2, minWidth: 420 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Revenue Trend
        </Typography>
        <Box flexGrow={1} />
        <TextField
          size="small"
          type="date"
          label="Start"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          size="small"
          type="date"
          label="End"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button onClick={reload} variant="outlined" disabled={loading}>
          Apply
        </Button>
      </Stack>
      <Box sx={{ height: 300 }}>
        <Line data={chartData} options={{ responsive: true, plugins: { legend: { position: "top" }}}} />
      </Box>
    </Paper>
  );
}