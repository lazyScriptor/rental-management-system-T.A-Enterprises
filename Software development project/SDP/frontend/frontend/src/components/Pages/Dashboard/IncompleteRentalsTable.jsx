import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Typography, Tooltip
} from "@mui/material";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";

export default function IncompleteRentalsTable() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8085/reports/getIncompleteRentals")
      .then((res) => setRows(res.data.response || []))
      .catch(() => setRows([]));
  }, []);

  return (
    <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
        Open Rentals (by Invoice & Equipment)
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Invoice</TableCell>
              <TableCell>Equipment</TableCell>
              <TableCell align="right">Borrowed</TableCell>
              <TableCell align="right">Returned</TableCell>
              <TableCell align="center">Days Open</TableCell>
              <TableCell align="center">Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r, idx) => (
              <TableRow key={`${r.inv_id}-${r.eq_id}-${idx}`}>
                <TableCell>#{r.inv_id}</TableCell>
                <TableCell>{r.eq_name}</TableCell>
                <TableCell align="right">{r.total_quantity}</TableCell>
                <TableCell align="right">{r.total_returned_quantity}</TableCell>
                <TableCell align="center">
                  <Chip
                    size="small"
                    label={`${r.duration_in_days}d`}
                    icon={<AccessTimeOutlinedIcon />}
                    variant="outlined"
                    color="warning"
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title={new Date(r.inv_createddate).toLocaleString()}>
                    <span>{new Date(r.inv_createddate).toLocaleDateString()}</span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ color: "text.secondary" }}>
                  All rentals are complete. 🎉
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}