import React from "react";
import ReportsNavBar from "./ReportsNavBar";
import "../Stylings/rootstyles.css";
import { useState } from "react";
import { Box, Paper } from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import InvoiceItem1 from "./InvoiceItem1";
import InvoiceItem2 from "./InvoiceItem2";

function ReportsBackgroundInvoices() {
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
                    Invoice Reports
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
                      <Tab label="Detailed invoice Report" {...a11yProps(0)} />
                      <Tab label="Invoice Deleted report " {...a11yProps(1)} />
                    </Tabs>
                  </AccordionDetails>
                </Accordion>
              </Box>
              <Box sx={{ width: "80%" }}>
                <CustomTabPanel value={value} index={0}>
                  <InvoiceItem2 />
                </CustomTabPanel>
                <CustomTabPanel value={value} index={1}>
                  <InvoiceItem1 />
                </CustomTabPanel>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default ReportsBackgroundInvoices;
