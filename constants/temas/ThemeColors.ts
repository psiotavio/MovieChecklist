// Tipagem e definição dos temas
export type Theme = {
    background: string;
    text: string;
    borderRed: string;
    modalBackground: string;
    modalBackgroundSecondary: string;
    textButtons: string;
    errorColor: string;
    modalThemeMode: string;
  };
  
  export const themes: Record<'light' | 'dark', Theme> = {
    light: {
      background: '#F5F5F7', 
      text: '#383838', 
      borderRed: '#B3ABD4', 
      modalBackground: '#F1EFF2',
      modalBackgroundSecondary: '#35383F',
      textButtons: '#FFFF',
      errorColor: '#D14848',
      modalThemeMode: '#B3ABD4'
    },
    dark: {
        background: '#181A20',
        text: '#FDFDFD', 
        borderRed: '#8770B9', 
        modalBackground: '#1E2129',
        modalBackgroundSecondary: '#35383F',
        textButtons: '#FFFF',
        errorColor: '#D14848',
        modalThemeMode: 'black'
      }
  };