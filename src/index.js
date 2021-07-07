import React from 'react';
import ReactDOM from 'react-dom';
import Main from './Main';
import { SnackbarProvider } from 'notistack';

ReactDOM.render(
    <SnackbarProvider maxSnack={5}>
        <Main />
    </SnackbarProvider>, document.getElementById('root'));
