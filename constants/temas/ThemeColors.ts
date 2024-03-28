// Tipagem e definição dos temas
export type Theme = {
    background: string;
    text: string;
    borderRed: string;
    modalBackground: string;
    modalBackgroundSecondary: string;
    textButtons: string;
  };
  
  export const themes: Record<'light' | 'dark', Theme> = {
    light: {
      background: '#FFFFFF', 
      text: '#000000', 
      borderRed: '#E7B13D', 
      modalBackground: '#F2F2F2',
      modalBackgroundSecondary: '#35383F',
      textButtons: '#FFFF'
    },
    dark: {
        background: '#181A20',
        text: '#FDFDFD', 
        borderRed: '#8770B9', 
        modalBackground: '#1E2129',
        modalBackgroundSecondary: '#35383F',
        textButtons: '#FFFF'
      }
  };