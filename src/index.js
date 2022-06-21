import React from 'react';
import { createRoot } from 'react-dom/client';
import Main from './Main';
import { SnackbarProvider } from 'notistack';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import createCache from '@emotion/cache';
import { CacheProvider } from "@emotion/react";
import { ThemeProvider } from '@mui/material/styles';
import { customTheme } from './Setup';
import ErrorBoundary from './ErrorBoundary';
import '@nosferatu500/react-sortable-tree/style.css'; // This only needs to be imported once in your app

export const muiCache = createCache({
    'key': 'mui',
    'prepend': true,
});

const root = createRoot(document.getElementById('root'));

/**
 * 1. SnackBar setup provider
 * 2. MUI emotion cache provider
 * 3. MUI theme provider
 * 4. MUI date/time picker localization provider
 */
root.render(
    <ErrorBoundary>
        <SnackbarProvider maxSnack={5} preventDuplicate>
            <CacheProvider value={muiCache}>
                <ThemeProvider theme={customTheme}>
                    <LocalizationProvider dateAdapter={AdapterLuxon}>
                        <Main />
                    </LocalizationProvider>
                </ThemeProvider>
            </CacheProvider>
        </SnackbarProvider>
    </ErrorBoundary>
);