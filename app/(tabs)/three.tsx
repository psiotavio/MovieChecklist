import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  View,
  Button, // Adicionando Button do React Native
} from "react-native";
import { useUser } from "../../contexts/UserContext";
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

export default function TabThreeScreen() {
  const { recommendedMovies, recommendedByGenre, addToWatchList } = useUser(); // Supondo que `addToWatchList` é o método do contexto
  const [selectedGenre, setSelectedGenre] = useState("Recomendado para você");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false); // Estado para controlar a visibilidade do modal
  const [genres, setGenres] = useState(["Recomendado para você"]);
  const { theme } = useTheme();

  useEffect(() => {
    console.log(recommendedByGenre);
    if (Object.keys(recommendedByGenre).length) {
      setGenres(["Recomendado para você", ...Object.keys(recommendedByGenre)]);
      console.log(genres);
    }
  }, [recommendedByGenre]);

  useEffect(() => {
    const moviesToCheck =
      selectedGenre === "Recomendado para você"
        ? recommendedMovies
        : recommendedByGenre[selectedGenre];
    setIsLoading(!moviesToCheck || moviesToCheck.length === 0);
  }, [recommendedMovies, selectedGenre]);

  const openModal = (movie: Movie) => {
    setSelectedMovie(movie);
    setShowModal(true);
  };

  const handleAddToList = () => {
    if (selectedMovie) {


      const toWatch: Movie = {
        id: selectedMovie.id,
        title: selectedMovie.title, 
        date: new Date().toLocaleDateString(), 
        rating: 0,
        imageUrl: selectedMovie.imageUrl,
        rank: selectedMovie.rank
      };


      addToWatchList(toWatch);
      closeModal();
      setSelectedMovie(null);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

 

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Image source={logo} style={styles.logo} />
      <TouchableOpacity
        style={[styles.dropdownButton, { borderColor: theme.borderRed }]}
        onPress={() => setShowDropdown(true)}
      >
        <Text style={[styles.dropdownButtonText, { color: theme.text }]}>
          {selectedGenre}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPressOut={() => setShowDropdown(false)}
        >
          <View
            style={[
              styles.dropdown,
              ,
              {
                backgroundColor: theme.modalBackground,
                borderColor: theme.borderRed,
              },
            ]}
          >
            <ScrollView>
              {genres.map((genre) => (
                <TouchableOpacity
                  key={genre}
                  style={[
                    styles.dropdownItem,
                    { backgroundColor: theme.modalBackground },
                  ]}
                  onPress={() => {
                    setSelectedGenre(genre);
                    setShowDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      { color: theme.text, borderBottomColor: theme.borderRed },
                    ]}
                  >
                    {genre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <Text style={[styles.movieListTitle, { color: theme.text }]}>
        {selectedGenre.toUpperCase()}
      </Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={
            selectedGenre === "Recomendado para você"
              ? recommendedMovies
              : recommendedByGenre[selectedGenre]
          }
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.movieItem}>
             <TouchableOpacity onPress={() => openModal(item as Movie)}>
                <View
                  style={[
                    styles.shadowContainer,
                    { backgroundColor: theme.background },
                  ]}
                >
                  <Image
                    style={styles.movieImage}
                    source={{ uri: item.imageUrl }}
                  />
                </View>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={showModal}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.modalBackground },
            ]}
          >
            <Text style={[styles.modalText, { color: theme.text }]}>
              Deseja adicionar este item à lista?
            </Text>
            <View style={styles.modalButtonsContainer}>
              <View
                style={[
                  styles.buttonContainer,
                  { backgroundColor: theme.borderRed },
                ]}
              >
                <Button
                  title="Adicionar à lista"
                  onPress={handleAddToList}
                  color={theme.text}
                />
              </View>
              <View
                style={[
                  styles.buttonContainer,
                  { backgroundColor: theme.modalBackgroundSecondary },
                ]}
              >
                <Button
                  title="Cancelar"
                  onPress={closeModal}
                  color={theme.text}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    padding: 5,
    paddingHorizontal: 15,
    borderRadius: 30,
  },
  shadowContainer: {
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 5,
  },
  container: {
    flex: 1,
    paddingTop: 56,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  logo: {
    width: 80,
    height: 80,
    marginVertical: 16,
    marginBottom: 40,
    resizeMode: "contain",
  },
  dropdownButton: {
    width: "90%",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 2.5,
    borderRadius: 20,
    marginBottom: 20,
  },
  dropdownButtonText: {
    fontSize: 18,
    textAlign: "center",
  },
  dropdownOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  dropdown: {
    width: "80%",
    maxHeight: "60%",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
  },
  dropdownItem: {
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: "rgba(0,0,0,0.2)",
  },
  dropdownItemText: {
    textAlign: "center",
    fontSize: 18,
  },
  movieListTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 16,
    alignSelf: "flex-start",
    marginLeft: 20,
  },
  movieItem: {
    margin: 10,
    alignItems: "center",
  },
  movieImage: {
    width: 100,
    height: 150,
    borderRadius: 10,
    resizeMode: "cover",
  },

  // Estilos do modal
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.60)",
    filter: "blur(10)",
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
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    
  },
  modalButtonsContainer: {
    flexDirection: "row",
    gap: 25,
    width: "100%",
  },
});
