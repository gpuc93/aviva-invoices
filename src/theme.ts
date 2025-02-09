import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  shape: {
    borderRadius: 8, // Border radius de todos los elementos
  },
  palette: {
    error: {
      main: "#ff4920"
    },
    primary: {
      main: "#1c252e", // Azul de Material UI
    },
    secondary: {
      main: "#dc004e", // Rojo personalizado
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px", // Bordes redondeados
          textTransform: "none", // Evita que el texto se convierta en mayúsculas
          paddingLeft: "12px",
          paddingRight: "12px"
        },
      },
    },
    
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "12px", // Aplica border-radius al Dialog
        },
      }
    }
  },
});

export default theme;
