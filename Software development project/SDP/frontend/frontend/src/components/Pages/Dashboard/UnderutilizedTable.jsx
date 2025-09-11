import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Typography
} from "@mui/material";
import LowPriorityOutlinedIcon from "@mui/icons-material/LowPriorityOutlined";

export default function UnderutilizedTable({ startDate, endDate }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const params = {};
    if (startDate) params.startDate = new Date(startDate).toISOString();
    if (endDate) params.endDate = new Date(endDate).toISOString();
    axios
      .get("http://localhost:8085/reports/getUnderutilizedEquipment", { params })
      .then((res) => setRows(res.data.response || []))
      .catch(() => setRows([]));
  }, [startDate, endDate]);

  return (
    <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
        Underutilized Equipment
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Equipment</TableCell>
              <TableCell align="right">Total Rentals</TableCell>
              <TableCell align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.eq_id}>
                <TableCell>{r.eq_name}</TableCell>
                <TableCell align="right">{r.total_rentals}</TableCell>
                <TableCell align="center">
                  <Chip
                    icon={<LowPriorityOutlinedIcon />}
                    size="small"
                    label="Low activity"
                    color="warning"
                    variant="outlined"
                  />
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ color: "text.secondary" }}>
                  No underutilized items in the selected range.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}