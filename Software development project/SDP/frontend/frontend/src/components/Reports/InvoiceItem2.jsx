import React, { useEffect, useMemo, useState, useCallback } from "react";
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
  Typography,
  TableSortLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Chip,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import TablePagination from "@mui/material/TablePagination";
import axios from "axios";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const rowsPerPageOptions = [10, 25, 50, 100];

// Helper: LKR currency (no decimals typical for receipts)
const fmtLKR = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 0,
});

function InvoiceItem2() {
  const [raw, setRaw] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filters
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [invoiceIdSearch, setInvoiceIdSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | completed | incomplete

  // Sorting
  const [sortBy, setSortBy] = useState("inv_createddate");
  const [sortOrder, setSortOrder] = useState("desc"); // asc | desc

  // Fetch once; keep all client-side transforms local (preserves server.js/database.js contract)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get(
          "http://localhost:8085/reports/getCombinedInvoiceReports"
        );
        if (mounted && res?.data?.status) {
          // Backend returns: invoice_id, inv_createddate, inv_completed_datetime, total_revenue, customer_name, total_income
          setRaw(Array.isArray(res.data.response) ? res.data.response : []);
        }
      } catch (e) {
        console.error("Failed to fetch combined invoice reports", e);
        setRaw([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Reset to first page when filters/sort change
  useEffect(() => {
    setPage(0);
  }, [startDate, endDate, customerSearch, invoiceIdSearch, statusFilter, sortBy, sortOrder]);

  const handleRequestSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(columnKey);
      setSortOrder("asc");
    }
  };

  const handleChangePage = (_e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setCustomerSearch("");
    setInvoiceIdSearch("");
    setStatusFilter("all");
  };

  // Derived: filter
  const filtered = useMemo(() => {
    const start = startDate ? dayjs(startDate) : null;
    const end = endDate ? dayjs(endDate) : null;

    return (raw || [])
      .filter((row) => row.customer_name) // keep rows with a customer
      .filter((row) => {
        // Date range filter on created date
        const created = dayjs(row.inv_createddate);
        const afterOk = !start || created.isSameOrAfter(start);
        const beforeOk = !end || created.isSameOrBefore(end);
        return afterOk && beforeOk;
      })
      .filter((row) =>
        row.customer_name.toLowerCase().includes(customerSearch.toLowerCase())
      )
      .filter((row) => String(row.invoice_id).includes(invoiceIdSearch))
      .filter((row) => {
        if (statusFilter === "completed") return !!row.inv_completed_datetime;
        if (statusFilter === "incomplete") return !row.inv_completed_datetime;
        return true; // all
      });
  }, [raw, startDate, endDate, customerSearch, invoiceIdSearch, statusFilter]);

  // Derived: sort
  const getSortValue = useCallback(
    (row, key) => {
      switch (key) {
        case "invoice_id":
          return Number(row.invoice_id) || 0;
        case "customer_name":
          return row.customer_name?.toLowerCase?.() || "";
        case "inv_createddate":
          return dayjs(row.inv_createddate).valueOf();
        case "inv_completed_datetime":
          // treat null as very small for asc order (incomplete first)
          return row.inv_completed_datetime
            ? dayjs(row.inv_completed_datetime).valueOf()
            : -Infinity;
        case "total_revenue":
          return Number(row.total_revenue) || 0; // payments made
        case "total_income":
          return Number(row.total_income) || 0; // invoice total (equipment)
        case "status":
          return row.inv_completed_datetime ? 1 : 0; // 0=incomplete, 1=completed
        default:
          return 0;
      }
    },
    []
  );

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const va = getSortValue(a, sortBy);
      const vb = getSortValue(b, sortBy);
      if (va < vb) return sortOrder === "asc" ? -1 : 1;
      if (va > vb) return sortOrder === "asc" ? 1 : -1;
      // tie-breaker: created date desc
      const ta = dayjs(a.inv_createddate).valueOf();
      const tb = dayjs(b.inv_createddate).valueOf();
      return tb - ta;
    });
    return copy;
  }, [filtered, sortBy, sortOrder, getSortValue]);

  // Derived: pagination
  const paged = useMemo(() => {
    if (rowsPerPage <= 0) return sorted;
    const start = page * rowsPerPage;
    return sorted.slice(start, start + rowsPerPage);
  }, [sorted, page, rowsPerPage]);

  // Summary (for filtered set, not just paged rows)
  const summary = useMemo(() => {
    const totalRows = filtered.length;
    const completedCount = filtered.filter((r) => !!r.inv_completed_datetime).length;
    const incompleteCount = totalRows - completedCount;
    const sumRevenue = filtered.reduce(
      (acc, r) => acc + (Number(r.total_revenue) || 0),
      0
    );
    const sumIncome = filtered.reduce(
      (acc, r) => acc + (Number(r.total_income) || 0),
      0
    );
    return { totalRows, completedCount, incompleteCount, sumRevenue, sumIncome };
  }, [filtered]);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Invoice Reports
      </Typography>

      {/* Controls */}
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        flexWrap="wrap"
        sx={{ mb: 2 }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            label="Start Date & Time"
            value={startDate}
            onChange={setStartDate}
            slotProps={{ textField: { size: "small" } }}
          />
          <DateTimePicker
            label="End Date & Time"
            value={endDate}
            onChange={setEndDate}
            slotProps={{ textField: { size: "small" } }}
          />
        </LocalizationProvider>

        <TextField
          label="Search Customer"
          variant="outlined"
          size="small"
          value={customerSearch}
          onChange={(e) => setCustomerSearch(e.target.value)}
        />
        <TextField
          label="Search Invoice ID"
          variant="outlined"
          size="small"
          value={invoiceIdSearch}
          onChange={(e) => setInvoiceIdSearch(e.target.value)}
        />

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="status-filter-label">Status Filter</InputLabel>
          <Select
            labelId="status-filter-label"
            label="Status Filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="completed">Completed Only</MenuItem>
            <MenuItem value="incomplete">Incomplete Only</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="sort-by-label">Sort By</InputLabel>
          <Select
            labelId="sort-by-label"
            label="Sort By"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="status">Status (Completed/Incomplete)</MenuItem>
            <MenuItem value="inv_createddate">Created Date</MenuItem>
            <MenuItem value="inv_completed_datetime">Completed Date</MenuItem>
            <MenuItem value="total_revenue">Total Payments (LKR)</MenuItem>
            <MenuItem value="total_income">Invoice Total (LKR)</MenuItem>
            <MenuItem value="invoice_id">Invoice ID</MenuItem>
            <MenuItem value="customer_name">Customer Name</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          onClick={() => setSortOrder((p) => (p === "asc" ? "desc" : "asc"))}
        >
          Order: {sortOrder.toUpperCase()}
        </Button>

        <Box flexGrow={1} />
        <Button variant="contained" color="error" onClick={clearFilters}>
          Clear Filters
        </Button>
      </Stack>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="center">
                <TableSortLabel
                  active={sortBy === "invoice_id"}
                  direction={sortOrder}
                  onClick={() => handleRequestSort("invoice_id")}
                >
                  Invoice ID
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={sortBy === "customer_name"}
                  direction={sortOrder}
                  onClick={() => handleRequestSort("customer_name")}
                >
                  Customer Name
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={sortBy === "status"}
                  direction={sortOrder}
                  onClick={() => handleRequestSort("status")}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={sortBy === "inv_createddate"}
                  direction={sortOrder}
                  onClick={() => handleRequestSort("inv_createddate")}
                >
                  Created Date
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={sortBy === "total_revenue"}
                  direction={sortOrder}
                  onClick={() => handleRequestSort("total_revenue")}
                >
                  Total Payments Done (LKR)
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={sortBy === "total_income"}
                  direction={sortOrder}
                  onClick={() => handleRequestSort("total_income")}
                >
                  Invoice Total Amount (LKR)
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={sortBy === "inv_completed_datetime"}
                  direction={sortOrder}
                  onClick={() => handleRequestSort("inv_completed_datetime")}
                >
                  Completed Date & Time
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map((row) => {
              const isCompleted = !!row.inv_completed_datetime;
              const statusChip = (
                <Chip
                  size="small"
                  label={isCompleted ? "Completed" : "In Progress"}
                  color={isCompleted ? "success" : "warning"}
                  variant="outlined"
                />
              );
              return (
                <TableRow
                  key={`${row.invoice_id}-${row.inv_createddate}`}
                  sx={{
                    backgroundColor: isCompleted ? "#E8F5E9" : "#FFF3E0",
                  }}
                >
                  <TableCell align="center">{row.invoice_id}</TableCell>
                  <TableCell align="center">{row.customer_name}</TableCell>
                  <TableCell align="center">{statusChip}</TableCell>
                  <TableCell align="center">
                    {dayjs(row.inv_createddate).format("YYYY-MM-DD HH:mm:ss")}
                  </TableCell>
                  <TableCell align="center">
                    {fmtLKR.format(Number(row.total_revenue || 0))}
                  </TableCell>
                  <TableCell align="center">
                    {fmtLKR.format(Number(row.total_income || 0))}
                  </TableCell>
                  <TableCell align="center">
                    {row.inv_completed_datetime
                      ? dayjs(row.inv_completed_datetime).format(
                          "YYYY-MM-DD HH:mm:ss"
                        )
                      : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        count={filtered.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Summary */}
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="body2">
          Showing <strong>{Math.min(filtered.length, page * rowsPerPage + 1)}</strong> 
          –
          <strong>
            {Math.min(filtered.length, (page + 1) * rowsPerPage)}
          </strong>{" "}
          of <strong>{filtered.length}</strong> invoices
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          Completed: <strong>{summary.completedCount}</strong> • Incomplete: <strong>{summary.incompleteCount}</strong>
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          Total Payments (filtered): <strong>{fmtLKR.format(summary.sumRevenue)}</strong>
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          Invoice Totals (filtered): <strong>{fmtLKR.format(summary.sumIncome)}</strong>
        </Typography>
      </Paper>
    </Box>
  );
}

export default InvoiceItem2;