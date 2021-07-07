import DataBrowser, { getObjectPropertyByString } from '@alekna/react-data-browser';
import { Box, Button, Fade, Grid, LinearProgress, TextField, InputAdornment } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import RefreshIcon from '@material-ui/icons/Refresh';
import EmailIcon from '@material-ui/icons/Email';
import SearchIcon from '@material-ui/icons/Search';
import Pagination from '@material-ui/lab/Pagination';
import Axios from 'axios';
import clsx from 'clsx';
import React, { useEffect } from 'react';
import { binaryFind, insert, useInterval } from './Utils';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    justifyContent: 'space-between',
  },
  loading: {
    marginTop: 10,
  },
  container: {
    '& > div': {
      display: 'flex',
      alignItems: 'flex-end'
    }
  },
  textField: {
    flexGrow: 1,
  },
  tableTextField: {
    margin: 0,
  },
  button: {
    flexGrow: 1,
  },
  overview: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 50,
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 10,
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'none',
    width: '100%',
  },
  head: {
    display: 'flex',
    flex: '0 0 auto',
    height: 46,
    color: 'black',
    borderBottom: '1px solid #ccc',
    padding: '0 5px',
  },
  head_row: {
    display: 'flex',
    flex: '1 1 auto',
    textTransform: 'uppercase',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  head_row_item: {
    display: 'flex',
    textTransform: 'uppercase',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    overflowX: 'auto',
    padding: '0 5px',
  },
  body_row: {
    display: 'flex',
    flex: '0 0 auto',
    borderBottom: '1px solid #eee',
  },
  body_row_item: {
    display: 'flex',
    height: 46,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '0 10px',
    fontSize: '14px',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  }
}));

