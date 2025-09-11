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

/**
 * NOTE: Duration now uses precise 24-hour blocks (time-aware), not calendar days.
 * Any partial day rounds UP. Minimum billable is 1 day.
 */
function CompleteInvoiceTable() {
  const theme = useTheme();
  const [totalCostToday, setTotalCostToday] = useState(0);
  const { invoiceObject, setMachineTotalCost } = useContext(InvoiceContext);

  // ---- helpers ----
  const toDate = (val) => (val instanceof Date ? val : new Date(val));

  // 24h-precise, rounds up, min 1. Accepts Date or ISO for end.
  const days24hCeil = (startISO, end = new Date()) => {
    if (!startISO) return 0;
    const s = toDate(startISO);
    const e = toDate(end);
    const ms = e - s;
    if (!isFinite(ms) || ms < 0) return 0;
    const days = ms / (1000 * 60 * 60 * 24);
    // subtract epsilon to avoid floating point 1.00000000002 becoming 2 when ceil'd
    return Math.max(1, Math.ceil(days - 1e-9));
  };

  const n = (v) => Number(v) || 0;

  // Pricing logic (unchanged)
  const rentalCalculation = (row, durationDays) => {
    const dateSet = n(row.eqcat_dataset);
    const normalRental = n(row.eq_rental);
    const specialRental = n(row.spe_singleday_rent);
    const qty = n(row.inveq_borrowqty);
    const d = n(durationDays);

    if (d <= 0 || qty <= 0) return 0;

    if (specialRental) {
      if (d <= dateSet) {
        return specialRental * qty;
      }
      return (specialRental + normalRental * (d - dateSet)) * qty;
    }
    return normalRental * d * qty;
  };

  // Cumulative (till today) cost for a row using 24h precise days
  const costTillTodayForRow = (row) => {
    const hasReturn = !!row.inveq_return_date;
    const borrowFrom = row.inveq_borrowdate || invoiceObject?.createdDate;
    const durationDays = hasReturn
      ? days24hCeil(borrowFrom, row.inveq_return_date)
      : days24hCeil(borrowFrom, new Date());
    return rentalCalculation(row, durationDays);
  };

  // For display: number of 24h days used for this row
  const daysUsedForRow = (row) => {
    const hasReturn = !!row.inveq_return_date;
    const borrowFrom = row.inveq_borrowdate || invoiceObject?.createdDate;
    return hasReturn
      ? days24hCeil(borrowFrom, row.inveq_return_date)
      : days24hCeil(borrowFrom, new Date());
  };

  // Today's per-day rate (unchanged logic; only duration boundary uses precise days)
  const todayPerDayCost = (row) => {
    const dateSet = n(row.eqcat_dataset);
    const normalRental = n(row.eq_rental);
    const specialRental = n(row.spe_singleday_rent);
    const qty = n(row.inveq_borrowqty);
    const categoryId = n(row.eqcat_id);

    // How many precise days have elapsed so far?
    const durationSoFar = days24hCeil(row.inveq_borrowdate || invoiceObject?.createdDate, new Date());

    let perDay;
    if (specialRental && categoryId === 2) {
      perDay = durationSoFar <= dateSet ? specialRental : normalRental;
    } else if (specialRental && categoryId !== 2) {
      perDay = durationSoFar < dateSet ? specialRental : normalRental;
    } else {
      perDay = normalRental;
    }
    return perDay * qty;
  };

  const colorFunction = (row) => {
    // If not yet returned, give a subtle hint
    const hasReturn = !!row.inveq_return_date;
    return hasReturn ? undefined : theme.palette.primary[25];
  };

  const rentalDisplayLogic = (row) => {
    const dateSet = n(row.eqcat_dataset);
    const normalRental = n(row.eq_rental);
    const specialRental = n(row.spe_singleday_rent);
    const hasDuration = !!row.duration_in_days;

    if (!hasDuration && !specialRental) return normalRental;

    if (specialRental) {
      // show what rule applies generally
      return ` දින ${dateSet} තුළ ${specialRental} | ඉන් පසු දිනකට ${normalRental} බැගින්`;
    }
    return normalRental;
  };

  // --- totals split (using current row calculations) ---
  const totalsSplit = React.useMemo(() => {
    const list = invoiceObject?.eqdetails || [];
    let returnedSum = 0;
    let ongoingSum = 0;
    for (const row of list) {
      const rowCost = costTillTodayForRow(row);
      if (row.inveq_return_date) {
        returnedSum += rowCost;
      } else {
        ongoingSum += rowCost;
      }
    }
    return { returnedSum, ongoingSum, grand: returnedSum + ongoingSum };
  }, [invoiceObject?.eqdetails, invoiceObject?.createdDate]);

  // Recompute machine total (as of now) whenever items change
  useEffect(() => {
    const list = invoiceObject?.eqdetails || [];
    if (!Array.isArray(list) || list.length === 0) {
      setTotalCostToday(0);
      setMachineTotalCost?.(0);
      return;
    }
    const sumToday = list.reduce((acc, row) => acc + costTillTodayForRow(row), 0);
    setTotalCostToday(sumToday);
    setMachineTotalCost?.(sumToday);
  }, [invoiceObject?.eqdetails, invoiceObject?.createdDate, setMachineTotalCost]);

  return (
    <Box sx={{ position: "relative", height: "100%", overflowY: "auto" }}>
      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2, overflowY: "auto" }}>
        <Table sx={{ minWidth: 650, minHeight: "32.2vh" }} stickyHeader aria-label="invoice items">
          <TableHead>
            <TableRow>
              <TableCell align="center">#</TableCell>
              <TableCell align="center">භාණ්ඩ අංකය</TableCell>
              <TableCell align="center">භාණ්ඩයේ නම</TableCell>
              <TableCell align="center">නියත ගාස්තුව</TableCell>
              <TableCell align="center">ආපසු දීම</TableCell>
              <TableCell align="center">ගත් ප්‍රමාණය</TableCell>
              <TableCell align="center">අද දක්වා දින</TableCell>
              <TableCell align="center">ආපසු දුන් ප්‍රමාණය</TableCell>
              <TableCell align="center">අද දක්වා ගාස්තුව</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(invoiceObject?.eqdetails || []).map((row, index) => {
              const returned = !!row.inveq_return_date;
              const rowTotalTillToday = costTillTodayForRow(row);
              const perDayIfOngoing = !returned ? todayPerDayCost(row) : null;
              const daysUsed = daysUsedForRow(row);

              return (
                <TableRow
                  key={`${row.eq_id}-${index}`}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    backgroundColor: colorFunction(row),
                  }}
                >
                  <TableCell align="center">{index + 1}</TableCell>
                  <TableCell align="center">{row.eq_id}</TableCell>
                  <TableCell align="center">{row.eq_name}</TableCell>
                  <TableCell align="center">{rentalDisplayLogic(row)}</TableCell>
                  <TableCell align="center">
                    {returned ? (
                      new Date(row.inveq_return_date).toLocaleString()
                    ) : (
                      <FontAwesomeIcon icon={faCircle} beatFade style={{ color: "#FFD43B" }} />
                    )}
                  </TableCell>
                  <TableCell align="center">{row.inveq_borrowqty}</TableCell>
                  <TableCell align="center">{daysUsed}</TableCell>
                  <TableCell align="center">
                    {row.inveq_return_quantity ? row.inveq_return_quantity : "—"}
                  </TableCell>
                  <TableCell align="center" sx={{ backgroundColor: theme.palette.primary[50] }}>
                    රු. {rowTotalTillToday}
                    {!returned && perDayIfOngoing != null && (
                      <Box component="span" sx={{ ml: 1, fontSize: 12, color: "text.secondary" }}>
                        (අද දිනට)
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}

            <TableRow sx={{ backgroundColor: theme.palette.primary[25] }}>
              <TableCell colSpan={8} align="right">
                ආපසු දුන් භාණ්ඩ මුළු ගාස්තුව
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 500 }}>
                රු. {totalsSplit.returnedSum}
              </TableCell>
            </TableRow>
            <TableRow sx={{ backgroundColor: theme.palette.primary[50] }}>
              <TableCell colSpan={8} align="right">
                තවමත් නොආපසු දුන් භාණ්ඩ මුළු ගාස්තුව
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 500 }}>
                රු. {totalsSplit.ongoingSum}
              </TableCell>
            </TableRow>
            <TableRow sx={{ backgroundColor: theme.palette.primary[100] }}>
              <TableCell colSpan={8} align="right">
                අද දක්වා මුළු ගාස්තුව
              </TableCell>
              <TableCell align="center" sx={{ backgroundColor: theme.palette.primary[200], fontWeight: 600 }}>
                රු. {totalCostToday}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default CompleteInvoiceTable;