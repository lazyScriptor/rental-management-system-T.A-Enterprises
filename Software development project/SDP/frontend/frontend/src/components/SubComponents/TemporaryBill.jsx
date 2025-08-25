import React, { useContext, useRef } from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Divider,
  TableContainer,
} from "@mui/material";
import { InvoiceContext } from "../../Contexts/Contexts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import BrowserUpdatedIcon from "@mui/icons-material/BrowserUpdated";
import logo from "../../assets/logo.png";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const BILL_MAX_WIDTH = 420; // easy to change in one place

const TemporaryBill = () => {
  const cashierName = localStorage.getItem("username");
  const { invoiceObject, totalPayments } = useContext(InvoiceContext);
  const billRef = useRef(null);

  // ---- calculations (unchanged) ----
  const rentalCalculation = (row) => {
    const dateSet = Number(row.eqcat_dataset) || 0;
    const normalRental = Number(row.eq_rental) || 0;
    const specialRental = Number(row.spe_singleday_rent) || 0;
    const duration = Number(row.duration_in_days) || 0;
    const quantity = Number(row.inveq_borrowqty) || 0;
    const categoryId = Number(row.eqcat_id) || 0;

    let finalRental = 0;
    if (specialRental && categoryId == 2) {
      if (duration <= dateSet) {
        if (duration !== 1) finalRental = specialRental * 2 * quantity;
        if (duration === 1) finalRental = specialRental * 1 * quantity;
      } else {
        finalRental = normalRental * duration * quantity;
      }
    } else if (specialRental && categoryId != 2) {
      if (duration < dateSet) finalRental = specialRental * duration * quantity;
      else finalRental = normalRental * duration * quantity;
    } else {
      finalRental = normalRental * duration * quantity;
    }
    return finalRental;
  };

  // exact display logic (with Sinhala note) for Rate/Day
  const displayRateJSX = (row, duration) => {
    const dateSet = Number(row.eqcat_dataset) || 0;
    const normalRental = Number(row.eq_rental) || 0;
    const specialRental = Number(row.spe_singleday_rent) || 0;
    const categoryId = Number(row.eqcat_id) || 0;

    if (!duration) return normalRental;

    if (specialRental && categoryId === 2) {
      if (duration <= dateSet) {
        if (duration !== 1) {
          return (
            <>
              {specialRental * 2}
              <span style={{ fontSize: "0.7rem" }}> : දින දෙකකට පමණි</span>
            </>
          );
        }
        return specialRental;
      }
      return normalRental;
    } else if (specialRental && categoryId !== 2) {
      if (duration < dateSet) return specialRental;
      return normalRental;
    }
    return normalRental;
  };

  const handleDurationinDays = (duration) => {
    const d = Number(duration) || 0;
    if (d > 0) return d;
    const t = dayjs(new Date());
    const c = dayjs(invoiceObject?.createdDate);
    return t.diff(c, "day") + 1;
  };

  const handleDownload = (name, invoiceid) => {
    const capture = billRef.current;
    const options = {
      scale: 2,
      useCORS: true,
      scrollY: -window.scrollY,
      windowHeight: document.documentElement.scrollHeight,
    };
    html2canvas(capture, options).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = canvas.width * 0.264583;
      const pdfHeight = canvas.height * 0.264583;
      const doc = new jsPDF({ unit: "mm", format: [pdfWidth, pdfHeight] });
      doc.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      doc.save(`${name}-${invoiceid}-tempBill.pdf`);
    });
  };

  // ---- data splits ----
  const eqdetails = invoiceObject?.eqdetails ?? [];
  const notHandedOverItems = eqdetails.filter((row) => !row.inveq_return_date);
  const handedOverItems = eqdetails.filter((row) => !!row.inveq_return_date);

  // ---- totals ----
  const today = dayjs();
  const createdDate = dayjs(invoiceObject?.createdDate);

  const notHandedOverTotal = notHandedOverItems.reduce((acc, row) => {
    const duration = today.diff(createdDate, "day") + 1; // include today
    const dateSet = Number(row.eqcat_dataset) || 0;
    const normalRental = Number(row.eq_rental) || 0;
    const specialRental = Number(row.spe_singleday_rent) || 0;
    const quantity = Number(row.inveq_borrowqty) || 0;
    const categoryId = Number(row.eqcat_id) || 0;

    let finalRental = 0;
    if (specialRental && categoryId == 2) {
      if (duration <= dateSet) {
        if (duration !== 1) finalRental = specialRental * 2 * quantity;
        if (duration === 1) finalRental = specialRental * 1 * quantity;
      } else {
        finalRental = normalRental * duration * quantity;
      }
    } else if (specialRental && categoryId != 2) {
      if (duration < dateSet) finalRental = specialRental * duration * quantity;
      else finalRental = normalRental * duration * quantity;
    } else {
      finalRental = normalRental * duration * quantity;
    }
    return acc + finalRental;
  }, 0);

  const handedOverTotal = handedOverItems.reduce(
    (acc, row) => acc + rentalCalculation(row),
    0
  );

  const grandTotal = handedOverTotal + notHandedOverTotal;

  const calculateTotalAdvanceAndPayments = () => {
    const adv = Number(invoiceObject?.advance) || 0;
    const pays = Number(totalPayments) || 0;
    return adv + pays;
  };

  const balanceDue = grandTotal - calculateTotalAdvanceAndPayments();

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        px: 2, // small gutter on very small screens
      }}
    >
      <div ref={billRef} className="bill" style={{ width: "100%" }}>
        <Paper
          elevation={5}
          sx={{
            mx: "auto",                // center horizontally (prevents drift)
            my: 2,
            width: "100%",
            maxWidth: BILL_MAX_WIDTH,  // predictable card width
            boxSizing: "border-box",   // include padding in width
            px: 3,
            py: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",     // children take full width
          }}
        >
          {/* Header */}
          <Box sx={{ display: "flex",justifyContent:'center', alignItems: "center", gap: 2, pb: 1 }}>
            <img style={{ width: 50, height: 50, objectFit: "contain" }} src={logo} alt="" />
            <Typography variant="h5" align="left" sx={{ fontSize: "1rem" }}>
              T.A Enterprises
            </Typography>
          </Box>

          <Typography align="center" variant="caption" sx={{ fontSize: "0.85rem" }}>
            Temporary Bill for Equipment Rental / Payment / Return
          </Typography>
          <Typography align="center" sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
            - TEMPORARY BILL -
          </Typography>

          <Divider sx={{ my: 1.5 }} />

          {/* Meta */}
          <Box sx={{ width: "100%" }}>
            <Typography sx={{ fontSize: "0.85rem" }}>
              Bill No : {invoiceObject?.InvoiceID}
            </Typography>
            <Typography sx={{ fontSize: "0.85rem" }}>
              Issued Date & Time :{" "}
              {invoiceObject?.createdDate
                ? dayjs(invoiceObject.createdDate)
                    .tz("Asia/Colombo")
                    .format("YYYY-MM-DD HH:mm:ss")
                : ""}
            </Typography>
            <Typography sx={{ fontSize: "0.85rem" }}>
              Customer Name : {invoiceObject?.customerDetails?.cus_fname}{" "}
              {invoiceObject?.customerDetails?.cus_lname}
            </Typography>
            <Typography sx={{ fontSize: "0.85rem" }}>Issued By: {cashierName}</Typography>
            <Typography sx={{ fontSize: "0.85rem" }}>Contact : 0777 593 701</Typography>
          </Box>

          <Divider sx={{ my: 1.5 }} />

          {/* Table 1: Not handed over */}
          {notHandedOverItems.length > 0 && (
            <Box sx={{ width: "100%", mb: 2 }}>
              <Typography
                align="center"
                sx={{ fontWeight: 700, color: "red", fontSize: "0.85rem", mb: 1 }}
              >
                The following items are NOT handed over yet. Cost calculated up to today:
              </Typography>

              <TableContainer sx={{ width: "100%" }}>
                <Table
                  size="small"
                  sx={{
                    width: "100%",
                    tableLayout: "fixed",
                    "& .MuiTableCell-root": { py: 0.75, px: 1 },
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" sx={{ fontSize: "0.75rem" }}>
                        Equipment
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "0.75rem" }}>
                        Quantity
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "0.75rem" }}>
                        Days
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "0.75rem" }}>
                        Rate/Day (LKR)
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "0.75rem" }}>
                        Total Cost (LKR)
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {notHandedOverItems.map((row, idx) => {
                      const duration = today.diff(createdDate, "day") + 1; // include today
                      const rateJSX = displayRateJSX(row, duration);

                      const total = (() => {
                        const dateSet = Number(row.eqcat_dataset) || 0;
                        const normalRental = Number(row.eq_rental) || 0;
                        const specialRental = Number(row.spe_singleday_rent) || 0;
                        const quantity = Number(row.inveq_borrowqty) || 0;
                        const categoryId = Number(row.eqcat_id) || 0;

                        let finalRental = 0;
                        if (specialRental && categoryId == 2) {
                          if (duration <= dateSet) {
                            if (duration !== 1) finalRental = specialRental * 2 * quantity;
                            if (duration === 1) finalRental = specialRental * 1 * quantity;
                          } else {
                            finalRental = normalRental * duration * quantity;
                          }
                        } else if (specialRental && categoryId != 2) {
                          if (duration < dateSet) finalRental = specialRental * duration * quantity;
                          else finalRental = normalRental * duration * quantity;
                        } else {
                          finalRental = normalRental * duration * quantity;
                        }
                        return finalRental;
                      })();

                      return (
                        <TableRow key={idx}>
                          <TableCell align="center" sx={{ fontSize: "0.75rem" }}>
                            {row.eq_name}
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: "0.75rem" }}>
                            {row.inveq_borrowqty}
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: "0.75rem" }}>
                            {duration}
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: "0.75rem" }}>
                            {rateJSX}
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: "0.75rem" }}>
                            {total}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        align="right"
                        sx={{ fontSize: "0.75rem", fontWeight: 600 }}
                      >
                        Total cost for NOT handed over items up to today:
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                        {notHandedOverTotal}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Table 2: Handed over */}
          <TableContainer sx={{ width: "100%" }}>
            <Table
              size="small"
              sx={{
                width: "100%",
                tableLayout: "fixed",
                "& .MuiTableCell-root": { py: 0.75, px: 1 },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ fontSize: "0.75rem" }}>
                    Equipment Name
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: "0.75rem" }}>
                    Borrowed Qty
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: "0.75rem" }}>
                    Days
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: "0.75rem" }}>
                    Rate/Day (LKR)
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: "0.75rem" }}>
                    Item Total (LKR)
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {handedOverItems.map((row, index) => {
                  const duration = handleDurationinDays(row.duration_in_days);
                  const rateJSX = displayRateJSX(row, duration);

                  return (
                    <TableRow key={index}>
                      <TableCell align="center" sx={{ fontSize: "0.75rem" }}>
                        {row.eq_name}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "0.75rem" }}>
                        {row.inveq_borrowqty}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "0.75rem" }}>
                        {duration}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "0.75rem" }}>
                        {rateJSX}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "0.75rem" }}>
                        {rentalCalculation(row)}
                      </TableCell>
                    </TableRow>
                  );
                })}

                <TableRow>
                  <TableCell
                    colSpan={4}
                    align="right"
                    sx={{ fontSize: "0.75rem", fontWeight: 600 }}
                  >
                    Equipment Subtotal :
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                    {grandTotal}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ my: 1.5 }} />

          {/* Payments */}
          <TableContainer sx={{ width: "100%" }}>
            <Table
              size="small"
              sx={{
                width: "100%",
                tableLayout: "fixed",
                "& .MuiTableCell-root": { py: 0.75, px: 1 },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ fontSize: "0.75rem" }}>
                    Payment Type
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: "0.75rem" }}>
                    Amount (LKR)
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoiceObject?.advance ? (
                  <TableRow>
                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>
                      Advance Payment
                    </TableCell>
                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>
                      {invoiceObject.advance}
                    </TableCell>
                  </TableRow>
                ) : null}

                {(invoiceObject?.payments ?? []).map((payment, index) => (
                  <TableRow key={index}>
                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>
                      {dayjs(payment.invpay_payment_date)
                        .tz("Asia/Colombo")
                        .format(`DD/MM | HH:mm`)}
                    </TableCell>
                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>
                      {payment.invpay_amount}
                    </TableCell>
                  </TableRow>
                ))}

                <TableRow>
                  <TableCell align="right" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                    Total Paid :
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                    {calculateTotalAdvanceAndPayments()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell align="right" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                    Balance Due :
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                    {balanceDue}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </div>

      <Button
        sx={{ mt: 1, mb: 2, fontSize: "0.75rem" }}
        variant="contained"
        onClick={() =>
          handleDownload(
            invoiceObject?.customerDetails?.cus_fname ?? "customer",
            invoiceObject?.InvoiceID ?? "invoice"
          )
        }
      >
        <BrowserUpdatedIcon sx={{ mr: 1 }} />
        Download PDF
      </Button>
    </Box>
  );
};

export default TemporaryBill;