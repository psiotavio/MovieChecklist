import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  TouchableHighlight,
} from "react-native";
import axios from "axios";
import StarRating from "../../components/starComponent/starComponent";
import { Text, View } from "../../components/Themed";
import { useColorScheme } from "react-native";

import { isSameWeek, isSameYear, isSameMonth, parse } from "date-fns";

import logo from "../../assets/images/logo.png";

interface Movie {
  rank?: React.JSX.Element;
  id: number;
  title: string;
  rating: number;
  date: string;
  imageUrl?: string;
}

let movieList: Movie[] = [];

export function getTotalMoviesWatchedThisYear(): number {
  const currentYear = new Date().getFullYear();
  const totalMoviesWatched = movieList.reduce((count, movie) => {
    const dateParts = movie.date.split("/");
    const movieYear = dateParts.length === 3 ? parseInt(dateParts[2], 10) : NaN;

    return !isNaN(movieYear) && movieYear === currentYear ? count + 1 : count;
  }, 0);

  return totalMoviesWatched;
}

export function getTotalMoviesWatchedThisWeek(): number {
  const currentDate = new Date();

  const totalMoviesWatched = movieList.reduce((count, movie) => {
    try {
      const movieDate = parse(movie.date, "dd/MM/yyyy", new Date());

      if (
        isSameYear(movieDate, currentDate) &&
        isSameWeek(movieDate, currentDate)
      ) {
        return count + 1;
      }
    } catch (error) {}

    return count;
  }, 0);

  return totalMoviesWatched;
}

export function getTotalMoviesWatchedThisMonth(): number {
  const currentDate = new Date();

  const totalMoviesWatched = movieList.reduce((count, movie) => {
    try {
      const movieDate = parse(movie.date, "dd/MM/yyyy", new Date());

      if (
        isSameYear(movieDate, currentDate) &&
        isSameMonth(movieDate, currentDate)
      ) {
        return count + 1;
      }
    } catch (error) {}

    return count;
  }, 0);

  return totalMoviesWatched;
}

export function getAllWatchedMovies(): string[] {
  const watchedMovieTitles = movieList.map((movie) => movie.title);
  return watchedMovieTitles;
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [movieInput, setMovieInput] = useState<string>("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedMovieRating, setSelectedMovieRating] = useState<Movie | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible1, setModalVisible1] = useState(false);
  const [rating, setRating] = useState<number>(0);

  const TMDB_API_KEY = "172e0af0e176f9c169387e094fb67c75";

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
    if (!selectedMovie) {
      return;
    }

    const alreadyAdded = movies.some((movie) => movie.id === selectedMovie.id);

    if (!alreadyAdded) {
      const updatedMovies = [...movies, selectedMovie];
      setMovies(updatedMovies);
      movieList = updatedMovies;
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

  const combinedArray = combineLists(organizedMoviesArray, bestMoviesArray);

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} />

      <View style={styles.inputContainer}>
        <TextInput
          style={{
            ...styles.input,
            color: colorScheme === "dark" ? "white" : "black",
          }}
          placeholder="Digite o nome do filme"
          value={movieInput}
          onChangeText={handleInputChange}
        />
      </View>
      <View style={styles.moviesLists}>
        <ScrollView style={styles.suggestionsContainer}>
          {searchResults.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleSelectSuggestion(item)}
            >
              <View
                style={{
                  ...styles.suggestionItem,
                  backgroundColor: colorScheme === "dark" ? "black" : "white",
                }}
              >
                <Image
                  style={styles.suggestionImage}
                  source={{ uri: item.imageUrl }}
                />
                <Text style={styles.suggestionText}>{item.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.moviesChekclist}>
        {combinedArray.map((item) => (
          <View key={item.title} style={styles.movieListContainer}>
            <Text style={styles.movieListTitle}>{item.title}</Text>
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
                      <Image
                        style={styles.movieImage}
                        source={{ uri: item.imageUrl }}
                      />
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

        {/* Modal de Confirmar */}

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
              style={{
                ...styles.modalContent,
                backgroundColor: colorScheme === "dark" ? "#435E79" : "white",
              }}
            >
              <Text>Adicionar o Filme {selectedMovie?.title}</Text>
              <View
                style={{
                  ...styles.modalButtons,
                  backgroundColor: colorScheme === "dark" ? "#435E79" : "white",
                }}
              >
                <TouchableHighlight
                  style={{ ...styles.modalButton, backgroundColor: "#2196F3" }}
                  onPress={() => {
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.textStyle}>Cancelar</Text>
                </TouchableHighlight>
                <TouchableHighlight
                  style={{ ...styles.modalButton, backgroundColor: "#2196F3" }}
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
          <View style={styles.modalContent}>
            <Text>Avaliar o Filme {selectedMovieRating?.title}</Text>
            <View style={styles.ratingButtons}>
              <TouchableOpacity
                style={styles.ratingButton}
                onPress={() => {
                  if (selectedMovieRating && rating > 0) {
                    setRating((prev) => prev - 0.5);
                  }
                }}
              >
                <Text style={styles.textStyle}>-</Text>
              </TouchableOpacity>
              <Text>{rating}</Text>
              <TouchableOpacity
                style={styles.ratingButton}
                onPress={() => {
                  if (selectedMovieRating && rating < 5) {
                    setRating((prev) => prev + 0.5);
                  }
                }}
              >
                <Text style={styles.textStyle}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalButtons}>
              <TouchableHighlight
                style={{ ...styles.modalButton, backgroundColor: "#2196F3" }}
                onPress={() => {
                  setModalVisible1(false);
                }}
              >
                <Text style={styles.textStyle}>Cancelar</Text>
              </TouchableHighlight>
              <TouchableHighlight
                style={{ ...styles.modalButton, backgroundColor: "#2196F3" }}
                onPress={() => {
                  if (selectedMovieRating) {
                    const updatedMovies = movies.map((movie) =>
                      movie.id === selectedMovieRating.id
                        ? { ...movie, rating: rating }
                        : movie
                    );
                    setMovies(updatedMovies);
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56,
    alignItems: "center",
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
    zIndex: 1,
  },

  input: {
    borderRadius: 50,
    flex: 1,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    paddingLeft: 8,
    position: "relative",
  },
  suggestionsContainer: {
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
  },
  moviesLists: {
    backgroundColor: "rgba(0,0,0,0)",
    display: "flex",
    zIndex: 2,
    width: "80%",
    maxHeight: 200,
    marginBottom: 16,
    position: "absolute",
    top: 210,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 6,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  suggestionImage: {
    width: 20,
    height: 40,
    resizeMode: "cover",
    marginRight: 15,
    marginLeft: 10,
  },
  suggestionText: {},
  movieItem: {
    marginBottom: 16,
    alignItems: "center",
  },
  movieImage: {
    width: 100,
    height: 150,
    resizeMode: "cover",
    marginBottom: 8,
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
    filter: "blur(10)",
  },
  modalContent: {
    padding: 22,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 16,
  },
  modalButton: {
    borderRadius: 4,
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
  },
  flatlist: {},
  logo: {
    marginVertical: 16,
    width: 80,
    height: 80,
    marginBottom: 16,
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
});
