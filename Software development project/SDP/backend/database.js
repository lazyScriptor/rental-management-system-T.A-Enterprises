import mysql from "mysql2";
import dotenv from "dotenv";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import bcrypt, { hash } from "bcrypt";

dotenv.config();
dayjs.extend(utc);
dayjs.extend(timezone);
const saltRound = 10;

// insted of createconnection, Overall, using createPool simplifies connection
// management by handling the opening, closing, and reuse of connections automatically,
// which can improve the efficiency and scalability of your application.

const pool = mysql
  .createPool({
    host: process.env.HOST,
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
  })
  .promise();
const port = process.env.PORT || 8085;

export async function loginValidate(userObject) {
  const [user] = await pool.query(
    `SELECT users.* ,userRole.ur_role,userRoleMap.urm_password FROM users JOIN userRoleMap ON users.user_id=userRoleMap.urm_userid JOIN userRole ON userRoleMap.urm_roleid=userRole.ur_roleid WHERE username=? AND ur_role= ?`,
    [userObject.username, userObject.role]
  );
  const id = user[0].user_id;

  const success = await bcrypt.compare(
    userObject.password,
    user[0].urm_password
  );

  if (success) {
    return ["/DashboardMain", user];
  } else {
    return ["/"];
  }
}
export async function getUsers() {
  const [users] = await pool.query("SELECT * FROM users");
  console.log(users);
  return users;
}
export async function getCustomers() {
  const [customers] = await pool.query(
    "SELECT * FROM customer WHERE cus_delete_status = 0"
  );
  return customers;
}
export async function getCustomerBySearchingManyFields(value) {
  try {
    if (value < 1000) {
      const [customer] = await pool.query(
        `SELECT * FROM customer WHERE cus_id LIKE ? AND cus_delete_status = 0`,
        [`%${value}%`]
      );
      return customer;
    } else {
      const query = `
        SELECT * 
        FROM customer 
        WHERE cus_delete_status = 0 AND (
          nic LIKE ? 
          OR cus_phone_number LIKE ? 
          OR cus_fname LIKE ? 
          OR cus_lname LIKE ? 
          OR cus_address1 LIKE ? 
          OR cus_address2 LIKE ?
        )
      `;

      // Add wildcard characters around the value
      const formattedValue = `%${value}%`;

      // Execute the query with the formatted value for each field
      const [customer] = await pool.query(query, [
        formattedValue,
        formattedValue,
        formattedValue,
        formattedValue,
        formattedValue,
        formattedValue,
      ]);

      return customer;
    }
  } catch (error) {
    throw error;
  }
}
export async function getEquipment() {
  const [equipment] = await pool.query(
    "SELECT equipment.*, equipmentCategory.eqcat_name FROM equipment JOIN equipmentCategory ON equipment.eq_catid = equipmentCategory.eqcat_id WHERE equipment.eq_delete_status=0"
  );

  return equipment;
}
export async function getEquipmentbyID(id) {
  const [equipment] = await pool.query(
    "SELECT * FROM equipment WHERE eq_id =? AND eq_delete_status = 0",
    [id]
  );
  console.log(equipment);
  return equipment;
}
export async function getEquipmentbyName(name) {
  const [equipment] = await pool.query(
    "SELECT * FROM equipment WHERE eq_name LIKE ? AND eq_delete_status = 0",
    [`%${name}%`]
  );
  console.log(equipment);
  return equipment;
}
export async function deleteEquipmentById(id) {
  try {
    const [result] = await pool.query(
      "UPDATE equipment SET eq_delete_status = 1 WHERE eq_id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      return {
        success: false,
        statusCode: 404,
        message: "Equipment not found",
      };
    }
    return {
      success: true,
      statusCode: 200,
      message: "Equipment deleted successfully",
      affectedRows: result.affectedRows,
    };
  } catch (error) {
    console.error("Back end error occurred in delete equipment:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Error deleting equipment",
      error: error,
    };
  }
}
export async function addEquipment(bodydata) {
  const {
    eq_name,
    eq_rental,
    eq_completestock,
    eq_cost,
    eq_defected_status,
    eq_description,
    eq_dofpurchase,
    eq_warranty_expire,
    eq_catid,
  } = bodydata;

  const dateFormat = (value) => {
    const dateOnly = value?.substring(0, 10);
    return dateOnly;
  };
  const neweq_dofpurchase = dateFormat(eq_dofpurchase);
  const neweq_warranty_expire = dateFormat(eq_warranty_expire);

  console.log("Formated string", eq_dofpurchase);
  try {
    await pool.query(
      "INSERT INTO equipment (eq_name, eq_rental, eq_description, eq_dofpurchase, eq_warranty_expire, eq_cost, eq_completestock, eq_catid) VALUES (?,?,?,?,?,?,?,?)",
      [
        eq_name,
        eq_rental,
        eq_description,
        neweq_dofpurchase,
        neweq_warranty_expire,
        eq_cost,
        eq_completestock,
        eq_catid,
      ]
    );
    console.log(`Created equipment `);
    return { message: `Created equipment` };
  } catch (error) {
    console.error("Error creating customer db connection:", error);
    throw error;
  }
}
export async function setEquipment(bodydata) {
  console.log("This is the body data ", bodydata);
  const {
    eq_name,
    eq_rental,
    eq_completestock,
    eq_cost,
    eq_defected_status,
    eq_description,
    eq_dofpurchase,
    eq_warranty_expire,
    eq_catid,
    eq_id,
  } = bodydata;

  const dateFormat = (value) => {
    const dateOnly = value?.substring(0, 10);
    return dateOnly;
  };
  const neweq_dofpurchase = dateFormat(eq_dofpurchase);
  const neweq_warranty_expire = dateFormat(eq_warranty_expire);

  console.log("Formatted string", eq_dofpurchase);
  try {
    await pool.query(
      "UPDATE equipment SET eq_name = ?, eq_rental = ?, eq_description = ?, eq_dofpurchase = ?, eq_warranty_expire = ?, eq_cost = ?, eq_defected_status = ?, eq_completestock = ?, eq_catid = ? WHERE eq_id = ?",
      [
        eq_name,
        eq_rental,
        eq_description,
        neweq_dofpurchase,
        neweq_warranty_expire,
        eq_cost,
        eq_defected_status,
        eq_completestock,
        eq_catid,
        eq_id,
      ]
    );
    console.log(`Updated equipment with ID ${eq_id}`);
    return { message: `Updated equipment with ID ${eq_id}` };
  } catch (error) {
    console.error("Error updating equipment:", error);
    throw error;
  }
}
export async function getCustomerbyNIC(nic) {
  const [customers] = await pool.query(
    "SELECT * FROM customer WHERE nic =? AND cus_delete_status = 0",
    [nic]
  );
  console.log(customers);
  return customers;
}
export async function getCustomerbyID(id) {
  const [customers] = await pool.query(
    "SELECT * FROM customer WHERE cus_id =? AND cus_delete_status = 0",
    [id]
  );
  console.log(customers);
  return customers;
}
export async function getCustomerbyPhoneNumber(trimmedPhoneNumber) {
  const [customers] = await pool.query(
    "SELECT * FROM customer WHERE cus_phone_number =? AND cus_delete_status = 0",
    [trimmedPhoneNumber]
  );
  console.log(customers);
  return customers;
}
export async function getCustomerbyFirstName(FirstName) {
  console.log("Backend first name ", FirstName);
  const [customers] = await pool.query(
    "SELECT * FROM customer WHERE cus_fname LIKE ? AND cus_delete_status = 0",
    [`%${FirstName}%`]
  );
  console.log("backend", customers);
  return customers;
}
export async function getCustomerbyLastName(LastName) {
  const [customers] = await pool.query(
    "SELECT * FROM customer WHERE cus_lname LIKE ? AND cus_delete_status = 0",
    [`%${LastName}%`]
  );
  console.log(customers);
  return customers;
}
export async function getCustomerbyPhoneNumberOrNic(searchValue) {
  if (searchValue < 10000) {
    const [customers] = await pool.query(
      `SELECT * FROM customer WHERE cus_id = ? AND cus_delete_status = 0`,
      [searchValue]
    );
    if (customers.length > 0) {
      console.log(customers);
      return customers;
    } else {
      return { message: `No customer found with ${searchValue}` };
    }
  } else {
    const [customers] = await pool.query(
      "SELECT * FROM customer WHERE (cus_phone_number LIKE ? OR nic LIKE ?) AND cus_delete_status = 0",
      [`%${searchValue}%`, `%${searchValue}%`]
    );
    if (customers.length > 0) {
      console.log(customers);
      return customers;
    } else {
      return { message: `No customer found with ${searchValue}` };
    }
  }
}
export async function getCustomerbyAddress1(SAddress1) {
  const [customers] = await pool.query(
    "SELECT * FROM customer WHERE cus_address1 LIKE ? AND cus_delete_status = 0",
    [`%${SAddress1}%`]
  );
  console.log(customers);
  return customers;
}
export async function getCustomerbyAddress2(SAddress2) {
  const [customers] = await pool.query(
    "SELECT * FROM customer WHERE cus_address2 LIKE ? AND cus_delete_status = 0",
    [`%${SAddress2}%`]
  );
  console.log(customers);
  return customers;
}
export async function getUserRole(userName) {
  const [user] = await pool.query(
    `SELECT userRole.ur_role FROM users JOIN userRoleMap ON users.user_id=userRoleMap.urm_userid JOIN userRole ON userRoleMap.urm_roleid=userRole.ur_roleid WHERE username=?`,
    [userName]
  );
  console.log(user);
  return user;
}
export async function deleteCustomer(id) {
  try {
    // await pool.query("DELETE FROM customer WHERE cus_id = ?", [id]);
    await pool.query(
      `UPDATE customer SET cus_delete_status = 1 WHERE cus_id = ?`,
      [id]
    );
    console.log(`Deleted customer with ID ${id}`);
    return { message: `Deleted customer with ID ${id}` };
  } catch (error) {
    console.error("Error deleting customer db connection:", error);
    throw error;
  }
}
export async function setCustomer(bodydata) {
  const { nic, phoneNumber, fname, lname, address1, address2 } = bodydata;
  try {
    await pool.query(
      "INSERT INTO customer ( cus_fname, cus_lname, nic, cus_phone_number, cus_address1, cus_address2) VALUES(?,?,?,?,?,?)",
      [fname, lname, nic, phoneNumber, address1, address2]
    );
    console.log(`Created customer `);
    return { message: `Created customer` };
  } catch (error) {
    console.error("Error creating customer db connection:", error);
    throw error;
  }
}
export async function deleteEquipment(id) {
  try {
    // await pool.query("DELETE FROM equipment WHERE eq_id = ?", [id]);
    await pool.query(
      `UPDATE equipment SET eq_delete_status = 1 WHERE eq_id = ?`,
      [id]
    );

    console.log(`Deleted equipment with ID ${id}`);
    return { message: `Deleted equipment with ID ${id}` };
  } catch (error) {
    console.error("Error deleting equipment db connection:", error);
    throw error;
  }
}
export async function updateCustomerDetails(bodydata) {
  const { id, nic, phoneNumber, fname, lname, address1, address2 } = bodydata;
  try {
    await pool.query(
      "UPDATE customer SET nic = ?, cus_phone_number = ?, cus_fname = ?, cus_lname = ?, cus_address1 = ?, cus_address2 = ? WHERE cus_id = ?",
      [nic, phoneNumber, fname, lname, address1, address2, id]
    );
  } catch (error) {
    console.error("Error in the updateCustomerDetails db connection", error);
  }
}
export async function getInvoiceId() {
  try {
    const [invoiceId] = await pool.query(
      "SELECT Min(inv_id) AS largest_invoice_number FROM invoice WHERE inv_updatedstatus = 0"
    );
    if (invoiceId[0].largest_invoice_number == null) {
      await pool.query(
        "INSERT INTO invoice (inv_advance,inv_special_message,inv_idcardstatus) VALUES (?,?,?)",
        [0, "", 0],
        (error, results, fields) => {
          if (error) {
            console.error("Error creating new statement:", error);
            return;
          }
          console.log("New statement created successfully!");
        }
      );
    }
    const [newInvoiceId] = await pool.query(
      "SELECT Min(inv_id) AS largest_invoice_number FROM invoice WHERE inv_updatedstatus = 0"
    );
    return newInvoiceId[0].largest_invoice_number;
  } catch (error) {
    console.error("Error in the updateCustomerDetails db connection", error);
  }
}
export async function createInvoiceDetails(InvoiceCompleteDetail) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  // Update invoice details
  try {
    await pool.query(
      "UPDATE invoice SET inv_advance = ?, inv_special_message = ?, inv_idcardstatus = ?,inv_cusid=?,inv_createddate=?, inv_updatedstatus = ? WHERE inv_id = ?",
      [
        InvoiceCompleteDetail.advance,
        "", // Empty string for inv_special_message
        InvoiceCompleteDetail.iDstatus,
        InvoiceCompleteDetail.customerDetails.cus_id, // Assuming idStatus is a boolean value
        formattedDate, // Format the date correctly for MySQL
        1,
        InvoiceCompleteDetail.InvoiceID,
      ]
    );
  } catch (error) {
    console.log("Error occurred in backend invoice details update", error);
  }

  // Update customer invoice details
  // try {
  //   await pool.query(
  //     "INSERT INTO customerInvoice (cusinv_cusid, cusinv_invid) VALUES (?, ?)",
  //     [
  //       InvoiceCompleteDetail.customerDetails.cus_id,
  //       InvoiceCompleteDetail.InvoiceID,
  //     ]
  //   );
  // } catch (error) {
  //   // Handle duplicate entry error
  //   if (error.code === "ER_DUP_ENTRY") {
  //     console.log(
  //       "Duplicate entry detected. Attempting to update existing record..."
  //     );
  //     try {
  //       await pool.query(
  //         "UPDATE customerInvoice SET cusinv_cusid = ?, cusinv_invid = ? WHERE cusinv_cusid = ? AND cusinv_invid = ?",
  //         [
  //           InvoiceCompleteDetail.customerDetails.cus_id,
  //           InvoiceCompleteDetail.InvoiceID,
  //           InvoiceCompleteDetail.customerDetails.cus_id,
  //           InvoiceCompleteDetail.InvoiceID,
  //         ]
  //       );
  //     } catch (updateError) {
  //       console.log("Error occurred in updating existing record:", updateError);
  //     }
  //   } else {
  //     console.log("Error occurred in backend invoice details update:", error);
  //   }
  // }

  //Update invoice payment table

  try {
    for (const payment of InvoiceCompleteDetail.payments) {
      console.log("This is the payID", payment.payId);
      await pool.query(
        "INSERT INTO invoicePayments (invpay_payment_id, invpay_inv_id ,	invpay_amount, invpay_payment_date) VALUES (?, ?,?, ?)",
        [
          payment.invpay_payment_id,
          InvoiceCompleteDetail.InvoiceID,
          payment.invpay_amount,
          payment.invpay_payment_date,
        ]
      );
    }
  } catch (error) {
    // Handle duplicate entry error
    if (error.code === "ER_DUP_ENTRY") {
      console.log(
        "Duplicate entry detected. Attempting to update existing record..."
      );
      try {
        for (const payment of InvoiceCompleteDetail.payments) {
          console.log("This is the payID", payment.payId);
          await pool.query(
            "INSERT INTO invoicePayments (invpay_payment_id, invpay_inv_id, invpay_amount, invpay_payment_date) VALUES (?, ?, ?, ?)",
            [
              payment.invpay_payment_id,
              InvoiceCompleteDetail.InvoiceID,
              payment.invpay_amount,
              payment.invpay_payment_date,
            ]
          );
        }
      } catch (updateError) {
        console.log("Error occurred in updating existing record:", updateError);
      }
    } else {
      console.log("Error occurred in backend invoice details update:", error);
    }
  }

  // Update invoice equipment details
  try {
    for (const equipment of InvoiceCompleteDetail.eqdetails) {
      await pool.query(
        "INSERT INTO invoiceEquipment (inveq_eqid, inveq_invid,inveq_borrowqty,inveq_borrow_date) VALUES (?, ?,?,?)",
        [
          equipment.eq_id,
          InvoiceCompleteDetail.InvoiceID,
          equipment.inveq_borrowqty,
          equipment.inveq_borrow_date,
        ]
      );
    }
  } catch (error) {
    // Handle duplicate entry error
    if (error.code === "ER_DUP_ENTRY") {
      console.log(
        "Duplicate entry detected. Attempting to update existing record..."
      );
      try {
        console.log(InvoiceCompleteDetail.eqdetails);
        for (const equipment of InvoiceCompleteDetail.eqdetails) {
          await pool.query(
            `UPDATE invoiceEquipment SET inveq_eqid = 24, inveq_invid = 4, inveq_borrowqty = NULL, inveq_borrow_date = 24 WHERE inveq_eqid = 4 AND inveq_invid = NULL AND inveq_borrowqty = ?`,
            [
              equipment.eq_id,
              InvoiceCompleteDetail.InvoiceID,
              equipment.Qty,
              equipment.eq_id,
              InvoiceCompleteDetail.InvoiceID,
              equipment.Qty,
            ]
          );
        }
      } catch (updateError) {
        console.log("Error occurred in updating existing record:", updateError);
      }
    } else {
      console.log("Error occurred in backend invoice details update:", error);
    }
  }
}
export async function getInvoiceDetails(invoiceIdSearch) {
  try {
    // Fetch customer, invoice, equipment, and additional invoice details
    const [invoiceDetails] = await pool.query(
      `SELECT customer.*, invoiceEquipment.*, equipment.*, invoice.inv_advance, invoice.inv_special_message, invoice.inv_idcardstatus,invoice.inv_discount, invoice.inv_createddate ,invoice.inv_completed_datetime ,equipmentCategory.* ,specialEquipment.*
       FROM invoice
       LEFT JOIN customer ON customer.cus_id = invoice.inv_cusid
       LEFT JOIN invoiceEquipment ON invoice.inv_id = invoiceEquipment.inveq_invid
       LEFT JOIN equipment ON invoiceEquipment.inveq_eqid = equipment.eq_id
       LEFT JOIN equipmentCategory ON equipment.eq_catid=equipmentCategory.eqcat_id
       LEFT JOIN specialEquipment ON equipment.eq_id = specialEquipment.spe_eqid
       WHERE invoice.inv_id = ?`,
      [invoiceIdSearch]
    );

    if (invoiceDetails.length > 0) {
      const invoiceObject = {
        customerDetails: {},
        createdDate: null,
        eqdetails: [],
        payments: [],
        advance: null,
        discount: null,
        invoiceSpecialmessage: null,
        idStatus: null,
      };

      function dateformatterr(dateString) {
        const dateObject = new Date(dateString);

        // Get year, month (0-indexed), day, hour, minutes, seconds, and milliseconds
        const year = dateObject.getFullYear();
        const month = dateObject.getMonth();
        const day = dateObject.getDate();
        const hour = dateObject.getHours();
        const minutes = dateObject.getMinutes();
        const seconds = dateObject.getSeconds();
        const milliseconds = dateObject.getMilliseconds();

        // Format the date and time with timezone information
        const formattedDateTime = `${year}-${month + 1}-${day
          .toString()
          .padStart(2, "0")}T${hour.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`;

        return formattedDateTime;
      }
      function getTimeFromISODateString(isoDateString) {
        const date = new Date(isoDateString);
        const hours = `0${date.getUTCHours()}`.slice(-2);
        const minutes = `0${date.getUTCMinutes()}`.slice(-2);
        const seconds = `0${date.getUTCSeconds()}`.slice(-2);
        return `${hours}:${minutes}:${seconds}`;
      }

      console.log(
        "This is the incoive Object",
        getTimeFromISODateString(invoiceDetails[0].inv_createddate)
      );
      const customerDetails = Object.keys(invoiceDetails[0])
        .filter((key) => key.startsWith("cus_") || key === "nic")
        .reduce((obj, key) => {
          obj[key] = invoiceDetails[0][key];
          return obj;
        }, {});

      invoiceObject.customerDetails = customerDetails;

      function dateformatter(date) {
        const createdDate = new Date(date);
        return createdDate;
      }

      invoiceObject.createdDate = dateformatter(
        invoiceDetails[0].inv_createddate
      );

      invoiceObject.InvoiceID = invoiceIdSearch;

      // Extracting equipment details
      const equipmentDetails = invoiceDetails.map((record) => ({
        eq_id: record.eq_id,
        eq_name: record.eq_name,
        eq_rental: record.eq_rental,
        eq_description: record.eq_description,
        eq_dofpurchase: record.eq_dofpurchase,
        eq_warranty_expire: record.eq_warranty_expire,
        eq_image: record.eq_image,
        eq_cost: record.eq_cost,
        eq_defected_status: record.eq_defected_status,
        eq_completestock: record.eq_completestock,
        eq_delete_status: record.eq_delete_status,
        eq_catid: record.eq_catid,
        eqcat_dataset: record.eqcat_dateset,
        eqcat_id: record.eqcat_id,
        eqcat_name: record.eqcat_name,
        spe_singleday_rent: record.spe_singleday_rent,
        inveq_borrow_date: record.inveq_borrow_date,
        inveq_return_date: record.inveq_return_date,
        duration_in_days: record.duration_in_days,
        inveq_borrowqty: record.inveq_borrowqty,
        inveq_return_quantity: record.inveq_returned_quantity,
        inveq_updated_status: record.inveq_updated_status,
      }));
      invoiceObject.eqdetails = equipmentDetails;

      // Fetch payment details
      const [invoicePayments] = await pool.query(
        `SELECT invpay_payment_id, invpay_payment_date, invpay_amount 
         FROM invoicePayments 
         WHERE invpay_inv_id = ?`,
        [invoiceIdSearch]
      );

      // Extracting payment details
      const paymentDetails = invoicePayments.map((payment) => ({
        invpay_payment_id: payment.invpay_payment_id,
        invpay_payment_date: payment.invpay_payment_date,
        invpay_amount: payment.invpay_amount,
      }));

      invoiceObject.payments = paymentDetails;

      // Adding additional invoice details
      invoiceObject.advance = invoiceDetails[0].inv_advance;
      invoiceObject.invoiceSpecialmessage =
        invoiceDetails[0].inv_special_message;
      invoiceObject.idStatus = !!invoiceDetails[0].inv_idcardstatus;
      invoiceObject.inv_completed_datetime =
        invoiceDetails[0].inv_completed_datetime;
      invoiceObject.discount = invoiceDetails[0].inv_discount;
      return invoiceObject;
    } else {
      console.error("No invoice details found");
      return false;
    }
  } catch (error) {
    console.error("Error fetching invoice details:", error);
    return false;
  }
}

