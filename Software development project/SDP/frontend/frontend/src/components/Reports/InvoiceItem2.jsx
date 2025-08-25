import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Chip,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import axios from "axios";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import TablePagination from "@mui/material/TablePagination";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const rowsPerPageOptions = [5, 10, 25];

function InvoiceItem2() {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showIncomplete, setShowIncomplete] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [invoiceIdSearch, setInvoiceIdSearch] = useState("");

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8085/reports/getCombinedInvoiceReports"
      );
      if (response.data.status) {
        let filteredData = response.data.response.filter(
          (row) =>
            row.customer_name &&
            (!startDate || dayjs(row.inv_createddate).isSameOrAfter(startDate)) &&
            (!endDate || dayjs(row.inv_createddate).isSameOrBefore(endDate))
        );
        if (showIncomplete) {
          filteredData = filteredData.filter(
            (row) => !row.inv_completed_datetime
          );
        }
        // Additional filtering by customer name and invoice id
        filteredData = filteredData.filter(
          (row) =>
            row.customer_name.toLowerCase().includes(customerSearch.toLowerCase()) &&
            String(row.invoice_id).includes(invoiceIdSearch)
        );
        setData(filteredData);
      } else {
        console.log("Failed to retrieve data");
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [startDate, endDate, showIncomplete, customerSearch, invoiceIdSearch]);

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    setShowIncomplete(false);
    setCustomerSearch("");
    setInvoiceIdSearch("");
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Invoice Reports
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Chip
          label="Green: Completed Invoice"
          color="success"
          sx={{ mr: 1 }}
        />
        <Chip
          label="Orange: Incomplete Invoice"
          color="warning"
          sx={{ mr: 1 }}
        />
      </Box>
      <Box
        display="flex"
        justifyContent="start"
        alignItems="center"
        mb={2}
        gap={2}
        flexWrap="wrap"
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            label="Filter by Start Date & Time"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            renderInput={(params) => <TextField {...params} size="small" />}
          />
          <DateTimePicker
            label="Filter by End Date & Time"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            renderInput={(params) => <TextField {...params} size="small" />}
          />
        </LocalizationProvider>
        <TextField
          label="Search by Customer Name"
          variant="outlined"
          size="small"
          value={customerSearch}
          onChange={(e) => setCustomerSearch(e.target.value)}
        />
        <TextField
          label="Search by Invoice ID"
          variant="outlined"
          size="small"
          value={invoiceIdSearch}
          onChange={(e) => setInvoiceIdSearch(e.target.value)}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={showIncomplete}
              onChange={(e) => setShowIncomplete(e.target.checked)}
              color="warning"
            />
          }
          label="Show Only Incomplete Invoices"
        />
        <Button variant="contained" color="error" onClick={handleClear}>
          Clear Filters
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Invoice ID</TableCell>
              <TableCell align="center">Customer Name</TableCell>
              <TableCell align="center">Created Date</TableCell>
              <TableCell align="center">Total Payments Done (LKR)</TableCell>
              <TableCell align="center">Invoice Total Amount (LKR)</TableCell>
              <TableCell align="center">Completed Date & Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : data
            ).map((row, index) => (
              <TableRow
                key={index}
                sx={{
                  backgroundColor: !row.inv_completed_datetime
                    ? "#FFF3E0" // light orange for incomplete
                    : "#E8F5E9", // light green for completed
                }}
              >
                <TableCell align="center">{row.invoice_id}</TableCell>
                <TableCell align="center">{row.customer_name}</TableCell>
                <TableCell align="center">
                  {dayjs(row.inv_createddate).format("YYYY-MM-DD HH:mm:ss")}
                </TableCell>
                <TableCell align="center">{row.total_revenue}</TableCell>
                <TableCell align="center">{row.total_income}</TableCell>
                <TableCell align="center">
                  {row.inv_completed_datetime
                    ? dayjs(row.inv_completed_datetime).format("YYYY-MM-DD HH:mm:ss")
                    : "In Progress"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
}

export default InvoiceItem2;