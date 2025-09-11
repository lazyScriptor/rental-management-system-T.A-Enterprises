import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
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
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import Swal from "sweetalert2";

import {
  InvoiceContext,
} from "../../../Contexts/Contexts.jsx";

// Actions / status icons
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";

// Row icons (subtle)
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";

import { InvoicePdfWarehouseHandler } from "../../RoleBasedAccess/Warehouse handler/Invoice/InvoiceWarehouseHandler.jsx";
import TemporaryBill from "../../SubComponents/TemporaryBill.jsx";

const REQUIRE_ZERO_BALANCE = false;

const toBool = (v) => {
  if (v === true) return true;
  if (v === false) return false;
  if (v === 1 || v === "1") return true;
  if (v === 0 || v === "0") return false;
  if (typeof v === "string") return v.toLowerCase() === "true";
  return !!v;
};

const InvoiceDetailsWindowDown = forwardRef(function InvoiceDetailsWindowDown(
  {
    updateBtnStatus,
    setUpdateBtnStatus,
    handleInvoiceSearch,
    onSyncedFromServer, // optional: parent can update its snapshot after saves/completion
  },
  ref
) {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [openOtherDialog, setOpenOtherDialog] = useState(false);
  const [discountInput, setDiscountInput] = useState(0);
  const [netPayable, setNetPayable] = useState(0);

  const {
    invoiceSearchBtnStatus,
    invoiceObject,
    setInvoiceObject,
    machineTotalCost,
    buttonDesable,
    setButtonDisable,
  } = useContext(InvoiceContext);

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

  const idKeptNotHandedOver = useMemo(() => {
    const kept =
      toBool(
        invoiceObject?.idStatus ??
          invoiceObject?.iDstatus ??
          invoiceObject?.inv_idcardstatus
      ) === true;
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
        title: "Invalid discount",
        text: "Discount cannot exceed the remaining balance.",
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
        const { data } = await axios.post(
          "http://localhost:8085/updateInvoiceDetails",
          payload
        );
        Swal.fire({
          icon: "success",
          title: "Discount applied",
          showConfirmButton: false,
          timer: 800,
        });
        // sync fresh server state back (optional, if API returns)
        onSyncedFromServer && onSyncedFromServer(data || payload);
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
        title: "Create a new invoice first",
      });
    }
    if (!(invoiceObject?.customerDetails?.cus_id > 0)) {
      return Swal.fire({
        icon: "error",
        title: "Enter customer details",
      });
    }
    if (!invoiceObject.eqdetails || invoiceObject.eqdetails.length === 0) {
      return Swal.fire({
        icon: "error",
        title: "Add machine details",
      });
    }

    if (
      !(toNumber(invoiceObject.advance) >= 0) &&
      invoiceObject.advance !== "" &&
      invoiceObject.advance !== null
    ) {
      return Swal.fire({
        icon: "error",
        title: "Invalid advance",
      });
    }

    try {
      const payload = { ...invoiceObject, discount: toNumber(discountInput) };
      const { data } = await axios.post(
        "http://localhost:8085/createInvoiceDetails",
        payload
      );
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Saved",
        showConfirmButton: false,
        timer: 1200,
      });
      onSyncedFromServer && onSyncedFromServer(data || payload);
    } catch (error) {
      Swal.fire({ icon: "error", title: "Save failed, try again" });
      console.error("Error occurred in front end AXIOS invoice pass", error);
    }
  };

  const handleInvoiceUpdate = async () => {
    if (!invoiceObject) return;
    if (!(invoiceObject.InvoiceID > 0)) {
      return Swal.fire({
        icon: "error",
        title: "Create a new invoice first",
      });
    }
    if (!(invoiceObject?.customerDetails?.cus_id > 0)) {
      return Swal.fire({
        icon: "error",
        title: "Enter customer details",
      });
    }
    if (!invoiceObject.eqdetails || invoiceObject.eqdetails.length === 0) {
      return Swal.fire({
        icon: "error",
        title: "Add machine details",
      });
    }

    if (
      !(toNumber(invoiceObject.advance) >= 0) &&
      invoiceObject.advance !== "" &&
      invoiceObject.advance !== null
    ) {
      return Swal.fire({
        icon: "error",
        title: "Invalid advance",
      });
    }

    try {
      const payload = { ...invoiceObject, discount: toNumber(discountInput) };
      const { data } = await axios.post(
        "http://localhost:8085/updateInvoiceDetails",
        payload
      );
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Updated",
        showConfirmButton: false,
        timer: 800,
      });
      setUpdateBtnStatus(false);
      onSyncedFromServer && onSyncedFromServer(data || payload);
      handleInvoiceSearch(invoiceObject.InvoiceID);
    } catch (error) {
      Swal.fire({ icon: "error", title: "Update failed, try again" });
      console.error("Error occurred in front end AXIOS invoice pass", error);
    }
  };

  const handleCompletedButtonClick = async () => {
    try {
      const eqNotReturned = (invoiceObject?.eqdetails || []).some(
        (e) => !e?.inveq_return_date
      );

      if (REQUIRE_ZERO_BALANCE && toNumber(netPayable) > 0) {
        return Swal.fire({
          icon: "error",
          title: "Outstanding balance",
          text: `Cannot complete while a balance of ${fmtLKR(netPayable)} remains.`,
        });
      }

      const warnings = [];
      if (toNumber(netPayable) > 0)
        warnings.push(`Balance due: ${fmtLKR(netPayable)}`);
      if (
        toBool(
          invoiceObject?.idStatus ??
            invoiceObject?.iDstatus ??
            invoiceObject?.inv_idcardstatus
        ) &&
        !toBool(
          invoiceObject?.idHandoverStatus ??
            invoiceObject?.inv_idhandoverstatus
        )
      ) {
        warnings.push("ID was collected but not handed back to the customer.");
      }
      if (eqNotReturned) warnings.push("Some items have not been returned yet.");

      const html =
        warnings.length > 0
          ? `<div style="text-align:left">
               <p>Please review before completing:</p>
               <ul style="margin:6px 0;padding-left:18px">${warnings
                 .map((w) => `<li>${w}</li>`)
                 .join("")}</ul>
             </div>`
          : `<div style="text-align:left"><p>Complete this invoice?</p></div>`;

      const { isConfirmed } = await Swal.fire({
        title: warnings.length ? "Confirm completion" : "Complete invoice?",
        html,
        icon: warnings.length ? "warning" : "question",
        showCancelButton: true,
        confirmButtonText: "Complete",
        cancelButtonText: "Cancel",
      });

      if (!isConfirmed) return;

      const payload = {
        ...invoiceObject,
        discount: toNumber(discountInput),
        invoiceCompletedDate: new Date(),
      };

      const { data } = await axios.post(
        "http://localhost:8085/updateInvoiceDetails",
        payload
      );

      Swal.fire({
        icon: "success",
        title: "Invoice completed",
        timer: 900,
        showConfirmButton: false,
      });
      setButtonDisable(true);
      onSyncedFromServer && onSyncedFromServer(data || payload);
      handleInvoiceSearch(invoiceObject.InvoiceID);
    } catch (e) {
      console.error(e);
      Swal.fire({ icon: "error", title: "Completion failed" });
    }
  };

  // Expose actions to parent (for Create New guard flow)
  useImperativeHandle(ref, () => ({
    updateInvoice: handleInvoiceUpdate,
    completeInvoice: handleCompletedButtonClick,
  }));

  const InfoRow = ({ icon, label, value, valueColor }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        {icon}
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ color: valueColor || "text.primary" }}>
        {value}
      </Typography>
    </Box>
  );

  return (
    <>
      <Paper
        elevation={1}
        sx={{
          position: "relative",
          width: "100%",
          display: "flex",
          justifyContent: "start",
          p: 2,
          borderRadius: 2,
          height: "80%",
        }}
      >
        {isCompleted && (
          <Chip
            size="small"
            color="success"
            icon={<TaskAltOutlinedIcon sx={{ fontSize: 16 }} />}
            label={`Completed • ${new Date(
              invoiceObject.inv_completed_datetime
            ).toLocaleString()}`}
            sx={{ position: "absolute", top: 8, right: 8 }}
          />
        )}

        <Box position="absolute" bottom={8} width="100%" pr={2}>
          {invoiceSearchBtnStatus && (
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              justifyContent="space-between"
            >
              <TextField
                size="small"
                type="number"
                value={discountInput}
                onChange={(e) => handleDiscountChange(e.target.value)}
                id="discount-input"
                label="Discount"
                variant="outlined"
                sx={{ maxWidth: 220 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">LKR</InputAdornment>
                  ),
                  inputProps: { min: 0 },
                }}
                disabled={buttonDesable}
              />
              <Button
                size="small"
                variant="contained"
                onClick={applyDiscount}
                disabled={
                  buttonDesable ||
                  toNumber(invoiceObject?.discount) === toNumber(discountInput)
                }
              >
                Apply
              </Button>

              <Chip
                size="small"
                variant="outlined"
                color={toNumber(netPayable) > 0 ? "warning" : "success"}
                icon={<AccountBalanceWalletOutlinedIcon sx={{ fontSize: 18 }} />}
                label={`Balance: ${fmtLKR(netPayable)}`}
                sx={{ ml: "auto" }}
              />
            </Stack>
          )}
        </Box>

        <Box
          sx={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", width: "100%" }}>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <InfoRow
                icon={
                  <MonetizationOnOutlinedIcon
                    sx={{ fontSize: 18, color: "text.secondary" }}
                  />
                }
                label="Machine cost"
                value={invoiceSearchBtnStatus ? fmtLKR(machineTotalCost) : "—"}
              />

              <InfoRow
                icon={
                  <PaidOutlinedIcon
                    sx={{ fontSize: 18, color: "text.secondary" }}
                  />
                }
                label="Advance"
                value={
                  invoiceObject.advance ? fmtLKR(invoiceObject.advance) : "—"
                }
              />

              {(invoiceObject.payments || []).map((item, index) => {
                const amt = toNumber(item?.invpay_amount);
                const isRefund = amt < 0;
                return (
                  <InfoRow
                    key={index}
                    icon={
                      isRefund ? (
                        <UndoOutlinedIcon
                          sx={{ fontSize: 18, color: "text.secondary" }}
                        />
                      ) : (
                        <PaymentOutlinedIcon
                          sx={{ fontSize: 18, color: "text.secondary" }}
                        />
                      )
                    }
                    label={isRefund ? `Refund ${index + 1}` : `Payment ${index + 1}`}
                    value={amt ? fmtLKR(Math.abs(amt)) : "—"}
                    valueColor={theme.palette.text.primary}
                  />
                );
              })}

              {(invoiceObject.advance ||
                (invoiceObject.payments || []).length > 0) && (
                <>
                  <Divider sx={{ my: 0.5 }} />
                  <InfoRow
                    icon={
                      <PaymentOutlinedIcon
                        sx={{ fontSize: 18, color: "text.secondary" }}
                      />
                    }
                    label="Total payments"
                    value={fmtLKR(calculateTotalPayments())}
                  />
                </>
              )}

              <InfoRow
                icon={
                  <LocalOfferOutlinedIcon
                    sx={{ fontSize: 18, color: "text.secondary" }}
                  />
                }
                label="Discount"
                value={fmtLKR(discountInput)}
              />

              <InfoRow
                icon={
                  <AccountBalanceWalletOutlinedIcon
                    sx={{ fontSize: 18, color: "text.secondary" }}
                  />
                }
                label="Balance"
                value={fmtLKR(netPayable)}
                valueColor={
                  toNumber(netPayable) > 0
                    ? theme.palette.warning.main
                    : theme.palette.success.main
                }
              />
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Footer actions */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
        {invoiceSearchBtnStatus ? (
          <>
            <Button
              disabled={buttonDesable}
              variant="contained"
              size="small"
              onClick={handleInvoiceUpdate}
            >
              Update
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
                  size="small"
                  disabled={!isCompleted}
                  startIcon={<ReceiptLongOutlinedIcon />}
                >
                  Receipt
                </Button>
              </span>
            </Tooltip>

            <Tooltip title="Complete invoice">
              <span>
                <Button
                  color="success"
                  onClick={handleCompletedButtonClick}
                  disabled={buttonDesable}
                  variant="outlined"
                  size="small"
                  startIcon={<TaskAltOutlinedIcon />}
                >
                  Complete
                </Button>
              </span>
            </Tooltip>
          </>
        ) : (
          <>
            <Button
              color="success"
              variant="contained"
              size="small"
              onClick={handleInvoiceSubmit}
            >
              Create Invoice
            </Button>
            <Tooltip title="You can print/preview once the invoice is created">
              <span>
                <Button
                  onClick={handlePdfButtonClick}
                  variant="outlined"
                  size="small"
                  disabled
                  startIcon={<PictureAsPdfRoundedIcon />}
                >
                  PDF
                </Button>
              </span>
            </Tooltip>
          </>
        )}
      </Stack>

      {/* Dialogs */}
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
});

export default InvoiceDetailsWindowDown;