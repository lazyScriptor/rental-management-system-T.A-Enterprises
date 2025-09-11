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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Chip,
  TablePagination,
  Divider,
  Card,
  CardContent,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import axios from "axios";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

// Icons
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const rowsPerPageOptions = [10, 25, 50, 100];

// LKR currency (no decimals typical for receipts)
const fmtLKR = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 0,
});

// ---- pricing helpers (match CompleteInvoiceTable) ----
const n = (v) => Number(v) || 0;

/** 24h-precise duration (ceil), min 1 day */
function days24hCeil(startISO, endISO = new Date()) {
  const s = dayjs(startISO);
  const e = dayjs(endISO);
  if (!s.isValid() || !e.isValid()) return 1;
  const ms = e.valueOf() - s.valueOf();
  if (!Number.isFinite(ms) || ms <= 0) return 1;
  const days = ms / (1000 * 60 * 60 * 24);
  return Math.max(1, Math.ceil(days - 1e-9));
}

/**
 * Pricing – mirrors CompleteInvoiceTable:
 * - If there is a special (spe_singleday_rent) and a dataset (eqcat_dataset),
 *   charge special once for the first `dataset` days, then normal per extra day.
 * - Otherwise charge normal per day.
 */
function calcRentalForDuration(row, durationDays) {
  const dateSet = n(row.eqcat_dataset);
  const normalRental = n(row.eq_rental);
  const specialRental = n(row.spe_singleday_rent);
  const qty = n(row.inveq_borrowqty);
  const d = n(durationDays);

  if (d <= 0 || qty <= 0) return 0;

  if (specialRental) {
    if (d <= dateSet) {
      return specialRental * qty;
    }
    return (specialRental + normalRental * (d - dateSet)) * qty;
  }
  return normalRental * d * qty;
}

