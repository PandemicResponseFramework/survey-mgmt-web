import React, { useEffect } from 'react';
import { AppBar as MuiAppBar, Box, CssBaseline, Drawer, IconButton, List, ListItem, ListItemText, Toolbar, Typography, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MenuIcon from '@mui/icons-material/Menu';
import ExportData from './ExportData';
import ParticipantsImport from './ParticipantsImport';
import ParticipantsInvite from './ParticipantsInvite';
import SurveyComponent from './SurveyComponent';
import Axios from 'axios';
import { useSnackbar } from 'notistack';
import { drawerWidth } from './Styles';
import styled from '@emotion/styled';

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const BreadCrumb = styled(Typography)`
  display: inline-flex;
  align-items: center;
`;

const Loading = styled("div")`
  margin: auto;
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default function MainComponent() {

  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [appConfig, setAppConfig] = React.useState({
    prepared: false,
    initialized: false,
    authorized: false,
    appServerUrl: null,
    appName: 'Survey Management',
    appLogoUrl: null,
    appLogoMargin: 0,
    menuIndex: 0,
    menuOpen: false,
  })

  const menu = ['Survey Management', 'Invite Participants', 'Import Participants', 'Export Data'];
  const menuDisabled = [];

  const loadMetaData = () => {
    const metas = document.getElementsByTagName('meta');
    var appServerUrl, appName, appLogoUrl, appLogoMargin;

    for (let i = 0; i < metas.length; i++) {

      if (metas[i].getAttribute('name') === 'appServerUrl')
        appServerUrl = metas[i].getAttribute('content');

      if (metas[i].getAttribute('name') === 'appName')
        appName = metas[i].getAttribute('content');

      if (metas[i].getAttribute('name') === 'appLogoUrl')
        appLogoUrl = metas[i].getAttribute('content');

      if (metas[i].getAttribute('name') === 'appLogoMargin')
        appLogoMargin = parseInt(metas[i].getAttribute('content'));
    }

    setAppConfig({
      ...appConfig,
      prepared: true,
      appServerUrl: appServerUrl.replace(/\/$/, ""),
      appName: appName == null ? appConfig.appName : appName,
      appLogoUrl: appLogoUrl,
      appLogoMargin: appLogoMargin,
    });
  }

  const initApp = () => {
    document.title = appConfig.appName;
    Axios.defaults.baseURL = appConfig.appServerUrl;
    Axios.defaults.withCredentials = true;
    Axios.defaults.maxRedirects = 0;

    Axios.interceptors.response.use((response) => {
      return response;
    }, (error) => {

      if (error.response) {

        if (error.response.status === 401 || error.response.status === 403) {
          setAppConfig({
            ...appConfig,
            authorized: false,
            initialized: true,
          });
        } else if ((typeof error.response.data === 'string' || error.response.data instanceof String) && error.response.data.length > 0) {
          enqueueSnackbar(error.response.data, { variant: 'error' });
        } else {
          enqueueSnackbar(error.message, { variant: 'error' });
        }

        if (error.response.data && error.response.data.errors)
          console.error(error.response.data.errors);

      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }

      return Promise.reject(error);
    });

    Axios.get('/user').then(function (response) {

      setAppConfig({
        ...appConfig,
        authorized: true,
        initialized: true,
        menuOpen: true,
      });
    }).catch(function (error) {
      // do nothing
      console.log(error);
    });
  }

  useEffect(() => {

    if (!appConfig.prepared) {
      loadMetaData();
    } else {
      initApp();
    }

  }, [appConfig.prepared]);

  const handleDrawerOpen = () => {
    setAppConfig({ ...appConfig, menuOpen: true });
  };

  const handleDrawerClose = () => {
    setAppConfig({ ...appConfig, menuOpen: false });
  };

  const handleMenuSelection = (index) => {
    setAppConfig({ ...appConfig, menuIndex: index });
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={appConfig.menuOpen}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...((appConfig.menuOpen || !appConfig.authorized) && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <IconButton
            onClick={handleDrawerClose}
            sx={{ mr: 2, ...(!(appConfig.menuOpen && appConfig.authorized) && { display: 'none' }) }}
          >
            {theme.direction === 'ltr' ? <ChevronLeftIcon sx={{ color: 'white' }} /> : <ChevronRightIcon sx={{ color: 'white' }} />}
          </IconButton>
          <BreadCrumb variant="h6" noWrap>
            {appConfig.initialized && appConfig.appName}
            {appConfig.authorized && appConfig.menuIndex != null &&
              <ArrowRightIcon />
            }
            {appConfig.authorized && appConfig.menuIndex != null &&
              menu[appConfig.menuIndex]
            }
          </BreadCrumb>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={appConfig.menuOpen}
      >
        {appConfig.appLogoUrl != null &&
          <img src={appConfig.appLogoUrl} width={drawerWidth - appConfig.appLogoMargin} alt="Logo" style={{ marginBottom: appConfig.appLogoMargin }} />
        }
        <List>
          {menu.map((text, index) => (
            <ListItem
              button
              key={text}
              onClick={() => handleMenuSelection(index)}
              selected={index === appConfig.menuIndex}
              disabled={menuDisabled.includes(index)}>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Main open={appConfig.menuOpen}>
        <DrawerHeader />
        {!appConfig.initialized &&
          <Loading>
            <CircularProgress />
          </Loading>
        }

        {appConfig.initialized && !appConfig.authorized &&
          <div>You are not authorized to use the application.</div>
        }

        {appConfig.authorized && appConfig.menuIndex === 0 &&
          <SurveyComponent />
        }
        {appConfig.authorized && appConfig.menuIndex === 1 &&
          <ParticipantsInvite />
        }
        {appConfig.authorized && appConfig.menuIndex === 2 &&
          <ParticipantsImport />
        }
        {appConfig.authorized && appConfig.menuIndex === 3 &&
          <ExportData />
        }
      </Main>
    </Box>
  );
}
