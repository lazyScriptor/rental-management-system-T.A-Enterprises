import React, { useEffect, useState } from "react";
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
  TablePagination,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
} from "@mui/material";
import axios from "axios";

export function Item1() {
  const [customerRatings, setCustomerRatings] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [minSales, setMinSales] = useState("");
  const [maxSales, setMaxSales] = useState("");
  const [sortField, setSortField] = useState("cus_fname");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchCustomerRatings = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8085/reports/getCustomerRatings"
        );
        if (response.data.status === false) {
          console.log("Failed to retrieve rating information");
        } else {
          setCustomerRatings(response.data.response);
        }
      } catch (error) {
        console.log("Reports customer ratings error", error);
      }
    };

    fetchCustomerRatings();
  }, []);

  // Filtering
  const filteredCustomerRatings = customerRatings
    .filter(
      (customer) =>
        (customer.cus_phone_number.includes(searchValue) ||
          customer.cus_fname
            .toLowerCase()
            .includes(searchValue.toLowerCase()) ||
          customer.cus_lname
            .toLowerCase()
            .includes(searchValue.toLowerCase())) &&
        (minSales === "" || customer.total_sales >= Number(minSales)) &&
        (maxSales === "" || customer.total_sales <= Number(maxSales))
    )
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      if (typeof aValue === "string") aValue = aValue.toLowerCase();
      if (typeof bValue === "string") bValue = bValue.toLowerCase();
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

  // Pagination
  const paginatedRatings = filteredCustomerRatings.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Row color logic
  const getRowColor = (row) => {
    if (row.cus_delete_status === 1) return "#FFCDD2"; // red for deleted
    if (row.number_of_invoices === 0) return "#FFF9C4"; // light yellow for zero invoices
    if (row.number_of_invoices > 5) return "#C8E6C9"; // light green for >5 invoices
    return "inherit"; // default
  };

  return (
    <>
      <Box mb={2}>
        <Typography variant="h6">Customer Sales Report</Typography>
        <Box display="flex" gap={2} alignItems="center" mb={1}>
          <TextField
            label="Search by phone or name"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            size="small"
          />
          <TextField
            label="Min Sales"
            type="number"
            value={minSales}
            onChange={(e) => setMinSales(e.target.value)}
            size="small"
          />
          <TextField
            label="Max Sales"
            type="number"
            value={maxSales}
            onChange={(e) => setMaxSales(e.target.value)}
            size="small"
          />
          <FormControl size="small">
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortField}
              label="Sort By"
              onChange={(e) => setSortField(e.target.value)}
            >
              <MenuItem value="cus_fname">First Name</MenuItem>
              <MenuItem value="cus_lname">Last Name</MenuItem>
              <MenuItem value="cus_phone_number">Phone Number</MenuItem>
              <MenuItem value="number_of_invoices">Number of Invoices</MenuItem>
              <MenuItem value="total_sales">Total Sales</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? "Asc ▲" : "Desc ▼"}
          </Button>
        </Box>
        <Box mb={1}>
          <Typography variant="body2">
            <span
              style={{
                background: "#FFCDD2",
                padding: "2px 8px",
                marginRight: 8,
              }}
            >
              Deleted Customer
            </span>
            <span
              style={{
                background: "#FFF9C4",
                padding: "2px 8px",
                marginRight: 8,
              }}
            >
              Zero Invoices
            </span>
            <span
              style={{
                background: "#C8E6C9",
                padding: "2px 8px",
                marginRight: 8,
              }}
            >
              More than 5 Invoices
            </span>
          </Typography>
        </Box>
      </Box>
<TableContainer component={Paper} sx={{ height: "50vh", position: "relative" }}>
  <Table sx={{ minWidth: 650 }} aria-label="customer sales table" stickyHeader>
    <TableHead>
      <TableRow>
        <TableCell align="center" sx={{ position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>Customer Name</TableCell>
        <TableCell align="center" sx={{ position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>Customer Phone Number</TableCell>
        <TableCell align="center" sx={{ position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>Number of Invoices</TableCell>
        <TableCell
          align="center"
          sx={{
            position: "sticky",
            top: 0,
            background: "#fff",
            zIndex: 1,
            width: 180,
            minWidth: 180,
            maxWidth: 180,
          }}
        >
          Invoice IDs
        </TableCell>
        <TableCell align="center" sx={{ position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>Total Sales</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {paginatedRatings.map((row, index) => (
        <TableRow
          key={index}
          sx={{
            backgroundColor: getRowColor(row),
            "&:last-child td, &:last-child th": { border: 0 },
          }}
        >
          <TableCell align="center">
            {row.cus_fname} {row.cus_lname}
          </TableCell>
          <TableCell align="center">{row.cus_phone_number}</TableCell>
          <TableCell align="center">{row.number_of_invoices}</TableCell>
          <TableCell
            align="center"
            sx={{
              width: 180,
              minWidth: 180,
              maxWidth: 180,
              overflow: "auto",
              whiteSpace: "nowrap",
            }}
          >
            <Box sx={{ maxHeight: 40, overflowY: "auto" }}>
              {row.invoice_ids}
            </Box>
          </TableCell>
          <TableCell align="center">{row.total_sales}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredCustomerRatings.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </>
  );
}
