import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import AppRegistrationTwoToneIcon from "@mui/icons-material/AppRegistrationTwoTone";
import { InvoiceContext } from "../../../Contexts/Contexts";

function InvoicePaymentsTable() {
  const {
    invoiceObject,
    setInvoiceObject,
    updateValue,
    invoiceSearchBtnStatus,
  } = useContext(InvoiceContext);

  const deleteButtonStyles = {
    width: "auto",
    height: "auto",
    border: 0,
    borderRadius: 6,
    backgroundColor: "red",
  };

  const [editToggle, setEditToggle] = useState(false);
  useEffect(() => {
    // Disable editToggle and switch off when invoiceSearchBtnStatus is true
    if (invoiceSearchBtnStatus) {
      setEditToggle(false);
    }
  }, [invoiceSearchBtnStatus]);
  const handleDelete = (payId) => {
    // Filter out the payment with the corresponding payId
    const updatedPayments = invoiceObject.payments.filter(
      (payment) => payment.invpay_payment_id !== payId
    );
    setInvoiceObject((prevInvoiceObject) => ({
      ...prevInvoiceObject,
      payments: updatedPayments,
    }));
  };

  const handleDeleteAdvance = () => {
    updateValue("advance", 0);
  };

  // Ensure there are always at least 4 rows
  const minRows = 4;
  const dataRows =
    invoiceObject.payments.length + (invoiceObject.advance ? 1 : 0);
  const emptyRows = Math.max(minRows - dataRows, 0);

  return (
    <TableContainer
      component={Paper}
      sx={{ mt: 3.2, borderRadius: 4, height: "90%" }}
      elevation={4}
    >
      <Table stickyHeader sx={{ minWidth: 10 }} aria-label="simple table">
        <TableHead sx={{ height: "80px" }}>
          <TableRow>
            <TableCell variant="caption" align="center">
              Payment Id
            </TableCell>
            <TableCell variant="caption" align="center">
              Payment
            </TableCell>
            <TableCell variant="caption" align="center">
              <Box
                sx={{
                  backgroundColor: editToggle
                    ? (theme) => theme.palette.primary[100]
                    : (theme) => theme.palette.primary[50],
                  borderRadius: 3,
                  width: "100px",
                }}
              >
                <Switch
                  disabled={invoiceSearchBtnStatus}
                  checked={editToggle}
                  onChange={(e) => setEditToggle(e.target.checked)}
                />
                <Typography
                  color={
                    editToggle
                      ? (theme) => theme.palette.primary[25]
                      : (theme) => theme.palette.primary[400]
                  }
                  variant="caption"
                >
                  <AppRegistrationTwoToneIcon />
                </Typography>
              </Box>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invoiceObject.advance && (
            <TableRow
              sx={{
                "&:last-child td, &:last-child th": { border:  0},
                backgroundColor: (theme) => theme.palette.primary[50],
                border: "2px solid black",
              }}
            >
              <TableCell align="center" sx={{fontWeight:"bold"}}>Advance payment</TableCell>
              <TableCell align="center" sx={{fontWeight:"bold"}}>{invoiceObject.advance}</TableCell>
              <TableCell align="center">
                {editToggle && (
                  <button
                    style={deleteButtonStyles}
                    onClick={handleDeleteAdvance}
                  >
                    <DeleteTwoToneIcon sx={{ color: "white" }} />
                  </button>
                )}
              </TableCell>
            </TableRow>
          )}

          {invoiceObject.payments.map((payment, index) => {
            const isNegativePayment = payment.invpay_amount < 0;
            return (
              <TableRow
                key={index}
                sx={{
                  "&:last-child td, &:last-child th": { border: 0 },
                  height: "40px",
                  backgroundColor: isNegativePayment
                    ? "lightcoral"
                    : (theme) => theme.palette.primary[25],
                  "&:hover": {
                    backgroundColor: (theme) => theme.palette.primary[50],
                  },
                }}
              >
                <TableCell align="center">
                  {payment.invpay_payment_date
                    ? new Date(payment.invpay_payment_date).toLocaleString("en-GB", {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </TableCell>
                <TableCell align="center">{payment.invpay_amount}</TableCell>
                <TableCell align="center">
                  {editToggle && (
                    <button
                      style={deleteButtonStyles}
                      onClick={() => handleDelete(payment.invpay_payment_id)}
                    >
                      <DeleteTwoToneIcon sx={{ color: "white" }} />
                    </button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}

          {/* Add empty rows if needed */}
          {Array.from({ length: emptyRows }).map((_, index) => (
            <TableRow
              key={`empty-${index}`}
              sx={{
                "&:last-child td, &:last-child th": { border: 0 },
                height: "40px",
              }}
            >
              <TableCell align="center" colSpan={3}>
                &nbsp;
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default InvoicePaymentsTable;
