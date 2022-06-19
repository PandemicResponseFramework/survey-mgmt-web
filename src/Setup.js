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
                      padding: 6,
                  }
              }
          }
      },
      MuiSelect: {
          styleOverrides: {
              root: {
                  '& div.MuiSelect-select': {
                      padding: 6,
                  }
              }
          }
      },
      MuiGrid: {
        styleOverrides: {
          item: {
            marginTop: 4,
            marginBottom: 4,
          }
        }
      }
  }
});