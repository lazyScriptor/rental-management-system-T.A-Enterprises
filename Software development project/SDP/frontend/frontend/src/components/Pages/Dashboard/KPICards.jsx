// frontend/src/components/Pages/Dashboard/KPICards.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Stack,
  Typography,
  Tooltip,
  Divider,
  Skeleton,
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import PaidIcon from "@mui/icons-material/Paid";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import InventoryIcon from "@mui/icons-material/Inventory";
import AvTimerIcon from "@mui/icons-material/AvTimer";

const fmtLKR = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 0,
});

function StatCard({ icon, label, value, sub, color = "inherit" }) {
  return (
    <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ p: 1, borderRadius: 1, bgcolor: "background.default" }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="overline" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600 }} color={color}>
            {value}
          </Typography>
          {sub && (
            <Typography variant="caption" color="text.secondary">
              {sub}
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}

export default function KPICards() {
  const [combined, setCombined] = useState(null);
  const [incomplete, setIncomplete] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [r1, r2] = await Promise.all([
          axios.get("http://localhost:8085/reports/getCombinedInvoiceReports"),
          axios.get("http://localhost:8085/reports/getIncompleteRentals"),
        ]);
        if (!mounted) return;
        setCombined(r1?.data?.response || []);
        setIncomplete(r2?.data?.response || []);
      } catch (e) {
        setCombined([]);
        setIncomplete([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    if (!combined || !incomplete) return null;

    const todayStr = dayjs().format("YYYY-MM-DD");
    const isToday = (iso) => dayjs(iso).format("YYYY-MM-DD") === todayStr;
    const isSameMonth = (iso) => dayjs(iso).isSame(dayjs(), "month");

    const todayNet = combined.reduce((acc, r) => {
      if (isToday(r.inv_createddate)) {
        const tot = Number(r.total_income || 0);
        const disc = Number(r.discount || 0);
        return acc + (tot - disc);
      }
      return acc;
    }, 0);

    const mtdNet = combined.reduce((acc, r) => {
      if (isSameMonth(r.inv_createddate)) {
        const tot = Number(r.total_income || 0);
        const disc = Number(r.discount || 0);
        return acc + (tot - disc);
      }
      return acc;
    }, 0);

    const openInvoices = combined.filter((r) => !r.inv_completed_datetime).length;

    // Items currently on rent & avg days open
    // API returns: total_quantity, total_returned_quantity, duration_in_days (since invoice created)
    let itemsOnRent = 0;
    let sumDays = 0;
    let openRows = 0;

    incomplete.forEach((row) => {
      const out = Number(row.total_quantity || 0) - Number(row.total_returned_quantity || 0);
      itemsOnRent += Math.max(0, out);
      if (row.duration_in_days != null) {
        sumDays += Number(row.duration_in_days);
        openRows += 1;
      }
    });

    const avgDaysOpen = openRows > 0 ? (sumDays / openRows) : 0;

    return {
      todayNet,
      mtdNet,
      openInvoices,
      itemsOnRent,
      avgDaysOpen,
    };
  }, [combined, incomplete]);

  if (loading) {
    return (
      <Grid container spacing={2}>
        {[...Array(5)].map((_, i) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={i}>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Skeleton width="60%" />
              <Skeleton height={36} />
              <Skeleton width="40%" />
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <StatCard
          icon={<PaidIcon fontSize="small" />}
          label="Today's Net Revenue"
          value={fmtLKR.format(stats?.todayNet || 0)}
          color="success.main"
          sub="(Total − Discounts for today)"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <StatCard
          icon={<QueryStatsIcon fontSize="small" />}
          label="MTD Net Revenue"
          value={fmtLKR.format(stats?.mtdNet || 0)}
          sub={dayjs().format("MMMM YYYY")}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <StatCard
          icon={<ReceiptLongIcon fontSize="small" />}
          label="Open Invoices"
          value={stats?.openInvoices ?? 0}
          sub="Not completed yet"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <StatCard
          icon={<InventoryIcon fontSize="small" />}
          label="Items On Rent"
          value={stats?.itemsOnRent ?? 0}
          sub="Qty not returned"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <Tooltip title="Average days since creation for ongoing rentals">
          <Box>
            <StatCard
              icon={<AvTimerIcon fontSize="small" />}
              label="Avg Days Open"
              value={(stats?.avgDaysOpen ?? 0).toFixed(1)}
            />
          </Box>
        </Tooltip>
      </Grid>
    </Grid>
  );
}