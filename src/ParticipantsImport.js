import { Button, FormControl, Grid, InputLabel, MenuItem, Select, Stack } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import Axios from 'axios';
import React, { useCallback } from 'react';
import ExcelFileDropZone from './ExcelFileDropZone';
import ImportFeedback from './ImportFeedback';
import { useInterval } from './Utils';
import { useSnackbar } from 'notistack';
import { Root } from './Styles';

export default function ParticipantsImport() {

    const { enqueueSnackbar } = useSnackbar();
    const [fileUploadState, setFileUploadState] = React.useState(null);
    const [importFeedback, setImportFeedback] = React.useState({
        delay: null,
    });

    const onFileSelectionFeedback = useCallback(feedback => {
        if (feedback.headers == null) {
            enqueueSnackbar("Invalid file selected.", { variant: 'error' });
        }

        setFileUploadState({
            ...fileUploadState,
            file: feedback.file,
            headers: feedback.headers,
            selectedHeader: -1,
        });
    });

    const onHeaderSelection = useCallback(event => {
        setFileUploadState({
            ...fileUploadState,
            selectedHeader: event.target.value,
        });
    });

    const onStartImport = () => {

        const config = { headers: { 'Content-Type': 'multipart/form-data' } };
        let fd = new FormData();
        fd.append('file', fileUploadState.file);
        fd.append('headerIndex', fileUploadState.selectedHeader);

        Axios.post('/manage/participant/import', fd, config)
            .then(function (response) {
                setImportFeedback({
                    importId: response.data.token,
                    countSuccess: 0,
                    countFailed: 0,
                    countSkipped: 0,
                    startIndex: 0,
                    status: null,
                    entries: [],
                    delay: 1000,
                    cancelled: false,
                });
            });
    };

    const onStopImport = () => {

        Axios.post('/manage/participant/import/' + importFeedback.importId, null, {
            params: {
                cancel: true,
            }
        }).then(response => {
            setImportFeedback({
                ...importFeedback,
                cancelled: true,
            })
        });
    }

    const buttonDisabled = fileUploadState == null
        || fileUploadState.headers == null
        || fileUploadState.selectedHeader == null
        || fileUploadState.selectedHeader === -1
        || importFeedback.cancelled;

    useInterval(() => {

        Axios.get('/manage/participant/import/' + importFeedback.importId, {
            params: {
                startIndex: importFeedback.startIndex,
                limit: 500,
            }
        }).then(function (response) {
            setImportFeedback({
                ...importFeedback,
                countSuccess: response.data.countSuccess,
                countFailed: response.data.countFailed,
                countSkipped: response.data.countSkipped,
                startIndex: importFeedback.startIndex + response.data.entries.length,
                status: response.data.status,
                entries: importFeedback.entries.concat(response.data.entries),
                delay: (response.data.status === 'DONE' || response.data.status === 'CANCELLED') && response.data.entries.length === 0
                    ? null : importFeedback.delay,
            });
        }).catch(function (error) {
            console.log(error);
            setImportFeedback({
                ...importFeedback,
                delay: null,
            });
        });
    }, importFeedback == null ? null : importFeedback.delay);

    return (
        <Root>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <ExcelFileDropZone callback={onFileSelectionFeedback} />
                </Grid>
                <Grid item xs={12}>
                    <Stack direction="row" justifyContent="space-between">
                        <FormControl>
                            <InputLabel /* shrink */ id="select-column-label">Column</InputLabel>
                            <Select
                                labelId="select-column-label"
                                label="Column"
                                multiple={false}
                                contentEditable={false}
                                value={fileUploadState == null ? -1 : fileUploadState.selectedHeader}
                                disabled={fileUploadState == null || fileUploadState.headers == null}
                                onChange={onHeaderSelection}
                                style={{ minWidth: 180 }}
                            >
                                <MenuItem key={-1} value={-1} disabled><em>Choose column</em></MenuItem>
                                {fileUploadState != null && fileUploadState.headers != null && fileUploadState.headers.map((header, index) =>
                                    <MenuItem key={index} value={index}>{header}</MenuItem>
                                )}
                            </Select>
                        </FormControl>

                        <Button
                            variant="contained"
                            color="primary"
                            disabled={buttonDisabled}
                            startIcon={importFeedback.delay == null ? <PlayArrowIcon /> : <StopIcon />}
                            onClick={importFeedback.delay == null ? onStartImport : onStopImport}
                            style={{ minWidth: 180 }}>
                            {importFeedback.delay == null ? 'Start' : 'Stop'}
                        </Button>
                    </Stack>
                </Grid>
                {importFeedback.importId != null &&
                    <Grid item xs={12}><ImportFeedback importFeedback={importFeedback} /></Grid>
                }
            </Grid>
        </Root>
    );
}