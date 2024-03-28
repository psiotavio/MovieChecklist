import { ScrollViewStyleReset } from 'expo-router/html';
import { useTheme } from '../constants/temas/ThemeContext';

export default function Root({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  // Define o estilo CSS responsivo com base no tema atual
  const responsiveBackground = `
    body {
      background-color: ${theme.background};
    }
    @media (prefers-color-scheme: dark) {
      body {
        background-color: ${theme.background}; // Usando a mesma cor de fundo para o modo escuro
      }
    }
  `;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1.00001,viewport-fit=cover"
        />
        <ScrollViewStyleReset />
        {/* Incluindo o estilo CSS responsivo */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
