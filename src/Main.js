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
}));

export default function Main() {

  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);
  const [ready, setReady] = React.useState(false);
  const [appName, setAppName] = React.useState('Survey Management');
  const [appLogoUrl, setAppLogoUrl] = React.useState(null);
  const [appLogoMargin, setAppLogoMargin] = React.useState(0);
  const [menuIndex, setMenuIndex] = React.useState(2);

  const menu = ['Survey Management', 'Invite Participants', 'Import Participants', 'Export Data'];
  const menuDisabled = [0];

  useEffect(() => {
    const metas = document.getElementsByTagName('meta');

    for (let i = 0; i < metas.length; i++) {

      if (metas[i].getAttribute('name') === 'appServerUrl') {
        const appServerUrl = metas[i].getAttribute('content');
        if (appServerUrl != null) {
          localStorage.setItem('appServerUrl', appServerUrl);
          setReady(true);
        }
      }

      if (metas[i].getAttribute('name') === 'appName') {
        const appName = metas[i].getAttribute('content');
        if (appName != null)
          setAppName(appName);
        document.title = appName;
      }

      if (metas[i].getAttribute('name') === 'appLogoUrl') {
        const appLogoUrl = metas[i].getAttribute('content');
        if (appLogoUrl != null)
          setAppLogoUrl(appLogoUrl);
      }

      if (metas[i].getAttribute('name') === 'appLogoMargin') {
        const appLogoMargin = metas[i].getAttribute('content');
        if (appLogoMargin != null)
          setAppLogoMargin(appLogoMargin);
      }
    }
  }, []);

  const handleDrawerOpen = () => {
    if (ready)
      setOpen(true);
  };

  const handleDrawerClose = () => {
    if (ready)
      setOpen(false);
  };

  const getMarginTopStyle = () => {
    return {
      marginTop: appLogoMargin,
    }
  };

  const handleMenuSelection = (index) => {
    setMenuIndex(index);
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, (open || !ready) && classes.hide)}
          >
            <MenuIcon />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={handleDrawerClose}
            className={clsx(classes.menuButton, !(open || !ready) && classes.hide)}
          >
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
          <Typography variant="h6" noWrap className={classes.breadcrumb}>
            {appName}
            {menuIndex != null &&
              <ArrowRightIcon />
            }
            {menuIndex != null &&
              menu[menuIndex]
            }
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        {appLogoUrl != null &&
          <img src={appLogoUrl} width={drawerWidth - appLogoMargin} alt="Logo" />
        }

        <List style={getMarginTopStyle()}>
          {menu.map((text, index) => (
            <ListItem
              button
              key={text}
              onClick={() => handleMenuSelection(index)}
              selected={index === menuIndex}
              disabled={menuDisabled.includes(index)}>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      <main
        className={clsx(classes.content, {
          [classes.contentShift]: open,
        })}
      >
        <div className={classes.drawerHeader} />
        {!ready && <Typography paragraph>Missing meta information!</Typography>}
        {ready && menuIndex === 1 &&
          <ParticipantsInvite />
        }
        {ready && menuIndex === 2 &&
          <ParticipantsImport />
        }
        {ready && menuIndex === 3 &&
          <ExportData />
        }
      </main>
    </div>
  );
}
