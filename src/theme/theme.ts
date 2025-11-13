import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1abc9c",
      dark: "#168f75",
    },
    secondary: {
      main: "#2c3e50",
    },
    background: {
      default: "#f4f6f8",
      paper: "#ffffff",
    },
    text: {
      primary: "#1f2933",
      secondary: "#52606d",
    },
  },
  typography: {
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h4: {
      fontWeight: 600,
      letterSpacing: "-0.02em",
    },
    h5: {
      fontWeight: 600,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 24px 45px rgba(15, 23, 42, 0.06)",
          border: "1px solid rgba(15, 23, 42, 0.06)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingBlock: 12,
          paddingInline: 20,
        },
        contained: {
          boxShadow: "0 12px 30px rgba(26, 188, 156, 0.25)",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: "medium",
        variant: "outlined",
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#f4f6f8",
        },
      },
    },
  },
});

export default theme;
