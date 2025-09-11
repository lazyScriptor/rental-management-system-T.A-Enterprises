import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import DuplicateIcon from "@mui/icons-material/ContentCopy"; // alias
import ContentCopyIcon from "@mui/icons-material/ContentCopy"; // actual import for MUI
import axios from "axios";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Swal from "sweetalert2";

const nicRegex9V = /^[0-9]{9}v$/i;
const nicRegex12 = /^[0-9]{12}$/;

const schema = yup.object().shape({
  fname: yup.string().required("First name is required").min(2).max(30),
  lname: yup.string().max(40),
  // NIC is optional (you said you want to add customers without NIC)
  nic: yup
    .string()
    .test("is-valid-nic", "NIC must be 9 digits + V or 12 digits", (value) => {
      if (!value) return true; // optional
      return nicRegex9V.test(value) || nicRegex12.test(value);
    }),
  phoneNumber: yup
    .string()
    .required("Phone is required")
    .transform((v) => v?.replace(/[-\s]/g, "").trim())
    .test("is-valid-ph", "Phone must be 10 digits (can start with 0)", (v) => {
      if (!v) return false;
      const fmt1 = /^[1-9]\d{8}$/; // 9 digits (no leading 0) – your code allowed this pattern as well
      const fmt2 = /^[0]\d{9}$/;   // 10 digits with leading 0
      return fmt1.test(v) || fmt2.test(v);
    }),
  address1: yup.string().required("Address line 1 is required").min(3).max(60),
  address2: yup.string().max(60),
});

const textFieldStyle = {
  "& .MuiOutlinedInput-root": { borderRadius: "12px" },
};

