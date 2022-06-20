import { blue, blueGrey, lightBlue } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

// Theme setup
export const customTheme = createTheme({
  // palette: {
  //   primary: {
  //     main: blue[900],
  //   },
  //   secondary: {
  //     main: red[500],
  //   },
  // },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& input': {
            padding: 10,
          },
          '& label.MuiInputLabel-root': {
            transform: 'translate(14px, 10px) scale(1)',
          },
          '& label.MuiInputLabel-root[data-shrink=true]': {
            transform: 'translate(14px, -9px) scale(0.75)',
          }
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '& div.MuiSelect-select': {
            padding: 10,
          }
        }
      }
    },
    MuiGrid: {
      styleOverrides: {
        root: {
          alignItems: 'center',
        },
        item: {
          marginTop: 4,
          marginBottom: 4,
        }
      }
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& th.MuiTableCell-head': {
            fontWeight: 'bold',
            backgroundColor: blue[100],
          }
        }
      }
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          '& td.MuiTableCell-body': {
            paddingTop: 1,
            paddingBottom: 1,
          }
        }
      }
    },
  }
});