export default function InvoiceItem2() {
  const [raw, setRaw] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filters
  const [createdStart, setCreatedStart] = useState(null);
  const [createdEnd, setCreatedEnd] = useState(null);
  const [completedStart, setCompletedStart] = useState(null);
  const [completedEnd, setCompletedEnd] = useState(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [invoiceIdSearch, setInvoiceIdSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | completed | incomplete

  // Sorting
  const [sortBy, setSortBy] = useState("inv_createddate");
  const [sortOrder, setSortOrder] = useState("desc"); // asc | desc

  // Per-invoice detail maps
  const [returnedCostMap, setReturnedCostMap] = useState({});  // cost for items with return date
  const [ongoingCostMap, setOngoingCostMap] = useState({});    // cost till now for items not yet returned
  const [advanceMap, setAdvanceMap] = useState({});            // invoice.advance
  const [discountMap, setDiscountMap] = useState({});          // invoice.discount (in case combined rows lack/are stale)
  const [refundsMap, setRefundsMap] = useState({});            // sum(|negative payments|)

  // Fetch combined report
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get("http://localhost:8085/reports/getCombinedInvoiceReports");
        if (mounted && res?.data?.status) {
          const arr = Array.isArray(res.data.response) ? res.data.response : [];
          setRaw(arr);
        }
      } catch (e) {
        console.error("Failed to fetch combined invoice reports", e);
        setRaw([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Base filtering
  const filtered = useMemo(() => {
    const cStart = createdStart ? dayjs(createdStart) : null;
    const cEnd = createdEnd ? dayjs(createdEnd) : null;
    const fStart = completedStart ? dayjs(completedStart) : null;
    const fEnd = completedEnd ? dayjs(completedEnd) : null;

    return (raw || [])
      .filter((r) => r.customer_name)
      .filter((r) => {
        const d = dayjs(r.inv_createddate);
        const afterOk = !cStart || d.isSameOrAfter(cStart);
        const beforeOk = !cEnd || d.isSameOrBefore(cEnd);
        return afterOk && beforeOk;
      })
      .filter((r) => r.customer_name.toLowerCase().includes(customerSearch.toLowerCase()))
      .filter((r) => String(r.invoice_id ?? "").includes(invoiceIdSearch.trim()))
      .filter((r) => {
        if (statusFilter === "completed") return !!r.inv_completed_datetime;
        if (statusFilter === "incomplete") return !r.inv_completed_datetime;
        return true;
      })
      .filter((r) => {
        if (!fStart && !fEnd) return true;
        if (!r.inv_completed_datetime) return false;
        const d = dayjs(r.inv_completed_datetime);
        const afterOk = !fStart || d.isSameOrAfter(fStart);
        const beforeOk = !fEnd || d.isSameOrBefore(fEnd);
        return afterOk && beforeOk;
      });
  }, [
    raw,
    createdStart,
    createdEnd,
    completedStart,
    completedEnd,
    customerSearch,
    invoiceIdSearch,
    statusFilter,
  ]);

  // Sorting helpers
  const getSortValue = useCallback((row, key) => {
    switch (key) {
      case "invoice_id":
        return Number(row.invoice_id) || 0;
      case "customer_name":
        return row.customer_name?.toLowerCase?.() || "";
      case "inv_createddate":
        return dayjs(row.inv_createddate).valueOf();
      case "inv_completed_datetime":
        return row.inv_completed_datetime ? dayjs(row.inv_completed_datetime).valueOf() : -Infinity;
      default:
        return 0;
    }
  }, []);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const va = getSortValue(a, sortBy);
      const vb = getSortValue(b, sortBy);
      if (va < vb) return sortOrder === "asc" ? -1 : 1;
      if (va > vb) return sortOrder === "asc" ? 1 : -1;
      // tie-break: created desc
      return dayjs(b.inv_createddate).valueOf() - dayjs(a.inv_createddate).valueOf();
    });
    return copy;
  }, [filtered, sortBy, sortOrder, getSortValue]);

  const paged = useMemo(() => {
    if (rowsPerPage <= 0) return sorted;
    const start = page * rowsPerPage;
    return sorted.slice(start, start + rowsPerPage);
  }, [sorted, page, rowsPerPage]);

  // Reset page when filters/sort change
  useEffect(() => { setPage(0); }, [
    createdStart, createdEnd, completedStart, completedEnd,
    customerSearch, invoiceIdSearch, statusFilter, sortBy, sortOrder
  ]);

  // Load per-invoice details for *filtered* invoices
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const ids = filtered.map((r) => r.invoice_id);
      if (ids.length === 0) {
        if (!cancelled) {
          setReturnedCostMap({});
          setOngoingCostMap({});
          setAdvanceMap({});
          setDiscountMap({});
          setRefundsMap({});
        }
        return;
      }

      const retAcc = {};
      const ongAcc = {};
      const advAcc = {};
      const disAcc = {};
      const refAcc = {};

      // Batch in parallel, but keep it simple
      await Promise.all(
        ids.map(async (id) => {
          try {
            const resp = await axios.get(`http://localhost:8085/invoiceDataRetrieve/${id}`);
            const eqs = resp?.data?.eqdetails || [];
            const invCreated = resp?.data?.createdDate;
            const discount = Number(resp?.data?.discount || 0);
            const advance = Number(resp?.data?.advance || 0);
            const pays = Array.isArray(resp?.data?.payments) ? resp.data.payments : [];

            // refunds = total of |negative amounts|
            const refunds = pays.reduce((acc, p) => {
              const a = Number(p.invpay_amount) || 0;
              return a < 0 ? acc + Math.abs(a) : acc;
            }, 0);

            let returnedSum = 0;
            let ongoingSum = 0;

            for (const row of eqs) {
              const start = row.inveq_borrowdate || invCreated;
              if (row.inveq_return_date) {
                const d = days24hCeil(start, row.inveq_return_date);
                returnedSum += calcRentalForDuration(row, d);
              } else {
                const d = days24hCeil(start, new Date());
                ongoingSum += calcRentalForDuration(row, d);
              }
            }

            retAcc[id] = returnedSum;
            ongAcc[id] = ongoingSum;
            advAcc[id] = advance;
            disAcc[id] = discount;
            refAcc[id] = refunds;
          } catch (err) {
            // Fall back to zero on error
            retAcc[id] = 0;
            ongAcc[id] = 0;
            advAcc[id] = 0;
            disAcc[id] = 0;
            refAcc[id] = 0;
            console.warn("Invoice detail fetch failed for", id, err);
          }
        })
      );

      if (!cancelled) {
        setReturnedCostMap(retAcc);
        setOngoingCostMap(ongAcc);
        setAdvanceMap(advAcc);
        setDiscountMap(disAcc);
        setRefundsMap(refAcc);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [filtered]);

  // SUMMARY across filtered
  const summary = useMemo(() => {
    const ids = filtered.map((r) => r.invoice_id);

    const sumReturned = ids.reduce((acc, id) => acc + (returnedCostMap[id] ?? 0), 0);
    const sumOngoing  = ids.reduce((acc, id) => acc + (ongoingCostMap[id] ?? 0), 0);
    const equipTotal  = sumReturned + sumOngoing;

    const sumDiscounts = ids.reduce((acc, id) => acc + (discountMap[id] ?? 0), 0);
    const sumAdvances  = ids.reduce((acc, id) => acc + (advanceMap[id] ?? 0), 0);
    const sumRefunds   = ids.reduce((acc, id) => acc + (refundsMap[id] ?? 0), 0); // already absolute

    // Per your request: "complete cost after refunds, advance, discounts"
    const netAfterAdj = equipTotal - sumDiscounts - sumAdvances + sumRefunds;

    return {
      count: filtered.length,
      sumReturned,
      sumOngoing,
      equipTotal,
      sumDiscounts,
      sumAdvances,
      sumRefunds,
      netAfterAdj,
    };
  }, [filtered, returnedCostMap, ongoingCostMap, discountMap, advanceMap, refundsMap]);

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
    setCreatedStart(null);
    setCreatedEnd(null);
    setCompletedStart(null);
    setCompletedEnd(null);
    setCustomerSearch("");
    setInvoiceIdSearch("");
    setStatusFilter("all");
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Invoice Reports
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <FilterAltIcon fontSize="small" />
          <Typography variant="subtitle2">Filters</Typography>
          <Box flexGrow={1} />
          <Button startIcon={<RestartAltIcon />} variant="text" color="inherit" onClick={clearFilters}>
            Reset
          </Button>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ mb: 1.5 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Created Start"
              value={createdStart}
              onChange={setCreatedStart}
              slotProps={{ textField: { size: "small" } }}
            />
          </LocalizationProvider>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Created End"
              value={createdEnd}
              onChange={setCreatedEnd}
              slotProps={{ textField: { size: "small" } }}
            />
          </LocalizationProvider>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Completed Start"
              value={completedStart}
              onChange={setCompletedStart}
              slotProps={{ textField: { size: "small" } }}
            />
          </LocalizationProvider>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Completed End"
              value={completedEnd}
              onChange={setCompletedEnd}
              slotProps={{ textField: { size: "small" } }}
            />
          </LocalizationProvider>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
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

          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel id="sort-by-label">Sort By</InputLabel>
            <Select
              labelId="sort-by-label"
              label="Sort By"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="inv_createddate">Created Date</MenuItem>
              <MenuItem value="inv_completed_datetime">Completed Date</MenuItem>
              <MenuItem value="invoice_id">Invoice ID</MenuItem>
              <MenuItem value="customer_name">Customer Name</MenuItem>
            </Select>
          </FormControl>

          <Button variant="outlined" onClick={() => setSortOrder((p) => (p === "asc" ? "desc" : "asc"))}>
            Order: {sortOrder.toUpperCase()}
          </Button>
        </Stack>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="center">
                <Button
                  onClick={() => handleRequestSort("invoice_id")}
                  size="small"
                  variant={sortBy === "invoice_id" ? "contained" : "text"}
                >
                  Invoice ID
                </Button>
              </TableCell>
              <TableCell align="center">
                <Button
                  onClick={() => handleRequestSort("customer_name")}
                  size="small"
                  variant={sortBy === "customer_name" ? "contained" : "text"}
                >
                  Customer
                </Button>
              </TableCell>
              <TableCell align="center">
                <Button
                  onClick={() => handleRequestSort("inv_createddate")}
                  size="small"
                  variant={sortBy === "inv_createddate" ? "contained" : "text"}
                >
                  Created
                </Button>
              </TableCell>
              <TableCell align="center">
                Status
              </TableCell>
              <TableCell align="center">Returned Cost</TableCell>
              <TableCell align="center">Not Returned Cost</TableCell>
              <TableCell align="center">Equipment Total</TableCell>
              <TableCell align="center">Discount</TableCell>
              <TableCell align="center">Advance</TableCell>
              <TableCell align="center">Refunds</TableCell>
              <TableCell align="center">
                <Button
                  onClick={() => handleRequestSort("inv_completed_datetime")}
                  size="small"
                  variant={sortBy === "inv_completed_datetime" ? "contained" : "text"}
                >
                  Completed
                </Button>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paged.map((row) => {
              const id = row.invoice_id;
              const isCompleted = !!row.inv_completed_datetime;

              const returned = returnedCostMap[id] ?? 0;
              const ongoing  = ongoingCostMap[id] ?? 0;
              const equip    = returned + ongoing;
              const discount = discountMap[id] ?? n(row.discount); // prefer live, fallback row
              const advance  = advanceMap[id] ?? 0;
              const refunds  = refundsMap[id] ?? 0;

              return (
                <TableRow
                  key={`${row.invoice_id}-${row.inv_createddate}`}
                  sx={{
                    backgroundColor: isCompleted
                      ? "rgba(46, 125, 50, 0.03)"
                      : "rgba(255, 167, 38, 0.03)",
                  }}
                >
                  <TableCell align="center">{row.invoice_id}</TableCell>
                  <TableCell align="center">{row.customer_name}</TableCell>
                  <TableCell align="center">
                    {dayjs(row.inv_createddate).format("YYYY-MM-DD HH:mm")}
                  </TableCell>
                  <TableCell align="center">
                    {isCompleted ? (
                      <Chip
                        size="small"
                        label="Completed"
                        color="success"
                        variant="outlined"
                        icon={<CheckCircleOutlineIcon fontSize="small" />}
                      />
                    ) : (
                      <Chip
                        size="small"
                        label="In Progress"
                        color="warning"
                        variant="outlined"
                        icon={<HourglassEmptyIcon fontSize="small" />}
                      />
                    )}
                  </TableCell>
                  <TableCell align="center">{fmtLKR.format(returned)}</TableCell>
                  <TableCell align="center">{fmtLKR.format(ongoing)}</TableCell>
                  <TableCell align="center">{fmtLKR.format(equip)}</TableCell>
                  <TableCell align="center">{fmtLKR.format(discount)}</TableCell>
                  <TableCell align="center">{fmtLKR.format(advance)}</TableCell>
                  <TableCell align="center">{fmtLKR.format(refunds)}</TableCell>
                  <TableCell align="center">
                    {row.inv_completed_datetime
                      ? dayjs(row.inv_completed_datetime).format("YYYY-MM-DD HH:mm")
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
      <Card variant="outlined" sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Summary (filtered)
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip size="small" variant="outlined" label={`Invoices: ${summary.count}`} />
            <Chip size="small" variant="outlined" label={`Handed-over items total: ${fmtLKR.format(summary.sumReturned)}`} />
            <Chip size="small" variant="outlined" label={`Not handed-over items total: ${fmtLKR.format(summary.sumOngoing)}`} />
            <Chip size="small" color="info" variant="outlined" label={`Equipment total: ${fmtLKR.format(summary.equipTotal)}`} />
            <Chip size="small" variant="outlined" label={`Discounts: ${fmtLKR.format(summary.sumDiscounts)}`} />
            <Chip size="small" variant="outlined" label={`Advances: ${fmtLKR.format(summary.sumAdvances)}`} />
            <Chip size="small" variant="outlined" label={`Refunds: ${fmtLKR.format(summary.sumRefunds)}`} />
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          <Typography variant="body2">
            Net after adjustments = Equipment total − Discounts − Advances + Refunds
          </Typography>
          <Typography variant="h6" sx={{ mt: 0.5 }}>
            {fmtLKR.format(summary.netAfterAdj)}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}