export default function AddChildCustomerDialog({
  open,
  onClose,
  onCreated, // optional callback(newChildId)
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [selectedParent, setSelectedParent] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const {
    handleSubmit,
    register,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fname: "",
      lname: "",
      nic: "",
      phoneNumber: "",
      address1: "",
      address2: "",
    },
  });

  // Reset dialog state when open/close changes
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setResults([]);
      setSelectedParent(null);
      reset();
    }
  }, [open, reset]);

  // Debounced search against your existing endpoint:
  // GET /searchCustomerByValue/:value
  useEffect(() => {
    if (!open) return;
    const value = (searchTerm || "").trim();
    if (!value) {
      setResults([]);
      return;
    }

    const handle = setTimeout(async () => {
      try {
        setIsSearching(true);
        const cleaned = value.replace(/[\s+]/g, "");
        const res = await axios.get(
          `http://localhost:8085/searchCustomerByValue/${cleaned}`
        );
        setResults(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(handle);
  }, [searchTerm, open]);

  // Simple formatter (keeps your existing phone display style optional)
  const formatPhoneOut = (v) => {
    const s = (v || "").replace(/\D/g, "");
    if (s.length === 10) return `${s.slice(0, 3)}-${s.slice(3, 6)}-${s.slice(6)}`;
    return v || "—";
  };

  const handleInherit = (field) => {
    if (!selectedParent) return;
    if (field === "nic") setValue("nic", selectedParent.nic || "");
    if (field === "phoneNumber") setValue("phoneNumber", selectedParent.cus_phone_number || "");
  };

  const onSubmit = async (data) => {
    if (!selectedParent?.cus_id) {
      Swal.fire({ icon: "warning", title: "Select a parent", text: "Please select a parent customer before saving." });
      return;
    }

    // payload the backend will expect
    const payload = {
      parentId: selectedParent.cus_id, // assumes FK column like cus_parent_id on backend
      fname: data.fname,
      lname: data.lname,
      nic: data.nic || null,
      phoneNumber: data.phoneNumber,
      address1: data.address1,
      address2: data.address2 || null,
    };

    try {
      // Dedicated API to create child under a parent
      const res = await axios.post("http://localhost:8085/createChildCustomer", payload);

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Child customer added",
        showConfirmButton: false,
        timer: 1500,
      });

      onClose?.();
      onCreated?.(res?.data?.insertId || null);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Could not add child customer. Please try again.",
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pr: 6 }}>
        Add Child Customer under a Parent
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: "absolute", right: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        <Grid container spacing={2}>
          {/* LEFT: Search & Results */}
          <Grid item xs={12} md={5}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <TextField
                fullWidth
                label="Search by ID / NIC / Phone"
                placeholder="E.g. 123 | 200012345678 | 0771234567 | 123456789V"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={textFieldStyle}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ManageSearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Typography variant="caption" sx={{ color: "text.secondary", mt: 1, display: "block" }}>
                Live search uses your existing <code>/searchCustomerByValue/:value</code> API.
              </Typography>

              <Divider sx={{ my: 2 }} />

              <List dense disablePadding sx={{ maxHeight: 310, overflow: "auto" }}>
                {isSearching && (
                  <ListItem>
                    <ListItemText primary="Searching..." />
                  </ListItem>
                )}

                {!isSearching && results.length === 0 && searchTerm && (
                  <ListItem>
                    <ListItemText primary="No customers found" />
                  </ListItem>
                )}

                {results.map((c) => (
                  <ListItem key={c.cus_id} disablePadding>
                    <ListItemButton
                      selected={selectedParent?.cus_id === c.cus_id}
                      onClick={() => setSelectedParent(c)}
                    >
                      <ListItemText
                        primary={`${c.cus_fname || ""} ${c.cus_lname || ""}`.trim() || `Customer #${c.cus_id}`}
                        secondary={
                          <>
                            <span>ID: {c.cus_id}</span>
                            {"  ·  "}
                            <span>NIC: {c.nic || "—"}</span>
                            {"  ·  "}
                            <span>Phone: {formatPhoneOut(c.cus_phone_number)}</span>
                          </>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* RIGHT: Parent details + Child form */}
          <Grid item xs={12} md={7}>
            <Stack spacing={2}>
              {/* Parent details */}
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 1 }}>
                  Selected Parent
                </Typography>
                {selectedParent ? (
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">Name</Typography>
                      <Typography variant="body1">
                        {(selectedParent.cus_fname || "") + " " + (selectedParent.cus_lname || "")}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">Customer ID</Typography>
                      <Typography variant="body1">{selectedParent.cus_id}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">NIC</Typography>
                      <Typography variant="body1">{selectedParent.nic || "—"}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">Phone</Typography>
                      <Typography variant="body1">{formatPhoneOut(selectedParent.cus_phone_number)}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Address</Typography>
                      <Typography variant="body1">
                        {(selectedParent.cus_address1 || "—") +
                          (selectedParent.cus_address2 ? `, ${selectedParent.cus_address2}` : "")}
                      </Typography>
                    </Grid>
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Select a parent from the search results to continue.
                  </Typography>
                )}
              </Paper>

              {/* Child Form */}
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 2 }}>
                  Child Customer Details
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="First name"
                      fullWidth
                      size="small"
                      sx={textFieldStyle}
                      error={!!errors.fname}
                      helperText={errors.fname?.message}
                      {...register("fname")}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Last name"
                      fullWidth
                      size="small"
                      sx={textFieldStyle}
                      error={!!errors.lname}
                      helperText={errors.lname?.message}
                      {...register("lname")}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="NIC (optional)"
                      fullWidth
                      size="small"
                      sx={textFieldStyle}
                      error={!!errors.nic}
                      helperText={errors.nic?.message}
                      {...register("nic")}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Inherit parent's NIC">
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => handleInherit("nic")}
                                  disabled={!selectedParent?.nic}
                                >
                                  <ContentCopyIcon fontSize="inherit" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Phone"
                      fullWidth
                      size="small"
                      sx={textFieldStyle}
                      error={!!errors.phoneNumber}
                      helperText={errors.phoneNumber?.message}
                      {...register("phoneNumber")}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Inherit parent's Phone">
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => handleInherit("phoneNumber")}
                                  disabled={!selectedParent?.cus_phone_number}
                                >
                                  <ContentCopyIcon fontSize="inherit" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Address line 1"
                      fullWidth
                      size="small"
                      sx={textFieldStyle}
                      error={!!errors.address1}
                      helperText={errors.address1?.message}
                      {...register("address1")}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Address line 2"
                      fullWidth
                      size="small"
                      sx={textFieldStyle}
                      error={!!errors.address2}
                      helperText={errors.address2?.message}
                      {...register("address2")}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={!selectedParent || isSubmitting}
        >
          Create Child
        </Button>
      </DialogActions>
    </Dialog>
  );
}