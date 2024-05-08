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
import logo from "../../assets/images/logo.png";
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

// let adUnitId: string;

// if (Platform.OS === 'ios') {
//     adUnitId = "ca-app-pub-1771446730721916/1536500762"; // Coloque o ID do iOS aqui
// } else if (Platform.OS === 'android') {
//     adUnitId = "ca-app-pub-1771446730721916/6230272284"; // Coloque o ID do Android aqui
// }

const { width, height } = Dimensions.get("window");

const isTablet = width >= 768; // Um critério comum para tablets

const BANNER_H = isTablet ? 400 : 250;

type Actor = {
  id: number;
  name: string;
  profilePath?: string; // URL para a foto do perfil do ator, se disponível
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

  streamingPlatforms?: StreamingPlatform[]; // Adicionado aqui
  genreId?: string;
  alternateImageUrl?: string; // Nova propriedade para o banner do filme
  description?: string; // Descrição do filme
  actors?: Actor[]; // Novo
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
  } = useUser(); // Use o contexto de usuário
  const [movieInput, setMovieInput] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
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

  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const { theme, toggleTheme } = useTheme();

  const { language } = useConfiguration();

  const languageMapping = {
    english: "en-US",
    portuguese: "pt-BR",
    spanish: "es-ES",
    french: "fr-FR",
    german: "de-DE",
  };

  const tmdbLanguage = languageMapping[language]; // Obtém o código de idioma correto para a API

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
    },
    spanish: {
      digiteNomeFilme: "Escribe el nombre de la película",
      assistidosEm: "Vistos en",
      melhores: "Mejores",
      descricao: "Descripción",
      atores: "Actores",
      melhoresFilmesDe: "Mejores películas de",
      avaliarFilme: "Evaluar la película:",
      avaliacao: "Evaluación",
      cancelar: "Cancelar",
      confirmar: "Confirmar",
      compartilhar: "Compartir",
      assistirMaisTarde: "Ver más tarde",
      voceAssistiuEsseFilme: "Has visto esta película",
      adicionar: "Añadir",
      assistidoQuando: "¿Cuándo viste?",
      escolherData: "Elegir fecha",
      hoje: "Hoy",
    },
    french: {
      digiteNomeFilme: "Tapez le nom du film",
      assistidosEm: "Regardés en",
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
      voceAssistiuEsseFilme: "Vous avez regardé ce film",
      adicionar: "Ajouter",
      assistidoQuando: "Regardé quand ?",
      escolherData: "Choisir une date",
      hoje: "Aujourd'hui",
    },
    german: {
      digiteNomeFilme: "Geben Sie den Namen des Films ein",
      assistidosEm: "Gesehen in",
      melhores: "Besten",
      descricao: "Beschreibung",
      atores: "Schauspieler",
      melhoresFilmesDe: "Beste Filme von",
      avaliarFilme: "Den Film bewerten:",
      avaliacao: "Bewertung",
      cancelar: "Abbrechen",
      confirmar: "Bestätigen",
      compartilhar: "Teilen",
      assistirMaisTarde: "Später ansehen",
      voceAssistiuEsseFilme: "Sie haben diesen Film gesehen",
      adicionar: "Hinzufügen",
      assistidoQuando: "Wann gesehen?",
      escolherData: "Datum auswählen",
      hoje: "Heute"
    },
  };

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateModalVisible, setDateModalVisible] = useState(false);

  const handleDateChange = (event: any, date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setDatePickerVisible(false); // Fechar o DatePicker após a seleção
    } else {
      setDatePickerVisible(false); // Fechar o DatePicker se o usuário cancelar
    }
  };

  const searchMovies = async (query: string) => {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=${tmdbLanguage}&query=${encodeURIComponent(
          query
        )}`
      );

      if (response.data.results) {
        const filteredResults = response.data.results.filter(
          (movieData: any) => {
            return movieData.overview && movieData.overview.trim().length > 0;
          }
        );

        // Ordenar os resultados com base no número de avaliações
        const sortedResults = filteredResults.sort((a: any, b: any) => {
          const voteCountA = a.vote_count || 0; // Atribui 0 se vote_count não estiver definido
          const voteCountB = b.vote_count || 0;

          if (voteCountA < 150 && voteCountB >= 150) {
            return 1; // Move A para o final se A tem menos de 150 avaliações e B tem 150 ou mais
          } else if (voteCountB < 150 && voteCountA >= 150) {
            return -1; // Move B para o final se B tem menos de 150 avaliações e A tem 150 ou mais
          } else {
            return voteCountB - voteCountA; // Ordena por maior número de avaliações se ambos têm mais de 150 avaliações
          }
        });

        const results = sortedResults.map((movieData: any) => ({
          id: movieData.id,
          title: movieData.title,
          date: new Date().toLocaleDateString(),
          imageUrl: `https://image.tmdb.org/t/p/w500${movieData.poster_path}`,
        }));

        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  const handleShare = () => {
    if (!selectedMovie) return; // Certifique-se de que há um filme selecionado

    const message = `> Recomendo esse filme:\n\n*${selectedMovie.title}* \n${selectedMovie.description}

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
    setModalVisible(true);

    fetchMovieDetails(movie.id, 0, (movieDetails) => {
      setIsDetailsLoading(false); // Inicia o loading
      setSelectedMovie(movieDetails);
    });
  };

  const handleAddMovie = () => {
    if (!selectedMovie) return;
    const alreadyAdded = movies.some((movie) => movie.id === selectedMovie.id);
    if (alreadyAdded) {
      // Se o filme já foi adicionado, talvez mostrar uma mensagem ou lidar de outra forma.
      alert("Este filme já está na sua lista!");
      return;
    }
    setDateModalVisible(true);
    setModalVisible(false);
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
    // Corrigindo para assumir o formato "DD/MM/YYYY"
    const [day, month, year] = dateString.split("/");
    const dayNumber = parseInt(day, 10);
    const monthNumber = parseInt(month, 10);
    const yearNumber = parseInt(year, 10);

    if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
        console.error(`Invalid month value: ${dateString}`);
        return "";
    }

    const options: Intl.DateTimeFormatOptions = { month: "long" };
    // Usando o mês e ano corretamente convertidos para números
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

  const monthOrder: { [key: string]: number } = {
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
  };


  const organizedMovies: OrganizedMovies = movies.reduce((acc, movie) => {
    const monthYearTitle = getMonthYearTitle(movie.date);  // Usando o novo nome da função

    if (!monthYearTitle) {
      return acc;
    }

    if (!acc[monthYearTitle]) {
      acc[monthYearTitle] = {
        title: `${translations[language].assistidosEm} ${monthYearTitle}`,
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
    console.error('Failed to parse month and year from title');
    return 0; // Retorna 0 para manter a ordem original se não conseguir parsear
  }

  const [, monthA, yearA] = matchA;
  const [, monthB, yearB] = matchB;


  const yearDifference = parseInt(yearB) - parseInt(yearA);
  if (yearDifference !== 0) {
    return yearDifference;
  }

  return monthOrder[monthB] - monthOrder[monthA];
});


// Cria um array de melhores filmes, removendo "assistidos em" do título
const bestMoviesArray: { title: string; data: Movie[] }[] = organizedMoviesArray.map((item) => {
  const bestMovies = item.data.slice().sort((a, b) => b.rating - a.rating);

  // Expressão regular atualizada para capturar corretamente os meses com acentos
  const match = item.title.match(/([\p{L}\p{M}]+ \d{4})$/u);
  const monthYear = match ? match[1] : "Mês/Ano Desconhecido";

  return {
    title: `${translations[language].melhoresFilmesDe} ${monthYear}`,
    data: bestMovies.map((movie, index) => ({
      ...movie,
      rank: <Text style={styles.rankNumber}>{index + 1}</Text>,
    })),
  };
});



  const dismissKeyboardAndResults = () => {
    Keyboard.dismiss();
    setTimeout(() => {
      setSearchResults([]);
    }, 1500);
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

        setTimeout(() => {
          setSearchResults([]);
        }, 1500);
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
              placeholder={translations[language].digiteNomeFilme}
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
                  onPress={() => handleSelectSuggestion(item)}
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
                  ? translations[language].melhores
                  : translations[language].melhores
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
                      data={item.data}
                      keyExtractor={(movie) => movie.id.toString()}
                      horizontal={true}
                      showsHorizontalScrollIndicator={false}
                      renderItem={({ item, index }) => (
                        <View style={[styles.movieItem, { marginLeft: 9 }]}>
                          <TouchableOpacity
                            onPress={() => {
                              setRating(item.rating);
                              setSelectedMovieRating(item);
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
              {bestMoviesArray.reverse().map((item) => (
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
                            onPress={() => {
                              setRating(item.rating);
                              setSelectedMovieRating(item);
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
                              style={{
                                ...styles.modalButton,
                                marginBottom: 10,
                                backgroundColor: "#4caf50", // Cor verde para diferenciar
                              }}
                              onPress={handleShare}
                            >
                              <Text style={styles.textStyle}>
                                {translations[language].compartilhar}
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
                                {translations[language].assistirMaisTarde}
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
                            {translations[language].descricao}:{" "}
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
                            {translations[language].atores}:
                          </Text>
                          <ScrollView
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            style={styles.actorsContainer}
                          >
                            {selectedMovie?.actors?.map((actor, index) => (
                              <View key={index} style={styles.actorCard}>
                                <View
                                  style={[
                                    styles.imageShadowContainerActor,
                                    { backgroundColor: theme.modalBackground },
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
                            ))}
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
                          {translations[language].voceAssistiuEsseFilme}
                        </Text>
                        <View style={{ marginBottom: 50 }}>
                          <View style={styles.modalButtons}>
                            <TouchableHighlight
                              style={{
                                ...styles.modalButton,
                                backgroundColor: theme.modalBackgroundSecondary,
                              }}
                              onPress={() => {
                                setModalVisible(false);
                                setMovieInput("");
                              }}
                            >
                              <Text style={styles.textStyle}>
                                {translations[language].cancelar}
                              </Text>
                            </TouchableHighlight>
                            <TouchableHighlight
                              style={{
                                ...styles.modalButton,
                                backgroundColor: theme.borderRed,
                              }}
                              onPress={handleAddMovie}
                            >
                              <Text style={styles.textStyle}>
                                {translations[language].adicionar}
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
                     {translations[language].assistidoQuando}
                    </Text>

                    <View style={[styles.modalButtons2, {marginVertical: 10}]}>
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
                        <Text style={styles.textStyle}>{translations[language].hoje}</Text>
                      </TouchableHighlight>
                      <TouchableHighlight
                        style={{
                          ...styles.openButton,
                          backgroundColor: theme.borderRed,
                        }}
                        onPress={() => setDatePickerVisible(true)}
                      >
                        <Text style={styles.textStyle}>{translations[language].escolherData}</Text>
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
                        }}
                      >
                        <Text style={styles.textStyle}>{translations[language].cancelar}</Text>
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
                        }}
                      >
                        <Text style={styles.textStyle}>{translations[language].confirmar}</Text>
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
            <TouchableWithoutFeedback onPress={() => setModalVisible1(false)}>
              <View style={styles.modalContainer}>
                <TouchableWithoutFeedback>
                  <View
                    style={[
                      styles.modalContent, // Estilos pré-definidos
                      { backgroundColor: theme.background }, // Estilo dinâmico baseado no tema atual
                    ]}
                  >
                    <TouchableHighlight
                      style={{
                        ...styles.modalButtonIcon,
                      }}
                      onPress={() => {
                        handleRemoveMovie(selectedMovieRating!);
                        setModalVisible1(false);
                        setRating(0);
                      }}
                    >
                      <Icon name="trash" size={24} color={theme.errorColor} />
                    </TouchableHighlight>

                    <TouchableHighlight
                        style={{
                          ...styles.modalButtonIconCalendar,
                        }}
                        onPress={() => setDatePickerVisible(true)}
                      >
                         <MaterialIcons name="calendar-today" size={24} color="white" />
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

                    <Text
                      style={
                        { color: theme.text, marginTop: 5 } // Estilo dinâmico baseado no tema atual
                      }
                    >
                      {translations[language].avaliarFilme}
                    </Text>
                    <Text
                      style={
                        {
                          color: theme.text,
                          fontWeight: "bold",
                          fontSize: 18,
                          marginTop: 10,
                          textAlign: "center",
                        } // Estilo dinâmico baseado no tema atual
                      }
                    >
                      {selectedMovieRating?.title}
                    </Text>
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
                          {translations[language].avaliacao}:{" "}
                          {rating.toFixed(1)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.modalButtons}>
                      <TouchableHighlight
                        style={{
                          ...styles.modalButton,
                          backgroundColor: theme.modalBackgroundSecondary,
                        }}
                        onPress={() => {
                          setModalVisible1(false);
                        }}
                      >
                        <Text style={styles.textStyle}>
                          {translations[language].cancelar}
                        </Text>
                      </TouchableHighlight>
                      <TouchableHighlight
                        style={{
                          ...styles.modalButton,
                          backgroundColor: theme.borderRed,
                        }}
                        onPress={() => {
  
                            // Se `selectedMovie` e `selectedDate` estiverem definidos e `selectedMovie.id` não for undefined
                            const formattedDate =
                              selectedDate.toLocaleDateString();

                          if (selectedMovieRating) {
                            addMovieReview({
                              ...selectedMovieRating,
                              date: formattedDate,
                              rating: rating,
                            });
                            setModalVisible1(false);
                            setRating(0);
                          }
                        }}
                      >
                        <Text style={styles.textStyle}>
                          {translations[language].confirmar}
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
    paddingVertical: 20,
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
});
