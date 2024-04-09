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
}


interface ApiMovieData {
  id: number;
  title: string;
  vote_average: number;
  release_date: string;
  poster_path: string;
  genre_ids: number[];
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
  fetchMovieDetails: (movieId: number, rating: number, callback: (movie: Movie) => void) => Promise<void>;
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
  fetchMovieDetails: async (movieId: number, rating: number, callback: (movie: Movie) => void) => {
    console.warn("fetchMovieDetails function not implemented");
  }
  
});

interface GenreMappings {
  [key: string]: string;
}

const genres: GenreMappings = {
  "27": "Terror",
  "35": "Comédia",
  "10749": "Romance",
  "12": "Aventura",
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
          AsyncStorage.getItem('userMovies'),
          AsyncStorage.getItem('genresFetched'),
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

  // Um objeto simples para atuar como nosso cache
  const cache: {
    moviePlatforms: Record<number, any>; // Substitua `any` pelo tipo adequado dos seus dados de plataforma
} = {
    moviePlatforms: {},
};


const fetchMoviePlatforms = async (movieId: number) => {
  if (cache.moviePlatforms[movieId]) {
    return cache.moviePlatforms[movieId];
  }

  const url = `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`;
  try {
    const response = await makeApiRequestWithRetry(url);
    const platformsInBrazil = response.results?.BR;

    const streamingPlatforms = platformsInBrazil?.flatrate?.map((provider: { provider_id: any; provider_name: any; logo_path: any; }) => ({
      id: provider.provider_id,
      name: provider.provider_name,
      logoPath: `https://image.tmdb.org/t/p/w500${provider.logo_path}`,
    })) || [];

    cache.moviePlatforms[movieId] = streamingPlatforms;
    return streamingPlatforms;
  } catch (error) {
    console.error("Erro ao buscar plataformas para o filme:", error);
    return [];
  }
};



  const fetchMovieDetails = async (movieId: number, rating: number, callback: (movie: MovieReview) => void) => {
    const detailsUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=pt-BR`;
    const creditsUrl = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`;
    const platformsUrl = `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`;
    rating = rating;

    if (typeof callback !== 'function') {
      console.error("Erro: O callback fornecido não é uma função.");
      return; // Sair da função cedo se o callback não for uma função
    }

    try {
      const [detailsResponse, creditsResponse, platformsResponse] = await Promise.all([
        axios.get(detailsUrl),
        axios.get(creditsUrl),
        axios.get(platformsUrl),
      ]);
  
      const movieDetails = detailsResponse.data;
      const creditsDetails = creditsResponse.data;
      const platformsDetails = platformsResponse.data.results?.BR?.flatrate || [];
  
      // Mapeando atores
      const actors = creditsDetails.cast.slice(0, 10).map((actor : Actor) => ({
        id: actor.id,
        name: actor.name,
        profilePath: actor.profilePath ? `https://image.tmdb.org/t/p/w500${actor.profilePath}` : undefined,
      }));
  
      // Mapeando plataformas de streaming
      const platformsData = platformsResponse.data.results?.BR?.flatrate || [];
      const streamingPlatforms = platformsData.map((platform: { provider_id: any; provider_name: any; logo_path: any; }) => ({
          id: platform.provider_id,
          name: platform.provider_name,
          logoPath: platform.logo_path ? `https://image.tmdb.org/t/p/w500${platform.logo_path}` : null,
      }));

      if (platformsDetails.length === 0) {
        console.log("Nenhuma plataforma de streaming encontrada para este filme no Brasil.");
      } else {
        console.log("Plataformas de streaming encontradas!");
      }
  
      // Construindo o objeto do filme com todos os detalhes necessários
      const movieCompleteDetails = {
        id: movieDetails.id,
        title: movieDetails.title,
        date: movieDetails.release_date,
        rating,
        imageUrl: movieDetails.poster_path ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}` : undefined,
        streamingPlatforms,
        alternateImageUrl: movieDetails.backdrop_path ? `https://image.tmdb.org/t/p/w500${movieDetails.backdrop_path}` : undefined,
        description: movieDetails.overview,
        actors,
        genreId: movieDetails.genres.map((genre : GenreMappings) => genre.id).join(","), 
      };
  
      // Usando callback para atualizar o estado no componente
      callback(movieCompleteDetails);
    } catch (error) {
      console.error("Erro ao buscar detalhes do filme:", error);
    }
};

