import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import {
  deleteCustomer,
  deleteEquipment,
  getEquipmentbyID,
  getEquipmentbyName,
  getCustomerbyID,
  getCustomerbyNIC,
  getCustomers,
  getEquipment,
  getUsers,
  updateCustomerDetails,
  getCustomerbyFirstName,
  getCustomerbyLastName,
  setCustomer,
  getCustomerbyAddress1,
  getCustomerbyAddress2,
  getUserRole,
  loginValidate,
  getInvoiceId,
  getInvoiceDetails,
  getCustomerBySearchingManyFields,
  setEquipment,
  addEquipment,
  getCustomerbyPhoneNumberOrNic,
  getCustomerbyPhoneNumber,
  createInvoiceDetails,
  updateInvoiceDetails,
  getUserDetails,
  setUserDetails,
  deleteUserRole,
  updateUserRole,
  reportsGetCustomerRatings,
  reportsGetCustomerInvoiceDetails,
  getEquipmentUtilizationReport,
  getEquipmentRevenueReport,
  getUnderutilizedEquipment,
  getEquipmentRentalDetails,
  getIncompleteRentals,
  getDeletedInvoices,
  deleteEquipmentById,
  getCombinedInvoiceReports,
  reportsGetCustomerRatingsPerCustomer,
} from "./database.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  return res.json("From backend side");
});

app.get("/users", async (req, res) => {
  try {
    const users = await getUsers();
    return res.json(users);
  } catch (error) {
    console.error("Error in fetching users:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

const verifyAdmin = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    console.log("object");
    return res.status(403).json({ auth: false, message: "No token provided." });
  }
  jwt.verify(token, "jwtSecret", (err, decoded) => {
    if (err) {
      return res
        .status(500)
        .json({ auth: false, message: "Failed to authenticate token." });
    } else {
      if (decoded.userRole === "admin") {
        console.log("authenticated");
        next();
      } else {
        return res
          .status(403)
          .json({ auth: false, message: "You are not an admin." });
      }
    }
  });
};
const verifyJWT = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    res.json({ auth: false, message: "failed" });
  } else {
    jwt.verify(token, "jwtSecret", (err, decoded) => {
      if (err) {
        res.json({ auth: false, message: "U failed to authencticate" });
      } else {
        req.role = decoded.userRole;
        console.log("veriy jwt else part ", req.role);
        next();
      }
    });
  }
};

app.get("/isUserAuth", verifyJWT, (req, res) => {
  return res.json({ auth: true, message: "You have a valid token" });
});

app.get("/loginValidate", async (req, res) => {
  try {
    const response = await loginValidate(req.query);
    console.log("response", response);
    const id = response[1][0].user_id;
    const userRole = response[1][0].ur_role;
    const userName = response[1][0].username;
    console.log("id is", id, "Role is ", userRole);
    const token = jwt.sign({ userRole }, "jwtSecret", {
      expiresIn: 60 * 60 * 24,
    });

    return res.json({
      auth: true,
      token: token,
      result: userRole,
      username: userName,
    });
  } catch (error) {
    console.log("wrong", { auth: false, message: "express failed auth false" });
    return res.json({ auth: false, message: "express failed auth false" });
  }
});

