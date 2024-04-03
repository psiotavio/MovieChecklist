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

type MovieReview = {
  id: number;
  title: string;
  rating: number;
  date: string;
  imageUrl?: string;
  streamingPlatforms?: StreamingPlatform[]; // Adicionado aqui

  alternateImageUrl?: string; // Nova propriedade para o banner do filme
  description?: string; // Descrição do filme
  actors?: Actor[]; // Novo
  genreId?: string;
};

type Movie = {
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
};

interface GenreRecommendations {
  [key: string]: Movie[];
}

const getMoviesSortedByRating = (moviesArray: MovieReview[]) => {
  return [...moviesArray].sort((a, b) => b.rating - a.rating);
};

interface UserContextType {
  movies: MovieReview[];
  removeFromList: (movieId: number) => void;
  recommendedByGenre: { [key: string]: Movie[] };
  addMovieReview: (newMovie: MovieReview) => void;
  updateMovieReview: (updatedMovie: MovieReview) => void;
  setMovies: Dispatch<SetStateAction<MovieReview[]>>;
  recommendedMovies: Movie[];
  setRecommendedMovies: Dispatch<SetStateAction<Movie[]>>;
  sortedMovies: MovieReview[];
  toWatchMovies: Movie[];
  setToWatchMovies: Dispatch<SetStateAction<Movie[]>>;
  addToWatchList: (movie: Movie) => void;
  removeFromWatchList: (movieId: number) => void;
  removeFromRecommendedMovies: (movieId: number) => void;
  addMovieRecommend: (movie: Movie) => void;
}

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
  addMovieRecommend: () => {},
  addToWatchList: () => {},
  removeFromWatchList: () => {},
  removeFromRecommendedMovies: () => {},
});

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [movies, setMovies] = useState<MovieReview[]>([]);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [recommendedByGenre, setRecommendedByGenre] =
    useState<GenreRecommendations>({});
  const TMDB_API_KEY = "172e0af0e176f9c169387e094fb67c75";
  const sortedMovies = getMoviesSortedByRating(movies);
  const [toWatchMovies, setToWatchMovies] = useState<Movie[]>([]);

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

      let message = "Unknown error";
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

  const removeFromRecommendedMovies = (movieId: number) => {
    setRecommendedMovies((currentRecommendedMovies) =>
      currentRecommendedMovies.filter((movie) => movie.id !== movieId)
    );
  };

  const removeFromList = (movieId: number) => {
    setMovies((currentMovies) =>
      currentMovies.filter((movie) => movie.id !== movieId)
    );
  };

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

  const addToWatchList = (movie: Movie) => {
    setToWatchMovies((prev) => {
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

  const loadMovies = async () => {
    const savedMovies = await AsyncStorage.getItem("userMovies");
    if (savedMovies) {
      setMovies(JSON.parse(savedMovies));
    }
  };

  const fetchMoviePlatforms = async (movieId: number) => {
    const url = `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`;
    try {
      const response = await axios.get(url);
      const platformsInBrazil = response.data.results?.BR;

      const streamingPlatforms =
        platformsInBrazil?.flatrate?.map(
          (provider: {
            provider_id: any;
            provider_name: any;
            logo_path: any;
          }) => ({
            id: provider.provider_id,
            name: provider.provider_name,
            logoPath: `https://image.tmdb.org/t/p/w500${provider.logo_path}`,
          })
        ) || [];

      return streamingPlatforms;
    } catch (error) {
      console.error("Erro ao buscar plataformas para o filme:", error);
      return [];
    }
  };

  const fetchMovieDetails = async (movieId: number) => {
    const detailsUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=pt-BR`; // Modifique para o idioma desejado
    const creditsUrl = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`;

    try {
      const detailsResponse = await axios.get(detailsUrl);
      const creditsResponse = await axios.get(creditsUrl);

      const movieDetails = detailsResponse.data;
      const creditsDetails = creditsResponse.data;

      const actors = creditsDetails.cast.slice(0, 10).map((actor: Actor) => ({
        // Limita a 10 atores
        id: actor.id,
        name: actor.name,
        profilePath: actor.profilePath
          ? `https://image.tmdb.org/t/p/w500${actor.profilePath}`
          : undefined,
      }));

      return {
        description: movieDetails.overview,
        alternateImageUrl: movieDetails.backdrop_path
          ? `https://image.tmdb.org/t/p/w500${movieDetails.backdrop_path}`
          : undefined,
        actors,
      };
    } catch (error) {
      console.error("Erro ao buscar detalhes do filme:", error);
      return {};
    }
  };

  const fetchRecommendedMovies = async () => {
    const latestMovies = movies.slice(-3);
    const moviePromises = latestMovies.map((movie) =>
      makeApiRequestWithRetry(
        `https://api.themoviedb.org/3/movie/${movie.id}/recommendations?api_key=${TMDB_API_KEY}&language=pt-BR`
      )
    );

    try {
      const moviesResponses = await Promise.all(moviePromises);
      const allRecommended: {
        id: any;
        title: any;
        rating: any;
        date: any;
        imageUrl: string;
        genreId: any;
        alternateImageUrl: string | undefined;
        description: any;
        actors: any;
        streamingPlatforms: any;
      }[] = [];

      for (let response of moviesResponses) {
        if (response && response.results) {
          for (let recommendedMovie of response.results) {
            // Evita adicionar duplicatas
            if (!allRecommended.find((m) => m.id === recommendedMovie.id)) {
              // Busca detalhes adicionais e plataformas disponíveis para cada filme recomendado
              const [movieDetails, platformsData] = await Promise.all([
                fetchMovieDetails(recommendedMovie.id),
                fetchMoviePlatforms(recommendedMovie.id),
              ]);
              allRecommended.push({
                id: recommendedMovie.id,
                title: recommendedMovie.title,
                rating: recommendedMovie.vote_average,
                date: recommendedMovie.release_date,
                imageUrl: `https://image.tmdb.org/t/p/w500${recommendedMovie.poster_path}`,
                genreId: recommendedMovie.genre_ids.join(","),
                alternateImageUrl: movieDetails.alternateImageUrl,
                description: movieDetails.description,
                actors: movieDetails.actors,
                streamingPlatforms: platformsData,
              });
            }
          }
        }
      }
      // Filtrar filmes que o usuário já assistiu ou adicionou à lista de para assistir
      const filteredRecommendedMovies = allRecommended.filter(
        (recommendedMovie) =>
          !movies.some((movie) => movie.id === recommendedMovie.id) &&
          !toWatchMovies.some((movie) => movie.id === recommendedMovie.id)
      );

      setRecommendedMovies(filteredRecommendedMovies);
    } catch (error) {
      console.error("Error fetching recommended movies:", error);
    }
  };

  interface GenreMappings {
    [key: string]: string;
  }

  const genres: GenreMappings = {
    "27": "Terror",
    "35": "Comédia",
    "10749": "Romance",
    "878": "Ficção Científica",
    "12": "Aventura",
  };

  interface ApiMovieData {
    id: number;
    title: string;
    vote_average: number;
    release_date: string;
    poster_path: string;
    genre_ids: number[]; // Ajuste conforme a resposta real da sua API
  }

  const fetchGenreBasedRecommendations = async () => {
    const genreBasedRecommendations: GenreRecommendations = {};

    // Adiciona os filmes recomendados existentes primeiro
    recommendedMovies.forEach((movie) => {
      movie.genreId?.split(",").forEach((genreId) => {
        const genreName = genres[genreId.trim()];
        if (genreName) {
          genreBasedRecommendations[genreName] =
            genreBasedRecommendations[genreName] || [];
          genreBasedRecommendations[genreName].push(movie);
        }
      });
    });

    // Agora, busca os filmes populares por gênero e adiciona-os ao início de cada lista de gênero
    const genrePromises = Object.entries(genres).map(
      async ([genreId, genreName]) => {
        const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=pt-BR&sort_by=popularity.desc&with_genres=${genreId}`;
        try {
          const response = await axios.get(url);
          const popularMovies = response.data.results.slice(0, 5);
          const formattedPopularMovies = popularMovies.map(
            (movieData: {
              id: any;
              title: any;
              vote_average: any;
              release_date: any;
              poster_path: any;
              genre_ids: any[];

             
            }) => ({
              id: movieData.id,
              title: movieData.title,
              rating: movieData.vote_average,
              date: movieData.release_date,
              imageUrl: `https://image.tmdb.org/t/p/w500${movieData.poster_path}`,
              genreId: movieData.genre_ids.join(","), // Convert array of genre IDs to string

              
            })
          );

          // Prepend the popular movies to the existing recommended movies for each genre
          genreBasedRecommendations[genreName] = [
            ...formattedPopularMovies,
            ...(genreBasedRecommendations[genreName] || []),
          ];
        } catch (error) {
          console.error(
            `Erro ao buscar filmes populares para o gênero ${genreName}:`,
            error
          );
        }
      }
    );

    // Aguarda todas as promessas serem resolvidas
    await Promise.all(genrePromises);

    // Atualize o estado uma vez após todas as operações assíncronas serem concluídas
    setRecommendedByGenre({ ...genreBasedRecommendations });
  };

  useEffect(() => {
    fetchGenreBasedRecommendations();
  }, [recommendedMovies]); // Executa sempre que recommendedMovies mudar

  useEffect(() => {
    loadMovies();
  }, []);

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
    const resetAndFetchMovies = async () => {
      try {
        await fetchRecommendedMovies();
        await fetchGenreBasedRecommendations(); // Isso agora busca ambos, os filmes recomendados e os populares.
      } catch (error) {
        console.error("Erro ao buscar recomendações:", error);
      }
    };

    resetAndFetchMovies();
  }, [movies]);

  const updateMovieReview = (updatedMovie: MovieReview) => {
    setMovies((currentMovies) => {
      return currentMovies.map((movie) =>
        movie.id === updatedMovie.id ? { ...movie, ...updatedMovie } : movie
      );
    });
  };

  const addMovieReview = async (newMovie: MovieReview) => {
    try {
      const [movieDetails, streamingPlatforms] = await Promise.all([
        fetchMovieDetails(newMovie.id),
        fetchMoviePlatforms(newMovie.id),
      ]);

      setMovies((currentMovies) => {
        const movieIndex = currentMovies.findIndex(
          (movie) => movie.id === newMovie.id
        );

        if (movieIndex !== -1) {
          // Atualiza o filme existente com novos detalhes e revisão
          const updatedMovies = [...currentMovies];
          const updatedMovie = {
            ...currentMovies[movieIndex],
            ...newMovie,
            description: movieDetails.description,
            alternateImageUrl: movieDetails.alternateImageUrl,
            actors: movieDetails.actors,
            streamingPlatforms,
          };
          updatedMovies[movieIndex] = updatedMovie;
          return updatedMovies;
        } else {
          // Adiciona um novo filme com todos os detalhes
          const movieWithAllDetails = {
            ...newMovie,
            description: movieDetails.description,
            alternateImageUrl: movieDetails.alternateImageUrl,
            actors: movieDetails.actors,
            streamingPlatforms,
          };
          return [...currentMovies, movieWithAllDetails];
        }
      });
    } catch (error) {
      console.error("Erro ao adicionar revisão de filme:", error);
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
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
