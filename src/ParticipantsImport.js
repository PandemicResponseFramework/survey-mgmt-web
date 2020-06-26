import { Button, FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';
import Axios from 'axios';
import React, { useCallback } from 'react';
import ExcelFileDropZone from './ExcelFileDropZone';
import ImportFeedback from './ImportFeedback';
import { useInterval } from './Utils';

const useStyles = makeStyles((theme) => ({

    root: {
        display: 'flex',
        flexDirection: "column",
        width: "100%",
    },
    actionContainer: {
        display: 'flex',
        marginTop: 10,
        justifyContent: 'space-between',
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 250,
    },
    button: {
        margin: theme.spacing(1),
    },
    feedbackContainer: {
        width: '100%',
        marginTop: 10,
    },
}));

export default function ParticipantsImport() {

    const classes = useStyles();
    const axios = Axios.create({
        baseURL: localStorage.getItem('appServerUrl'),
        withCredentials: true
    });
    const [fileUploadState, setFileUploadState] = React.useState(null);
    const [importFeedback, setImportFeedback] = React.useState(null);

    const onFileSelectionFeedback = useCallback(feedback => {
        setFileUploadState({
            'file': feedback.file,
            'headers': feedback.headers,
            'selectedHeader': -1,
        });
    });

    const onHeaderSelection = useCallback(event => {
        setFileUploadState({
            'file': fileUploadState.file,
            'headers': fileUploadState.headers,
            'selectedHeader': event.target.value,
        });
    });

    const onStartImport = () => {

        const config = { headers: { 'Content-Type': 'multipart/form-data' } };
        let fd = new FormData();
        fd.append('file', fileUploadState.file);
        fd.append('headerIndex', fileUploadState.selectedHeader);

        axios.post('/manage/participant/import', fd, config)
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
                });
            })
            .catch(function (error) {
                console.log(error);
            });
    };

    const onStopImport = () => {

        axios.post('/manage/participant/import/' + importFeedback.importId, null, {
            params: {
                cancel: true,
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    useInterval(() => {

        axios.get('/manage/participant/import/' + importFeedback.importId, {
            params: {
                startIndex: importFeedback.startIndex,
                limit: 500,
            }
        }).then(function (response) {
            setImportFeedback({
                importId: importFeedback.importId,
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
                importId: importFeedback.importId,
                countSuccess: importFeedback.countSuccess,
                countFailed: importFeedback.countFailed,
                countSkipped: importFeedback.countSkipped,
                startIndex: importFeedback.startIndex,
                status: importFeedback.status,
                entries: importFeedback.entries,
                delay: null,
            });
        });
    }, importFeedback == null ? null : importFeedback.delay);

    return (
        <div className={classes.root}>
            <ExcelFileDropZone callback={onFileSelectionFeedback} />

            <div className={classes.actionContainer}>
                <FormControl className={classes.formControl}>
                    <InputLabel shrink id="select-column-label">Column</InputLabel>
                    <Select
                        labelId="select-column-label"
                        multiple={false}
                        contentEditable={false}
                        value={fileUploadState == null ? -1 : fileUploadState.selectedHeader}
                        disabled={fileUploadState == null || fileUploadState.headers == null}
                        style={{ marginRight: 10 }}
                        onChange={onHeaderSelection}
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
                    disabled={fileUploadState == null || fileUploadState.headers == null || fileUploadState.selectedHeader == null || fileUploadState.selectedHeader === -1}
                    style={{ marginLeft: 10 }}
                    startIcon={importFeedback == null || importFeedback.delay == null ? <PlayArrowIcon /> : <StopIcon />}
                    className={classes.button}
                    onClick={importFeedback == null || importFeedback.delay == null ? onStartImport : onStopImport}>
                    {importFeedback == null || importFeedback.delay == null ? 'Start' : 'Stop'}
                </Button>
            </div>

            <div className={classes.feedbackContainer}>
                {importFeedback && <ImportFeedback importFeedback={importFeedback} />}
            </div>
        </div>
    );
}