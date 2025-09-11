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
import { useTheme } from "@mui/material";

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
  Stack,
  TextField,
  makeStyles,
} from "@mui/material";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Checkbox from "@mui/material/Checkbox";
import Swal from "sweetalert2";
import Lottie from "react-lottie";
import CustomerPage from "../../assets/CustomerPage.json";
import CustomerUnderSuperCustomer from "./CustomerUnderSuperCustomer";
import AddChildCustomerDialog from "./AddChildCustomerDialog";

function Row(props) {
  const { row, searchValue } = props;
  const [open, setOpen] = useState(false);

  const cellStyles = {
    padding: "6px 8px",
    height: "30px",
  };

  const highlightText = (text, highlight) => {
    console.log("Text:", text);
    console.log("Highlight:", highlight);

    if (!highlight || highlight.trim() === "") {
      console.log("No highlight or empty, returning original text");
      return text; // Return original text if no highlight value or if highlight is empty
    }
    if (typeof text !== "string") {
      console.log("Text is not a string, returning original text");
      return text; // Ensure text is a string
    }

    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    console.log("Parts:", parts);

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
        <TableCell align="center" component="th" scope="row">
          {highlightText(row.cus_id, searchValue)}
        </TableCell>
        <TableCell align="center">
          {highlightText(`${row.cus_fname} ${row.cus_lname}`, searchValue)}
        </TableCell>
        <TableCell align="center">
          {highlightText(row.cus_phone_number, searchValue)}
        </TableCell>
        <TableCell align="center">
          {highlightText(row.nic, searchValue)}
        </TableCell>
        <TableCell align="center">
          {highlightText(row.cus_address1, searchValue)}
        </TableCell>
        <TableCell align="center">
          {highlightText(row.cus_address2, searchValue)}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <NewCustomerForm cus_id={row.cus_id} />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export default function CustomerTableNew() {
  const [data, setData] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    try {
      axios.get("http://localhost:8085/customers").then((res) => {
        setData(res.data);
      });
    } catch (error) {
      console.error("error occurred in the try catch block", error);
    }
  }, []);

  return (
    <>
      <CustomerPageUpper setData={setData} setSearchValue={setSearchValue} />
      <TableContainer component={Paper} sx={{ mt: 16, height: "55vh" }}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 1000, // Adjust the z-index as needed
                backgroundColor: (theme) => theme.palette.primary[600], // Optional: Customize the header background color
              }}
            >
              <TableCell />
              <TableCell sx={{ color: "white" }} align="center">
                Customer Id
              </TableCell>
              <TableCell sx={{ color: "white" }} align="center">
                Customer Name
              </TableCell>
              <TableCell sx={{ color: "white" }} align="center">
                Customer Phone number
              </TableCell>
              <TableCell sx={{ color: "white" }} align="center">
                Customer NIC
              </TableCell>
              <TableCell sx={{ color: "white" }} align="center">
                Customer Address line 1
              </TableCell>
              <TableCell sx={{ color: "white" }} align="center">
                Customer Address line 2
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <Row key={row.cus_id} row={row} searchValue={searchValue} />
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
      if (variable) {
        axios
          .get(`http://localhost:8085/searchCustomerByValue/${variable}`)
          .then((res) => {
            setData(res.data);
            console.log(res.data);
          });
        setSearchValue(variable);
      } else {
        axios.get("http://localhost:8085/customers").then((res) => {
          setData(res.data);
        });
      }
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
              elevation={10}
              component={Paper}
              label={[<ManageSearchIcon />, " Search by anything"]}
              onChange={(e) => {
                trimvariablesForAdvanceSearch(e.target.value);
              }}
              sx={[{ width: "420px" }]}
            />
          </Box>
          <Box display="flex">
            <Box display="flex" justifyContent={"center"}>
              <CustomerPageMiddle />
            </Box>
          </Box>
        </Stack>
      </Box>
    </>
  );
}

