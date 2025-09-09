import React, { useContext, useState, useEffect } from "react";
import "../Stylings/rootstyles.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  Grid,
  Chip,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Collapse,
  Switch,
  Tooltip
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import {
  AuthContext,
  InvoiceContext,
  PopupContext,
  SwalContext,
} from "../../Contexts/Contexts.jsx";
import OverlayDialogBox from "../SubComponents/OverlayDialogBox.jsx";
import axios from "axios";
import IdCardStatus from "./Invoice/IdCardStatus.jsx";
import IdCardHandoverStatus from "./Invoice/IdCardHandoverStatus.jsx";
import InvoiceDetailsWindowUp from "./Invoice/InvoiceDetailsWindowUp.jsx";
import InvoiceDetailsWindowDown from "./Invoice/InvoiceDetailsWindowDown.jsx";
import Payments from "./Invoice/Payments.jsx";
import { useNavigate } from "react-router-dom";
import InvoicePaymentsTable from "./Invoice/InvoicePaymentsTable.jsx";
import InvoiceRightSideNew from "./Invoice/InvoiceRightSideNew.jsx";
import InvoiceHandOverForm from "./Invoice/InvoiceHandOverForm.jsx";
import FeedbackComponent from "../SubComponents/FeedbackComponent.jsx";
import CompleteInvoiceTable from "./Invoice/CompleteInvoiceTable.jsx";
import { useTheme } from "@emotion/react";
import { faAddressCard } from "@fortawesome/free-regular-svg-icons";
import YoutubeSearchedForIcon from "@mui/icons-material/YoutubeSearchedFor";
import BackspaceOutlinedIcon from "@mui/icons-material/BackspaceOutlined";
import Swal from "sweetalert2";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PeopleIcon from "@mui/icons-material/People";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const textFieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
  },
};

// Child ID Card Status Component
function ChildIdCardStatus() {
  const {
    invoiceObject,
    updateValue,
  } = useContext(InvoiceContext);

  const isKept = Boolean(invoiceObject?.childIdCardStatus);

  const handleToggle = (event) => {
    const next = event.target.checked;
    updateValue("childIdCardStatus", next);
  };

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        px: 1.25,
        py: 0.75,
        borderRadius: 2,
        bgcolor: (theme) => theme.palette.secondary[50],
        border: (theme) => `1px solid ${theme.palette.secondary[200]}`,
      }}
    >
      <Tooltip title="Toggle if the child customer's ID card is kept with you">
        <InfoOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} />
      </Tooltip>
      <Typography variant="body2">Child ID Card</Typography>
      <Switch size="small" checked={isKept} onChange={handleToggle} />
      <Chip
        size="small"
        label={isKept ? "Kept" : "Not kept"}
        color={isKept ? "success" : "default"}
        variant={isKept ? "filled" : "outlined"}
      />
    </Box>
  );
}

