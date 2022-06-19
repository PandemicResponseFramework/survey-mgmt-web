//import DataBrowser, { getObjectPropertyByString } from '@alekna/react-data-browser';
import { Box, Fade, LinearProgress, Typography, Pagination } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import React, { useEffect } from 'react';

const useStyles = makeStyles()((theme) => ({
    root: {
        width: '100%',
    },
    countDisplay: {
        display: 'flex',

        '& > *': {
            minWidth: 150,
            marginRight: 10,
        }
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: 10,
    },
    table: {
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'none',
        width: '100%',
    },
    head: {
        display: 'flex',
        flex: '0 0 auto',
        height: 46,
        color: 'black',
        borderBottom: '1px solid #ccc',
        padding: '0 5px',
    },
    head_row: {
        display: 'flex',
        flex: '1 1 auto',
        textTransform: 'uppercase',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    head_row_item: {
        display: 'flex',
        textTransform: 'uppercase',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
    },
    body: {
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 auto',
        overflowX: 'auto',
        padding: '0 5px',
    },
    body_row: {
        display: 'flex',
        flex: '0 0 auto',
        borderBottom: '1px solid #eee',
    },
    body_row_item: {
        display: 'flex',
        height: 46,
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '0 10px',
        fontSize: '14px',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    }
}));

export default function ImportFeedback(props) {

    const { classes } = useStyles();
    const { importFeedback } = props;
    const [page, setPage] = React.useState(1);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    useEffect(() => {
        setPage(1);
    }, [importFeedback.importId]);

    const handleChange = (event, value) => {
        setPage(value);
    };

    const columns = [
        { label: 'email', sortField: 'email', isLocked: true },
        { label: 'state', sortField: 'state', isLocked: true },
    ];

    function fieldReducer(fieldValue, fieldName) {
        switch (fieldName) {
            case 'state':
                return (
                    fieldValue === 'ERROR'
                        ? <Box color="error.main" style={{ fontWeight: 'bold' }}>{fieldValue}</Box>
                        : <Box color="success.main" style={{ fontWeight: 'bold' }}>{fieldValue}</Box>
                );
            default:
                return fieldValue;
        }
    }

    return (
        <div className={classes.root}>

            <div className={classes.countDisplay}>
                <Typography variant="body1">Success ({importFeedback == null ? 0 : importFeedback.countSuccess})</Typography>
                <Typography variant="body1">Skipped ({importFeedback == null ? 0 : importFeedback.countSkipped})</Typography>
                <Typography variant="body1">Failed ({importFeedback == null ? 0 : importFeedback.countFailed})</Typography>
            </div>
            <Fade in={importFeedback.delay != null}>
                <LinearProgress />
            </Fade>

            {importFeedback.entries.length !== 0 &&
                <Pagination
                    count={Math.ceil(importFeedback.entries.length / rowsPerPage)}
                    page={page}
                    onChange={handleChange}
                    className={classes.pagination}
                    color="primary"
                    showFirstButton showLastButton
                />
            }

            {/* {importFeedback.entries.length !== 0 &&
                <DataBrowser
                    initialColumnFlex={['0 0 75%', '0 0 25%']}
                    columns={columns}
                >
                    {
                        ({ columnFlex, visibleColumns }) => (
                            <div className={classes.table}>
                                <div className={classes.head}>
                                    <div className={classes.head_row}>
                                        {visibleColumns.map((cell, index) => (
                                            <div
                                                key={index}
                                                className={classes.head_row_item}
                                                style={{ flex: columnFlex[index] }}
                                            >
                                                {cell.label}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className={classes.body}>
                                    {importFeedback.entries.slice((page - 1) * rowsPerPage, Math.min((page) * rowsPerPage, importFeedback.entries.length)).map((row, key) => (
                                        <div key={key} className={classes.body_row}>
                                            {visibleColumns.map(({ label, sortField }, index) => (
                                                <div
                                                    key={sortField}
                                                    className={classes.body_row_item}
                                                    style={{ flex: columnFlex[index] }}
                                                >
                                                    {
                                                        fieldReducer(
                                                            getObjectPropertyByString(row, sortField),
                                                            sortField,
                                                        )
                                                    }
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    }
                </DataBrowser>
            } */}
        </div>
    );
}