import { Button, MenuItem, Select, Typography } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import React from 'react';
import ExcelFileDropZone from './ExcelFileDropZone';
import Timer from './Timer';

const useStyles = makeStyles((theme) => ({

    root: {
        display: 'flex',
        flexDirection: "column",
        width: "100%",
    },
    actionContainer: {
        display: 'flex',
        marginTop: 10,

        '& > *': {
            flexGrow: 1,
            width: 300,
        }
    },
    button: {
        margin: theme.spacing(1),
    },
}));

export default function ParticipantsImport() {

    const classes = useStyles();
    const theme = useTheme();
    const [uploadFeedback, setUploadFeedback] = React.useState(null);
    const [selectedHeaderIndex, setSelectedHeaderIndex] = React.useState(null);

    const onUploadFeedback = (uploadFeedback) => {
        setUploadFeedback(uploadFeedback);
        setSelectedHeaderIndex(null);
    };

    const onHeaderSelection = (event) => {
        setSelectedHeaderIndex(event.target.value);
    };

    const onStartImport = () => {
        console.log("START");
    };

    return (
        <div className={classes.root}>
            <ExcelFileDropZone callback={onUploadFeedback} />

            <div className={classes.actionContainer}>
                <Select
                    multiple={false}
                    contentEditable={false}
                    defaultValue={-1}
                    disabled={uploadFeedback == null || uploadFeedback.headers == null}
                    style={{ marginRight: 10 }}
                    onChange={onHeaderSelection}
                >
                    <MenuItem key={-1} value={-1} disabled>&nbsp;</MenuItem>
                    {uploadFeedback != null && uploadFeedback.headers != null && uploadFeedback.headers.map((header, index) =>
                        <MenuItem key={index} value={index}>{header}</MenuItem>
                    )}
                </Select>

                {uploadFeedback != null && uploadFeedback.timeout != null 
                    ? <Timer timeout={uploadFeedback.timeout} timeoutMessage="Uploaded file is no longer available."/>
                    : <div/>
                }

                <Button
                    variant="contained"
                    color="primary"
                    disabled={uploadFeedback == null || uploadFeedback.headers == null || selectedHeaderIndex == null || selectedHeaderIndex === -1}
                    style={{ marginLeft: 10 }}
                    startIcon={<PlayArrowIcon>Start Import</PlayArrowIcon>}
                    className={classes.button}
                    onClick={onStartImport}>
                    Start
                </Button>
            </div>
        </div>
    );
}