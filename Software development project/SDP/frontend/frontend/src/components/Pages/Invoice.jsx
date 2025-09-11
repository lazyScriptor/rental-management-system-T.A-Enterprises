import React, { useContext, useState, useEffect, useRef } from "react";
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
  Alert,
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
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const textFieldStyle = {
  "& .MuiOutlinedInput-root": { borderRadius: "12px" },
};

function Invoice() {
  const theme = useTheme();
  const {
    setPaymentArray,
    eqObject,
    setEqObject,
    invoiceSearchBtnStatus,
    setInvoiceSearchBtnStatus,
    invoiceObject,
    clearObject,
    updateValue,
    buttonDesable,
    setButtonDisable,
  } = useContext(InvoiceContext);

  const { showAlert } = useContext(SwalContext);
  const navigate = useNavigate();
  const { setIsAuthenticated } = useContext(AuthContext);
  const { setBoolvalue } = useContext(PopupContext);

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

  const clearData = {
    cus_fname: "",
    cus_address1: "",
    cus_address2: "",
    nic: "",
    cus_phone_number: "",
    Cus: "",
  };

  // stats
  const [numberOfInvoices, setNumberOfInvoices] = useState(0);
  const [incompleteInvoiceIds, setIncompleteInvoiceIds] = useState([]);

  // === server snapshot to diff unsaved edits (including handover) ===
  const originalInvoiceRef = useRef(null);
  const detailsDownRef = useRef(null);

  const deepClone = (o) => JSON.parse(JSON.stringify(o ?? null));
  const toNumber = (v) =>
    v === undefined || v === null || v === "" || isNaN(Number(v))
      ? 0
      : Number(v);
  const sum = (arr, sel) =>
    (arr || []).reduce((a, c) => a + toNumber(sel(c)), 0);
  const fmtLKR = (n) => `${toNumber(n).toLocaleString("en-LK")} LKR`;
  const safeLen = (a) => (Array.isArray(a) ? a.length : 0);

  // Remove trailing index/ID artifacts from equipment labels for cleaner display
  const cleanEqName = (name = "") =>
    String(name)
      .replace(/\s*-\s*\d+\s*$/g, "") // trailing " - 123"
      .replace(/\s*\(ID[:#]?\s*\d+\)\s*$/gi, "") // "(ID: 123)" or "(ID 123)"
      .trim();

  const captureOriginalFromServer = (respData) => {
    originalInvoiceRef.current = {
      InvoiceID: respData?.InvoiceID,
      advance: respData?.advance ?? 0,
      discount: respData?.discount ?? 0,
      idStatus: respData?.idStatus ?? 0,
      idHandoverStatus: respData?.idHandoverStatus ?? 0,
      inv_completed_datetime: respData?.inv_completed_datetime ?? null,
      customerDetails: deepClone(respData?.customerDetails),
      eqdetails: deepClone(respData?.eqdetails || []),
      payments: deepClone(respData?.payments || []),
      createdDate: respData?.createdDate ?? null,
    };
  };

  // === compute changes (SECTIONED + cleaned names) ===
  const computeInvoiceChanges = (prev, curr) => {
    const ch = {
      basics: [],
      customer: [],
      id: [],
      equipment: [],
      payments: [],
      completion: [],
    };
    if (!prev || !curr) return ch;

    const push = (k, text) => ch[k].push(text);

    // Basics
    if (toNumber(prev.advance) !== toNumber(curr.advance)) {
      push(
        "basics",
        `Advance: ${fmtLKR(prev.advance)} → ${fmtLKR(curr.advance)}`
      );
    }
    if (toNumber(prev.discount) !== toNumber(curr.discount)) {
      push(
        "basics",
        `Discount: ${fmtLKR(prev.discount)} → ${fmtLKR(curr.discount)}`
      );
    }
    if ((prev.createdDate || "") !== (curr.createdDate || "")) {
      push(
        "basics",
        `Created date: ${prev.createdDate || "—"} → ${curr.createdDate || "—"}`
      );
    }

    // Customer
    const pC = prev.customerDetails || {};
    const cC = curr.customerDetails || {};
    if (
      (pC.cus_fname || "") !== (cC.cus_fname || "") ||
      (pC.cus_lname || "") !== (cC.cus_lname || "")
    ) {
      push(
        "customer",
        `Customer name: ${
          (pC.cus_fname || "") + " " + (pC.cus_lname || "")
        } → ${(cC.cus_fname || "") + " " + (cC.cus_lname || "")}`
      );
    }
    if ((pC.cus_phone_number || "") !== (cC.cus_phone_number || "")) {
      push(
        "customer",
        `Phone: ${pC.cus_phone_number || "—"} → ${cC.cus_phone_number || "—"}`
      );
    }

    // ID flows
    const prevId = Number(prev.idStatus) === 1;
    const currId = Number(curr.idStatus ?? curr.iDstatus) === 1;
    if (prevId !== currId) {
      push(
        "id",
        `ID collected: ${prevId ? "Yes" : "No"} → ${currId ? "Yes" : "No"}`
      );
    }
    const prevHand = Number(prev.idHandoverStatus) === 1;
    const currHand = Number(curr.idHandoverStatus) === 1;
    if (prevHand !== currHand) {
      push(
        "id",
        `ID handed over: ${prevHand ? "Yes" : "No"} → ${
          currHand ? "Yes" : "No"
        }`
      );
    }

    // Equipment differences (including handover)
    const pList = Array.isArray(prev.eqdetails) ? prev.eqdetails : [];
    const cList = Array.isArray(curr.eqdetails) ? curr.eqdetails : [];
    const pMap = new Map(pList.map((e) => [String(e.eq_id), e]));
    const cMap = new Map(cList.map((e) => [String(e.eq_id), e]));

    if (pList.length !== cList.length) {
      push("equipment", `Equipment count: ${pList.length} → ${cList.length}`);
    }

    const pendingCount = (list) =>
      list.filter((e) => e?.inveq_return_date == null).length;
    const pPending = pendingCount(pList);
    const cPending = pendingCount(cList);
    if (pPending !== cPending) {
      push("equipment", `Pending items: ${pPending} → ${cPending}`);
    }

    cMap.forEach((cEq, id) => {
      const pEq = pMap.get(id);
      if (!pEq) {
        push(
          "equipment",
          `Equipment added: ${cleanEqName(cEq.eq_name || `EQ#${id}`)}`
        );
        return;
      }
      const pQty = toNumber(pEq.inveq_return_quantity);
      const cQty = toNumber(cEq.inveq_return_quantity);
      const pDate = pEq.inveq_return_date || "";
      const cDate = cEq.inveq_return_date || "";

      if (pQty !== cQty || pDate !== cDate) {
        const name = cleanEqName(cEq.eq_name || pEq.eq_name || `EQ#${id}`);
        const qtyPart = pQty !== cQty ? `qty ${pQty} → ${cQty}` : null;
        const datePart =
          pDate !== cDate ? `date ${pDate || "—"} → ${cDate || "—"}` : null;
        const parts = [qtyPart, datePart].filter(Boolean).join(", ");
        push("equipment", `Handover updated: ${name} (${parts})`);
      }
    });

    // Payments summary
    const prevPTotal = sum(prev.payments, (p) => p.invpay_amount);
    const currPTotal = sum(curr.payments, (p) => p.invpay_amount);
    if ((prev.payments || []).length !== (curr.payments || []).length) {
      push(
        "payments",
        `Payments count: ${safeLen(prev.payments)} → ${safeLen(curr.payments)}`
      );
    }
    if (toNumber(prevPTotal) !== toNumber(currPTotal)) {
      push(
        "payments",
        `Payments total: ${fmtLKR(prevPTotal)} → ${fmtLKR(currPTotal)}`
      );
    }

    // Completion state
    const prevDone = !!prev.inv_completed_datetime;
    const currDone = !!curr.inv_completed_datetime;
    if (prevDone !== currDone) {
      push(
        "completion",
        `Completion: ${prevDone ? "Completed" : "Open"} → ${
          currDone ? "Completed" : "Open"
        }`
      );
    }

    return ch;
  };

  useEffect(() => {}, [invoiceObject]);
  useEffect(() => {
    handleCreateNew();
  }, []);
  useEffect(() => {
    const t = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const isValidId = (id) => /^\d{1,4}$/.test(id) && parseInt(id) < 10000;
  const isValidNIC = (nic) =>
    /^[0-9]{9}v$/i.test(nic) || /^[0-9]{12}$/.test(nic);
  const isValidPhoneNumber = (phoneNumber) => {
    phoneNumber = phoneNumber.replace(/[-\s]/g, "").trim();
    return /^[1-9]\d{8}$/.test(phoneNumber) || /^[0]\d{9}$/.test(phoneNumber);
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
      const res = await axios.get(
        `http://localhost:8085/getCustomerbyPhoneNumberOrNic/${trimmedValue}`
      );
      const data = res.data;

      if (Array.isArray(data) && data.length > 0) {
        setData(data[0]);
        updateValue("customerDetails", data[0]);

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
        } catch {
          setNumberOfInvoices(0);
        }

        try {
          const id = data[0].cus_id;
          const resIncomplete = await axios.get(
            `http://localhost:8085/customer/incompleteInvoices/${id}`
          );
          setIncompleteInvoiceIds(resIncomplete.data.invoiceIds || []);
        } catch {
          setIncompleteInvoiceIds([]);
        }
      } else if (data.message) {
        setValidationMessage(
          "No customer found with this ID, phone number, or NIC"
        );
        setData({ ...clearData, cus_id: "" });
        updateValue("customerDetails", clearData);
        setNumberOfInvoices(0);
        setIncompleteInvoiceIds([]);
      } else {
        setValidationMessage("Unexpected error occurred");
        setData({ ...clearData, cus_id: "" });
        updateValue("customerDetails", clearData);
        setNumberOfInvoices(0);
        setIncompleteInvoiceIds([]);
      }
    } catch (error) {
      setValidationMessage("Error occurred in front end");
      setData({ ...clearData, cus_id: "" });
      updateValue("customerDetails", clearData);
      setNumberOfInvoices(0);
      setIncompleteInvoiceIds([]);
      console.error("Error in handleSearchPhoneNumberorNic:", error);
    }
  };

  const handleCreateNew = async () => {
    localStorage.removeItem("CIObject");
    setInvoiceSearchBtnStatus(false);
    setData(clearData);
    setPhoneNumberorNic("");
    setValidationMessage("");
    setEqObject("");
    clearObject();
    setPaymentArray([]);
    setUpdateBtnStatus(false);
    setNumberOfInvoices(0);
    setIncompleteInvoiceIds([]);
    originalInvoiceRef.current = null;

    try {
      const res = await axios.get("http://localhost:8085/invoiceIdRetrieve");
      setInvoiceId(res.data);
      updateValue("InvoiceID", res.data);
      updateValue("createdDate", currentDate);
      updateValue("discount", 0);
    } catch (error) {
      console.log("handleSearch Createinvoice error", error);
    }
  };

  // === Guarded Create New (sectioned modal, no item numbers) ===
  const handleCreateNewGuarded = async () => {
    try {
      if (invoiceSearchBtnStatus && originalInvoiceRef.current) {
        const currentSnapshot = deepClone(invoiceObject);
        const ch = computeInvoiceChanges(
          originalInvoiceRef.current,
          currentSnapshot
        );

        const sections = [
          { key: "equipment", title: "Equipment handover", icon: "🧰" },
          { key: "payments", title: "Payments", icon: "💵" },
          { key: "id", title: "ID Card", icon: "🪪" },
          { key: "customer", title: "Customer", icon: "👤" },
          { key: "basics", title: "Invoice", icon: "🧾" },
          { key: "completion", title: "Status", icon: "✅" },
        ];

        const hasAny = sections.some((s) => (ch[s.key] || []).length > 0);

        if (hasAny) {
          const MAX_PER_SECTION = 6;
          const renderSection = ({ key, title, icon }) => {
            const list = ch[key] || [];
            if (list.length === 0) return "";
            const more =
              list.length > MAX_PER_SECTION
                ? `<li class="chg-more">… +${
                    list.length - MAX_PER_SECTION
                  } more</li>`
                : "";
            return `
              <div class="chg-sec">
                <div class="chg-sec-h">${icon} ${title}</div>
                <ul class="chg-ul">${list
                  .slice(0, MAX_PER_SECTION)
                  .map((t) => `<li>${t}</li>`)
                  .join("")}${more}</ul>
              </div>
            `;
          };

          const html = `
            <style>
              .chg-wrap { text-align:left; font-size:14px; }
              .chg-header { margin:0 0 10px 0; color:#555; }
              .chg-sec { border-top:1px solid #eee; padding:10px 0; }
              .chg-sec:first-of-type { border-top:none; }
              .chg-sec-h { font-weight:600; margin-bottom:6px; color:#333; }
              .chg-ul { margin:0; padding-left:18px; }
              .chg-ul li { margin:4px 0; }
              .chg-more { color:#777; font-style:italic; }
            </style>
            <div class="chg-wrap">
              <div class="chg-header">
                These changes were detected on invoice <b>#${
                  originalInvoiceRef.current.InvoiceID
                }</b>:
              </div>
              ${sections.map(renderSection).join("")}
              <div class="chg-header" style="margin-top:8px;">What would you like to do?</div>
            </div>
          `;

          const result = await Swal.fire({
            title: "Unsaved changes",
            html,
            icon: "warning",
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: "Update invoice",
            denyButtonText: "Complete invoice",
            cancelButtonText: "Discard & create new",
            reverseButtons: true,
            width: 680,
          });

          if (result.isConfirmed) {
            if (detailsDownRef.current?.updateInvoice) {
              await detailsDownRef.current.updateInvoice();
            }
            return;
          } else if (result.isDenied) {
            if (detailsDownRef.current?.completeInvoice) {
              await detailsDownRef.current.completeInvoice();
            }
            return;
          } else {
            await handleCreateNew();
            return;
          }
        }
      }
      await handleCreateNew();
    } catch (e) {
      console.error(e);
      await handleCreateNew();
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
        (response.data.payments || []).forEach((payment) => {
          updateValue("payments", payment);
        });
        updateValue("customerDetails", response.data.customerDetails);

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
            } catch {
              setNumberOfInvoices(0);
            }

            try {
              const resIncomplete = await axios.get(
                `http://localhost:8085/customer/incompleteInvoices/${id}`
              );
              setIncompleteInvoiceIds(resIncomplete.data.invoiceIds || []);
            } catch {
              setIncompleteInvoiceIds([]);
            }
          } else {
            setNumberOfInvoices(0);
            setIncompleteInvoiceIds([]);
          }
        } catch {
          setNumberOfInvoices(0);
          setIncompleteInvoiceIds([]);
        }

        (response.data.eqdetails || []).forEach((eqdetail) => {
          updateValue("eqdetails", eqdetail);
        });

        updateValue("InvoiceID", response.data.InvoiceID);
        updateValue("iDstatus", response.data.idStatus);
        updateValue("discount", response.data.discount ?? 0);
        updateValue(
          "inv_completed_datetime",
          response.data.inv_completed_datetime
        );
        updateValue("idHandoverStatus", response.data.idHandoverStatus);

        // Capture clean snapshot (used by the guard)
        captureOriginalFromServer(response.data);
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
    }).then((r) => r.isConfirmed && navigate("/customers"));
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
        {/* Top bar */}
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
            ) : null}
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
            {/* Guarded button */}
            <Button onClick={handleCreateNewGuarded} variant="contained">
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

        {/* Middle section */}
        <Box sx={{ display: "flex", width: "100%", height: "55vh" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              width: "23.6%",
            }}
          >
            {updateBtnStatus ? (
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
                    }}
                    sx={{ color: (theme) => theme.palette.primary.error[400] }}
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
                    onClick={() =>
                      Swal.fire({
                        title: "Redirect to the customer page?",
                        text: "Your current work will be lost!",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#d33",
                        cancelButtonColor: "#3085d6",
                        confirmButtonText: "Yes, Proceed!",
                      }).then((r) => r.isConfirmed && navigate("/customers"))
                    }
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
                          {invoiceObject.customerDetails.cus_fname &&
                          invoiceObject.customerDetails.cus_lname
                            ? `${invoiceObject.customerDetails.cus_fname} ${invoiceObject.customerDetails.cus_lname}`
                            : invoiceObject.customerDetails.cus_fname || "—"}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">
                          Phone
                        </Typography>
                        <Typography variant="body1">
                          {invoiceObject.customerDetails.cus_phone_number ??
                            "—"}
                        </Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">
                          Address
                        </Typography>
                        <Typography variant="body1">
                          {invoiceObject.customerDetails.cus_address1 &&
                          invoiceObject.customerDetails.cus_address2
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
                        <Stack
                          direction="row"
                          spacing={1}
                          useFlexGap
                          flexWrap="wrap"
                          alignItems="center"
                        >
                          <Chip
                            size="small"
                            icon={<InsertDriveFileIcon fontSize="small" />}
                            label={`Total: ${numberOfInvoices ?? 0}`}
                            sx={{
                              bgcolor:
                                numberOfInvoices > 5 ? "#e6f4ea" : "#f5f5f5",
                              color:
                                numberOfInvoices >= 5
                                  ? "#019301ff"
                                  : "#717171ff",
                            }}
                          />
                          <Chip
                            size="small"
                            label={`Completed: ${Math.max(
                              (numberOfInvoices || 0) -
                                ((incompleteInvoiceIds &&
                                  incompleteInvoiceIds.length) ||
                                  0),
                              0
                            )}`}
                            variant="outlined"
                          />
                          <Chip
                            size="small"
                            label={`Pending: ${
                              (incompleteInvoiceIds &&
                                incompleteInvoiceIds.length) ||
                              0
                            }`}
                            color="warning"
                            variant="outlined"
                          />
                        </Stack>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>

                {/* Action row */}
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
                    onClick={() => setBoolvalue(true)}
                  >
                    Payments
                  </Button>
                  <IdCardStatus />
                  <IdCardHandoverStatus />
                  {invoiceSearchBtnStatus && <FeedbackComponent />}
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* Right column */}
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

        {/* Bottom section */}
        <Box
          minHeight={300}
          sx={{ display: "flex", width: "100%", height: "37vh" }}
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
              ref={detailsDownRef}
              handleCreateNew={handleCreateNew}
              updateBtnStatus={updateBtnStatus}
              setUpdateBtnStatus={setUpdateBtnStatus}
              handleInvoiceSearch={handleInvoiceSearch}
              onSyncedFromServer={(serverData) =>
                (originalInvoiceRef.current = deepClone(serverData))
              }
            />
          </Box>
        </Box>
      </Box>

      {/* Payments modal */}
      <OverlayDialogBox>
        <Payments handleInvoiceSearch={handleInvoiceSearch} />
      </OverlayDialogBox>
    </>
  );
}

export default Invoice;
