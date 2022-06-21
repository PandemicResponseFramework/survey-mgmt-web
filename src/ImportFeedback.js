import { Box, Fade, LinearProgress, Typography, Pagination, Stack, Divider, Paper, TableContainer, Table, TableRow, TableHead, TableBody, TableCell } from '@mui/material';
import React, { Fragment, useEffect } from 'react';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import { styled } from '@mui/material/styles';
import { Root, Fader, Pager } from './Styles';

const EmptyResult = styled("div")`
  width: 100%;
  text-align: center;
  margin-top: 20px;
`;

export default function ImportFeedback(props) {

  const { importFeedback } = props;
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  useEffect(() => {
    setPage(1);
  }, [importFeedback.importId]);

  const handleChange = (event, value) => {
    setPage(value);
  };

  return (
    <Root>
      <Stack direction="row" spacing={3} divider={<Divider orientation="vertical" flexItem />}>
        <Stack direction="row" spacing={1}>
          <CheckCircleOutlineIcon color="success" />
          <Typography variant="body1">Success ({importFeedback == null ? 0 : importFeedback.countSuccess})</Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <DoubleArrowIcon color="warning" />
          <Typography variant="body1">Skipped ({importFeedback == null ? 0 : importFeedback.countSkipped})</Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <ErrorOutlineIcon color="error" />
          <Typography variant="body1">Failed ({importFeedback == null ? 0 : importFeedback.countFailed})</Typography>
        </Stack>
      </Stack>

      <Fader in={importFeedback.delay != null}>
        <LinearProgress />
      </Fader>

      {importFeedback.entries.length !== 0 &&
        <Fragment>
          <Pager
            count={Math.ceil(importFeedback.entries.length / rowsPerPage)}
            page={page}
            onChange={handleChange}
            color="primary"
            showFirstButton showLastButton
          />
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} size="small">
              <TableHead>
                <TableRow>
                  <TableCell>E-Mail</TableCell>
                  <TableCell>State</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {importFeedback.entries.slice((page - 1) * rowsPerPage, Math.min((page) * rowsPerPage, importFeedback.entries.length)).map((entry) => (
                  <TableRow
                    key={entry.email}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">{entry.email}</TableCell>
                    <TableCell>
                      {entry.state === 'ERROR'
                        ? <Box color="error.main" style={{ fontWeight: 'bold' }}>{entry.state}</Box>
                        : <Box color="success.main" style={{ fontWeight: 'bold' }}>{entry.state}</Box>
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Fragment>
      }

      {importFeedback.entries.length === 0 &&
        <EmptyResult>No result to display.</EmptyResult>
      }
    </Root>
  );
}