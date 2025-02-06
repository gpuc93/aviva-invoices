import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
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
        },
      },
    },
  },
});

export default theme;
