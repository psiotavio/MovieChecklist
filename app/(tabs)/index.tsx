import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  TouchableHighlight,
  Text,
  View,
  Linking,
  Animated,
  ActivityIndicator,
  Platform,
  Share,
  Dimensions,
} from "react-native";
import { TouchableWithoutFeedback, Keyboard } from "react-native";
import axios from "axios";
import StarRating from "../../components/starComponent/starComponent";
import { isSameWeek, isSameYear, isSameMonth, parse } from "date-fns";
import { useUser } from "../../contexts/UserContext";
import logoDefault from "../../assets/images/logo.png";
import logoBlue from "../../assets/images/logoBlue.png";
import logoPink from "../../assets/images/logoPink.png";
import logoGreen from "../../assets/images/logoGreen.png";
import logoRed from "../../assets/images/logoRed.png";
import logoOrange from "../../assets/images/logoOrange.png";
import { useTheme } from "../../constants/temas/ThemeContext";
import Slider from "@react-native-community/slider";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome";
import FastImage from "react-native-fast-image";
import FilterModal from "../../components/FilterModal/FilterModal";
import { CheckBox } from "@rneui/base";
import { useConfiguration } from "../../contexts/ConfigurationContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons } from "@expo/vector-icons";

// import {
//   AdEventType,
//   InterstitialAd,
//   TestIds,
//   BannerAd,
// } from "react-native-google-mobile-ads";

let adUnitId: string;

if (Platform.OS === "ios") {
  adUnitId = "ca-app-pub-4303499199669342/6006099901"; // Coloque o ID do iOS aqui
} else if (Platform.OS === "android") {
  adUnitId = "ca-app-pub-4303499199669342/1108657138"; // Coloque o ID do Android aqui
}

const { width, height } = Dimensions.get("window");
const { translation, language } = useConfiguration();
const isTablet = width >= 768; // Um critério comum para tablets

const BANNER_H = isTablet ? 400 : 250;

type Actor = {
  id: number;
  name: string;
  profilePath?: string; // URL para a foto do perfil do ator, se disponível

  biography?: string;
  birthYear?: string;
  movies?: Movie[];
};

type ActorDetails = {
  id: number;
  name: string;
  biography: string;
  birthYear: string;
  profilePath?: string;
  movies: Movie[];
};

type StreamingPlatform = {
  id: number;
  name: string;
  logoPath?: string;
};

interface Movie {
  rank?: React.JSX.Element;
  id: number;
  title: string;
  rating: number;
  date: string;
  imageUrl?: string;
  comment: string;
  streamingPlatforms?: StreamingPlatform[]; // Adicionado aqui
  genreId?: string;
  alternateImageUrl?: string; // Nova propriedade para o banner do filme
  description?: string; // Descrição do filme
  actors?: Actor[]; // Novo
  similarMovies?: Movie[]; // Novo
}

// let movieList: Movie[] = [];
export function getTotalMoviesWatchedThisYear(movies: Movie[]): number {
  const currentYear = new Date().getFullYear();
  return movies.reduce((count, movie) => {
    const movieYear = new Date(movie.date).getFullYear();
    return movieYear === currentYear ? count + 1 : count;
  }, 0);
}

export function getTotalMoviesWatchedThisWeek(movies: Movie[]): number {
  const currentDate = new Date();
  return movies.reduce((count, movie) => {
    const movieDate = new Date(movie.date);
    return isSameYear(movieDate, currentDate) &&
      isSameWeek(movieDate, currentDate)
      ? count + 1
      : count;
  }, 0);
}

export function getTotalMoviesWatchedThisMonth(movies: Movie[]): number {
  const currentDate = new Date();
  return movies.reduce((count, movie) => {
    const movieDate = new Date(movie.date);
    return isSameYear(movieDate, currentDate) &&
      isSameMonth(movieDate, currentDate)
      ? count + 1
      : count;
  }, 0);
}

export function getAllWatchedMovies(movies: Movie[]): string[] {
  return movies.map((movie) => movie.title);
}

