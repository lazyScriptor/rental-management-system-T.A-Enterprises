import React, { useMemo } from "react";
import { Box, TextField, Button, Stack, Chip, Divider, Tooltip } from "@mui/material";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";

/**
 * Dashboard date filter with quick presets.
 *
 * Props:
 *  - startDate, endDate: ISO yyyy-mm-dd strings (controlled)
 *  - onChange(field, value): called for "startDate" | "endDate"
 *  - onApply(): apply current range
 *  - onReset(): clear range
 */
export default function DashboardFilters({ startDate, endDate, onChange, onApply, onReset }) {
  const todayISO = new Date().toISOString().slice(0, 10);

  const presets = useMemo(() => {
    const today = new Date();
    const iso = (d) => d.toISOString().slice(0, 10);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const minusDays = (n) => {
      const d = new Date(today);
      d.setDate(d.getDate() - n);
      return d;
    };

    return [
      { key: "today", label: "Today", start: todayISO, end: todayISO },
      { key: "7d", label: "Last 7 days", start: iso(minusDays(6)), end: todayISO },
      { key: "30d", label: "Last 30 days", start: iso(minusDays(29)), end: todayISO },
      { key: "month", label: "This month", start: iso(startOfMonth), end: todayISO },
      { key: "year", label: "This year", start: iso(startOfYear), end: todayISO },
      { key: "all", label: "All time", start: "", end: "" },
    ];
  }, [todayISO]);

  const applyPreset = (p) => {
    onChange?.("startDate", p.start);
    onChange?.("endDate", p.end);
    // allow parent state to settle, then apply
    setTimeout(() => onApply?.(), 0);
  };

  const invalid =
    startDate && endDate && new Date(endDate) < new Date(startDate);

  return (
    <Box
      sx={{
        mb: 2,
        p: 2,
        borderRadius: 2,
        bgcolor: "background.paper",
        border: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      {/* Quick presets */}
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        flexWrap="wrap"
        sx={{ mb: 1 }}
        alignItems="center"
      >
        <CalendarMonthOutlinedIcon fontSize="small" />
        {presets.map((p) => (
          <Chip
            key={p.key}
            size="small"
            label={p.label}
            variant="outlined"
            onClick={() => applyPreset(p)}
          />
        ))}
      </Stack>

      <Divider sx={{ mb: 2 }} />

      {/* Manual range */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems="center"
      >
        <TextField
          size="small"
          label="Start date"
          type="date"
          value={startDate || ""}
          onChange={(e) => onChange?.("startDate", e.target.value)}
          InputLabelProps={{ shrink: true }}
          error={invalid}
          helperText={invalid ? "Start date must be before end date" : ""}
        />
        <TextField
          size="small"
          label="End date"
          type="date"
          value={endDate || ""}
          onChange={(e) => onChange?.("endDate", e.target.value)}
          InputLabelProps={{ shrink: true }}
          error={invalid}
        />

        <Box sx={{ flexGrow: 1 }} />

        <Tooltip title="Apply filter">
          <span>
            <Button
              variant="contained"
              size="small"
              startIcon={<FilterAltOutlinedIcon />}
              onClick={onApply}
              disabled={invalid}
              sx={{ minWidth: 120 }}
            >
              Apply
            </Button>
          </span>
        </Tooltip>

        <Button
          variant="text"
          size="small"
          startIcon={<RestartAltOutlinedIcon />}
          onClick={onReset}
        >
          Reset
        </Button>
      </Stack>
    </Box>
  );
}