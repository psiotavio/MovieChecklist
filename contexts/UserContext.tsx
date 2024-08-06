import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError } from "axios";
import { useConfiguration } from "./ConfigurationContext";
import { Dimensions, PixelRatio } from "react-native";

// Tipos e Interfaces
type StreamingPlatform = {
  id: number;
  name: string;
  logoPath?: string; // URL para o logo da plataforma, se disponível
};

type Actor = {
  id: number;
  name: string;
  profilePath?: string; // URL para a foto do perfil do ator, se disponível
};

type ActorDetails = {
  id: number;
  name: string;
  biography: string;
  birthYear: string;
  profilePath?: string;
  movies: Movie[];
};

type MovieReview = {
  id: number;
  title: string;
  rating: number;
  date: string;
  imageUrl?: string;
  streamingPlatforms?: StreamingPlatform[];
  alternateImageUrl?: string; // Nova propriedade para o banner do filme
  description?: string; // Descrição do filme
  actors?: Actor[];
  genreId?: string;
  similarMovies?: Movie[]; // Nova propriedade para filmes semelhantes
};

type Movie = {
  id: number;
  title: string;
  rating: number;
  date: string;
  imageUrl?: string;
  streamingPlatforms?: StreamingPlatform[];
  genreId?: string;
  alternateImageUrl?: string; // Nova propriedade para o banner do filme
  description?: string; // Descrição do filme
  actors?: Actor[];
  similarMovies?: Movie[]; // Nova propriedade para filmes semelhantes
};

interface GenreRecommendations {
  [key: string]: Movie[];
}

interface TMDBMovie {
  id: number;
  title: string;
  vote_average: number;
  release_date: string;
  poster_path: string;
  streamingPlatforms?: StreamingPlatform[];
  similarMovies?: Movie[]; // Nova propriedade para filmes semelhantes
}

interface ApiMovieData {
  id: number;
  title: string;
  vote_average: number;
  release_date: string;
  poster_path: string;
  genre_ids: number[];
  similarMovies?: Movie[]; // Nova propriedade para filmes semelhantes
}

interface PaginationState {
  [genreId: string]: {
    page: number;
    hasMore: boolean;
  };
}

interface FetchRandomMovieOptions {
  genres?: string[];
  platforms?: string[];
}

interface UserContextType {
  movies: MovieReview[];
  removeFromList: (movieId: number) => void;
  recommendedByGenre: { [key: string]: Movie[] };
  addMovieReview: (newMovie: MovieReview) => void;
  updateMovieReview: (updatedMovie: MovieReview) => void;
  setMovies: Dispatch<SetStateAction<MovieReview[]>>;
  recommendedMovies: MovieReview[];
  setRecommendedMovies: Dispatch<SetStateAction<MovieReview[]>>;
  sortedMovies: MovieReview[];
  toWatchMovies: Movie[];
  setToWatchMovies: Dispatch<SetStateAction<Movie[]>>;
  addToWatchList: (movie: Movie) => void;
  removeFromWatchList: (movieId: number) => void;
  removeFromRecommendedMovies: (movieId: number) => void;
  addMovieRecommend: (movie: Movie) => void;
  fetchMovieDetails: (
    movieId: number,
    rating: number,
    callback: (movie: Movie) => void
  ) => Promise<void>;
  fetchActorDetails: (
    actorId: number,
    callback: (actor: ActorDetails) => void
  ) => Promise<void>;
  fetchMoviesByGenreAndPage: (
    genreId: string | number,
    page: number
  ) => Promise<void>;
  paginationState: PaginationState;
  fetchRandomMovie: (options: FetchRandomMovieOptions) => Promise<Movie | null>;
}

// Context
const UserContext = createContext<UserContextType>({
  movies: [],
  removeFromList: () => {},
  recommendedByGenre: {},
  addMovieReview: () => {},
  updateMovieReview: () => {},
  setMovies: () => {},
  recommendedMovies: [],
  setRecommendedMovies: () => {},
  sortedMovies: [],
  toWatchMovies: [],
  setToWatchMovies: () => {},
  addToWatchList: () => {},
  removeFromWatchList: () => {},
  removeFromRecommendedMovies: () => {},
  addMovieRecommend: () => {},
  fetchMovieDetails: async (
    movieId: number,
    rating: number,
    callback: (movie: Movie) => void
  ) => {
    console.warn("fetchMovieDetails function not implemented");
  },
  fetchMoviesByGenreAndPage: async () => {
    console.warn("fetchMoviesByGenreAndPage function not implemented");
  },
  paginationState: {},
  fetchRandomMovie: async (options: FetchRandomMovieOptions) => {
    console.warn("fetchRandomMovie function not implemented yet");
    return null; // Returns null by default if not implemented
  },
  fetchActorDetails: async (
    actorId: number,
    callback: (actor: ActorDetails) => void
  ) => {
    console.warn("fetchActorDetails function not implemented");
  },
});

interface GenreMappings {
  [key: string]: string;
}