const fetchRecommendedMovies = async () => {
  console.log("usando fetch");
  if (movies.length === 0) return;

  const lastMovieId = movies[movies.length - 1].id;

  try {
    const delay = (ms: number | undefined) => new Promise(resolve => setTimeout(resolve, ms));

    await delay(5000); // Espera de 5 segundos.

    const response = await makeApiRequestWithRetry(`https://api.themoviedb.org/3/movie/${lastMovieId}/recommendations?api_key=${TMDB_API_KEY}`);
    let newRecommendedMovies = response.results;

    // Filtra filmes que já estão na lista de recomendados
    newRecommendedMovies = newRecommendedMovies.filter((newMovie: { id: number; }) =>
      !recommendedMovies.some(existingMovie => existingMovie.id === newMovie.id)
    );

    const moviesWithPlatforms = await Promise.all(newRecommendedMovies.map(async (movie: { id: number; title: any; vote_average: any; release_date: any; poster_path: any; }) => {
      const platforms = await fetchMoviePlatforms(movie.id);
      return {
        id: movie.id,
        title: movie.title,
        rating: movie.vote_average,
        date: movie.release_date,
        imageUrl: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        streamingPlatforms: platforms,
      };
    }));

    // Concatena os novos filmes recomendados com os antigos, sem duplicar
    setRecommendedMovies(prevMovies => {
      const updatedMovies = [...new Set([...prevMovies, ...moviesWithPlatforms])];
      
      // Salva a lista atualizada de filmes recomendados no AsyncStorage
      AsyncStorage.setItem('recommendedMovies', JSON.stringify(updatedMovies))
        .then(() => console.log("Filmes recomendados salvos com sucesso."))
        .catch(error => console.error("Erro ao salvar filmes recomendados:", error));

      return updatedMovies;
    });
  } catch (error) {
    console.error("Erro ao buscar filmes recomendados:", error);
  }
};


useEffect(() => {
  const loadRecommendedMovies = async () => {
    try {
      const storedRecommendedMovies = await AsyncStorage.getItem('recommendedMovies');
      if (storedRecommendedMovies) {
        const recommendedMoviesData = JSON.parse(storedRecommendedMovies);
        console.log("Filmes recomendados carregados do AsyncStorage:", recommendedMoviesData);
        setRecommendedMovies(recommendedMoviesData);
      }
    } catch (error) {
      console.error('Erro ao carregar filmes recomendados:', error);
    } finally {
      setIsLoaded(true); // Indica que o carregamento foi concluído
    }
  };
  loadRecommendedMovies();
}, []);


useEffect(() => {
  const saveRecommendedMovies = async () => {
    try {
      await AsyncStorage.setItem('recommendedMovies', JSON.stringify(recommendedMovies));
      console.log("Filmes recomendados salvos com sucesso.");

      // Logando os filmes recomendados após salvar
      console.log("----=====----=====----=====----=====");
      recommendedMovies.forEach((movie, index) => {
        console.log(`${index + 1} - ${movie.title}, ${movie}`);
      });
      console.log("----=====----== TAMANHO DA LISTA ==----=====----=====");
      console.log(recommendedMovies.length)

    } catch (error) {
      console.error('Erro ao salvar filmes recomendados:', error);
    }
  };
  

  saveRecommendedMovies();
  console.log("----=====----== TAMANHO DA LISTA ==----=====----=====");
      console.log(recommendedMovies.length)
}, [recommendedMovies]); // Isso assegura que a lista completa seja salva após cada atualização



