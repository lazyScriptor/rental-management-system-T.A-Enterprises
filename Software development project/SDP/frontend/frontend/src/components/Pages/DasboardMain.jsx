import React, { useMemo, useState } from "react";
import { Container, Grid, Paper } from "@mui/material";
import "../Stylings/rootstyles.css";

// Filters
import DashboardFilters from "./Dashboard/DashboardFilters";

// KPI & widgets
import KPICards from "./Dashboard/KPICards";

// Charts & Tables
import EquipmentRevenueDoughnut from "./Dashboard/Chart1";
import Chart2 from "./Dashboard/Chart2";
import Chart3 from "./Dashboard/Chart3";
import Chart4 from "./Dashboard/Chart4";
import RevenueVsIncomeChart from "./Dashboard/RevenueVsIncomeChart";
import RevenueTrend from "./Dashboard/RevenueTrend";
import EquipmentUtilizationBar from "./Dashboard/EquipmentUtilizationBar";
import TopEquipmentTable from "./Dashboard/TopEquipmentTable";
import UnderutilizedTable from "./Dashboard/UnderutilizedTable";
import CombinedInvoiceTable from "./Dashboard/CombinedInvoiceTable";
import IncompleteRentalsTable from "./Dashboard/IncompleteRentalsTable";
import OverdueReturns from "./Dashboard/OverdueReturns";

/**
 * Dashboard main layout with a responsive grid and date-range filter.
 * Passes the applied range to children via props: { startDate, endDate }.
 */
export default function DasboardMain() {
  const [range, setRange] = useState({
    startDate: "",
    endDate: "",
    appliedStart: "",
    appliedEnd: "",
  });

  const onChange = (field, value) => setRange((r) => ({ ...r, [field]: value }));
  const onApply = () =>
    setRange((r) => ({
      ...r,
      appliedStart: r.startDate || "",
      appliedEnd: r.endDate || "",
    }));
  const onReset = () =>
    setRange({ startDate: "", endDate: "", appliedStart: "", appliedEnd: "" });

  const filters = useMemo(
    () => ({ startDate: range.appliedStart, endDate: range.appliedEnd }),
    [range.appliedStart, range.appliedEnd]
  );

  const card = { p: 2, borderRadius: 2, height: "100%" };

  return (
    <Container maxWidth="2xl" sx={{ py: 2 }}>
      {/* Filters */}
      <DashboardFilters
        startDate={range.startDate}
        endDate={range.endDate}
        onChange={onChange}
        onApply={onApply}
        onReset={onReset}
      />

      {/* KPI row */}
      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid item xs={12}>
          <KPICards />
        </Grid>
      </Grid>

      {/* Charts row 1 */}
      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid item xs={12} md={6} lg={4} xl={3}>
          <Paper elevation={3} sx={card}>
            <EquipmentRevenueDoughnut {...filters} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={4} xl={3}>
          <Paper elevation={3} sx={card}>
            <RevenueVsIncomeChart {...filters} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={4} xl={3}>
          <Paper elevation={3} sx={card}>
            <Chart2 {...filters} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={4} xl={3}>
          <Paper elevation={3} sx={card}>
            <Chart3 {...filters} />
          </Paper>
        </Grid>
      </Grid>

      {/* Charts row 2 */}
      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid item xs={12} md={6} lg={6}>
          <Paper elevation={3} sx={card}>
            <EquipmentUtilizationBar {...filters} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <Paper elevation={3} sx={card}>
            <RevenueTrend />
          </Paper>
        </Grid>
      </Grid>

      {/* Tables row */}
      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <Paper elevation={3} sx={card}>
            <CombinedInvoiceTable {...filters} />
          </Paper>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Paper elevation={3} sx={card}>
            <TopEquipmentTable />
          </Paper>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Paper elevation={3} sx={card}>
            <IncompleteRentalsTable />
          </Paper>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Paper elevation={3} sx={card}>
            <UnderutilizedTable {...filters} />
          </Paper>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Paper elevation={3} sx={card}>
            <OverdueReturns />
          </Paper>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Paper elevation={3} sx={card}>
            <Chart4 />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}