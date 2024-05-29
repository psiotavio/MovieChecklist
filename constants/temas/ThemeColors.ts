export type Theme = {
  background: string;
  text: string;
  borderRed: string;
  modalBackground: string;
  modalBackgroundSecondary: string;
  textButtons: string;
  errorColor: string;
  modalThemeMode: string;
  borderBottom: string;
};

export const themes: Record<'light' | 'dark' | 'blue' | 'orange' | 'pink' | 'lightpink' | 'green' | 'deepPurple' | 'red', Theme> = {
  light: {
    background: '#F5F5F7',
    text: '#383838',
    borderRed: '#B3ABD4',
    modalBackground: '#F1EFF2',
    modalBackgroundSecondary: '#35383F',
    textButtons: '#FFFFFF',
    errorColor: '#D14848',
    modalThemeMode: '#B3ABD4',
    borderBottom: 'rgba(0,0,0,0.25)'
  },
  dark: {
    background: '#121212',     
    text: '#FDFDFD',
    borderRed: '#8770B9',
    modalBackground: '#1C1C1C',
    modalBackgroundSecondary: '#35383F',
    textButtons: '#FFFFFF',
    errorColor: '#D14848',
    modalThemeMode: 'black',
    borderBottom: 'rgba(255,255,255,0.25)'
  },
  blue: {
    background: '#121212', // Fundo escuro
    text: '#E0E0E0', // Texto em cinza claro
    borderRed: '#4169E1', // Borda em azul royal
    modalBackground: '#1C1C1C', // Fundo do modal
    modalBackgroundSecondary: '#2A2A2A', // Fundo secundário do modal
    textButtons: '#FFFFFF', // Texto dos botões em azul royal
    errorColor: '#D32F2F', // Cor de erro
    modalThemeMode: 'black', // Tema do modal em preto
    borderBottom: 'rgba(255,255,255,0.25)' // Borda inferior sutil
  },
  orange: {
    background: '#121212', // Fundo escuro
    text: '#E0E0E0', // Texto em cinza claro
    borderRed: '#FF5733', // Borda em laranja vibrante
    modalBackground: '#1C1C1C', // Fundo do modal
    modalBackgroundSecondary: '#2A2A2A', // Fundo secundário do modal
    textButtons: '#FFFFFF', // Texto dos botões em laranja vibrante
    errorColor: '#D32F2F', // Cor de erro
    modalThemeMode: 'black', // Tema do modal em preto
    borderBottom: 'rgba(255,255,255,0.25)' // Borda inferior sutil
  },
  pink: {
    background: '#121212',                  // Fundo escuro
    text: '#E0E0E0',                        // Texto em cinza claro
    borderRed: '#A2207D',                   // Borda em rosa escuro
    modalBackground: '#1C1C1C',             // Fundo do modal
    modalBackgroundSecondary: '#2A2A2A',    // Fundo secundário do modal
    textButtons: '#FFFFFF',                 // Texto dos botões em rosa escuro
    errorColor: '#D32F2F',                  // Cor de erro
    modalThemeMode: 'black',                // Tema do modal em preto
    borderBottom: 'rgba(255,255,255,0.25)'  // Borda inferior sutil
  },
  lightpink: {
    background: '#FFFFFF',                  // Fundo claro
    text: '#333333',                        // Texto em cinza escuro para melhor legibilidade
    borderRed: '#FFC0CB',                   // Borda em rosa bebê
    modalBackground: '#F8F8F8',             // Fundo do modal em um cinza muito claro
    modalBackgroundSecondary: '#EFEFEF',    // Fundo secundário do modal em cinza claro
    textButtons: '#000000',                 // Texto dos botões em rosa bebê
    errorColor: '#D32F2F',                  // Cor de erro
    modalThemeMode: 'white',                // Tema do modal em branco
    borderBottom: 'rgba(0,0,0,0.25)' 
  },
  green: {
    background: '#121212',                  // Fundo escuro
    text: '#E0E0E0',                        // Texto em cinza claro
    borderRed: '#005F37',                   // Borda em verde escuro
    modalBackground: '#1C1C1C',             // Fundo do modal
    modalBackgroundSecondary: '#2A2A2A',    // Fundo secundário do modal
    textButtons: '#FFFFFF',                 // Texto dos botões em verde escuro
    errorColor: '#D32F2F',                  // Cor de erro
    modalThemeMode: 'black',                // Tema do modal em preto
    borderBottom: 'rgba(255,255,255,0.25)'  // Borda inferior sutil
  },
  deepPurple: {
    background: '#121212',                  // Fundo escuro
    text: '#E0E0E0',                        // Texto em cinza claro
    borderRed: '#4B0082',                   // Borda em roxo púrpura (roxo universo)
    modalBackground: '#1C1C1C',             // Fundo do modal
    modalBackgroundSecondary: '#2A2A2A',    // Fundo secundário do modal
    textButtons: '#FFFFFF',                 // Texto dos botões em roxo púrpura (roxo universo)
    errorColor: '#D32F2F',                  // Cor de erro
    modalThemeMode: 'black',                // Tema do modal em preto
    borderBottom: 'rgba(255,255,255,0.25)'  // Borda inferior sutil
  },
  red: {
    background: '#121212',                  // Fundo escuro
    text: '#E0E0E0',                        // Texto em cinza claro
    borderRed: '#B41717',                   // Borda em vermelho escarlate escuro
    modalBackground: '#1C1C1C',             // Fundo do modal
    modalBackgroundSecondary: '#2A2A2A',    // Fundo secundário do modal
    textButtons: '#FFFFFF',                 // Texto dos botões em vermelho escarlate escuro
    errorColor: '#D32F2F',                  // Cor de erro
    modalThemeMode: 'black',                // Tema do modal em preto
    borderBottom: 'rgba(255,255,255,0.25)'  // Borda inferior sutil
  }
};