const translation = {
  english: {
    Action: "Action",
    Adventure: "Adventure",
    Animation: "Animation",
    Comedy: "Comedy",
    Drama: "Drama",
    Family: "Family",
    Fantasy: "Fantasy",
    Horror: "Horror",
    Music: "Music",
    Mystery: "Mystery",
    Romance: "Romance",
    ScienceFiction: "Science Fiction",
    All: "All",
    RecommendedForYou: "Recommended for You",
    Description: "Description",
    Share: "Share",
    Actors: "Actors",
    AddPrompt: "Do you want to add this item to the list?",
    AddToList: "Add to List",
    Cancel: "Cancel",
  },
  portuguese: {
    Action: "Ação",
    Adventure: "Aventura",
    Animation: "Animação",
    Comedy: "Comédia",
    Drama: "Drama",
    Family: "Família",
    Fantasy: "Fantasia",
    Horror: "Terror",
    Music: "Música",
    Mystery: "Mistério",
    Romance: "Romance",
    ScienceFiction: "Ficção científica",
    All: "Todos",
    RecommendedForYou: "Recomendado para você",
    Description: "Descrição",
    Share: "Compartilhar",
    Actors: "Atores",
    AddPrompt: "Deseja adicionar este item à lista?",
    AddToList: "Adicionar à lista",
    Cancel: "Cancelar",
  },
  spanish: {
    Action: "Acción",
    Adventure: "Aventura",
    Animation: "Animación",
    Comedy: "Comedia",
    Drama: "Drama",
    Family: "Familia",
    Fantasy: "Fantasía",
    Horror: "Terror",
    Music: "Música",
    Mystery: "Misterio",
    Romance: "Romance",
    ScienceFiction: "Ciencia ficción",
    All: "Todos",
    RecommendedForYou: "Recomendado para ti",
    Description: "Descripción",
    Share: "Compartir",
    Actors: "Actores",
    AddPrompt: "¿Deseas agregar este artículo a la lista?",
    AddToList: "Agregar a la lista",
    Cancel: "Cancelar",
  },
  french: {
    Action: "Action",
    Adventure: "Aventure",
    Animation: "Animation",
    Comedy: "Comédie",
    Drama: "Drame",
    Family: "Famille",
    Fantasy: "Fantaisie",
    Horror: "Horreur",
    Music: "Musique",
    Mystery: "Mystère",
    Romance: "Romance",
    ScienceFiction: "Science-fiction",
    All: "Tous",
    RecommendedForYou: "Recommandé pour vous",
    Description: "Description",
    Share: "Partager",
    Actors: "Acteurs",
    AddPrompt: "Voulez-vous ajouter cet article à la liste?",
    AddToList: "Ajouter à la liste",
    Cancel: "Annuler",
  },
  german: {
    Action: "Aktion",
    Adventure: "Abenteuer",
    Animation: "Animation",
    Comedy: "Komödie",
    Drama: "Drama",
    Family: "Familie",
    Fantasy: "Fantasie",
    Horror: "Horror",
    Music: "Musik",
    Mystery: "Geheimnis",
    Romance: "Romantik",
    ScienceFiction: "Wissenschaftsfiktion",
    All: "Alle",
    RecommendedForYou: "Für dich empfohlen",
    Description: "Beschreibung",
    Share: "Teilen",
    Actors: "Schauspieler",
    AddPrompt: "Möchten Sie diesen Artikel zur Liste hinzufügen?",
    AddToList: "Zur Liste hinzufügen",
    Cancel: "Abbrechen",
  },
  italian: {
    Action: "Azione",
    Adventure: "Avventura",
    Animation: "Animazione",
    Comedy: "Commedia",
    Drama: "Dramma",
    Family: "Famiglia",
    Fantasy: "Fantasia",
    Horror: "Horror",
    Music: "Musica",
    Mystery: "Mistero",
    Romance: "Romantico",
    ScienceFiction: "Fantascienza",
    All: "Tutti",
    RecommendedForYou: "Consigliato per te",
    Description: "Descrizione",
    Share: "Condividi",
    Actors: "Attori",
    AddPrompt: "Vuoi aggiungere questo elemento alla lista?",
    AddToList: "Aggiungi alla lista",
    Cancel: "Annulla",
  },
  chinese: {
    Action: "动作",
    Adventure: "冒险",
    Animation: "动画",
    Comedy: "喜剧",
    Drama: "戏剧",
    Family: "家庭",
    Fantasy: "幻想",
    Horror: "恐怖",
    Music: "音乐",
    Mystery: "神秘",
    Romance: "浪漫",
    ScienceFiction: "科幻",
    All: "所有",
    RecommendedForYou: "为你推荐",
    Description: "描述",
    Share: "分享",
    Actors: "演员",
    AddPrompt: "你想把这个项目加入列表吗？",
    AddToList: "加入列表",
    Cancel: "取消",
  },
};

interface UserProviderProps {
  children: ReactNode;
}

