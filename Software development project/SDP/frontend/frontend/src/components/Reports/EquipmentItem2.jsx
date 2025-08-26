import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  TableSortLabel,
  Chip,
  Toolbar,
  Typography,
  Stack,
  FormControlLabel,
  Switch,
  CircularProgress,
  TablePagination,
  Button,
} from "@mui/material";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import axios from "axios";

function EquipmentItem2() {
  // Filters
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [search, setSearch] = useState("");
  const [minRevenue, setMinRevenue] = useState("");
  const [onlyPositive, setOnlyPositive] = useState(false);

  // Table state
  const [sortBy, setSortBy] = useState("total_revenue");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Data + UX
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errText, setErrText] = useState("");

  const formatISOStart = (d) =>
    d ? dayjs(d).startOf("day").toISOString() : null;
  const formatISOEnd = (d) => (d ? dayjs(d).endOf("day").toISOString() : null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrText("");
    try {
      const start = formatISOStart(startDate);
      const end = formatISOEnd(endDate);

      const { data } = await axios.get(
        "http://localhost:8085/reports/getEquipmentRevenueDetails",
        {
          params: { startDate: start, endDate: end },
        }
      );

      setData(Array.isArray(data?.response) ? data.response : []);
    } catch (error) {
      console.error("Error fetching equipment revenue data:", error);
      setErrText("Failed to load data. Please try again.");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Currency formatter (LKR)
  const fmt = useMemo(
    () =>
      new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR",
        maximumFractionDigits: 0,
      }),
    []
  );

  // Client-side filter
  const filtered = useMemo(() => {
    const needle = (search || "").toLowerCase();
    const min = Number(minRevenue) || 0;

    return (data || []).filter((row) => {
      const idMatch = String(row.eq_id || "").includes(needle);
      const nameMatch = (row.eq_name || "").toLowerCase().includes(needle);
      const revenue = Number(row.total_revenue) || 0;

      if (onlyPositive && revenue <= 0) return false;
      if (revenue < min) return false;
      return idMatch || nameMatch;
    });
  }, [data, search, minRevenue, onlyPositive]);

  // Sorting
  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let va, vb;

      switch (sortBy) {
        case "eq_id":
          va = Number(a.eq_id) || 0;
          vb = Number(b.eq_id) || 0;
          break;
        case "eq_name":
          va = (a.eq_name || "").toLowerCase();
          vb = (b.eq_name || "").toLowerCase();
          break;
        default:
          // total_revenue
          va = Number(a.total_revenue) || 0;
          vb = Number(b.total_revenue) || 0;
      }

      if (va < vb) return sortOrder === "asc" ? -1 : 1;
      if (va > vb) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortBy, sortOrder]);

  // Pagination
  const paged = useMemo(() => {
    const start = page * rowsPerPage;
    return sorted.slice(start, start + rowsPerPage);
  }, [sorted, page, rowsPerPage]);

  // Summary
  const totalRevenue = useMemo(
    () =>
      filtered.reduce(
        (acc, r) => acc + (Number(r.total_revenue) || 0),
        0
      ),
    [filtered]
  );

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const revenueColor = (revenue) => {
    const v = Number(revenue) || 0;
    if (v >= 100000) return "success";
    if (v >= 50000) return "warning";
    return "error";
  };

  const clearFilters = () => {
    setSearch("");
    setMinRevenue("");
    setOnlyPositive(false);
    setStartDate(null);
    setEndDate(null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper elevation={4} sx={{ p: 2 }}>
        <Toolbar
          sx={{
            px: 0,
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <DateTimePicker
              label="Start Date"
              value={startDate}
              onChange={(d) => {
                setStartDate(d);
                setPage(0);
              }}
              slotProps={{ textField: { size: "small" } }}
            />
            <DateTimePicker
              label="End Date"
              value={endDate}
              onChange={(d) => {
                setEndDate(d);
                setPage(0);
              }}
              slotProps={{ textField: { size: "small" } }}
            />
            <TextField
              size="small"
              label="Search name / ID"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
            <TextField
              size="small"
              type="number"
              label="Min revenue (LKR)"
              value={minRevenue}
              onChange={(e) => {
                setMinRevenue(e.target.value);
                setPage(0);
              }}
              inputProps={{ min: 0 }}
              sx={{ width: 180 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={onlyPositive}
                  onChange={(e) => {
                    setOnlyPositive(e.target.checked);
                    setPage(0);
                  }}
                  color="success"
                />
              }
              label="Only revenue &gt; 0"
            />
            <Button onClick={clearFilters}>Clear</Button>
          </Stack>

          <Box textAlign="right">
            <Typography variant="body2">
              Items: <strong>{filtered.length}</strong>
            </Typography>
            <Typography variant="body2">
              Total Revenue (filtered): <strong>{fmt.format(totalRevenue)}</strong>
            </Typography>
          </Box>
        </Toolbar>

        <TableContainer sx={{ maxHeight: "55vh", borderRadius: 1 }}>
          <Table stickyHeader size="small" aria-label="equipment-revenue">
            <TableHead>
              <TableRow>
                <TableCell sortDirection={sortBy === "eq_id" ? sortOrder : false}>
                  <TableSortLabel
                    active={sortBy === "eq_id"}
                    direction={sortBy === "eq_id" ? sortOrder : "asc"}
                    onClick={() => handleSort("eq_id")}
                  >
                    Equipment ID
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={sortBy === "eq_name" ? sortOrder : false}>
                  <TableSortLabel
                    active={sortBy === "eq_name"}
                    direction={sortBy === "eq_name" ? sortOrder : "asc"}
                    onClick={() => handleSort("eq_name")}
                  >
                    Equipment Name
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  align="right"
                  sortDirection={sortBy === "total_revenue" ? sortOrder : false}
                >
                  <TableSortLabel
                    active={sortBy === "total_revenue"}
                    direction={sortBy === "total_revenue" ? sortOrder : "desc"}
                    onClick={() => handleSort("total_revenue")}
                  >
                    Total Revenue (LKR)
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <CircularProgress size={22} />
                  </TableCell>
                </TableRow>
              ) : paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    {errText || "No data to display"}
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((row) => {
                  const revenue = Number(row.total_revenue) || 0;
                  return (
                    <TableRow
                      key={row.eq_id}
                      hover
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
                    >
                      <TableCell>{row.eq_id}</TableCell>
                      <TableCell>{row.eq_name}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={fmt.format(revenue)}
                          color={revenueColor(revenue)}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={sorted.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </Paper>
    </LocalizationProvider>
  );
}

export default EquipmentItem2;
