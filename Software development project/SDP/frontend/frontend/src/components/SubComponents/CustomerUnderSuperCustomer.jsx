import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Grid,
  IconButton,
  Chip,
  Divider,
  InputAdornment,
  CircularProgress
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import Swal from "sweetalert2";

// Child Customer Form Schema (similar to main customer form)
const childCustomerSchema = yup.object().shape({
  fname: yup.string().required().min(3).max(15),
  lname: yup.string().max(25),
  nic: yup
    .string()
    .transform((value) => value.trim())
    .test("is-valid-nic", "Please enter a valid NIC number", (value) => {
      if (!value) return true;
      const nineDigitsAndV = /^[0-9]{9}v$/i;
      const twelveDigits = /^[0-9]{12}$/;
      return nineDigitsAndV.test(value) || twelveDigits.test(value);
    }),
  phoneNumber: yup
    .string()
    .required()
    .transform((value) => value.replace(/[-\s]/g, "").trim())
    .test(
      "is-valid-phonenumber",
      "Please enter a valid phone number",
      (value) => {
        if (!value) return false;
        const validFormatCheck1 = /^[1-9]\d{8}$/;
        const validFormatCheck2 = /^[0]\d{9}$/;
        return validFormatCheck1.test(value) || validFormatCheck2.test(value);
      }
    ),
  address1: yup.string().required().min(5).max(30),
  address2: yup.string().max(30),
});

// Child Customer Button Component
export default function CustomerUnderSuperCustomer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => setOpen(true)}
        sx={{ mb: 1 }}
      >
        Add Child Customer
      </Button>
      <ChildCustomerDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

// Main Child Customer Dialog Component
function ChildCustomerDialog({ open, onClose }) {
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSuperCustomer, setSelectedSuperCustomer] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch
  } = useForm({
    resolver: yupResolver(childCustomerSchema),
  });

  // Search for super customers
  const handleSearch = async () => {
    if (!searchValue.trim()) return;
    
    setSearchLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8085/searchCustomerByValue/${searchValue}`
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error searching customers:", error);
      Swal.fire("Error", "Failed to search customers", "error");
    } finally {
      setSearchLoading(false);
    }
  };

  // Select a super customer
  const selectSuperCustomer = (customer) => {
    setSelectedSuperCustomer(customer);
    setSearchValue("");
    setSearchResults([]);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedSuperCustomer(null);
    reset();
  };

  // Inherit field from super customer
  const inheritField = (fieldName, value) => {
    setValue(fieldName, value);
  };

  // Submit the child customer form
  const onSubmit = async (data) => {
    if (!selectedSuperCustomer) {
      Swal.fire("Error", "Please select a super customer first", "error");
      return;
    }

    try {
      // Add super customer ID to the data
      const submitData = {
        ...data,
        superCustomerId: selectedSuperCustomer.cus_id
      };

      const response = await axios.post(
        "http://localhost:8085/createChildCustomer",
        submitData
      );
      
      Swal.fire("Success", "Child customer created successfully", "success");
      onClose();
      reset();
      setSelectedSuperCustomer(null);
    } catch (error) {
      console.error("Error creating child customer:", error);
      Swal.fire("Error", "Failed to create child customer", "error");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div">
          Add Child Customer
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Create a new customer under a super customer
        </Typography>
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Left side - Super Customer Search and Selection */}
          <Grid item xs={12} md={5}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Super Customer Selection
              </Typography>
              
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search by ID, NIC, or Phone"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleSearch} edge="end">
                          <SearchIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {searchLoading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}

              {searchResults.length > 0 && (
                <Box sx={{ maxHeight: 200, overflow: "auto" }}>
                  {searchResults.map((customer) => (
                    <Paper
                      key={customer.cus_id}
                      variant="outlined"
                      sx={{ p: 1, mb: 1, cursor: "pointer" }}
                      onClick={() => selectSuperCustomer(customer)}
                    >
                      <Typography variant="subtitle2">
                        {customer.cus_fname} {customer.cus_lname}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        ID: {customer.cus_id} | NIC: {customer.nic} | Phone: {customer.cus_phone_number}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              )}

              {selectedSuperCustomer && (
                <Box sx={{ mt: 2 }}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Selected Super Customer:
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 1, bgcolor: "success.light" }}>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedSuperCustomer.cus_fname} {selectedSuperCustomer.cus_lname}
                    </Typography>
                    <Typography variant="body2">
                      ID: {selectedSuperCustomer.cus_id}
                    </Typography>
                    <Typography variant="body2">
                      NIC: {selectedSuperCustomer.nic}
                    </Typography>
                    <Typography variant="body2">
                      Phone: {selectedSuperCustomer.cus_phone_number}
                    </Typography>
                    <Button 
                      size="small" 
                      onClick={clearSelection}
                      sx={{ mt: 1 }}
                    >
                      Change Selection
                    </Button>
                  </Paper>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Right side - Child Customer Form */}
          <Grid item xs={12} md={7}>
            <Typography variant="h6" gutterBottom>
              Child Customer Details
            </Typography>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    {...register("fname")}
                    error={!!errors.fname}
                    helperText={errors.fname?.message}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    {...register("lname")}
                    error={!!errors.lname}
                    helperText={errors.lname?.message}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="NIC"
                    {...register("nic")}
                    error={!!errors.nic}
                    helperText={errors.nic?.message}
                    InputProps={{
                      endAdornment: selectedSuperCustomer && (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => inheritField("nic", selectedSuperCustomer.nic)}
                            edge="end"
                          >
                            <ContentCopyIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    {...register("phoneNumber")}
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber?.message}
                    InputProps={{
                      endAdornment: selectedSuperCustomer && (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => inheritField("phoneNumber", selectedSuperCustomer.cus_phone_number)}
                            edge="end"
                          >
                            <ContentCopyIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address Line 1"
                    {...register("address1")}
                    error={!!errors.address1}
                    helperText={errors.address1?.message}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address Line 2"
                    {...register("address2")}
                    error={!!errors.address2}
                    helperText={errors.address2?.message}
                  />
                </Grid>
              </Grid>
            </form>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit(onSubmit)} 
          variant="contained"
          disabled={!selectedSuperCustomer}
        >
          Create Child Customer
        </Button>
      </DialogActions>
    </Dialog>
  );
}