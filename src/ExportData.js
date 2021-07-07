import DateFnsUtils from '@date-io/date-fns';
import { Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import GetAppIcon from '@material-ui/icons/GetApp';
import { KeyboardDateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import Axios from 'axios';
import FileDownload from 'js-file-download';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    width: '60%',
    flexDirection: 'column',
  },
  button: {
    marginTop: 10,
  },
}));

export default function ExportData() {

  const classes = useStyles();
  const [interval, setInterval] = React.useState({
    start: Date.now(),
    end: Date.now(),
  });

  const onStartChange = (date) => {
    setInterval({ ...interval, start: date.getTime() });
  };

  const onEndChange = (date) => {
    setInterval({ ...interval, end: date.getTime() });
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
    <div className={classes.root}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDateTimePicker
          margin="normal"
          id="interval-start-dialog"
          label="From"
          format="dd-MM-yyyy HH:mm"
          value={interval.start}
          maxDate={interval.end}
          onChange={onStartChange}
          KeyboardButtonProps={{
            'aria-label': 'change date',
          }} />
      </MuiPickersUtilsProvider>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDateTimePicker
          margin="normal"
          id="interval-end-dialog"
          label="To"
          format="dd-MM-yyyy HH:mm"
          value={interval.end}
          minDate={interval.start}
          onChange={onEndChange}
          KeyboardButtonProps={{
            'aria-label': 'change date',
          }} />
      </MuiPickersUtilsProvider>
      <Button
        variant="contained"
        color="primary"
        disabled={interval.start >= interval.end}
        startIcon={<GetAppIcon />}
        className={classes.button}
        onClick={onStartExport}>
        Export
      </Button>
    </div>
  );
}