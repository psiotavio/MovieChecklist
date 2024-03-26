// Tipagem e definição dos temas
export type Theme = {
    background: string;
    text: string;
    borderRed: string;
    modalBackground: string;
  };
  
  export const themes: Record<'light' | 'dark', Theme> = {
    light: {
      background: '#FFFFFF', 
      text: '#000000', 
      borderRed: '#E21221', 
      modalBackground: '#1E2129',
    },
    dark: {
        background: '#181A20',
        text: '#FDFDFD', 
        borderRed: '#E21221', 
        modalBackground: '#1E2129',
      }
  };