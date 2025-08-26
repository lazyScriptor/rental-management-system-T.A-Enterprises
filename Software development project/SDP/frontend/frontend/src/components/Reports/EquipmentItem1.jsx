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
  Typography,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import axios from "axios";
import dayjs from "dayjs";

function EquipmentItem1() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("total_rentals");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showUnderutilized, setShowUnderutilized] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const start = startDate ? startDate.toISOString() : new Date(0).toISOString();
        const end = endDate ? endDate.toISOString() : new Date().toISOString();

        let url = "http://localhost:8085/reports/getEquipmentUtilizationDetails";
        let params = { startDate: start, endDate: end };

        // If underutilized filter is ON, call underutilized endpoint
        if (showUnderutilized) {
          url = "http://localhost:8085/reports/getUnderutilizedEquipment";
        }

        const response = await axios.get(url, { params });
        setData(response.data.response || []);
      } catch (error) {
        console.error("Error fetching equipment utilization data:", error);
      }
    };

    fetchData();
  }, [startDate, endDate, showUnderutilized]);

  // Filtering by equipment name or ID
  const filteredData = data.filter(
    (row) =>
      row.eq_name?.toLowerCase().includes(search.toLowerCase()) ||
      String(row.eq_id).includes(search)
  );

  // Sorting logic
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortOrder === "asc") {
      return a[sortBy] > b[sortBy] ? 1 : -1;
    }
    return a[sortBy] < b[sortBy] ? 1 : -1;
  });

  // Color logic for utilization
  const getUtilizationColor = (rentals) => {
    if (rentals >= 20) return "success"; // High utilization
    if (rentals >= 10) return "warning"; // Medium
    return "error"; // Low utilization
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Equipment Utilization Report
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
          <TextField
            label="Search by Equipment Name or ID"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <DateTimePicker
            label="Start Date"
            value={startDate}
            onChange={(date) => setStartDate(date)}
            slotProps={{ textField: { size: "small" } }}
          />
          <DateTimePicker
            label="End Date"
            value={endDate}
            onChange={(date) => setEndDate(date)}
            slotProps={{ textField: { size: "small" } }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={showUnderutilized}
                onChange={(e) => setShowUnderutilized(e.target.checked)}
                color="error"
              />
            }
            label="Show Only Underutilized Equipment"
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Chip label="Green: Highly Utilized (20+ rentals)" color="success" sx={{ mr: 1 }} />
          <Chip label="Yellow: Moderately Utilized (10-19 rentals)" color="warning" sx={{ mr: 1 }} />
          <Chip label="Red: Underutilized (<10 rentals)" color="error" />
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
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "total_rentals"}
                    direction={sortOrder}
                    onClick={() => {
                      setSortBy("total_rentals");
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    }}
                  >
                    Total Rentals
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "total_rental_days"}
                    direction={sortOrder}
                    onClick={() => {
                      setSortBy("total_rental_days");
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    }}
                  >
                    Total Rental Days
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "average_rental_duration"}
                    direction={sortOrder}
                    onClick={() => {
                      setSortBy("average_rental_duration");
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    }}
                  >
                    Average Rental Duration
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((row) => (
                <TableRow
                  key={row.eq_id}
                  sx={{
                    backgroundColor:
                      getUtilizationColor(row.total_rentals) === "success"
                        ? "#eaffea"
                        : getUtilizationColor(row.total_rentals) === "warning"
                        ? "#fffbe6"
                        : "#ffeaea",
                  }}
                >
                  <TableCell>{row.eq_id}</TableCell>
                  <TableCell>{row.eq_name}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.total_rentals}
                      color={getUtilizationColor(row.total_rentals)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{row.total_rental_days}</TableCell>
                  <TableCell>{Number(row.average_rental_duration).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </LocalizationProvider>
  );
}

export default EquipmentItem1;