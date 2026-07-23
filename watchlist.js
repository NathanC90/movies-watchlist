const watchlistEl = document.getElementById("results");

function renderWatchlist() {
    const movies = getWatchlist();
    watchlistEl.innerHTML = "";

    if (movies.length === 0) {
        watchlistEl.innerHTML = `
            <div class="empty-state">
                <img src="/images/movie.png">
                <p class="start-exploring">Your watchlist is empty</p>
            </div>
        `;
        return;
    }

    const grid = document.createElement("div");
    grid.className = "movie-grid";
    movies.forEach((movie) => grid.appendChild(createMovieCard(movie)));
    watchlistEl.appendChild(grid);
}

window.onWatchlistChange = renderWatchlist;

document.addEventListener("DOMContentLoaded", renderWatchlist);
