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
  Title,
} from "chart.js";
import { Paper, Box, Typography } from "@mui/material";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

export default function Chart4() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEquipmentData = async () => {
      try {
        const res = await axios.get("http://localhost:8085/equipment");
        const equipmentData = res.data || [];
        const defected = equipmentData
          .filter((e) => e.eq_defected_status != 0)
          .slice(0, 10);
        const labels = defected.map((e) => `ID: ${e.eq_id}`);
        const data = defected.map((e) => Number(e.eq_defected_status || 0));
        setChartData({
          labels,
          datasets: [
            {
              label: "Defects",
              data,
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
            },
          ],
        });
      } catch {
        setChartData({ labels: [], datasets: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchEquipmentData();
  }, []);

  if (loading) return <Paper sx={{ p: 2, borderRadius: 2 }}>Loading…</Paper>;

  return (
    <Paper elevation={0} sx={{ p: 0, height: "100%" }}>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
        Top Defective Equipment (Top 10)
      </Typography>
      <Box sx={{ height: 300 }}>
        <Bar
          data={chartData}
          options={{
            indexAxis: "y",
            responsive: true,
            plugins: { legend: { position: "right" } },
          }}
        />
      </Box>
    </Paper>
  );
}