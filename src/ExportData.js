import { DateTime } from 'luxon';
import { Button, TextField, Stack } from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import { DateTimePicker } from '@mui/x-date-pickers';
import Axios from 'axios';
import FileDownload from 'js-file-download';
import React from 'react';
import { useSnackbar } from 'notistack';

export default function ExportData() {

  const { enqueueSnackbar } = useSnackbar();
  const now = DateTime.now();
  const [interval, setInterval] = React.useState({
    start: now,
    end: now,
    valid: false,
  });

  const onStartChange = (date) => {
    setInterval({ ...interval, start: date, valid: date < interval.end });
  };

  const onEndChange = (date) => {
    setInterval({ ...interval, end: date, valid: interval.start < date });
  };

  const onStartExport = () => {
    Axios.get("/manage/export", {
      params: {
        from: interval.start.ts,
        to: interval.end.ts,
      },
      responseType: 'blob',
    }).then(response => {
      const timestamp = DateTime.now().toFormat("yyyy-MM-dd-HHmm");
      FileDownload(response.data, 'export_' + timestamp + '.xlsx')
    }).catch(function (error) {
      console.log(error);
      enqueueSnackbar(error.message, { variant: 'error' });
    });
  };

  return (
    <Stack spacing={2} style={{ width: '60%' }}>
      <DateTimePicker
        label="From"
        value={interval.start}
        inputFormat="ccc, LLL dd, yyyy HH:mm a ZZZZ"
        onChange={onStartChange}
        renderInput={(params) => <TextField {...params} />}
      />
      <DateTimePicker
        label="To"
        value={interval.end}
        inputFormat="ccc, LLL dd, yyyy HH:mm a ZZZZ"
        minDateTime={interval.start}
        onChange={onEndChange}
        error={!interval.valid}
        renderInput={(params) =>
          <TextField {...params}
            error={!interval.valid}
            helperText={interval.valid ? null : "Selected end date/time must be after the selected start date/time"} />
        }
      />
      <Button
        variant="contained"
        color="primary"
        disabled={!interval.valid}
        startIcon={<GetAppIcon />}
        onClick={onStartExport}>
        Export
      </Button>
    </Stack>
  );
}