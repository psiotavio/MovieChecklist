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

//| 'blue' | 'orange' | 'pink' | 'lightpink' | 'green' | 'red' |

export const themes: Record<'light' | 'dark' | 'dune' | 'cosmicDusk' | 'lilacNebula' | 'shadowOfMordor' | 'darkSide' | 'neonTwilight' | 'dracula' | 'bladeRunner' | 'violetWitch' | 'thanos' | 'jediTemple' | 'hungerGames' | 'neoMatrix', Theme> = {
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
  
  // NOVOS TEMAS ROXOS
  dune: {
    background: '#0E0D1C',          // Um preto profundo com nuances de roxo, evocando a vastidão e o terror do espaço
    text: '#B0A8B9',                // Roxo claro cinzento para o texto, como uma névoa que esconde horrores inomináveis
    borderRed: '#493748',           // Roxo muito escuro para as bordas, trazendo uma sensação de opressão e mistério
    modalBackground: '#1A1727',     // Roxo ultraprofundo para o fundo do modal, como olhar para o abismo
    modalBackgroundSecondary: '#2F2B3D', // Roxo mais claro para o modal secundário, para contrastar suavemente
    textButtons: '#FFFFFF',         // Botões em branco, criando um claro destaque no fundo escuro
    errorColor: '#B340B3',          // Um roxo vibrante para erros, como um lampejo de loucura atravessando a escuridão
    modalThemeMode: 'black', // Modo "Roxo Eldritch", celebrando o inexplicável e aterrorizante tema de Lovecraft
    borderBottom: 'rgba(255, 255, 255, 0.3)' // Borda inferior semi-transparente, suave e enigmática
  },
  cosmicDusk: {
    background: '#10001D',     /* Tom mais escuro baseado em #3D3B84 */
    text: '#EAEAEA',           /* Branco suave para o texto */
    borderRed: '#3D3B84',      /* Usando a cor base como cor de destaque para bordas */
    modalBackground: '#232136',/* Fundo de modal mais escuro */
    modalBackgroundSecondary: '#30304A', /* Fundo de modal secundário, um pouco mais claro */
    textButtons: '#FFFFFF',    /* Mantendo o texto dos botões em branco */
    errorColor: '#B14242',     /* Cor de erro suavizada para combinar com o tema escuro */
    modalThemeMode: 'black',/* Mudando o modo para refletir a influência do azul */
    borderBottom: 'rgba(255, 255, 255, 0.3)' /* Borda inferior semi-transparente usando a cor base */
  },

  lilacNebula: {
    background: '#2E2C3F',     /* Escuro quase preto com influência de lilás */
    text: '#E8E8FF',           /* Lilás muito claro quase branco */
    borderRed: '#7F78A6',      /* Tom mais vivo de lilás */
    modalBackground: '#262435',/* Escuro profundo de lilás */
    modalBackgroundSecondary: '#3E3C5A', /* Lilás secundário mais intenso */
    textButtons: '#FFFFFF',    /* Branco */
    errorColor: '#C45C80',     /* Tom de rosa chocante */
    modalThemeMode: 'black',   /* Nome do modo lilás */
    borderBottom: 'rgba(255, 255, 255, 0.30)' /* Semi-transparente com lilás vivo */
  },


 shadowOfMordor: {
  background: '#1E1C2A',     /* Quase preto com toque de roxo */
  text: '#DDDDEE',           /* Texto em roxo claro */
  borderRed: '#604D82',      /* Roxo médio sólido */
  modalBackground: '#171625',/* Muito escuro, quase preto */
  modalBackgroundSecondary: '#2F2D47', /* Roxo escuro alternativo */
  textButtons: '#FFFFFF',    /* Branco */
  errorColor: '#A04668',     /* Roxo-rosa para erros */
  modalThemeMode: 'black', /* Roxo profundo como nome do modo */
  borderBottom: 'rgba(255, 255, 255, 0.30)' /* Roxo médio semi-transparente */
},

darkSide: {
  background: '#1B1B1B',     /* Preto petróleo, muito escuro */
  text: '#CACAFF',           /* Roxo claro, quase lavanda */
  borderRed: '#564D7C',      /* Roxo escuro, quase neutro */
  modalBackground: '#131313',/* Preto muito intenso */
  modalBackgroundSecondary: '#2A2741', /* Roxo bem escuro */
  textButtons: '#FFFFFF',    /* Branco */
  errorColor: '#7C4363',     /* Vinho escuro, mantendo a vibração sutil */
  modalThemeMode: 'black',/* Preto Petróleo como nome do modo */
  borderBottom: 'rgba(255, 255, 255, 0.35)' /* Semi-transparente com base em roxo */
},

neonTwilight:{
  background: '#080016',     /* Preto profundo como base */
  text: '#F2E1FF',           /* Lavanda muito claro para texto */
  borderRed: '#CF55F7',      /* Fuchsia intenso para bordas */
  modalBackground: '#0B001E',/* Fundo de modal ainda mais escuro, mantendo a vibração roxa */
  modalBackgroundSecondary: '#34085A', /* Roxo berinjela para um contraste marcante */
  textButtons: '#FFFFFF',    /* Mantendo botões em branco para alta visibilidade */
  errorColor: '#FF4081',     /* Coral néon para realçar erros com visibilidade */
  modalThemeMode: '#9C27B0', /* Roxo profundo indicando o modo do tema */
  borderBottom: 'rgba(255, 255, 255, 0.35)' /* Fuchsia semi-transparente para a borda inferior */
},

dracula: {
  background: '#1E1E2E',     /* Fundo baseado no Dracula, mas ligeiramente mais claro */
  text: '#F8F8F2',           /* Branco creme para texto, igual ao Dracula */
  borderRed: '#BD93F9',      /* Roxo brilhante, similar ao utilizado para funções no Dracula */
  modalBackground: '#282A36',/* Roxo muito escuro para fundos de modal, padrão Dracula */
  modalBackgroundSecondary: '#44475A', /* Roxo-azulado intermediário, também do Dracula */
  textButtons: '#FFFFFF',    /* Botões em branco para destacar sobre o fundo escuro */
  errorColor: '#FF5555',     /* Vermelho vivo para erros, mantendo o alerta do Dracula */
  modalThemeMode: 'black', /* Roxo médio para indicar o modo do tema */
  borderBottom: 'rgba(255, 255, 255, 0.35)' /* Roxo brilhante semi-transparente para a borda inferior */
},



// NOVOS TEMAS
bladeRunner: {
  background: '#0D0D17',     /* Preto profundo com nuances de roxo */
  text: '#E4E4FF',           /* Roxo claro quase branco */
  borderRed: '#8A2BE2',      /* Roxo elétrico */
  modalBackground: '#1A1A2E',/* Roxo muito escuro */
  modalBackgroundSecondary: '#282A44', /* Roxo intermediário */
  textButtons: '#FFFFFF',    /* Branco */
  errorColor: '#FF4500',     /* Vermelho brilhante para erros */
  modalThemeMode: 'black',   /* Preto */
  borderBottom: 'rgba(255, 255, 255, 0.35)' /* Roxo elétrico semi-transparente */
},

violetWitch: {
  background: '#2D163B',      /* Roxo profundo */
  text: '#E3DAF2',            /* Lavanda claro */
  borderRed: '#7A4EB1',       /* Roxo vibrante */
  modalBackground: '#3A1C4E', /* Roxo escuro */
  modalBackgroundSecondary: '#5A357A', /* Roxo mais claro */
  textButtons: '#FFFFFF',     /* Branco */
  errorColor: '#BF5D5D',      /* Vermelho suave */
  modalThemeMode: 'black',    /* Modo roxo escuro */
  borderBottom: 'rgba(255, 255, 255, 0.35)' /* Borda inferior semi-transparente */
},

thanos: {
  background: '#1C1C1C',      /* Cinza muito escuro */
  text: '#E0B3FF',            /* Lavanda clara */
  borderRed: '#7B1FA2',       /* Roxo profundo */
  modalBackground: '#280D3D', /* Roxo escuro */
  modalBackgroundSecondary: '#452780', /* Roxo intenso */
  textButtons: '#FFEB3B',     /* Amarelo vibrante */
  errorColor: '#FF5252',      /* Vermelho suave */
  modalThemeMode: 'black',    /* Modo roxo escuro */
  borderBottom: 'rgba(255, 255, 255, 0.35)' /* Borda inferior semi-transparente */
}
,



jediTemple: {
  background: '#190022',      /* Roxo muito escuro */
  text: '#C5B4D9',            /* Lavanda suave */
  borderRed: '#512DA8',       /* Roxo profundo */
  modalBackground: '#2E2542', /* Roxo muito escuro */
  modalBackgroundSecondary: '#4A3A72', /* Roxo intenso */
  textButtons: '#FFD700',     /* Ouro */
  errorColor: '#FF4081',      /* Rosa vibrante */
  modalThemeMode: 'black',    /* Modo roxo */
  borderBottom: 'rgba(255, 255, 255, 0.35)' /* Borda inferior semi-transparente */
},

hungerGames: {
  background: '#241F26',      /* Cinza escuro */
  text: '#F0E5FF',            /* Lavanda clara */
  borderRed: '#6A1B9A',       /* Roxo vibrante */
  modalBackground: '#482B63', /* Roxo escuro */
  modalBackgroundSecondary: '#764BA2', /* Roxo intenso */
  textButtons: '#FF5722',     /* Laranja vibrante */
  errorColor: '#E74C3C',      /* Vermelho vibrante */
  modalThemeMode: 'black',    /* Modo roxo escuro */
  borderBottom: 'rgba(255, 255, 255, 0.35)' /* Borda inferior semi-transparente */
},

neoMatrix: {
  background: '#010101',      /* Preto */
  text: '#E6E6FA',            /* Lavanda clara */
  borderRed: '#9370DB',       /* Roxo médio */
  modalBackground: '#3A2C5E', /* Roxo escuro */
  modalBackgroundSecondary: '#5C4D7D', /* Roxo mais intenso */
  textButtons: '#E6E6FA',     /* Rosa vibrante */
  errorColor: '#C0392B',      /* Vermelho escuro */
  modalThemeMode: 'black',    /* Modo roxo */
  borderBottom: 'rgba(255, 255, 255, 0.35)' /* Borda inferior semi-transparente */
},




//MAIS PERSONAGENS

// noivaCadaver: { background: '#142237',          // Um azul muito escuro, quase preto, remetendo ao ambiente sombrio do filme
//     text: '#CAD7E3',                // Um azul claro, quase cinza, para texto, evocando o tom pálido da pele da noiva
//     borderRed: '#7B9BA6',           x
//     modalBackground: '#1B3039',     // Fundo de modal em um tom de azul mais profundo, ainda dentro da paleta sombria
//     modalBackgroundSecondary: '#273D4C', // Um azul médio para modal secundário, mantendo a sensação etérea
//     textButtons: '#FFFFFF',         // Botões em branco para contrastar com o fundo escuro
//     errorColor: '#C45C80',          // Um rosa suave para erros, lembrando a cor das rosas que aparecem no filme
//     modalThemeMode: 'lightblue',  // Nome do modo, refletindo a vibe fantasmagórica e azulada do filme
//     borderBottom: 'rgba(123, 155, 166, 0.3)' // Borda inferior semi-transparente com uma cor suave da paleta do f
// }

// ursula: {
//   background: '#120E18',         
//     text: '#E8E8FF',                // Lilás muito claro, quase branco, para o texto, simbolizando a palidez da Úrsula
//     borderRed: '#5B437A',           // Roxo médio, solidamente representativo da cor dos tentáculos de Úrsula
//     modalBackground: '#1F1929',     // Fundo de modal em roxo escuro, trazendo a aura misteriosa e sombria de Úrsula
//     modalBackgroundSecondary: '#312D41',
//     textButtons: '#FFFFFF',         // Mantendo os botões em branco para destacar sobre os tons escuros do fundo
//     errorColor: '#FF4081',          // Rosa vibrante, emprestando a vivacidade da coloração dos tentáculos de Úrsula
//     modalThemeMode: 'black',     // "Bruxa do Mar" como nome do modo, em alusão direta ao título dado a Úrsula
//     borderBottom: 'rgba(255, 64, 129, 0.3)'
// }

// joker: { 
//   background: '#200033',          // Um roxo escuro e intenso, refletindo o terno icônico do Joker
// text: '#F1E4F3',                // Texto em lilás pálido, quase branco, para destacar sobre o fundo escuro
// borderRed: '#21A336',           
// modalBackground: '#3D2058',     // Um tom de roxo mais profundo e mais sofisticado para o fundo do modal
// modalBackgroundSecondary: '#4E2C6E', // Um tom de roxo mais vibrante e luxuoso para o modal secundário
// textButtons: '#FFFFFF',         // Botões em branco para alta visibilidade e contrastar com o fundo escuro
// errorColor: '#D32F2F',          // Vermelho intenso para erros, capturando a intensidade dramática do personagem
// modalThemeMode: 'black', // Modo "Chaotic Purple", mantendo a essência errática do Joker
// borderBottom: 'rgba(255, 255, 255, 0.35)'
// }

// ravenclaw: {
  // background: '#251D3A',          // Um roxo profundo que evoca o manto da casa Ravenclaw
  // text: '#D2D0F0',                // Um tom de azul claro para o texto, simbolizando o céu noturno e a sabedoria
  // borderRed: '#4C4390',           // Um azul-roxo, cor que combina com o roxo base mas traz uma pitada de exclusividade
  // modalBackground: '#302948',     // Roxo intermediário para o fundo do modal, inspirado pelas cores da casa
  // modalBackgroundSecondary: '#423D5F', // Roxo mais claro para o modal secundário, complementando a paleta
  // textButtons: '#FFFFFF',         // Botões em branco para maior visibilidade
  // errorColor: '#AA336A',          // Um tom de vinho para erros, elegante e discreto
  // modalThemeMode: 'black', // Modo "Sabedoria do Mago", evocando a inteligência e criatividade de Ravenclaw
  // borderBottom: 'rgba(255, 255, 255, 0.35)'
// }


// COLOCAR ADS:
// blue: {
//   background: '#121212', // Fundo escuro
//   text: '#E0E0E0', // Texto em cinza claro
//   borderRed: '#4169E1', // Borda em azul royal
//   modalBackground: '#1C1C1C', // Fundo do modal
//   modalBackgroundSecondary: '#2A2A2A', // Fundo secundário do modal
//   textButtons: '#FFFFFF', // Texto dos botões em azul royal
//   errorColor: '#D32F2F', // Cor de erro
//   modalThemeMode: 'black', // Tema do modal em preto
//   borderBottom: 'rgba(255,255,255,0.25)' // Borda inferior sutil
// },
// orange: {
//   background: '#121212', // Fundo escuro
//   text: '#E0E0E0', // Texto em cinza claro
//   borderRed: '#FF5733', // Borda em laranja vibrante
//   modalBackground: '#1C1C1C', // Fundo do modal
//   modalBackgroundSecondary: '#2A2A2A', // Fundo secundário do modal
//   textButtons: '#FFFFFF', // Texto dos botões em laranja vibrante
//   errorColor: '#D32F2F', // Cor de erro
//   modalThemeMode: 'black', // Tema do modal em preto
//   borderBottom: 'rgba(255,255,255,0.25)' // Borda inferior sutil
// },
// pink: {
//   background: '#121212',                  // Fundo escuro
//   text: '#E0E0E0',                        // Texto em cinza claro
//   borderRed: '#A2207D',                   // Borda em rosa escuro
//   modalBackground: '#1C1C1C',             // Fundo do modal
//   modalBackgroundSecondary: '#2A2A2A',    // Fundo secundário do modal
//   textButtons: '#FFFFFF',                 // Texto dos botões em rosa escuro
//   errorColor: '#D32F2F',                  // Cor de erro
//   modalThemeMode: 'black',                // Tema do modal em preto
//   borderBottom: 'rgba(255,255,255,0.25)'  // Borda inferior sutil
// },
// lightpink: {
//   background: '#FFFFFF',                  // Fundo claro
//   text: '#333333',                        // Texto em cinza escuro para melhor legibilidade
//   borderRed: '#FFC0CB',                   // Borda em rosa bebê
//   modalBackground: '#F8F8F8',             // Fundo do modal em um cinza muito claro
//   modalBackgroundSecondary: '#EFEFEF',    // Fundo secundário do modal em cinza claro
//   textButtons: '#000000',                 // Texto dos botões em rosa bebê
//   errorColor: '#D32F2F',                  // Cor de erro
//   modalThemeMode: 'white',                // Tema do modal em branco
//   borderBottom: 'rgba(0,0,0,0.25)' 
// },
// green: {
//   background: '#121212',                  // Fundo escuro
//   text: '#E0E0E0',                        // Texto em cinza claro
//   borderRed: '#005F37',                   // Borda em verde escuro
//   modalBackground: '#1C1C1C',             // Fundo do modal
//   modalBackgroundSecondary: '#2A2A2A',    // Fundo secundário do modal
//   textButtons: '#FFFFFF',                 // Texto dos botões em verde escuro
//   errorColor: '#D32F2F',                  // Cor de erro
//   modalThemeMode: 'black',                // Tema do modal em preto
//   borderBottom: 'rgba(255,255,255,0.25)'  // Borda inferior sutil
// },
// red: {
//   background: '#121212',                  // Fundo escuro
//   text: '#E0E0E0',                        // Texto em cinza claro
//   borderRed: '#B41717',                   // Borda em vermelho escarlate escuro
//   modalBackground: '#1C1C1C',             // Fundo do modal
//   modalBackgroundSecondary: '#2A2A2A',    // Fundo secundário do modal
//   textButtons: '#FFFFFF',                 // Texto dos botões em vermelho escarlate escuro
//   errorColor: '#D32F2F',                  // Cor de erro
//   modalThemeMode: 'black',                // Tema do modal em preto
//   borderBottom: 'rgba(255,255,255,0.25)'  // Borda inferior sutil
// },
};
