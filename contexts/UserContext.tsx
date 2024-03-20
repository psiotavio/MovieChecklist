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
import axios from "axios";

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
    const allRecommended = new Set<Movie>();
    for (let movie of movies) {
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/movie/${movie.id}/recommendations?api_key=${TMDB_API_KEY}&language=pt-BR`
        );
        response.data.results.forEach((recommendedMovie: any) => {
          allRecommended.add({
            id: recommendedMovie.id,
            title: recommendedMovie.title,
            rating: 0, // Assumo que a API não retorna isso, então definimos como 0
            date: recommendedMovie.release_date,
            imageUrl: `https://image.tmdb.org/t/p/w500${recommendedMovie.poster_path}`,
          } as Movie);
        });
      } catch (error) {
        console.error("Erro ao buscar filmes recomendados:", error);
      }
    }
    setRecommendedMovies(Array.from(allRecommended));
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
    // Adicione mais conforme necessário
  };

  const fetchRecommendationsBasedOnActorsByGenre = async () => {
    const genreBasedRecommendations: GenreRecommendations = {};
    const seenActors = new Set<number>();

    // Coletando IDs dos atores dos filmes já assistidos
    for (const movie of movies) {
      try {
        const creditsResponse = await axios.get(
          `https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=${TMDB_API_KEY}`
        );
        creditsResponse.data.cast.forEach((actor: { id: number }) => {
          seenActors.add(actor.id);
        });
      } catch (error) {
        console.error(`Erro ao buscar atores do filme ${movie.title}:`, error);
      }
    }

    // Buscando filmes para cada ator visto, filtrando por diferentes gêneros
    for (const actorId of seenActors) {
      try {
        const actorMoviesResponse = await axios.get(
          `https://api.themoviedb.org/3/person/${actorId}/movie_credits?api_key=${TMDB_API_KEY}`
        );
        for (const movieData of actorMoviesResponse.data.cast) {
          // Para cada filme, verifica se o gênero é diferente daquele dos filmes já assistidos
          for (const genreId of movieData.genre_ids) {
            const genreName = genres[genreId.toString()];
            if (
              genreName &&
              (!genreBasedRecommendations[genreName] ||
                !genreBasedRecommendations[genreName].some(
                  (m) => m.id === movieData.id
                ))
            ) {
              // Se o gênero é diferente e o filme não foi ainda recomendado, adiciona à lista
              if (!genreBasedRecommendations[genreName]) {
                genreBasedRecommendations[genreName] = [];
              }
              genreBasedRecommendations[genreName].push({
                id: movieData.id,
                title: movieData.title,
                rating: movieData.vote_average,
                date: movieData.release_date,
                imageUrl: `https://image.tmdb.org/t/p/w500${movieData.poster_path}`,
              });
            }
          }
        }
      } catch (error) {
        console.error(
          `Erro ao buscar filmes para o ator ID ${actorId}:`,
          error
        );
      }
    }

    // Atualizando as recomendações de filmes por gênero
    setRecommendedByGenre(genreBasedRecommendations);
  };

  const fetchGenreSpecificRecommendationsBasedOnUserMovies = async () => {
    const genres = {
      terror: "27",
      comedia: "35",
      aventura: "12",
      acao: "28",
      romance: "10749",
      drama: "18",
      ficcao: "878",
      fantasia: "14",
      documentario: "99",
      animacao: "16",
    };

    const recommendations: GenreRecommendations = {};

    for (const movie of movies as Movie[]) {
      // Defina explicitamente o tipo de 'movie' como 'Movie'
      for (const [genreName, genreId] of Object.entries(genres)) {
        if (!recommendations[genreName]) {
          recommendations[genreName] = [];
        }

        try {
          const response = await axios.get(
            `https://api.themoviedb.org/3/movie/${movie.id}/similar?api_key=${TMDB_API_KEY}&language=pt-BR`
          );
          const filteredMovies: Movie[] = response.data.results
            .filter(
              (
                recommendedMovie: any // Adicione o tipo explícito 'any' aqui, idealmente deveria ser um tipo mais específico correspondente à estrutura de dados da API
              ) => recommendedMovie.genre_ids.includes(parseInt(genreId))
            )
            .map((movieData: any) => ({
              // Adicione o tipo explícito 'any' aqui, idealmente deveria ser um tipo mais específico
              id: movieData.id,
              title: movieData.title,
              rating: movieData.vote_average,
              date: movieData.release_date,
              imageUrl: `https://image.tmdb.org/t/p/w500${movieData.poster_path}`,
              genreId: genreId,
            }));

          recommendations[genreName].push(...filteredMovies);
        } catch (error) {
          console.error(
            `Erro ao buscar filmes de ${genreName} relacionados a ${movie.title}:`,
            error
          );
        }
      }
    }

    setRecommendedByGenre(recommendations);
  };

  // // Método existente para buscar recomendações de filmes por gênero
  // // Aqui permanece inalterado conforme sua solicitação.
  // const fetchRecommendedByGenre = async () => {
  //     const genres = { terror: '27', comedia: '35', aventura: '12', acao: '28', romance: '10749', drama: '18', ficcao: '878', fantasia: '14', documentario: '99', animacao: '16' };
  //     const genreRecommendations: GenreRecommendations = {};

  //     for (const [genreName, genreId] of Object.entries(genres)) {
  //         genreRecommendations[genreName] = []; // Inicializa a lista de filmes por gênero
  //         try {
  //             const response = await axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&language=pt-BR`);
  //             const moviesByGenre: Movie[] = response.data.results.map((movieData: any) => ({
  //                 id: movieData.id,
  //                 title: movieData.title,
  //                 rating: movieData.vote_average,
  //                 date: movieData.release_date,
  //                 imageUrl: `https://image.tmdb.org/t/p/w500${movieData.poster_path}`,
  //             }));
  //             genreRecommendations[genreName].push(...moviesByGenre);
  //         } catch (error) {
  //             console.error(`Erro ao buscar filmes recomendados para o gênero ${genreName}:`, error);
  //         }
  //     }
  //     setRecommendedByGenre(genreRecommendations);
  // };

  useEffect(() => {
    loadMovies();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("userMovies", JSON.stringify(movies));
    fetchRecommendedMovies();
    fetchRecommendationsBasedOnActorsByGenre();
    fetchGenreSpecificRecommendationsBasedOnUserMovies(); // Certifique-se de chamar isso depois de carregar os filmes
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
