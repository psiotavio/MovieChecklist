// Tipagem e definição dos temas
export type Theme = {
    background: string;
    text: string;
    // Adicione mais propriedades conforme necessário
  };
  
  export const themes: Record<'light' | 'dark', Theme> = {
    light: {
      background: '#FFFFFF', // Coloque sua cor de fundo clara aqui
      text: '#000000', // Coloque sua cor de texto claro aqui
      // outros valores para tema claro
    },
    dark: {
      background: '#000000', // Coloque sua cor de fundo escura aqui
      text: '#FFFFFF', // Coloque sua cor de texto escuro aqui
      // outros valores para tema escuro
    },
  };