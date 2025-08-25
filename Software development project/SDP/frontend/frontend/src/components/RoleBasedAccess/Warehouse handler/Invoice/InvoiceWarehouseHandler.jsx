import React, { useContext, useState, useEffect } from "react";
import "../../../Stylings/rootstyles.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import {
  AuthContext,
  InvoiceContext,
  PopupContext,
  SwalContext,
} from "../../../../Contexts/Contexts.jsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import YoutubeSearchedForIcon from "@mui/icons-material/YoutubeSearchedFor";
import BackspaceOutlinedIcon from "@mui/icons-material/BackspaceOutlined";
import AddIcCallOutlinedIcon from "@mui/icons-material/AddIcCallOutlined";
import ContactMailOutlinedIcon from "@mui/icons-material/ContactMailOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import BrowserUpdatedIcon from '@mui/icons-material/BrowserUpdated';

const handleDownload = (name, invoiceid) => {
  const capture = document.querySelector(`.invoice`);
  html2canvas(capture).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");
    const doc = new jsPDF("p", "mm", "a4");
    const componentWidth = doc.internal.pageSize.getWidth();
    const componentHeight = (canvas.height * componentWidth) / canvas.width;
    doc.addImage(imgData, "PNG", 0, 0, componentWidth, componentHeight);
    doc.save(`${name}-${invoiceid}-invoice.pdf`);
  });
};

