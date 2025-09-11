// frontend/src/components/Pages/Dashboard/OverdueReturns.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Tooltip,
} from "@mui/material";
import axios from "axios";

export default function OverdueReturns() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get("http://localhost:8085/reports/getIncompleteRentals");
        if (mounted) setRows(res?.data?.response || []);
      } catch (e) {
        if (mounted) setRows([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const prepared = rows
    .map((r) => ({
      eq_name: r.eq_name,
      invoice_id: r.inv_id,
      days: Number(r.duration_in_days || 0),
      outstanding: Math.max(0, Number(r.total_quantity || 0) - Number(r.total_returned_quantity || 0)),
    }))
    .filter((r) => r.outstanding > 0)
    .sort((a, b) => b.days - a.days)
    .slice(0, 15);

  return (
    <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
      <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Not Returned (Top 15 by Days)
        </Typography>
      </Stack>
      <TableContainer>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Invoice</TableCell>
              <TableCell>Equipment</TableCell>
              <TableCell align="right">Outstanding Qty</TableCell>
              <TableCell align="right">Days Open</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prepared.map((r, idx) => (
              <TableRow key={`${r.invoice_id}-${idx}`}>
                <TableCell>#{r.invoice_id}</TableCell>
                <TableCell>{r.eq_name}</TableCell>
                <TableCell align="right">{r.outstanding}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Days since invoice created (backend report)">
                    <span>{r.days}</span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {prepared.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  All items are returned. 🎉
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}