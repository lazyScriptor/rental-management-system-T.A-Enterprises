import React from "react";
import "../Stylings/rootstyles.css";
import { useEffect, useState } from "react";
import { Box, Paper, Button, TextField, colors, useTheme } from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Rating from "@mui/material/Rating";
import EquipmentItem1 from "./EquipmentItem1";

import axios from "axios";
import { Item1 } from "./CustomerItem1";
import Item2 from "./CustomerItem2";
import EquipmentItem2 from "./EquipmentItem2";
import EquipmentItem3 from "./EquipmentItem3";
import EquipmentItem4 from "./EquipmentItem4";
import { EquipmentItem5 } from "./EquipmentItem5";
import ReportsNavBar from "./ReportsNavBar";

function ReportsBackgroundCustomers() {
  function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  }

  CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }
  const [value, setValue] = useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <Box id="main-body">
        <Box id="body" sx={{ display: "flex", flexDirection: "column" }}>
          <Box component={Paper} sx={{ width: "100%", height: "auto" }}>
        
            <Box sx={{ height: "10vh", display: "flex", width: "100%" }}>
              <ReportsNavBar />
            </Box>
            <Box
              sx={{
                height: "auto",
                minHeight: "90vh",
                display: "flex",
                backgroundColor: "#f2f4f7",
                p: 2,
              }}
            >
              <Box sx={{ width: "20%" }}>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                  >
                    Customer Reports
                  </AccordionSummary>
                  <AccordionDetails>
                    <Tabs
                      orientation="vertical"
                      selectionFollowsFocus
                      value={value}
                      onChange={handleChange}
                      variant="scrollable"
                      scrollButtons="auto"
                      aria-label="scrollable auto tabs example"
                    >
                      <Tab label="Customer Sale " {...a11yProps(0)} />
                      <Tab label="Customer Invoice details" {...a11yProps(1)} />
                    </Tabs>
                  </AccordionDetails>
                </Accordion>
              </Box>
              <Box sx={{width:"80%"}}>
              <CustomTabPanel value={value} index={0}>
              <Item1 />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
              <Item2 />
            </CustomTabPanel>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default ReportsBackgroundCustomers;
