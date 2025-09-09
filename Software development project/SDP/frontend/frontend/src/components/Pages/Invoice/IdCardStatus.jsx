import { Box, Typography, Switch, Tooltip, Chip } from "@mui/material";
import React, { useContext, useEffect } from "react";
import { InvoiceContext } from "../../../Contexts/Contexts";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

function IdCardStatus() {
  const {
    fullDetailsEquipmentArray,
    setFullDetailsEquipmentArray,
    checkState,
    setCheckState,
    eqObject,
    setEqObject,
    invoiceObject,
    setInvoiceObject,
    updateValue,
  } = useContext(InvoiceContext);

  const isKept = Boolean(invoiceObject?.iDstatus);

  useEffect(() => {
    // keep context checkState in sync with current invoice state
    setCheckState(isKept);
  }, [isKept, setCheckState]);

  const handleToggle = (event) => {
    const next = event.target.checked;
    setCheckState(next);
    updateValue("iDstatus", next);
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

export default IdCardStatus;
