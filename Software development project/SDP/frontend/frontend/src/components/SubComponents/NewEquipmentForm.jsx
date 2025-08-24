import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Swal from "sweetalert2";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import EquipmentStockComponent from "./EquipmentStockComponent";

function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

export function NewEquipmentForm(props) {
  const { eq_id } = props;
  const [toggle, setToggle] = useState(false);
  const [equipment, setEquipment] = useState({});
  const [stockValue, setStockValue] = useState();
  const [workingStock, setworkingStock] = useState();
  const [defectedStock, setDefectedStock] = useState();
  const [userRole, setUserRole] = useState("");

  const validationSchema = yup.object().shape({
    eq_name: yup.string().required("Machine Name is required"),
    eq_dofpurchase: yup
      .date()
      .nullable()
      .transform((value, originalValue) =>
        originalValue === "" ? null : value
      )
      .notRequired(),

    eq_warranty_expire: yup
      .date()
      .nullable()
      .transform((value, originalValue) =>
        originalValue === "" ? null : value
      )
      .notRequired(),
    eq_cost: yup
      .number()
      .typeError("Machine cost must be a number")
      .required("Machine cost is required")
      .positive("Machine cost must be positive"),
    eq_rental: yup
      .number()
      .typeError("Rental must be a number")
      .required("Rental is required")
      .positive("Rental must be positive"),
    eq_description: yup.string(),
    eq_defected_status: yup.number().required("Defective status is required"),
    eq_completestock: yup
      .number()
      .typeError("Complete stock must be a number")
      .required("Complete stock is required")
      .positive("Complete stock must be positive"),
    eq_catid: yup.number().required("Category is required"),
  });

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      eq_dofpurchase: null,
      eq_warranty_expire: null,
    },
  });

  useEffect(() => {
    const token = parseJwt(localStorage.getItem("token"));
    setUserRole(token.userRole);

    const fetchEquipmentById = async (id) => {
      try {
        const res = await axios.get(
          `http://localhost:8085/getEquipmentbyID/${id}`
        );
        const equipmentData = res.data[0];
        setEquipment(equipmentData);
        console.log(res.data);

        setValue(
          "eq_dofpurchase",
          equipmentData.eq_dofpurchase
            ? dayjs(equipmentData.eq_dofpurchase)
            : null
        );
        setValue(
          "eq_warranty_expire",
          equipmentData.eq_warranty_expire
            ? dayjs(equipmentData.eq_warranty_expire)
            : null
        );
        setValue("eq_id", equipmentData.eq_id);
        setValue("eq_name", equipmentData.eq_name);
        setValue("eq_cost", equipmentData.eq_cost);
        setValue("eq_rental", equipmentData.eq_rental);
        setValue("eq_description", equipmentData.eq_description);
        setValue("eq_defected_status", equipmentData.eq_defected_status);
        setValue("eq_completestock", equipmentData.eq_completestock);
        setValue("eqcat_name", equipmentData.eqcat_name);
        setValue("eq_catid", equipmentData.eq_catid); // Ensure correct value set

        const calcWorkingStock =
          equipmentData.eq_completestock - equipmentData.eq_defected_status;

        setDefectedStock(equipmentData.eq_defected_status);
        setworkingStock(calcWorkingStock);
      } catch (error) {
        console.error("Error fetching equipment by ID", error);
      }
    };

    if (eq_id) {
      fetchEquipmentById(eq_id);
    }
  }, [eq_id, setValue]);

  const handleClear = () => {
    reset(); // Reset form fields
    setEquipment({}); // Clear the equipment state
    setToggle(false); // Reset toggle state
    console.log(equipment.eq_catid);
  };
  const handleDelete = (id) => {
    console.log("id", id);
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`http://localhost:8085/deleteEquipmentbyId/${id}`)
          .then((response) => {
            Swal.fire({
              title: "Deleted!",
              text: response.data.message,
              icon: "success",
            });
          })
          .catch((error) => {
            console.error("Error deleting equipment:", error);
            Swal.fire({
              title: "Error!",
              text:
                error.response?.data?.message ||
                "Something went wrong. Please try again.",
              icon: "error",
            });
          });
      }
    });
  };

  const onSubmit = async (data) => {
    data.eq_defected_status = defectedStock;
    try {
      const response = await axios.post(
        "http://localhost:8085/setEquipment",
        data
      );
      Swal.fire("Success", "Machine edited successfully", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to edit machine", "error");
    }
  };

  return (
    <>
      <Box>
        <Grid container spacing={2}>
          <Grid item xs={3} sx={{ marginTop: "-12px" }}>
            {/* <Button
                onClick={() => setToggle(!toggle)}
                variant="contained"
                sx={{ marginBottom: "-8px" }}
              >
                Add Machine
              </Button> */}
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mt: 2, mb: 10 }}>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2} sx={{ m: 0.5, width: "95%" }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Machine Name"
                fullWidth
                {...register("eq_name")}
                error={!!errors.eq_name}
                helperText={errors.eq_name?.message}
              />
            </Grid>

            <Grid item xs={12} sm={6} sx={{ display: "flex" }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Date of Purchase"
                  value={getValues("eq_dofpurchase")}
                  onChange={(date) =>
                    setValue("eq_dofpurchase", date, { shouldValidate: true })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.eq_dofpurchase}
                      helperText={errors.eq_dofpurchase?.message}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Warranty Expiration Date"
                  value={getValues("eq_warranty_expire")}
                  onChange={(date) =>
                    setValue("eq_warranty_expire", date, {
                      shouldValidate: true,
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.eq_warranty_expire}
                      helperText={errors.eq_warranty_expire?.message}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Machine Cost"
                fullWidth
                {...register("eq_cost")}
                error={!!errors.eq_cost}
                helperText={errors.eq_cost?.message}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Rental"
                fullWidth
                {...register("eq_rental")}
                error={!!errors.eq_rental}
                helperText={errors.eq_rental?.message}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Description"
                fullWidth
                {...register("eq_description")}
                error={!!errors.eq_description}
                helperText={errors.eq_description?.message}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  onChange={(e) => {
                    setValue("eq_catid", e.target.value, {
                      shouldValidate: true,
                    });
                  }}
                  {...register("eq_catid")}
                  value={getValues("eq_catid") ?? ""}
                >
                 <MenuItem value={1}>1 Day machine</MenuItem>
                    <MenuItem value={2}>5 Day machine</MenuItem>
                    <MenuItem value={3}>4 Day machine</MenuItem>
                </Select>
                <Typography variant="body2" color="error">
                  {errors.eq_catid?.message}
                </Typography>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Complete Stock"
                fullWidth
                {...register("eq_completestock")}
                error={!!errors.eq_completestock}
                helperText={errors.eq_completestock?.message}
                onChange={(e) => {
                  setStockValue(e.target.value);
                  setworkingStock(e.target.value - defectedStock);
                }}
              />
              <EquipmentStockComponent
                stockValue={stockValue}
                workingStock={workingStock}
                setworkingStock={setworkingStock}
                defectedStock={defectedStock}
                setDefectedStock={setDefectedStock}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              {/* <FormControl fullWidth>
                <InputLabel>Defective Status</InputLabel>
                <Select
                  {...register("eq_defected_status")}
                  value={getValues("eq_defected_status") ?? ""}
                  onChange={(e) => {
                    setValue("eq_defected_status", e.target.value, {
                      shouldValidate: true,
                    });
                  }}
                  error={!!errors.eq_defected_status}
                >
                  <MenuItem value={1}>Defective</MenuItem>
                  <MenuItem value={2}>Not Defective</MenuItem>
                </Select>
                <Typography variant="body2" color="error">
                  {errors.eq_defected_status?.message}
                </Typography>
              </FormControl> */}
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              sx={{ display: "flex", ml: -14.5 }}
              gap={2}
            >
              <Button
                variant="contained"
                type="submit"
                customvariant="custom"
                color="success"
              >
                Submit
              </Button>

              {userRole == "admin" && (
                <Button
                  type="button"
                  customvariant="custom"
                  color="error"
                  variant="contained"
                  onClick={() => handleDelete(eq_id)}
                >
                  Delete
                </Button>
              )}
            </Grid>
          </Grid>
        </form>
      </Box>
    </>
  );
}
