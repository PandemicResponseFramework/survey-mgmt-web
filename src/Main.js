import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import MenuIcon from '@material-ui/icons/Menu';
import clsx from 'clsx';
import React, { useEffect } from 'react';
import ExportData from './ExportData';
import ParticipantsImport from './ParticipantsImport';
import ParticipantsInvite from './ParticipantsInvite';
import SurveyComponent from './SurveyComponent';
import { CircularProgress } from '@material-ui/core';
import Axios from 'axios';
import { useSnackbar } from 'notistack';
import 'react-sortable-tree/style.css'; // This only needs to be imported once in your app

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  breadcrumb: {
    display: 'inline-flex',
    alignItems: 'center'
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  loading: {
    margin: 'auto',
    width: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

export default function Main() {

  const classes = useStyles();
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
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        id="header"
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: appConfig.menuOpen,
        })}
      >
        <Toolbar >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, (appConfig.menuOpen || !appConfig.authorized) && classes.hide)}
          >
            <MenuIcon />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={handleDrawerClose}
            className={clsx(classes.menuButton, !(appConfig.menuOpen && appConfig.authorized) && classes.hide)}
          >
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
          <Typography variant="h6" noWrap className={classes.breadcrumb}>
            {appConfig.initialized && appConfig.appName}
            {appConfig.authorized && appConfig.menuIndex != null &&
              <ArrowRightIcon />
            }
            {appConfig.authorized && appConfig.menuIndex != null &&
              menu[appConfig.menuIndex]
            }
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={appConfig.menuOpen}
        classes={{
          paper: classes.drawerPaper,
        }}
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

      <main
        className={clsx(classes.content, {
          [classes.contentShift]: appConfig.menuOpen,
        })}
      >
        <div className={classes.drawerHeader} />

        {!appConfig.initialized &&
          <div className={classes.loading}>
            <CircularProgress />
          </div>
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
      </main>
    </div>
  );
}
