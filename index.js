const form = document.getElementById("form");
const searchBar = document.getElementById("search-bar");
const resultsEl = document.getElementById("results");

let currentQuery = "";
let currentPage = 1;

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = searchBar.value.trim();
    if (!query) return;

    currentQuery = query;
    currentPage = 1;
    performSearch();
});

async function performSearch() {
    resultsEl.innerHTML = `<p class="status-msg">Searching…</p>`;

    try {
        const url = `${API_BASE}?apikey=${API_KEY}&s=${encodeURIComponent(currentQuery)}&type=movie&page=${currentPage}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.Response === "False") {
            resultsEl.innerHTML = `<p class="status-msg">${data.Error}</p>`;
            return;
        }

        renderResults(data.Search, Number(data.totalResults));
    } catch (err) {
        resultsEl.innerHTML = `<p class="status-msg">Something went wrong. Please try again.</p>`;
    }
}

function renderResults(movies, totalResults) {
    resultsEl.innerHTML = "";

    const grid = document.createElement("div");
    grid.className = "movie-grid";
    movies.forEach((movie) => grid.appendChild(createMovieCard(movie)));
    resultsEl.appendChild(grid);

    const totalPages = Math.min(Math.ceil(totalResults / 10), 100);
    if (totalPages > 1) {
        resultsEl.appendChild(createPagination(totalPages));
    }
}

function createPagination(totalPages) {
    const pagination = document.createElement("div");
    pagination.className = "pagination";

    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "page-btn";
    prevBtn.textContent = "Prev";
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener("click", () => {
        currentPage--;
        performSearch();
    });

    const pageLabel = document.createElement("span");
    pageLabel.className = "page-label";
    pageLabel.textContent = `Page ${currentPage} of ${totalPages}`;

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "page-btn";
    nextBtn.textContent = "Next";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener("click", () => {
        currentPage++;
        performSearch();
    });

    pagination.append(prevBtn, pageLabel, nextBtn);
    return pagination;
}
