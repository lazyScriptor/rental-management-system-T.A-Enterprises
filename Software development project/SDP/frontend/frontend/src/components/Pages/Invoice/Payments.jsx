import { Box, Button, Stack, TextField } from "@mui/material";
import React, { useContext, useState } from "react";
import Lottie from "react-lottie";
import Cash from "../../../assets/Cash.json";
import Advance from "../../../assets/Advance.json";
// You'll need to add a refund animation asset
import Refund from "../../../assets/Advance.json";
import { InvoiceContext } from "../../../Contexts/Contexts";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const Buttonstyles = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "130px",
  height: "110px",
  border: "solid 1px",
  borderRadius: 4,
  opacity: 0.8,
  m: 2,
};

const ButtonstylesSubmit = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100px",
  height: "80px",
  color: "white",
  borderRadius: 4,
  opacity: 0.8,
  m: 2,
};

const textFieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
  },
};

export default function Payments({ handleInvoiceSearch }) {
  const { invoiceSearchBtnStatus } = useContext(InvoiceContext);
  const [selectedTab, setSelectedTab] = useState("advance"); // "advance", "payment", "refund"

  return (
    <Box
      sx={{
        width: "25vw",
        height: "350px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Box sx={{ display: "flex" }}>
        <ButtonSection
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          invoiceSearchBtnStatus={invoiceSearchBtnStatus}
        />
      </Box>

      <Box sx={{ height: "273px", width: "300px" }}>
        {invoiceSearchBtnStatus ? (
          selectedTab === "refund" ? (
            <RefundForm handleInvoiceSearch={handleInvoiceSearch} />
          ) : (
            <PaymentForm handleInvoiceSearch={handleInvoiceSearch} />
          )
        ) : selectedTab === "advance" ? (
          <AdvancePayment />
        ) : selectedTab === "payment" ? (
          <PaymentForm />
        ) : (
          <RefundForm />
        )}
      </Box>
    </Box>
  );
}

export function PaymentForm({ handleInvoiceSearch }) {
  const { updateValue, invoiceObject } = useContext(InvoiceContext);

  const generatePaymentId = (invoiceId, amount) => {
    const date = new Date();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const milliseconds = ("00" + date.getMilliseconds()).slice(-3);
    const amountFormatted = Math.abs(amount).toFixed(2).replace(".", "").padStart(5, "0");
    const uniquePart = uuidv4().slice(0, 3);
    return `${invoiceId}${month}${day}${milliseconds}${amountFormatted}${uniquePart}`;
  };

  function dateformatter() {
    const formattedDate = new Date();
    return formattedDate;
  }

  const schema = yup.object().shape({
    payment: yup
      .number()
      .typeError("Please enter a valid number")
      .required("This field is required")
      .min(0),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    const paymentId = generatePaymentId(invoiceObject.InvoiceID, data.payment);

    const newPayment = {
      invpay_payment_id: paymentId,
      invpay_payment_date: dateformatter(),
      invpay_amount: data.payment,
    };

    updateValue("payments", newPayment);
    reset();
  };

  return (
    <form
      style={{ height: "100%" }}
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <TextField
        sx={textFieldStyle}
        fullWidth
        label="Payment Amount"
        {...register("payment")}
        error={!!errors.payment}
        helperText={errors.payment?.message}
      />
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Button variant="contained" sx={ButtonstylesSubmit} type="submit">
          Pay
        </Button>
      </Box>
    </form>
  );
}

export function AdvancePayment() {
  const { updateValue } = useContext(InvoiceContext);

  const schema = yup.object().shape({
    advance: yup
      .number()
      .typeError("Please enter a valid number")
      .required("This field is required")
      .min(0),
  });
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    updateValue("advance", data.advance);
    reset();
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4} width="100%">
        <TextField
          sx={textFieldStyle}
          label="Advance payment"
          {...register("advance")}
          error={!!errors.advance}
          helperText={errors.advance?.message}
        />
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button variant="contained" sx={ButtonstylesSubmit} type="submit">
            Pay
          </Button>
        </Box>
      </Stack>
    </form>
  );
}

export function RefundForm() {
  const { updateValue, invoiceObject } = useContext(InvoiceContext);

  const generatePaymentId = (invoiceId, amount) => {
    const date = new Date();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const milliseconds = ("00" + date.getMilliseconds()).slice(-3);
    const amountFormatted = Math.abs(amount).toFixed(2).replace(".", "").padStart(5, "0");
    const uniquePart = uuidv4().slice(0, 3);
    return `REF${invoiceId}${month}${day}${milliseconds}${amountFormatted}${uniquePart}`;
  };

  function dateformatter() {
    const formattedDate = new Date();
    return formattedDate;
  }

  const schema = yup.object().shape({
    refund: yup
      .number()
      .typeError("Please enter a valid number")
      .required("This field is required")
      .min(0.01, "Refund amount must be greater than 0"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    const paymentId = generatePaymentId(invoiceObject.InvoiceID, data.refund);

    const newRefund = {
      invpay_payment_id: paymentId,
      invpay_payment_date: dateformatter(),
      invpay_amount: -Math.abs(data.refund), // Convert to negative
    };

    updateValue("payments", newRefund);
    reset();
  };

  return (
    <form
      style={{ height: "100%" }}
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <TextField
        sx={{
          ...textFieldStyle,
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            "& fieldset": {
              borderColor: "#ff6b6b",
            },
            "&:hover fieldset": {
              borderColor: "#ff5252",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#ff1744",
            },
          },
          "& .MuiInputLabel-root": {
            color: "#ff6b6b",
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: "#ff1744",
          },
        }}
        fullWidth
        label="Refund Amount"
        placeholder="Enter positive amount"
        {...register("refund")}
        error={!!errors.refund}
        helperText={errors.refund?.message || "Amount will be processed as refund (negative)"}
      />
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Button 
          variant="contained" 
          sx={{
            ...ButtonstylesSubmit,
            backgroundColor: "#ff1744",
            "&:hover": {
              backgroundColor: "#d50000",
            },
          }} 
          type="submit"
        >
          Refund
        </Button>
      </Box>
    </form>
  );
}

export function ButtonSection(props) {
  const { selectedTab, setSelectedTab, invoiceSearchBtnStatus } = props;

  return (
    <>
      {!invoiceSearchBtnStatus && (
        <Button
          sx={{
            ...Buttonstyles,
            backgroundColor: selectedTab === "advance"
              ? (theme) => theme.palette.primary[100]
              : "inherit",
          }}
          variant="outlined"
          onClick={() => setSelectedTab("advance")}
        >
          <Lottie options={{ animationData: Advance }} width={100} />
          Advance
        </Button>
      )}
      
      <Button
        sx={{
          ...Buttonstyles,
          backgroundColor: selectedTab === "payment"
            ? (theme) => theme.palette.primary[100]
            : "inherit",
        }}
        variant="outlined"
        onClick={() => setSelectedTab("payment")}
      >
        <Lottie options={{ animationData: Cash }} width={100} />
        Payment
      </Button>

      {invoiceSearchBtnStatus && (
        <Button
          sx={{
            ...Buttonstyles,
            backgroundColor: selectedTab === "refund"
              ? "rgba(255, 23, 68, 0.1)"
              : "inherit",
            borderColor: selectedTab === "refund" ? "#ff1744" : "inherit",
          }}
          variant="outlined"
          onClick={() => setSelectedTab("refund")}
        >
          {/* You can replace this with your Refund Lottie animation */}
          <Box sx={{ 
            width: 100, 
            height: 60, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            fontSize: "24px",
            color: "#ff1744"
          }}>
            ↺
          </Box>
          Refund
        </Button>
      )}
    </>
  );
}