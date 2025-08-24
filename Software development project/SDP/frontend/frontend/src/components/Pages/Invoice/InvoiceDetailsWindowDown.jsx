import {
  Box,
  Paper,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
} from "@mui/material";
import { Button } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { InvoiceContext } from "../../../Contexts/Contexts";
import axios from "axios";
import Swal from "sweetalert2";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import { InvoicePdfWarehouseHandler } from "../../RoleBasedAccess/Warehouse handler/Invoice/InvoiceWarehouseHandler";
import TemporaryBill from "../../SubComponents/TemporaryBill";
import ReceiptIcon from "@mui/icons-material/Receipt";

function InvoiceDetailsWindowDown(props) {
  const [discount, setDiscount] = useState();
  const [openDialog, setOpenDialog] = useState(false);
  const [openOtherDialog, setOpenOtherDialog] = useState(false);
  const handlePdfButtonClick = () => {
    setOpenDialog(true);
  };

  const handleOtherDialogButtonClick = () => {
    setOpenOtherDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOpenOtherDialog(false);
  };

  const {
    updateBtnStatus,
    setUpdateBtnStatus,
    handleCreateNew,
    handleInvoiceSearch,
  } = props;
  const {
    fullDetailsEquipmentArray,
    setFullDetailsEquipmentArray,
    checkState,
    responseManageToogle,
    clearValues,
    setResponseManageToogle,
    invoiceSearchBtnStatus,
    setInvoiceSearchBtnStatus,
    setCheckState,
    eqObject,
    setEqObject,
    invoiceObject,
    setInvoiceObject,
    clearObject,
    updateValue,
    updateEqObject,
    machineTotalCost,
    setMachineTotalCost,
    buttonDesable,
    setButtonDisable,
  } = useContext(InvoiceContext);

  const calculateTotalPayments = () => {
    let total = 0;
    for (const payment of invoiceObject.payments) {
      total = payment.invpay_amount + total;
    }
    total = total + invoiceObject.advance;
    return total;
  };

  useEffect(() => {
    if (invoiceObject.inv_completed_datetime != null) {
      console.log("type is", invoiceObject.inv_completed_datetime);
      console.log("completed date has a value");

      setButtonDisable(true);
    } else {
      setButtonDisable(false);
      console.log("type is", invoiceObject.inv_completed_datetime);

      console.log("completed date is null");
    }
    setDiscount(machineTotalCost - calculateTotalPayments());
  }, [machineTotalCost, invoiceObject]);

  const handlediscount = (value) => {
    console.log(calculateTotalPayments(), value);
    if (value > machineTotalCost - calculateTotalPayments()) {
      setDiscount(machineTotalCost - calculateTotalPayments());
      Swal.fire({
        title: "Cost Error?",
        text: "Please enter the discount lower than the cost",
        icon: "error",
      });
    } else {
      setDiscount(machineTotalCost - calculateTotalPayments() - value);
      return machineTotalCost - calculateTotalPayments() - value;
    }
  };
  const handleInvoiceSubmit = async () => {
    // localStorage.setItem("CIObject", JSON.stringify(invoiceObject));
    // const localInvoiceObject = localStorage.getItem("CIObject");
    console.log("Local storage retrieval", invoiceObject.InvoiceID);

    if (invoiceObject) {
      if (invoiceObject.InvoiceID > 0) {
        if (
          invoiceObject.hasOwnProperty("customerDetails") &&
          invoiceObject.customerDetails.cus_id > 0
        ) {
          if (invoiceObject.eqdetails.length > 0) {
            if (invoiceObject.advance > 0) {
              console.log("Local storage retrieval", invoiceObject);
              try {
                // Send the object to the backend
                await axios.post(
                  "http://localhost:8085/createInvoiceDetails",
                  invoiceObject
                );
                Swal.fire({
                  position: "top-end",
                  icon: "success",
                  title: "Your work has been saved",
                  showConfirmButton: false,
                  timer: 1500,
                });

                console.log("Invoice details updated successfully");
              } catch (error) {
                Swal.fire({
                  icon: "error",
                  title: "Oops...",
                  text: "Try again!",
                  footer:
                    '<span style={{color:"red}}>Error occurred in front end AXIOS invoice pass?</span>',
                });
                console.error(
                  "Error occurred in front end AXIOS invoice pass",
                  error
                );
              }
            } else {
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Didn't he pay you!",
                footer: '<a href="#">Why do I have this issue?</a>',
              });
              console.log("Advance payment is not greater than 0");
            }
          } else {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Enter machine details!",
              footer: '<a href="#">Why do I have this issue?</a>',
            });
            console.log("No equipment details found");
          }
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Enter Customer Details!",
            footer: '<a href="#">Why do I have this issue?</a>',
          });
          console.log(
            "Customer ID is not greater than 0 MEANS Customer is not found"
          );
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Create a New Invoice!",
          footer: '<a href="#">Why do I have this issue?</a>',
        });
        console.log("Invoice Id should be present");
      }
    } else {
      console.log("Invoice object is undefined");
    }
  };
  const handleInvoiceUpdate = async () => {
    if (invoiceObject) {
      if (invoiceObject.InvoiceID > 0) {
        if (
          invoiceObject.hasOwnProperty("customerDetails") &&
          invoiceObject.customerDetails.cus_id > 0
        ) {
          if (invoiceObject.eqdetails.length > 0) {
            if (invoiceObject.advance > 0) {
              try {
                // Send the object to the backend
                await axios.post(
                  "http://localhost:8085/updateInvoiceDetails",
                  invoiceObject
                );
                Swal.fire({
                  position: "top-end",
                  icon: "success",
                  title: "Your work has been saved",
                  showConfirmButton: false,
                  timer: 500,
                });
                setUpdateBtnStatus(false);

                handleInvoiceSearch(invoiceObject.InvoiceID);
              } catch (error) {
                Swal.fire({
                  icon: "error",
                  title: "Oops...",
                  text: "Try again!",
                  footer:
                    '<span style={{color:"red}}>Error occurred in front end AXIOS invoice pass?</span>',
                });
                console.error(
                  "Error occurred in front end AXIOS invoice pass",
                  error
                );
              }
            } else {
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Didn't he pay you!",
                footer: '<a href="#">Why do I have this issue?</a>',
              });
              console.log("Advance payment is not greater than 0");
            }
          } else {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Enter machine details!",
              footer: '<a href="#">Why do I have this issue?</a>',
            });
            console.log("No equipment details found");
          }
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Enter Customer Details!",
            footer: '<a href="#">Why do I have this issue?</a>',
          });
          console.log(
            "Customer ID is not greater than 0 MEANS Customer is not found"
          );
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Create a New Invoice!",
          footer: '<a href="#">Why do I have this issue?</a>',
        });
        console.log("Invoice Id should be present");
      }
    } else {
      console.log("Invoice object is undefined");
    }
  };
  const handleCompletedButtonClick = async () => {
    try {
      invoiceObject.eqdetails.forEach((element) => {
        if (element.inveq_return_date == null) {
          Swal.fire({
            title: "Some items has not returned?",
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: "It is okay",
            denyButtonText: `Then wait`,
          }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {
              Swal.fire("Saved!", "", "success");
              invoiceObject.invoiceCompletedDate = new Date();
              handleInvoiceUpdate();
              setButtonDisable(true);
            } else if (result.isDenied) {
              Swal.fire("Changes are not saved", " ", "info");
            }
          });
        } else {
          invoiceObject.invoiceCompletedDate = new Date();
          handleInvoiceUpdate();
          setButtonDisable(true);
        }
      });
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <>
      <Paper
        elevation={3}
        sx={{
          position: "relative",
          width: "100%",
          display: "flex",
          justifyContent: "start",
          p: 3,
          borderRadius: "0px 0px 12px 12px",
          height: "80%",
        }}
      >
        <Box position={"absolute"} bottom={5} width={"100%"} paddingRight={6}>
          {invoiceSearchBtnStatus && (
            <Box
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <TextField
                defaultValue={0}
                sx={{ alignSelf: "end" }}
                onChange={(e) => handlediscount(e.target.value)}
                id="outlined-basic"
                label="Discount"
                variant="outlined"
              />
              <Typography
                sx={{
                  color: discount ? "red" : "green",
                  fontWeight: "bold",
                }}
              >
                Payment amount : {discount} LKR
              </Typography>
            </Box>
          )}
        </Box>

        {/* <Box width="60%" sx={{display:"flex",flexDirection:"column",gap:3}}>
            <Typography variant='h6'>Advance</Typography>
            <Typography variant='h7'>Payments</Typography>
        </Box>
        <Box width="40%" sx={{display:"flex",flexDirection:"column",gap:3}}>
            <Typography variant='h6' sx={{textAlign:"end"}}>2000 LKR</Typography>
            <Typography variant='h7' sx={{textAlign:"end"}}></Typography>
        </Box> */}
        <Box
          sx={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ display: "flex", width: "100%" }}>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {/* Machine Cost row */}
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography
                  variant="h6"
                  sx={{ color: "green", fontWeight: "bold" }}
                >
                  Machine Cost
                </Typography>
                {invoiceSearchBtnStatus && (
                  <Typography
                    variant="h6"
                    sx={{ color: "green", fontWeight: "bold" }}
                  >
                    {machineTotalCost} LKR
                  </Typography>
                )}
              </Box>

              {/* Advance row */}
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography
                  variant="h6"
                  sx={{ color: "#ff9999", fontWeight: "bold" }}
                >
                  Advance
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: "#ff9999", fontWeight: "bold" }}
                >
                  {!!invoiceObject.advance
                    ? `${invoiceObject.advance} LKR`
                    : ""}
                </Typography>
              </Box>

              {/* Payments row(s) */}
              {invoiceObject.payments &&
                invoiceObject.payments.map((item, index) => (
                  <Box
                    key={index}
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ color: "#ff9999", fontWeight: "bold" }}
                    >
                      {`Payment ${index + 1}`}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: "#ff9999", fontWeight: "bold" }}
                    >
                      {item.invpay_amount ? `${item.invpay_amount} LKR` : ""}
                    </Typography>
                  </Box>
                ))}

              {/* Total row */}
              {(invoiceObject.advance ||
                invoiceObject.payments?.length > 0) && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography
                    variant="h6"
                    sx={{ color: "red", fontWeight: "bold" }}
                  >
                    Total Payments
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      textDecoration: "underline",
                      color: "red",
                      fontWeight: "bold",
                    }}
                  >
                    {calculateTotalPayments()} LKR
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
          <Box
            sx={{ height: "100%", width: "100%" }}
            display={"flex"}
            justifyContent={"end"}
            alignItems={"end"}
          ></Box>
        </Box>
      </Paper>
      <Box display={"flex"} alignItems={"center"} gap={1}>
        {invoiceSearchBtnStatus == true ? (
          <Button
            disabled={buttonDesable}
            fullWidth
            variant="contained"
            sx={{ mt: 1, borderRadius: 0, height: "60px", width: "13vw" }}
            onClick={handleInvoiceUpdate}
          >
            Update Invoice
          </Button>
        ) : (
          <Button
            color="success"
            variant="contained"
            sx={{ mt: 1, borderRadius: 0, height: "60px", width: "13vw" }}
            onClick={handleInvoiceSubmit}
          >
            Create Invoice
          </Button>
        )}
        <Button
          onClick={handlePdfButtonClick}
          disabled={buttonDesable}
          variant="contained"
          sx={{ height: "60px", width: "20px", mt: 1 }}
        >
          <PictureAsPdfRoundedIcon sx={{ color: "white" }} />
        </Button>
        <Button
          onClick={handleOtherDialogButtonClick}
          disabled={buttonDesable}
          variant="outlined"
          sx={{ height: "60px", width: "20px", mt: 1 }}
        >
          <ReceiptIcon />
        </Button>

        <Button
          color="success"
          onClick={handleCompletedButtonClick}
          disabled={buttonDesable}
          variant="outlined"
          sx={{ height: "60px", width: "20px", mt: 1 }}
        >
          O
        </Button>
      </Box>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ display: "flex", justifyContent: "center" }}>
          <InvoicePdfWarehouseHandler />
        </DialogContent>
      </Dialog>
      <Dialog open={openOtherDialog} onClose={handleCloseDialog}>
        <DialogContent>
          <TemporaryBill />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default InvoiceDetailsWindowDown;
