import { useEffect, useState } from "react";
import StarRating from "./Star";

const average = (arr) => arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const KEY = "ea1199b7";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedMovieId, setSelectedMovieId] = useState("");

  function handleSelectMovie(id) {
    setSelectedMovieId(id);
  }

  function handleAddToWatched(watchedMovie) {
    setWatched([...watched, watchedMovie]);
  }

  function hadnleDeleteWatchedMovie(movieId) {
    setWatched(watched.filter((movie) => movie.imdbID !== movieId));
  }

  useEffect(
    function () {
      const controller = new AbortController();
      async function loadMovies() {
        const signal = controller.signal;
        const URL = `https://www.omdbapi.com/?s=${query}&apikey=${KEY}`;
        const responseHeaders = await fetch(URL, { signal });
        const data = await responseHeaders.json();
        setIsLoading(false);
        if (data.Response === "False") throw new Error(data.Error);
        setMovies(data.Search);
      }
      if (query.trim()) {
        loadMovies().catch((err) => {
          setIsLoading(false);
          if (err.name !== "AbortError") {
            setError(err.message);
          }
        });
      }

      return () => {
        controller.abort();
        setIsLoading(false);
        setError("");
      };
    },
    [query]
  );

  return (
    <>
      <Navbar>
        <Search query={query} setQuery={setQuery} />
        <SearchResult movies={movies} />
      </Navbar>
      <Main>
        <Box>
          {isLoading && <Loading />}
          {error && <LoadingError> {error} </LoadingError>}
          {!isLoading && !error && <MovieList movies={movies} Component={ShowMovie} onItemClick={handleSelectMovie} />}
        </Box>
        <Box>
          {selectedMovieId ? (
            <SelectedMovie
              movieId={selectedMovieId}
              watched={watched}
              handleSelectMovie={handleSelectMovie}
              handleAddToWatched={handleAddToWatched}
            />
          ) : (
            <>
              <Summary watched={watched} />
              <MovieList movies={watched} Component={WatchedMovie} onDeleteMovie={hadnleDeleteWatchedMovie} />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Navbar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Loading() {
  return <p className="loader">Loading...</p>;
}

function LoadingError({ children }) {
  return <p className="error"> 🔴 {children}</p>;
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function SearchResult({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function SelectedMovie({ movieId, watched, handleSelectMovie, handleAddToWatched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);

  const idx = watched.findIndex((movie) => movie.imdbID === movieId);
  const isWatched = idx !== -1;

  function handleBack() {
    handleSelectMovie("");
  }

  function addToWatched() {
    const newWatchedMovie = { ...movie, userRating };
    handleSelectMovie("");
    handleAddToWatched(newWatchedMovie);
  }
  useEffect(function () {
    const handleEscapeKeyDown = (event) => {
      if (event.key === "Escape") {
        handleBack();
      }
    };

    document.addEventListener("keydown", handleEscapeKeyDown);
    return () => {
      document.removeEventListener("keydown", handleEscapeKeyDown);
    };
  }, []);

  useEffect(
    function () {
      async function loadMovie() {
        setIsLoading(true);
        const URL = `http://www.omdbapi.com/?apikey=${KEY}&i=${movieId}`;
        const responseHeaders = await fetch(URL);
        const mov = await responseHeaders.json();
        setIsLoading(false);
        setMovie(mov);
      }
      loadMovie();
    },
    [movieId]
  );

  useEffect(
    function () {
      document.title = `Movie | ${movie.Title}`;
      return () => (document.title = "usePopcorn");
    },
    [movie]
  );

  return isLoading ? (
    <Loading />
  ) : (
    <div className="details">
      <button className="btn-back" onClick={handleBack}>
        &larr;
      </button>
      <header>
        <img src={movie.Poster} alt={`${movie.Title}`} />
        <div className="details-overview">
          <h2>{movie.Title}</h2>
          <p>
            <span>{movie.Released}</span> <span>{movie.Runtime}</span>
          </p>
          <p>{movie.Genre}</p>
          <p>
            <span>⭐</span>
            <span>{movie.imdbRating}</span>
          </p>
        </div>
      </header>
      <section>
        <div className="rating">
          <StarRating
            starsNumber={10}
            starsStyle={{ width: "25px" }}
            fontStyle={{ fontSize: "20px" }}
            onRate={setUserRating}
            readOnly={isWatched ? true : false}
            defaultRating={isWatched ? watched[idx].userRating : 0}
          />
          {!isWatched && (
            <button className="btn-add" onClick={addToWatched}>
              + Add to favourites
            </button>
          )}
        </div>
        <p>{movie.Plot}</p>
        <p>{movie.Actors}</p>
        <p>{movie.Director}</p>
      </section>
    </div>
  );
}

function MovieList({ Component, movies, onItemClick, onDeleteMovie }) {
  return (
    <ul className="list list-movies">
      {movies.map((movie) => (
        <Component movie={movie} key={movie.imdbID} onItemClick={onItemClick} onDeleteMovie={onDeleteMovie} />
      ))}
    </ul>
  );
}

function Movie({ movie, children, onItemClick }) {
  return (
    <li onClick={onItemClick ? () => onItemClick(movie.imdbID) : () => {}}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      {children}
    </li>
  );
}

function ShowMovie({ movie, onItemClick }) {
  return (
    <Movie movie={movie} onItemClick={onItemClick}>
      <InfoList>
        <Info emoji="📆" data={movie.Year}></Info>
      </InfoList>
    </Movie>
  );
}

function WatchedMovie({ movie, onDeleteMovie }) {
  function deleteMovie() {
    onDeleteMovie(movie.imdbID);
  }
  return (
    <Movie movie={movie}>
      <InfoList>
        <Info emoji="⭐️" data={movie.imdbRating} />
        <Info emoji="🌟" data={movie.userRating} />
        <Info emoji="⏳" data={movie.Runtime} />
      </InfoList>
      <button className="btn-delete" onClick={deleteMovie}>
        &times;
      </button>
    </Movie>
  );
}

function InfoList({ children }) {
  return <div>{children}</div>;
}

function Info({ emoji, data }) {
  return (
    <p>
      <span>{emoji}</span>
      <span>{data}</span>
    </p>
  );
}

function Summary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => Number(movie.Runtime.split(" ")[0])));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}
