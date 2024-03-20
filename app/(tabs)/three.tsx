import React, { useState } from "react";
import {
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Text, View } from "../../components/Themed";
import { useUser } from "../../contexts/UserContext";
import logo from "../../assets/images/logo.png";

export default function TabThreeScreen() {
  const { recommendedMovies, recommendedByGenre } = useUser(); // Use o contexto de usuário

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} />
      <ScrollView style={styles.scrollView}>
        <Text style={styles.movieListTitle}>BASEADO NAS SUAS ESCOLHAS</Text>
        <FlatList
          data={recommendedMovies}
          keyExtractor={(movie) => movie.id.toString()}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={5}
          renderItem={({ item }) => (
            <View style={[styles.movieItem, { marginLeft: 9 }]}>
              <TouchableOpacity>
                <Image
                  style={styles.movieImage}
                  source={{ uri: item.imageUrl }}
                />
              </TouchableOpacity>
            </View>
          )}
        />

        {Object.entries(recommendedByGenre).map(([genre, movies]) => (
          <View key={genre} style={styles.genreSection}>
            <Text style={styles.movieListTitle}>{genre.toUpperCase()}</Text>
            <FlatList
              data={movies}
              keyExtractor={(item) => item.id.toString()}
              horizontal={true}
              initialNumToRender={10} 
              maxToRenderPerBatch={5} 
              windowSize={5}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={[styles.movieItem, { marginLeft: 9 }]}>
                  <TouchableOpacity>
                    <Image
                      style={styles.movieImage}
                      source={{ uri: item.imageUrl }}
                    />
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    width: "100%",
  },
  genreSection: {},
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
    marginTop: 20, // Ajuste conforme necessário para espaçamento
    marginLeft: 20,
  },
  movieItem: {
    marginBottom: 16,
    alignItems: "center",
    marginRight: 16, // Ajuste conforme necessário para espaçamento
  },
  movieImage: {
    width: 100,
    height: 150,
    resizeMode: "cover",
    borderRadius: 10,
  },
});