export function CustomerPageMiddle() {
  const theme = useTheme();
  const [toogle, setToogle] = useState(false);
  const [dbCustomerFound, setDbCustomerFound] = useState("");

  const textFieldStyle = {
    width: "100%",
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px", // Increase the border radius
    },
  };
  const [openChildDialog, setOpenChildDialog] = useState(false);
  const [customer, setCustomer] = useState({
    fname: "",
    lname: "",
    nic: "",
    phoneNumber: "",
    address1: "",
    address2: "",
  });

  const schema = yup.object().shape({
    fname: yup.string().required().min(3).max(15),
    lname: yup.string().max(25),
    nic: yup
      .string()
      .transform((value) => value.trim())
      .test("is-valid-nic", "Please enter a valid NIC number", (value) => {
        if (!value) return true; // Allow empty NIC
        const nineDigitsAndV = /^[0-9]{9}v$/i;
        const twelveDigits = /^[0-9]{12}$/;
        return nineDigitsAndV.test(value) || twelveDigits.test(value);
      }),
    phoneNumber: yup
      .string()
      .required()
      .transform((value) => value.replace(/[-\s]/g, "").trim())
      .test(
        "is-valid-phonenumber",
        "Please enter a valid phone number",
        (value) => {
          if (!value) return false;
          const validFormatCheck1 = /^[1-9]\d{8}$/; // 10 digits only
          const validFormatCheck2 = /^[0]\d{9}$/; // 10 digits only

          return validFormatCheck1.test(value) || validFormatCheck2.test(value);
        }
      ),
    address1: yup.string().required().min(5).max(30),
    address2: yup.string().max(30),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const phonNumberDatabaseCheck = async (phonenumber) => {
    const cleanedPhoneNumber = phonenumber.replace(/\D/g, "");
    const trimmedPhoneNumber = cleanedPhoneNumber.trim();

    try {
      const res = await axios.get(
        `http://localhost:8085/getCustomerbyPhoneNumber/${trimmedPhoneNumber}`
      );
      const customerData = res.data;
      if (customerData && customerData.length > 0) {
        console.log("found");
        setDbCustomerFound("This phone number already exist");
      } else {
        setDbCustomerFound("");
        console.log("No customer data found");
      }
    } catch (error) {
      setDbCustomerFound("");
      console.log("handleSearch Phone Number error");
    }
  };
  const nicDatabaseCheck = async (nic) => {
    const cleanednic = nic.replace(/\D/g, "");
    const trimmednic = cleanednic.trim();

    try {
      const res = await axios.get(
        `http://localhost:8085/getCustomerbyNIC/${nic}`
      );
      const customerData = res.data;
      if (customerData && customerData.length > 0) {
        setDbCustomerFound("This NIC already exist in the database");
      } else {
        console.log("No customer data found");
        setDbCustomerFound("");
      }
    } catch (error) {
      console.log("handleSearch NIC error");
      setDbCustomerFound("");
    }
  };

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, ""); // Remove all non-digit characters
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return value;
  };

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const onSubmit = async (data) => {
    console.log(data);
    try {
      const response = await axios.post(
        "http://localhost:8085/createCustomer",
        data
      );
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Your work has been saved",
        showConfirmButton: false,
        timer: 1500,
      }).then(async () => {
        // Ensure that the wait starts after Swal.fire completes
        await wait(2000);
        window.location.reload();
      });
      console.log("Details saved successfully:", response.data);
      // setToogle(true);
    } catch (error) {
      console.error("Error saving details:", error);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setCustomer((prevState) => ({
      ...prevState,
      [name]: name === "phoneNumber" ? formatPhoneNumber(value) : value,
    }));
    if (name === "phoneNumber") {
      phonNumberDatabaseCheck(value);
    }
    if (name === "nic") {
      nicDatabaseCheck(value);
    }
  };
  return (
    <>
      <Paper
        elevation={1}
        sx={{
          backgroundColor: (theme) => theme.palette.primary[25],
          p: 5,
          borderRadius: 3,
          width: "95%",
        }}
      >
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          {/* <TextField
              disabled={true}
              id="customer-id"
              name="id"
              label="customer id"
              variant="outlined"
              size="small"
              sx={{ width: "10%", mb: 2, ml: 2 }}
              value={customer.id}
            /> */}
          <Grid
            container
            spacing={2}
            p={2}
            ml={1}
            width={"100%"}
            height={"100%"}
            borderRadius={2}
          >
            {/* Left side Box names,mic,pno*/}
            <Grid item xs={4}>
              <FormControl sx={{ gap: "20px", width: "100%" }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box className="dey">
                      <TextField
                        disabled={toogle}
                        id="customer-fname"
                        name="fname"
                        variant="outlined"
                        inputProps={{ ...register("fname") }}
                        error={!!errors.fname}
                        helperText={errors.fname?.message}
                        size="small"
                        label="first name"
                        sx={textFieldStyle}
                        value={customer.fname}
                        onChange={handleInputChange}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box className="dey">
                      <TextField
                        disabled={toogle}
                        id="customer-lname"
                        name="lname"
                        label="last name"
                        inputProps={{ ...register("lname") }}
                        error={!!errors.lname}
                        helperText={errors.lname?.message}
                        variant="outlined"
                        size="small"
                        sx={textFieldStyle}
                        value={customer.lname}
                        onChange={handleInputChange}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box className="dey">
                      <TextField
                        disabled={toogle}
                        id="customer-nic"
                        name="nic"
                        label="national ID card number"
                        inputProps={{ ...register("nic") }}
                        error={!!errors.nic}
                        helperText={errors.nic?.message}
                        variant="outlined"
                        size="small"
                        sx={textFieldStyle}
                        value={customer.nic}
                        onChange={handleInputChange}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box className="dey">
                      <TextField
                        disabled={toogle}
                        id="customer-phoneNumber"
                        label="phone number"
                        name="phoneNumber"
                        inputProps={{ ...register("phoneNumber") }}
                        error={!!errors.phoneNumber}
                        helperText={errors.phoneNumber?.message}
                        variant="outlined"
                        size="small"
                        sx={textFieldStyle}
                        value={customer.phoneNumber}
                        onChange={handleInputChange}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </FormControl>
            </Grid>

            {/* address column */}
            <Grid item xs={3}>
              <FormControl sx={{ gap: "20px", width: "100%", pr: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box className="dey">
                      <TextField
                        disabled={toogle}
                        id="customer-address1"
                        name="address1"
                        inputProps={{ ...register("address1") }}
                        error={!!errors.address1}
                        helperText={errors.address1?.message}
                        label="address line1"
                        variant="outlined"
                        size="small"
                        sx={textFieldStyle}
                        value={customer.address1}
                        onChange={handleInputChange}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box className="dey">
                      <TextField
                        disabled={toogle}
                        id="customer-address2"
                        name="address2"
                        inputProps={{ ...register("address2") }}
                        error={!!errors.address2}
                        helperText={errors.address2?.message}
                        label="address line2"
                        variant="outlined"
                        size="small"
                        sx={textFieldStyle}
                        value={customer.address2}
                        onChange={handleInputChange}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </FormControl>
            </Grid>
            {/* validation part column */}
            <Grid item xs={2}>
              <Stack
                component={Paper}
                elevation={0}
                sx={{
                  p: 1,
                  borderRadius: 3,
                  width: "200px",
                  border: `1px solid ${theme.palette.primary[500]}`,
                }}
              >
                <Box display={"flex"} alignItems={"center"}>
                  <Checkbox
                    checked={!!errors.fname?.message}
                    icon={<FontAwesomeIcon icon={faCheckDouble} />}
                    checkedIcon={<FontAwesomeIcon icon={faInfo} shake />}
                  />
                  <Typography>First Name</Typography>
                </Box>
                <Box display={"flex"} alignItems={"center"}>
                  <Checkbox
                    checked={!!errors.nic?.message}
                    icon={<FontAwesomeIcon icon={faCheckDouble} />}
                    checkedIcon={<FontAwesomeIcon icon={faInfo} shake />}
                  />
                  <Typography>National ID card</Typography>
                </Box>
                <Box display={"flex"} alignItems={"center"}>
                  <Checkbox
                    checked={!!errors.phoneNumber?.message}
                    icon={<FontAwesomeIcon icon={faCheckDouble} />}
                    checkedIcon={<FontAwesomeIcon icon={faInfo} shake />}
                  />
                  <Typography>Phone number</Typography>
                </Box>
                <Box display={"flex"} alignItems={"center"}>
                  <Checkbox
                    checked={!!errors.address1?.message}
                    icon={<FontAwesomeIcon icon={faCheckDouble} />}
                    checkedIcon={<FontAwesomeIcon icon={faInfo} shake />}
                  />
                  <Typography>Address Line 1</Typography>
                </Box>
                <Box display={"flex"} alignItems={"center"}>
                  <Typography color={"error"}>
                    {dbCustomerFound && (
                      <FontAwesomeIcon icon={faTriangleExclamation} />
                    )}
                    {dbCustomerFound}
                  </Typography>
                </Box>
              </Stack>

              {/* button column */}
            </Grid>
            <Grid item xs={2}>
              <Lottie options={{ animationData: CustomerPage }} width={200} />

              {/* button column */}
            </Grid>
            <Grid item xs={1}>
              <Box
                sx={{
                  gap: 3,
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  marginTop: "20px",
                }}
              >
                {/* Open Child Customer dialog */}
                <Button
                  variant="outlined"
                  onClick={() => setOpenChildDialog(true)}
                >
                  Add Child Customer
                </Button>

                {/* The popup */}
                <AddChildCustomerDialog
                  open={openChildDialog}
                  onClose={() => setOpenChildDialog(false)}
                  onCreated={(newId) => {
                    // optional: refresh list or show toast
                    setOpenChildDialog(false);
                  }}
                />

                <Button variant="contained" type="submit">
                  Save
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  onClick={() => {
                    setCustomer({
                      fname: "",
                      lname: "",
                      nic: "",
                      phoneNumber: "",
                      address1: "",
                      address2: "",
                    });
                  }}
                >
                  Clear
                </Button>
              </Box>
            </Grid>
          </Grid>
          {/* Buttons */}
        </form>
      </Paper>
    </>
  );
}
