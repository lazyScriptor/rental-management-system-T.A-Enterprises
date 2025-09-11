// frontend/src/components/SubComponents/AddChildCustomerDialog.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
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
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Badge,
  Alert,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import PhoneIphoneOutlinedIcon from "@mui/icons-material/PhoneIphoneOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
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
      const fmt1 = /^[1-9]\d{8}$/; // 9 digits (no leading 0)
      const fmt2 = /^[0]\d{9}$/;   // 10 digits with leading 0
      return fmt1.test(v) || fmt2.test(v);
    }),
  address1: yup.string().required("Address line 1 is required").min(3).max(120),
  address2: yup.string().max(120),
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
  const [results, setResults] = useState([]); // parent candidates
  const [selectedParent, setSelectedParent] = useState(null);

  const [isSearching, setIsSearching] = useState(false);
  const [childrenLoading, setChildrenLoading] = useState(false);
  const [children, setChildren] = useState([]); // existing children of selected parent

  const [statsLoading, setStatsLoading] = useState(false);
  const [parentStats, setParentStats] = useState({
    totalInvoices: 0,
    pendingIds: [],
  });

  const {
    handleSubmit,
    register,
    setValue,
    reset,
    watch,
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

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setResults([]);
      setSelectedParent(null);
      setChildren([]);
      setParentStats({ totalInvoices: 0, pendingIds: [] });
      reset();
    }
  }, [open, reset]);

  // Debounced parent search (by ID / NIC / Phone / name / address)
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

  // Load children & stats whenever a parent is selected
  useEffect(() => {
    const load = async () => {
      if (!selectedParent?.cus_id) {
        setChildren([]);
        setParentStats({ totalInvoices: 0, pendingIds: [] });
        return;
      }

      try {
        setChildrenLoading(true);
        const [{ data: childRes }, { data: ratingsRes }, { data: pendingRes }] =
          await Promise.all([
            axios.get(`http://localhost:8085/customers/${selectedParent.cus_id}/children`),
            axios.get(`http://localhost:8085/reports/getCustomerRatings/${selectedParent.cus_id}`),
            axios.get(`http://localhost:8085/customer/incompleteInvoices/${selectedParent.cus_id}`),
          ]);

        setChildren(Array.isArray(childRes?.children) ? childRes.children : []);

        const totalInv =
          ratingsRes?.response && Array.isArray(ratingsRes.response) && ratingsRes.response.length > 0
            ? ratingsRes.response[0].number_of_invoices ?? 0
            : 0;
        const pending = Array.isArray(pendingRes?.invoiceIds) ? pendingRes.invoiceIds : [];
        setParentStats({ totalInvoices: totalInv, pendingIds: pending });
      } catch (e) {
        setChildren([]);
        setParentStats({ totalInvoices: 0, pendingIds: [] });
      } finally {
        setChildrenLoading(false);
      }
    };

    setStatsLoading(true);
    load().finally(() => setStatsLoading(false));
  }, [selectedParent]);

  // Helpers
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

  // Duplicate checks against existing children under the parent
  const typedPhone = (watch("phoneNumber") || "").replace(/[-\s]/g, "").trim();
  const typedNic = (watch("nic") || "").trim().toLowerCase();

  const isPhoneDuplicate = useMemo(() => {
    if (!typedPhone || children.length === 0) return false;
    return children.some(
      (c) => (c.cc_phone_number || "").replace(/\D/g, "") === typedPhone
    );
  }, [typedPhone, children]);

  const isNicDuplicate = useMemo(() => {
    if (!typedNic || children.length === 0) return false;
    return children.some(
      (c) => (c.cc_nic || "").toLowerCase() === typedNic
    );
  }, [typedNic, children]);

  const onSubmit = async (data) => {
    if (!selectedParent?.cus_id) {
      Swal.fire({ icon: "warning", title: "Select a parent", text: "Please select a parent customer before saving." });
      return;
    }
    if (isPhoneDuplicate || isNicDuplicate) {
      Swal.fire({
        icon: "error",
        title: "Looks like a duplicate",
        text: "NIC or Phone already exists under this parent.",
      });
      return;
    }

    const payload = {
      parentId: selectedParent.cus_id,
      fname: data.fname,
      lname: data.lname,
      nic: data.nic || null,
      phoneNumber: data.phoneNumber,
      address1: data.address1,
      address2: data.address2 || null,
    };

    try {
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

  // Derived numbers
  const completedCount = Math.max((parentStats.totalInvoices || 0) - (parentStats.pendingIds?.length || 0), 0);
  const pendingCount = parentStats.pendingIds?.length || 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: { xs: "75vh", md: "78vh" },
        },
      }}
    >
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
          {/* LEFT: Search & Results & Children */}
          <Grid item xs={12} md={5} lg={5}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Stack spacing={1.5}>
                <TextField
                  fullWidth
                  label="Search parent by ID / NIC / Phone / Name / Address"
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
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Uses your <code>/searchCustomerByValue/:value</code> API and lists active customers.
                </Typography>

                <Divider />
                <Stack direction="row" alignItems="center" spacing={1}>
                  <GroupIcon fontSize="small" />
                  <Typography variant="subtitle2">Parent Results</Typography>
                  {isSearching && <CircularProgress size={16} sx={{ ml: 1 }} />}
                </Stack>

                <List dense disablePadding sx={{ maxHeight: 260, overflow: "auto" }}>
                  {!isSearching && results.length === 0 && searchTerm && (
                    <ListItem>
                      <ListItemText primary="No customers found" />
                    </ListItem>
                  )}

                  {results.map((c) => (
                    <ListItem key={c.cus_id} disablePadding secondaryAction={
                      <Chip size="small" label={`ID: ${c.cus_id}`} variant="outlined" />
                    }>
                      <ListItemButton
                        selected={selectedParent?.cus_id === c.cus_id}
                        onClick={() => setSelectedParent(c)}
                      >
                        <ListItemAvatar>
                          <Avatar>
                            <PersonIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${c.cus_fname || ""} ${c.cus_lname || ""}`.trim() || `Customer #${c.cus_id}`}
                          secondary={
                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                              <Chip size="small" icon={<BadgeOutlinedIcon />} label={`NIC: ${c.nic || "—"}`} />
                              <Chip size="small" icon={<PhoneIphoneOutlinedIcon />} label={formatPhoneOut(c.cus_phone_number)} />
                              <Chip size="small" icon={<HomeOutlinedIcon />} label={(c.cus_address1 || "—") + (c.cus_address2 ? `, ${c.cus_address2}` : "")} />
                            </Stack>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>

                {/* Existing children under selected parent */}
                <Divider sx={{ my: 1.5 }} />
                <Stack direction="row" alignItems="center" spacing={1}>
                  <VisibilityOutlinedIcon fontSize="small" />
                  <Typography variant="subtitle2">Existing Child Customers</Typography>
                  {childrenLoading && <CircularProgress size={16} sx={{ ml: 1 }} />}
                </Stack>

                <Box sx={{ maxHeight: 240, overflow: "auto", mt: 1 }}>
                  {!selectedParent ? (
                    <Alert severity="info">Select a parent to view their child customers.</Alert>
                  ) : childrenLoading ? null : children.length === 0 ? (
                    <Alert severity="warning">No child customers found under this parent.</Alert>
                  ) : (
                    <List dense disablePadding>
                      {children.map((ch) => {
                        const initials = `${(ch.cc_fname || " ").charAt(0)}${(ch.cc_lname || " ").charAt(0)}`.toUpperCase();
                        return (
                          <ListItem key={ch.cc_id} sx={{ px: 1 }}>
                            <ListItemAvatar>
                              <Avatar>{initials || <PersonIcon />}</Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={`${ch.cc_fname || ""} ${ch.cc_lname || ""}`.trim() || `Child #${ch.cc_id}`}
                              secondary={
                                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                  <Chip size="small" label={`#${ch.cc_id}`} variant="outlined" />
                                  <Chip size="small" icon={<BadgeOutlinedIcon />} label={ch.cc_nic || "No NIC"} />
                                  <Chip size="small" icon={<PhoneIphoneOutlinedIcon />} label={formatPhoneOut(ch.cc_phone_number)} />
                                </Stack>
                              }
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  )}
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* RIGHT: Parent details + stats + Child form */}
          <Grid item xs={12} md={7} lg={7}>
            <Stack spacing={2}>
              {/* Parent details & stats */}
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

                    {/* Stats */}
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
                        <Chip
                          color="default"
                          label={`Children: ${children.length}`}
                          icon={<GroupIcon />}
                          variant="outlined"
                        />
                        <Chip
                          color="primary"
                          label={`Invoices: ${parentStats.totalInvoices ?? 0}`}
                          variant="filled"
                        />
                        <Chip
                          color="success"
                          label={`Completed: ${completedCount}`}
                          variant="outlined"
                        />
                        <Chip
                          color="warning"
                          label={`Pending: ${pendingCount}`}
                          variant="outlined"
                        />
                        {pendingCount > 0 && (
                          <Chip
                            size="small"
                            label={`Pending IDs: ${parentStats.pendingIds.join(", ")}`}
                            variant="outlined"
                          />
                        )}
                      </Stack>
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

                {(isPhoneDuplicate || isNicDuplicate) && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    A child with the same {isNicDuplicate ? "NIC" : "Phone"} already exists under this parent.
                  </Alert>
                )}

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
                      error={!!errors.phoneNumber || isPhoneDuplicate}
                      helperText={
                        errors.phoneNumber?.message ||
                        (isPhoneDuplicate ? "This phone already exists under this parent." : "")
                      }
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
          disabled={!selectedParent || isSubmitting || isPhoneDuplicate || isNicDuplicate}
        >
          Create Child
        </Button>
      </DialogActions>
    </Dialog>
  );
}