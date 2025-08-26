import {
  Box,
  Paper,
  Typography,
  Dialog,
  DialogContent,
  TextField,
  InputAdornment,
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
  const [openDialog, setOpenDialog] = useState(false);
  const [openOtherDialog, setOpenOtherDialog] = useState(false);

  // Discount state and helpers
  const [discountInput, setDiscountInput] = useState(0);
  const [netPayable, setNetPayable] = useState(0);

  const toNumber = (v) =>
    v === undefined || v === null || v === "" || isNaN(Number(v)) ? 0 : Number(v);
  const fmtLKR = (n) => `${toNumber(n).toLocaleString("en-LK")} LKR`;

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
    let total = toNumber(invoiceObject?.advance);
    for (const payment of invoiceObject?.payments || []) {
      total += toNumber(payment?.invpay_amount);
    }
    return total;
  };

  useEffect(() => {
    const completed = invoiceObject?.inv_completed_datetime != null;
    setButtonDisable(!!completed);

    const advAndPays = calculateTotalPayments();
    const existingDiscount = toNumber(invoiceObject?.discount);
    setDiscountInput(existingDiscount);

    const balance = Math.max(
      0,
      toNumber(machineTotalCost) - advAndPays - existingDiscount
    );
    setNetPayable(balance);
  }, [machineTotalCost, invoiceObject]);

  const handleDiscountChange = (value) => {
    const v = toNumber(value);
    const advAndPays = calculateTotalPayments();
    const maxDiscount = Math.max(0, toNumber(machineTotalCost) - advAndPays);

    if (v > maxDiscount) {
      setDiscountInput(maxDiscount);
      setNetPayable(0);
      Swal.fire({
        title: "Cost Error?",
        text: "Please enter a discount less than or equal to the remaining balance.",
        icon: "error",
      });
    } else {
      setDiscountInput(v);
      setNetPayable(
        Math.max(0, toNumber(machineTotalCost) - advAndPays - v)
      );
    }
  };

  const applyDiscount = async () => {
    try {
      const payload = { ...invoiceObject, discount: toNumber(discountInput) };
      setInvoiceObject(payload);

      if (invoiceSearchBtnStatus) {
        await axios.post("http://localhost:8085/updateInvoiceDetails", payload);
        Swal.fire({
          icon: "success",
          title: "Discount applied",
          showConfirmButton: false,
          timer: 800,
        });
        handleInvoiceSearch(invoiceObject.InvoiceID);
      } else {
        Swal.fire({
          icon: "success",
          title: "Discount set",
          text: "It will be saved with the invoice.",
          showConfirmButton: false,
          timer: 1000,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to apply discount",
        text: "Please try again.",
      });
      console.error("Error applying discount:", error);
    }
  };

  const handleInvoiceSubmit = async () => {
    // Create new invoice
    if (invoiceObject) {
      if (invoiceObject.InvoiceID > 0) {
        if (
          invoiceObject.hasOwnProperty("customerDetails") &&
          invoiceObject.customerDetails.cus_id > 0
        ) {
          if (invoiceObject.eqdetails.length > 0) {
            if (toNumber(invoiceObject.advance) > 0) {
              try {
                const payload = {
                  ...invoiceObject,
                  discount: toNumber(discountInput),
                };
                await axios.post(
                  "http://localhost:8085/createInvoiceDetails",
                  payload
                );
                Swal.fire({
                  position: "top-end",
                  icon: "success",
                  title: "Your work has been saved",
                  showConfirmButton: false,
                  timer: 1500,
                });
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
            }
          } else {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Enter machine details!",
              footer: '<a href="#">Why do I have this issue?</a>',
            });
          }
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Enter Customer Details!",
            footer: '<a href="#">Why do I have this issue?</a>',
          });
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Create a New Invoice!",
          footer: '<a href="#">Why do I have this issue?</a>',
        });
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
            if (toNumber(invoiceObject.advance) > 0) {
              try {
                const payload = {
                  ...invoiceObject,
                  discount: toNumber(discountInput),
                };
                await axios.post(
                  "http://localhost:8085/updateInvoiceDetails",
                  payload
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
            }
          } else {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Enter machine details!",
              footer: '<a href="#">Why do I have this issue?</a>',
            });
          }
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Enter Customer Details!",
            footer: '<a href="#">Why do I have this issue?</a>',
          });
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Create a New Invoice!",
          footer: '<a href="#">Why do I have this issue?</a>',
        });
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
              gap={2}
            >
              <TextField
                type="number"
                value={discountInput}
                onChange={(e) => handleDiscountChange(e.target.value)}
                id="discount-input"
                label="Discount (LKR)"
                variant="outlined"
                sx={{ alignSelf: "end", maxWidth: 240 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">LKR</InputAdornment>
                  ),
                  inputProps: { min: 0 },
                }}
                disabled={buttonDesable}
              />
              <Button
                variant="contained"
                onClick={applyDiscount}
                disabled={
                  buttonDesable ||
                  toNumber(invoiceObject?.discount) === toNumber(discountInput)
                }
              >
                Apply Discount
              </Button>
              <Typography
                sx={{
                  fontWeight: "bold",
                  color: netPayable > 0 ? "red" : "green",
                }}
              >
                Balance after discount : {fmtLKR(netPayable)}
              </Typography>
            </Box>
          )}
        </Box>

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

              {/* Discount row */}
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography
                  variant="h6"
                  sx={{ color: "#1976d2", fontWeight: "bold" }}
                >
                  Discount
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: "#1976d2", fontWeight: "bold" }}
                >
                  {fmtLKR(discountInput)}
                </Typography>
              </Box>

              {/* Balance row */}
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: netPayable > 0 ? "red" : "green",
                    fontWeight: "bold",
                  }}
                >
                  Balance
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: netPayable > 0 ? "red" : "green",
                    fontWeight: "bold",
                  }}
                >
                  {fmtLKR(netPayable)}
                </Typography>
              </Box>
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
          variant="contained"
          sx={{ height: "60px", width: "20px", mt: 1 }}
        >
          <PictureAsPdfRoundedIcon sx={{ color: "white" }} />
        </Button>
        <Button
          onClick={handleOtherDialogButtonClick}
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