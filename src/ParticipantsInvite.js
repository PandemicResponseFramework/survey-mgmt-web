import { Box, Button, Fab, Tooltip, Fade, Grid, LinearProgress, TextField, InputAdornment, Pagination, Paper, TableContainer, Table, TableRow, TableHead, TableBody, TableCell } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import RefreshIcon from '@mui/icons-material/Refresh';
import EmailIcon from '@mui/icons-material/Email';
import SearchIcon from '@mui/icons-material/Search';
import Axios from 'axios';
import React, { useEffect } from 'react';
import { binaryFind, insert, useInterval } from './Utils';
import { styled } from '@mui/material/styles';

const Root = styled("div")`
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: space-between;
`;
const MainGrid = styled(Grid)`
  '& > div': {
    display: 'flex',
    alignItems: 'flex-end'
  }
`;
const Fader = styled(Fade)`
  margin-top: 10px;
`;
const TableButton = styled(Fab)`
  margin: 0;
  padding: 0;
  box-shadow: none;
`;
const TableGrid = styled(Grid)`
  & .MuiGrid-item {
    padding-top: 0;
    margin-top: 0;
    margin-bottom: 0;
    padding-left: 2px;
    padding-right: 10px;
  };
  margin: 0;
`;
const Overview = styled("div")`
  display: flex;
  flex-direction: column;
  margin-top: 50px;
`;
const GrowingTextField = styled(TextField)`
  flex-grow: 1;
  width: 100%;
`;
const GrowingButton = styled(Button)`
  flex-grow: 1;
  width: 100%;
`;
const Pager = styled(Pagination)`
  display: flex;
  justify-content: center;
  margin-top: 10px;
  margin-bottom: 10px;
`;

export default function InviteParticipants() {

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

  const data = loadingState.searchData == null ? loadingState.data : loadingState.searchData;
  const countPages = Math.ceil(data.length / rowsPerPage);

  return (
    <Root>
      <div>
        <Grid container spacing={2}>
          <Grid item xs={9}>
            <GrowingTextField
              label="Type the email address of the participant to invite"
              value={email}
              onChange={onChangeEmail}
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
            <GrowingButton
              variant="contained"
              color="primary"
              disabled={!(patternEmailSimple.test(email) && email.length <= 256)}
              startIcon={<PersonAddIcon />}
              onClick={() => onStartInvite(email)}>
              Invite
          </GrowingButton>
          </Grid>
          <Grid item xs={9}>
            <GrowingTextField
              label="Search for email address"
              value={loadingState.searchFor}
              onChange={onChangeSearchFor}
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
            <GrowingButton
              variant="contained"
              color="primary"
              disabled={loadingState.delay != null}
              startIcon={<RefreshIcon />}
              onClick={onRefresh}>
              Refresh
          </GrowingButton>
          </Grid>
        </Grid>
      </div>

      <Overview>

        <Fader in={loadingState.delay != null}>
          <LinearProgress />
        </Fader>

        <div>
          <Pager
            count={countPages}
            page={page}
            onChange={onPageChange}
            color="primary"
            showFirstButton showLastButton
          />

          <TableContainer component={Paper}>
            <Table stickyHeader sx={{ minWidth: 650 }} size="small">
              <TableHead>
                <TableRow>
                  <TableCell>E-Mail</TableCell>
                  <TableCell>State</TableCell>
                  <TableCell>Confirmation Token</TableCell>
                  <TableCell style={{width: 120}}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.slice((page - 1) * rowsPerPage, Math.min((page) * rowsPerPage, data.length)).map((data) => (
                  <TableRow
                    key={data.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">{data.email}</TableCell>
                    <TableCell>
                      {data.state !== 'VERIFIED'
                        ? <Box color="error.main" style={{ fontWeight: 'bold' }}>{data.state}</Box>
                        : <Box color="success.main" style={{ fontWeight: 'bold' }}>{data.state}</Box>
                      }
                    </TableCell>
                    <TableCell>
                      <GrowingTextField
                        variant="outlined"
                        disabled={loadingState.delay != null}
                        placeholder="Enter Token"
                        onChange={(event) => onChangeConfirmationToken(event, data.email)}
                        value={confirmationTokens[data.email]}
                      />
                    </TableCell>
                    <TableCell>
                      <TableGrid container spacing={1}>
                        <Grid item xs={6}>
                          <Tooltip title="Re-Invite Participant">
                            <TableButton 
                              size="small" 
                              color="primary"
                              disabled={false} 
                              aria-label="new-release" 
                              onClick={() => onStartInvite(data.email, true)}>
                              <PersonAddIcon />
                            </TableButton>
                          </Tooltip>
                        </Grid>
                        <Grid item xs={6}>
                          <Tooltip title="Delete Participant">
                            <TableButton 
                              size="small" 
                              color="error" 
                              disabled={false} 
                              aria-label="new-release" 
                              onClick={() => onDelete(data.email)}>
                              <DeleteIcon />
                            </TableButton>
                          </Tooltip>
                        </Grid>
                      </TableGrid>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </Overview>
    </Root>
  );
}