// Funções utilitárias
const getMoviesSortedByRating = (moviesArray: MovieReview[]) => {
  return [...moviesArray].sort((a, b) => b.rating - a.rating);
};

// UserProvider Component
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [imageSize, setImageSize] = useState("/original");

  useEffect(() => {
    const { width, height } = Dimensions.get("window");
    const screenWidth = PixelRatio.getPixelSizeForLayoutSize(width);
    const screenHeight = PixelRatio.getPixelSizeForLayoutSize(height);
    const screenSize =
      Math.sqrt(screenWidth * screenWidth + screenHeight * screenHeight) /
      PixelRatio.get();

    // Define a threshold for problematic devices based on screen size
    if (screenSize < 800) {
      setImageSize("/w500");
    }
  }, []);

  const { language } = useConfiguration();

  const genres: GenreMappings = {
    "28": translation[language].Action,
    "12": translation[language].Adventure,
    "16": translation[language].Animation,
    "35": translation[language].Comedy,
    "18": translation[language].Drama,
    "10751": translation[language].Family,
    "14": translation[language].Fantasy,
    "27": translation[language].Horror,
    "10402": translation[language].Music,
    "9648": translation[language].Mystery,
    "10749": translation[language].Romance, // Adicionando o gênero Romance
    "878": translation[language].ScienceFiction,
  };

  const languageMapping = {
    english: "en-US",
    portuguese: "pt-BR",
    spanish: "es-ES",
    french: "fr-FR",
    german: "de-DE",
    italian: "it-IT",
    chinese: "zh-CN",
  };

  const regionMapping = {
    english: "US", // United States
    portuguese: "BR", // Brazil
    spanish: "ES", // Spain
    french: "FR", // France
    german: "DE", // Germany
    italian: "IT", // Italy
    chinese: "CN", // China
  };

  const tmdbLanguage = languageMapping[language]; // Obtém o código de idioma correto para a API
  const tmdbRegion = regionMapping[language];

  // States
  const [movies, setMovies] = useState<MovieReview[]>([]);
  const [recommendedMovies, setRecommendedMovies] = useState<MovieReview[]>([]);
  const [recommendedByGenre, setRecommendedByGenre] =
    useState<GenreRecommendations>({});
  const [toWatchMovies, setToWatchMovies] = useState<Movie[]>([]);

  // Constantes
  const TMDB_API_KEY = "172e0af0e176f9c169387e094fb67c75";
  const sortedMovies = getMoviesSortedByRating(movies);

  // Funções assíncronas (fetches)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [storedMovies, storedGenresFetched] = await Promise.all([
          AsyncStorage.getItem("userMovies"),
          AsyncStorage.getItem("genresFetched"),
        ]);

        if (storedMovies !== null) {
          setMovies(JSON.parse(storedMovies));
        }
        if (storedGenresFetched !== null) {
          setGenresFetched(JSON.parse(storedGenresFetched));
        }
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      }
    };

    loadInitialData();
  }, []);

  async function makeApiRequestWithRetry(
    url: string,
    retries = 3,
    delay = 1000
  ): Promise<any> {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error: unknown) {
      const isAxiosError = (error: unknown): error is AxiosError =>
        axios.isAxiosError(error);
  
      let message = 'Unknown error';
      let status = null;
  
      if (isAxiosError(error)) {
        message = error.message;
        status = error.response ? error.response.status : null;
      } else if (error instanceof Error) {
        message = error.message;
      }
  
      console.log(
        `Attempt failed with error: ${message} - Retrying in ${delay}ms`
      );
  
      if (
        retries > 0 &&
        (status === null || ![401, 403, 404].includes(status))
      ) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return makeApiRequestWithRetry(url, retries - 1, delay * 2);
      } else {
        throw new Error(`Max retries reached for ${url} - ${message}`);
      }
    }
  }
  

  // Um objeto simples para atuar como nosso cache
  const cache: {
    moviePlatforms: Record<number, any>; // Substitua `any` pelo tipo adequado dos seus dados de plataforma
  } = {
    moviePlatforms: {},
  };

  const fetchMoviePlatforms = async (movieId: number) => {
    console.log('Fetching platforms for movie:', movieId);
    if (cache.moviePlatforms[movieId]) {
      console.log('Platforms found in cache for movie:', movieId, cache.moviePlatforms[movieId]);
      return cache.moviePlatforms[movieId];
    }
  
    const url = `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`;
    try {
      const response = await makeApiRequestWithRetry(url);
      const platformsInBrazil = response.results?.BR;
  
      const streamingPlatforms =
        platformsInBrazil?.flatrate?.map(
          (provider: { provider_id: any; provider_name: any; logo_path: any }) => ({
            id: provider.provider_id,
            name: provider.provider_name,
            logoPath: `https://image.tmdb.org/t/p/w500${provider.logo_path}.svg`,
          })
        ) || [];
  
      cache.moviePlatforms[movieId] = streamingPlatforms;
      console.log('Fetched platforms for movie:', movieId, streamingPlatforms);
      return streamingPlatforms;
    } catch (error) {
      console.error('Erro ao buscar plataformas para o filme:', error);
      return [];
    }
  };
  

  const fetchMovieDetails = async (
    movieId: number,
    rating: number,
    callback: (movie: MovieReview) => void
  ) => {
    const detailsUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=${tmdbLanguage}`;
    const creditsUrl = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${TMDB_API_KEY}&language=${tmdbLanguage}`;
    const platformsUrl = `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`;
    const similarMoviesUrl = `https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=${TMDB_API_KEY}&language=${tmdbLanguage}`;
    rating = rating;

    if (typeof callback !== "function") {
      console.error("Erro: O callback fornecido não é uma função.");
      return;
    }

    try {
      const [
        detailsResponse,
        creditsResponse,
        platformsResponse,
        similarMoviesResponse,
      ] = await Promise.all([
        axios.get(detailsUrl),
        axios.get(creditsUrl),
        axios.get(platformsUrl),
        axios.get(similarMoviesUrl),
      ]);

      const movieDetails = detailsResponse.data;
      const creditsDetails = creditsResponse.data;
      const platformsDetails = platformsResponse.data.results?.flatrate || [];
      const similarMoviesDetails = similarMoviesResponse.data.results || [];

      // Mapeando atores
      const actors = creditsDetails.cast.slice(0, 16).map((actor: any) => ({
        id: actor.id,
        name: actor.name,
        profilePath: actor.profile_path
          ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
          : undefined,
      }));

      // Mapeando plataformas de streaming
      const platformsData = platformsResponse.data.results?.BR?.flatrate || [];
      const streamingPlatforms = platformsData.map(
        (platform: {
          provider_id: any;
          provider_name: any;
          logo_path: any;
        }) => ({
          id: platform.provider_id,
          name: platform.provider_name,
          logoPath: platform.logo_path
            ? `https://image.tmdb.org/t/p/${imageSize}${platform.logo_path}.svg`
            : null,
        })
      );

      // Filtrando filmes semelhantes que compartilham pelo menos um gênero com o filme selecionado e têm no mínimo 100 avaliações
      const selectedMovieGenres = movieDetails.genres.map(
        (genre: any) => genre.id
      );
      const similarMovies = similarMoviesDetails
        .filter(
          (movie: any) =>
            movie.genre_ids.some((genreId: number) =>
              selectedMovieGenres.includes(genreId)
            ) && movie.vote_count >= 100
        )
        .map((movie: any) => ({
          id: movie.id,
          title: movie.title,
          date: movie.release_date,
          rating: movie.vote_average,
          imageUrl: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : undefined,
        }));

      // Construindo o objeto do filme com todos os detalhes necessários
      const movieCompleteDetails = {
        id: movieDetails.id,
        title: movieDetails.title,
        date: movieDetails.release_date,
        rating,
        imageUrl: movieDetails.poster_path
          ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`
          : undefined,
        streamingPlatforms,
        alternateImageUrl: movieDetails.backdrop_path
          ? `https://image.tmdb.org/t/p/${imageSize}${movieDetails.backdrop_path}`
          : undefined,
        description: movieDetails.overview,
        actors,
        genreId: movieDetails.genres
          .map((genre: GenreMappings) => genre.id)
          .join(","),
        similarMovies, // Adicionando filmes semelhantes
      };

      // Usando callback para atualizar o estado no componente
      callback(movieCompleteDetails);
    } catch (error) {
      console.error("Erro ao buscar detalhes do filme:", error);
    }
  };

  const fetchActorDetails = async (
    actorId: number,
    callback: (actor: ActorDetails) => void
  ) => {
    const detailsUrl = `https://api.themoviedb.org/3/person/${actorId}?api_key=${TMDB_API_KEY}&language=${tmdbLanguage}`;
    const creditsUrl = `https://api.themoviedb.org/3/person/${actorId}/movie_credits?api_key=${TMDB_API_KEY}&language=${tmdbLanguage}`;

    if (typeof callback !== "function") {
      console.error("Erro: O callback fornecido não é uma função.");
      return;
    }

    try {
      const [detailsResponse, creditsResponse] = await Promise.all([
        axios.get(detailsUrl),
        axios.get(creditsUrl),
      ]);

      const actorDetails = detailsResponse.data;
      const actorMovies = creditsResponse.data.cast.map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        date: movie.release_date,
        imageUrl: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : undefined,
        description: movie.overview,
      }));

      const actorCompleteDetails = {
        id: actorDetails.id,
        name: actorDetails.name,
        biography: actorDetails.biography,
        birthYear: actorDetails.birthday
          ? new Date(actorDetails.birthday).getFullYear().toString()
          : "N/A",
        profilePath: actorDetails.profile_path
          ? `https://image.tmdb.org/t/p/w500${actorDetails.profile_path}`
          : undefined,
        movies: actorMovies,
      };

      callback(actorCompleteDetails);
    } catch (error) {
      console.error("Erro ao buscar detalhes do ator:", error);
    }
  };

  const fetchRecommendedMovies = async () => {
    if (movies.length === 0) return;

    const lastMovieId = movies[movies.length - 1].id;

    try {
      const delay = (ms: number | undefined) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      await delay(5000); // Espera de 5 segundos.

      const response = await makeApiRequestWithRetry(
        `https://api.themoviedb.org/3/movie/${lastMovieId}/recommendations?api_key=${TMDB_API_KEY}&language=${tmdbLanguage}`
      );
      let newRecommendedMovies = response.results;

      // Filtra filmes que já estão na lista de recomendados ou na lista de assistidos
      newRecommendedMovies = newRecommendedMovies.filter(
        (newMovie: { id: number }) =>
          !recommendedMovies.some(
            (existingMovie) => existingMovie.id === newMovie.id
          ) && !movies.some((watchedMovie) => watchedMovie.id === newMovie.id)
      );

      const moviesWithPlatforms = await Promise.all(
        newRecommendedMovies.map(
          async (movie: {
            id: number;
            title: any;
            vote_average: any;
            release_date: any;
            poster_path: any;
            genre_ids: any[];
          }) => {
            const platforms = await fetchMoviePlatforms(movie.id);
            const genreNames = movie.genre_ids
              .map((id) => genres[id] || "Gênero Desconhecido")
              .join(", ");
            return {
              id: movie.id,
              title: movie.title,
              rating: movie.vote_average,
              date: movie.release_date,
              imageUrl: `https://image.tmdb.org/t/p/${imageSize}${movie.poster_path}`,
              streamingPlatforms: platforms,
              genreId: genreNames,
            };
          }
        )
      );

      // Concatena os novos filmes recomendados com os antigos, sem duplicar
      setRecommendedMovies((prevMovies) => {
        const updatedMovies = [
          ...new Set([...moviesWithPlatforms, ...prevMovies]),
        ];

        // Salva a lista atualizada de filmes recomendados no AsyncStorage
        AsyncStorage.setItem("recommendedMovies", JSON.stringify(updatedMovies))
          .then(() => console.log("Filmes recomendados salvos com sucesso."))
          .catch((error) =>
            console.error("Erro ao salvar filmes recomendados:", error)
          );
        updateGenreRecommendationsWithGeneralRecommendations();
        return updatedMovies;
      });
    } catch (error) {
      console.error("Erro ao buscar filmes recomendados:", error);
    }
  };

  const updateGenreRecommendationsWithGeneralRecommendations = () => {
    let updatedRecommendationsByGenre = { ...recommendedByGenre };
    recommendedMovies.forEach((movie) => {
      // Verifica se genreId está definido
      if (movie.genreId) {
        const movieGenres = movie.genreId.split(",");
        //console.log(movieGenres)
        movieGenres.forEach((genreId) => {
          const genreName = genres[genreId];
          if (genreName) {
            if (!updatedRecommendationsByGenre[genreName]) {
              updatedRecommendationsByGenre[genreName] = [];
            }
            // Evita adicionar duplicatas
            if (
              !updatedRecommendationsByGenre[genreName].find(
                (m) => m.id === movie.id
              )
            ) {
              updatedRecommendationsByGenre[genreName].push(movie);
            }
          }
        });
      }
    });

    setRecommendedByGenre(updatedRecommendationsByGenre);

    Object.entries(recommendedByGenre).forEach(([genreName, movies]) => {
      // Aqui, 'genreName' é o nome do gênero e 'movies' é a lista de filmes desse gênero
      movies.forEach((movie) => {
        // Aqui, você pode fazer operações com cada 'movie'
        // Por exemplo, imprimir informações do filme:
        //  console.log(`Gênero: ${genreName}, Filme: ${movie.title}`);
      });
    });
  };

  // Função para remover filmes já assistidos das recomendações
  const updateRecommendedMovies = () => {
    setRecommendedMovies((currentRecommendedMovies) =>
      currentRecommendedMovies.filter(
        (recommendedMovie) =>
          !movies.some((movie) => movie.id === recommendedMovie.id)
      )
    );
  };

  // useEffect que atualiza as recomendações sempre que a lista de filmes assistidos muda
  useEffect(() => {
    updateRecommendedMovies();
  }, [movies]); // Dependência na lista de filmes assistidos

  useEffect(() => {
    const loadRecommendedMovies = async () => {
      try {
        const storedRecommendedMovies = await AsyncStorage.getItem(
          "recommendedMovies"
        );
        if (storedRecommendedMovies) {
          const recommendedMoviesData = JSON.parse(storedRecommendedMovies);
          //  console.log("Filmes recomendados carregados do AsyncStorage:", recommendedMoviesData);
          setRecommendedMovies(recommendedMoviesData);
        }
      } catch (error) {
        console.error("Erro ao carregar filmes recomendados:", error);
      } finally {
        setIsLoaded(true); // Indica que o carregamento foi concluído
      }
    };
    loadRecommendedMovies();
  }, []);

  useEffect(() => {
    const saveRecommendedMovies = async () => {
      try {
        await AsyncStorage.setItem(
          "recommendedMovies",
          JSON.stringify(recommendedMovies)
        );
        //  console.log("Filmes recomendados salvos com sucesso.");

        // Logando os filmes recomendados após salvar
        //  console.log("----=====----=====----=====----=====");
        recommendedMovies.forEach((movie, index) => {
          //     console.log(`${index + 1} - ${movie.title}, ${movie}`);
        });
        //   console.log("----=====----== TAMANHO DA LISTA ==----=====----=====");
        //  console.log(recommendedMovies.length)
      } catch (error) {
        console.error("Erro ao salvar filmes recomendados:", error);
      }
    };

    saveRecommendedMovies();
    // console.log("----=====----== TAMANHO DA LISTA ==----=====----=====");
    //     console.log(recommendedMovies.length)
  }, [recommendedMovies]); // Isso assegura que a lista completa seja salva após cada atualização

  const [genresFetched, setGenresFetched] = useState<Record<string, boolean>>(
    {}
  );

  // const fetchGenreBasedRecommendations = async () => {
  //   const genreBasedRecommendations: GenreRecommendations = { ...recommendedByGenre };

  //   for (const [genreId, genreName] of Object.entries(genres)) {
  //     if (genresFetched[genreId]) continue; // Se já buscou, pula para o próximo gênero

  //     const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=pt-BR&sort_by=popularity.desc&with_genres=${genreId}`;
  //     try {
  //       const response = await axios.get(url);
  //       const popularMovies = response.data.results.slice(0, 1);

  //       const moviesWithPlatformsPromises = popularMovies.map(async (movieData: { id: number; title: any; vote_average: any; release_date: any; poster_path: any; genre_ids: any[]; }) => {
  //         const platforms = await fetchMoviePlatforms(movieData.id);
  //         return {
  //           ...movieData,
  //           streamingPlatforms: platforms,
  //           id: movieData.id,
  //           title: movieData.title,
  //           rating: movieData.vote_average,
  //           date: movieData.release_date,
  //           imageUrl: `https://image.tmdb.org/t/p/w500${movieData.poster_path}`,
  //           genreId: movieData.genre_ids.join(","),
  //         };
  //       });

  //       const moviesWithPlatforms = await Promise.all(moviesWithPlatformsPromises);

  //       if (!genreBasedRecommendations[genreName]) {
  //         genreBasedRecommendations[genreName] = [];
  //       }

  //       genreBasedRecommendations[genreName].push(...moviesWithPlatforms);

  //       // Atualiza o estado para indicar que os filmes populares deste gênero foram buscados
  //       setGenresFetched((prev) => ({ ...prev, [genreId]: true }));
  //     } catch (error) {
  //       console.error(`Erro ao buscar filmes populares para o gênero ${genreName}:`, error);
  //     }
  //   }

  //   setRecommendedByGenre(genreBasedRecommendations);
  // };

  useEffect(() => {
    const saveGenresFetched = async () => {
      try {
        await AsyncStorage.setItem(
          "genresFetched",
          JSON.stringify(genresFetched)
        );
      } catch (error) {
        console.error("Erro ao salvar o estado de gêneros buscados:", error);
      }
    };

    saveGenresFetched();
  }, [genresFetched]); // Esta dependência garante que o efeito será executado sempre que genresFetched mudar.

  useEffect(() => {
    const loadGenresFetched = async () => {
      try {
        const storedGenresFetched = await AsyncStorage.getItem("genresFetched");
        if (storedGenresFetched !== null) {
          setGenresFetched(JSON.parse(storedGenresFetched));
        }
      } catch (error) {
        console.error("Erro ao carregar o estado de gêneros buscados:", error);
      }
    };

    loadGenresFetched();
  }, []); // Este useEffect não tem dependências e será executado apenas uma vez, quando o componente for montado.

  // useEffect(() => {
  //   const loadToWatchMovies = async () => {
  //     try {
  //       const storedToWatchMovies = await AsyncStorage.getItem("toWatchMovies");
  //       if (storedToWatchMovies !== null) {
  //         setToWatchMovies(JSON.parse(storedToWatchMovies));
  //       }
  //     } catch (error) {
  //       console.error("Erro ao carregar a lista de para assistir:", error);
  //     }
  //   };
  //   loadToWatchMovies();
  // }, []);

  useEffect(() => {
    const saveMovies = async () => {
      try {
        const serializedMovies = movies.map((movie) => ({
          id: movie.id,
          title: movie.title,
          rating: movie.rating,
          date: movie.date,
          imageUrl: movie.imageUrl,
        }));

        await AsyncStorage.setItem(
          "userMovies",
          JSON.stringify(serializedMovies)
        );
      } catch (error) {
        console.error("Error saving movies:", error);
      }
    };

    saveMovies();
  }, [movies]);

  useEffect(() => {
    const saveRecommendedByGenre = async () => {
      try {
        // Serializa as recomendações para armazenamento
        const serializedRecommendedByGenre = JSON.stringify(recommendedByGenre);
        // Armazena as recomendações serializadas no AsyncStorage
        await AsyncStorage.setItem(
          "recommendedByGenre",
          serializedRecommendedByGenre
        );
      } catch (error) {
        console.error("Error saving recommended movies:", error);
      }
    };

    saveRecommendedByGenre();
  }, [recommendedByGenre]); // Dependência: recommendedByGenre

  useEffect(() => {
    const saveGenresFetched = async () => {
      try {
        await AsyncStorage.setItem(
          "genresFetched",
          JSON.stringify(genresFetched)
        );
      } catch (error) {
        console.error("Erro ao salvar o estado de gêneros buscados:", error);
      }
    };

    saveGenresFetched();
  }, [genresFetched]); // Dependência: genresFetched

  useEffect(() => {
    const loadToWatchMovies = async () => {
      try {
        const storedToWatchMovies = await AsyncStorage.getItem("toWatchMovies");
        if (storedToWatchMovies !== null) {
          setToWatchMovies(JSON.parse(storedToWatchMovies));
        }
      } catch (error) {
        console.error("Erro ao carregar a lista de para assistir:", error);
      }
    };
    loadToWatchMovies();
  }, []);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      // Executa apenas se o carregamento dos filmes recomendados tiver sido concluído
      const resetAndFetchMovies = async () => {
        try {
          await fetchRecommendedMovies();
        } catch (error) {
          console.error("Erro ao buscar recomendações:", error);
        }
      };
      resetAndFetchMovies();
    }
  }, [movies, isLoaded]); // Adiciona isLoaded às dependências

  // useEffect(() => {
  //   const fetchGenreBasedRecommendationsOnly = async () => {
  //     try {
  //       await fetchGenreBasedRecommendations();
  //     } catch (error) {
  //       console.error("Erro ao buscar recomendações de filmes por gênero:", error);
  //     }
  //   };
  //   fetchGenreBasedRecommendationsOnly();
  // }, []);

  // Funções de ação
  const removeFromList = (movieId: number) => {
    setMovies((currentMovies) =>
      currentMovies.filter((movie) => movie.id !== movieId)
    );
  };

  const addToWatchList = (movie: Movie) => {
    setToWatchMovies((prev) => {
      // Verificar se o filme já existe na lista
      const movieExists = prev.some((m) => m.id === movie.id);
      if (movieExists) {
        console.log("O filme já está na lista de 'Para Assistir'.");
        return prev;
      }

      const updatedList = [...prev, movie];
      AsyncStorage.setItem("toWatchMovies", JSON.stringify(updatedList)).catch(
        (error) => {
          console.error("Erro ao salvar a lista de para assistir:", error);
        }
      );
      return updatedList;
    });
  };

  const removeFromWatchList = (movieId: number) => {
    setToWatchMovies((prev) => {
      const updatedList = prev.filter((movie) => movie.id !== movieId);
      AsyncStorage.setItem("toWatchMovies", JSON.stringify(updatedList)).catch(
        (error) => {
          console.error("Erro ao atualizar a lista de para assistir:", error);
        }
      );
      return updatedList;
    });
  };

  const removeFromRecommendedMovies = (movieId: number) => {
    setRecommendedMovies((currentRecommendedMovies) =>
      currentRecommendedMovies.filter((movie) => movie.id !== movieId)
    );
  };

  const addMovieRecommend = async (movie: Movie) => {
    // Buscar plataformas de streaming para o filme
    const platformsData = await fetchMoviePlatforms(movie.id);

    // Agora, vamos adicionar essas plataformas ao objeto do filme.
    // Note que isso dependerá do formato dos dados retornados por fetchMoviePlatforms.
    // Aqui, assumimos que `platformsData` já está no formato adequado.
    const movieWithPlatforms = {
      ...movie,
      streamingPlatforms: platformsData, // Isso deve ser ajustado conforme o formato de seus dados
    };

    setRecommendedMovies((currentRecommendedMovies) => {
      const isAlreadyRecommended = currentRecommendedMovies.some(
        (m) => m.id === movie.id
      );
      if (!isAlreadyRecommended) {
        // Adicionamos o filme já com as informações das plataformas.
        return [...currentRecommendedMovies, movieWithPlatforms];
      }
      return currentRecommendedMovies;
    });
  };

  const updateMovieReview = (updatedMovie: MovieReview) => {
    setMovies((currentMovies) => {
      return currentMovies.map((movie) =>
        movie.id === updatedMovie.id ? { ...movie, ...updatedMovie } : movie
      );
    });
  };

  const addMovieReview = (newMovie: MovieReview) => {
    const existingMovieIndex = movies.findIndex(
      (movie) => movie.id === newMovie.id
    );

    if (existingMovieIndex !== -1) {
      const updatedMovies = [...movies];
      updatedMovies[existingMovieIndex] = {
        ...updatedMovies[existingMovieIndex],
        ...newMovie,
      };
      setMovies(updatedMovies);
    } else {
      setMovies((prevMovies) => [...prevMovies, newMovie]);
    }
  };

  // AREA DE TESTES

  const [paginationState, setPaginationState] = useState({});

  const fetchMoviesByGenreAndPage = async (
    genreId: string | number,
    page: number
  ) => {
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=${tmdbLanguage}&sort_by=popularity.desc&with_genres=${genreId}&page=${page}`;

    try {
      const response = await axios.get(url);
      const { results, total_pages } = response.data;

      // Encontra o nome do gênero correspondente ao genreId
      const genreName = Object.entries(genres).find(
        ([id, name]) => id.toString() === genreId.toString()
      )?.[1];
      if (!genreName) {
        console.error(`Nome do gênero não encontrado para o ID ${genreId}`);
        return;
      }

      let limitedResults = results.slice(0, 9);

      limitedResults = limitedResults.filter(
        (movie: { vote_count: number }) => movie.vote_count > 300
      );

      // Para cada filme, busca as plataformas de streaming disponíveis
      const moviesWithPlatformsPromises = limitedResults.map(
        async (movie: {
          id: number;
          title: any;
          vote_average: any;
          release_date: any;
          poster_path: any;
          genre_ids: any[];
        }) => {
          const platforms = await fetchMoviePlatforms(movie.id); // Assume que você já tem esta função implementada
          return {
            id: movie.id,
            title: movie.title,
            rating: movie.vote_average,
            date: movie.release_date,
            imageUrl: `https://image.tmdb.org/t/p/${imageSize}${movie.poster_path}`,
            genreId: movie.genre_ids.join(","),
            streamingPlatforms: platforms, // Inclui plataformas de streaming encontradas
          };
        }
      );

      // Espera todas as promessas de busca das plataformas serem resolvidas
      const moviesWithPlatforms = await Promise.all(
        moviesWithPlatformsPromises
      );

      // Atualiza recommendedByGenre com os novos filmes, incluindo as plataformas
      setRecommendedByGenre((prevState) => {
        // Assegura que a lista de filmes para o gênero específico seja atualizada corretamente
        const updatedMoviesForGenre = [
          ...(prevState[genreName] || []),
          ...moviesWithPlatforms,
        ];
        return { ...prevState, [genreName]: updatedMoviesForGenre };
      });

      // Atualiza o estado de paginação
      setPaginationState((prevState) => ({
        ...prevState,
        [genreId]: {
          page,
          hasMore: page < total_pages,
        },
      }));
    } catch (error) {
      console.error(
        `Erro ao buscar filmes para o gênero ${genreId} na página ${page}:`,
        error
      );
    }
  };

  //TESTE RANDOM
  const fetchRandomMovie = async (
    options: FetchRandomMovieOptions
  ): Promise<Movie | null> => {
    try {
      // Exemplo: URL construída baseada em opções fornecidas
      const page = Math.floor(Math.random() * 3) + 1;
      const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=${tmdbLanguage}&page=${page}&with_genres=${options.genres?.join(
        ","
      )}&with_watch_providers=${options.platforms?.join(
        ","
      )}&watch_region=${tmdbRegion}`;
      //  console.log(url)
      const response = await axios.get(url);
      if (response.data.results.length > 0) {
        // Simulação de escolha aleatória de um filme da lista retornada
        const randomIndex = Math.floor(
          Math.random() * response.data.results.length
        );
        const movie = response.data.results[randomIndex];

        // Assumindo que o filme seja transformado corretamente no formato Movie
        return {
          id: movie.id,
          title: movie.title,
          rating: movie.vote_average, // Suposição de nome de campo
          date: movie.release_date, // Suposição de nome de campo
          imageUrl: `https://image.tmdb.org/t/p/${imageSize}${movie.poster_path}`,
          description: movie.overview, // Suposição de nome de campo
          genreId: options.genres?.join(","), // Exemplo simplificado
          streamingPlatforms: [], // Isso precisaria de lógica adicional para preencher
          actors: [], // Isso precisaria de lógica adicional para preencher
          alternateImageUrl: `https://image.tmdb.org/t/p/${imageSize}${movie.backdrop_path}`,
        } as Movie;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching random movie:", error);
      return null;
    }
  };

  return (
    <UserContext.Provider
      value={{
        movies,
        removeFromList,
        addMovieReview,
        updateMovieReview,
        setMovies,
        recommendedMovies,
        setRecommendedMovies,
        recommendedByGenre,
        sortedMovies,
        toWatchMovies,
        setToWatchMovies,
        addToWatchList,
        removeFromWatchList,
        removeFromRecommendedMovies,
        addMovieRecommend,
        fetchMovieDetails,
        fetchActorDetails,
        fetchMoviesByGenreAndPage,
        paginationState,
        fetchRandomMovie,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Hook
export const useUser = () => useContext(UserContext);
