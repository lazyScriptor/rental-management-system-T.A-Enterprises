import * as React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useEffect, useState } from "react";
import axios from "axios";
import NewCustomerForm from "../Pages/NewCustomerForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckDouble,
  faInfo,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { NewEquipmentForm } from "./NewEquipmentForm";
import Checkbox from "@mui/material/Checkbox";
import Swal from "sweetalert2";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

function Row(props) {
  const { row, searchValue } = props;
  const [open, setOpen] = useState(false);

  const cellStyles = {
    padding: "6px 8px",
    height: "30px",
    width: "auto",
    textAlign: "center",
  };

  const highlightText = (text, highlight) => {
    const str = text !== undefined && text !== null ? String(text) : "";
    if (!highlight) return str;
    const parts = str.split(new RegExp(`(${highlight})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={index} style={{ backgroundColor: "yellow" }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const dateFormat = (value) => {
    return value ? dayjs(value).format("YYYY-MM-DD") : "";
  };

  return (
    <React.Fragment>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell sx={cellStyles}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={cellStyles} component="th" scope="row">
          {highlightText(row.eq_id, searchValue)}
        </TableCell>
        <TableCell sx={cellStyles}>
          {highlightText(`${row.eq_name ?? ""}`, searchValue)}
        </TableCell>
        <TableCell sx={cellStyles}>
          {highlightText(`${row.eq_name_eng ?? row.eq_name ?? ""}`, searchValue)}
        </TableCell>
        <TableCell sx={cellStyles}>
          {highlightText(`${row.eqcat_name ?? ""}`, searchValue)}
        </TableCell>
        <TableCell sx={cellStyles}>
          {highlightText(`${row.eq_rental ?? ""}`, searchValue)}
        </TableCell>
        <TableCell sx={cellStyles}>
          {highlightText(dateFormat(row.eq_dofpurchase), searchValue)}
        </TableCell>
        <TableCell sx={cellStyles}>
          {highlightText(dateFormat(row.eq_warranty_expire), searchValue)}
        </TableCell>
        <TableCell sx={cellStyles}>
          {highlightText(row.eq_cost ?? "", searchValue)}
        </TableCell>

        <TableCell sx={cellStyles}>
          {highlightText(row.eq_description ?? "", searchValue)}
        </TableCell>
        <TableCell sx={cellStyles}>
          {highlightText(row.eq_defected_status ?? "", searchValue)}
        </TableCell>
        <TableCell sx={cellStyles}>
          {highlightText(row.eq_completestock ?? "", searchValue)}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <NewEquipmentForm eq_id={row.eq_id} />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export default function EquipmentTableNew() {
  const [data, setData] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("");

  // New filter states
  const [categoryFilter, setCategoryFilter] = useState("");
  const [warrantyFilter, setWarrantyFilter] = useState(""); // "active" | "expired" | ""
  const [minStock, setMinStock] = useState("");
  const [rentalMin, setRentalMin] = useState("");
  const [rentalMax, setRentalMax] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:8085/equipment");
        setData(res.data);
      } catch (error) {
        console.error("error occurred while fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const categories = React.useMemo(
    () =>
      Array.from(
        new Set((data || []).map((r) => r.eqcat_name).filter(Boolean))
      ),
    [data]
  );

  const handleSort = (column) => {
    const isAsc = orderBy === column && order === "asc";
    const newOrder = isAsc ? "desc" : "asc";
    setOrder(newOrder);
    setOrderBy(column);

    const isDateColumn = ["eq_dofpurchase", "eq_warranty_expire"].includes(
      column
    );
    const isNumericColumn = [
      "eq_id",
      "eq_rental",
      "eq_cost",
      "eq_defected_status",
      "eq_completestock",
    ].includes(column);

    const sortedData = [...data].sort((a, b) => {
      let aVal = a[column];
      let bVal = b[column];

      if (isDateColumn) {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      } else if (isNumericColumn) {
        aVal = Number(aVal);
        bVal = Number(bVal);
      } else {
        aVal = String(aVal ?? "").toLowerCase();
        bVal = String(bVal ?? "").toLowerCase();
      }

      if (aVal < bVal) return newOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return newOrder === "asc" ? 1 : -1;
      return 0;
    });

    setData(sortedData);
  };

  const headerStyles = {
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#f1f1f1",
    },
    transition: "background-color 0.3s ease",
  };

  // Multi-field search + filters
  const filteredData = data.filter((row) => {
    const q = (searchValue || "").trim().toLowerCase();
    const matchesSearch =
      q === "" ||
      [row.eq_id, row.eq_name, row.eq_name_eng, row.eq_description, row.eqcat_name]
        .map((v) => (v ?? "").toString().toLowerCase())
        .some((v) => v.includes(q));

    const matchesCategory = !categoryFilter || row.eqcat_name === categoryFilter;

    const warrantyDate = row.eq_warranty_expire
      ? new Date(row.eq_warranty_expire)
      : null;
    const now = new Date();
    const todayMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();
    const isWarrantyActive = warrantyDate
      ? warrantyDate.getTime() >= todayMidnight
      : false;

    const matchesWarranty =
      !warrantyFilter ||
      (warrantyFilter === "active" && isWarrantyActive) ||
      (warrantyFilter === "expired" && !isWarrantyActive);

    const matchesMinStock =
      minStock === "" ||
      Number(row.eq_completestock ?? 0) >= Number(minStock);
    const rental = Number(row.eq_rental ?? 0);
    const matchesRentalMin = rentalMin === "" || rental >= Number(rentalMin);
    const matchesRentalMax = rentalMax === "" || rental <= Number(rentalMax);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesWarranty &&
      matchesMinStock &&
      matchesRentalMin &&
      matchesRentalMax
    );
  });

  return (
    <>
      <CustomerPageUpper setData={setData} setSearchValue={setSearchValue} />

      {/* Search & Filters Toolbar */}
      <Box component={Paper} sx={{ p: 2, mb: 2, mx: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="center"
        >
          <TextField
            label="Search (ID / Name / Eng / Description / Category)"
            variant="outlined"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            sx={{ minWidth: 280 }}
          />

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Category"
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>Warranty</InputLabel>
            <Select
              value={warrantyFilter}
              label="Warranty"
              onChange={(e) => setWarrantyFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Min stock"
            type="number"
            value={minStock}
            onChange={(e) => setMinStock(e.target.value)}
            sx={{ width: 130 }}
          />

          <TextField
            label="Rental min"
            type="number"
            value={rentalMin}
            onChange={(e) => setRentalMin(e.target.value)}
            sx={{ width: 140 }}
          />

          <TextField
            label="Rental max"
            type="number"
            value={rentalMax}
            onChange={(e) => setRentalMax(e.target.value)}
            sx={{ width: 140 }}
          />

          <Button
            variant="outlined"
            onClick={() => {
              setSearchValue("");
              setCategoryFilter("");
              setWarrantyFilter("");
              setMinStock("");
              setRentalMin("");
              setRentalMax("");
            }}
          >
            Clear
          </Button>
        </Stack>
      </Box>

      <TableContainer component={Paper} sx={{}}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow
              sx={{
                color: "wh",
                position: "sticky",
                top: 0,
                zIndex: 1000,
                backgroundColor: (theme) =>
                  theme.palette.primary?.main || theme.palette.primary,
              }}
            >
              <TableCell align="center" />
              <TableCell
                align="center"
                onClick={() => handleSort("eq_id")}
                sx={headerStyles}
              >
                Id {orderBy === "eq_id" && (order === "asc" ? "↑" : "↓")}
              </TableCell>
              <TableCell
                align="center"
                onClick={() => handleSort("eq_name")}
                sx={headerStyles}
              >
                Machine Name{" "}
                {orderBy === "eq_name" && (order === "asc" ? "↑" : "↓")}
              </TableCell>
              <TableCell
                align="center"
                onClick={() => handleSort("eq_name_eng")}
                sx={headerStyles}
              >
                Machine Name English{" "}
                {orderBy === "eq_name_eng" && (order === "asc" ? "↑" : "↓")}
              </TableCell>
              <TableCell
                align="center"
                onClick={() => handleSort("eqcat_name")}
                sx={headerStyles}
              >
                Category Name{" "}
                {orderBy === "eqcat_name" && (order === "asc" ? "↑" : "↓")}
              </TableCell>
              <TableCell
                align="center"
                onClick={() => handleSort("eq_rental")}
                sx={headerStyles}
              >
                Rental{" "}
                {orderBy === "eq_rental" && (order === "asc" ? "↑" : "↓")}
              </TableCell>
              <TableCell
                align="center"
                onClick={() => handleSort("eq_dofpurchase")}
                sx={headerStyles}
              >
                DOP{" "}
                {orderBy === "eq_dofpurchase" &&
                  (order === "asc" ? "↑" : "↓")}
              </TableCell>
              <TableCell
                align="center"
                onClick={() => handleSort("eq_warranty_expire")}
                sx={headerStyles}
              >
                Warranty Due{" "}
                {orderBy === "eq_warranty_expire" &&
                  (order === "asc" ? "↑" : "↓")}
              </TableCell>
              <TableCell
                align="center"
                onClick={() => handleSort("eq_cost")}
                sx={headerStyles}
              >
                Machine Cost{" "}
                {orderBy === "eq_cost" && (order === "asc" ? "↑" : "↓")}
              </TableCell>

              <TableCell
                align="center"
                onClick={() => handleSort("eq_description")}
                sx={headerStyles}
              >
                Description{" "}
                {orderBy === "eq_description" && (order === "asc" ? "↑" : "↓")}
              </TableCell>
              <TableCell
                align="center"
                onClick={() => handleSort("eq_defected_status")}
                sx={headerStyles}
              >
                Defected Qty{" "}
                {orderBy === "eq_defected_status" &&
                  (order === "asc" ? "↑" : "↓")}
              </TableCell>
              <TableCell
                align="center"
                onClick={() => handleSort("eq_completestock")}
                sx={headerStyles}
              >
                Stock remaining{" "}
                {orderBy === "eq_completestock" &&
                  (order === "asc" ? "↑" : "↓")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((row) => (
              <Row key={row.eq_id} row={row} searchValue={searchValue} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export function CustomerPageUpper(props) {
  const { setData, setSearchValue } = props;

  const trimvariablesForAdvanceSearch = (variable) => {
    const cleanedVariable = variable.replace(/[\s-+]/g, ""); // Replace all whitespace characters, hyphens, and plus signs with an empty string
    const trimmedvariable = cleanedVariable.trim();
    searchByVariable(trimmedvariable);
  };

  const searchByVariable = (variable) => {
    try {
      axios
        .get(`http://localhost:8085/searchCustomerByValue/${variable}`)
        .then((res) => {
          setData(res.data);
          console.log(res.data);
        });
      setSearchValue(variable);
    } catch (error) {
      console.error("error occurred in the try catch block", error);
    }
  };

  return (
    <>
      <Box sx={{ height: "40vh", width: "100%" }}>
        <Stack
          direction="column"
          justifyContent="space-between"
          alignItems="stretch"
          spacing={8}
        >
          <Box display="flex" justifyContent="center">
            {/* Legacy search input (kept for reference) */}
            {/* <TextField
              label={[<ManageSearchIcon />, " Search by anything"]}
              onChange={(e) => {
                trimvariablesForAdvanceSearch(e.target.value);
              }}
              sx={{ width: "420px" }}
            /> */}
          </Box>
          <Box display="flex" justifyContent="flex-start">
            <Box>
              <CustomerPageMiddle />
            </Box>
          </Box>
        </Stack>
      </Box>
    </>
  );
}

export function CustomerPageMiddle() {
  const [toogle, setToogle] = useState(false);
  const [dbCustomerFound, setDbCustomerFound] = useState("");
  const [selectValue, setSelectValue] = useState("");
  const [open, setOpen] = React.useState(false);

  const [equipment, setEquipment] = useState("");

  const searchById = (id) => {
    try {
      axios.get(`http://localhost:8085/getCustomerById/${id}`).then((res) => {
        setDbCustomerFound(res.data);
      });
    } catch (error) {
      console.error("error occurred in the try catch block", error);
    }
  };

  const validationSchema = yup.object().shape({
    eq_name: yup.string().required("Machine Name is required"),
    eq_catid: yup.number().required("Category is required"),
    eq_dofpurchase: yup
      .date()
      .nullable()
      .transform((value, originalValue) =>
        originalValue === "" ? null : value
      )
      .notRequired(),

    eq_warranty_expire: yup
      .date()
      .nullable()
      .transform((value, originalValue) =>
        originalValue === "" ? null : value
      )
      .notRequired(),
    eq_cost: yup
      .number()
      .typeError("Machine cost must be a number")
      .required("Machine cost is required")
      .positive("Machine cost must be positive"),
    eq_rental: yup
      .number()
      .typeError("Rental must be a number")
      .required("Rental is required")
      .positive("Rental must be positive"),
    eq_description: yup.string(),
    eq_completestock: yup
      .number()
      .typeError("Complete stock must be a number")
      .required("Complete stock is required")
      .positive("Complete stock must be positive"),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const handleClear = () => {
    reset();
    setValue("eq_name", "");
    setSelectValue("");
    setEquipment("");
    setToogle(false);
  };

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(
        "http://localhost:8085/addEquipment",
        data
      );
      window.location.reload();
      Swal.fire("Success", "Machine added successfully", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to add machine", "error");
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:8085/equipment");
      const equipmentData = response.data;
      setEquipment(equipmentData);
    } catch (error) {
      console.error("Error fetching equipment data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Box>
        <Grid container spacing={2}>
          <Grid item xs={3} sx={{ marginTop: "-12px" }}>
            {/* <Button
              onClick={() => setToogle(!toogle)}
              variant="contained"
              sx={{ marginBottom: "-8px" }}
            >
              Add Machine
            </Button> */}
          </Grid>
        </Grid>
      </Box>

      <Collapse
        in={true}
        timeout="auto"
        unmountOnExit
        component={Box}
        sx={{ height: "500px", display: "flex", alignItems: "center" }}
      >
        <Box sx={{ mt: 2 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2} sx={{ m: 0.5, width: "95%" }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Machine Name"
                  fullWidth
                  {...register("eq_name")}
                  error={!!errors.eq_name}
                  helperText={errors.eq_name?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6} sx={{ display: "flex" }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Date of Purchase"
                    {...register("eq_dofpurchase")}
                    value={getValues("eq_dofpurchase") || null}
                    onChange={(date) =>
                      setValue("eq_dofpurchase", date, { shouldValidate: true })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!errors.eq_dofpurchase}
                        helperText={errors.eq_dofpurchase?.message}
                      />
                    )}
                  />
                </LocalizationProvider>
                <Box sx={{ flexGrow: 1 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Warranty Expiration Date"
                    {...register("eq_warranty_expire")}
                    value={getValues("eq_warranty_expire") || null}
                    onChange={(date) =>
                      setValue("eq_warranty_expire", date, {
                        shouldValidate: true,
                      })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!errors.eq_warranty_expire}
                        helperText={errors.eq_warranty_expire?.message}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Machine Cost"
                  fullWidth
                  {...register("eq_cost")}
                  error={!!errors.eq_cost}
                  helperText={errors.eq_cost?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Rental"
                  fullWidth
                  {...register("eq_rental")}
                  error={!!errors.eq_rental}
                  helperText={errors.eq_rental?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Description"
                  fullWidth
                  {...register("eq_description")}
                  error={!!errors.eq_description}
                  helperText={errors.eq_description?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    {...register("eq_catid")}
                    error={!!errors.eq_catid}
                    value={selectValue}
                    onChange={(e) => setSelectValue(e.target.value)}
                  >
                    <MenuItem value={1}>1 Day machine</MenuItem>
                    <MenuItem value={2}>5 Day machine</MenuItem>
                    <MenuItem value={3}>4 Day machine</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Complete Stock"
                  fullWidth
                  {...register("eq_completestock")}
                  error={!!errors.eq_completestock}
                  helperText={errors.eq_completestock?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6}></Grid>

              <Grid item xs={12} sm={6}>
                <Button type="submit" variant="contained">
                  Submit
                </Button>
                <Button
                  type="reset"
                  onClick={handleClear}
                  variant="contained"
                  sx={{ ml: 2 }}
                >
                  Clear
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Collapse>
    </>
  );
}