// Shared across index.html and watchlist.html: config, storage, movie cards, modal, dark mode.

const API_KEY = "YOUR_OMDB_API_KEY";
const API_BASE = "https://www.omdbapi.com/";
const WATCHLIST_KEY = "movieWatchlist";
const THEME_KEY = "theme";

// ---------- Watchlist storage ----------

function getWatchlist() {
    return JSON.parse(localStorage.getItem(WATCHLIST_KEY)) || [];
}

function saveWatchlist(list) {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
}

function isInWatchlist(imdbID) {
    return getWatchlist().some((movie) => movie.imdbID === imdbID);
}

function addToWatchlist(movie) {
    const list = getWatchlist();
    if (!list.some((m) => m.imdbID === movie.imdbID)) {
        list.push({
            imdbID: movie.imdbID,
            Title: movie.Title,
            Year: movie.Year,
            Type: movie.Type,
            Poster: movie.Poster,
        });
        saveWatchlist(list);
    }
}

function removeFromWatchlist(imdbID) {
    saveWatchlist(getWatchlist().filter((m) => m.imdbID !== imdbID));
}

function toggleWatchlist(movie) {
    if (isInWatchlist(movie.imdbID)) {
        removeFromWatchlist(movie.imdbID);
    } else {
        addToWatchlist(movie);
    }
    syncWatchlistButtons(movie.imdbID);
}

function syncWatchlistButtons(imdbID) {
    const inList = isInWatchlist(imdbID);

    document.querySelectorAll(`.movie-card[data-id="${imdbID}"] .watchlist-btn`).forEach((btn) => {
        btn.className = `watchlist-btn ${inList ? "remove" : "add"}`;
        btn.setAttribute("aria-label", inList ? "Remove from watchlist" : "Add to watchlist");
    });

    const modalBtn = document.getElementById("modal-watchlist-btn");
    if (modalBtn && modalContent.dataset.id === imdbID) {
        modalBtn.textContent = inList ? "Remove from Watchlist" : "Add to Watchlist";
        modalBtn.className = `modal-watchlist-btn ${inList ? "remove" : "add"}`;
    }

    if (typeof window.onWatchlistChange === "function") {
        window.onWatchlistChange();
    }
}

// ---------- Movie card ----------

function posterSrc(url) {
    return url && url !== "N/A" ? url : "/images/movie.png";
}

function createMovieCard(movie) {
    const card = document.createElement("div");
    card.className = "movie-card";
    card.dataset.id = movie.imdbID;

    const posterWrap = document.createElement("div");
    posterWrap.className = "poster-wrap";

    const poster = document.createElement("img");
    poster.className = "poster";
    poster.src = posterSrc(movie.Poster);
    poster.alt = `${movie.Title} poster`;
    poster.loading = "lazy";

    const inList = isInWatchlist(movie.imdbID);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `watchlist-btn ${inList ? "remove" : "add"}`;
    btn.setAttribute("aria-label", inList ? "Remove from watchlist" : "Add to watchlist");
    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleWatchlist(movie);
    });

    posterWrap.append(poster, btn);

    const title = document.createElement("p");
    title.className = "movie-title";
    title.textContent = movie.Title;

    const year = document.createElement("p");
    year.className = "movie-year";
    year.textContent = movie.Year;

    card.append(posterWrap, title, year);
    card.addEventListener("click", () => openModal(movie.imdbID));

    return card;
}

// ---------- Modal ----------

const modalOverlay = document.getElementById("modal-overlay");
const modalContent = document.getElementById("modal-content");
const modalClose = document.getElementById("modal-close");

async function openModal(imdbID) {
    modalOverlay.classList.remove("hidden");
    modalContent.dataset.id = imdbID;
    modalContent.innerHTML = `<p class="status-msg">Loading…</p>`;

    try {
        const res = await fetch(`${API_BASE}?apikey=${API_KEY}&i=${imdbID}&plot=full`);
        const movie = await res.json();

        if (movie.Response === "False") {
            modalContent.innerHTML = `<p class="status-msg">${movie.Error}</p>`;
            return;
        }

        renderModal(movie);
    } catch (err) {
        modalContent.innerHTML = `<p class="status-msg">Something went wrong. Please try again.</p>`;
    }
}

function renderModal(movie) {
    const inList = isInWatchlist(movie.imdbID);

    modalContent.innerHTML = `
        <img class="modal-poster" src="${posterSrc(movie.Poster)}" alt="${movie.Title} poster">
        <div class="modal-info">
            <h2 class="modal-title">${movie.Title} <span class="modal-year">(${movie.Year})</span></h2>
            <p class="modal-meta">${movie.Runtime} &bull; ${movie.Genre}</p>
            <p class="modal-rating">
                <img src="/images/star.png" class="star-icon" alt="">
                ${movie.imdbRating !== "N/A" ? `${movie.imdbRating} / 10` : "Not yet rated"}
            </p>
            <p class="modal-plot">${movie.Plot}</p>
            <p class="modal-detail"><strong>Director:</strong> ${movie.Director}</p>
            <p class="modal-detail"><strong>Actors:</strong> ${movie.Actors}</p>
            <button type="button" id="modal-watchlist-btn" class="modal-watchlist-btn ${inList ? "remove" : "add"}">
                ${inList ? "Remove from Watchlist" : "Add to Watchlist"}
            </button>
        </div>
    `;

    document.getElementById("modal-watchlist-btn").addEventListener("click", () => {
        toggleWatchlist({
            imdbID: movie.imdbID,
            Title: movie.Title,
            Year: movie.Year,
            Type: movie.Type,
            Poster: movie.Poster,
        });
    });
}

function closeModal() {
    modalOverlay.classList.add("hidden");
    modalContent.innerHTML = "";
    delete modalContent.dataset.id;
}

modalClose.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
});
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
});

// ---------- Dark mode ----------

function applyTheme(theme) {
    document.body.classList.toggle("dark", theme === "dark");
    const toggle = document.getElementById("theme-toggle");
    if (toggle) toggle.checked = theme === "dark";
}

function initTheme() {
    const saved = localStorage.getItem(THEME_KEY) || "light";
    applyTheme(saved);

    const toggle = document.getElementById("theme-toggle");
    if (toggle) {
        toggle.addEventListener("change", () => {
            const theme = toggle.checked ? "dark" : "light";
            localStorage.setItem(THEME_KEY, theme);
            applyTheme(theme);
        });
    }
}

document.addEventListener("DOMContentLoaded", initTheme);
