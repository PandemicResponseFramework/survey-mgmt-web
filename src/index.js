import React from 'react';
import ReactDOM from "react-dom";
import Main from './Main';
import { SnackbarProvider } from 'react-notistack';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import createCache from '@emotion/cache';
import { CacheProvider } from "@emotion/react";
import { ThemeProvider } from '@mui/material/styles';
import { customTheme } from './Setup';

export const muiCache = createCache({
    'key': 'mui',
    'prepend': true,
});

const root = ReactDOM.createRoot(document.getElementById('root'));

/**
 * 1. SnackBar setup provider
 * 2. MUI emotion cache provider
 * 3. MUI theme provider
 * 4. MUI date/time picker localization provider
 */
root.render(
    <SnackbarProvider maxSnack={5}>
        <CacheProvider value={muiCache}>
            <ThemeProvider theme={customTheme}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Main />
                </LocalizationProvider>
            </ThemeProvider>
        </CacheProvider>
    </SnackbarProvider>
);