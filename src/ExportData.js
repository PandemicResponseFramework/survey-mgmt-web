import DateFnsUtils from '@date-io/date-fns';
import { Button, TextField, Stack } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import GetAppIcon from '@mui/icons-material/GetApp';
import { DateTimePicker } from '@mui/x-date-pickers';
import Axios from 'axios';
import FileDownload from 'js-file-download';
import React from 'react';

const useStyles = makeStyles()((theme) => ({
  root: {
    width: '60%',
  },
}));

export default function ExportData() {

  const { classes } = useStyles();
  const [interval, setInterval] = React.useState({
    start: Date.now(),
    end: Date.now(),
    valid: true,
  });

  const onStartChange = (date) => {
    setInterval({ ...interval, start: date.getTime(), valid: date.getTime() < interval.end });
  };

  const onEndChange = (date) => {
    setInterval({ ...interval, end: date.getTime(), valid: interval.start < date.getTime() });
  };

  const onStartExport = () => {
    Axios.get("/manage/export", {
      params: {
        from: interval.start,
        to: interval.end,
      },
      responseType: 'blob',
    }).then(response => {
      const date = new Date(Date.now());
      const timestamp = new DateFnsUtils().format(date, "yyyy-MM-dd-HHmm");
      FileDownload(response.data, 'export_' + timestamp + '.xlsx')
    });
  };

  return (
    <Stack spacing={2} className={classes.root}>
      <DateTimePicker
        label="From"
        value={interval.start}
        onChange={onStartChange}
        renderInput={(params) => <TextField {...params} />}
      />
      <DateTimePicker
        label="To"
        value={interval.end}
        minDateTime={interval.start}
        onChange={onEndChange}
        renderInput={(params) => <TextField {...params} error={!interval.valid} helperText={interval.valid ? null : "Selected end date/time must be after the selected start date/time"}/>}
      />
      <Button
        variant="contained"
        color="primary"
        disabled={!interval.valid}
        startIcon={<GetAppIcon />}
        className={classes.button}
        onClick={onStartExport}>
        Export
      </Button>
    </Stack>
  );
}