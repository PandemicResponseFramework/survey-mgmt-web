import { RootRef } from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import Axios from 'axios';
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    dropzone: {
        width: '100%',
        height: 235,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        borderWidth: 2,
        borderRadius: 2,
        borderColor: grey[300],
        borderStyle: 'dashed',
        backgroundColor: '#fafafa',
        color: grey[400],
        outline: 'none',
        transition: 'border .24s ease-in-out',
    },
    dropzoneIcon: {
        color: grey[300],
    },
}));

export default function ExcelFileDropZone(props) {

    const classes = useStyles();
    const theme = useTheme();
    const axios = Axios.create({
        baseURL: localStorage.getItem('appServerUrl'),
        withCredentials: true
    });

    const onDrop = useCallback(acceptedFiles => {

        const config = { headers: { 'Content-Type': 'multipart/form-data' } };
        let fd = new FormData();
        fd.append('file', acceptedFiles[0]);

        axios.post('/manage/participant/import/upload', fd, config)
            .then(function (response) {
                if (props.callback != null)
                    props.callback(response.data);
            })
            .catch(function (error) {
                console.log(error);
            })
            .then(function () {
                // always executed
            });

    }, []);

    const { getRootProps, getInputProps } = useDropzone({ accept: ".xlsx", onDrop });
    const { ref, ...rootProps } = getRootProps();

    return (
        <div className={classes.root}>
            <RootRef rootRef={ref}>
                <div {...rootProps} className={classes.dropzone}>
                    <input {...getInputProps()} multiple={false} />
                    <InsertDriveFileOutlinedIcon className={classes.dropzoneIcon} fontSize="large" />
                    <p>Drag 'n' drop the file here, or click to select a file</p>
                </div>
            </RootRef>
        </div>
    );
}