app.get("/customers", async (req, res) => {
  try {
    console.log(req);
    const customers = await getCustomers();
    return res.json(customers);
  } catch (error) {
    console.error("Error in fetching customers:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/searchCustomerByValue/:value", async (req, res) => {
  try {
    const customers = await getCustomerBySearchingManyFields(req.params.value);
    return res.json(customers);
  } catch (error) {
    console.error("Error in fetching customers:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/equipment", async (req, res) => {
  try {
    const equipment = await getEquipment();
    return res.json(equipment);
  } catch (error) {
    console.error("Error in fetching equipment:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/getEquipmentbyID/:equipmentID", async (req, res) => {
  try {
    console.log("Server side getEquipmentbyID", req.params.equipmentID);
    const equipment = await getEquipmentbyID(req.params.equipmentID);
    return res.json(equipment);
  } catch (error) {
    console.error("Error in getCustomerbyID:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});



app.delete('/deleteEquipmentbyId/:id', async (req, res) => {
  const equipmentId = req.params.id;
  const result = await deleteEquipmentById(equipmentId);

  if (result.success) {
    res.status(result.statusCode).json({
      message: result.message,
      affectedRows: result.affectedRows,
    });
  } else {
    res.status(result.statusCode).json({
      message: result.message,
      error: result.error,
    });
  }
});

app.get("/getEquipmentbyName/:equipmentName", async (req, res) => {
  try {
    console.log("Server side getEquipmentbyName", req.params.equipmentName);
    const equipment = await getEquipmentbyName(req.params.equipmentName);
    return res.json(equipment);
  } catch (error) {
    console.error("Error in getCustomerbyID:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/getCustomerbyNIC/:nic", async (req, res) => {
  try {
    console.log("Server side getCustomerbyNIC", req.params.nic);
    const customers = await getCustomerbyNIC(req.params.nic);
    return res.json(customers);
  } catch (error) {
    console.error("Error in getCustomerbyNIC:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
app.post("/addEquipment", async (req, res) => {
  try {
    const customerDetails = await addEquipment(req.body);
    console.log("created equipment details:", req.body);
    return res.json({
      message: `equipment details updated for the equipment with id : ${req.body.id}`,
    });
  } catch (error) {
    console.error("Error in updateEquipmentDetails:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
app.post("/setEquipment", async (req, res) => {
  try {
    const customerDetails = await setEquipment(req.body);
    console.log("created equipment details:", req.body);
    return res.json({
      message: `equipment details updated for the equipment with id : ${req.body.id}`,
    });
  } catch (error) {
    console.error("Error in updateEquipmentDetails:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/createCustomer", async (req, res) => {
  try {
    const customerDetails = await setCustomer(req.body);
    console.log("created customer details:", req.body);
    return res.json({
      message: `Customer details updated for the customer with id : ${req.body.id}`,
    });
  } catch (error) {
    console.error("Error in updateCustomerDetails:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/getCustomerbyID/:id", async (req, res) => {
  try {
    console.log("Server side getCustomerbyID", req.params.id);
    const customers = await getCustomerbyID(req.params.id);
    return res.json(customers);
  } catch (error) {
    console.error("Error in getCustomerbyID:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/getCustomerbyFirstName/:SFirstName", async (req, res) => {
  try {
    console.log("Server side getCustomerbyFirstName", req.params.SFirstName);
    const customers = await getCustomerbyFirstName(req.params.SFirstName);
    return res.json(customers);
  } catch (error) {
    console.error("Error in getCustomerbyFirstName:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/getCustomerbyLastName/:SLastName", async (req, res) => {
  try {
    console.log("Server side getCustomerbyLastName", req.params.SLastName);
    const customers = await getCustomerbyLastName(req.params.SLastName);
    return res.json(customers);
  } catch (error) {
    console.error("Error in getCustomerbyLastName:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/getCustomerbyPhoneNumber/:trimmedPhoneNumber", async (req, res) => {
  try {
    console.log(
      "Server side getCustomerbyPhoneNumber",
      req.params.trimmedPhoneNumber
    );
    const customer = await getCustomerbyPhoneNumber(
      req.params.trimmedPhoneNumber
    );
    return res.json(customer);
  } catch (error) {
    console.error("Error in getCustomerbyPhoneNumber:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/getCustomerbyPhoneNumberOrNic/:phoneNumber", async (req, res) => {
  try {
    console.log("Server side getCustomerbyphoneNumber", req.params.phoneNumber);
    const customers = await getCustomerbyPhoneNumberOrNic(
      req.params.phoneNumber
    );
    return res.json(customers);
  } catch (error) {
    console.error("Error in getCustomerbyPhoneNumber:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/getCustomerbyAddress1/:SAddress1", async (req, res) => {
  try {
    console.log("Server side getCustomerbySAddress1", req.params.SAddress1);
    const customers = await getCustomerbyAddress1(req.params.SAddress1);
    return res.json(customers);
  } catch (error) {
    console.error("Error in getCustomerbySAddress1:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/getCustomerbyAddress2/:SAddress2", async (req, res) => {
  try {
    console.log("Server side getCustomerbyLastName", req.params.SAddress2);
    const customers = await getCustomerbyAddress2(req.params.SAddress2);
    return res.json(customers);
  } catch (error) {
    console.error("Error in getCustomerbyID:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/getUserRole/:userName", async (req, res) => {
  try {
    const userRole = await getUserRole(req.params.userName);
    console.log("express ", userRole);
    return res.json(userRole);
  } catch (error) {
    console.log("Error occured in express", error);
  }
});

app.delete("/deleteCustomers/:customerId", async (req, res) => {
  try {
    const customerData = await deleteCustomer(req.params.customerId);
    return res.json(customerData);
  } catch (error) {
    console.error("Error in deleteCustomers:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/deleteEquipment/:eq_id", async (req, res) => {
  try {
    console.log("This is the server ", req.params.eq_id);
    const equipmentData = await deleteEquipment(req.params.eq_id);
    return res.json(equipmentData);
  } catch (error) {
    console.error("Error in deleteEquipment:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/updateCustomerDetails", async (req, res) => {
  try {
    const customerDetails = await updateCustomerDetails(req.body);
    console.log("Updated customer details:", req.body);
    return res.json({
      message: `Customer details updated for the customer with id : ${req.body.id}`,
    });
  } catch (error) {
    console.error("Error in updateCustomerDetails:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/invoiceIdRetrieve", async (req, res) => {
  try {
    console.log("req");
    const invoiceId = await getInvoiceId();
    console.log("Express", invoiceId);
    return res.json(invoiceId);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/invoiceDataRetrieve/:invoiceIdSearch", async (req, res) => {
  try {
    const completeInvoiceDetails = await getInvoiceDetails(
      req.params.invoiceIdSearch
    );
    if (completeInvoiceDetails) {
      console.log("Express complete invoice object", completeInvoiceDetails);
      return res.json(completeInvoiceDetails);
    } else {
      console.error("No invoice details found");
      return res.status(404).json({ error: "Invoice not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/createInvoiceDetails", async (req, res) => {
  try {
    const customerDetails = await createInvoiceDetails(req.body);
    return res.json({
      message: `Customer details updated for the customer with id : ${req.body.id}`,
    });
  } catch (error) {
    console.error("Error in updateCustomerDetails:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/updateInvoiceDetails", async (req, res) => {
  try {
    const customerDetails = await updateInvoiceDetails(req.body);
    return res.json({
      message: `Customer details updated for the customer with id : ${req.body.id}`,
    });
  } catch (error) {
    console.error("Error in updateCustomerDetails:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/fetchUserDetails", async (req, res) => {
  try {
    const userDetails = await getUserDetails();
    return res.json(userDetails);
  } catch (error) {
    console.log("Error occured in express fetchUser details");
  }
});

app.post('/createUser', async (req, res) => {
  try {
    const userDetails = req.body;

    const response = await setUserDetails(userDetails);

    // Respond with success message or data if needed
    res.status(200).json(response);
  } catch (error) {
    console.error('Error occurred in createUser API:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});
app.delete("/deleteUserRole/:userId/:role", async (req, res) => {
  const { userId, role } = req.params;
  try {
    const result = await deleteUserRole(role, userId);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(error === "Role or user not found" ? 404 : 500).send(error);
  }
});
app.put("/updateUserRole/:userId/:role", async (req, res) => {
  try {
    const { userId, role } = req.params;
    const { password } = req.body;
    console.log("Express app parameters:", userId, role, password);

    const success = await updateUserRole(userId, role, password);
    console.log("success value", success);
    if (success) {
      console.log(success);
      res.status(200).send("User role updated successfully");
    } else {
      res.status(400).send("Failed to update user role");
    }
  } catch (error) {
    console.error("Error occurred in the Express app:", error);
    res.status(500).send("Internal server error");
  }
});

app.get(`/reports/getCustomerRatings`, async (req, res) => {
  try {
    const response = await reportsGetCustomerRatings();
    console.log(response);
    res.json({ status: true, message: "Value retrieved", response });
  } catch (error) {
    res.json({
      status: false,
      message: "failed to retrieve customer rating information",
    });
  }
});
app.get(`/reports/getCustomerRatings/:id`, async (req, res) => {
  try {
    const id=req.params.id;
    console.log("id is pritin",id)
    const response = await reportsGetCustomerRatingsPerCustomer(id);
    console.log(response);
    res.json({ status: true, message: "Value retrieved", response:response });
  } catch (error) {
    res.json({
      status: false,
      message: "failed to retrieve customer rating information",
    });
  }
});
app.get(`/reports/getCustomerInvoiceDetails`, async (req, res) => {
  try {
    const response = await reportsGetCustomerInvoiceDetails();
    res.json({ status: true, message: "Value retrieved", response });
  } catch (error) {
    res.json({
      status: false,
      message: "failed to retrieve customer rating information",
    });
  }
});
app.get("/reports/getEquipmentUtilizationDetails", async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    let response;

    // Parse start and end dates if they exist
    const parsedStartDate = startDate ? new Date(startDate) : new Date(0);
    const parsedEndDate = endDate ? new Date(endDate) : new Date();

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({
        status: false,
        message: "Invalid date format",
      });
    }

    // Call the report function with parsed dates
    response = await getEquipmentUtilizationReport(parsedStartDate.toISOString(), parsedEndDate.toISOString());

    console.log(response);
    res.json({ status: true, message: "Value retrieved", response });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to retrieve equipment utilization report",
      error: error.message,
    });
  }
});


app.get("/reports/getEquipmentRevenueDetails", async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    let response;

    // If both start date and end date are provided
    if (startDate && endDate) {
      response = await getEquipmentRevenueReport(startDate, endDate);
    }
    // If only start date is provided
    else if (startDate && !endDate) {
      response = await getEquipmentRevenueReport(startDate, new Date().toISOString());
    }
    // If only end date is provided
    else if (!startDate && endDate) {
      response = await getEquipmentRevenueReport(new Date(0).toISOString(), endDate);
    }
    // If both start date and end date are missing
    else {
      response = await getEquipmentRevenueReport(null, null); // Retrieve all data
    }

    console.log(response);
    res.json({ status: true, message: "Value retrieved", response });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to retrieve equipment revenue report",
      error: error.message,
    });
  }
});

app.get("/reports/getUnderutilizedEquipment", async (req, res) => {
  console.log("calling");
  const { startDate, endDate } = req.query;

  try {
    let response;

    // Parse start and end dates if they exist
    const parsedStartDate = startDate ? new Date(startDate) : new Date(0);
    const parsedEndDate = endDate ? new Date(endDate) : new Date();

    // Call the report function with parsed dates
    if (parsedStartDate && parsedEndDate) {
      response = await getUnderutilizedEquipment(parsedStartDate, parsedEndDate);
    } else {
      response = await getUnderutilizedEquipment(); // If start date or end date is missing, retrieve all data
    }

    console.log(response);
    res.json({ status: true, message: "Value retrieved", response });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to retrieve underutilized equipment report",
      error: error.message,
    });
  }
});


app.get("/reports/getEquipmentRentalDetails", async (req, res) => {
  console.log("calling");
  const { startDate, endDate } = req.query;

  try {
    let response;

    // Parse start and end dates if they exist or else pass current date and begining date
    const parsedStartDate = startDate ? new Date(startDate) : new Date(0);
    const parsedEndDate = endDate ? new Date(endDate) : new Date();

    // Call the report function with parsed dates
    if (parsedStartDate && parsedEndDate) {
      response = await getEquipmentRentalDetails(parsedStartDate, parsedEndDate);
    } else {
      response = await getEquipmentRentalDetails(); // If start date or end date is missing, retrieve all data
    }

    console.log(response);
    res.json({ status: true, message: "Value retrieved", response });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to retrieve equipment rental details report",
      error: error.message,
    });
  }
});


app.get("/reports/getIncompleteRentals", async (req, res) => {
  console.log("calling");

  try {
    const response = await getIncompleteRentals();
    console.log(response);
    res.json({ status: true, message: "Value retrieved", response });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to retrieve incomplete rentals report",
      error: error.message,
    });
  }
});

app.get('/reports/getDeletedInvoices', async (req, res) => {
  let { start_date, end_date } = req.query;

  // If start_date is not provided, set it to the Unix epoch (1970-01-01)
  if (!start_date) {
    start_date = new Date(0).toISOString().split('T')[0];
  }

  // If end_date is not provided, set it to today's date
  if (!end_date) {
    end_date = new Date().toISOString().split('T')[0];
  }

  try {
    const data = await getDeletedInvoices(start_date, end_date);
    res.json({ status: true, response: data });
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to retrieve deleted invoices" });
  }
});

app.get('/reports/getCombinedInvoiceReports', async (req, res) => {
  let { start_date, end_date } = req.query;

  // If start_date is not provided, set it to the Unix epoch (1970-01-01)
  if (!start_date) {
    start_date = new Date(0).toISOString().split('T')[0];
  }

  // If end_date is not provided, set it to today's date
  if (!end_date) {
    end_date = new Date().toISOString().split('T')[0];
  }

  try {
    const data = await getCombinedInvoiceReports(start_date, end_date);
    console.log(data)
    res.json({ status: true, response: data });
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to retrieve combined invoice reports" });
  }
});
dotenv.config();
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
