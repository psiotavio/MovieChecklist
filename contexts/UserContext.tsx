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

type MovieReview = {
  id: number;
  title: string;
  rating: number;
  date: string; // Linha mantida conforme solicitado
  imageUrl?: string; // Linha mantida conforme solicitado
};

type Movie = {
  id: number;
  title: string;
  rating: number;
  date: string;
  imageUrl?: string;
  genreId?: string; // Suponho que você queria adicionar isto com base em suas descrições anteriores
};

interface GenreRecommendations {
  [key: string]: Movie[];
}

const getMoviesSortedByRating = (moviesArray: MovieReview[]) => {
  return [...moviesArray].sort((a, b) => b.rating - a.rating);
};

interface UserContextType {
  movies: MovieReview[];
  recommendedByGenre: { [key: string]: Movie[] };
  addMovieReview: (newMovie: MovieReview) => void;
  updateMovieReview: (updatedMovie: MovieReview) => void;
  setMovies: Dispatch<SetStateAction<MovieReview[]>>;
  recommendedMovies: Movie[]; // Adicionado
  setRecommendedMovies: Dispatch<SetStateAction<Movie[]>>; // Adicionado
  sortedMovies: MovieReview[]; // Adicione esta linha
}

const UserContext = createContext<UserContextType>({
  movies: [],
  recommendedByGenre: {},
  addMovieReview: () => { },
  updateMovieReview: () => { },
  setMovies: () => { },
  recommendedMovies: [], // Adicionado
  setRecommendedMovies: () => { },
  sortedMovies: []
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


  async function makeApiRequestWithRetry(url: string, retries = 3, delay = 1000): Promise<any> {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error: unknown) {
        // Verificamos se é um erro do Axios
        const isAxiosError = (error: unknown): error is AxiosError => axios.isAxiosError(error);

        // Mensagem de erro padrão
        let message = 'Unknown error';
        let status = null;

        if (isAxiosError(error)) {
            message = error.message;
            status = error.response ? error.response.status : null;
        } else if (error instanceof Error) {
            message = error.message;
        }

        console.log(`Attempt failed with error: ${message} - Retrying in ${delay}ms`);

        if (retries > 0 && (status === null || ![401, 403, 404].includes(status))) {
          // Espera por um tempo antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, delay));
          // Tenta novamente com um delay maior para dar tempo ao servidor de recuperar (backoff exponencial)
          return makeApiRequestWithRetry(url, retries - 1, delay * 2);
      } else {
          // Lança o erro após esgotar as tentativas ou se o erro não deve ser retried
          throw new Error(`Max retries reached for ${url} - ${message}`);
      }
    }
}


  

  const updateMovieReview = (updatedMovie: MovieReview) => {
    setMovies((currentMovies) => {
      return currentMovies.map((movie) =>
        movie.id === updatedMovie.id ? { ...movie, ...updatedMovie } : movie
      );
    });
  };


  const loadMovies = async () => {
    const savedMovies = await AsyncStorage.getItem("userMovies");
    if (savedMovies) {
      setMovies(JSON.parse(savedMovies));
    }
  };

  const fetchRecommendedMovies = async () => {
    const latestMovies = movies.slice(-3); // Getting the last three watched movies
    const allRecommended = new Set<Movie>();

    for (let movie of latestMovies) {
        try {
            const response = await makeApiRequestWithRetry(`https://api.themoviedb.org/3/movie/${movie.id}/recommendations?api_key=${TMDB_API_KEY}&language=pt-BR`);
            if (response && response.results) {
                for (let recommendedMovie of response.results) {
                    // Agora, para cada filme recomendado, busque seus detalhes para obter os gêneros
                    const movieDetailsResponse = await makeApiRequestWithRetry(`https://api.themoviedb.org/3/movie/${recommendedMovie.id}?api_key=${TMDB_API_KEY}&language=pt-BR`);
                    const genreIds = movieDetailsResponse.genres.map((genre: { id: { toString: () => any; }; }) => genre.id.toString()).join(',');

                    allRecommended.add({
                        id: recommendedMovie.id,
                        title: recommendedMovie.title,
                        rating: 0, // Assuming the API doesn't return this
                        date: recommendedMovie.release_date,
                        imageUrl: `https://image.tmdb.org/t/p/w500${recommendedMovie.poster_path}`,
                        genreId: genreIds // Adicionando os IDs de gênero
                    });
                }
            } else {
                console.error(`No recommendations found for movie ${movie.title}`);
            }
        } catch (error) {
            console.error(`Error fetching recommended movies for ${movie.title}:`, error);
        }
    }
    setRecommendedMovies(Array.from(allRecommended));
};


const fetchGenreBasedRecommendationsFromRecommended = async () => {
  const genreBasedRecommendations: GenreRecommendations = {};

  // Processar cada filme recomendado
  for (const movie of recommendedMovies) {
    console.log(movie);
    // Verificar se o filme tem IDs de gênero associados
    if (movie.genreId) {
      const genreIds = movie.genreId.split(',');
      for (const genreId of genreIds) {
        // Mapear cada ID de gênero para o nome do gênero usando o objeto 'genres'
        const genreName = genres[genreId.trim()]; // Usar trim para remover espaços em branco
        if (genreName) {
          // Se o gênero ainda não foi adicionado às recomendações, inicialize com uma lista vazia
          if (!genreBasedRecommendations[genreName]) {
            genreBasedRecommendations[genreName] = [];
          }
          // Adicionar o filme à lista de recomendações para esse gênero
          genreBasedRecommendations[genreName].push(movie);
        }
      }
    } else {
      console.log("filme sem gênero");
    }
  }

  // Buscar mais filmes populares por cada gênero encontrado
  for (const genreName in genreBasedRecommendations) {
    try {
      // Encontrar o ID do gênero correspondente ao nome do gênero
      const genreId = Object.keys(genres).find(key => genres[key] === genreName);
      if (genreId) {
        const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=pt-BR&sort_by=popularity.desc&with_genres=${genreId}`;
        const response = await makeApiRequestWithRetry(url);
        const trendingMovies = response.results.slice(0, 5); // Pegar os top 5 filmes

        // Adicionar os filmes populares às recomendações de gênero
        for (const movieData of trendingMovies) {
          genreBasedRecommendations[genreName].push({
            id: movieData.id,
            title: movieData.title,
            rating: movieData.vote_average,
            date: movieData.release_date,
            imageUrl: `https://image.tmdb.org/t/p/w500${movieData.poster_path}`,
          });
        }
      }
    } catch (error) {
      console.error(`Erro ao buscar filmes populares para o gênero ${genreName}:`, error);
    }
  }

  // Atualizar o estado com as novas recomendações de filmes por gênero
  setRecommendedByGenre(genreBasedRecommendations);
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

