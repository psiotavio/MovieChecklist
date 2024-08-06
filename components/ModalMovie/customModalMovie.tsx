import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  Image,
  TouchableHighlight,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform
} from "react-native";
import ImageContainer from "../imageContainer/imageContainer";
import { useConfiguration } from "../../contexts/ConfigurationContext";
import { useTheme } from "../../constants/temas/ThemeContext";
import ShareImageButton from "../ShareMovieImage/shareMovieImage";
import {
  AdEventType,
  InterstitialAd,
  TestIds,
  BannerAd,
} from "react-native-google-mobile-ads";

let adUnitId: string;


if (Platform.OS === "ios") {
  adUnitId = "ca-app-pub-4303499199669342/6006099901"; // Coloque o ID do iOS aqui
} else if (Platform.OS === "android") {
  adUnitId = "ca-app-pub-4303499199669342/1108657138"; // Coloque o ID do Android aqui
}


type Actor = {
  id: number;
  name: string;
  profilePath?: string;
};

type StreamingPlatform = {
  id: number;
  name: string;
  logoPath?: string;
};

type Movie = {
  id: number;
  title: string;
  date: string;
  rating: number;
  imageUrl?: string;
  alternateImageUrl?: string;
  description?: string;
  actors?: Actor[];
  similarMovies?: Movie[];
  streamingPlatforms?: StreamingPlatform[];
};

type CustomModalMovieProps = {
  showModal: boolean;
  closeModal: () => void;
  isDetailsLoading: boolean;
  selectedMovie?: Movie;
  formatDate: (date: string) => string;
  handleShare: () => void;
  openModalActor: (id: number) => void;
  handlePressItemModalType: (movie: Movie) => void;
  handleAddToList: () => void;
};

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768; // Um critério comum para tablets