function Invoice() {
  const theme = useTheme();
  const {
    invoiceSearchBtnStatus,
    setInvoiceSearchBtnStatus,
    invoiceObject,
    clearObject,
    updateValue,
    setPaymentArray,
    buttonDesable,
  } = useContext(InvoiceContext);
  const { showAlert } = useContext(SwalContext);

  const navigate = useNavigate();
  const { setIsAuthenticated } = useContext(AuthContext);
  const { boolvalue, setBoolvalue } = useContext(PopupContext);

  const [phoneNumberorNic, setPhoneNumberorNic] = useState("");
  const [invoiceId, setInvoiceId] = useState("0000");
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [invoiceIdSearch, setInvoiceIdSearch] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [updateBtnStatus, setUpdateBtnStatus] = useState(false);

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

  const [numberOfInvoices, setNumberOfInvoices] = useState(0);
  const [incompleteInvoiceIds, setIncompleteInvoiceIds] = useState([]);
  const [childCustomers, setChildCustomers] = useState([]);
  const [childCustomersLoading, setChildCustomersLoading] = useState(false);
  const [showChildCustomers, setShowChildCustomers] = useState(false);
  const [selectedChildCustomer, setSelectedChildCustomer] = useState(null);
  const [inheritInvoiceId, setInheritInvoiceId] = useState("");
  const [inheritInvoiceData, setInheritInvoiceData] = useState(null);
  const [inheritInvoiceLoading, setInheritInvoiceLoading] = useState(false);
  const [inheritValidationError, setInheritValidationError] = useState("");

  useEffect(() => {}, [invoiceObject]);
  
  useEffect(() => {
    handleCreateNew();
  }, []);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const fetchChildCustomers = async (parentId) => {
    setChildCustomersLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8085/getChildCustomers/${parentId}`
      );
      if (response.data.success) {
        setChildCustomers(response.data.data);
      } else {
        setChildCustomers([]);
      }
    } catch (error) {
      console.error("Error fetching child customers:", error);
      setChildCustomers([]);
    } finally {
      setChildCustomersLoading(false);
    }
  };

  const handleInheritInvoiceSearch = async () => {
    if (!inheritInvoiceId.trim()) {
      Swal.fire("Error", "Please enter an invoice ID", "error");
      return;
    }

    setInheritValidationError("");
    setInheritInvoiceLoading(true);
    
    try {
      const response = await axios.get(
        `http://localhost:8085/invoiceDataRetrieve/${inheritInvoiceId}`
      );

      if (response.status === 200) {
        const invoiceData = response.data;
        setInheritInvoiceData(invoiceData);
        
        // Validate if the inherited invoice belongs to the same parent customer
        if (invoiceData.customerDetails && invoiceObject.customerDetails) {
          const inheritedCustomerId = invoiceData.customerDetails.cus_id;
          const currentCustomerId = invoiceObject.customerDetails.cus_id;
          
          if (inheritedCustomerId === currentCustomerId) {
            if (invoiceData.idStatus) {
              Swal.fire("Success", "ID card available from this invoice", "success");
            } else {
              Swal.fire("Info", "This invoice doesn't have an ID card on file", "info");
            }
            return;
          }
          
          try {
            const childCheckResponse = await axios.get(
              `http://localhost:8085/checkChildCustomerParent/${inheritedCustomerId}`
            );
            
            if (childCheckResponse.data.success) {
              const childParentId = childCheckResponse.data.parentId;
              if (childParentId === currentCustomerId) {
                if (invoiceData.idStatus) {
                  Swal.fire("Success", "ID card available from child customer's invoice", "success");
                } else {
                  Swal.fire("Info", "This invoice doesn't have an ID card on file", "info");
                }
                return;
              } else {
                setInheritValidationError("ID card must belong to the same parent customer or their child");
                Swal.fire("Error", "ID card must belong to the same parent customer or their child", "error");
                return;
              }
            } else {
              setInheritValidationError("ID card must belong to the same customer");
              Swal.fire("Error", "ID card must belong to the same customer", "error");
              return;
            }
          } catch (error) {
            console.error("Error checking child customer parent:", error);
            setInheritValidationError("Cannot validate customer relationship");
            Swal.fire("Error", "Cannot validate customer relationship. Please ensure the ID card belongs to the same customer.", "error");
            return;
          }
        }
        
        if (invoiceData.idStatus) {
          Swal.fire("Success", "ID card available from this invoice", "success");
        } else {
          Swal.fire("Info", "This invoice doesn't have an ID card on file", "info");
        }
      }
    } catch (error) {
      console.error("Error fetching invoice for ID inheritance:", error);
      if (error.response?.status === 404) {
        Swal.fire("Error", "Invoice not found", "error");
      } else {
        Swal.fire("Error", "Could not find the invoice", "error");
      }
      setInheritInvoiceData(null);
    } finally {
      setInheritInvoiceLoading(false);
    }
  };

  const useInheritedIdStatus = () => {
    if (inheritInvoiceData && inheritInvoiceData.idStatus) {
      // Add both child customer ID and inherited ID status to invoice object
      updateValue("iDstatus", true);
      updateValue("inheritedIdStatus", true);
      updateValue("inheritedIdInvoice", inheritInvoiceId);
      updateValue("inheritedIdCustomer", inheritInvoiceData.customerDetails);
      updateValue("childCustomerId", selectedChildCustomer.child_cus_id);
      
      Swal.fire("Success", "ID card status inherited successfully", "success");
    }
  };

  const handleSearchPhoneNumberorNic = async () => {
    if (!phoneNumberorNic) {
      setValidationMessage("Phone number, NIC, or customer ID is required");
      setNumberOfInvoices(0);
      setIncompleteInvoiceIds([]);
      return;
    }

    const trimmedValue = phoneNumberorNic.trim();

    if (
      !isValidNIC(trimmedValue) &&
      !isValidPhoneNumber(trimmedValue) &&
      !isValidId(trimmedValue)
    ) {
      setValidationMessage("Invalid phone number, NIC, or ID format");
      setNumberOfInvoices(0);
      setIncompleteInvoiceIds([]);
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
        
        setSelectedChildCustomer(null);
        updateValue("childCustomer", null);
        updateValue("childIdCardStatus", false); // Reset child ID card status
        
        fetchChildCustomers(data[0].cus_id);

        try {
          const id = data[0].cus_id;
          const cusInvoiceCount = await axios.get(
            `http://localhost:8085/reports/getCustomerRatings/${id}`
          );
          const count =
            cusInvoiceCount?.data?.response &&
            Array.isArray(cusInvoiceCount.data.response) &&
            cusInvoiceCount.data.response.length > 0
              ? cusInvoiceCount.data.response[0].number_of_invoices
              : 0;
          setNumberOfInvoices(count ?? 0);
        } catch (err) {
          setNumberOfInvoices(0);
        }

        try {
          const id = data[0].cus_id;
          const resIncomplete = await axios.get(
            `http://localhost:8085/customer/incompleteInvoices/${id}`
          );
          setIncompleteInvoiceIds(resIncomplete.data.invoiceIds || []);
        } catch (err) {
          setIncompleteInvoiceIds([]);
        }
      } else if (data.message) {
        setValidationMessage(
          "No customer found with this ID, phone number, or NIC"
        );
        setData(clearData);
        updateValue("customerDetails", clearData);
        setNumberOfInvoices(0);
        setIncompleteInvoiceIds([]);
        setChildCustomers([]);
      } else {
        console.error("Unexpected response format:", data);
        setValidationMessage("Unexpected error occurred");
        setData(clearData);
        updateValue("customerDetails", clearData);
        setNumberOfInvoices(0);
        setIncompleteInvoiceIds([]);
        setChildCustomers([]);
      }
    } catch (error) {
      setValidationMessage("Error occurred in front end");
      setData(clearData);
      updateValue("customerDetails", clearData);
      setNumberOfInvoices(0);
      setIncompleteInvoiceIds([]);
      setChildCustomers([]);
      console.error("Error in handleSearchPhoneNumberorNic:", error);
    }
  };

  const handleCreateNew = async () => {
    localStorage.removeItem("CIObject");
    setInvoiceSearchBtnStatus(false);
    setData(clearData);
    setPhoneNumberorNic("");
    setValidationMessage("");
    clearObject();
    setPaymentArray([]);
    setUpdateBtnStatus(false);
    setNumberOfInvoices(0);
    setIncompleteInvoiceIds([]);
    setChildCustomers([]);
    setSelectedChildCustomer(null);
    setInheritInvoiceId("");
    setInheritInvoiceData(null);
    setInheritValidationError("");
    try {
      await axios.get("http://localhost:8085/invoiceIdRetrieve").then((res) => {
        setInvoiceId(res.data);
        updateValue("InvoiceID", res.data);
        updateValue("createdDate", currentDate);
        updateValue("discount", 0);
      });
    } catch (error) {
      console.log("handleSearch Createinvoice error", error);
    }
  };

  const handleInvoiceSearch = async (invoiceIdSearch) => {
    clearObject();

    try {
      const response = await axios.get(
        `http://localhost:8085/invoiceDataRetrieve/${invoiceIdSearch}`
      );

      if (response.status === 200) {
        setInvoiceSearchBtnStatus(true);
        updateValue("advance", response.data.advance);
        updateValue("createdDate", response.data.createdDate);
        response.data.payments.forEach((payment) => {
          updateValue("payments", payment);
        });
        updateValue("customerDetails", response.data.customerDetails);
        
        if (response.data.childCustomer) {
          setSelectedChildCustomer(response.data.childCustomer);
          updateValue("childCustomer", response.data.childCustomer);
          updateValue("childCustomerId", response.data.childCustomer.child_cus_id);
          updateValue("childIdCardStatus", response.data.childIdCardStatus || false);
        } else {
          setSelectedChildCustomer(null);
          updateValue("childCustomer", null);
          updateValue("childCustomerId", null);
          updateValue("childIdCardStatus", false);
        }
        
        try {
          const id = response.data.customerDetails?.cus_id;
          if (id) {
            try {
              const cusInvoiceCount = await axios.get(
                `http://localhost:8085/reports/getCustomerRatings/${id}`
              );
              const count =
                cusInvoiceCount?.data?.response &&
                Array.isArray(cusInvoiceCount.data.response) &&
                cusInvoiceCount.data.response.length > 0
                  ? cusInvoiceCount.data.response[0].number_of_invoices
                  : 0;
              setNumberOfInvoices(count ?? 0);
            } catch (err) {
              setNumberOfInvoices(0);
            }

            try {
              const resIncomplete = await axios.get(
                `http://localhost:8085/customer/incompleteInvoices/${id}`
              );
              setIncompleteInvoiceIds(resIncomplete.data.invoiceIds || []);
            } catch (err) {
              setIncompleteInvoiceIds([]);
            }
            
            fetchChildCustomers(id);
          } else {
            setNumberOfInvoices(0);
            setIncompleteInvoiceIds([]);
          }
        } catch (e) {
          setNumberOfInvoices(0);
          setIncompleteInvoiceIds([]);
        }
        response.data.eqdetails.forEach((eqdetail) => {
          updateValue("eqdetails", eqdetail);
        });
        updateValue("InvoiceID", response.data.InvoiceID);
        updateValue("iDstatus", response.data.idStatus);
        updateValue("discount", response.data.discount ?? 0);
        updateValue(
          "inv_completed_datetime",
          response.data.inv_completed_datetime
        );
        
        // Set inherited ID fields if they exist
        if (response.data.inheritedIdStatus) {
          updateValue("inheritedIdStatus", response.data.inheritedIdStatus);
          updateValue("inheritedIdInvoice", response.data.inheritedIdInvoice);
          updateValue("inheritedIdCustomer", response.data.inheritedIdCustomer);
        }
        
        setUpdateBtnStatus(true);
      } else if (response.status === 404) {
        await Swal.fire({
          icon: "error",
          title: "No invoice found",
          text: `No invoice found with the number ${invoiceIdSearch}`,
          confirmButtonText: "OK",
        });
        handleCreateNew();
      } else {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: `Unexpected response status: ${response.status}`,
        });
      }
    } catch (error) {
      const status = error?.response?.status;
      if (status === 404) {
        await Swal.fire({
          icon: "error",
          title: "No invoice found",
          text: `No invoice found with the number ${invoiceIdSearch}`,
          confirmButtonText: "OK",
        });
        handleCreateNew();
      } else {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Could not retrieve the invoice. Please try again.",
        });
        console.log("Error:", error);
      }
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

  const handleProceedPayment = () => {
    setBoolvalue(true);
  };

  const handleSelectChildCustomer = (childCustomer) => {
    setSelectedChildCustomer(childCustomer);
    updateValue("childCustomer", childCustomer);
    updateValue("childCustomerId", childCustomer.child_cus_id);
    updateValue("childIdCardStatus", false); // Reset child ID card status when selecting a new child
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
            {invoiceObject.inv_completed_datetime ? (
              <>
                <Typography> Completed Date and Time </Typography>
                <Typography>
                  {new Date(
                    invoiceObject.inv_completed_datetime
                  ).toLocaleString()}
                </Typography>
              </>
            ) : (
              ""
            )}
          </Box>
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleInvoiceSearch(invoiceIdSearch);
            }}
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
              value={invoiceIdSearch}
              onChange={(e) => setInvoiceIdSearch(e.target.value)}
              sx={[{ width: "350px" }, textFieldStyle]}
              id="outlined-basic"
              label="Search with invoice Id"
              variant="outlined"
            />
            <Button type="submit">
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
                overflow: 'auto'
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
                  <Box
                    component="form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSearchPhoneNumberorNic();
                    }}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
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
                      type="submit"
                      disabled={updateBtnStatus}
                    >
                      <FontAwesomeIcon icon={faSearch} />
                    </Button>
                  </Box>

                  <Button
                    disabled={updateBtnStatus}
                    onClick={() => {
                      setData(clearData);
                      setPhoneNumberorNic("");
                      setValidationMessage("");
                      updateValue("customerDetails", clearData);
                      setNumberOfInvoices(0);
                      setIncompleteInvoiceIds([]);
                      setChildCustomers([]);
                      setSelectedChildCustomer(null);
                    }}
                    sx={{
                      color: (theme) => theme.palette.primary.error[400],
                    }}
                  >
                    <BackspaceOutlinedIcon />
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
                    onClick={handleAdvanceSearch}
                  >
                    <Typography variant="caption">
                      <PersonSearchIcon />
                    </Typography>
                  </Button>
                </Box>
                {incompleteInvoiceIds.length > 0 && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    Incomplete Invoice IDs: {incompleteInvoiceIds.join(", ")}
                  </Alert>
                )}

                {childCustomers.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        cursor: 'pointer',
                        mb: 1 
                      }}
                      onClick={() => setShowChildCustomers(!showChildCustomers)}
                    >
                      <PeopleIcon sx={{ mr: 1 }} />
                      <Typography variant="subtitle2">
                        Child Customers ({childCustomers.length})
                      </Typography>
                      {showChildCustomers ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </Box>
                    
                    <Collapse in={showChildCustomers}>
                      <Paper variant="outlined" sx={{ p: 1, mb: 2, maxHeight: 150, overflow: 'auto' }}>
                        <List dense>
                          {childCustomers.map((child) => (
                            <ListItem 
                              key={child.child_cus_id}
                              sx={{ 
                                cursor: 'pointer',
                                backgroundColor: selectedChildCustomer?.child_cus_id === child.child_cus_id 
                                  ? 'action.selected' 
                                  : 'transparent',
                                borderRadius: 1,
                                '&:hover': { backgroundColor: 'action.hover' }
                              }}
                              onClick={() => handleSelectChildCustomer(child)}
                            >
                              <ListItemText 
                                primary={`${child.child_cus_fname} ${child.child_cus_lname || ''}`}
                                secondary={`Phone: ${child.child_cus_phone_number}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    </Collapse>
                  </Box>
                )}

                {selectedChildCustomer && (
                  <Box sx={{ mt: 1 }}>
                    <Alert severity="info" sx={{ mb: 1 }}>
                      <Typography variant="subtitle2">
                        Selected Child: {selectedChildCustomer.child_cus_fname} {selectedChildCustomer.child_cus_lname || ''}
                      </Typography>
                      <Typography variant="body2">
                        Phone: {selectedChildCustomer.child_cus_phone_number}
                      </Typography>
                    </Alert>
                  </Box>
                )}

                {selectedChildCustomer && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Inherit ID from Another Invoice
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <TextField
                        value={inheritInvoiceId}
                        onChange={(e) => setInheritInvoiceId(e.target.value)}
                        sx={[{ width: '200px' }, textFieldStyle]}
                        label="Invoice ID"
                        variant="outlined"
                        size="small"
                        error={!!inheritValidationError}
                        helperText={inheritValidationError}
                      />
                      <Button 
                        onClick={handleInheritInvoiceSearch}
                        disabled={inheritInvoiceLoading}
                        variant="outlined"
                        size="small"
                      >
                        {inheritInvoiceLoading ? 'Searching...' : 'Search'}
                      </Button>
                    </Box>
                    
                    {inheritInvoiceData && (
                      <Alert 
                        severity={inheritInvoiceData.idStatus ? "success" : "warning"}
                        sx={{ mb: 1 }}
                        action={
                          inheritInvoiceData.idStatus && (
                            <Button 
                              color="inherit" 
                              size="small"
                              onClick={useInheritedIdStatus}
                            >
                              Use This ID
                            </Button>
                          )
                        }
                      >
                        <Typography variant="body2">
                          Invoice #{inheritInvoiceId}: {inheritInvoiceData.idStatus 
                            ? "ID Card Available" 
                            : "No ID Card on File"}
                        </Typography>
                        {inheritInvoiceData.customerDetails && (
                          <Typography variant="caption" display="block">
                            Customer: {inheritInvoiceData.customerDetails.cus_fname} {inheritInvoiceData.customerDetails.cus_lname || ''}
                          </Typography>
                        )}
                      </Alert>
                    )}
                  </Box>
                )}

                <Box sx={{ mt: 1 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: "text.secondary", mb: 1 }}
                  >
                    Customer Details
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">
                          Full Name
                        </Typography>
                        <Typography variant="body1">
                          {invoiceObject.customerDetails.cus_fname && invoiceObject.customerDetails.cus_lname
                            ? `${invoiceObject.customerDetails.cus_fname} ${invoiceObject.customerDetails.cus_lname}`
                            : invoiceObject.customerDetails.cus_fname || "—"}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">
                          Phone
                        </Typography>
                        <Typography variant="body1">
                          {invoiceObject.customerDetails.cus_phone_number ?? "—"}
                        </Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">
                          Address
                        </Typography>
                        <Typography variant="body1">
                          {invoiceObject.customerDetails.cus_address1 && invoiceObject.customerDetails.cus_address2
                            ? `${invoiceObject.customerDetails.cus_address1} ${invoiceObject.customerDetails.cus_address2}`
                            : invoiceObject.customerDetails.cus_address1 || "—"}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">
                          NIC
                        </Typography>
                        <Typography variant="body1">
                          {invoiceObject.customerDetails.nic ?? "—"}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">
                          Invoices
                        </Typography>
                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
                          <Chip
                            size="small"
                            icon={<InsertDriveFileIcon fontSize="small" />}
                            label={`Total: ${numberOfInvoices ?? 0}`}
                            sx={{
                              bgcolor: numberOfInvoices > 5 ? "#e6f4ea" : "#f5f5f5",
                              color: numberOfInvoices >= 5 ? "#019301ff" : "#717171ff",
                            }}
                          />
                          <Chip
                            size="small"
                            label={`Completed: ${Math.max((numberOfInvoices || 0) - ((incompleteInvoiceIds && incompleteInvoiceIds.length) || 0), 0)}`}
                            variant="outlined"
                          />
                          <Chip
                            size="small"
                            label={`Pending: ${(incompleteInvoiceIds && incompleteInvoiceIds.length) || 0}`}
                            color="warning"
                            variant="outlined"
                          />
                        </Stack>
                      </Grid>
                    </Grid>
                  </Paper>
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
                  <IdCardStatus />
                  <IdCardHandoverStatus />
                  {selectedChildCustomer && <ChildIdCardStatus />}
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
      <OverlayDialogBox>
        <Payments handleInvoiceSearch={handleInvoiceSearch} />
      </OverlayDialogBox>
    </>
  );
}

export default Invoice;