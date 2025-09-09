import { Box, Typography, Switch, Tooltip, Chip } from "@mui/material";
import React, { useContext } from "react";
import { InvoiceContext } from "../../../Contexts/Contexts";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

function IdCardHandoverStatus() {
  const {
    invoiceObject,
    updateValue,
  } = useContext(InvoiceContext);

  const isKept = Boolean(invoiceObject?.iDHandoverStatus);

  const handleToggle = (event) => {
    const next = event.target.checked;
    updateValue("iDHandoverStatus", next);
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
      <Tooltip title="Toggle if the customer's ID card is kept with you">
        <InfoOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} />
      </Tooltip>
      <Typography variant="body2">Keep ID card</Typography>
      <Switch size="small" checked={isKept} onChange={handleToggle} />
      <Chip
        size="small"
        label={isKept ? "Kept" : "Not kept"}
        color={isKept ? "success" : "default"}
        variant={isKept ? "filled" : "outlined"}
      />
    </Box>
  );
}

export default IdCardHandoverStatus;