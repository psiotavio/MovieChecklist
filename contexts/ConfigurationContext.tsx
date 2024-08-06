import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const translations = {
  english: {
    digiteNomeFilme: "Type the movie name",
    assistidosEm: "Watched in",
    melhores: "Best",
    descricao: "Description",
    atores: "Actors",
    melhoresFilmesDe: "Best movies of",
    avaliarFilme: "Rate the movie:",
    avaliacao: "Rating",
    cancelar: "Cancel",
    confirmar: "Confirm",
    compartilhar: "Share",
    assistirMaisTarde: "Watch later",
    voceAssistiuEsseFilme: "You have watched this movie",
    adicionar: "Add",
    assistidoQuando: "Watched when?",
    escolherData: "Choose date",
    hoje: "Today",
    RecommendMovie: "I recommend this movie:",
    ConhecidoPor: "Known for:",
    Fechar: "Close",
    Biografia: "Biography:",
    NasceuEm: "Born in:",
    FilmeJaNaLista: "This movie is already in your list!",
    Avaliados: "Rated",
    SeusAvaliados: "YOUR RATED MOVIES",
    ParaAssistir: "To Watch",
    SemAssistir:
      "You have no movies in your list. Add a movie to watch later by searching in the Recommendations tab.",
    SemAvaliados: "You have not rated any movie.",
    javiu: "Have you watched this movie?",
    removeLista: "Remove from list",
    sim: "Yes",
    nao: "No",
    Cancel: "Cancel",
    AddPrompt: "Do you want to add this item to the list?",
    AddToList: "Add to List",
    inicio: "Home",
    Listas: "Lists",
    Paravoce: "For You",
    Perfil: "Profile",
    Action: "Action",
    Adventure: "Adventure",
    Animation: "Animation",
    Comedy: "Comedy",
    Drama: "Drama",
    Family: "Family",
    Fantasy: "Fantasy",
    Horror: "Horror",
    Music: "Music",
    Mystery: "Mystery",
    Romance: "Romance",
    ScienceFiction: "Science Fiction",
    All: "All",
    RecommendedForYou: "Recommended for You",
    Todas: "All Platforms",
    NoRecommendations: "There are no recommendations at the moment...",
    ESTATÍSTICAS: "STATISTICS",
    Year: "Total movies watched this year:",
    Month: "Total movies watched this month:",
    Week: "Total movies watched this week:",
    redefinir: "Reset Account",
    tema: "Dark Theme",
    voltar: "Back",
    RedefinirConta: "Reset Account",
    ConfirmacaoRedefinir:
      "Do you really want to reset your account and delete all saved content?",
    VersaoWeb: "Web Version",
    chooseLanguage: "Choose a Language:",
    Recomendado: "Recommended",
    VocePodeGostar: "You might like:",
    shareOnInstagramStories: "Share on Instagram",
    shareOnSocialMedia: "Share on social networks:",
    saveAndShare: "Save and share",
    comment: "Comment",
    deixeComentario: "Leave a comment about the movie here...",
  },
  portuguese: {
    digiteNomeFilme: "Digite o nome do filme",
    assistidosEm: "Assistidos em",
    melhores: "Melhores",
    descricao: "Descrição",
    atores: "Atores",
    melhoresFilmesDe: "Melhores filmes de",
    avaliarFilme: "Avaliar o filme:",
    avaliacao: "Avaliação",
    cancelar: "Cancelar",
    confirmar: "Confirmar",
    compartilhar: "Compartilhar",
    assistirMaisTarde: "Assistir mais tarde",
    voceAssistiuEsseFilme: "Você assistiu esse filme",
    adicionar: "Adicionar",
    assistidoQuando: "Assistido quando?",
    escolherData: "Escolher data",
    hoje: "Hoje",
    RecommendMovie: "Recomendo esse filme:",
    ConhecidoPor: "Conhecido(a) por:",
    Fechar: "Fechar",
    Biografia: "Biografia:",
    NasceuEm: "Nasceu em:",
    FilmeJaNaLista: "Este filme já está na sua lista!",
    Avaliados: "Avaliados",
    SeusAvaliados: "SEUS FILMES AVALIADOS",
    ParaAssistir: "Para Assistir",
    SemAssistir:
      "Você não tem nenhum filme na lista. Adicione um filme para assistir mais tarde procurando na aba Recomendações.",
    SemAvaliados: "Você ainda não avaliou nenhum filme.",
    javiu: "Você já viu esse filme?",
    removeLista: "Remover da lista",
    sim: "Sim",
    nao: "Não",
    Cancel: "Cancelar",
    AddPrompt: "Você deseja adicionar este item à lista?",
    AddToList: "Adicionar à Lista",
    inicio: "Início",
    Listas: "Listas",
    Paravoce: "Para Você",
    Perfil: "Perfil",
    Action: "Ação",
    Adventure: "Aventura",
    Animation: "Animação",
    Comedy: "Comédia",
    Drama: "Drama",
    Family: "Família",
    Fantasy: "Fantasia",
    Horror: "Horror",
    Music: "Música",
    Mystery: "Mistério",
    Romance: "Romance",
    ScienceFiction: "Ficção Científica",
    All: "Todos",
    RecommendedForYou: "Recomendado para Você",
    Todas: "Todas as Plataformas",
    NoRecommendations: "Não há recomendações no momento...",
    ESTATÍSTICAS: "ESTATÍSTICAS",
    Year: "Total de filmes assistidos este ano:",
    Month: "Total de filmes assistidos este mês:",
    Week: "Total de filmes assistidos esta semana:",
    redefinir: "Redefinir Conta",
    tema: "Tema Escuro",
    voltar: "Voltar",
    RedefinirConta: "Redefinir Conta",
    ConfirmacaoRedefinir:
      "Você realmente deseja redefinir sua conta e deletar todo o conteúdo salvo?",
    VersaoWeb: "Versão Web",
    chooseLanguage: "Escolha um Idioma:",
    Recomendado: "Recomendado",
    VocePodeGostar: "Você pode gostar de:",
    shareOnInstagramStories: "Compartilhar no Instagram",
    shareOnSocialMedia: "Compartilhe nas redes sociais:",
    saveAndShare: "Salvar e compartilhar",
    comment: "Comentário",

    deixeComentario: "Deixe um comentário sobre o filme aqui...",
  },
  spanish: {
    digiteNomeFilme: "Escribe el nombre de la película",
    assistidosEm: "Vistos en",
    melhores: "Mejores",
    descricao: "Descripción",
    atores: "Actores",
    melhoresFilmesDe: "Mejores películas de",
    avaliarFilme: "Calificar la película:",
    avaliacao: "Calificación",
    cancelar: "Cancelar",
    confirmar: "Confirmar",
    compartilhar: "Compartir",
    assistirMaisTarde: "Ver más tarde",
    voceAssistiuEsseFilme: "Has visto esta película",
    adicionar: "Agregar",
    assistidoQuando: "¿Visto cuándo?",
    escolherData: "Elegir fecha",
    hoje: "Hoy",
    RecommendMovie: "Recomiendo esta película:",
    ConhecidoPor: "Conocido por:",
    Fechar: "Cerrar",
    Biografia: "Biografía:",
    NasceuEm: "Nacido en:",
    FilmeJaNaLista: "¡Esta película ya está en tu lista!",
    Avaliados: "Calificados",
    SeusAvaliados: "TUS PELÍCULAS CALIFICADAS",
    ParaAssistir: "Para Ver",
    SemAssistir:
      "No tienes películas en tu lista. Agrega una película para ver más tarde buscando en la pestaña Recomendaciones.",
    SemAvaliados: "No has calificado ninguna película.",
    javiu: "¿Has visto esta película?",
    removeLista: "Eliminar de la lista",
    sim: "Sí",
    nao: "No",
    Cancel: "Cancelar",
    AddPrompt: "¿Quieres agregar este artículo a la lista?",
    AddToList: "Agregar a la Lista",
    inicio: "Inicio",
    Listas: "Listas",
    Paravoce: "Para Ti",
    Perfil: "Perfil",
    Action: "Acción",
    Adventure: "Aventura",
    Animation: "Animación",
    Comedy: "Comedia",
    Drama: "Drama",
    Family: "Familia",
    Fantasy: "Fantasía",
    Horror: "Horror",
    Music: "Música",
    Mystery: "Misterio",
    Romance: "Romance",
    ScienceFiction: "Ciencia Ficción",
    All: "Todos",
    RecommendedForYou: "Recomendado para Ti",
    Todas: "Todas las Plataformas",
    NoRecommendations: "No hay recomendaciones por el momento...",
    ESTATÍSTICAS: "ESTADÍSTICAS",
    Year: "Total de películas vistas este año:",
    Month: "Total de películas vistas este mes:",
    Week: "Total de películas vistas esta semana:",
    redefinir: "Restablecer Cuenta",
    tema: "Tema Oscuro",
    voltar: "Volver",
    RedefinirConta: "Restablecer Cuenta",
    ConfirmacaoRedefinir:
      "¿Realmente deseas restablecer tu cuenta y eliminar todo el contenido guardado?",
    VersaoWeb: "Versión Web",
    chooseLanguage: "Elige un Idioma:",
    Recomendado: "Recomendado",
    VocePodeGostar: "Te puede gustar:",
    shareOnInstagramStories: "Compartir en Instagram",
    shareOnSocialMedia: "Compartir en redes sociales:",
    saveAndShare: "Guardar y compartir",
    comment: "comentario",

    deixeComentario: "Deja un comentario sobre la película aquí...",
  },
  french: {
    digiteNomeFilme: "Entrez le nom du film",
    assistidosEm: "Vu en",
    melhores: "Meilleurs",
    descricao: "Description",
    atores: "Acteurs",
    melhoresFilmesDe: "Meilleurs films de",
    avaliarFilme: "Évaluer le film :",
    avaliacao: "Évaluation",
    cancelar: "Annuler",
    confirmar: "Confirmer",
    compartilhar: "Partager",
    assistirMaisTarde: "Regarder plus tard",
    voceAssistiuEsseFilme: "Vous avez vu ce film",
    adicionar: "Ajouter",
    assistidoQuando: "Vu quand ?",
    escolherData: "Choisir la date",
    hoje: "Aujourd'hui",
    RecommendMovie: "Je recommande ce film :",
    ConhecidoPor: "Connu pour :",
    Fechar: "Fermer",
    Biografia: "Biographie :",
    NasceuEm: "Né(e) en :",
    FilmeJaNaLista: "Ce film est déjà dans votre liste !",
    Avaliados: "Évalués",
    SeusAvaliados: "VOS FILMS ÉVALUÉS",
    ParaAssistir: "À Voir",
    SemAssistir:
      "Vous n'avez aucun film dans votre liste. Ajoutez un film à regarder plus tard en cherchant dans l'onglet Recommandations.",
    SemAvaliados: "Vous n'avez évalué aucun film.",
    javiu: "Avez-vous déjà vu ce film ?",
    removeLista: "Retirer de la liste",
    sim: "Oui",
    nao: "Non",
    Cancel: "Annuler",
    AddPrompt: "Voulez-vous ajouter cet article à la liste ?",
    AddToList: "Ajouter à la Liste",
    inicio: "Accueil",
    Listas: "Listes",
    Paravoce: "Pour Vous",
    Perfil: "Profil",
    Action: "Action",
    Adventure: "Aventure",
    Animation: "Animation",
    Comedy: "Comédie",
    Drama: "Drame",
    Family: "Famille",
    Fantasy: "Fantaisie",
    Horror: "Horreur",
    Music: "Musique",
    Mystery: "Mystère",
    Romance: "Romance",
    ScienceFiction: "Science-fiction",
    All: "Tous",
    RecommendedForYou: "Recommandé pour Vous",
    Todas: "Toutes les Plateformes",
    NoRecommendations: "Il n'y a aucune recommandation pour le moment...",
    ESTATÍSTICAS: "STATISTIQUES",
    Year: "Total de films regardés cette année :",
    Month: "Total de films regardés ce mois-ci :",
    Week: "Total de films regardés cette semaine :",
    redefinir: "Réinitialiser le Compte",
    tema: "Thème Sombre",
    voltar: "Retour",
    RedefinirConta: "Réinitialiser le Compte",
    ConfirmacaoRedefinir:
      "Voulez-vous vraiment réinitialiser votre compte et supprimer tout le contenu enregistré ?",
    VersaoWeb: "Version Web",
    chooseLanguage: "Choisir une Langue :",
    Recomendado: "Recommandé",
    VocePodeGostar: "Vous pourriez aimer :",
    shareOnInstagramStories: "Partager sur les Instagram",
    shareOnSocialMedia: "Partagez sur les réseaux sociaux :",
    saveAndShare: "Enregistrer et partager",
    comment: "commentaire",

    deixeComentario: "Laissez un commentaire sur le film ici...",
  },
  german: {
    digiteNomeFilme: "Geben Sie den Namen des Films ein",
    assistidosEm: "Gesehen in",
    melhores: "Beste",
    descricao: "Beschreibung",
    atores: "Schauspieler",
    melhoresFilmesDe: "Beste Filme von",
    avaliarFilme: "Bewerten Sie den Film:",
    avaliacao: "Bewertung",
    cancelar: "Abbrechen",
    confirmar: "Bestätigen",
    compartilhar: "Teilen",
    assistirMaisTarde: "Später anschauen",
    voceAssistiuEsseFilme: "Sie haben diesen Film gesehen",
    adicionar: "Hinzufügen",
    assistidoQuando: "Gesehen wann?",
    escolherData: "Datum wählen",
    hoje: "Heute",
    RecommendMovie: "Ich empfehle diesen Film:",
    ConhecidoPor: "Bekannt für:",
    Fechar: "Schließen",
    Biografia: "Biografie:",
    NasceuEm: "Geboren am:",
    FilmeJaNaLista: "Dieser Film ist bereits in Ihrer Liste!",
    Avaliados: "Bewertet",
    SeusAvaliados: "IHRE BEWERTETEN FILME",
    ParaAssistir: "Zu sehen",
    SemAssistir:
      "Sie haben keine Filme in Ihrer Liste. Fügen Sie einen Film hinzu, den Sie später sehen möchten, indem Sie in der Empfehlungen-Registerkarte suchen.",
    SemAvaliados: "Sie haben keinen Film bewertet.",
    javiu: "Haben Sie diesen Film gesehen?",
    removeLista: "Von der Liste entfernen",
    sim: "Ja",
    nao: "Nein",
    Cancel: "Abbrechen",
    AddPrompt: "Möchten Sie diesen Artikel zur Liste hinzufügen?",
    AddToList: "Zur Liste hinzufügen",
    inicio: "Startseite",
    Listas: "Listen",
    Paravoce: "Für Sie",
    Perfil: "Profil",
    Action: "Aktion",
    Adventure: "Abenteuer",
    Animation: "Animation",
    Comedy: "Komödie",
    Drama: "Drama",
    Family: "Familie",
    Fantasy: "Fantasie",
    Horror: "Horror",
    Music: "Musik",
    Mystery: "Geheimnis",
    Romance: "Romantik",
    ScienceFiction: "Wissenschaftsfiktion",
    All: "Alle",
    RecommendedForYou: "Für Sie empfohlen",
    Todas: "Alle Plattformen",
    NoRecommendations: "Es gibt derzeit keine Empfehlungen...",
    ESTATÍSTICAS: "STATISTIKEN",
    Year: "Gesamtzahl der in diesem Jahr gesehenen Filme:",
    Month: "Gesamtzahl der in diesem Monat gesehenen Filme:",
    Week: "Gesamtzahl der in dieser Woche gesehenen Filme:",
    redefinir: "Konto zurücksetzen",
    tema: "Dunkles Thema",
    voltar: "Zurück",
    RedefinirConta: "Konto zurücksetzen",
    ConfirmacaoRedefinir:
      "Möchten Sie Ihr Konto wirklich zurücksetzen und alle gespeicherten Inhalte löschen?",
    VersaoWeb: "Webversion",
    chooseLanguage: "Wählen Sie eine Sprache:",
    Recomendado: "Empfohlen",
    VocePodeGostar: "Das könnte Ihnen gefallen:",
    shareOnInstagramStories: "In Instagram teilen",
    shareOnSocialMedia: "Auf sozialen Netzwerken teilen:",
    saveAndShare: "Speichern und teilen",
    comment: "Kommentar",

    deixeComentario: "Hinterlassen Sie hier einen Kommentar zum Film...",
  },
  italian: {
    digiteNomeFilme: "Digita il nome del film",
    assistidosEm: "Visti nel",
    melhores: "Migliori",
    descricao: "Descrizione",
    atores: "Attori",
    melhoresFilmesDe: "Migliori film di",
    avaliarFilme: "Valuta il film:",
    avaliacao: "Valutazione",
    cancelar: "Annulla",
    confirmar: "Conferma",
    compartilhar: "Condividi",
    assistirMaisTarde: "Guarda più tardi",
    voceAssistiuEsseFilme: "Hai visto questo film",
    adicionar: "Aggiungi",
    assistidoQuando: "Visto quando?",
    escolherData: "Scegli data",
    hoje: "Oggi",
    RecommendMovie: "Consiglio questo film:",
    ConhecidoPor: "Conosciuto per:",
    Fechar: "Chiudi",
    Biografia: "Biografia:",
    NasceuEm: "Nato il:",
    FilmeJaNaLista: "Questo film è già nella tua lista!",
    Avaliados: "Valutati",
    SeusAvaliados: "I TUOI FILM VALUTATI",
    ParaAssistir: "Da guardare",
    SemAssistir:
      "Non hai film nella tua lista. Aggiungi un film da guardare più tardi cercando nella scheda Raccomandazioni.",
    SemAvaliados: "Non hai valutato alcun film.",
    javiu: "Hai già visto questo film?",
    removeLista: "Rimuovi dalla lista",
    sim: "Sì",
    nao: "No",
    Cancel: "Annulla",
    AddPrompt: "Vuoi aggiungere questo elemento alla lista?",
    AddToList: "Aggiungi alla lista",
    inicio: "Home",
    Listas: "Liste",
    Paravoce: "Per te",
    Perfil: "Profilo",
    Action: "Azione",
    Adventure: "Avventura",
    Animation: "Animazione",
    Comedy: "Commedia",
    Drama: "Dramma",
    Family: "Famiglia",
    Fantasy: "Fantasia",
    Horror: "Orrore",
    Music: "Musica",
    Mystery: "Mistero",
    Romance: "Romantico",
    ScienceFiction: "Fantascienza",
    All: "Tutti",
    RecommendedForYou: "Consigliato per te",
    Todas: "Tutte le piattaforme",
    NoRecommendations: "Non ci sono raccomandazioni al momento...",
    ESTATÍSTICAS: "STATISTICHE",
    Year: "Totale film visti quest'anno:",
    Month: "Totale film visti questo mese:",
    Week: "Totale film visti questa settimana:",
    redefinir: "Reimposta account",
    tema: "Tema Scuro",
    voltar: "Indietro",
    RedefinirConta: "Reimposta account",
    ConfirmacaoRedefinir:
      "Vuoi davvero reimpostare il tuo account e cancellare tutti i contenuti salvati?",
    VersaoWeb: "Versione Web",
    chooseLanguage: "Scegli una lingua:",
    Recomendado: "Raccomandato",
    VocePodeGostar: "Potrebbe piacerti:",
    shareOnInstagramStories: "Condividi nelle Instagram",
    shareOnSocialMedia: "Condividi sui social network:",
    saveAndShare: "Salva e condividi",
    comment: "commento",

    deixeComentario: "Lascia un commento sul film qui...",
  },
  chinese: {
    digiteNomeFilme: "输入电影名称",
    assistidosEm: "观看于",
    melhores: "最佳",
    descricao: "描述",
    atores: "演员",
    melhoresFilmesDe: "最佳电影",
    avaliarFilme: "评价电影：",
    avaliacao: "评分",
    cancelar: "取消",
    confirmar: "确认",
    compartilhar: "分享",
    assistirMaisTarde: "稍后观看",
    voceAssistiuEsseFilme: "你已观看过此电影",
    adicionar: "添加",
    assistidoQuando: "观看时间",
    escolherData: "选择日期",
    hoje: "今天",
    RecommendMovie: "我推荐这部电影：",
    ConhecidoPor: "知名于：",
    Fechar: "关闭",
    Biografia: "传记：",
    NasceuEm: "出生于：",
    FilmeJaNaLista: "这部电影已在你的列表中！",
    Avaliados: "已评价",
    SeusAvaliados: "你的评价电影",
    ParaAssistir: "待观看",
    SemAssistir: "你的列表中没有电影。通过搜索推荐标签页添加电影以便稍后观看。",
    SemAvaliados: "你还没有评价任何电影。",
    javiu: "你看过这部电影吗？",
    removeLista: "从列表中移除",
    sim: "是",
    nao: "否",
    Cancel: "取消",
    AddPrompt: "你想将此项添加到列表中吗？",
    AddToList: "添加到列表",
    inicio: "首页",
    Listas: "列表",
    Paravoce: "为你推荐",
    Perfil: "个人资料",
    Action: "动作",
    Adventure: "冒险",
    Animation: "动画",
    Comedy: "喜剧",
    Drama: "剧情",
    Family: "家庭",
    Fantasy: "幻想",
    Horror: "恐怖",
    Music: "音乐",
    Mystery: "悬疑",
    Romance: "爱情",
    ScienceFiction: "科幻",
    All: "全部",
    RecommendedForYou: "为你推荐",
    Todas: "所有平台",
    NoRecommendations: "目前没有推荐...",
    ESTATÍSTICAS: "统计信息",
    Year: "今年观看的电影总数：",
    Month: "本月观看的电影总数：",
    Week: "本周观看的电影总数：",
    redefinir: "重置账户",
    tema: "暗黑主题",
    voltal: "返回",
    RedefinirConta: "重置账户",
    ConfirmacaoRedefinir: "你确定要重置你的账户并删除所有保存的内容吗？",
    VersaoWeb: "网页版",
    chooseLanguage: "选择语言：",
    Recomendado: "推荐",
    VocePodeGostar: "你可能喜欢：",
    voltar: "返回",
    shareOnInstagramStories: "分享至Instagram",
    shareOnSocialMedia: "在社交网络上分享：",
    saveAndShare: "保存并分享",
    comment: "评论",

    deixeComentario: "在这里留下关于电影的评论...",
  }, // Adicione as traduções para os outros idiomas (francês, alemão, italiano, chinês) usando o mesmo esquema.
};

type Language =
  | "english"
  | "portuguese"
  | "spanish"
  | "french"
  | "german"
  | "italian"
  | "chinese";

interface ConfigurationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translation: (typeof translations)[Language];
}

const defaultState = {
  language: "portuguese" as Language,
  setLanguage: () => {},
  translation: translations["portuguese"],
};

const ConfigurationContext =
  createContext<ConfigurationContextType>(defaultState);

export const useConfiguration = () => useContext(ConfigurationContext);

interface ConfigurationProviderProps {
  children: ReactNode;
}

export const ConfigurationProvider: React.FC<ConfigurationProviderProps> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>("english");

  useEffect(() => {
    const loadLanguage = async () => {
      const storedLanguage = await AsyncStorage.getItem("language");
      if (storedLanguage) {
        setLanguage(storedLanguage as Language);
      } else {
        setLanguage("english"); // Default to English if no language is stored
      }
    };

    loadLanguage();
  }, []);

  const handleSetLanguage = async (language: Language) => {
    await AsyncStorage.setItem("language", language);
    setLanguage(language);
  };

  return (
    <ConfigurationContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        translation: translations[language],
      }}
    >
      {children}
    </ConfigurationContext.Provider>
  );
};
