import React, { useState } from "react";
import {
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Text,
  View,
  Modal,
} from "react-native";
import { useUser } from "../../contexts/UserContext"; // Certifique-se de que esta é a importação correta
import StarRating from "../../components/starComponent/starComponent";
import logo from "../../assets/images/logo.png";
import { useTheme } from "../../constants/temas/ThemeContext";

interface Movie {
  rank?: React.JSX.Element;
  id: number;
  title: string;
  rating: number;
  date: string;
  imageUrl?: string;
}

export default function TabFourScreen() {
  const [activeTab, setActiveTab] = useState("ratedMovies"); // 'ratedMovies' ou 'toWatchMovies'
  const { movies, toWatchMovies, removeFromWatchList, addMovieReview } =
    useUser(); // Adicione toWatchMovies aqui
  const { theme } = useTheme();

  const [showModal, setShowModal] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<Movie | null>(null);

  const openModal = (movie: Movie) => {
    setSelectedMovieId(movie);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMovieId(null); // Limpa o filme selecionado ao fechar o modal
  };

  const confirmRemoveMovie = () => {
    if (selectedMovieId !== null) {
      removeFromWatchList(selectedMovieId.id);

      const movieReview: Movie = {
        id: selectedMovieId.id,
        title: selectedMovieId.title,
        date: new Date().toLocaleDateString(),
        rating: 0,
        imageUrl: selectedMovieId.imageUrl,
        rank: selectedMovieId.rank,
      };
      addMovieReview(movieReview);

      closeModal();
    }
  };

  const moviesSortedByRating = [...movies].sort((a, b) => b.rating - a.rating);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Image source={logo} style={styles.logo} />

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "ratedMovies"
              ? { backgroundColor: theme.borderRed }
              : { backgroundColor: theme.modalBackgroundSecondary },
          ]}
          onPress={() => setActiveTab("ratedMovies")}
        >
          <Text
            style={
              activeTab === "ratedMovies"
                ? [styles.tabText, { color: theme.textButtons }]
                : styles.tabText
            }
          >
            Avaliados
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "toWatchMovies"
              ? { backgroundColor: theme.borderRed }
              : { backgroundColor: theme.modalBackgroundSecondary },
          ]}
          onPress={() => setActiveTab("toWatchMovies")}
        >
          <Text
            style={
              activeTab === "toWatchMovies"
                ? [styles.tabText, { color: theme.text }]
                : styles.tabText
            }
          >
            Para Assistir
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.containerSecondary, { backgroundColor: theme.background }]}>
      {activeTab === "ratedMovies" ? (
        moviesSortedByRating.length > 0 ? (
          <>
            <Text style={[styles.movieListTitle, { color: theme.text }]}>
              SEUS FILMES AVALIADOS
            </Text>
            <FlatList
              style={styles.flatlist}
              data={moviesSortedByRating}
              keyExtractor={(movie) => movie.id.toString()}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <View style={styles.movieItem}>
                  <TouchableOpacity style={styles.movieList}>
                    <View style={styles.imageIndex}>
                      <Text style={[styles.itemIndex, { color: theme.text }]}>
                        {index + 1 + "º"}
                      </Text>
                      <View
                        style={[
                          styles.moviesLists,
                          { backgroundColor: theme.background },
                        ]}
                      >
                        <Image
                          style={styles.movieImage}
                          source={{ uri: item.imageUrl || "default_image_url" }}
                        />
                      </View>
                    </View>
                    <View style={styles.textRate}>
                      <Text
                        style={[styles.textRateText, { color: theme.text }]}
                      >
                        {item.title}
                      </Text>
                      <StarRating rating={item.rating}></StarRating>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            />
          </>
        ) : (
            <Text style={{ color: theme.text, marginTop: 20 }}>
              Você não avaliou nenhum filme.
            </Text>
        )
      ) : toWatchMovies.length > 0 ? (
        <FlatList
          data={toWatchMovies}
          keyExtractor={(movie) => movie.id.toString()}
          numColumns={3}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.toWatchmovieItem}>
              <TouchableOpacity
                style={styles.toWatch}
                onPress={() => openModal(item)}
              >
                <View
                  style={[
                    styles.toWatchmoviesLists,
                    { backgroundColor: theme.background },
                  ]}
                >
                  <Image
                    style={styles.toWatchmovieImage}
                    source={{ uri: item.imageUrl || "default_image_url" }}
                  />
                </View>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <Text
          style={{ color: theme.text, marginTop: 20, paddingHorizontal: 20 }}
        >
          Você não tem nenhum filme na lista. Adicione um filme para assistir
          mais tarde procurando na aba Recomendações.
        </Text>
      )}

</View>



      <Modal
        animationType="fade"
        transparent={true}
        visible={showModal}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent, // Estilos pré-definidos
              { backgroundColor: theme.background }, // Estilo dinâmico baseado no tema atual
            ]}
          >
            <Text style={{ color: theme.text }}>Já assistiu esse filme?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.borderRed },
                ]}
                onPress={confirmRemoveMovie}
              >
                <Text style={{ color: theme.text }}>Sim</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.modalBackground },
                ]}
                onPress={closeModal}
              >
                <Text style={{ color: theme.text }}>Não</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  moviesLists: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 5,
    borderRadius: 15,
  },
  textRate: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    alignSelf: "center",
    width: "100%",
  },
  textRateText: {
    display: "flex",
    flexWrap: "wrap",
    width: "70%",
    fontSize: 18,
    fontWeight: "bold",
  },

  flatlist: {
    width: "100%",
  },
  itemIndex: {
    display: "flex",
    alignSelf: "center",
    fontWeight: "bold",
    fontSize: 18,
  },
  imageIndex: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    marginBottom: 25,
  },
  movieList: {
    width: "90%",
    display: "flex",
    flexDirection: "row",
    gap: 20,
    borderBottomWidth: 2,
    borderBottomColor: "rgba(255,255,255,0.3)",
  },
  scrollView: {
    width: "100%",
  },
  movieRatingText: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 4,
    textAlign: "center",
  },
  container: {
    flex: 1,
    paddingTop: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  containerSecondary: {
    flex: 1,
    alignItems: "center",
    width: '100%'
  },
  logo: {
    marginVertical: 16,
    width: 80,
    height: 80,
    marginBottom: 16,
    resizeMode: "contain",
  },
  movieListTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 35,
    marginTop: 20,
    alignSelf: "center",
  },
  movieItem: {
    width: "100%",
    marginBottom: 16,
    alignItems: "center",
    marginRight: 16,
  },
  movieImage: {
    width: 85,
    height: 130,
    resizeMode: "cover",
    borderRadius: 10,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    marginVertical: 30,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  tabText: {
    color: "#fff", // Cor para abas inativas
    fontWeight: "bold",
  },
  activeTabText: {
    color: "#fff", // Cor para a aba ativa
  },

  toWatch: {
    gap: 20,
  },
  toWatchmovieItem: {
    display: "flex",
    marginBottom: 16,
    alignItems: "center",
    marginHorizontal: 7,
  },
  toWatchmovieImage: {
    width: 120,
    height: 185,
    resizeMode: "cover",
    borderRadius: 10,
  },
  toWatchmoviesLists: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 5,
    borderRadius: 15,
  },

  modalContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.60)",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  modalButton: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 30,
    paddingHorizontal: 35,
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 16,
    gap: 20,
  },
});