export default function InviteParticipants() {

  const classes = useStyles();
  const patternEmailSimple = /^\S+[@]\S+[.]\S+$/i;

  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [page, setPage] = React.useState(1);
  const [email, setEmail] = React.useState("");
  const [confirmationTokens, setConfirmationTokens] = React.useState({});

  const limit = 1000;

  const [loadingState, setLoadingState] = React.useState({
    timestamp: Date.now(),
    data: [],
    startIndex: 0,
    searchData: null,
    searchFor: "",
    delay: 500,
  });

  const onChangeEmail = (event) => {
    setEmail(event.target.value);
  }

  const onChangeConfirmationToken = (event, email) => {
    setConfirmationTokens({
      ...confirmationTokens, 
      [email]: event.target.value,
    });
  }

  const onStartInvite = (email, isReinvitation) => {

    const data = {email: email};
    if (isReinvitation && confirmationTokens[email])
      data.confirmationToken = confirmationTokens[email];

    Axios.post("/manage/participant/invite", data).then(response => {

      if (response.data.feedback === 'SKIPPED')
        return;

      const res = binaryFind(email, loadingState.data);

      setLoadingState({
        ...loadingState,
        data: res.found ? loadingState.data : insert(res.index - 1, {
          email: email,
          state: response.data.feedback,
        }, loadingState.data),
      });
    }).catch(function (error) {
    // ignore
    });
  };

  const onDelete = (email) => {
    Axios.delete("/manage/participant?email=" + encodeURIComponent(email))
    .then(response => {
      setLoadingState({
        ...loadingState,
        data: [],
        startIndex: 0,
        delay: 500,
      });
    }).catch(function (error) {
    // ignore
    });
  }

  const onChangeSearchFor = (event) => {
    setLoadingState({
      ...loadingState,
      searchData: event.target.value === "" ? null : loadingState.data.filter(entry => entry.email.includes(event.target.value)),
      searchFor: event.target.value,
    });
  };

  const onRefresh = () => {
    setLoadingState({
      ...loadingState,
      timestamp: Date.now(),
      data: [],
      startIndex: 0,
      delay: 500,
    });
  };

  const onPageChange = (event, value) => {
    setPage(value);
  };

  useInterval(() => {

    Axios.get('/manage/participant', {
      params: {
        maxTimestamp: Date.now(),
        startIndex: loadingState.startIndex,
        limit: limit,
      }
    }).then(function (response) {
      setLoadingState({
        ...loadingState,
        startIndex: loadingState.startIndex + response.data.length,
        data: loadingState.data.concat(response.data),
        delay: response.data.length < limit ? null : loadingState.delay,
      });
    }).catch(function (error) {
      if (loadingState) {
        setLoadingState({
          ...loadingState,
          delay: null,
        });
      }
    });
  }, loadingState == null ? null : loadingState.delay);

  useEffect(() => {

    return function cleanup() {
      setLoadingState({
        ...loadingState,
        delay: null,
      })
    };
  }, []);

  const columns = [
    { label: 'email', sortField: 'email', isLocked: true },
    { label: 'state', sortField: 'state', isLocked: true },
    { label: 'confirmation token', sortField: 'confirmation', isLocked: true },
    { label: 'actions', sortField: 'actions', isLocked: true },
  ];

  const data = loadingState.searchData == null ? loadingState.data : loadingState.searchData;
  const countPages = Math.ceil(data.length / rowsPerPage);

  function fieldReducer(fieldValue, fieldName, row) {
    switch (fieldName) {
      case 'state':
        return (
          fieldValue === 'ERROR'
            ? <Box color="error.main" style={{ fontWeight: 'bold' }}>{fieldValue}</Box>
            : <Box color="success.main" style={{ fontWeight: 'bold' }}>{fieldValue}</Box>
        );
      case 'actions':
        return (
          <Grid container spacing={1} className={classes.container}>
            <Grid item xs>
              <Button
                variant="contained"
                color="primary"
                disabled={false}
                startIcon={<PersonAddIcon />}
                className={classes.button}
                onClick={() => onStartInvite(row.email, true)}>
                Resend
            </Button>
            </Grid>
            <Grid item xs>
              <Button
                variant="contained"
                color="secondary"
                disabled={false}
                startIcon={<DeleteIcon />}
                className={classes.button}
                onClick={() => onDelete(row.email)}>
                Delete
            </Button>
            </Grid>
          </Grid>
        );
      case 'confirmation':
        return (
          <TextField
            variant="outlined"
            className={clsx(classes.textField, classes.tableTextField)}
            disabled={loadingState.delay != null}
            placeholder="Enter Token"
            onChange={(event) => onChangeConfirmationToken(event, row.email)}
            value={confirmationTokens[row.email]}
          />
        );
      default:
        return fieldValue;
    }
  }

  return (
    <div className={classes.root}>
      <div>
        <Grid container spacing={3} className={classes.container}>
          <Grid item xs={9}>
            <TextField
              label="Type the email address of the participant to invite"
              value={email}
              onChange={onChangeEmail}
              className={classes.textField}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={3}>
            <Button
              variant="contained"
              color="primary"
              disabled={!(patternEmailSimple.test(email) && email.length <= 256)}
              startIcon={<PersonAddIcon />}
              className={classes.button}
              onClick={() => onStartInvite(email)}>
              Invite
          </Button>
          </Grid>
        </Grid>
        <Grid container spacing={3} className={classes.container}>
          <Grid item xs={9}>
            <TextField
              label="Search for email address"
              value={loadingState.searchFor}
              onChange={onChangeSearchFor}
              className={classes.textField}
              disabled={loadingState.delay != null}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={3}>
            <Button
              variant="contained"
              color="primary"
              disabled={loadingState.delay != null}
              startIcon={<RefreshIcon />}
              className={classes.button}
              onClick={onRefresh}>
              Refresh
          </Button>
          </Grid>
        </Grid>
      </div>

      <div className={classes.overview}>

        <Fade in={loadingState.delay != null} className={classes.loading}>
          <LinearProgress />
        </Fade>

        <div className={classes.tableContainer}>
          <Pagination
            count={countPages}
            page={page}
            onChange={onPageChange}
            className={classes.pagination}
            color="primary"
            showFirstButton showLastButton
          />
          <DataBrowser
            initialColumnFlex={['0 0 35%', '0 0 10%', '0 0 25%', '0 0 30%']}
            columns={columns}
          >
            {
              ({ columnFlex, visibleColumns }) => (
                <div className={classes.table}>
                  <div className={classes.head}>
                    <div className={classes.head_row}>
                      {visibleColumns.map((cell, index) => (
                        <div
                          key={index}
                          className={classes.head_row_item}
                          style={{ flex: columnFlex[index] }}
                        >
                          {cell.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={classes.body}>
                    {data.slice((page - 1) * rowsPerPage, Math.min((page) * rowsPerPage, data.length)).map((row, key) => (
                      <div key={key} className={classes.body_row}>
                        {visibleColumns.map(({ label, sortField }, index) => (
                          <div
                            key={sortField}
                            className={classes.body_row_item}
                            style={{ flex: columnFlex[index] }}
                          >
                            {
                              fieldReducer(getObjectPropertyByString(row, sortField), sortField, row)
                            }
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )
            }
          </DataBrowser>
        </div>
      </div>
    </div>
  );
}