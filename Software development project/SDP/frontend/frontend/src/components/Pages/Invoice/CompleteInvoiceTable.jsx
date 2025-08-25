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
    if (invoiceObject.eqdetails) {
      const newTotalCost = invoiceObject.eqdetails.reduce((acc, row) => {
        if (row.duration_in_days) {
          return acc + rentalCalculation(row);
        }
        return acc;
      }, 0);

      setTotalCost(newTotalCost);
      setMachineTotalCost(newTotalCost);
    }
  }, [invoiceObject.eqdetails, setMachineTotalCost]);

  const colorFunction = (durationNumber) => {
    if (durationNumber == null) return theme.palette.primary[50];
  };
  const rentalCalculation = (row) => {
    const dateSet = row.eqcat_dataset;
    const normalRental = row.eq_rental;
    const specialRental = row.spe_singleday_rent;
    const duration = row.duration_in_days;
    const quantity = row.inveq_borrowqty;
    const categoryId = row.eqcat_id;
    // console.log(dateSet,normalRental,specialRental,duration,quantity,categoryId)

    let finalRental = 0;
    //Saccolding special logic-scaffolidng id =2
    //check scaffolding or not
    if (specialRental && categoryId == 2) {
      //check scaffolding dateset constraint is lesser than or equal to the duration
      if (duration <= dateSet) {
        //duration = 1 newei nan dawas 5 wenakanma dawas dekaka gaana witarai ganne scaffoldings walta
        if (duration != 1) {
          finalRental = specialRental * 2 * quantity;
        }
        if (duration == 1) {
          //duration =1 nan normal
          finalRental = specialRental * 1 * quantity;
        }
      } else {
        //duration eka db eke thyena dateset value ekata wadinan normal
        finalRental = normalRental * duration * quantity;
      }
      //scaffolding nowana anith special dateSet seen eka thyena equipment wala logic eka
    } else if (specialRental && categoryId != 2) {
      if (duration < dateSet) {
        finalRental = specialRental * duration * quantity;
      } else {
        finalRental = normalRental * duration * quantity;
      }
    } else {
      finalRental = normalRental * duration * quantity;
    }
    return finalRental;
  };
  const rentalDisplayLogic = (row) => {
    const dateSet = row.eqcat_dataset;
    const normalRental = row.eq_rental;
    const specialRental = row.spe_singleday_rent;
    const duration = row.duration_in_days;
    const quantity = row.inveq_borrowqty;
    const categoryId = row.eqcat_id;
    let finalRental = 0;
    if (duration) {
      if (specialRental && categoryId == 2) {
        if (duration <= dateSet) {
          if (duration != 1) {
            finalRental = [specialRental * 2, ": දින දෙකකට පමණි"];
          }
          if (duration == 1) {
            finalRental = specialRental * 1;
          }
        } else {
          finalRental = normalRental;
        }
      } else if (specialRental && categoryId != 2) {
        if (duration < dateSet) {
          finalRental = specialRental;
        } else {
          finalRental = normalRental;
        }
      } else {
        finalRental = normalRental;
      }
      return finalRental;
    }
  };
  return (
    <Box sx={{ position: "relative", height: "100%", overflowY: "auto" }}>
      <TableContainer
        component={Paper}
        elevation={4}
        sx={{
          borderRadius: 3,
          overflowY: "auto",
        }}
      >
        <Table
          sx={{ minWidth: 650, minHeight: "32.2vh" }}
          stickyHeader
          aria-label="simple table"
        >
          <TableHead>
            <TableRow>
              {/* Header Cells */}
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
                const itemCost =
                  row.eq_rental * row.duration_in_days * row.inveq_borrowqty;
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
                    <TableCell align="center">
                      {rentalDisplayLogic(row)}
                    </TableCell>
                    <TableCell align="center">
                      {row.inveq_return_date == null ? (
                        <FontAwesomeIcon
                          icon={faCircle}
                          beatFade
                          style={{ color: "#FFD43B" }}
                        />
                      ) : (
                        new Date(row.inveq_return_date).toLocaleString()
                      )}
                    </TableCell>
                    <TableCell align="center">{row.inveq_borrowqty}</TableCell>
                    <TableCell align="center">{row.duration_in_days}</TableCell>
                    <TableCell align="center">
                      {row.inveq_return_quantity == 0
                        ? ""
                        : row.inveq_return_quantity}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ backgroundColor: theme.palette.primary[50] }}
                    >
                      {row.duration_in_days
                        ? `රු. ${rentalCalculation(row)}`
                        : ""}
                    </TableCell>
                  </TableRow>
                );
              })}
            {/* Row to display total */}
            <TableRow
              sx={{
                backgroundColor: theme.palette.primary[100],
              }}
            >
              <TableCell colSpan={8} align="right" sx={{}}>
                මුලු අයකිරීම
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  backgroundColor: theme.palette.primary[200],
                }}
              >
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
