import React, { useContext, useState, useEffect } from "react";
import "../Stylings/rootstyles.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Box,
  Button,
  Fab,
  FormLabel,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faUpload } from "@fortawesome/free-solid-svg-icons";
import {
  AuthContext,
  InvoiceContext,
  PopupContext,
  SwalContext,
} from "../../Contexts/Contexts.jsx";
import OverlayDialogBox from "../SubComponents/OverlayDialogBox.jsx";
import axios from "axios";
import IdCardStatus from "./Invoice/IdCardStatus.jsx";
import InvoiceDetailsWindowUp from "./Invoice/InvoiceDetailsWindowUp.jsx";
import InvoiceDetailsWindowDown from "./Invoice/InvoiceDetailsWindowDown.jsx";
import Payments from "./Invoice/Payments.jsx";
import { useNavigate } from "react-router-dom";
import InvoicePaymentsTable from "./Invoice/InvoicePaymentsTable.jsx";
import InvoiceRightSideNew from "./Invoice/InvoiceRightSideNew.jsx";
import InvoiceHandOverForm from "./Invoice/InvoiceHandOverForm.jsx";
import FeedbackComponent from "../SubComponents/FeedbackComponent.jsx";
import CompleteInvoiceTable from "./Invoice/CompleteInvoiceTable.jsx";
import InvoicePdf from "./Invoice/InvoicePdf.jsx";
import { useTheme } from "@emotion/react";
import { faAddressCard } from "@fortawesome/free-regular-svg-icons";
import YoutubeSearchedForIcon from "@mui/icons-material/YoutubeSearchedFor";
import BackspaceOutlinedIcon from "@mui/icons-material/BackspaceOutlined";
import Swal from "sweetalert2";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import AddIcCallOutlinedIcon from "@mui/icons-material/AddIcCallOutlined";
import ContactMailOutlinedIcon from "@mui/icons-material/ContactMailOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import { InvoicePdfWarehouseHandler } from "../RoleBasedAccess/Warehouse handler/Invoice/InvoiceWarehouseHandler.jsx";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
           
const textFieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
  },
};
function Invoice() {
  const theme = useTheme();
  const {
    fullDetailsEquipmentArray,
    setFullDetailsEquipmentArray,
    checkState,
    setCheckState,
    setPaymentArray,
    eqObject,
    setEqObject,
    invoiceSearchBtnStatus,
    setInvoiceSearchBtnStatus,
    invoiceObject,
    setInvoiceObject,
    clearObject,
    updateValue,
    clearValues,
    buttonDesable,
    setButtonDisable,
    updateEqObject,
  } = useContext(InvoiceContext);
  const { showAlert } = useContext(SwalContext);

  const navigate = useNavigate();
  const { setIsAuthenticated } = useContext(AuthContext);
  const [phoneNumberorNic, setPhoneNumberorNic] = useState("");
  const [invoiceId, setInvoiceId] = useState("0000");
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [invoiceIdSearch, setInvoiceIdSearch] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [updateBtnStatus, setUpdateBtnStatus] = useState(false);

  
  useEffect(() => {}, [invoiceObject]);
  //Create new invoice
  useEffect(() => {
    handleCreateNew();
  }, []);
  //Clock
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  const [data, setData] = useState({
    cus_fname: "",
    cus_address1: "",
    cus_address2: "",
    nic: "",
    cus_phone_number: "",
    cus_id: "",
  });

  const [clearData, setClearData] = useState({
    cus_fname: "",
    cus_address1: "",
    cus_address2: "",
    nic: "",
    cus_phone_number: "",
    Cus: "",
  });

  const handleProceedPayment = () => {
    setBoolvalue(true);
  };

  const { boolvalue, setBoolvalue, userData, setUserData } =
    useContext(PopupContext);

  const handleSearchPhoneNumberorNic = async () => {
    if (!phoneNumberorNic) {
      setValidationMessage("Phone number, NIC, or customer ID is required");
      return;
    }

    const trimmedValue = phoneNumberorNic.trim();

    if (
      !isValidNIC(trimmedValue) &&
      !isValidPhoneNumber(trimmedValue) &&
      !isValidId(trimmedValue)
    ) {
      setValidationMessage("Invalid phone number, NIC, or ID format");
      return;
    }

    setValidationMessage("");

    try {
      let res;
      if (isValidId(trimmedValue)) {
        res = await axios.get(
          `http://localhost:8085/getCustomerbyPhoneNumberOrNic/${trimmedValue}`
        );
      } else {
        res = await axios.get(
          `http://localhost:8085/getCustomerbyPhoneNumberOrNic/${trimmedValue}`
        );
      }

      const data = res.data;

      if (Array.isArray(data) && data.length > 0) {
        setData(data[0]);
        updateValue("customerDetails", data[0]);
      } else if (data.message) {
        setValidationMessage(
          "No customer found with this ID, phone number, or NIC"
        );
        setData({
          cus_fname: "",
          cus_address1: "",
          cus_address2: "",
          nic: "",
          cus_phone_number: "",
          cus_id: "",
        });
        updateValue("customerDetails", clearData);
      } else {
        console.error("Unexpected response format:", data);
        setValidationMessage("Unexpected error occurred");
        setData({
          cus_fname: "",
          cus_address1: "",
          cus_address2: "",
          nic: "",
          cus_phone_number: "",
          cus_id: "",
        });
        updateValue("customerDetails", clearData);
      }
    } catch (error) {
      setValidationMessage("Error occurred in front end");
      setData({
        cus_fname: "",
        cus_address1: "",
        cus_address2: "",
        nic: "",
        cus_phone_number: "",
        cus_id: "",
      });
      updateValue("customerDetails", clearData);
      console.error("Error in handleSearchPhoneNumberorNic:", error);
    }
  };

  const isValidId = (id) => {
    const validIdFormat = /^\d{1,4}$/;
    return validIdFormat.test(id) && parseInt(id) < 10000;
  };

  const isValidNIC = (nic) => {
    const nineDigitsAndV = /^[0-9]{9}v$/i;
    const twelveDigits = /^[0-9]{12}$/;
    return nineDigitsAndV.test(nic) || twelveDigits.test(nic);
  };

  const isValidPhoneNumber = (phoneNumber) => {
    phoneNumber = phoneNumber.replace(/[-\s]/g, "").trim();
    const validFormatCheck1 = /^[1-9]\d{8}$/;
    const validFormatCheck2 = /^[0]\d{9}$/;
    return (
      validFormatCheck1.test(phoneNumber) || validFormatCheck2.test(phoneNumber)
    );
  };

  const handleCreateNew = async () => {
    localStorage.removeItem("CIObject");
    setInvoiceSearchBtnStatus(false);
    setData(clearData);
    setEqObject("");
    clearObject();
    setPaymentArray([]);
    setUpdateBtnStatus(false);
    try {
      await axios.get("http://localhost:8085/invoiceIdRetrieve").then((res) => {
        console.log(res.data);
        setInvoiceId(res.data);
        updateValue("InvoiceID", res.data);
        updateValue("createdDate", currentDate);
      });
    } catch (error) {
      console.log("handleSearch Createinvoice error", error);
    }
  };

  const handleInvoiceSearch = async (invoiceIdSearch) => {
    clearObject();

    try {
      console.log(invoiceIdSearch);
      const response = await axios.get(
        `http://localhost:8085/invoiceDataRetrieve/${invoiceIdSearch}`
      );

      if (response.status === 200) {
        setInvoiceSearchBtnStatus(true);
        console.log("Invoice details:", response.data);
        updateValue("advance", response.data.advance);
        updateValue("createdDate", response.data.createdDate);
        response.data.payments.forEach((payment) => {
          // Pass each payment object to the updateValue function
          updateValue("payments", payment);
        });
        console.log(response.data.customerDetails.length);
        updateValue("customerDetails", response.data.customerDetails);
        response.data.eqdetails.forEach((eqdetail) => {
          // Pass each payment object to the updateValue function
          updateValue("eqdetails", eqdetail);
        });
        updateValue("InvoiceID", response.data.InvoiceID);
        updateValue("iDstatus", response.data.idStatus);
        updateValue(
          "inv_completed_datetime",
          response.data.inv_completed_datetime
        );
        console.log("object", response.data.eqdetails);
        setUpdateBtnStatus(true);
      } else if (response.status == 404) {
        console.log("Invoice not found");
      } else {
        console.log("Unexpected response status:", response.status);
      }
    } catch (error) {
      console.log("Error:", error);
    }
  };
  const handleAdvanceSearch = () => {
    Swal.fire({
      title: "Redirect to the customer page?",
      text: "Your current work will be lost!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Proceed!",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/customers");
      }
    });
  };
  const textFieldStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
    },
  };
  const handleDownload = () => {
    const capture = document.querySelector(`.complete-invoice`);

    html2canvas(capture).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const doc = new jsPDF("p", "mm", "a4");
      const componentWidth = doc.internal.pageSize.getWidth();
      const componentHeight = (canvas.height * componentWidth) / canvas.width;
      doc.addImage(imgData, "PNG", 0, 0, componentWidth, componentHeight);
      doc.save("recipt.pdf");
    });
  };

  return (
    <>
      <Box
        style={{
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "start",
          Width: "100%",
          minHeight: "100vh",
          pl: 1,
        }}
      >
        <Box
          sx={{
            backgroundColor: (theme) => theme.palette.primary[50],
            display: "flex",
            width: "100%",
            minHeight: "8vh",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "23.6%",
            }}
          >
            {invoiceObject.inv_completed_datetime ? (<>
            <Typography> Completed Date and Time </Typography>
              <Typography>{new Date(invoiceObject.inv_completed_datetime).toLocaleString()}</Typography>
            </>
            ) : (
              ""
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "52.4%",
              gap: 2,
              pl: 5,
              pr: 5,
            }}
          >
            <TextField
              onChange={(e) => setInvoiceIdSearch(e.target.value)}
              sx={[{ width: "350px" }, textFieldStyle]}
              id="outlined-basic"
              label="Search with invoice Id"
              variant="outlined"
            />
            <Button onClick={() => handleInvoiceSearch(invoiceIdSearch)}>
              <YoutubeSearchedForIcon />
            </Button>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-evenly",
              alignItems: "center",
              width: "23.6%",
              gap: 2,
            }}
          >
            <Button onClick={handleCreateNew} variant="contained">
              Create new
            </Button>
            <Box sx={{ width: "180px" }}>
              <h5>Invoice ID: {invoiceObject.InvoiceID}</h5>
              {updateBtnStatus ? (
                <h6>{new Date(invoiceObject.createdDate).toLocaleString()}</h6>
              ) : (
                <h6>{currentDateTime.toLocaleString()}</h6>
              )}
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            width: "100%",
            height: "55vh",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              width: "23.6%",
            }}
          >
            {updateBtnStatus == true ? (
              <InvoiceHandOverForm />
            ) : (
              <InvoiceRightSideNew />
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              width: "52.4%",
            }}
          >
            <Paper
              elevation={3}
              sx={{
                width: "95%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                pt: 3,
                pb: 3,
                borderRadius: 3,
              }}
            >
              <Box
                width={"100px"}
                height={"100px"}
                position={"inherit"}
                sx={{ mt: -1, ml: -22 }}
              >
                <FontAwesomeIcon
                  icon={faAddressCard}
                  size="2xl"
                  style={{
                    fontSize: "3rem",
                    color: theme.palette.primary[100],
                  }}
                />
              </Box>
              {/* <Box
                sx={{
                  display: "flex",
                  width: "20%",
                  flexDirection: "column",
                  justifyContent: "space-evenly",
                  alignItems: "end",

                  mr: 2,
                }}
              >

                <FormLabel sx={{ fontSize: "15px" }}>Customer Name</FormLabel>
                <FormLabel sx={{ fontSize: "15px" }}>
                  Customer Address
                </FormLabel>
                <FormLabel sx={{ fontSize: "15px" }}>Customer NIC </FormLabel>
                <FormLabel sx={{ fontSize: "15px" }}>
                  Customer Phone number
                </FormLabel>
              </Box> */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 2,
                  width: "70%",
                }}
              >
                <Box
                  sx={{
                    border: `${theme.palette.primary[200]} solid 3px`,
                    display: "flex",
                    justifyContent: "start",
                    alignItems: "center",
                    width: "100%",
                    gap: 2,
                    p: 1,
                    borderRadius: 5,
                  }}
                >
                  <TextField

                    onChange={(e) => {
                      setPhoneNumberorNic(e.target.value);
                      setValidationMessage("");
                    }}
                    value={phoneNumberorNic}
                    disabled={updateBtnStatus}
                    sx={[{ width: "350px" }, textFieldStyle]}
                    id="outlined-basic"
                    label="Search with phone number or NIC"
                    variant="outlined"
                    error={!!validationMessage}
                    helperText={validationMessage}
                  />
                  <Button
                    sx={{ height: "35px" }}
                    onClick={handleSearchPhoneNumberorNic}
                  >
                    <FontAwesomeIcon icon={faSearch} />
                  </Button>

                  <Button
                    onClick={() => {
                      setData(clearData);
                      setPhoneNumberorNic("");
                      setValidationMessage("");
                      updateValue("customerDetails", clearData);
                    }}
                    sx={{
                      color: (theme) => theme.palette.primary.error[400],
                    }}
                  >
                    <BackspaceOutlinedIcon />{" "}
                  </Button>
                  <Box flexGrow={1} />
                  <Button
                    variant="outlined"
                    sx={{
                      borderRadius: "50%",
                      width: "50px",
                      height: "55px",
                      p: 0,
                    }}
                    size="small"
                    onClick={() => handleAdvanceSearch()}
                  >
                    <Typography variant="caption">
                      <PersonSearchIcon />
                    </Typography>
                  </Button>
                </Box>

                <Box>
                  <TextField
                    sx={[textFieldStyle]}
                    fullWidth
                    disabled
                    value={
                      invoiceObject.customerDetails.cus_fname &&
                      invoiceObject.customerDetails.cus_lname
                        ? `${invoiceObject.customerDetails.cus_fname} ${invoiceObject.customerDetails.cus_lname}`
                        : invoiceObject.customerDetails.cus_fname || ""
                    }
                    label="Customer Full Name"
                    variant="outlined"
                  />
                </Box>

                <Box>
                  <TextField
                    sx={[textFieldStyle]}
                    fullWidth
                    label="Customer Address"
                    disabled
                    value={
                      invoiceObject.customerDetails.cus_address1 &&
                      invoiceObject.customerDetails.cus_address2
                        ? `${invoiceObject.customerDetails.cus_address1} ${invoiceObject.customerDetails.cus_address2}`
                        : invoiceObject.customerDetails.cus_address1 || ""
                    }
                    variant="outlined"
                  />
                </Box>

                <Box sx={{ display: "flex", gap: 4 }}>
                  <TextField
                    disabled
                    label="Customer NIC"
                    sx={[textFieldStyle]}
                    value={
                      invoiceObject.customerDetails.nic == undefined
                        ? ""
                        : invoiceObject.customerDetails.nic
                    }
                    variant="outlined"
                  />
                  <IdCardStatus />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    disabled
                    sx={[textFieldStyle]}
                    value={
                      invoiceObject.customerDetails.cus_phone_number ==
                      undefined
                        ? ""
                        : invoiceObject.customerDetails.cus_phone_number
                    }
                    id="outlined-basic"
                    label="Customer Phone number"
                    variant="outlined"
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Button
                    disabled={buttonDesable}
                    customvariant="custom"
                    variant="contained"
                    onClick={handleProceedPayment}
                  >
                    Payments
                  </Button>

                  {/* <Fab variant="extended" onClick={handleFeedback}>
                    <NavigationIcon sx={{ mr: 1 }} />
                    Feedback
                  </Fab> */}
                  {invoiceSearchBtnStatus && <FeedbackComponent />}
                </Box>
              </Box>
            </Paper>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              width: "23.6%",
            }}
          >
            <InvoiceDetailsWindowUp />
          </Box>
        </Box>

        <Box
          minHeight={300}
          sx={{
            display: "flex",
            width: "100%",
            height: "37vh",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "start",
              width: "23.6%",
            }}
          >
            <InvoicePaymentsTable />
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "start",
              width: "52.4%",
              p: 3,
            }}
          >
            <CompleteInvoiceTable />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "start",
              width: "23.6%",
            }}
          >
            <InvoiceDetailsWindowDown
              handleCreateNew={handleCreateNew}
              updateBtnStatus={updateBtnStatus}
              setUpdateBtnStatus={setUpdateBtnStatus}
              handleInvoiceSearch={handleInvoiceSearch}
            />
          </Box>
        </Box>
      </Box>
      {/* <InvoicePdfWarehouseHandler/> */}
      <OverlayDialogBox>
        <Payments handleInvoiceSearch={handleInvoiceSearch} />
      </OverlayDialogBox>
      {/* {isInvoiceUpdateFormShow && (
        <InvoiceUpdateForm
          setIsInvoiceUpdateFormShow={setIsInvoiceUpdateFormShow} isInvoiceUpdateFormShow={isInvoiceUpdateFormShow}
        />
      )} */}
    </>
  );
}

export default Invoice;
