import React, { useEffect, useState } from "react";
import "./index.css";

const API_KEY = process.env.REACT_APP_OMDB_API_KEY;


const GENRES = {
  Popular: ["Inception", "Interstellar", "The Dark Knight", "Avatar"],
  Action: ["John Wick", "Mad Max Fury Road", "The Batman"],
  Horror: ["Hereditary", "It", "The Conjuring"],
  Scifi: ["Dune", "Blade Runner 2049", "The Matrix"],
  Drama: ["Joker", "Forrest Gump", "Parasite"]
};

function App() {
  const [rows, setRows] = useState({});
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    loadHomepageMovies();
  }, []);

  async function loadHomepageMovies() {
    const all = {};

    for (const [genre, titles] of Object.entries(GENRES)) {
      const movies = await Promise.all(
        titles.map(async (title) => {
          const res = await fetch(
            `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${API_KEY}`
          );
          return await res.json();
        })
      );

      all[genre] = movies;
    }

    setRows(all);
  }

  async function doSearch() {
    if (!search.trim()) return;

    const res = await fetch(
      `https://www.omdbapi.com/?s=${encodeURIComponent(search)}&apikey=${API_KEY}`
    );
    const data = await res.json();

    if (data.Search) {
      const full = await Promise.all(
        data.Search.slice(0, 8).map(async (m) => {
          const res = await fetch(
            `https://www.omdbapi.com/?i=${m.imdbID}&apikey=${API_KEY}`
          );
          return await res.json();
        })
      );
      setSearchResults(full);
    }
  }

  return (
    <>
      <header className="header">
        <div className="logo">MOVIEFY</div>
      </header>

      <div className="search-bar">
        <input
          placeholder="Search any movie..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={doSearch}>Search</button>
      </div>

      {searchResults.length > 0 && (
        <div className="section">
          <div className="section-title">Search Results</div>
          <div className="row">
            {searchResults.map((m) => (
              <div key={m.imdbID} className="card" onClick={() => setModal(m)}>
 <img src={modal.Poster} alt={modal.Title} />
                <div className="card-title">{m.Title}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(rows).map((genre) => (
        <div key={genre} className="section">
          <div className="section-title">{genre}</div>
          <div className="row">
            {rows[genre]?.map((m) => (
              <div key={m.imdbID} className="card" onClick={() => setModal(m)}>
<img src={m.Poster !== "N/A" ? m.Poster : "/placeholder.png"} alt={m.Title} />
                <div className="card-title">{m.Title}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {modal && (
        <div className="modal-bg" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <img src={modal.Poster} alt="" />
            <h2>
              {modal.Title} ({modal.Year})
            </h2>
            <p>{modal.Genre}</p>
            <p>{modal.Plot}</p>
            <p>⭐ IMDb: {modal.imdbRating}</p>
            <button className="close-btn" onClick={() => setModal(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
