import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import axios from "axios";
import { InvoiceContext } from "../../../Contexts/Contexts";
import YoutubeSearchedForIcon from "@mui/icons-material/YoutubeSearchedFor";
import MousePopOver from "../../SubComponents/AlertComponents/MousePopOver";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Swal from "sweetalert2";

function InvoiceHandOverForm() {
  const [idFormData, setIdFormData] = useState({ id: "" });
  const [formData, setFormData] = useState({ name: "", quantity: "" });
  const [idErrors, setIdErrors] = useState({});
  const [eqErrors, setEqErrors] = useState({});
  const [eqQuantity, setEqQuantity] = useState(0);
  const [eqName, setEqName] = useState("");
  const [eqFullDetail, setEqFullDetail] = useState("");
  const [addButtonDisable, setAddButtonDisable] = useState(false);
  const [stockTextColor, setStockTextColor] = useState("black");

  const {
    responseManageToogle,
    setResponseManageToogle,
    eqObject,
    setEqObject,
    iDstatus,
    invoiceObject,
    setInvoiceObject,
    updateValue,
    updateEqObject,
    buttonDesable,
    setButtonDisable,
    clearObject,
  } = useContext(InvoiceContext);

  // Treat common "empty" values as not-returned
  const isNullishDate = (val) => {
    if (val == null) return true; // null or undefined
    if (typeof val === "string") {
      const v = val.trim().toLowerCase();
      // Backends sometimes send "", "null", "undefined" or MySQL zero-date
      if (v === "" || v === "null" || v === "undefined" || v === "0000-00-00 00:00:00") return true;
    }
    return false;
  };

  // A line-item is considered "returned/handed-over" only when there is a positive return quantity AND a valid return date
  const isReturned = (item) => {
    const qty = Number(item?.inveq_return_quantity || 0);
    const dt = item?.inveq_return_date;
    return qty > 0 && !isNullishDate(dt);
  };

  const pendingEquipments = React.useMemo(() => {
    const list = invoiceObject?.eqdetails || [];
    return Array.isArray(list) ? list.filter((item) => !isReturned(item)) : [];
  }, [invoiceObject]);

  const allHandedOver = React.useMemo(() => {
    const list = invoiceObject?.eqdetails || [];
    if (!Array.isArray(list) || list.length === 0) return false;
    return list.every(isReturned);
  }, [invoiceObject]);

  useEffect(() => {
    if (typeof setButtonDisable === "function") {
      setButtonDisable(allHandedOver);
    }
  }, [allHandedOver, setButtonDisable]);

  const handleIdChange = (e) => {
    const { name, value } = e.target;
    setIdFormData({ ...idFormData, [name]: value });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleReset = () => {
    setIdErrors({});
    setEqErrors({});
    setStockTextColor("black");
    setEqName("");
    setEqQuantity("");
    setEqObject([]);
    setFormData({ name: "", quantity: "" });
  };

  const handleSubmitId = (e) => {
    e.preventDefault();
    if (allHandedOver) return;
    setEqErrors({});
    const validationErrors = {};

    if (!idFormData.id.trim()) {
      validationErrors.id = "ID is required";
    } else if (!/^\d+$/.test(idFormData.id.trim())) {
      validationErrors.id = "ID should be a number";
    }
    setIdErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      const equipment = (invoiceObject?.eqdetails || []).find(
        (item) =>
          item?.eq_id == parseInt(idFormData.id.trim(), 10) &&
          !isReturned(item)
      );
      if (equipment) {
        setEqName(equipment.eq_name);
        setEqQuantity(equipment.inveq_borrowqty);
        setAddButtonDisable(false);
      } else {
        setEqName("");
        setEqQuantity(0);
      }
    }
  };

  useEffect(() => {
    if (formData.quantity > eqQuantity) {
      setStockTextColor("red");
    } else {
      setStockTextColor("black");
    }
  }, [formData.quantity, eqQuantity]);

  const validateForm = () => {
    const validationErrors = {};
    if (!idFormData.id.trim()) {
      validationErrors.id = "ID is required";
    }
    if (!eqName.trim()) {
      validationErrors.quantity = "Please search an equipment";
    } else if (!formData.quantity.trim()) {
      validationErrors.quantity = "Quantity is required";
    } else if (!/^\d+$/.test(formData.quantity.trim())) {
      validationErrors.quantity = "Quantity should be a number";
    } else if (parseInt(formData.quantity.trim(), 10) > eqQuantity) {
      validationErrors.quantity = "Quantity should not exceed the stock limit";
    } else if (formData.quantity <= 0) {
      validationErrors.quantity = "Quantity should be greater than zero";
    }
    return validationErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (allHandedOver) return;
    const validationErrors = validateForm();
    setEqErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      const currentDate = dateformatter();

      const index = (invoiceObject?.eqdetails || []).findIndex(
        (item) =>
          item?.eq_id == parseInt(idFormData.id.trim(), 10) &&
          !isReturned(item)
      );

      if (index !== -1) {
        const updatedEquipment = { ...invoiceObject.eqdetails[index] };
        updatedEquipment.inveq_return_quantity = parseInt(formData.quantity);
        updatedEquipment.inveq_return_date = currentDate;

        const updatedInvoiceObject = { ...invoiceObject };
        updatedInvoiceObject.eqdetails[index] = updatedEquipment;

        setInvoiceObject(updatedInvoiceObject);
        setFormData({ name: "", quantity: "" });
      } else {
        console.error("Equipment not found in invoiceObject or already returned");
      }
    }
  };

  const handleEquipmentClick = async (equipment) => {
    if (allHandedOver) return;
    const maxQty = Number(equipment?.inveq_borrowqty || 0);
    const { value: qty, isConfirmed } = await Swal.fire({
      title: `Return quantity for ${equipment?.eq_name || "equipment"}`,
      text: `Borrowed: ${maxQty}`,
      input: "number",
      inputLabel: "Quantity to return",
      inputAttributes: { min: 1, max: maxQty, step: 1 },
      inputValue: maxQty > 0 ? maxQty : 1,
      showCancelButton: true,
      confirmButtonText: "Confirm",
      preConfirm: (val) => {
        const n = Number(val);
        if (!Number.isInteger(n) || n <= 0) {
          Swal.showValidationMessage("Enter a valid positive integer");
          return false;
        }
        if (n > maxQty) {
          Swal.showValidationMessage(`Quantity cannot exceed borrowed (${maxQty})`);
          return false;
        }
        return n;
      },
    });

    if (!isConfirmed) return;

    const currentDate = dateformatter();
    const index = (invoiceObject?.eqdetails || []).findIndex(
      (item) => item?.eq_id == equipment?.eq_id && !isReturned(item)
    );

    if (index === -1) return;

    const updatedInvoiceObject = { ...invoiceObject };
    const updatedEquipment = { ...updatedInvoiceObject.eqdetails[index] };
    updatedEquipment.inveq_return_quantity = Number(qty);
    updatedEquipment.inveq_return_date = currentDate;
    updatedInvoiceObject.eqdetails = [...updatedInvoiceObject.eqdetails];
    updatedInvoiceObject.eqdetails[index] = updatedEquipment;
    setInvoiceObject(updatedInvoiceObject);
  };

  function dateformatter() {
    const createdDate = new Date();
    const year = createdDate.getFullYear();
    const month = String(createdDate.getMonth() + 1).padStart(2, "0");
    const day = String(createdDate.getDate()).padStart(2, "0");
    const hours = String(createdDate.getHours()).padStart(2, "0");
    const minutes = String(createdDate.getMinutes()).padStart(2, "0");
    const seconds = String(createdDate.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  return (
    <Paper sx={{ height: "55vh", width: "100%", p: 2, borderRadius: 4 }} elevation={3}>
      <Box>
        <Typography>Equipment Form</Typography>
        <hr />
        {allHandedOver && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2,
              p: 1.5,
              borderRadius: 2,
              bgcolor: (theme) => theme.palette.success.light,
              color: (theme) =>
                theme.palette.success.contrastText || theme.palette.success.dark,
            }}
          >
            <InfoOutlinedIcon fontSize="small" />
            <Typography variant="body2">All equipment lines are marked as handed over.</Typography>
          </Box>
        )}
        {!allHandedOver && (
          <Typography variant="body2" color="text.secondary">
            Tap an equipment below to enter the handover quantity.
          </Typography>
        )}
      </Box>

      {!allHandedOver && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Borrowed Equipments
          </Typography>
          {pendingEquipments.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No pending equipments to hand over.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {pendingEquipments.map((eq) => (
                <Button
                  key={eq.eq_id}
                  variant="outlined"
                  fullWidth
                  disabled={buttonDesable}
                  onClick={() => handleEquipmentClick(eq)}
                  sx={{ justifyContent: "space-between", textTransform: "none" }}
                >
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Typography variant="body2">{eq.eq_name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      (ID: {eq.eq_id})
                    </Typography>
                  </Box>
                  <Typography variant="body2">Borrowed: {eq.inveq_borrowqty}</Typography>
                </Button>
              ))}
            </Stack>
          )}
        </Box>
      )}
    </Paper>
  );
}

export default InvoiceHandOverForm;