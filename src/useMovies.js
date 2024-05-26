import { useEffect, useState } from "react";

const KEY = "ea1199b7";

export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
  return { movies, isLoading, error };
}
