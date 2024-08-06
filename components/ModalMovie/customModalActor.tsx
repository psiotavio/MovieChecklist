import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  View,
  TouchableHighlight,
  Dimensions,
  Platform,
  Animated,
} from "react-native";
import ImageContainer from "../imageContainer/imageContainer";
import { useTheme } from "../../constants/temas/ThemeContext";
import { useConfiguration } from "../../contexts/ConfigurationContext";
const { width } = Dimensions.get("window");
const isTablet = width >= 768;
import {
  AdEventType,
  BannerAd,
  InterstitialAd,
  TestIds,
} from "react-native-google-mobile-ads";

//  // ANUNCIOS
let adUnitId: string;


if (Platform.OS === "ios") {
  adUnitId = "ca-app-pub-4303499199669342/6006099901"; // Coloque o ID do iOS aqui
} else if (Platform.OS === "android") {
  adUnitId = "ca-app-pub-4303499199669342/1108657138"; // Coloque o ID do Android aqui
}


interface ActorDetails {
  id: number;
  name: string;
  profilePath?: string; // URL para a foto do perfil do ator, se disponível
  biography?: string;
  birthYear?: string;
  movies?: Movie[];
}

interface Movie {
  id: number;
  title: string;
  rating: number;
  date: string;
  imageUrl?: string;
}

interface CustomModalActorProps {
  showModalActor: boolean;
  isDetailsLoading: boolean;
  selectedActor: ActorDetails | null;
  closeModal: () => void;
  openModal: (movieId: number) => void;
}

const CustomModalActor: React.FC<CustomModalActorProps> = ({
  showModalActor,
  isDetailsLoading,
  selectedActor,
  closeModal,
  openModal,
}) => {
  const { theme } = useTheme();
  const { translation, language } = useConfiguration();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isDetailsLoading) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [isDetailsLoading]);

  return (
    <Modal
      animationType="slide"
      visible={showModalActor}
      onRequestClose={closeModal}
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
                opacity: fadeAnim,
              }}
            >
              <View style={styles.modalInfoContent}>
                <View style={styles.modalActorInfo}>
                  <View style={styles.modalActorTitle}>
                    <View
                      style={[
                        styles.imageActorShadowContainer,
                        { backgroundColor: theme.modalBackground },
                      ]}
                    >
                      <Image
                        style={styles.actorImageDetails}
                        source={{ uri: selectedActor?.profilePath }}
                      />
                    </View>
                    <View style={styles.titleAndDate}>
                      <Text
                        style={[
                          styles.modalMovieTitleText,
                          { color: theme.text },
                        ]}
                      >
                        {selectedActor?.name}
                      </Text>

                      <View
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          gap: 10,
                          marginVertical: 10,
                          alignItems: "center",
                          alignContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: theme.text,
                            fontWeight: "bold",
                            fontSize: 16,
                          }}
                        >
                          {translation.NasceuEm}
                        </Text>
                        <Text style={[{ color: theme.text }]}>
                          {selectedActor?.birthYear}
                        </Text>
                      </View>

                      <Text
                        style={{
                          color: theme.text,
                          fontWeight: "bold",
                          fontSize: 16,
                        }}
                      >
                        {translation.Biografia}
                      </Text>
                      <Text
                        style={[
                          styles.modalActorBiography,
                          { color: theme.text },
                        ]}
                      >
                        {selectedActor?.biography}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={{ marginTop: 30 }}>
                  <Text
                    style={{
                      color: theme.text,
                      fontWeight: "bold",
                      fontSize: 16,
                    }}
                  >
                    {translation.ConhecidoPor}
                  </Text>
                  <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    style={styles.moviesContainer}
                  >
                    {selectedActor?.movies?.map((movie, index) => (
                      <View key={index} style={styles.movieCard}>
                        <TouchableOpacity
                          key={index}
                          onPress={() => {
                            openModal(movie.id);
                            closeModal();
                          }}
                        >
                          <ImageContainer uri={movie.imageUrl!} type={1} />
                          <Text
                            style={[
                              styles.modalActorsMovies,
                              { color: theme.text },
                            ]}
                          >
                            {movie.title}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <View
                style={{
                  marginBottom: 50,
                  alignSelf: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    ...styles.modalButtons,
                    alignSelf: "center",
                    justifyContent: "center",
                  }}
                >
                  <TouchableHighlight
                    key={1}
                    style={{
                      ...styles.modalButton,
                      backgroundColor: theme.modalBackgroundSecondary,
                      width: "65%",
                      alignSelf: "center",
                      justifyContent: "center",
                    }}
                    onPress={closeModal}
                  >
                    <Text style={styles.textStyle}>{translation.Fechar}</Text>
                  </TouchableHighlight>
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
                  <BannerAd
                    unitId={adUnitId}
                    size="BANNER"
                    onAdLoaded={() => {}}
                    onAdFailedToLoad={(error) => {
                      console.error("Ad failed to load", error);
                    }}
                    requestOptions={{
                      requestNonPersonalizedAdsOnly: true,
                    }}
                  />
                </View>
              </View>
            </Animated.ScrollView>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  modalButton: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 30,
    paddingHorizontal: 35,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
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
  modalActorInfo: {},
  modalInfoContent: {
    paddingHorizontal: 20,
  },
  modalActorTitle: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    marginTop: 35,
  },
  imageActorShadowContainer: {
    width: isTablet ? 250 : 200,
    height: isTablet ? 360 : 280,
    marginBottom: 5,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 5,
  },
  actorImageDetails: {
    width: isTablet ? 250 : 200,
    height: isTablet ? 360 : 280,
    resizeMode: "cover",
    borderRadius: 10,
  },
  modalActorBiography: {
    fontSize: 14,
    marginTop: 10,
    textAlign: "justify",
  },
  moviesContainer: {
    width: "100%",
  },
  movieCard: {
    padding: 10,
    alignItems: "center",
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
  MovieImage: {
    width: 120,
    height: 175,
    objectFit: "cover",
    borderRadius: 10,
    marginBottom: 10,
  },
  modalActorsMovies: {
    width: 110,
    fontSize: 14,
    textAlign: "center",
    flexWrap: "wrap",
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 16,
  },
});

export default CustomModalActor;
