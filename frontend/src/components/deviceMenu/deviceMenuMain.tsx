import {
  AppBar,
  Box,
  Grid,
  Stack,
  Toolbar,
  Typography,
  capitalize,
} from "@mui/material";
import Filters from "./filters";
import DevicesTable from "./devicesTable";
import DeviceModal from "./deviceModal";
import { useTranslation } from "react-i18next";

const DeviceMenu = () => {
  const { t } = useTranslation();

  return (
    <Stack direction="column" spacing={3}>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" color="transparent">
          <Toolbar variant="dense">
            <Grid container>
              <Typography variant="h6" component="div" sx={{ mr: 1 }}>
                {`${capitalize(t("main.my_devices"))}`}
              </Typography>
            </Grid>
            <DeviceModal />
          </Toolbar>
        </AppBar>
      </Box>
      <Stack spacing={2} justifyContent="center">
        <Filters />
        <Typography variant="h4" color="#000000" component="div">
          { capitalize(t("devices.stock")) }
        </Typography>
        <DevicesTable />
        <Grid container justifyContent="center" alignItems="center">
          <Grid
            item
            justifyContent="center"
            height={400}
            width={1000}
            spacing={1}
            style={{ backgroundColor: "#D9D9D9" }}
          >
            {/* Image du projet ou dropzone */}
            <Typography variant="subtitle1">
              {`${capitalize(t("devices.map_missing"))}`}
            </Typography>
          </Grid>
        </Grid>
      </Stack>
    </Stack>
  );
};
export default DeviceMenu;
