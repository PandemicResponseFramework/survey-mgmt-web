import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx/xlsx.mjs';
import { DropZone } from './Styles';

export default function ExcelFileDropZone(props) {

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

    const { getRootProps, getInputProps } = useDropzone({ accept: ".xlsx", onDrop })

    return (
        <DropZone {...getRootProps()} >
            <input {...getInputProps()} multiple={false} />
            <InsertDriveFileOutlinedIcon style={{ color: '#e0e0e0' }} fontSize="large" />
            <p>Drag 'n' drop the file here, or click to select a file</p>
        </DropZone>
    );
}