const [genresFetched, setGenresFetched] = useState<Record<string, boolean>>({});

const fetchGenreBasedRecommendations = async () => {
  const genreBasedRecommendations: GenreRecommendations = { ...recommendedByGenre };

  for (const [genreId, genreName] of Object.entries(genres)) {
    if (genresFetched[genreId]) continue; // Se já buscou, pula para o próximo gênero

    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=pt-BR&sort_by=popularity.desc&with_genres=${genreId}`;
    try {
      const response = await axios.get(url);
      const popularMovies = response.data.results.slice(0, 21);

      const moviesWithPlatformsPromises = popularMovies.map(async (movieData: { id: number; title: any; vote_average: any; release_date: any; poster_path: any; genre_ids: any[]; }) => {
        const platforms = await fetchMoviePlatforms(movieData.id);
        return {
          ...movieData,
          streamingPlatforms: platforms,
          id: movieData.id,
          title: movieData.title,
          rating: movieData.vote_average,
          date: movieData.release_date,
          imageUrl: `https://image.tmdb.org/t/p/w500${movieData.poster_path}`,
          genreId: movieData.genre_ids.join(","),
        };
      });

      const moviesWithPlatforms = await Promise.all(moviesWithPlatformsPromises);

      if (!genreBasedRecommendations[genreName]) {
        genreBasedRecommendations[genreName] = [];
      }

      genreBasedRecommendations[genreName].push(...moviesWithPlatforms);

      // Atualiza o estado para indicar que os filmes populares deste gênero foram buscados
      setGenresFetched((prev) => ({ ...prev, [genreId]: true }));
    } catch (error) {
      console.error(`Erro ao buscar filmes populares para o gênero ${genreName}:`, error);
    }
  }

  setRecommendedByGenre(genreBasedRecommendations);
};

useEffect(() => {
  const saveGenresFetched = async () => {
    try {
      await AsyncStorage.setItem('genresFetched', JSON.stringify(genresFetched));
    } catch (error) {
      console.error('Erro ao salvar o estado de gêneros buscados:', error);
    }
  };

  saveGenresFetched();
}, [genresFetched]); // Esta dependência garante que o efeito será executado sempre que genresFetched mudar.


useEffect(() => {
  const loadGenresFetched = async () => {
    try {
      const storedGenresFetched = await AsyncStorage.getItem('genresFetched');
      if (storedGenresFetched !== null) {
       
        setGenresFetched(JSON.parse(storedGenresFetched));
      } 

    } catch (error) {
      console.error('Erro ao carregar o estado de gêneros buscados:', error);
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
        await AsyncStorage.setItem('genresFetched', JSON.stringify(genresFetched));
      } catch (error) {
        console.error('Erro ao salvar o estado de gêneros buscados:', error);
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
    if (isLoaded) { // Executa apenas se o carregamento dos filmes recomendados tiver sido concluído
      const resetAndFetchMovies = async () => {
        try {
          await fetchRecommendedMovies();
          await fetchGenreBasedRecommendations(); // Isso agora busca ambos, os filmes recomendados e os populares.
        } catch (error) {
          console.error("Erro ao buscar recomendações:", error);
        }
      };
      resetAndFetchMovies();
    }
  }, [movies, isLoaded]); // Adiciona isLoaded às dependências
  

  useEffect(() => {
    const fetchGenreBasedRecommendationsOnly = async () => {
      try {
        await fetchGenreBasedRecommendations();
      } catch (error) {
        console.error("Erro ao buscar recomendações de filmes por gênero:", error);
      }
    };
    fetchGenreBasedRecommendationsOnly();
  }, []);



  // Funções de ação
  const removeFromList = (movieId: number) => {
    setMovies((currentMovies) =>
      currentMovies.filter((movie) => movie.id !== movieId)
    );
  };

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
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Hook
export const useUser = () => useContext(UserContext);