export default function InvoiceWarehouseHandler() {
  const { setInvoiceSearchBtnStatus, invoiceObject, clearObject, updateValue } =
    useContext(InvoiceContext);
  const navigate = useNavigate();
  const [phoneNumberorNic, setPhoneNumberorNic] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [invoiceIdSearch, setInvoiceIdSearch] = useState("");
  const [updateBtnStatus, setUpdateBtnStatus] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const [data, setData] = useState({
    cus_fname: "",
    cus_address1: " ",
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

  const { boolvalue, setBoolvalue, userData, setUserData } =
    useContext(PopupContext);

  const handleInvoiceSearch = async (invoiceIdSearch) => {
    setInvoiceSearchBtnStatus(true);
    clearObject();

    try {
      const response = await axios.get(
        `http://localhost:8085/invoiceDataRetrieve/${invoiceIdSearch}`
      );

      if (response.status === 200) {
        updateValue("advance", response.data.advance);
        updateValue("createdDate", response.data.createdDate);
        response.data.payments.forEach((payment) => {
          updateValue("payments", payment);
        });
        updateValue("customerDetails", response.data.customerDetails);
        response.data.eqdetails.forEach((eqdetail) => {
          updateValue("eqdetails", eqdetail);
        });
        updateValue("InvoiceID", response.data.InvoiceID);
        updateValue("iDstatus", response.data.idStatus);
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

  const textFieldStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
    },
  };

  const handleClear = () => {
    clearObject();
    setInvoiceIdSearch("");
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
          ></Box>
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
              value={invoiceIdSearch}
              onChange={(e) => setInvoiceIdSearch(e.target.value)}
              sx={[{ width: "350px" }, textFieldStyle]}
              id="outlined-basic"
              label="Search with invoice Id"
              variant="outlined"
            />
            <Button
              sx={{ color: "white" }}
              variant="contained"
              onClick={() => handleInvoiceSearch(invoiceIdSearch)}
            >
              <YoutubeSearchedForIcon />
            </Button>
            <Button color="error" onClick={handleClear}>
              <BackspaceOutlinedIcon />
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
            <Box sx={{ width: "180px" }}>
              <h5>
                Invoice ID:{" "}
                {invoiceObject.InvoiceID ? invoiceObject.InvoiceID : ""}
              </h5>
              {updateBtnStatus ? (
                <h6>
                  {invoiceObject.createdDate
                    ? new Date(invoiceObject.createdDate).toLocaleString()
                    : null}
                </h6>
              ) : (
                <h6>{currentDateTime.toLocaleString()}</h6>
              )}
            </Box>
          </Box>
        </Box>
        <Box height={"auto"} display={"flex"} justifyContent={"center"}>
          <Box width={"50vw"}></Box>
          <Box
            width={"50vw"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <InvoicePdfWarehouseHandler />
        
          </Box>
        </Box>
      </Box>
    </>
  );
}
function InvoiceDocumentTable() {
  const [subTotal, setSubTotal] = useState(0);
  const [totalPayments, setTotalPayments] = useState(0);

  const { invoiceObject } = useContext(InvoiceContext);

  useEffect(() => {
    const calculateTotal = () => {
      let total = 0;
      if (invoiceObject && invoiceObject.eqdetails) {
        total = invoiceObject.eqdetails.reduce((sum, item) => {
          return (
            sum + item.eq_rental * item.duration_in_days * item.inveq_borrowqty
          );
        }, 0);
      }
      setSubTotal(total);
    };

    const calculatePayments = () => {
      let total = 0;
      if (invoiceObject && invoiceObject.payments) {
        total = invoiceObject.payments.reduce((sum, payment) => {
          console.log("amount", payment.invpay_amount);
          return sum + payment.invpay_amount;
        }, 0);
      }
      console.log("ttla", total);
      setTotalPayments(total);
    };

    calculateTotal();
    calculatePayments();
  }, [invoiceObject]);

  return (
    <TableContainer sx={{ mt: 4 }}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ padding: "4px" }}></TableCell>
            <TableCell sx={{ padding: "4px" }} align="center">
              Equipment ID
            </TableCell>
            <TableCell sx={{ padding: "4px" }} align="center">
              Equipment Name
            </TableCell>
            <TableCell sx={{ padding: "4px" }} align="center">
              Rental
            </TableCell>
            <TableCell sx={{ padding: "4px" }} align="center">
              Return Date
            </TableCell>
            <TableCell sx={{ padding: "4px" }} align="center">
              Borrow Qty
            </TableCell>
            <TableCell sx={{ padding: "4px" }} align="center">
              Duration (days)
            </TableCell>
            <TableCell sx={{ padding: "4px" }} align="center">
              Return Qty
            </TableCell>
            <TableCell sx={{ padding: "4px" }} align="center">
              Total (LKR)
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invoiceObject.eqdetails &&
            invoiceObject.eqdetails.map((row, index) => (
              <TableRow
                key={index}
                sx={{
                  "&:last-child td, &:last-child th": { border: 0 },
                  height: "50px",
                }}
              >
                <TableCell align="center" sx={{ padding: "4px" }}>
                  {index + 1}
                </TableCell>
                <TableCell align="center" sx={{ padding: "4px" }}>
                  {row.eq_id}
                </TableCell>
                <TableCell align="center" sx={{ padding: "4px" }}>
                  {row.eq_name}
                </TableCell>
                <TableCell align="center" sx={{ padding: "4px" }}>
                  {row.eq_rental}
                </TableCell>
                <TableCell align="center" sx={{ padding: "4px" }}>
                  {row.inveq_return_date == null ? (
                    <>
                      <Box
                        sx={{
                          backgroundColor: (theme) =>
                            theme.palette.primary.error[200],
                          ml: 4,
                          color: "white",
                          width: "50px",
                          height: "20px",
                          display: "flex",
                          justifyContent: "center",
                          borderRadius: 10,
                        }}
                      >
                        out
                      </Box>
                    </>
                  ) : (
                    new Date(row.inveq_return_date).toLocaleString()
                  )}
                </TableCell>
                <TableCell align="center" sx={{ padding: "4px" }}>
                  {row.inveq_borrowqty}
                </TableCell>
                <TableCell align="center" sx={{ padding: "4px" }}>
                  {row.duration_in_days}
                </TableCell>
                <TableCell align="center" sx={{ padding: "4px" }}>
                  {row.inveq_return_quantity}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    backgroundColor: (theme) => theme.palette.primary[50],
                    padding: "4px",
                    borderRadius: "5px",
                  }}
                >
                  {row.eq_rental * row.duration_in_days * row.inveq_borrowqty}{" "}
                  LKR
                </TableCell>
              </TableRow>
            ))}
          <TableRow>
            <TableCell colSpan={7} />
            <TableCell align="center">
              <Box
                sx={{
                  borderRadius: "10px",
                  overflow: "hidden",
                  padding: "10px",
                  backgroundColor: (theme) => theme.palette.primary[200],
                }}
              >
                SubTotal
              </Box>
            </TableCell>
            <TableCell align="center">{subTotal} LKR</TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={7} />
            <TableCell align="center">
              <Box
                sx={{
                  borderRadius: "10px",
                  overflow: "hidden",
                  padding: "10px",
                  backgroundColor: (theme) => theme.palette.primary[200],
                }}
              >
                Advance
              </Box>
            </TableCell>
            <TableCell align="center">{invoiceObject.advance} LKR</TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={7} />
            <TableCell align="center">
              <Box
                sx={{
                  borderRadius: "10px",
                  overflow: "hidden",
                  padding: "10px",
                  color: "",
                  backgroundColor: (theme) => theme.palette.primary[200],
                }}
              >
                Payments
              </Box>
            </TableCell>
            <TableCell align="center"> {totalPayments} LKR</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useRef } from "react";




dayjs.extend(utc);
dayjs.extend(timezone);

