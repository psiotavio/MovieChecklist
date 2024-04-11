import { Link, Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Linking,
  Modal,
  StyleSheet,
  Text,
  View,
  Image,
  Button,
  TouchableHighlight,
} from "react-native";
import { useUser } from "../contexts/UserContext";
import { useTheme } from "../constants/temas/ThemeContext";
import { useNavigation } from "@react-navigation/native";

type Actor = {
  id: number;
  name: string;
  profilePath?: string; // URL para a foto do perfil do ator, se disponível
};

interface Movie {
  rank?: React.JSX.Element;
  id: number;
  title: string;
  rating: number;
  date: string;
  imageUrl?: string;
  streamingPlatforms?: StreamingPlatform[]; // Adicionado aqui
  genreId?: string;
  alternateImageUrl?: string; // Nova propriedade para o banner do filme
  description?: string; // Descrição do filme
  actors?: Actor[]; // Novo
}

type StreamingPlatform = {
  id: number;
  name: string;
  logoPath?: string;
};

const BANNER_H = 250;

export default function NotFoundScreen() {
  const { theme } = useTheme();


  // IMPLEMENTAR NA V2.0
  // const navigation = useNavigation();
  // const { addToWatchList, removeFromRecommendedMovies, fetchMovieDetails } =
  //   useUser(); // Use o contexto de usuário
  // const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  // const [closedScreen, setIsClosedScreen] = useState(false);
  // const [showModalLink, setShowModalLink] = useState(false); // Estado para controlar a visibilidade do modal
  // const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  // const fadeAnim = useRef(new Animated.Value(0)).current;
  // const [deepLinkProcessed, setDeepLinkProcessed] = useState(false);
  // const scrollY = useRef(new Animated.Value(0)).current;

  // useEffect(() => {
  //   console.log("ABRI ISSO");

  //   const handleDeepLink = (event: { url: string }) => {
  //     const regex = /com.psiotavio.MovieChecklist:\/\/filme\/(\d+)/;
  //     const match = event.url.match(regex);
  //     if (match && match[1]) {
  //       const filmeId = parseInt(match[1], 10);
  //       openModalLink(filmeId);
  //     }
  //   };

  //   // Processa a URL inicial de deep link.
  //   Linking.getInitialURL().then((url) => {
  //     if (url) {
  //       console.log("URL inicial de deep link:", url);
  //       handleDeepLink({ url });
  //     }
  //   });

  //   // Adiciona um listener para novos deep links.
  //   const subscription = Linking.addEventListener("url", handleDeepLink);

  //   // Função de limpeza que remove o listener ao desmontar.
  //   return () => {
  //     console.log("Removendo listener de deep link", subscription);
  //     subscription.remove();
  //   };
  // }, []); // Dependência no estado deepLinkProcessed.

  // useEffect(() => {
  //   if (!isDetailsLoading) {
  //     fadeAnim.setValue(0);
  //     Animated.timing(fadeAnim, {
  //       toValue: 1,
  //       duration: 1000,
  //       useNativeDriver: true,
  //     }).start();
  //   }
  // }, [isDetailsLoading]);

  // const formatDate = (dateString: any) => {
  //   const date = new Date(dateString);
  //   const year = date.getFullYear();

  //   return `${year}`;
  // };

  // const openModalLink = (movieId: number) => {
  //   console.log("Abrindo modal para o filme:", movieId);
  //   setIsDetailsLoading(true); // Indica que está carregando os detalhes
  //   setShowModalLink(true); // Mostra o modal imediatamente
  //   setSelectedMovie(null); // Reseta o estado do filme selecionado enquanto carrega novos dados

  //   fetchMovieDetails(movieId, 0, (movieDetails) => {
  //     console.log("Detalhes do filme recebidos:", movieDetails.title);
  //     setSelectedMovie(movieDetails); // Atualiza o estado com os novos detalhes do filme
  //     setIsDetailsLoading(false); // Indica que terminou de carregar os detalhes
  //   });
  // };

  // const closeModalLink = () => {
  //   console.log("USOU AQUI");
  //   setShowModalLink(false); // Fecha o modal
  //   setSelectedMovie(null);
  //   setIsClosedScreen(true);
  //   setDeepLinkProcessed(false);
  // };

  // useEffect(() => {
  //   console.log(selectedMovie?.title);
  // }, [selectedMovie]);

  // const handleAddToList = () => {
  //   if (selectedMovie) {
  //     const toWatch: Movie = {
  //       id: selectedMovie.id,
  //       title: selectedMovie.title,
  //       date: new Date().toLocaleDateString(),
  //       rating: 0,
  //       imageUrl: selectedMovie.imageUrl,
  //       rank: selectedMovie.rank,

  //       streamingPlatforms: selectedMovie.streamingPlatforms, // Adicionado aqui

  //       genreId: selectedMovie.genreId,
  //       alternateImageUrl: selectedMovie.alternateImageUrl, // Nova propriedade para o banner do filme
  //       description: selectedMovie.description, // Descrição do filme
  //       actors: selectedMovie.actors, // Novo
  //     };

  //     // if (counter === 2) {
  //     //   setTimeout(() => {
  //     //     if (interstitialLoaded) {
  //     //       anuncio
  //     //         .show()
  //     //         .then(() => {
  //     //           // Recarregar o anúncio para a próxima exibição
  //     //           anuncio.load();
  //     //         })
  //     //         .catch((error) => {
  //     //           console.error("Erro ao tentar exibir o anúncio: ", error);
  //     //         });
  //     //       // Resetar o estado de carregamento do anúncio
  //     //       setInterstitialLoaded(false);
  //     //       setCounter(0);
  //     //     }
  //     //   }, 2000); // 2000 milissegundos = 2 segundos
  //     // }

  //     removeFromRecommendedMovies(selectedMovie.id);
  //     addToWatchList(toWatch);
  //     // setCounter(counter + 1);
  //     closeModalLink();
  //     setSelectedMovie(null);
  //   }
  // };

  return (
    <>
    <Stack.Screen options={{ title: 'Oops!' }} />
    <View style={styles.container}>
      <Text style={styles.title}>This screen doesn't exist.</Text>

      <Link href="/" style={styles.link}>
        <Text style={styles.linkText}>Go to home screen!</Text>
      </Link>
    </View>
  </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 18,
    textAlign: "center",
    alignContent: "center",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  bannerContainer: {
    height: 250,
    width: "100%",
    position: "relative",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
    justifyContent: "flex-end",
    paddingBottom: 10,
  },

  buttonContainer: {
    padding: 5,
    paddingHorizontal: 15,
    borderRadius: 30,
    justifyContent: "center",
  },
  shadowContainer: {
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 5,
  },

  logo: {
    width: 80,
    height: 80,
    marginVertical: 10,
    marginBottom: 40,
    resizeMode: "contain",
  },
  listRecommend: {
    backgroundColor: "red",
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
  movieImageRecommend: {
    width: "100%", // Usa 100% do contêiner de sombra
    height: "100%", // Usa 100% do contêiner de sombra
    borderRadius: 10,
    resizeMode: "cover",
  },
  imageShadowContainer: {
    width: 100,
    height: 150,
    marginBottom: 5,
    borderRadius: 10,
    shadowColor: "#000", // Cor da sombra
    shadowOffset: { width: 0, height: 2 }, // Deslocamento da sombra
    shadowOpacity: 1, // Opacidade da sombra
    shadowRadius: 3, // Raio da sombra
    elevation: 5, // Adiciona sombra no Android
  },

  imageContainer: {
    width: "100%", // Usa 100% do contêiner de sombra
    height: "100%", // Usa 100% do contêiner de sombra
    borderRadius: 10, // Arredonda as bordas da imagem
    overflow: "hidden", // Mantém a imagem dentro do contorno arredondado
  },

  movieImageBanner: {
    width: "100%",
    flex: 1,
    resizeMode: "cover",
    marginBottom: 30,
  },

  // Estilos do modal
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
});
