import React from "react";
import { StyleSheet, FlatList, Image, TouchableOpacity, ScrollView } from "react-native";
import { Text, View } from "../../components/Themed";
import { useUser } from "../../contexts/UserContext";
import logo from "../../assets/images/logo.png";

export default function TabThreeScreen() {
  const { movies } = useUser(); // Use o contexto de usuário

  // Ordena os filmes que o usuário assistiu pela classificação que ele deu
  const moviesSortedByRating = [...movies].sort((a, b) => b.rating - a.rating);

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} />
      <ScrollView style={styles.scrollView}>
        <Text style={styles.movieListTitle}>SEUS FILMES AVALIADOS</Text>
        <FlatList
          data={moviesSortedByRating}
          keyExtractor={(movie) => movie.id.toString()}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.movieItem, { marginLeft: 9 }]}>
              <TouchableOpacity>
                <Image
                  style={styles.movieImage}
                  source={{ uri: item.imageUrl || "default_image_url" }} // Substitua "default_image_url" pela URL de uma imagem padrão se necessário
                />
              </TouchableOpacity>
            </View>
          )}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    width: "100%",
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
    marginLeft: 20,
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