//   const fetchRecommendationsBasedOnActorsByGenre = async () => {
//     const genreBasedRecommendations: GenreRecommendations = {};
//     const seenActors = new Set<number>();

//     // Collecting actor IDs from watched movies
//     for (const movie of movies) {
//         try {
//             const creditsResponse = await makeApiRequestWithRetry(`https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=${TMDB_API_KEY}`);
//             if (creditsResponse && creditsResponse.cast) {
//                 creditsResponse.cast.forEach((actor: { id: number }) => {
//                     seenActors.add(actor.id);
//                 });
//             } else {
//                 console.error(`No cast found for movie ${movie.title}`);
//             }
//         } catch (error) {
//             console.error(`Error fetching actors for movie ${movie.title}:`, error);
//         }
//     }

//     // Fetching movies for each seen actor, filtering by different genres
//     for (const actorId of seenActors) {
//         try {
//             const actorMoviesResponse = await makeApiRequestWithRetry(`https://api.themoviedb.org/3/person/${actorId}/movie_credits?api_key=${TMDB_API_KEY}`);
//             if (actorMoviesResponse && actorMoviesResponse.cast) {
//                 for (const movieData of actorMoviesResponse.cast) {
//                     // For each movie, check if the genre is different from those of already watched movies
//                     for (const genreId of movieData.genre_ids) {
//                         const genreName = genres[genreId.toString()];
//                         if (genreName && (!genreBasedRecommendations[genreName] || !genreBasedRecommendations[genreName].some(m => m.id === movieData.id))) {
//                             // If the genre is different and the movie hasn't been recommended yet, add to the list
//                             if (!genreBasedRecommendations[genreName]) {
//                                 genreBasedRecommendations[genreName] = [];
//                             }
//                             genreBasedRecommendations[genreName].push({
//                                 id: movieData.id,
//                                 title: movieData.title,
//                                 rating: movieData.vote_average,
//                                 date: movieData.release_date,
//                                 imageUrl: `https://image.tmdb.org/t/p/w500${movieData.poster_path}`,
//                             });
//                         }
//                     }
//                 }
//             } else {
//                 console.error(`No movie credits found for actor ID ${actorId}`);
//             }
//         } catch (error) {
//             console.error(`Error fetching movies for actor ID ${actorId}:`, error);
//         }
//     }

