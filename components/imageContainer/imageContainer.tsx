import React from "react";
import {
  View,
  Image,
  StyleSheet,
  ImageStyle,
  ViewStyle,
  Dimensions,
} from "react-native";
import { useTheme } from "../../constants/temas/ThemeContext";

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768; // Um critério comum para tablets

type ImageContainerProps = {
  uri: string;
  type: number;
};

const ImageContainer: React.FC<ImageContainerProps> = ({ uri, type }) => {
  const { theme } = useTheme();

  const getContainerStyle = (): ViewStyle => {
    switch (type) {
      case 1:
        return {
          ...styles.imageShadowContainer,
          backgroundColor: theme.modalBackground,
        };
      case 2:
        return {
          ...styles.imageShadowContainerActor,
          backgroundColor: theme.modalBackground,
        };
      case 3:
        return {
          ...styles.imageShadowContainerMovies,
          backgroundColor: theme.modalBackground,
        };
      case 4:
        return {
          ...styles.imageShadowContainerMoviesPNG,
          backgroundColor: theme.modalBackground,
        };
      default:
        return {};
    }
  };

  const getImageStyle = (): ImageStyle => {
    switch (type) {
      case 1:
        return styles.movieImage;
      case 2:
        return styles.actorImage;
      case 3:
        return styles.movieImageSimilar;
      case 4:
        return styles.movieImagePNG;
      default:
        return {};
    }
  };

  return (
    <View style={getContainerStyle()}>
      <Image source={{ uri }} style={getImageStyle()} resizeMode="cover" />
    </View>
  );
};

const styles = StyleSheet.create({
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

  imageShadowContainerMovies: {
    width: 120,
    height: 175,
    marginBottom: 5,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 5,
  },
  imageShadowContainerMoviesPNG: {
    width: 120/1.3,
    height: 175/1.3,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 5,
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

  actorImage: {
    width: 90,
    height: 125,
    objectFit: "cover",
    borderRadius: 10,
    marginBottom: 10,
  },

  movieImage: {
    width: isTablet ? 150 : 100,
    height: isTablet ? 230 : 150,
    borderRadius: 10,
    resizeMode: "cover",
  },

  movieImageSimilar: {
    width: 120,
    height: 175,
    objectFit: "cover",
    borderRadius: 10,
    marginBottom: 10,
  },
  movieImagePNG: {
    width: 120/1.3,
    height: 175/1.3,
    objectFit: "cover",
    borderRadius: 10,
    marginBottom: 10,
  },
});

export default ImageContainer;
