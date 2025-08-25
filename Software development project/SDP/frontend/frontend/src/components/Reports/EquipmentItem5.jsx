import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  TableSortLabel,
  Chip,
  Box,
  FormControlLabel,
  Switch,
  Typography,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import axios from "axios";
import dayjs from "dayjs";

export function EquipmentItem5() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("duration_in_days");
  const [sortOrder, setSortOrder] = useState("desc");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [machineId, setMachineId] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [showZeroQty, setShowZeroQty] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8085/reports/getIncompleteRentals"
        );
        setData(response.data.response);
      } catch (error) {
        console.error("Error fetching incomplete rentals:", error);
      }
    };
    fetchData();
  }, []);

  const formatDate = (date) => dayjs(date).format("DD/MM/YYYY HH:mm");

  // Filtering logic
  const filteredData = data
    .filter((row) => {
      // Filter by search (equipment name or invoice id)
      const searchMatch =
        row.eq_name?.toLowerCase().includes(search.toLowerCase()) ||
        String(row.inv_id).includes(search);

      // Filter by machine ID (typed)
      const machineMatch = machineId
        ? String(row.eq_id).includes(machineId)
        : true;

      // Filter by invoice ID (typed)
      const invoiceMatch = invoiceId
        ? String(row.inv_id).includes(invoiceId)
        : true;

      // Filter by start/end date
      const date = dayjs(row.inv_createddate);
      const startMatch = startDate
        ? date.isAfter(dayjs(startDate).startOf("day")) ||
          date.isSame(dayjs(startDate).startOf("day"))
        : true;
      const endMatch = endDate
        ? date.isBefore(dayjs(endDate).endOf("day")) ||
          date.isSame(dayjs(endDate).endOf("day"))
        : true;

      // Calculate remaining quantity
      const remainingQty =
        Number(row.total_quantity) - Number(row.total_returned_quantity);

      // Show/hide zero quantity rows
      const qtyMatch = showZeroQty ? true : remainingQty > 0;

      return (
        searchMatch &&
        machineMatch &&
        invoiceMatch &&
        startMatch &&
        endMatch &&
        qtyMatch
      );
    });

  // Sort logic
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortOrder === "asc") {
      return a[sortBy] > b[sortBy] ? 1 : -1;
    }
    return a[sortBy] < b[sortBy] ? 1 : -1;
  });

  // Color decision for duration
  const getDurationColor = (days) => {
    if (days >= 30) return "error"; // Red
    if (days >= 7) return "warning"; // Yellow
    return "success"; // Green
  };

  // Color for not completed
  const getStatusChip = (status) =>
    status ? (
      <Chip label="Incomplete" color="error" size="small" />
    ) : (
      <Chip label="Completed" color="success" size="small" />
    );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Incomplete Equipment Rentals Report
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
          <TextField
            label="Search by Equipment Name or Invoice ID"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <TextField
            label="Filter by Machine ID"
            variant="outlined"
            size="small"
            value={machineId}
            onChange={(e) => setMachineId(e.target.value)}
          />
          <TextField
            label="Filter by Invoice ID"
            variant="outlined"
            size="small"
            value={invoiceId}
            onChange={(e) => setInvoiceId(e.target.value)}
          />
          <DatePicker
            label="Filter by Start Date"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            slotProps={{ textField: { size: "small" } }}
          />
          <DatePicker
            label="Filter by End Date"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            slotProps={{ textField: { size: "small" } }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={showZeroQty}
                onChange={(e) => setShowZeroQty(e.target.checked)}
                color="primary"
              />
            }
            label="Show rows with 0 Remaining Quantity"
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Chip
            label="Green: Returned within 7 days"
            color="success"
            sx={{ mr: 1 }}
          />
          <Chip
            label="Red: Overdue (30+ days)"
            color="error"
            sx={{ mr: 1 }}
          />
          <Chip
            label="Yellow: Overdue (7-29 days)"
            color="warning"
          />
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "eq_id"}
                    direction={sortOrder}
                    onClick={() => {
                      setSortBy("eq_id");
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    }}
                  >
                    Equipment ID
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "eq_name"}
                    direction={sortOrder}
                    onClick={() => {
                      setSortBy("eq_name");
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    }}
                  >
                    Equipment Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>Category</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "inv_id"}
                    direction={sortOrder}
                    onClick={() => {
                      setSortBy("inv_id");
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    }}
                  >
                    Invoice ID
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "inv_createddate"}
                    direction={sortOrder}
                    onClick={() => {
                      setSortBy("inv_createddate");
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    }}
                  >
                    Invoice Created Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "total_quantity"}
                    direction={sortOrder}
                    onClick={() => {
                      setSortBy("total_quantity");
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    }}
                  >
                    Remaining Quantity to Return
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "duration_in_days"}
                    direction={sortOrder}
                    onClick={() => {
                      setSortBy("duration_in_days");
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    }}
                  >
                    Duration in Days
                  </TableSortLabel>
                </TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((row, idx) => {
                const remainingQty =
                  Number(row.total_quantity) - Number(row.total_returned_quantity);
                return (
                  <TableRow
                    key={idx}
                    sx={{
                      backgroundColor:
                        row.duration_in_days >= 30
                          ? "#ffeaea"
                          : row.duration_in_days >= 7
                          ? "#fffbe6"
                          : "#eaffea",
                    }}
                  >
                    <TableCell>{row.eq_id}</TableCell>
                    <TableCell>{row.eq_name}</TableCell>
                    <TableCell>{row.eq_category}</TableCell>
                    <TableCell>{row.inv_id}</TableCell>
                    <TableCell>{formatDate(row.inv_createddate)}</TableCell>
                    <TableCell>{remainingQty}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.duration_in_days}
                        color={getDurationColor(row.duration_in_days)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{getStatusChip(row.not_completed)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </LocalizationProvider>
  );
}