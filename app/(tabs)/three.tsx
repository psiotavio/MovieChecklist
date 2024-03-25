import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { Text, View } from "../../components/Themed";
import { useUser } from "../../contexts/UserContext";
import logo from "../../assets/images/logo.png";

export default function TabThreeScreen() {
  const { recommendedMovies, recommendedByGenre } = useUser();
  const [selectedGenre, setSelectedGenre] = useState('Recomendado para você');
  const [isLoading, setIsLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  // Update the initial 'all' value to 'Recomendado para você' in genres array
  const genres = ['Recomendado para você', ...Object.keys(recommendedByGenre)];

  useEffect(() => {
    setIsLoading(true);
  
    const checkIfMoviesAreLoaded = () => {
      const moviesToCheck = selectedGenre === 'Recomendado para você' ? recommendedMovies : recommendedByGenre[selectedGenre];
      if (moviesToCheck && moviesToCheck.length >= 6) {
        setIsLoading(false);
      }
    };
  
    checkIfMoviesAreLoaded();
  }, [recommendedMovies, recommendedByGenre, selectedGenre]);
  
  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} />
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setShowDropdown(true)}
      >
        <Text style={styles.dropdownButtonText}>
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
          <View style={styles.dropdown}>
            <ScrollView>
              {genres.map((genre) => (
                <TouchableOpacity
                  key={genre}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedGenre(genre);
                    setShowDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{genre}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
      <Text style={styles.movieListTitle}>{selectedGenre.toUpperCase()}</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={selectedGenre === 'Recomendado para você' ? recommendedMovies : recommendedByGenre[selectedGenre]}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          renderItem={({ item }) => (
            <View style={styles.movieItem}>
              <TouchableOpacity>
                <Image
                  style={styles.movieImage}
                  source={{ uri: item.imageUrl }}
                />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  logo: {
    width: 80,
    height: 80,
    marginVertical: 16,
    resizeMode: 'contain',
  },
  dropdownButton: {
    width: '90%',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 20,
    marginBottom: 20,
  },
  dropdownButtonText: {
    fontSize: 18,
    textAlign: 'center',
  },
  dropdownOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dropdown: {
    width: '80%',
    maxHeight: '60%',
    borderRadius: 20,
  },
  dropdownItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
  },
  dropdownItemText: {
    textAlign:"center",
    fontSize: 18,
  },
  movieListTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 16,
    alignSelf: 'flex-start', // Alinha o texto à esquerda
    marginLeft: 20,
  },
  movieItem: {
    margin: 10, // Espaçamento em todos os lados
    alignItems: 'center',
  },
  movieImage: {
    width: 100,
    height: 150,
    borderRadius: 10,
    resizeMode: 'cover',
  },
});