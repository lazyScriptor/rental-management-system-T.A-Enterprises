import { Box, Paper } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { InvoiceContext } from "../../../Contexts/Contexts";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useTheme } from "@mui/material/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";

function CompleteInvoiceTable() {
  const theme = useTheme();
  const [totalCost, setTotalCost] = useState(0);
  const { invoiceObject, setMachineTotalCost } = useContext(InvoiceContext);

  useEffect(() => {
    if (!invoiceObject.eqdetails) return;
    // ✅ Sum ONLY returned rows for totals
    const newTotalCost = invoiceObject.eqdetails.reduce((acc, row) => {
      if (row.inveq_return_date && row.duration_in_days) {
        return acc + rentalCalculation(row);
      }
      return acc;
    }, 0);

    setTotalCost(newTotalCost);
    setMachineTotalCost(newTotalCost);
  }, [invoiceObject.eqdetails, setMachineTotalCost]);

  const colorFunction = (durationNumber) => {
    if (durationNumber == null) return theme.palette.primary[50];
  };

  // ---- calculations ----
  const rentalCalculation = (row) => {
    const dateSet = Number(row.eqcat_dataset) || 0;
    const normalRental = Number(row.eq_rental) || 0;
    const specialRental = Number(row.spe_singleday_rent) || 0;
    const duration = Number(row.duration_in_days) || 0;
    const qty = Number(row.inveq_borrowqty) || 0;
    const categoryId = Number(row.eqcat_id) || 0;

    let finalRental = 0;
    if (specialRental && categoryId == 2) {
      if (duration <= dateSet) {
        finalRental = (duration === 1 ? specialRental : specialRental * 2) * qty;
      } else {
        finalRental = normalRental * duration * qty;
      }
    } else if (specialRental && categoryId != 2) {
      finalRental = (duration < dateSet ? specialRental * duration : normalRental * duration) * qty;
    } else {
      finalRental = normalRental * duration * qty;
    }
    return finalRental;
  };

  // Per-day rate to show in the bracket for NOT returned items (today only)
  const todayOnlyCost = (row) => {
    const dateSet = Number(row.eqcat_dataset) || 0;
    const normalRental = Number(row.eq_rental) || 0;
    const specialRental = Number(row.spe_singleday_rent) || 0;
    const duration = Number(row.duration_in_days) || 0; // days so far
    const qty = Number(row.inveq_borrowqty) || 0;
    const categoryId = Number(row.eqcat_id) || 0;

    let perDay;
    if (specialRental && categoryId == 2) {
      perDay = duration <= dateSet ? specialRental : normalRental;
    } else if (specialRental && categoryId != 2) {
      perDay = duration < dateSet ? specialRental : normalRental;
    } else {
      perDay = normalRental;
    }
    return perDay * qty;
  };

  const rentalDisplayLogic = (row) => {
    const dateSet = Number(row.eqcat_dataset) || 0;
    const normalRental = Number(row.eq_rental) || 0;
    const specialRental = Number(row.spe_singleday_rent) || 0;
    const duration = Number(row.duration_in_days) || 0;
    const categoryId = Number(row.eqcat_id) || 0;

    if (!duration) return normalRental; // show base rate if no duration yet

    if (specialRental && categoryId == 2) {
      if (duration <= dateSet) {
        return duration !== 1 ? [specialRental * 2, ": දින දෙකකට පමණි"] : specialRental;
      }
      return normalRental;
    } else if (specialRental && categoryId != 2) {
      return duration < dateSet ? specialRental : normalRental;
    } else {
      return normalRental;
    }
  };

  return (
    <Box sx={{ position: "relative", height: "100%", overflowY: "auto" }}>
      <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 3, overflowY: "auto" }}>
        <Table sx={{ minWidth: 650, minHeight: "32.2vh" }} stickyHeader aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="center">තීර අංකය</TableCell>
              <TableCell align="center">භාණ්ඩයේ අංකය</TableCell>
              <TableCell align="center">භාණ්ඩයේ නම</TableCell>
              <TableCell align="center">ගාස්තුව (දිනකට)</TableCell>
              <TableCell align="center">ගෙන ආ දිනය</TableCell>
              <TableCell align="center">ගෙනගිය ප්‍රමාණය</TableCell>
              <TableCell align="center">තබාගත් දින ගනන</TableCell>
              <TableCell align="center">ගෙනදුන් ප්‍රමාණය</TableCell>
              <TableCell align="center">භාණ්ඩය සඳහා මුලු අයකිරීම</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoiceObject.eqdetails &&
              invoiceObject.eqdetails.map((row, index) => {
                const totalForRow = rentalCalculation(row);
                const notReturned = row.inveq_return_date == null;
                const hasDuration = !!row.duration_in_days;
                const bracketToday = notReturned ? todayOnlyCost(row) : null;

                return (
                  <TableRow
                    key={index}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      backgroundColor: colorFunction(row.duration_in_days),
                    }}
                  >
                    <TableCell align="center">{index + 1}#</TableCell>
                    <TableCell align="center">{row.eq_id}</TableCell>
                    <TableCell align="center">{row.eq_name}</TableCell>
                    <TableCell align="center">{rentalDisplayLogic(row)}</TableCell>
                    <TableCell align="center">
                      {notReturned ? (
                        <FontAwesomeIcon icon={faCircle} beatFade style={{ color: "#FFD43B" }} />
                      ) : (
                        new Date(row.inveq_return_date).toLocaleString()
                      )}
                    </TableCell>
                    <TableCell align="center">{row.inveq_borrowqty}</TableCell>
                    <TableCell align="center">{row.duration_in_days}</TableCell>
                    <TableCell align="center">
                      {row.inveq_return_quantity == 0 ? "" : row.inveq_return_quantity}
                    </TableCell>
                    <TableCell align="center" sx={{ backgroundColor: theme.palette.primary[50] }}>
                      {/* Always show bracket for not-returned; do NOT add to totals */}
                      {hasDuration ? `රු. ${totalForRow}` : "රු. 0"}
                      {notReturned && ` (${bracketToday})`}
                    </TableCell>
                  </TableRow>
                );
              })}

            {/* Total of only returned rows */}
            <TableRow sx={{ backgroundColor: theme.palette.primary[100] }}>
              <TableCell colSpan={8} align="right">
                මුලු අයකිරීම
              </TableCell>
              <TableCell align="center" sx={{ backgroundColor: theme.palette.primary[200] }}>
                {`රු. ${totalCost}`}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default CompleteInvoiceTable;