export async function updateInvoiceDetails(InvoiceCompleteDetail) {
  let createdDate;
  if (InvoiceCompleteDetail.invoiceCompletedDate) {
     createdDate = dayjs(InvoiceCompleteDetail.invoiceCompletedDate)
      .tz("Asia/Colombo")
      .format("YYYY-MM-DD HH:mm:ss");
    // Update invoice details
  }else{
    createdDate = null;
  }
  try {
    await pool.query(
      "UPDATE invoice SET inv_special_message = ?,inv_rating = ?,inv_completed_datetime=? WHERE inv_id = ?",
      [
        InvoiceCompleteDetail.inv_special_message,
        InvoiceCompleteDetail.inv_rating,
        createdDate,
        InvoiceCompleteDetail.InvoiceID,
      ]
    );
  } catch (error) {
    console.log("Error occurred in backend invoice details update1", error);
  }

  // Update invoice payment table
  try {
    for (const payment of InvoiceCompleteDetail.payments) {
      // Format the date
      const formattedDate = dayjs(payment.invpay_payment_date)
        .tz("Asia/Colombo")
        .format("YYYY-MM-DD HH:mm:ss");
      console.log(formattedDate);

      // Use the formatted date in the query
      await pool.query(
        `INSERT INTO invoicePayments (invpay_payment_id, invpay_inv_id, invpay_amount, invpay_payment_date)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         invpay_inv_id = VALUES(invpay_inv_id), invpay_amount = VALUES(invpay_amount), invpay_payment_date = VALUES(invpay_payment_date)`,
        [
          payment.invpay_payment_id,
          InvoiceCompleteDetail.InvoiceID,
          payment.invpay_amount,
          formattedDate, // Use the formatted date here
        ]
      );
    }
  } catch (error) {
    console.log("Error occurred in backend invoice details update2:", error);
  }

  // Update invoice equipment details

  try {
    console.log("complete retrieved object", InvoiceCompleteDetail);
    // Function to format the date for SQL
    function formatDateForSQL(date) {
      if (!date) return null;
      const d = new Date(date);
      const pad = (n) => (n < 10 ? "0" + n : n);
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
        d.getDate()
      )} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }

    for (const equipment of InvoiceCompleteDetail.eqdetails) {
      if (
        equipment.inveq_return_quantity < equipment.inveq_borrowqty &&
        equipment.inveq_return_quantity != 0
      ) {
        // If returned quantity is less than borrowed quantity
        console.log("object");
        // Variables for updated quantities and dates
        const returnedQuantity = equipment.inveq_return_quantity;
        const previousBorrowQuantity = equipment.inveq_borrowqty;
        const newBorrowQuantity = previousBorrowQuantity - returnedQuantity;

        console.log(
          "return qty",
          returnedQuantity,
          "newborrowed",
          returnedQuantity,
          "prevborrowqty",
          previousBorrowQuantity,
          "newborrowqty",
          newBorrowQuantity
        );

        const formattedReturnDate = formatDateForSQL(
          equipment.inveq_return_date
        );
        const formattedBorrowDate = formatDateForSQL(
          equipment.inveq_borrow_date
        );

        await pool.query(
          `INSERT INTO invoiceEquipment (inveq_eqid, inveq_invid, inveq_borrowqty, inveq_borrow_date,inveq_return_date,inveq_returned_quantity,inveq_updated_status)
             VALUES (?, ?, ?, ?,?,?,?)`,
          [
            equipment.eq_id,
            InvoiceCompleteDetail.InvoiceID,
            returnedQuantity,
            formattedBorrowDate, // Updated borrow date
            formattedReturnDate,
            returnedQuantity,
            1,
          ]
        );

        // Update the existing row
        await pool.query(
          `UPDATE invoiceEquipment
             SET
               inveq_returned_quantity = ?,
               inveq_borrowqty = ?
             WHERE
               inveq_invid = ?
               AND inveq_eqid = ?
               AND inveq_returned_quantity = 0`,
          [
            0, // Update returned quantity
            newBorrowQuantity, // Update borrowed quantity to the returned quantity
            // formattedReturnDate, // Update return date
            InvoiceCompleteDetail.InvoiceID,
            equipment.eq_id,
          ]
        );

        // Insert a new row with the remaining borrowed quantity
      } else if (
        equipment.inveq_return_quantity == equipment.inveq_borrowqty &&
        equipment.inveq_updated_status == 0
      ) {
        console.log("it equals");
        // If returned quantity is equal to borrowed quantity

        const formattedReturnDate = formatDateForSQL(
          equipment.inveq_return_date
        );

        // Update the existing row
        await pool.query(
          `UPDATE invoiceEquipment 
            SET 
              inveq_returned_quantity = ?, 
              inveq_borrowqty = ?, 
              inveq_return_date = ? ,
              inveq_updated_status = ?
            WHERE 
              inveq_invid = ? 
              AND inveq_eqid = ?
              AND inveq_returned_quantity = 0
              AND inveq_updated_status=0`,
          [
            equipment.inveq_return_quantity,
            equipment.inveq_borrowqty,
            formattedReturnDate,
            1,
            InvoiceCompleteDetail.InvoiceID,
            equipment.eq_id,
          ]
        );
      }
    }
  } catch (error) {
    console.log("Error occurred in backend invoice details update:", error);
  }
}
export async function getUserDetails() {
  try {
    const [userDetails] = await pool.query(`SELECT users.* FROM users`);

    for (const user of userDetails) {
      const [addRoleDetails] = await pool.query(
        `SELECT urm_roleid FROM userRoleMap WHERE urm_userid = ?`,
        [user.user_id]
      );

      // Add roles to the user object
      user.user_roles = addRoleDetails.map((role) => role.urm_roleid);
    }
    console.log(userDetails, "object");
    return userDetails;
  } catch (error) {
    console.error("Error in getUserDetails:", error);
    throw error;
  }
}
export async function setUserDetails(object) {
  const {
    firstname,
    lastname,
    username,
    password,
    nic,
    phonenumber,
    address1,
    address2,
    userRole,
  } = object;

  try {
    const [response] = await pool.query(
      `
      INSERT INTO users (user_first_name, user_last_name, username, nic, user_phone_number, user_address1, user_address2)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [firstname, lastname, username, nic, phonenumber, address1, address2]
    );

    const userId = response.insertId;

    for (const role of userRole) {
      await pool.query(
        `
        INSERT INTO userRoleMap (urm_userid, urm_roleid, urm_password)
        VALUES (?, ?, ?)
        `,
        [userId, role, password]
      );
    }

    return { success: true, userId };
  } catch (error) {
    console.error("Error occurred in setUserDetails:", error);
    throw error; // Rethrow the error to be caught by the caller
  }
}
export async function deleteUserRole(userId, role) {
  console.log("object,", role, userId);
  return new Promise((resolve, reject) => {
    pool.query(
      "DELETE FROM userRoleMap WHERE urm_roleid = ? AND urm_userid = ?",
      [role, userId],
      (error, results) => {
        if (error) {
          console.error("Error deleting user role:", error);
          reject("Server error");
        } else if (results.affectedRows === 0) {
          reject("Role or user not found");
        } else {
          resolve(`Role ${role} for user ${userId} deleted successfully`);
        }
      }
    );
  });
}
export async function updateUserRole(userId, role, password) {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRound);
    console.log("object", userId, role, hashedPassword);
    const [result] = await pool.query(
      `INSERT INTO userRoleMap (urm_userid, urm_roleid, urm_password) VALUES (?,?,?)`,
      [userId, role, hashedPassword]
    );
    console.log("Result from updateUserRole query:", result.affectedRows);
    return result.affectedRows > 0; // Return true if the update was successful
  } catch (error) {
    console.log("Error occurred in the backend:", error);
    throw error; // Throw the error to be caught in the calling function
  }
}
export async function reportsGetCustomerRatings() {
  try {
    const [response] = await pool.query(`SELECT 
  customer.cus_fname,cus_lname,cus_phone_number,cus_delete_status,
  AVG(invoice.inv_rating) AS average_rating,
  COUNT(invoice.inv_id) AS number_of_invoices,
  SUM(equipment.eq_rental * invoiceEquipment.duration_in_days) AS total_sales
FROM 
  customer
JOIN 
  invoice ON invoice.inv_cusid = customer.cus_id
JOIN 
  invoiceEquipment ON invoiceEquipment.inveq_invid = invoice.inv_id
JOIN 
  equipment ON equipment.eq_id = invoiceEquipment.inveq_eqid
WHERE 
 invoiceEquipment.duration_in_days IS NOT NULL
GROUP BY 
  customer.cus_id;
`);
    return response;
  } catch (error) {
    console.log("This is the backend reports customerRatings", error);
  }
}
export async function reportsGetCustomerInvoiceDetails() {
  try {
    const [response] = await pool.query(`
    SELECT 
    invoice.inv_id,
    customer.cus_fname,
    customer.cus_lname,
    customer.cus_phone_number,
    invoice.inv_rating,
    invoice.inv_special_message,
    invoice.inv_createddate,
    SUM(equipment.eq_rental * IFNULL(invoiceEquipment.duration_in_days, 0) * equipment.eq_rental)  AS total_sales,
    IF(invoiceEquipment.duration_in_days IS NULL, 1, 0) AS not_completed
FROM 
    customer
JOIN 
    invoice ON invoice.inv_cusid = customer.cus_id
JOIN 
    invoiceEquipment ON invoiceEquipment.inveq_invid = invoice.inv_id
JOIN 
    equipment ON equipment.eq_id = invoiceEquipment.inveq_eqid
GROUP BY 
    invoice.inv_id, 
    customer.cus_fname, 
    customer.cus_lname, 
    customer.cus_phone_number, 
    invoice.inv_rating, 
    invoice.inv_special_message, 
    invoice.inv_createddate


`);
    return response;
  } catch (error) {
    console.log("This is the backend reports customerRatings", error);
  }
}
export async function getEquipmentUtilizationReport(startDate, endDate) {
  try {
    const [rows] = await pool.query(
      `SELECT 
        equipment.eq_id,
        equipment.eq_name,
        COUNT(invoiceEquipment.inveq_eqid) AS total_rentals,
        SUM(invoiceEquipment.duration_in_days) AS total_rental_days,
        AVG(invoiceEquipment.duration_in_days) AS average_rental_duration
      FROM 
        equipment
      JOIN 
        invoiceEquipment ON equipment.eq_id = invoiceEquipment.inveq_eqid
      JOIN 
        invoice ON invoice.inv_id = invoiceEquipment.inveq_invid
      WHERE 
        invoice.inv_createddate BETWEEN ? AND ?
      GROUP BY 
        equipment.eq_id, equipment.eq_name
      ORDER BY 
        total_rentals DESC`,
      [startDate, endDate]
    );
    return rows;
  } catch (error) {
    console.log("Error fetching equipment utilization report:", error);
    throw error;
  }
}
export async function getEquipmentRevenueReport(startDate, endDate) {
  try {
    const [rows] = await pool.query(
      `SELECT 
      equipment.eq_id,
      equipment.eq_name,
      SUM(equipment.eq_rental * invoiceEquipment.duration_in_days * invoiceEquipment.inveq_borrowqty) AS total_revenue
      FROM 
      equipment
     JOIN 
      invoiceEquipment ON equipment.eq_id = invoiceEquipment.inveq_eqid
     JOIN
      invoice ON invoice.inv_id = invoiceEquipment.inveq_invid
    ${
      startDate && endDate
        ? "WHERE invoice.inv_createddate BETWEEN ? AND ?"
        : ""
    }
    GROUP BY 
      equipment.eq_id, equipment.eq_name
    ORDER BY 
      total_revenue DESC
    `,
      startDate && endDate ? [startDate, endDate] : []
    );
    return rows;
  } catch (error) {
    console.log("Error fetching equipment revenue report:", error);
    throw error;
  }
}
export async function getUnderutilizedEquipment(startDate, endDate) {
  try {
    const [rows] = await pool.query(
      `SELECT 
      equipment.eq_id,
      equipment.eq_name,
      COUNT(invoiceEquipment.inveq_eqid) AS total_rentals
  FROM 
      equipment
  JOIN 
      invoiceEquipment ON equipment.eq_id = invoiceEquipment.inveq_eqid
  ${
    startDate && endDate
      ? "JOIN invoice ON invoice.inv_id = invoiceEquipment.inveq_invid WHERE invoice.inv_createddate BETWEEN ? AND ? "
      : ""
  }
  GROUP BY 
      equipment.eq_id, equipment.eq_name
  HAVING 
      total_rentals < 5
  ORDER BY 
      total_rentals ASC
  `,
      startDate && endDate ? [startDate, endDate] : []
    );
    return rows;
  } catch (error) {
    console.log("Error fetching underutilized equipment report:", error);
    throw error;
  }
}
export async function getEquipmentRentalDetails(startDate, endDate) {
  try {
    const [rows] = await pool.query(
      `SELECT 
        equipment.eq_id,
        equipment.eq_name,
        COUNT(invoiceEquipment.inveq_eqid) AS total_rentals,
        SUM(COALESCE(invoiceEquipment.duration_in_days, 1)) AS total_rental_days
      FROM 
        equipment
      JOIN 
        invoiceEquipment ON equipment.eq_id = invoiceEquipment.inveq_eqid
      LEFT JOIN 
        invoice ON invoice.inv_id = invoiceEquipment.inveq_invid
      WHERE 
        (invoice.inv_createddate BETWEEN ? AND ?) OR (? IS NULL AND ? IS NULL)
      GROUP BY 
        equipment.eq_id, equipment.eq_name
      ORDER BY 
        total_rental_days DESC, total_rentals DESC`,
      startDate && endDate ? [startDate, endDate, startDate, endDate] : []
    );
    return rows;
  } catch (error) {
    console.log("Error fetching equipment rental details report:", error);
    throw error;
  }
}
export async function getIncompleteRentals() {
  try {
    const [rows] = await pool.query(
      `SELECT 
      equipment.eq_id,
      equipment.eq_name,
      invoice.inv_id,
      invoice.inv_createddate,
      DATEDIFF(CURRENT_DATE, invoice.inv_createddate) AS duration_in_days,
      (CASE WHEN DATEDIFF(CURRENT_DATE, invoice.inv_createddate) IS NULL THEN 1 ELSE 0 END) AS not_completed
    FROM 
      equipment
    JOIN 
      invoiceEquipment ON equipment.eq_id = invoiceEquipment.inveq_eqid
    JOIN 
      invoice ON invoice.inv_id = invoiceEquipment.inveq_invid
    WHERE 
      invoiceEquipment.duration_in_days IS NULL
    ORDER BY 
      equipment.eq_name, invoice.inv_createddate;
    `
    );
    return rows;
  } catch (error) {
    console.log("Error fetching incomplete rentals report:", error);
    throw error;
  }
}
export async function getDeletedInvoices(startDate, endDate) {
  console.log("object", startDate, endDate);
  try {
    const query = `
      SELECT 
        c.cus_fname AS first_name,
        c.cus_lname AS last_name,
        i.inv_id AS invoice_id,
        i.inv_createddate AS created_date,
        i.inv_updatedstatus AS updated_status
      FROM 
        customer c
      JOIN 
        invoice i ON i.inv_cusid = c.cus_id
      WHERE 
        i.inv_delete_status = 1
        AND i.inv_createddate BETWEEN ? AND ?;
    `;

    const [rows] = await pool.query(query, [startDate, endDate]);
    console.log("deelted", rows);
    return rows;
  } catch (error) {
    console.log("Error fetching deleted invoices report:", error);
    throw error;
  }
}
export async function getCombinedInvoiceReports(startDate, endDate) {
  try {
    const [revenue] = await pool.query(`
   SELECT 
    i.inv_id AS invoice_id,
        i.inv_createddate,
    (SUM(IFNULL(p.invpay_amount, 0)) + i.inv_advance) AS total_revenue
FROM 
    invoice i
LEFT JOIN 
    invoicePayments p ON p.invpay_inv_id = i.inv_id
WHERE 
    i.inv_delete_status = 0
GROUP BY 
    i.inv_id;

    `);
    const [totalIncome] = await pool.query(`
      SELECT 
        i.inv_id AS invoice_id,
        CONCAT(c.cus_fname, ' ', c.cus_lname) AS customer_name,
        SUM((ie.duration_in_days * ie.inveq_borrowqty * e.eq_rental)) AS total_income
      FROM 
        invoice i
      JOIN 
        customer c ON i.inv_cusid = c.cus_id
      JOIN 
        invoiceEquipment ie ON ie.inveq_invid = i.inv_id
      JOIN 
        equipment e ON ie.inveq_eqid = e.eq_id
      WHERE 
        (ie.inveq_return_date IS NOT NULL OR ie.inveq_borrow_date IS NOT NULL)
        AND i.inv_delete_status = 0
      GROUP BY 
        i.inv_id, c.cus_id;
    `);

    // Combine the results based on the common column `invoice_id`
    const combinedResults = revenue.map((revItem) => {
      const matchingTotalIncome = totalIncome.find(
        (incomeItem) => incomeItem.invoice_id === revItem.invoice_id
      );
      return {
        invoice_id: revItem.invoice_id,
        inv_createddate: revItem.inv_createddate,
        total_revenue: revItem.total_revenue,
        customer_name: matchingTotalIncome
          ? matchingTotalIncome.customer_name
          : null,
        total_income: matchingTotalIncome
          ? matchingTotalIncome.total_income
          : null,
      };
    });

    return combinedResults;
  } catch (error) {
    console.log("Error fetching combined invoice reports:", error);
    throw error;
  }
}
