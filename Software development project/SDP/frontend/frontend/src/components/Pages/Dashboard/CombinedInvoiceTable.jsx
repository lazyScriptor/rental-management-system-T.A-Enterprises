import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Chip, Stack, Tooltip,
} from "@mui/material";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

export default function CombinedInvoiceTable({ startDate, endDate }) {
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

  const totals = useMemo(() => {
    let income = 0, discount = 0, collected = 0;
    for (const r of rows) {
      income += Number(r.total_income || 0);
      discount += Number(r.discount || 0);
      collected += Number(r.total_revenue || 0);
    }
    return { income, discount, net: income - discount, collected };
  }, [rows]);

  return (
    <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
        Invoices (Summary)
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 1 }} flexWrap="wrap">
        <Chip icon={<ReceiptLongOutlinedIcon />} label={`Billed: Rs. ${totals.net.toLocaleString()}`} />
        <Chip icon={<PaidOutlinedIcon />} color="success" label={`Collected: Rs. ${totals.collected.toLocaleString()}`} variant="outlined" />
        <Chip label={`Discounts: Rs. ${totals.discount.toLocaleString()}`} variant="outlined" />
      </Stack>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Invoice</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell align="right">Billed (Net)</TableCell>
              <TableCell align="right">Collected</TableCell>
              <TableCell align="right">Discount</TableCell>
              <TableCell align="center">Created</TableCell>
              <TableCell align="center">Completed</TableCell>
              <TableCell align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => {
              const billedNet = Number(r.total_income || 0) - Number(r.discount || 0);
              const completed = !!r.inv_completed_datetime;
              return (
                <TableRow key={r.invoice_id}>
                  <TableCell>#{r.invoice_id}</TableCell>
                  <TableCell>{r.customer_name || "—"}</TableCell>
                  <TableCell align="right">Rs. {billedNet.toLocaleString()}</TableCell>
                  <TableCell align="right">Rs. {Number(r.total_revenue || 0).toLocaleString()}</TableCell>
                  <TableCell align="right">Rs. {Number(r.discount || 0).toLocaleString()}</TableCell>
                  <TableCell align="center">
                    <Tooltip title={new Date(r.inv_createddate).toLocaleString()}>
                      <span>{new Date(r.inv_createddate).toLocaleDateString()}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    {r.inv_completed_datetime ? (
                      <Tooltip title={new Date(r.inv_completed_datetime).toLocaleString()}>
                        <span>{new Date(r.inv_completed_datetime).toLocaleDateString()}</span>
                      </Tooltip>
                    ) : "—"}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={completed ? "Completed" : "Open"}
                      color={completed ? "success" : "warning"}
                      variant={completed ? "filled" : "outlined"}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ color: "text.secondary" }}>
                  No invoices in the selected period.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}