export default function HomeScreen() {
  // // ANUNCIOS
  // const [interstitialLoaded, setInterstitialLoaded] = useState(false);

  // const loadInterstitial = () => {
  //   const unscubscribeLoaded = anuncio.addAdEventListener(
  //     AdEventType.LOADED,
  //     () => {
  //       setInterstitialLoaded(true);
  //     }
  //   );

  //   const unscubscribeClosed = anuncio.addAdEventListener(
  //     AdEventType.CLOSED,
  //     () => {
  //       setInterstitialLoaded(false);
  //       anuncio.load();
  //     }
  //   );

  //   anuncio.load();

  //   return () => {
  //     unscubscribeClosed();
  //     unscubscribeLoaded();
  //   };
  // };

  // useEffect(() => {
  //   const unsubscribeInterstitialEvents = loadInterstitial();
  //   return unsubscribeInterstitialEvents;
  // }, []);

  const [activeTab, setActiveTab] = useState("monthMovies"); // 'monthMovies' ou 'bestMovies'

  const {
    movies,
    addMovieReview,
    recommendedMovies,
    removeFromList,
    fetchMovieDetails,
    addToWatchList,
    fetchActorDetails,
  } = useUser(); // Use o contexto de usuário
  const [movieInput, setMovieInput] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedActor, setSelectedActor] = useState<Actor | null>(null);
  const [selectedMovieRating, setSelectedMovieRating] = useState<Movie | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible1, setModalVisible1] = useState(false);
  const [rating, setRating] = useState(0);
  const TMDB_API_KEY = "172e0af0e176f9c169387e094fb67c75";
  const totalMoviesThisYear = getTotalMoviesWatchedThisYear(movies);
  const totalMoviesThisWeek = getTotalMoviesWatchedThisWeek(movies);
  const totalMoviesThisMonth = getTotalMoviesWatchedThisMonth(movies);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [modalType, setModalType] = useState("");

  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const { theme, themeName } = useTheme();

  // Definindo logos para diferentes temas
  const logos = {
    default: logoDefault,
    dark: logoDefault,
    light: logoDefault,
    dune: logoDefault,
    cosmicDusk: logoDefault,
    lilacNebula: logoDefault,
    shadowOfMordor: logoDefault,
    darkSide: logoDefault,
    neonTwilight: logoDefault,
    dracula: logoDefault,
    bladeRunner: logoDefault,
    violetWitch: logoDefault,
    thanos: logoDefault,
    jediTemple: logoDefault,
    hungerGames: logoDefault,
    neoMatrix: logoDefault,

    // blue: logoBlue,
    // orange: logoOrange,
    // pink: logoPink,
    // lightpink: logoPink,
    // green: logoGreen,
    // red: logoRed,
  };

  // Selecionar logo com base no tema atual
  const logo = logos[themeName] || logos.default;
  const [comment, setComment] = useState(""); // Novo estado para comentário

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isDetailsLoading) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [isDetailsLoading]);

  const { translation, language } = useConfiguration();

  const languageMapping = {
    english: "en-US",
    portuguese: "pt-BR",
    spanish: "es-ES",
    french: "fr-FR",
    german: "de-DE",
    italian: "it-IT",
    chinese: "zh-CN",
  };

  const tmdbLanguage = languageMapping[language]; // Obtém o código de idioma correto para a API

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateModalVisible, setDateModalVisible] = useState(false);

  const handleDateChange = (event: any, date: Date | undefined) => {
    if (Platform.OS === "ios") {
      if (date) {
        setSelectedDate(date);
      } else {
        setDatePickerVisible(false); // Fechar o DatePicker se o usuário cancelar
      }
    } else if (Platform.OS === "android") {
      if (date) {
        setSelectedDate(date);
        setDatePickerVisible(false);
      } else {
        setDatePickerVisible(false); // Fechar o DatePicker se o usuário cancelar
      }
    }
  };

  const searchMovies = async (query: string) => {
    try {
      // Busca por filmes
      const movieResponse = await axios.get(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=${tmdbLanguage}&query=${encodeURIComponent(
          query
        )}`
      );

      let movieResults = [];
      if (movieResponse.data.results) {
        const filteredMovieResults = movieResponse.data.results.filter(
          (movieData: any) => {
            return movieData.overview && movieData.overview.trim().length > 0;
          }
        );

        const sortedMovieResults = filteredMovieResults.sort(
          (a: any, b: any) => {
            const voteCountA = a.vote_count || 0;
            const voteCountB = b.vote_count || 0;

            if (voteCountA < 150 && voteCountB >= 150) {
              return 1;
            } else if (voteCountB < 150 && voteCountA >= 150) {
              return -1;
            } else {
              return voteCountB - voteCountA;
            }
          }
        );

        movieResults = sortedMovieResults.map((movieData: any) => ({
          id: movieData.id,
          title: movieData.title,
          date: new Date().toLocaleDateString(),
          imageUrl: `https://image.tmdb.org/t/p/w500${movieData.poster_path}`,
          type: "movie", // Adiciona um tipo para facilitar a distinção
        }));
      }

      // Busca por atores
      const actorResponse = await axios.get(
        `https://api.themoviedb.org/3/search/person?api_key=${TMDB_API_KEY}&language=${tmdbLanguage}&query=${encodeURIComponent(
          query
        )}`
      );

      let actorResults = [];
      if (actorResponse.data.results) {
        actorResults = actorResponse.data.results.map((actorData: any) => ({
          id: actorData.id,
          title: actorData.name,
          imageUrl: `https://image.tmdb.org/t/p/w500${actorData.profile_path}`,
          type: "actor", // Adiciona um tipo para facilitar a distinção
        }));
      }

      // Combina resultados de filmes e atores, garantindo que os atores fiquem no fim da lista
      const combinedResults = [...movieResults, ...actorResults];

      setSearchResults(combinedResults);
    } catch (error) {
      console.error("Error fetching movies and actors:", error);
    }
  };

  const handleShare = () => {
    if (!selectedMovie) return; // Certifique-se de que há um filme selecionado

    const message = `> ${translation.RecommendMovie} \n\n*${selectedMovie.title}* \n${selectedMovie.description}

    \nLINK: watchfolio.com.br/movie/${selectedMovie.id}/?popup=true`;
    Share.share({
      message,
    }).catch((error) => console.error("Error sharing:", error));
  };

  const handleInputChange = (text: string) => {
    setMovieInput(text);
    searchMovies(text);
  };

  const handleSelectSuggestion = (movie: Movie) => {
    setSelectedMovie(movie);
    setMovieInput(movie.title);
  };

  const handleAddMovie = () => {
    if (!selectedMovie) return;
    const alreadyAdded = movies.some((movie) => movie.id === selectedMovie.id);
    if (alreadyAdded) {
      // Se o filme já foi adicionado, talvez mostrar uma mensagem ou lidar de outra forma.
      alert(translation.FilmeJaNaLista);
      return;
    }
    setDateModalVisible(true);
    setModalVisible(false);
    setMovieInput("");
    setSearchResults([]); // Fecha os resultados da busca imediatamente ao clicar na tela
  };

  const handleRemoveMovie = (movie: Movie) => {
    removeFromList(movie.id);
  };

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    const year = date.getFullYear();

    return `${year}`;
  };

  const getMonthYearTitle = (dateString: string): string => {
    const [day, month, year] = dateString.split("/");
    const dayNumber = parseInt(day, 10);
    const monthNumber = parseInt(month, 10);
    const yearNumber = parseInt(year, 10);

    if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
      console.error(`Invalid month value: ${dateString}`);
      return "";
    }

    const options: Intl.DateTimeFormatOptions = { month: "long" };
    const monthName = new Intl.DateTimeFormat(tmdbLanguage, options).format(
      new Date(yearNumber, monthNumber - 1, 1)
    );

    return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
  };

  interface OrganizedMovies {
    [key: string]: { title: string; data: Movie[] };
  }

  const combineLists = (
    arr1: { title: string; data: Movie[] }[],
    arr2: { title: string; data: Movie[] }[]
  ): { title: string; data: Movie[] }[] => {
    const combinedArray: { title: string; data: Movie[] }[] = [];
    const reversedArr1 = [...arr1].reverse(); // Faz uma cópia de arr1 e inverte a ordem dos elementos

    for (let i = 0; i < Math.max(reversedArr1.length, arr2.length); i++) {
      if (i < reversedArr1.length) {
        combinedArray.push(reversedArr1[i]);
      }
      if (i < arr2.length) {
        combinedArray.push(arr2[i]);
      }
    }

    return combinedArray;
  };

  const monthOrder: { [key: string]: { [key: string]: number } } = {
    english: {
      January: 1,
      February: 2,
      March: 3,
      April: 4,
      May: 5,
      June: 6,
      July: 7,
      August: 8,
      September: 9,
      October: 10,
      November: 11,
      December: 12,
    },
    portuguese: {
      Janeiro: 1,
      Fevereiro: 2,
      Março: 3,
      Abril: 4,
      Maio: 5,
      Junho: 6,
      Julho: 7,
      Agosto: 8,
      Setembro: 9,
      Outubro: 10,
      Novembro: 11,
      Dezembro: 12,
    },
    spanish: {
      Enero: 1,
      Febrero: 2,
      Marzo: 3,
      Abril: 4,
      Mayo: 5,
      Junio: 6,
      Julio: 7,
      Agosto: 8,
      Septiembre: 9,
      Octubre: 10,
      Noviembre: 11,
      Diciembre: 12,
    },
    french: {
      Janvier: 1,
      Février: 2,
      Mars: 3,
      Avril: 4,
      Mai: 5,
      Juin: 6,
      Juillet: 7,
      Août: 8,
      Septembre: 9,
      Octobre: 10,
      Novembre: 11,
      Décembre: 12,
    },
    german: {
      Januar: 1,
      Februar: 2,
      März: 3,
      April: 4,
      Mai: 5,
      Juni: 6,
      Juli: 7,
      August: 8,
      September: 9,
      Oktober: 10,
      November: 11,
      Dezember: 12,
    },
    italian: {
      Gennaio: 1,
      Febbraio: 2,
      Marzo: 3,
      Aprile: 4,
      Maggio: 5,
      Giugno: 6,
      Luglio: 7,
      Agosto: 8,
      Settembre: 9,
      Ottobre: 10,
      Novembre: 11,
      Dicembre: 12,
    },
    chinese: {
      一月: 1,
      二月: 2,
      三月: 3,
      四月: 4,
      五月: 5,
      六月: 6,
      七月: 7,
      八月: 8,
      九月: 9,
      十月: 10,
      十一月: 11,
      十二月: 12,
    },
  };

  const organizedMovies: OrganizedMovies = movies.reduce((acc, movie) => {
    const monthYearTitle = getMonthYearTitle(movie.date); // Usando o novo nome da função

    if (!monthYearTitle) {
      return acc;
    }

    if (!acc[monthYearTitle]) {
      acc[monthYearTitle] = {
        title: `${translation.assistidosEm} ${monthYearTitle}`,
        data: [],
      };
    }

    acc[monthYearTitle].data.push(movie);
    return acc;
  }, {} as OrganizedMovies);

  // Ordenar cada grupo por data em ordem decrescente
  Object.keys(organizedMovies).forEach((month) => {
    organizedMovies[month].data.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; // Ordena de forma decrescente por data
    });
  });

  const organizedMoviesArray = Object.values(organizedMovies).sort((a, b) => {
    const matchA = a.title.match(/(\w+) (\d{4})$/);
    const matchB = b.title.match(/(\w+) (\d{4})$/);

    if (!matchA || !matchB) {
      console.error("Failed to parse month and year from title");
      return 0; // Retorna 0 para manter a ordem original se não conseguir parsear
    }

    const [, monthA, yearA] = matchA;
    const [, monthB, yearB] = matchB;

    const yearDifference = parseInt(yearB) - parseInt(yearA);
    if (yearDifference !== 0) {
      return yearDifference;
    }

    const languageMonthOrder = monthOrder[language]; // Obtemos a ordem dos meses para o idioma atual

    return (
      (languageMonthOrder[monthB] || 0) - (languageMonthOrder[monthA] || 0)
    );
  });

  const parseDate = (dateString: string): Date => {
    const [day, month, year] = dateString.split("/").map(Number);
    return new Date(year, month - 1, day);
  };

  // Cria um array de melhores filmes, removendo "assistidos em" do título
  const bestMoviesArray: { title: string; data: Movie[] }[] =
    organizedMoviesArray.map((item) => {
      const bestMovies = item.data.slice().sort((a, b) => b.rating - a.rating);

      // Expressão regular atualizada para capturar corretamente os meses com acentos
      const match = item.title.match(/([\p{L}\p{M}]+ \d{4})$/u);
      const monthYear = match ? match[1] : "Mês/Ano Desconhecido";

      return {
        title: `${translation.melhoresFilmesDe} ${monthYear}`,
        data: bestMovies.map((movie, index) => ({
          ...movie,
          rank: <Text style={styles.rankNumber}>{index + 1}</Text>,
        })),
      };
    });

  const dismissKeyboardAndResults = () => {
    Keyboard.dismiss();
    setSearchResults([]); // Fecha os resultados da busca imediatamente ao clicar na tela
  };

  const handlePressItemModalType = (item: any) => {
    setModalVisible(false); // Feche o modal atual
    setTimeout(() => {
      if (
        item.type === "movie" ||
        (item &&
          typeof item.title === "string" &&
          typeof item.date === "string")
      ) {
        setSelectedMovie(item);
        setModalType("movie");
        setIsDetailsLoading(true); // Indica que os detalhes estão carregando

        fetchMovieDetails(item.id, 0, " ", (movieDetails) => {
          setSelectedMovie(movieDetails);
          setIsDetailsLoading(false); // Carregamento concluído
        });
      } else {
        setSelectedActor(item);
        setModalType("actor");
        setIsDetailsLoading(true); // Indica que os detalhes estão carregando

        fetchActorDetails(item.id, (actorDetails) => {
          setSelectedActor(actorDetails);
          setIsDetailsLoading(false); // Carregamento concluído
        });
      }
      setModalVisible(true); // Reabra o modal
    }, 300); // Adicione um pequeno atraso para garantir que o modal foi fechado
  };

  const handleAddToList = () => {
    if (selectedMovie) {
      const toWatch: Movie = {
        id: selectedMovie.id,
        title: selectedMovie.title,
        date: new Date().toLocaleDateString(),
        rating: 0,
        imageUrl: selectedMovie.imageUrl,
        rank: selectedMovie.rank,
        comment: " ",
        streamingPlatforms: selectedMovie.streamingPlatforms, // Adicionado aqui

        genreId: selectedMovie.genreId,
        alternateImageUrl: selectedMovie.alternateImageUrl, // Nova propriedade para o banner do filme
        description: selectedMovie.description, // Descrição do filme
        actors: selectedMovie.actors, // Novo
      };

      // if (counter === 2) {
      //   setTimeout(() => {
      //     if (interstitialLoaded) {
      //       anuncio
      //         .show()
      //         .then(() => {
      //           // Recarregar o anúncio para a próxima exibição
      //           anuncio.load();
      //         })
      //         .catch((error) => {
      //           console.error("Erro ao tentar exibir o anúncio: ", error);
      //         });
      //       // Resetar o estado de carregamento do anúncio
      //       setInterstitialLoaded(false);
      //       setCounter(0);
      //     }
      //   }, 2000); // 2000 milissegundos = 2 segundos
      // }

      addToWatchList(toWatch);
      setModalVisible(false);
      setSelectedMovie(null);
    }
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const combinedArray = combineLists(organizedMoviesArray, bestMoviesArray);

  function updateMovieReview(arg0: {
    rating: number;
    rank?: React.JSX.Element | undefined;
    id: number;
    title: string;
    date: string;
    imageUrl?: string | undefined;
  }) {
    throw new Error("Function not implemented.");
  }

  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      edges={["top"]}
      style={[
        styles.container,
        { backgroundColor: theme.background, paddingVertical: 10 },
      ]}
    >
      <Image source={logo} style={styles.logo} />
      <TouchableWithoutFeedback
        onPress={dismissKeyboardAndResults}
        accessible={false}
      >
        <View
          style={{
            height: "100%",
            display: "flex",
            width: "100%",
            alignItems: "center",
          }}
        >
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: theme.background },
            ]}
          >
            <TextInput
              style={[
                styles.input, // Estilos pré-definidos do TextInput
                {
                  color: theme.text,
                  borderColor: theme.borderRed,
                  backgroundColor: theme.modalBackground,
                }, // Estilo dinâmico baseado no tema atual
              ]}
              placeholder={translation.digiteNomeFilme}
              placeholderTextColor={theme.text}
              value={movieInput}
              onChangeText={handleInputChange}
            />
          </View>
          <View style={styles.filterModalButton}>
            <FilterModal />
          </View>
          <View style={styles.moviesLists}>
            <ScrollView
              style={[
                styles.suggestionsContainer,
                { backgroundColor: theme.modalBackground },
              ]}
            >
              {searchResults.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    handleSelectSuggestion(item);
                    handlePressItemModalType(item);
                  }}
                >
                  <View
                    style={[
                      styles.suggestionItem, // Estilo pré-definido
                      { backgroundColor: theme.modalBackground }, // Estilo dinâmico baseado no tema
                    ]}
                  >
                    <View
                      style={[
                        styles.shadowSuggestionContainer,
                        { backgroundColor: theme.modalBackground },
                      ]}
                    >
                      <View style={styles.imageSuggestionContainer}>
                        <Image
                          style={styles.suggestionImage}
                          source={{ uri: item.imageUrl }}
                        />
                      </View>
                    </View>
                    <Text
                      style={{
                        color: theme.text,
                        flexShrink: 1,
                      }}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {item.title}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.tabsContainer}>
            <CheckBox
              center
              title={
                activeTab === "bestMovies"
                  ? translation.melhores
                  : translation.melhores
              }
              iconRight={true}
              size={isTablet ? 26 : 20}
              checkedIcon="dot-circle-o"
              uncheckedIcon="circle-o"
              checked={activeTab === "bestMovies"}
              onPress={() =>
                setActiveTab(
                  activeTab === "bestMovies" ? "monthMovies" : "bestMovies"
                )
              }
              checkedColor={theme.borderRed}
              textStyle={[
                styles.checkboxText,
                {
                  color:
                    activeTab === "bestMovies"
                      ? theme.borderRed
                      : theme.borderBottom,
                },
              ]}
              containerStyle={styles.checkboxContainer}
            />
          </View>

          {activeTab === "monthMovies" ? (
            <ScrollView style={styles.moviesChekclist}>
              {organizedMoviesArray.map((item) => (
                <View
                  key={item.title}
                  style={[
                    styles.movieListContainer,
                    { backgroundColor: theme.background },
                  ]}
                >
                  <Text style={[styles.movieListTitle, { color: theme.text }]}>
                    {item.title}
                  </Text>
                  <View key={item.title} style={styles.flatlist}>
                    <FlatList
                      data={[...item.data].reverse()}
                      keyExtractor={(movie) => movie.id.toString()}
                      horizontal={true}
                      showsHorizontalScrollIndicator={false}
                      renderItem={({ item }) => (
                        <View style={[styles.movieItem, { marginLeft: 9 }]}>
                          <TouchableOpacity
                            key={item.id}
                            onPress={() => {
                              setRating(item.rating);
                              setComment(item.comment);
                              setSelectedMovieRating(item);
                              setSelectedDate(new Date(parseDate(item.date)));
                              setModalVisible1(true);
                            }}
                          >
                            <View
                              style={[
                                styles.shadowContainer,
                                { backgroundColor: theme.modalBackground },
                              ]}
                            >
                              <View style={styles.imageContainer}>
                                <Image
                                  style={styles.movieImage}
                                  source={{ uri: item.imageUrl }}
                                />
                              </View>
                            </View>
                          </TouchableOpacity>
                          <View style={styles.movieInfo}>
                            {item.rank && (
                              <Text style={styles.rankNumber}>{item.rank}</Text>
                            )}
                            <StarRating rating={item.rating}></StarRating>
                          </View>
                        </View>
                      )}
                    />
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <ScrollView style={styles.moviesChekclist}>
              {bestMoviesArray.map((item) => (
                <View
                  key={item.title}
                  style={[
                    styles.movieListContainer,
                    { backgroundColor: theme.background },
                  ]}
                >
                  <Text style={[styles.movieListTitle, { color: theme.text }]}>
                    {item.title}
                  </Text>
                  <View key={item.title} style={styles.flatlist}>
                    <FlatList
                      data={item.data}
                      keyExtractor={(movie) => movie.id.toString()}
                      horizontal={true}
                      showsHorizontalScrollIndicator={false}
                      renderItem={({ item, index }) => (
                        <View style={[styles.movieItem, { marginLeft: 9 }]}>
                          <TouchableOpacity
                            key={item.id}
                            onPress={() => {
                              setRating(item.rating);
                              setSelectedMovieRating(item);
                              setSelectedDate(new Date(parseDate(item.date)));
                              setModalVisible1(true);
                            }}
                          >
                            <View
                              style={[
                                styles.shadowContainer,
                                { backgroundColor: theme.modalBackground },
                              ]}
                            >
                              <View style={styles.imageContainer}>
                                <Image
                                  style={styles.movieImage}
                                  source={{ uri: item.imageUrl }}
                                />
                              </View>
                            </View>
                          </TouchableOpacity>
                          <View style={styles.movieInfo}>
                            {item.rank && (
                              <Text style={styles.rankNumber}>{item.rank}</Text>
                            )}
                            <StarRating rating={item.rating}></StarRating>
                          </View>
                        </View>
                      )}
                    />
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          {/* MODAL DE PARA ASSISTIR MAIS TARDE  */}
          {modalType === "movie" && (
            <Modal
              animationType="slide"
              visible={modalVisible}
              onRequestClose={() => {
                setModalVisible(!modalVisible);
              }}
              presentationStyle="pageSheet"
            >
              <View style={styles.modalContainerMovie}>
                {isDetailsLoading ? (
                  <View
                    style={[
                      styles.modalContentMovie,
                      { backgroundColor: theme.modalBackground },
                    ]}
                  >
                    <ActivityIndicator
                      size="large"
                      color={theme.borderRed}
                      style={{ alignSelf: "center" }}
                    />
                  </View>
                ) : (
                  <View
                    style={[
                      styles.modalContentMovie,
                      { backgroundColor: theme.modalThemeMode },
                    ]}
                  >
                    <Animated.ScrollView
                      style={{
                        flex: 1,
                        width: "100%",
                        backgroundColor: theme.modalBackground,
                        opacity: fadeAnim,
                      }}
                      onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: true }
                      )}
                      scrollEventThrottle={16} // Defina a frequência de eventos de rolagem
                    >
                      <View
                        style={[
                          {
                            display: "flex",
                            flexDirection: "column",
                            height: BANNER_H,
                            backgroundColor: theme.modalBackground,
                          },
                          styles.imageShadowContainerBanner,
                        ]}
                      >
                        <Animated.Image
                          style={[
                            styles.movieImageBanner,
                            {
                              width: "100%",
                              flex: 1,
                              height: BANNER_H,
                              transform: [
                                {
                                  translateY: scrollY.interpolate({
                                    inputRange: [-BANNER_H, 0, BANNER_H],
                                    outputRange: [-BANNER_H / 2, 0, 0], // Previne movimento para cima
                                  }),
                                },
                                {
                                  scale: scrollY.interpolate({
                                    inputRange: [-BANNER_H, 0],
                                    outputRange: [2, 1], // Permite expansão ao puxar para baixo
                                    extrapolateRight: "clamp", // Previne que a escala se ajuste além do especificado
                                  }),
                                },
                              ],
                            },
                          ]}
                          source={{ uri: selectedMovie?.alternateImageUrl }}
                        />
                      </View>

                      <View style={styles.modalInfoContent}>
                        <View style={styles.modalMovieInfo}>
                          <View style={styles.modalMovieTitle}>
                            <View
                              style={[
                                styles.imageShadowContainer,
                                { backgroundColor: theme.modalBackground },
                              ]}
                            >
                              <Image
                                style={styles.movieImageDetails}
                                source={{ uri: selectedMovie?.imageUrl }}
                              />
                            </View>

                            <View style={styles.titleAndDate}>
                              <Text
                                style={[
                                  styles.modalMovieTitleText,
                                  { color: theme.text },
                                ]}
                              >
                                {selectedMovie?.title}
                              </Text>
                              <Text
                                style={[
                                  styles.modalMovieDate,
                                  { color: theme.text },
                                ]}
                              >
                                {formatDate(selectedMovie?.date)}
                              </Text>

                              <TouchableHighlight
                                key={selectedMovie?.id}
                                style={{
                                  ...styles.modalButton,
                                  marginBottom: 10,
                                  backgroundColor: "#4caf50", // Cor verde para diferenciar
                                }}
                                onPress={handleShare}
                              >
                                <Text style={styles.textStyle}>
                                  {translation.compartilhar}
                                </Text>
                              </TouchableHighlight>

                              <TouchableOpacity
                                style={[
                                  styles.modalButton,
                                  { backgroundColor: theme.borderRed },
                                ]}
                                onPress={handleAddToList}
                              >
                                <Text
                                  style={{
                                    color: theme.text,
                                    textAlign: "center",
                                  }}
                                >
                                  {translation.assistirMaisTarde}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>

                          <Text
                            style={{
                              color: theme.text,
                              marginTop: 30,
                              textAlign: "justify",
                            }}
                          >
                            <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                              {translation.descricao}:{" "}
                            </Text>
                            <Text
                              style={[
                                styles.modalText,
                                { color: theme.text, marginBottom: 30 },
                              ]}
                            >
                              {selectedMovie?.description}
                            </Text>
                          </Text>

                          <View style={{ marginTop: 30 }}>
                            <Text
                              style={{
                                color: theme.text,
                                fontWeight: "bold",
                                fontSize: 16,
                              }}
                            >
                              {translation.atores}:
                            </Text>
                            <ScrollView
                              horizontal={true}
                              showsHorizontalScrollIndicator={false}
                              style={styles.actorsContainer}
                            >
                              {selectedMovie?.actors?.map((actor, index) => (
                                <TouchableOpacity
                                  key={index}
                                  onPress={() =>
                                    handlePressItemModalType(actor)
                                  }
                                >
                                  <View key={index} style={styles.actorCard}>
                                    <View
                                      style={[
                                        styles.imageShadowContainerActor,
                                        {
                                          backgroundColor:
                                            theme.modalBackground,
                                        },
                                      ]}
                                    >
                                      <Image
                                        source={{ uri: actor.profilePath! }}
                                        style={styles.actorImage}
                                        resizeMode="cover"
                                      />
                                    </View>
                                    <Text
                                      style={[
                                        styles.modalMovieTitleTextActors,
                                        { color: theme.text },
                                      ]}
                                    >
                                      {actor.name}
                                    </Text>
                                  </View>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>

                          <View style={{ marginTop: 30 }}>
                            <Text
                              style={{
                                color: theme.text,
                                fontWeight: "bold",
                                fontSize: 16,
                              }}
                            >
                              {translation.VocePodeGostar}
                            </Text>
                            <ScrollView
                              horizontal={true}
                              showsHorizontalScrollIndicator={false}
                              style={styles.actorsContainer}
                            >
                              {selectedMovie?.similarMovies?.map(
                                (movie, index) => (
                                  <View key={index} style={styles.movieCard}>
                                    <TouchableOpacity
                                      key={index + 1}
                                      onPress={() =>
                                        handlePressItemModalType(movie)
                                      }
                                    >
                                      <View
                                        style={[
                                          styles.imageShadowContainerMovies,
                                          {
                                            backgroundColor:
                                              theme.modalBackground,
                                          },
                                        ]}
                                      >
                                        <Image
                                          source={{ uri: movie.imageUrl }}
                                          style={styles.MovieImage}
                                          resizeMode="cover"
                                        />
                                      </View>
                                    </TouchableOpacity>
                                  </View>
                                )
                              )}
                            </ScrollView>
                          </View>

                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              flexWrap: "wrap",
                              marginTop: 30,
                            }}
                          >
                            {selectedMovie?.streamingPlatforms
                              ?.filter(
                                (streaming) => streaming.name !== "HBO Max"
                              ) // Supondo que 'name' seja uma propriedade identificadora
                              .map((streaming, index) => (
                                <Image
                                  key={index}
                                  source={{ uri: streaming.logoPath }}
                                  style={{
                                    width: 50, // Defina a largura conforme necessário
                                    height: 50, // Defina a altura conforme necessário
                                    marginRight: 10, // Espaço à direita de cada imagem
                                    borderRadius: 30,
                                  }}
                                  resizeMode="contain"
                                />
                              ))}
                          </View>
                        </View>

                        <View
                          style={{
                            justifyContent: "center",
                            alignContent: "center",
                            alignItems: "center",
                            paddingVertical: 5,
                            marginVertical: 5,
                          }}
                        >
                          <Text
                            style={{
                              color: theme.text,
                              fontSize: 18,
                              fontWeight: "bold",
                              paddingTop: 20,
                            }}
                          >
                            {translation.voceAssistiuEsseFilme}
                          </Text>
                          <View style={{ marginBottom: 50 }}>
                            <View style={styles.modalButtons}>
                              <TouchableHighlight
                                key={1}
                                style={{
                                  ...styles.modalButton,
                                  backgroundColor:
                                    theme.modalBackgroundSecondary,
                                }}
                                onPress={() => {
                                  setModalVisible(false);
                                  setMovieInput("");
                                  setDatePickerVisible(false);
                                  setSearchResults([]);
                                }}
                              >
                                <Text style={styles.textStyle}>
                                  {translation.cancelar}
                                </Text>
                              </TouchableHighlight>
                              <TouchableHighlight
                                key={2}
                                style={{
                                  ...styles.modalButton,
                                  backgroundColor: theme.borderRed,
                                }}
                                onPress={handleAddMovie}
                              >
                                <Text style={styles.textStyle}>
                                  {translation.adicionar}
                                </Text>
                              </TouchableHighlight>
                            </View>
                          </View>
                          {/* <BannerAd
                            unitId={adUnitId}
                            size="BANNER"
                            onAdLoaded={() => {}}
                            onAdFailedToLoad={(error) => {
                              console.error("Ad failed to load", error);
                            }}
                            requestOptions={{
                              requestNonPersonalizedAdsOnly: true,
                            }}
                          /> */}
                        </View>
                      </View>
                    </Animated.ScrollView>
                  </View>
                )}
              </View>
            </Modal>
          )}
          {modalType === "actor" && (
            <Modal
              animationType="slide"
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
              presentationStyle="pageSheet"
            >
              <View style={styles.modalContainerMovie}>
                {isDetailsLoading ? (
                  <View
                    style={[
                      styles.modalContentMovie,
                      { backgroundColor: theme.modalBackground },
                    ]}
                  >
                    <ActivityIndicator
                      size="large"
                      color={theme.borderRed}
                      style={{ alignSelf: "center" }}
                    />
                  </View>
                ) : (
                  <View
                    style={[
                      styles.modalContentMovie,
                      { backgroundColor: theme.modalThemeMode },
                    ]}
                  >
                    <Animated.ScrollView
                      style={{
                        flex: 1,
                        width: "100%",
                        backgroundColor: theme.modalBackground,
                        opacity: fadeAnim,
                      }}
                    >
                      <View style={styles.modalInfoContent}>
                        <View style={styles.modalActorInfo}>
                          <View style={styles.modalActorTitle}>
                            <View
                              style={[
                                styles.imageActorShadowContainer,
                                { backgroundColor: theme.modalBackground },
                              ]}
                            >
                              <Image
                                style={styles.actorImageDetails}
                                source={{ uri: selectedActor?.profilePath }}
                              />
                            </View>
                            <View style={styles.titleAndDate}>
                              <Text
                                style={[
                                  styles.modalMovieTitleText,
                                  { color: theme.text },
                                ]}
                              >
                                {selectedActor?.name}
                              </Text>

                              <View
                                style={{
                                  display: "flex",
                                  flexDirection: "row",
                                  gap: 10,
                                  marginVertical: 10,
                                  alignItems: "center",
                                  alignContent: "center",
                                }}
                              >
                                <Text
                                  style={{
                                    color: theme.text,
                                    fontWeight: "bold",
                                    fontSize: 16,
                                  }}
                                >
                                  {translation.NasceuEm}
                                </Text>
                                <Text style={[{ color: theme.text }]}>
                                  {selectedActor?.birthYear}
                                </Text>
                              </View>

                              <Text
                                style={{
                                  color: theme.text,
                                  fontWeight: "bold",
                                  fontSize: 16,
                                }}
                              >
                                {translation.Biografia}
                              </Text>
                              <Text
                                style={[
                                  styles.modalActorBiography,
                                  { color: theme.text },
                                ]}
                              >
                                {selectedActor?.biography}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <View style={{ marginTop: 30 }}>
                          <Text
                            style={{
                              color: theme.text,
                              fontWeight: "bold",
                              fontSize: 16,
                            }}
                          >
                            {translation.ConhecidoPor}
                          </Text>
                          <ScrollView
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            style={styles.moviesContainer}
                          >
                            {selectedActor?.movies?.map((movie, index) => (
                              <View key={index} style={styles.movieCard}>
                                <TouchableOpacity
                                  key={index}
                                  onPress={() =>
                                    handlePressItemModalType(movie)
                                  }
                                >
                                  <View
                                    style={[
                                      styles.imageShadowContainerMovies,
                                      {
                                        backgroundColor: theme.modalBackground,
                                      },
                                    ]}
                                  >
                                    <Image
                                      source={{ uri: movie.imageUrl }}
                                      style={styles.MovieImage}
                                      resizeMode="cover"
                                    />
                                  </View>
                                  <Text
                                    style={[
                                      styles.modalActorsMovies,
                                      { color: theme.text },
                                    ]}
                                  >
                                    {movie.title}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            ))}
                          </ScrollView>
                        </View>
                      </View>

                      <View
                        style={{
                          marginBottom: 50,
                          alignSelf: "center",
                          justifyContent: "center",
                        }}
                      >
                        <View
                          style={{
                            ...styles.modalButtons,
                            alignSelf: "center",
                            justifyContent: "center",
                          }}
                        >
                          <TouchableHighlight
                            key={4}
                            style={{
                              ...styles.modalButton,
                              backgroundColor: theme.modalBackgroundSecondary,
                              width: "65%",
                              alignSelf: "center",
                              justifyContent: "center",
                            }}
                            onPress={() => {
                              setModalVisible(false);
                              setMovieInput("");
                              setDatePickerVisible(false);
                            }}
                          >
                            <Text style={styles.textStyle}>
                              {translation.Fechar}
                            </Text>
                          </TouchableHighlight>
                        </View>
                        <View
                          style={{
                            justifyContent: "center",
                            alignContent: "center",
                            alignItems: "center",
                            paddingVertical: 5,
                            marginVertical: 5,
                          }}
                        >
                          {/* <BannerAd
                            unitId={adUnitId}
                            size="BANNER"
                            onAdLoaded={() => {}}
                            onAdFailedToLoad={(error) => {
                              console.error("Ad failed to load", error);
                            }}
                            requestOptions={{
                              requestNonPersonalizedAdsOnly: true,
                            }}
                          /> */}
                        </View>
                      </View>
                    </Animated.ScrollView>
                  </View>
                )}
              </View>
            </Modal>
          )}

          <Modal
            animationType="fade"
            transparent={true}
            visible={dateModalVisible}
            onRequestClose={() => {
              setDateModalVisible(!dateModalVisible);
            }}
          >
            <TouchableWithoutFeedback
              onPress={() => setDateModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <TouchableWithoutFeedback>
                  <View
                    style={[
                      styles.modalContent,
                      { backgroundColor: theme.background },
                    ]}
                  >
                    <Text
                      style={{
                        color: theme.text,
                        marginTop: 5,
                        fontSize: 18,
                        fontWeight: "bold",
                      }}
                    >
                      {translation.assistidoQuando}
                    </Text>

                    <View
                      style={[styles.modalButtons2, { marginVertical: 10 }]}
                    >
                      <TouchableHighlight
                        style={{
                          ...styles.openButton,
                          backgroundColor: theme.borderRed,
                        }}
                        onPress={() => {
                          if (selectedMovie && selectedMovie.id) {
                            addMovieReview({
                              ...selectedMovie,
                              date: new Date().toLocaleDateString(),
                              rating,
                            });
                            setDateModalVisible(false);
                            setMovieInput("");
                          }
                        }}
                      >
                        <Text style={styles.textStyle}>{translation.hoje}</Text>
                      </TouchableHighlight>
                      <TouchableHighlight
                        style={{
                          ...styles.openButton,
                          backgroundColor: theme.borderRed,
                        }}
                        onPress={() => setDatePickerVisible(true)}
                      >
                        <Text style={styles.textStyle}>
                          {translation.escolherData +
                            ": " +
                            selectedDate.toLocaleDateString()}
                        </Text>
                      </TouchableHighlight>
                      {datePickerVisible && (
                        <DateTimePicker
                          testID="dateTimePicker"
                          value={selectedDate}
                          mode="date"
                          is24Hour={true}
                          display="spinner"
                          onChange={handleDateChange}
                        />
                      )}
                    </View>
                    <View style={styles.modalButtons}>
                      <TouchableHighlight
                        style={{
                          ...styles.modalButton,
                          backgroundColor: theme.modalBackgroundSecondary,
                        }}
                        onPress={() => {
                          setDateModalVisible(false);
                          setMovieInput("");
                          setDatePickerVisible(false);
                          setSearchResults([]);
                        }}
                      >
                        <Text style={styles.textStyle}>
                          {translation.cancelar}
                        </Text>
                      </TouchableHighlight>
                      <TouchableHighlight
                        style={{
                          ...styles.modalButton,
                          backgroundColor: theme.borderRed,
                        }}
                        onPress={() => {
                          if (
                            !selectedMovie ||
                            !selectedDate ||
                            selectedMovie.id === undefined
                          ) {
                            console.log(
                              "Filme, data ou ID do filme não selecionados"
                            );
                            return; // Encerra a função se não houver filme, data ou ID do filme definido
                          }

                          // Se `selectedMovie` e `selectedDate` estiverem definidos e `selectedMovie.id` não for undefined
                          const formattedDate =
                            selectedDate.toLocaleDateString();
                          const newMovieReview = {
                            ...selectedMovie, // Espalha todas as propriedades de selectedMovie
                            date: formattedDate,
                            rating: rating,
                          };

                          addMovieReview(newMovieReview);
                          setSelectedMovie(null);
                          setRating(0);
                          setMovieInput("");
                          setSearchResults([]);
                          setDateModalVisible(false);
                          setSelectedDate(new Date());
                        }}
                      >
                        <Text style={styles.textStyle}>
                          {translation.confirmar}
                        </Text>
                      </TouchableHighlight>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          {/* Modal de Avaliar */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible1}
            onRequestClose={() => {
              setModalVisible1(!modalVisible1);
            }}
          >
            <TouchableWithoutFeedback
              onPress={() => {
                setModalVisible1(false);
              }}
            >
              <View style={styles.modalContainer}>
                <TouchableWithoutFeedback
                  onPress={() => {
                    Keyboard.dismiss();
                  }}
                >
                  <View
                    style={[
                      styles.modalContent,
                      { backgroundColor: theme.background },
                    ]}
                  >
                    <TouchableHighlight
                      style={styles.modalButtonIcon}
                      onPress={() => {
                        handleRemoveMovie(selectedMovieRating!);
                        setModalVisible1(false);
                        setRating(0);
                      }}
                    >
                      <Icon name="trash" size={24} color={theme.errorColor} />
                    </TouchableHighlight>

                    <TouchableHighlight
                      style={styles.modalButtonIconCalendar}
                      onPress={() => setDatePickerVisible(true)}
                    >
                      <MaterialIcons
                        name="calendar-today"
                        size={24}
                        color={theme.text}
                      />
                    </TouchableHighlight>

                    {datePickerVisible && (
                      <DateTimePicker
                        testID="dateTimePicker"
                        value={selectedDate}
                        mode="date"
                        is24Hour={true}
                        display="default"
                        onChange={handleDateChange}
                      />
                    )}

                    <Text style={{ color: theme.text, marginTop: 5 }}>
                      {translation.avaliarFilme}
                    </Text>
                    <Text
                      style={{
                        color: theme.text,
                        fontWeight: "bold",
                        fontSize: 18,
                        marginTop: 10,
                        textAlign: "center",
                      }}
                    >
                      {selectedMovieRating?.title}
                    </Text>
                    <View style={{ marginTop: 20, transform: "scale(1.3)" }}>
                      <StarRating rating={rating}></StarRating>
                    </View>

                    <View style={styles.ratingButtons}>
                      <View style={styles.slider}>
                        <Slider
                          style={{ width: 200, height: 40 }}
                          minimumValue={0}
                          maximumValue={5}
                          step={0.5}
                          value={rating}
                          onValueChange={setRating}
                          minimumTrackTintColor={theme.borderRed}
                          maximumTrackTintColor={theme.modalBackgroundSecondary}
                          thumbTintColor={theme.text}
                        />
                        <Text style={{ color: theme.text, marginTop: 10 }}>
                          {translation.avaliacao}: {rating.toFixed(1)}
                        </Text>
                      </View>
                    </View>

                    {/* Adiciona campo de comentário */}
                    <TextInput
                      style={[
                        styles.commentInput,
                        {
                          color: theme.text,
                          borderColor: theme.borderRed,
                          backgroundColor: theme.modalBackground,
                        },
                      ]}
                      placeholder={translation.deixeComentario}
                      placeholderTextColor={theme.text}
                      value={comment}
                      onChangeText={setComment}
                      maxLength={500}
                      multiline={true}
                    />

                    <View style={styles.modalButtons}>
                      <TouchableHighlight
                        style={{
                          ...styles.modalButton,
                          backgroundColor: theme.modalBackgroundSecondary,
                        }}
                        onPress={() => {
                          setModalVisible1(false);
                          setDatePickerVisible(false);
                        }}
                      >
                        <Text style={styles.textStyle}>
                          {translation.cancelar}
                        </Text>
                      </TouchableHighlight>
                      <TouchableHighlight
                        style={{
                          ...styles.modalButton,
                          backgroundColor: theme.borderRed,
                        }}
                        onPress={() => {
                          if (selectedMovieRating) {
                            const formattedDate =
                              selectedDate.toLocaleDateString();
                            addMovieReview({
                              ...selectedMovieRating,
                              date: formattedDate,
                              rating: rating,
                              comment: comment, // Adiciona o comentário ao salvar a avaliação
                            });
                            setModalVisible1(false);
                            setRating(0);
                            setComment(""); // Limpa o campo de comentário
                          }
                        }}
                      >
                        <Text style={styles.textStyle}>
                          {translation.confirmar}
                        </Text>
                      </TouchableHighlight>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalActorInfo: {},
  modalActorTitle: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    marginTop: 35,
  },
  modalActorDate: {
    fontSize: 14,
    marginTop: 5,
  },
  modalActorBiography: {
    fontSize: 14,
    marginTop: 10,
    textAlign: "justify",
  },
  moviesContainer: {
    width: "100%",
  },
  movieCard: {
    padding: 10,
    alignItems: "center",
  },
  modalMovieTitleTextMovies: {
    fontSize: 16,
    textAlign: "center",
  },
  imageShadowContainerMovie: {
    width: 90,
    height: 125,
    marginBottom: 5,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 5,
  },

  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginHorizontal: 10,
    marginTop: 20,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  inputContainer: {
    width: "85%",
    flexDirection: "row",
    alignItems: "center",
    zIndex: 9999,
  },

  input: {
    borderRadius: 50,
    flex: 1,
    height: 40,
    borderWidth: 2.5,
    paddingLeft: 8,
    position: "relative",
  },
  suggestionsContainer: {
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
  },
  moviesLists: {
    display: "flex",
    zIndex: 2,
    width: "80%",
    maxHeight: isTablet ? 400 : 240,
    marginBottom: 16,
    position: "absolute",
    top: 36,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  suggestionImage: {
    width: "100%", // Preenche o contêiner da imagem
    height: "100%", // Preenche o contêiner da imagem
    resizeMode: "cover", // Ajusta a imagem para cobrir o contêiner
  },
  suggestionText: {
    flexShrink: 1,
  },
  movieItem: {
    marginBottom: 16,
    alignItems: "center",
  },

  shadowContainer: {
    width: isTablet ? 155 : 120,
    height: isTablet ? 235 : 185,
    marginBottom: 8,
    borderRadius: 10,
    shadowColor: "#000", // Cor da sombra
    shadowOffset: { width: 0, height: 2 }, // Deslocamento da sombra
    shadowOpacity: 1, // Opacidade da sombra
    shadowRadius: 3, // Raio da sombra
    elevation: 5, // Adiciona sombra no Android
  },

  imageContainer: {
    width: "100%", // Usa 100% do contêiner de sombra
    height: "100%", // Usa 100% do contêiner de sombra
    borderRadius: 8, // Arredonda as bordas da imagem
    overflow: "hidden", // Mantém a imagem dentro do contorno arredondado
  },
  shadowSuggestionContainer: {
    width: isTablet ? 60 : 50,
    height: isTablet ? 90 : 75,
    marginBottom: 5,
    borderRadius: 10,
    shadowColor: "#000", // Cor da sombra
    shadowOffset: { width: 0, height: 2 }, // Deslocamento da sombra
    shadowOpacity: 1, // Opacidade da sombra
    shadowRadius: 3, // Raio da sombra
    elevation: 5, // Adiciona sombra no Android
    marginRight: 15,
    marginLeft: 10,
  },

  imageSuggestionContainer: {
    width: "100%", // Usa 100% do contêiner de sombra
    height: "100%", // Usa 100% do contêiner de sombra
    borderRadius: 8, // Arredonda as bordas da imagem
    overflow: "hidden", // Mantém a imagem dentro do contorno arredondado
  },

  movieImage: {
    width: "100%", // Preenche o contêiner da imagem
    height: "100%", // Preenche o contêiner da imagem
    resizeMode: "cover", // Ajusta a imagem para cobrir o contêiner
  },

  movieImageDetails: {
    width: isTablet ? 150 : 100,
    height: isTablet ? 230 : 150,
    resizeMode: "cover",
    borderRadius: 10,
  },
  actorImageDetails: {
    width: isTablet ? 250 : 200,
    height: isTablet ? 360 : 280,
    resizeMode: "cover",
    borderRadius: 10,
  },

  movieInfo: {
    textAlign: "center",
    width: 90,
    justifyContent: "center",
  },
  modalContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.60)",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 30,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 16,
  },
  modalButtons2: {
    flexDirection: "column",
    marginTop: 16,
  },
  modalButton: {
    borderRadius: 30,
    padding: 10,
    marginHorizontal: 8,
  },
  modalButtonIcon: {
    padding: 5,
    top: 10,
    right: 18,
    position: "absolute",
  },
  modalButtonIconCalendar: {
    padding: 5,
    top: 10,
    left: 18,
    position: "absolute",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },

  ratingButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  ratingButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    margin: 5,
    borderRadius: 5,
  },
  movieListContainer: {
    display: "flex",
    marginBottom: 16,
  },
  movieListTitle: {
    marginLeft: 10,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 2,
  },
  moviesChekclist: {
    marginBottom: 100,
    marginTop: 20,
    width: "100%",
  },
  flatlist: {},
  logo: {
    marginBottom: 30,
    alignSelf: "center",
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  rankNumber: {
    position: "absolute",
    bottom: 20,
    right: isTablet ? -25 : -5,
    fontSize: 90,
    color: "rgba(255, 255, 255, 1)",
    textShadowColor: "rgba(0, 0, 0, 1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
    zIndex: 1,
    fontWeight: "bold",
  },
  slider: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    paddingVertical: 10,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  filterModalButton: {
    position: "absolute",
    bottom: 90,
    right: 0,
    padding: 20,
    zIndex: 99999,
  },

  // Estilos do modal
  modalContainerMovie: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.60)",
  },
  modalContentMovie: {
    justifyContent: "center",
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    width: "100%",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  modalInfoContent: {
    paddingHorizontal: 20,
  },
  modalMovieInfo: {},
  modalMovieTitle: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
  },
  modalActorTitles: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginVertical: 20,
    marginTop: 50,
    justifyContent: "center",
  },
  titleAndDate: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  modalMovieTitleText: {
    flexWrap: "wrap",
    fontWeight: "bold",
    fontSize: 18,
    flex: 1,
    marginTop: 10,
  },
  modalMovieDate: {
    flexWrap: "wrap",
    fontSize: 14,
    flex: 1,
  },
  modalMovieTitleTextActors: {
    fontSize: 16,
    textAlign: "left",
    fontStyle: "italic",
    flex: 1,
  },
  modalActorsMovies: {
    width: 110,
    fontSize: 14,
    textAlign: "center",
    flexWrap: "wrap",
  },
  modalText: {
    fontSize: 18,
    textAlign: "justify",
  },
  modalButtonsContainer: {
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    paddingBottom: 10,
    width: "100%",
  },
  modalButtonsContainerAll: {
    flexDirection: "column",
    gap: 10,
    paddingVertical: 20,
    alignItems: "center",
  },
  movieImageBanner: {
    width: "100%",
    flex: 1,
    resizeMode: "cover",
  },

  imageShadowContainer: {
    width: isTablet ? 150 : 100,
    height: isTablet ? 230 : 150,
    marginBottom: 5,
    borderRadius: 10,
    shadowColor: "#000", // Cor da sombra
    shadowOffset: { width: 0, height: 2 }, // Deslocamento da sombra
    shadowOpacity: 1, // Opacidade da sombra
    shadowRadius: 3, // Raio da sombra
    elevation: 5, // Adiciona sombra no Android
  },
  imageActorShadowContainer: {
    width: isTablet ? 250 : 200,
    height: isTablet ? 360 : 280,
    marginBottom: 5,
    borderRadius: 10,
    shadowColor: "#000", // Cor da sombra
    shadowOffset: { width: 0, height: 2 }, // Deslocamento da sombra
    shadowOpacity: 1, // Opacidade da sombra
    shadowRadius: 3, // Raio da sombra
    elevation: 5, // Adiciona sombra no Android
  },

  imageShadowContainerBanner: {
    marginBottom: 30,
    shadowColor: "#000", // Cor da sombra
    shadowOffset: { width: 0, height: 2 }, // Deslocamento da sombra
    shadowOpacity: 1, // Opacidade da sombra
    shadowRadius: 3, // Raio da sombra
    elevation: 5, // Adiciona sombra no Android
  },
  imageShadowContainerActor: {
    width: 90,
    height: 125,
    marginBottom: 5,
    borderRadius: 10,
    shadowColor: "#000", // Cor da sombra
    shadowOffset: { width: 0, height: 2 }, // Deslocamento da sombra
    shadowOpacity: 1, // Opacidade da sombra
    shadowRadius: 3, // Raio da sombra
    elevation: 5, // Adiciona sombra no Android
  },
  imageShadowContainerMovies: {
    width: 120,
    height: 175,
    marginBottom: 5,
    borderRadius: 10,
    shadowColor: "#000", // Cor da sombra
    shadowOffset: { width: 0, height: 2 }, // Deslocamento da sombra
    shadowOpacity: 1, // Opacidade da sombra
    shadowRadius: 3, // Raio da sombra
    elevation: 5, // Adiciona sombra no Android
  },

  actorsContainer: {
    width: "100%",
  },
  actorCard: {
    padding: 10,
    alignItems: "center",
  },
  actorImage: {
    width: 90,
    height: 125,
    objectFit: "cover",
    borderRadius: 10,
    marginBottom: 10,
  },
  MovieImage: {
    width: 120,
    height: 175,
    objectFit: "cover",
    borderRadius: 10,
    marginBottom: 10,
  },

  //tabs
  tabsContainer: {
    display: "flex",
    position: "absolute",
    justifyContent: "center",
    top: isTablet ? -80 : -100,
    right: isTablet ? 40 : 20,
    zIndex: 9,
  },

  checkboxText: {
    fontSize: isTablet ? 18 : 17,
  },
  checkboxContainer: {
    backgroundColor: "transparent",
    borderWidth: 0,
    padding: 0,
  },
  commentInput: {
    height: 100, // Altura do campo de comentário
    borderWidth: 1, // Largura da borda do campo
    padding: 10, // Espaçamento interno
    borderRadius: 5, // Bordas arredondadas
    marginTop: 20, // Espaçamento superior
    width: "100%", // Largura total do campo
  },
});
