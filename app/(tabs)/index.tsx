import React, { useEffect, useState } from "react";
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

interface Movie {
  rank?: React.JSX.Element;
  id: number;
  title: string;
  rating: number;
  date: string;
  imageUrl?: string;
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
  const { movies, addMovieReview, recommendedMovies } = useUser(); // Use o contexto de usuário
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

  const { theme, toggleTheme } = useTheme();

  const searchMovies = async (query: string) => {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
          query
        )}`
      );

      if (response.data.results) {
        const results = response.data.results.map((movieData: any) => ({
          id: movieData.id,
          title: movieData.title,
          rating: 0,
          date: new Date().toLocaleDateString(),
          imageUrl: `https://image.tmdb.org/t/p/w500${movieData.poster_path}`,
        }));

        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Erro ao buscar filmes:", error);
    }
  };

  const handleInputChange = (text: string) => {
    setMovieInput(text);
    searchMovies(text);
  };

  const handleSelectSuggestion = (movie: Movie) => {
    setSelectedMovie(movie);
    setMovieInput(movie.title);
    setModalVisible(true);
  };

  const handleAddMovie = () => {
    if (!selectedMovie) return;

    const alreadyAdded = movies.some((movie) => movie.id === selectedMovie.id);
    if (!alreadyAdded) {
      addMovieReview({
        ...selectedMovie,
        rating: rating,
      });
    }

    setModalVisible(false);
    setSelectedMovie(null);
    setRating(0);
    setMovieInput("");
    setSearchResults([]);
  };

  const getMonthTitle = (dateString: string): string => {
    const [, month] = dateString.split("/");
    const monthNumber = parseInt(month, 10);

    if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
      console.error(`Invalid month value: ${dateString}`);
      return "";
    }

    const options: Intl.DateTimeFormatOptions = { month: "long" };
    const monthName = new Intl.DateTimeFormat("pt-BR", options).format(
      new Date(2000, monthNumber - 1, 1)
    );

    return monthName.charAt(0).toUpperCase() + monthName.slice(1);
  };

  interface OrganizedMovies {
    [key: string]: { title: string; data: Movie[] };
  }

  const combineLists = (
    arr1: { title: string; data: Movie[] }[],
    arr2: { title: string; data: Movie[] }[]
  ): { title: string; data: Movie[] }[] => {
    const combinedArray: { title: string; data: Movie[] }[] = [];

    for (let i = 0; i < Math.max(arr1.length, arr2.length); i++) {
      if (i < arr1.length) {
        combinedArray.push(arr1[i]);
      }
      if (i < arr2.length) {
        combinedArray.push(arr2[i]);
      }
    }

    return combinedArray;
  };

  const organizedMovies: OrganizedMovies = movies.reduce((acc, movie) => {
    const monthTitle = getMonthTitle(movie.date);

    if (!monthTitle) {
      return acc;
    }

    if (!acc[monthTitle]) {
      acc[monthTitle] = { title: `Assistidos em ${monthTitle}`, data: [] };
    }

    acc[monthTitle].data.push(movie);
    return acc;
  }, {} as OrganizedMovies);

  const organizedMoviesArray = Object.values(organizedMovies);
  const bestMoviesArray: { title: string; data: Movie[] }[] =
    organizedMoviesArray.map((item) => {
      const bestMovies = item.data
        .slice()
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);

      return {
        title: `Melhores filmes de ${item.title.substring(13)}`,
        data: bestMovies.map((movie, index) => ({
          ...movie,
          rank: <Text style={styles.rankNumber}>{index + 1}</Text>,
        })),
      };
    });

  const dismissKeyboardAndResults = () => {
    setSearchResults([]);
    Keyboard.dismiss();
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
        // Simplesmente ocultar os resultados da pesquisa quando o teclado for fechado
        setSearchResults([]);
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
              placeholder="Digite o nome do filme"
              placeholderTextColor={theme.text}
              value={movieInput}
              onChangeText={handleInputChange}
            />
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
                    <Image
                      style={styles.suggestionImage}
                      source={{ uri: item.imageUrl }}
                    />
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

          <ScrollView style={styles.moviesChekclist}>
            {combinedArray.map((item) => (
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
                          <View style={styles.shadowContainer}>
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

            <Modal
              animationType="fade"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => {
                setModalVisible(!modalVisible);
              }}
            >
              <View style={styles.modalContainer}>
                <View
                  style={[
                    styles.modalContent, // Estilos pré-definidos
                    { backgroundColor: theme.background }, // Estilo dinâmico baseado no tema atual
                  ]}
                >
                  <Text
                    style={
                      { color: theme.text } // Estilo dinâmico baseado no tema atual
                    }
                  >
                    Adicionar o Filme {selectedMovie?.title}
                  </Text>
                  <View
                    style={{
                      ...styles.modalButtons,
                    }}
                  >
                    <TouchableHighlight
                      style={{
                        ...styles.modalButton,
                        backgroundColor: theme.modalBackgroundSecondary,
                      }}
                      onPress={() => {
                        setModalVisible(false);
                      }}
                    >
                      <Text style={styles.textStyle}>Cancelar</Text>
                    </TouchableHighlight>
                    <TouchableHighlight
                      style={{
                        ...styles.modalButton,
                        backgroundColor: theme.borderRed,
                      }}
                      onPress={handleAddMovie}
                    >
                      <Text style={styles.textStyle}>Adicionar</Text>
                    </TouchableHighlight>
                  </View>
                </View>
              </View>
            </Modal>
          </ScrollView>

          {/* Modal de Avaliar */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible1}
            onRequestClose={() => {
              setModalVisible1(!modalVisible1);
            }}
          >
            <View style={styles.modalContainer}>
              <View
                style={[
                  styles.modalContent, // Estilos pré-definidos
                  { backgroundColor: theme.background }, // Estilo dinâmico baseado no tema atual
                ]}
              >
                <Text
                  style={
                    { color: theme.text, marginTop: 5 } // Estilo dinâmico baseado no tema atual
                  }
                >
                  Avaliar o Filme:
                </Text>
                <Text
                  style={
                    {
                      color: theme.text,
                      fontWeight: "bold",
                      fontSize: 18,
                      marginTop: 10,
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
                      Avaliação: {rating.toFixed(1)}
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
                    <Text style={styles.textStyle}>Cancelar</Text>
                  </TouchableHighlight>
                  <TouchableHighlight
                    style={{
                      ...styles.modalButton,
                      backgroundColor: theme.borderRed,
                    }}
                    onPress={() => {
                      if (selectedMovieRating) {
                        addMovieReview({
                          ...selectedMovieRating,
                          rating: rating,
                        });
                        setModalVisible1(false);
                        setRating(0);
                      }
                    }}
                  >
                    <Text style={styles.textStyle}>Confirmar</Text>
                  </TouchableHighlight>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    maxHeight: 240,
    marginBottom: 16,
    position: "absolute",
    top: 170,
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
    borderRadius: 5,
    width: 50,
    height: 75,
    resizeMode: "cover",
    marginRight: 15,
    marginLeft: 10,
  },
  suggestionText: {
    flexShrink: 1,
  },
  movieItem: {
    marginBottom: 16,
    alignItems: "center",
  },

  shadowContainer: {
    width: 120,
    height: 185,
    marginBottom: 8,
    borderRadius: 10, // Mantém as bordas arredondadas para a sombra
    backgroundColor: "white", // A cor de fundo é necessária para a sombra aparecer
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

  movieImage: {
    width: "100%", // Preenche o contêiner da imagem
    height: "100%", // Preenche o contêiner da imagem
    resizeMode: "cover", // Ajusta a imagem para cobrir o contêiner
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
    padding: 22,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 16,
  },
  modalButton: {
    borderRadius: 30,
    padding: 10,
    marginHorizontal: 8,
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
  },
  moviesChekclist: {
    marginTop: 35,
    width: "100%",
    height: "100%",
    display: "flex",
    flex: 1,
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
    bottom: 15,
    right: 0,
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
});
