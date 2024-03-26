import React from "react";
import {
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Text,
  View,
} from "react-native";
import { useUser } from "../../contexts/UserContext"; // Certifique-se de que esta é a importação correta
import StarRating from "../../components/starComponent/starComponent";
import logo from "../../assets/images/logo.png";
import { useTheme } from "../../constants/temas/ThemeContext";

export default function TabFourScreen() {
  const { movies } = useUser();
  const { theme } = useTheme();

  const moviesSortedByRating = [...movies].sort((a, b) => b.rating - a.rating);

  return (
    <View style={[styles.container , {backgroundColor: theme.background}]}>
      <Image source={logo} style={styles.logo} />
      <Text style={[styles.movieListTitle, {color: theme.text}]}>SEUS FILMES AVALIADOS</Text>
      <FlatList
        data={moviesSortedByRating}
        keyExtractor={(movie) => movie.id.toString()}
        numColumns={3}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.movieItem, { marginLeft: 9 }]}>
            <TouchableOpacity>
              <Image
                style={styles.movieImage}
                source={{ uri: item.imageUrl || "default_image_url" }}
              />
              <StarRating rating={item.rating}></StarRating>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 16,
    marginTop: 20,
    alignSelf: "center",
  },
  movieItem: {
    marginBottom: 16,
    alignItems: "center",
    marginRight: 16,
  },
  movieImage: {
    width: 100,
    height: 150,
    resizeMode: "cover",
    borderRadius: 10,
  },
});
