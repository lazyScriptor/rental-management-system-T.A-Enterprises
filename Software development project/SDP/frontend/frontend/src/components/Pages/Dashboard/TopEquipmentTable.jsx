// frontend/src/components/Pages/Dashboard/TopEquipmentTable.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";

const fmtLKR = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 0,
});

export default function TopEquipmentTable() {
  const [start, setStart] = useState(dayjs().startOf("month").format("YYYY-MM-DD"));
  const [end, setEnd] = useState(dayjs().format("YYYY-MM-DD"));
  const [revRows, setRevRows] = useState([]);
  const [rentRows, setRentRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBoth = async () => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([
        axios.get("http://localhost:8085/reports/getEquipmentRevenueDetails", {
          params: { startDate: start, endDate: end },
        }),
        axios.get("http://localhost:8085/reports/getEquipmentRentalDetails", {
          params: { startDate: start, endDate: end },
        }),
      ]);
      setRevRows(r1?.data?.response || []);
      setRentRows(r2?.data?.response || []);
    } catch (e) {
      setRevRows([]);
      setRentRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const merged = useMemo(() => {
    const byId = new Map();
    rentRows.forEach((r) => {
      byId.set(r.eq_id, {
        eq_id: r.eq_id,
        eq_name: r.eq_name,
        total_rental_days: Number(r.total_rental_days || 0),
        total_rentals: Number(r.total_rentals || 0),
        total_revenue: 0,
      });
    });
    revRows.forEach((r) => {
      const cur = byId.get(r.eq_id) || {
        eq_id: r.eq_id,
        eq_name: r.eq_name,
        total_rental_days: 0,
        total_rentals: 0,
        total_revenue: 0,
      };
      cur.total_revenue = Number(r.total_revenue || 0);
      byId.set(r.eq_id, cur);
    });
    return Array.from(byId.values()).sort((a, b) => b.total_revenue - a.total_revenue).slice(0, 10);
  }, [revRows, rentRows]);

  return (
    <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Top Equipment (by Revenue)
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
        <Button onClick={fetchBoth} variant="outlined" disabled={loading}>
          Apply
        </Button>
      </Stack>

      <TableContainer>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="left">Equipment</TableCell>
              <TableCell align="right">Revenue</TableCell>
              <TableCell align="right">Rental Days</TableCell>
              <TableCell align="right">Rentals</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {merged.map((r) => (
              <TableRow key={r.eq_id}>
                <TableCell>{r.eq_name}</TableCell>
                <TableCell align="right">{fmtLKR.format(r.total_revenue)}</TableCell>
                <TableCell align="right">{r.total_rental_days}</TableCell>
                <TableCell align="right">{r.total_rentals}</TableCell>
              </TableRow>
            ))}
            {merged.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No data for the selected range
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}