const INVOICE_MAX_WIDTH = 800; // single source of truth for card width

export function InvoicePdfWarehouseHandler() {
  const { invoiceObject, totalPayments } = useContext(InvoiceContext);
  const pdfRef = useRef(null);

  useEffect(() => {
    // keep for debugging
    // console.log(invoiceObject);
  }, [invoiceObject]);

  // ---------- helpers ----------
  const handleDurationinDays = (duration) => {
    const d = Number(duration) || 0;
    if (d > 0) return d;
    const t = dayjs(new Date());
    const c = dayjs(invoiceObject?.createdDate);
    return t.diff(c, "day") + 1;
  };

  const rentalCalculation = (row) => {
    const dateSet = Number(row.eqcat_dataset) || 0;
    const normalRental = Number(row.eq_rental) || 0;
    const specialRental = Number(row.spe_singleday_rent) || 0;
    const duration = Number(row.duration_in_days) || 0;
    const quantity = Number(row.inveq_borrowqty) || 0;
    const categoryId = Number(row.eqcat_id) || 0;

    let finalRental = 0;
    // Special scaffolding (category 2)
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

  // Rate/Day display that mirrors your table logic (with Sinhala note)
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

  const handleDownload = (name, invoiceid) => {
    const capture = pdfRef.current;
    const options = {
      scale: 2,
      useCORS: true,
      scrollY: -window.scrollY,
      windowHeight: document.documentElement.scrollHeight,
    };
    html2canvas(capture, options).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = canvas.width * 0.264583; // px to mm
      const pdfHeight = canvas.height * 0.264583;
      const doc = new jsPDF({ unit: "mm", format: [pdfWidth, pdfHeight] });
      doc.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      doc.save(`${name}-${invoiceid}-invoice.pdf`);
    });
  };

  // ---------- data splits ----------
  const eqdetails = invoiceObject?.eqdetails ?? [];
  const notHandedOverItems = eqdetails.filter((r) => !r.inveq_return_date);
  const handedOverItems = eqdetails.filter((r) => !!r.inveq_return_date);

  // ---------- totals ----------
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

  const calcTotalPaid = () => {
    const advance = Number(invoiceObject?.advance) || 0;
    const paysFromCtx = Number(totalPayments) || 0;
    // fallback if context aggregate isn’t present
    const paysFromRows = (invoiceObject?.payments ?? []).reduce(
      (sum, p) => sum + (Number(p.invpay_amount) || 0),
      0
    );
    const pays = paysFromCtx || paysFromRows;
    return advance + pays;
  };

  const balanceDue = grandTotal - calcTotalPaid();

  const issuedAt =
    invoiceObject?.createdDate &&
    dayjs(invoiceObject.createdDate).tz("Asia/Colombo");

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        px: 2, // small gutter for very small screens
      }}
    >
      <div className="invoice" style={{ width: "100%" }} ref={pdfRef}>
        <Paper
          elevation={10}
          sx={{
            mx: "auto",               // true centering
            my: 3,
            width: "100%",
            maxWidth: INVOICE_MAX_WIDTH,
            boxSizing: "border-box",
            px: 4,
            py: 3,
            borderRadius: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
          }}
        >
          {/* Top */}
          <Box sx={{ width: "100%", display: "flex", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "flex-end" }}>
              <Typography variant="h6">Invoice to :</Typography>
            </Box>
            <Box flexGrow={1} />
            <Box sx={{ width: { xs: "50%", sm: "45%", md: "40%" } }}>
              <Typography variant="h4" align="center" sx={{ py: 2 }}>
                <strong>INVOICE</strong>
              </Typography>
              <Stack gap={0.5}>
                <Typography>Invoice id : {invoiceObject?.InvoiceID}</Typography>
                <Typography>
                  Date : {issuedAt ? issuedAt.format("YYYY-MM-DD") : ""}
                </Typography>
                <Typography>
                  Time : {issuedAt ? issuedAt.format("HH:mm:ss") : ""}
                </Typography>
              </Stack>
            </Box>
          </Box>

          {/* Middle */}
          <Box sx={{ width: "100%", display: "flex", mt: 2 }}>
            <Box sx={{ width: { xs: "100%", md: "60%" } }}>
              <Typography variant="h5" sx={{ lineHeight: 1.2 }}>
                {invoiceObject?.customerDetails?.cus_fname}{" "}
                {invoiceObject?.customerDetails?.cus_lname}
              </Typography>
              <Box sx={{ display: "flex", mt: 1.5 }}>
                <Box sx={{ pr: 1.5 }}>
                  {invoiceObject?.customerDetails?.cus_fname && (
                    <>
                      <AddIcCallOutlinedIcon fontSize="small" sx={{ mb: 1 }} />
                      <br />
                      <ContactMailOutlinedIcon fontSize="small" />
                    </>
                  )}
                </Box>
                <Box sx={{ width: "100%" }}>
                  <Box sx={{ mb: 1 }}>
                    <Typography>
                      {invoiceObject?.customerDetails?.cus_phone_number || ""}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography>
                      {invoiceObject?.customerDetails?.cus_address1 || ""}
                    </Typography>
                    <Typography>
                      {invoiceObject?.customerDetails?.cus_address2 || ""}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box flexGrow={1} />
            <Box sx={{ width: { xs: "0%", md: "35%" } }} />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* FIRST TABLE: NOT handed over */}
          {notHandedOverItems.length > 0 && (
            <Box sx={{ width: "100%", mb: 2 }}>
              <Typography
                align="center"
                sx={{ fontWeight: 700, color: "red", fontSize: "0.95rem", mb: 1 }}
              >
                The following items are NOT handed over yet. Cost calculated up to today:
              </Typography>

              <TableContainer>
                <Table
                  size="small"
                  sx={{
                    width: "100%",
                    tableLayout: "fixed",
                    "& .MuiTableCell-root": { py: 0.9, px: 1 },
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Equipment</TableCell>
                      <TableCell align="center">Quantity</TableCell>
                      <TableCell align="center">Days</TableCell>
                      <TableCell align="center">Rate/Day (LKR)</TableCell>
                      <TableCell align="center">Total Cost (LKR)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {notHandedOverItems.map((row, idx) => {
                      const duration = today.diff(createdDate, "day") + 1;
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
                          <TableCell align="center">{row.eq_name}</TableCell>
                          <TableCell align="center">{row.inveq_borrowqty}</TableCell>
                          <TableCell align="center">{duration}</TableCell>
                          <TableCell align="center">{rateJSX}</TableCell>
                          <TableCell align="center">{total}</TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow>
                      <TableCell colSpan={4} align="right" sx={{ fontWeight: 600 }}>
                        Total cost for NOT handed over items up to today:
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        {notHandedOverTotal}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* SECOND TABLE: ONLY handed over */}
          <TableContainer>
            <Table
              size="small"
              sx={{
                width: "100%",
                tableLayout: "fixed",
                "& .MuiTableCell-root": { py: 0.9, px: 1 },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell align="center">Equipment Name</TableCell>
                  <TableCell align="center">Borrowed Qty</TableCell>
                  <TableCell align="center">Days</TableCell>
                  <TableCell align="center">Rate/Day (LKR)</TableCell>
                  <TableCell align="center">Item Total (LKR)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {handedOverItems.map((row, index) => {
                  const duration = handleDurationinDays(row.duration_in_days);
                  const rateJSX = displayRateJSX(row, duration);
                  return (
                    <TableRow key={index}>
                      <TableCell align="center">{row.eq_name}</TableCell>
                      <TableCell align="center">{row.inveq_borrowqty}</TableCell>
                      <TableCell align="center">{duration}</TableCell>
                      <TableCell align="center">{rateJSX}</TableCell>
                      <TableCell align="center">{rentalCalculation(row)}</TableCell>
                    </TableRow>
                  );
                })}

                <TableRow>
                  <TableCell colSpan={4} align="right" sx={{ fontWeight: 600 }}>
                    Equipment Subtotal :
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    {grandTotal}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ my: 2 }} />

          {/* Payments */}
          <TableContainer>
            <Table
              size="small"
              sx={{
                width: "100%",
                tableLayout: "fixed",
                "& .MuiTableCell-root": { py: 0.9, px: 1 },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell align="center">Payment Type</TableCell>
                  <TableCell align="center">Amount (LKR)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoiceObject?.advance ? (
                  <TableRow>
                    <TableCell align="center">Advance Payment</TableCell>
                    <TableCell align="center">{invoiceObject.advance}</TableCell>
                  </TableRow>
                ) : null}

                {(invoiceObject?.payments ?? []).map((p, i) => (
                  <TableRow key={i}>
                    <TableCell align="center">
                      {dayjs(p.invpay_payment_date)
                        .tz("Asia/Colombo")
                        .format("DD/MM | HH:mm")}
                    </TableCell>
                    <TableCell align="center">{p.invpay_amount}</TableCell>
                  </TableRow>
                ))}

                <TableRow>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Total Paid :
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    {calcTotalPaid()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Balance Due :
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    {balanceDue}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </div>

      <Button
        sx={{ mt: 1, mb: 3, fontSize: "0.8rem" }}
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
}
