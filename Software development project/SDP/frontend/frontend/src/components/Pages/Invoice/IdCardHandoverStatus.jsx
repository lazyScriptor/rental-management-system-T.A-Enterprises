import { Box, Typography, Switch, Tooltip, Chip } from "@mui/material";
import React, { useContext } from "react";
import { InvoiceContext } from "../../../Contexts/Contexts";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

function IdCardHandoverStatus() {
  const { invoiceObject, updateValue } = useContext(InvoiceContext);

  // Use the same key used elsewhere in your app (Invoice.jsx sets "idHandoverStatus")
  const isHandedOver = Boolean(invoiceObject?.idHandoverStatus);

  const handleToggle = (event) => {
    const next = event.target.checked;
    updateValue("idHandoverStatus", next);
  };

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        px: 1.25,
        py: 0.75,
        borderRadius: 2,
        bgcolor: (theme) => theme.palette.primary[50],
      }}
    >
      <Tooltip title="Toggle if the customer's ID card has been handed back">
        <InfoOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} />
      </Tooltip>

      <Typography variant="body2">ID handed over</Typography>

      <Switch size="small" checked={isHandedOver} onChange={handleToggle} />

      <Chip
        size="small"
        label={isHandedOver ? "Handed over" : "Not handed"}
        color={isHandedOver ? "success" : "default"}
        variant={isHandedOver ? "filled" : "outlined"}
      />
    </Box>
  );
}

export default IdCardHandoverStatus;