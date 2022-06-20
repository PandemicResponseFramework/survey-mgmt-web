import { grey } from '@mui/material/colors';
import { makeStyles } from 'tss-react/mui';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx/xlsx.mjs';

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
    },
    dropzone: {
        width: '100%',
        height: 160,
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

    const { classes } = useStyles();
    const { callback } = props;

    const onDrop = useCallback(acceptedFiles => {

        const file = acceptedFiles[0];
        const reader = new FileReader()

        reader.onabort = () => console.log('file reading was aborted')
        reader.onerror = () => console.log('file reading has failed')
        reader.onload = () => {
            const workbook = XLSX.read(reader.result, { type: 'array', sheetRows: 1 });
            let sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
                header: 1,
                defval: '',
                blankrows: false,
            });
            callback({
                'file': file,
                'headers': sheetData[0],
            });
        };
        reader.readAsArrayBuffer(file);

    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ accept: ".xlsx", onDrop })

    return (
        <div className={classes.root}>
            <div {...getRootProps()} className={classes.dropzone}>
                <input {...getInputProps()} multiple={false} />
                <InsertDriveFileOutlinedIcon className={classes.dropzoneIcon} fontSize="large" />
                <p>Drag 'n' drop the file here, or click to select a file</p>
            </div>
        </div>
    );
}