const CustomModalMovie: React.FC<CustomModalMovieProps> = ({
  showModal,
  closeModal,
  isDetailsLoading,
  selectedMovie,
  formatDate,
  handleShare,
  openModalActor,
  handlePressItemModalType,
  handleAddToList,
}) => {
  const { theme } = useTheme();

  const BANNER_H = isTablet ? 400 : 250;
  const scrollY = useRef(new Animated.Value(0)).current;
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

  const { translation, language } = useConfiguration();

 

  return (
    <Modal
      animationType="slide"
      visible={showModal}
      onRequestClose={closeModal}
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        {isDetailsLoading ? (
          <View
            style={[
              styles.modalContent,
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
              styles.modalContent,
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
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: true }
              )}
              scrollEventThrottle={16}
            >
              <View
                style={[
                  {
                    display: "flex",
                    flexDirection: "column",
                    height: BANNER_H,
                    backgroundColor: theme.modalBackground,
                  },
                  styles.imageShadowContainerBanner,
                ]}
              >
                <Animated.Image
                  style={[
                    styles.movieImageBanner,
                    {
                      width: "100%",
                      flex: 1,
                      height: BANNER_H,
                      transform: [
                        {
                          translateY: scrollY.interpolate({
                            inputRange: [-BANNER_H, 0, BANNER_H],
                            outputRange: [-BANNER_H / 2, 0, 0],
                          }),
                        },
                        {
                          scale: scrollY.interpolate({
                            inputRange: [-BANNER_H, 0],
                            outputRange: [2, 1],
                            extrapolateRight: "clamp",
                          }),
                        },
                      ],
                    },
                  ]}
                  source={{ uri: selectedMovie?.alternateImageUrl }}
                />
              </View>

              <View style={styles.modalInfoContent}>
                <View style={styles.modalMovieInfo}>
                  <View style={styles.modalMovieTitle}>
                    <ImageContainer uri={selectedMovie?.imageUrl!} type={1} />
                    <View style={styles.titleAndDate}>
                      <Text
                        style={[
                          styles.modalMovieTitleText,
                          { color: theme.text },
                        ]}
                      >
                        {selectedMovie?.title}
                      </Text>
                      <Text
                        style={[styles.modalMovieDate, { color: theme.text }]}
                      >
                        {formatDate(selectedMovie?.date!)}
                      </Text>

                      <TouchableHighlight
                      key={1}
                        style={{
                          ...styles.modalButton,
                          marginBottom: 10,
                          backgroundColor: "#4caf50",
                        }}
                        onPress={handleShare}
                      >
                        <Text
                          style={{
                            color: theme.textButtons,
                            textAlign: "center",
                          }}
                        >
                          {translation.compartilhar}
                        </Text>
                      </TouchableHighlight>
                    </View>
                  </View>

                  <Text
                    style={{
                      color: theme.text,
                      marginTop: 30,
                      textAlign: "justify",
                    }}
                  >
                    <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                      {translation.descricao}:{" "}
                    </Text>
                    <Text
                      style={[
                        styles.modalText,
                        {
                          color: theme.text,
                          marginBottom: 30,
                          textAlign: "justify",
                        },
                      ]}
                    >
                      {selectedMovie?.description}
                    </Text>
                  </Text>

                  <View style={{ marginTop: 30 }}>
                    <Text
                      style={{
                        color: theme.text,
                        fontWeight: "bold",
                        fontSize: 16,
                      }}
                    >
                      {translation.atores}:
                    </Text>
                    <ScrollView
                      horizontal={true}
                      showsHorizontalScrollIndicator={false}
                      style={styles.actorsContainer}
                    >
                      {selectedMovie?.actors?.map((actor, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => {
                            openModalActor(actor.id);
                            closeModal();
                          }}
                        >
                          <View style={styles.actorCard}>
                            <ImageContainer uri={actor.profilePath!} type={2} />
                            <Text
                              style={[
                                styles.modalMovieTitleTextActors,
                                { color: theme.text },
                              ]}
                            >
                              {actor.name}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  <View style={{ marginTop: 30 }}>
                    <Text
                      style={{
                        color: theme.text,
                        fontWeight: "bold",
                        fontSize: 16,
                      }}
                    >
                         {translation.VocePodeGostar}
                    </Text>
                    <ScrollView
                      horizontal={true}
                      showsHorizontalScrollIndicator={false}
                      style={styles.actorsContainer}
                    >
                      {selectedMovie?.similarMovies?.map((movie, index) => (
                        <View key={index} style={styles.movieCard}>
                          <TouchableOpacity
                          key={index}
                            onPress={() => {
                              closeModal();
                              handlePressItemModalType(movie);
                            }}
                          >
                            <ImageContainer uri={movie.imageUrl!} type={1} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flexWrap: "wrap",
                      marginTop: 30,
                    }}
                  >
                    {selectedMovie?.streamingPlatforms
                      ?.filter((streaming) => streaming.name !== "HBO Max")
                      .map((streaming, index) => (
                        <Image
                          key={index}
                          source={{ uri: streaming?.logoPath }}
                          style={{
                            width: 50,
                            height: 50,
                            marginRight: 10,
                            borderRadius: 30,
                          }}
                          resizeMode="contain"
                        />
                      ))}
                  </View>
                </View>

                <View style={styles.modalButtonsContainerAll}>
                  <Text style={[styles.modalText, { color: theme.text }]}>
                    {translation.AddPrompt}
                  </Text>

                  <View style={styles.modalButtonsContainer}>
                    <TouchableHighlight
                    key={3}
                      style={{
                        ...styles.modalButton,
                        backgroundColor: theme.borderRed,
                      }}
                      onPress={handleAddToList}
                    >
                      <Text
                        style={[styles.textStyle, { color: theme.textButtons }]}
                      >
                        {translation.AddToList}
                      </Text>
                    </TouchableHighlight>

                    <TouchableHighlight
                    key={4}
                      style={{
                        ...styles.modalButton,
                        backgroundColor: theme.modalBackgroundSecondary,
                      }}
                      onPress={closeModal}
                    >
                      <Text
                        style={[styles.textStyle, { color: theme.textButtons }]}
                      >
                        {translation.Cancel}
                      </Text>
                    </TouchableHighlight>
                  </View>
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.60)",
  },
  modalContent: {
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
  modalScrollContent: {
    paddingBottom: 20,
  },
  modalInfoContent: {
    paddingHorizontal: 20,
  },
  modalMovieInfo: {},
  modalMovieTitle: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
  },
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
  modalMovieDate: {
    flexWrap: "wrap",
    fontSize: 14,
    flex: 1,
  },
  modalMovieTitleTextActors: {
    fontSize: 16,
    textAlign: "left",
    fontStyle: "italic",
    flex: 1,
  },
  modalText: {
    fontSize: 18,
    textAlign: "justify",
  },
  modalButtonsContainer: {
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    paddingBottom: 10,
    width: "100%",
  },
  modalButtonsContainerAll: {
    flexDirection: "column",
    gap: 10,
    paddingVertical: 20,
    alignItems: "center",
  },
  actorsContainer: {
    width: "100%",
  },
  actorCard: {
    padding: 10,
    alignItems: "center",
  },
  actorImage: {
    width: 90,
    height: 125,
    objectFit: "cover",
    borderRadius: 10,
    marginBottom: 10,
  },
  modalButton: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 30,
    paddingHorizontal: 35,
  },
  text: {
    fontSize: isTablet ? 24 : 16,
  },
  image: {
    width: isTablet ? 200 : 100,
    height: isTablet ? 200 : 100,
  },
  imageShadowContainerBanner: {
    marginBottom: 30,
    shadowColor: "#000", // Cor da sombra
    shadowOffset: { width: 0, height: 2 }, // Deslocamento da sombra
    shadowOpacity: 1, // Opacidade da sombra
    shadowRadius: 3, // Raio da sombra
    elevation: 5, // Adiciona sombra no Android
  },
  movieCard: {
    padding: 10,
    alignItems: "center",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  bannerContainer: {
    height: 250,
    width: "100%",
    position: "relative",
  },
  movieImageBanner: {
    width: "100%",
    flex: 1,
    resizeMode: "cover",
  },
});

export default CustomModalMovie;
