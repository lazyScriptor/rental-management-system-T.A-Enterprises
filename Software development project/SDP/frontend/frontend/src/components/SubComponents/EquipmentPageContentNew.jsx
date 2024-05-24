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
    textAlign: "center", // Ensure text alignment is centered
  };

  const highlightText = (text, highlight) => {
    if (typeof text !== "string") return text; // Ensure text is a string
    if (!highlight) return text;
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
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
    return dayjs(value).format("YYYY-MM-DD");
  };
  return (
    <React.Fragment>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell sx={cellStyles}>
          <IconButton
            aria-label="expand row"
            size=" "
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={cellStyles} component="th" scope="row">
          {highlightText(row.eq_id, searchValue)}
        </TableCell>
        <TableCell sx={cellStyles}>
          {highlightText(`${row.eq_name}`, searchValue)}
        </TableCell>
        <TableCell sx={cellStyles}>
          {highlightText(`${row.eqcat_name}`, searchValue)}
        </TableCell>
        <TableCell sx={cellStyles}>
          {highlightText(`${row.eq_rental}`, searchValue)}
        </TableCell>
        <TableCell sx={cellStyles}>
          {highlightText(dateFormat(row.eq_dofpurchase), searchValue)}
        </TableCell>
        <TableCell sx={cellStyles}>
          {highlightText(dateFormat(row.eq_warranty_expire), searchValue)}
        </TableCell>
        <TableCell sx={cellStyles}>
          {highlightText(row.eq_cost, searchValue)}
        </TableCell>
        <TableCell sx={cellStyles}>
          <Button>View</Button>
        </TableCell>
        <TableCell sx={cellStyles}>
          {highlightText(row.eq_description, searchValue)}
        </TableCell>
        <TableCell sx={cellStyles}>
          {highlightText(row.eq_defected_status, searchValue)}
        </TableCell>
        <TableCell sx={cellStyles}>
          {highlightText(row.eq_completestock, searchValue)}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <NewEquipmentForm/>
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

  return (
    <>
      <CustomerPageUpper setData={setData} setSearchValue={setSearchValue} />
      <TableContainer component={Paper} sx={{ mt: 45 }}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell align="center" />
              <TableCell align="center">Id</TableCell>
              <TableCell align="center">Machine Name</TableCell>
              <TableCell align="center">Category Name</TableCell>
              <TableCell align="center">Rental</TableCell>
              <TableCell align="center">DOP</TableCell>
              <TableCell align="center">Warranty Due</TableCell>
              <TableCell align="center">Machine Cost</TableCell>
              <TableCell align="center">Machine image</TableCell>
              <TableCell align="center">Description</TableCell>
              <TableCell align="center">Defective status</TableCell>
              <TableCell align="center">Stock remaining</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
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
      <Box sx={{ height: "350px", width: "100%" }}>
        <Stack
          direction="column"
          justifyContent="space-between"
          alignItems="stretch"
          spacing={8}
        >
          <Box></Box>
          <Box display="flex" justifyContent="center">
            <TextField
              label={[<ManageSearchIcon />, " Search by anything"]}
              onChange={(e) => {
                trimvariablesForAdvanceSearch(e.target.value);
              }}
              sx={{ width: "420px" }}
            />
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
    eq_dofpurchase: yup
      .date()
      .required("Date of purchase is required")
      .nullable(),
    eq_warranty_expire: yup
      .date()
      .required("Warranty expiration date is required")
      .nullable(),
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
    eq_description: yup.string().required("Description is required"),
    eq_defected_status: yup
      .boolean()
      .required("Defective status is required"),
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
    reset(); // Reset form fields
    setValue("eq_name", ""); // Optionally, clear specific fields
    setSelectValue(""); // Clear the select value
    setEquipment(""); // Clear the equipment state
    setToogle(false); // Reset toggle state
  };

  const onSubmit = async (data) => {

    try {
      const response = await axios.post(
        "http://localhost:8085/addEquipment",
        data
      );
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

      <Collapse in={true} timeout="auto" unmountOnExit component={Box} sx={{height:"500px",display:"flex",alignItems:"center"}}>
        <Box sx={{ mt: 2 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2} sx={{m:.5,width:"95%"}}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Machine Name"
                  fullWidth
                  {...register("eq_name")}
                  error={!!errors.eq_name}
                  helperText={errors.eq_name?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6} sx={{display:"flex"}}>
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
                <Box sx={{flexGrow:1}}/>
                <Button variant="contained">Upload an image</Button>
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
                    value={selectValue}
                    onChange={(e) => setSelectValue(e.target.value)}
                  >
                    <MenuItem value={1}>Category 1</MenuItem>
                    <MenuItem value={2}>Category 2</MenuItem>
                    <MenuItem value={3}>Category 3</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Defective Status</InputLabel>
                  <Select
                    {...register("eq_defected_status")}
                    defaultValue=""
                    value={getValues("eq_defected_status") || ""}
                    onChange={(e) =>
                      setValue("eq_defected_status", e.target.value, {
                        shouldValidate: true,
                      })
                    }
                    error={!!errors.eq_defected_status}
                  >
                    <MenuItem value={true}>Defective</MenuItem>
                    <MenuItem value={false}>Not Defective</MenuItem>
                  </Select>
                  <Typography variant="body2" color="error">
                    {errors.eq_defected_status?.message}
                  </Typography>
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

              <Grid item xs={12} sm={6}>
                <Button type="submit" variant="contained">
                  Submit
                </Button>
                <Button
                  type="button"
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
        <hr/>
      </Collapse>
    </>
  );
}
