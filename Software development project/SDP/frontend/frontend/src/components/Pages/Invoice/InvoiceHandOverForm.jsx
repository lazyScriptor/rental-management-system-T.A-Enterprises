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

function InvoiceHandOverForm() {
  const [idFormData, setIdFormData] = useState({
    id: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
  });
  const [idErrors, setIdErrors] = useState({});
  const [eqErrors, setEqErrors] = useState({});
  const [eqQuantity, setEqQuantity] = useState(0);
  const [eqName, setEqName] = useState("");
  const [eqFullDetail, setEqFullDetail] = useState("");
  const [addButtonDisable, setAddButtonDisable] = useState(false);
  const [stockTextColor, setStockTextColor] = useState("black");

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

  // Determine if all equipments on this invoice have been handed over
  const allHandedOver = React.useMemo(() => {
    const list = invoiceObject?.eqdetails || [];
    if (!Array.isArray(list) || list.length === 0) return false;
    return list.every(
      (item) =>
        Number(item?.inveq_return_quantity || 0) > 0 ||
        item?.inveq_return_date != null
    );
  }, [invoiceObject]);

  // Propagate this state to any outer consumers (optional)
  useEffect(() => {
    if (typeof setButtonDisable === "function") {
      setButtonDisable(allHandedOver);
    }
  }, [allHandedOver, setButtonDisable]);

  const handleIdChange = (e) => {
    const { name, value } = e.target;
    setIdFormData({
      ...idFormData,
      [name]: value,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
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
    if (allHandedOver) return; // Do nothing if everything is already handed over
    setEqErrors({});
    const validationErrors = {};

    if (!idFormData.id.trim()) {
      validationErrors.id = "ID is required";
    } else if (!/^\d+$/.test(idFormData.id.trim())) {
      validationErrors.id = "ID should be a number";
    }
    setIdErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      // Search for the equipment details in invoiceObject
      const equipment = invoiceObject.eqdetails.find(
        (item) =>
          item.eq_id == parseInt(idFormData.id.trim()) &&
          item.inveq_return_date == null
      );
      if (equipment) {
        // Set equipment details to state
        setEqName(equipment.eq_name);
        setEqQuantity(equipment.inveq_borrowqty); // Assuming quantity is available in the equipment object
        setAddButtonDisable(false);
      } else {
        setEqName("");
        setEqQuantity(0);
        // Handle case when equipment is not found
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
    if (allHandedOver) return; // Do nothing if everything is already handed over
    const validationErrors = validateForm();
    setEqErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      const currentDate = dateformatter();

      // Find the equipment in the invoiceObject where inveq_return_quantity is 0
      const index = invoiceObject.eqdetails.findIndex(
        (item) =>
          item.eq_id == parseInt(idFormData.id.trim()) &&
          item.inveq_return_quantity == 0
      );

      if (index !== -1) {
        // Clone the equipment object to avoid mutating the original state directly
        const updatedEquipment = { ...invoiceObject.eqdetails[index] };

        // Add additional key-value pairs
        updatedEquipment.inveq_return_quantity = parseInt(formData.quantity);
        updatedEquipment.inveq_return_date = currentDate;

        // Update the equipment in the invoiceObject
        const updatedInvoiceObject = { ...invoiceObject };
        updatedInvoiceObject.eqdetails[index] = updatedEquipment;

        // Set the updated invoiceObject state
        setInvoiceObject(updatedInvoiceObject);

        // Reset form data
        setFormData({ name: "", quantity: "" });
      } else {
        // Handle case when equipment is not found
        console.error(
          "Equipment not found in invoiceObject or already returned"
        );
      }
    }
  };

  //   const handleHandover = () => {
  //     const validationErrors = validateForm();
  //     setEqErrors(validationErrors);

  //     if (Object.keys(validationErrors).length === 0) {
  //       console.log("This is the data", dateformatter());
  //       // Add your handover logic here, similar to handleSubmit
  //     }
  //   };

  return (
    <Paper
      sx={{ height: "55vh", width: "100%", p: 2, borderRadius: 4 }}
      elevation={3}
    >
      <form noValidate onSubmit={handleSubmitId}>
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
                theme.palette.success.contrastText ||
                theme.palette.success.dark,
            }}
          >
            <InfoOutlinedIcon fontSize="small" />
            <Typography variant="body2">
              All the equipments are handed over.
            </Typography>
          </Box>
        )}
        {!allHandedOver && (
          <Box sx={{ display: "flex", height: "80px" }}>
            <FormLabel
              sx={{
                pt: 2,
                pr: 2,
                width: "15%",
                display: "flex",
                justifyContent: "end",
              }}
              htmlFor="id"
            >
              ID
            </FormLabel>
            <TextField
              id="id"
              label="ID"
              name="id"
              disabled={allHandedOver}
              type="text"
              onChange={handleIdChange}
              error={!!idErrors.id}
              helperText={idErrors.id && idErrors.id}
            />
            <Button
              sx={{ width: "20px", height: "57px" }}
              type="submit"
              disabled={buttonDesable || allHandedOver}
              onClick={() => {
                setEqName("");
                setEqQuantity("");
              }}
            >
              <YoutubeSearchedForIcon />
            </Button>
          </Box>
        )}
      </form>
      {!allHandedOver && (
        <form noValidate onSubmit={handleSubmit}>
          <Stack spacing={2} marginTop={2}>
            <Box sx={{ display: "flex", height: "80px" }}>
              <FormLabel
                sx={{
                  pt: 2,
                  pr: 2,
                  width: "17%",
                  display: "flex",
                  justifyContent: "end",
                }}
                htmlFor="name"
              >
                Name
              </FormLabel>
              <TextField
                disabled={true}
                fullWidth
                id="name"
                label={eqName || "Name"}
                name="name"
                type="text"
                value={eqName}
                onChange={handleChange}
              />
            </Box>
            <Box sx={{ display: "flex", height: "80px" }}>
              <FormLabel
                sx={{
                  pt: 2,
                  pr: 2,
                  width: "15%",
                  display: "flex",
                  justifyContent: "end",
                }}
                htmlFor="quantity"
              >
                Quantity
              </FormLabel>
              <TextField
                fullWidth
                disabled={addButtonDisable || !eqName || allHandedOver}
                id="quantity"
                label={["remaining : ", eqQuantity || "No equipment found"]}
                name="quantity"
                type="number"
                onChange={handleChange}
                error={!!eqErrors.quantity}
                helperText={eqErrors.quantity && eqErrors.quantity}
              />
            </Box>
            <Typography
              sx={{
                backgroundColor: (theme) => theme.palette.primary[50],
                p: 1.3,
                width: "180px",
                borderRadius: 3,
              }}
              variant="body2"
              color={stockTextColor}
              textAlign={"left"}
            >
              Rem Borrowed Stock: {eqQuantity}
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-evenly",
                pt: "45px",
              }}
            >
              <Button
                disabled={buttonDesable || allHandedOver}
                sx={{ mt: 2.5 }}
                variant="contained"
                color="warning"
                customvariant="custom"
                //   onClick={handleHandover}
                type="submit"
              >
                Handover
              </Button>
              <Button
                disabled={buttonDesable || allHandedOver}
                sx={{ mt: 2.5 }}
                variant="contained"
                color="error"
                customvariant="custom"
                onClick={handleReset}
              >
                Clear
              </Button>
            </Box>
          </Stack>
        </form>
      )}
    </Paper>
  );
}

export default InvoiceHandOverForm;