//     // Updating the movie recommendations by genre
//     setRecommendedByGenre(genreBasedRecommendations);
// };


// const fetchGenreSpecificRecommendationsBasedOnUserMovies = async () => {
//   const latestMovies = movies.slice(-3);
//   const recommendations: GenreRecommendations = {};

//   for (const movie of latestMovies) {
//       for (const genreId of Object.keys(genres)) {
//           const genreName = genres[genreId]; // Use o ID para obter o nome do gênero
//           if (!recommendations[genreName]) {
//               recommendations[genreName] = [];
//           }
//           try {
//               const response = await makeApiRequestWithRetry(`https://api.themoviedb.org/3/movie/${movie.id}/similar?api_key=${TMDB_API_KEY}&language=pt-BR`);
//               if (response && response.results) {
//                   const filteredMovies = response.results
//                       .filter((recommendedMovie: { genre_ids: number[]; }) => recommendedMovie.genre_ids.includes(parseInt(genreId)))
//                       .map((movieData: { id: any; title: any; vote_average: any; release_date: any; poster_path: any; genre_ids: any[]; }) => ({
//                           id: movieData.id,
//                           title: movieData.title,
//                           rating: movieData.vote_average,
//                           date: movieData.release_date,
//                           imageUrl: `https://image.tmdb.org/t/p/w500${movieData.poster_path}`,
//                           genres: movieData.genre_ids.map(id => genres[id.toString()]) // Converte todos os IDs de gênero em nomes
//                       }));
//                   recommendations[genreName].push(...filteredMovies);
//               }
//           } catch (error) {
//               console.error(`Erro ao buscar filmes de gênero ${genreName} relacionados a ${movie.title}:`, error);
//           }
//       }
//   }

//   setRecommendedByGenre(recommendations);
// };

  useEffect(() => {
    loadMovies();
  }, []);

  useEffect(() => {
    // Salva os filmes no armazenamento local
    AsyncStorage.setItem("userMovies", JSON.stringify(movies));
  
    // Resetar as recomendações antes de gerar novas
    setRecommendedMovies([]);
    setRecommendedByGenre({});
  
    // Gerar novas recomendações com base nos últimos três filmes
    fetchRecommendedMovies();
    // fetchRecommendationsBasedOnActorsByGenre();
    fetchGenreBasedRecommendationsFromRecommended()
  }, [movies]);

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
        addMovieReview,
        updateMovieReview,
        setMovies,
        recommendedMovies,
        setRecommendedMovies,
        recommendedByGenre,
        sortedMovies,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
