// frontend/src/components/Pages/Invoice/InvoiceDetailsWindowDown.jsx
import {
  Box,
  Paper,
  Typography,
  Dialog,
  DialogContent,
  TextField,
  InputAdornment,
  Tooltip,
  Button,
} from "@mui/material";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { InvoiceContext } from "../../../Contexts/Contexts";
import axios from "axios";
import Swal from "sweetalert2";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LibraryAddCheckIcon from "@mui/icons-material/LibraryAddCheck";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import { InvoicePdfWarehouseHandler } from "../../RoleBasedAccess/Warehouse handler/Invoice/InvoiceWarehouseHandler";
import TemporaryBill from "../../SubComponents/TemporaryBill";

/**
 * Completion policy toggles
 * Set this to true if you want to BLOCK completion until the balance is 0.
 */
const REQUIRE_ZERO_BALANCE = false;

/** Normalize truthy values coming from DB / backend / UI */
const toBool = (v) => {
  if (v === true) return true;
  if (v === false) return false;
  if (v === 1 || v === "1") return true;
  if (v === 0 || v === "0") return false;
  if (typeof v === "string") return v.toLowerCase() === "true";
  return !!v;
};

function InvoiceDetailsWindowDown(props) {
  const [openDialog, setOpenDialog] = useState(false);
  const [openOtherDialog, setOpenOtherDialog] = useState(false);

  // Discount state and helpers
  const [discountInput, setDiscountInput] = useState(0);
  const [netPayable, setNetPayable] = useState(0);

  const toNumber = (v) =>
    v === undefined || v === null || v === "" || isNaN(Number(v))
      ? 0
      : Number(v);
  const fmtLKR = (n) => `${toNumber(n).toLocaleString("en-LK")} LKR`;

  const handlePdfButtonClick = () => setOpenDialog(true);
  const handleOtherDialogButtonClick = () => setOpenOtherDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOpenOtherDialog(false);
  };

  const { updateBtnStatus, setUpdateBtnStatus, handleInvoiceSearch } = props;

  const {
    invoiceSearchBtnStatus,
    invoiceObject,
    setInvoiceObject,
    machineTotalCost,
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

  const isCompleted = useMemo(
    () => !!invoiceObject?.inv_completed_datetime,
    [invoiceObject?.inv_completed_datetime]
  );

  /** Robust ID kept / handover detection (handles iDstatus vs idStatus, 0/1 vs bools) */
  const idKeptNotHandedOver = useMemo(() => {
    // Kept can arrive as: idStatus, iDstatus, inv_idcardstatus (DB field)
    const kept =
      toBool(
        invoiceObject?.idStatus ??
          invoiceObject?.iDstatus ??
          invoiceObject?.inv_idcardstatus
      ) === true;

    // Handover can arrive as: idHandoverStatus, inv_idhandoverstatus (DB field)
    const handed =
      toBool(
        invoiceObject?.idHandoverStatus ?? invoiceObject?.inv_idhandoverstatus
      ) === true;

    return kept && !handed;
  }, [
    invoiceObject?.idStatus,
    invoiceObject?.iDstatus,
    invoiceObject?.inv_idcardstatus,
    invoiceObject?.idHandoverStatus,
    invoiceObject?.inv_idhandoverstatus,
  ]);

  useEffect(() => {
    setButtonDisable(!!isCompleted);

    const advAndPays = calculateTotalPayments();
    const existingDiscount = toNumber(invoiceObject?.discount);
    setDiscountInput(existingDiscount);

    const balance = Math.max(
      0,
      toNumber(machineTotalCost) - advAndPays - existingDiscount
    );
    setNetPayable(balance);
  }, [machineTotalCost, invoiceObject, isCompleted, setButtonDisable]);

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
      setNetPayable(Math.max(0, toNumber(machineTotalCost) - advAndPays - v));
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
    if (!invoiceObject) return;
    if (!(invoiceObject.InvoiceID > 0)) {
      return Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Create a New Invoice!",
      });
    }
    if (!(invoiceObject?.customerDetails?.cus_id > 0)) {
      return Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Enter Customer Details!",
      });
    }
    if (!invoiceObject.eqdetails || invoiceObject.eqdetails.length === 0) {
      return Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Enter machine details!",
      });
    }

    if (
      !(toNumber(invoiceObject.advance) >= 0) &&
      invoiceObject.advance !== "" &&
      invoiceObject.advance !== null
    ) {
      return Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Didn't he pay you!",
      });
    }

    try {
      const payload = { ...invoiceObject, discount: toNumber(discountInput) };
      await axios.post("http://localhost:8085/createInvoiceDetails", payload);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Your work has been saved",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      Swal.fire({ icon: "error", title: "Oops...", text: "Try again!" });
      console.error("Error occurred in front end AXIOS invoice pass", error);
    }
  };

  const handleInvoiceUpdate = async () => {
    if (!invoiceObject) return;
    if (!(invoiceObject.InvoiceID > 0)) {
      return Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Create a New Invoice!",
      });
    }
    if (!(invoiceObject?.customerDetails?.cus_id > 0)) {
      return Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Enter Customer Details!",
      });
    }
    if (!invoiceObject.eqdetails || invoiceObject.eqdetails.length === 0) {
      return Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Enter machine details!",
      });
    }

    if (
      !(toNumber(invoiceObject.advance) >= 0) &&
      invoiceObject.advance !== "" &&
      invoiceObject.advance !== null
    ) {
      return Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Didn't he pay you!",
      });
    }

    try {
      const payload = { ...invoiceObject, discount: toNumber(discountInput) };
      await axios.post("http://localhost:8085/updateInvoiceDetails", payload);
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
      Swal.fire({ icon: "error", title: "Oops...", text: "Try again!" });
      console.error("Error occurred in front end AXIOS invoice pass", error);
    }
  };

  const handleCompletedButtonClick = async () => {
    try {
      // Business rule validations/warnings
      const eqNotReturned = (invoiceObject?.eqdetails || []).some(
        (e) => !e?.inveq_return_date
      );

      // Hard block if policy requires a zero balance
      if (REQUIRE_ZERO_BALANCE && netPayable > 0) {
        return Swal.fire({
          icon: "error",
          title: "Outstanding Balance",
          text: `Cannot complete while a balance of ${fmtLKR(
            netPayable
          )} remains.`,
        });
      }

      // Consolidated confirmation with warnings (NO refund/negative checks)
      const warnings = [];
      if (netPayable > 0) warnings.push(`Balance due: ${fmtLKR(netPayable)}`);
      if (idKeptNotHandedOver)
        warnings.push("ID was collected but not handed back to the customer.");
      if (eqNotReturned)
        warnings.push("Some items have not been returned yet.");

      const html =
        warnings.length > 0
          ? `<div style="text-align:left">
               <p>Please confirm the following before completing:</p>
               <ul>${warnings.map((w) => `<li>${w}</li>`).join("")}</ul>
             </div>`
          : `<div style="text-align:left"><p>Are you sure you want to complete this invoice?</p></div>`;

      const { isConfirmed } = await Swal.fire({
        title: warnings.length ? "Review before completion" : "Complete invoice?",
        html,
        icon: warnings.length ? "warning" : "question",
        showCancelButton: true,
        confirmButtonText: "Yes, complete",
        cancelButtonText: "Cancel",
      });

      if (!isConfirmed) return;

      const payload = {
        ...invoiceObject,
        discount: toNumber(discountInput),
        invoiceCompletedDate: new Date(),
      };

      await axios.post("http://localhost:8085/updateInvoiceDetails", payload);

      Swal.fire({
        icon: "success",
        title: "Invoice completed",
        timer: 900,
        showConfirmButton: false,
      });
      setButtonDisable(true);
      handleInvoiceSearch(invoiceObject.InvoiceID);
    } catch (e) {
      console.error(e);
      Swal.fire({ icon: "error", title: "Failed to complete invoice" });
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
        {/* Completed pill */}
        {isCompleted && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 12,
              px: 1.5,
              py: 0.5,
              borderRadius: 9999,
              bgcolor: "success.main",
              color: "white",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            Completed •{" "}
            {new Date(
              invoiceObject.inv_completed_datetime
            ).toLocaleString()}
          </Box>
        )}

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
                  toNumber(invoiceObject?.discount) ===
                    toNumber(discountInput)
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
          sx={{ height: "100%", width: "100%", display: "flex", flexDirection: "column" }}
        >
          <Box sx={{ display: "flex", width: "100%" }}>
            <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Machine Cost row */}
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6" sx={{ color: "green", fontWeight: "bold" }}>
                  Machine Cost
                </Typography>
                {invoiceSearchBtnStatus && (
                  <Typography variant="h6" sx={{ color: "green", fontWeight: "bold" }}>
                    {machineTotalCost} LKR
                  </Typography>
                )}
              </Box>

              {/* Advance row */}
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6" sx={{ color: "#ff9999", fontWeight: "bold" }}>
                  Advance
                </Typography>
                <Typography variant="body1" sx={{ color: "#ff9999", fontWeight: "bold" }}>
                  {!!invoiceObject.advance ? `${invoiceObject.advance} LKR` : ""}
                </Typography>
              </Box>

              {/* Payments / Refunds rows */}
              {(invoiceObject.payments || []).map((item, index) => {
                const amt = toNumber(item?.invpay_amount);
                const label =
                  amt < 0 ? `Refund ${index + 1}` : `Payment ${index + 1}`;
                const color = amt < 0 ? "#8e24aa" : "#ff9999";
                return (
                  <Box key={index} sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="h6" sx={{ color, fontWeight: "bold" }}>
                      {label}
                    </Typography>
                    <Typography variant="body1" sx={{ color, fontWeight: "bold" }}>
                      {amt ? `${Math.abs(amt)} LKR` : ""}
                    </Typography>
                  </Box>
                );
              })}

              {/* Total row */}
              {(invoiceObject.advance || (invoiceObject.payments || []).length > 0) && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="h6" sx={{ color: "red", fontWeight: "bold" }}>
                    Total Payments
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ textDecoration: "underline", color: "red", fontWeight: "bold" }}
                  >
                    {calculateTotalPayments()} LKR
                  </Typography>
                </Box>
              )}

              {/* Discount row */}
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6" sx={{ color: "#1976d2", fontWeight: "bold" }}>
                  Discount
                </Typography>
                <Typography variant="body1" sx={{ color: "#1976d2", fontWeight: "bold" }}>
                  {fmtLKR(discountInput)}
                </Typography>
              </Box>

              {/* Balance row */}
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography
                  variant="h6"
                  sx={{ color: netPayable > 0 ? "red" : "green", fontWeight: "bold" }}
                >
                  Balance
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ color: netPayable > 0 ? "red" : "green", fontWeight: "bold" }}
                >
                  {fmtLKR(netPayable)}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ height: "100%", width: "100%" }} display={"flex"} justifyContent={"end"} alignItems={"end"} />
        </Box>
      </Paper>

      <Box display={"flex"} alignItems={"center"} gap={1}>
        {invoiceSearchBtnStatus ? (
          <>
            <Button
              disabled={buttonDesable}
              fullWidth
              variant="contained"
              sx={{ mt: 1, borderRadius: 0, height: "60px", width: "13vw" }}
              onClick={handleInvoiceUpdate}
            >
              Update Invoice
            </Button>

            <Tooltip
              title={
                isCompleted
                  ? "Open temporary bill / receipt"
                  : "Complete the invoice to enable receipt"
              }
            >
              <span>
                <Button
                  onClick={handleOtherDialogButtonClick}
                  variant="outlined"
                  sx={{ height: "60px", width: "20px", mt: 1 }}
                  disabled={!isCompleted}
                >
                  <ReceiptIcon />
                </Button>
              </span>
            </Tooltip>

            <Tooltip
              title={
                REQUIRE_ZERO_BALANCE && netPayable > 0
                  ? "Cannot complete with outstanding balance"
                  : idKeptNotHandedOver
                  ? "ID collected but not handed back — you'll be asked to confirm"
                  : "Complete invoice"
              }
            >
              <span>
                <Button
                  color="success"
                  onClick={handleCompletedButtonClick}
                  disabled={buttonDesable}
                  variant="outlined"
                  sx={{ height: "60px", width: "20px", mt: 1 }}
                >
                  <LibraryAddCheckIcon />
                </Button>
              </span>
            </Tooltip>
          </>
        ) : (
          <>
            <Button
              color="success"
              variant="contained"
              sx={{ mt: 1, borderRadius: 0, height: "60px", width: "100%" }}
              onClick={handleInvoiceSubmit}
            >
              Create Invoice
            </Button>
            <Tooltip title="You can print/preview once the invoice is created">
              <span>
                <Button
                  onClick={handlePdfButtonClick}
                  variant="contained"
                  sx={{ height: "60px", width: "20px", mt: 1 }}
                  disabled
                >
                  <PictureAsPdfRoundedIcon sx={{ color: "white" }} />
                </Button>
              </span>
            </Tooltip>
          </>
        )}
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
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