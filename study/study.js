// Daily study trainer: paced reading drill + free recall + spaced repetition (Leitner boxes).
// Everything is stored in localStorage; no account, no server.

const STORE_KEY = "studyTrainer";
const INTERVALS = [1, 2, 4, 8, 16, 32]; // days until next review, per Leitner box
const LEARNED_BOX = 3; // a card that survived 8+ day gaps counts as learned

// ---------- Pure logic (tested in study.test.js) ----------

function today(d = new Date()) {
    return d.toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
}

function addDays(dateStr, n) {
    const d = new Date(dateStr + "T00:00");
    d.setDate(d.getDate() + n);
    return today(d);
}

// grade: 0 = forgot, 1 = got it, 2 = easy
function schedule(card, grade, now) {
    const box = grade === 0 ? 0 : Math.min(card.box + grade, INTERVALS.length - 1);
    return { ...card, box, due: addDays(now, INTERVALS[box]) };
}

// Only speed up when comprehension holds; otherwise slow down. Speed without recall is worthless.
function nextTarget(wpm, recall) {
    const next = Math.round(wpm * (recall >= 70 ? 1.1 : 0.9));
    return Math.min(1000, Math.max(100, next));
}

// Consecutive active days ending today (or yesterday, if today isn't done yet).
function streak(log, now) {
    let day = log[now] ? now : addDays(now, -1);
    let n = 0;
    while (log[day]) {
        n++;
        day = addDays(day, -1);
    }
    return n;
}

// "question | answer" per line
function parseCards(text) {
    return text
        .split("\n")
        .map((line) => line.split("|"))
        .filter((parts) => parts.length >= 2)
        .map(([q, ...a]) => ({ q: q.trim(), a: a.join("|").trim() }))
        .filter((c) => c.q && c.a);
}

function wordCount(text) {
    return text.split(/\s+/).filter(Boolean).length;
}

if (typeof module !== "undefined") {
    module.exports = { today, addDays, schedule, nextTarget, streak, parseCards, wordCount, INTERVALS };
}

// ---------- App ----------

if (typeof document !== "undefined") {
    const $ = (id) => document.getElementById(id);

    function load() {
        const defaults = { text: "", wpm: 250, pacer: true, cards: [], log: {} };
        try {
            return { ...defaults, ...JSON.parse(localStorage.getItem(STORE_KEY)) };
        } catch {
            return defaults;
        }
    }

    const data = load();
    const save = () => localStorage.setItem(STORE_KEY, JSON.stringify(data));

    function logToday(patch) {
        const now = today();
        data.log[now] = { ...data.log[now], ...patch };
        save();
    }

    function dueCards() {
        const now = today();
        return data.cards.filter((c) => c.due <= now).sort((a, b) => a.due.localeCompare(b.due));
    }

    function addCards(cards) {
        const now = today();
        cards.forEach((c) => data.cards.push({ id: crypto.randomUUID(), ...c, box: 0, due: now }));
        save();
    }

    // ----- Tabs -----

    const tabs = document.querySelectorAll("[data-tab]");
    function showTab(name) {
        tabs.forEach((t) => t.setAttribute("aria-selected", t.dataset.tab === name));
        document.querySelectorAll("main > section").forEach((s) => (s.hidden = s.id !== name));
        ({ today: renderToday, review: startReview, cards: renderCards, progress: renderProgress })[name]?.();
    }
    tabs.forEach((t) => t.addEventListener("click", () => showTab(t.dataset.tab)));
    document.querySelectorAll("[data-goto]").forEach((b) => b.addEventListener("click", () => showTab(b.dataset.goto)));

    // ----- Today -----

    function renderToday() {
        const entry = data.log[today()] || {};
        $("due-count").textContent = dueCards().length;
        $("step-review").classList.toggle("done", dueCards().length === 0 && data.cards.length > 0);
        $("step-read").classList.toggle("done", entry.wpm != null);
        $("step-cards").classList.toggle("done", (entry.added || 0) >= 3);
        $("today-streak").textContent = streak(data.log, today());
    }

    // ----- Reading drill: setup → reading → recall → check -----

    const readSteps = ["read-setup", "read-run", "read-recall", "read-check"];
    const showReadStep = (id) => readSteps.forEach((s) => ($(s).hidden = s !== id));

    $("read-text").value = data.text;
    $("read-wpm").value = data.wpm;
    $("read-pacer").checked = data.pacer;

    let startedAt = 0;
    let pacerTimer = null;
    let measuredWpm = 0;

    $("read-start").addEventListener("click", () => {
        const text = $("read-text").value.trim();
        if (wordCount(text) < 50) {
            $("read-error").textContent = "Paste at least 50 words (a page of your training material is ideal).";
            return;
        }
        $("read-error").textContent = "";
        data.text = text;
        data.wpm = Math.min(1000, Math.max(100, Number($("read-wpm").value) || 250));
        data.pacer = $("read-pacer").checked;
        save();

        const box = $("read-display");
        box.replaceChildren();
        const words = text.split(/\s+/).filter(Boolean).map((w) => {
            const span = document.createElement("span");
            span.textContent = w + " ";
            box.append(span);
            return span;
        });

        showReadStep("read-run");
        box.scrollTop = 0;
        startedAt = Date.now();

        if (data.pacer) {
            // Highlight 3-word chunks at the target pace; the eye follows the highlight.
            const CHUNK = 3;
            let i = 0;
            pacerTimer = setInterval(() => {
                words.forEach((w) => w.classList.remove("pace"));
                if (i >= words.length) return clearInterval(pacerTimer);
                words.slice(i, i + CHUNK).forEach((w) => w.classList.add("pace"));
                words[i].scrollIntoView({ block: "center", behavior: "smooth" });
                i += CHUNK;
            }, (CHUNK * 60000) / data.wpm);
        }
    });

    $("read-done").addEventListener("click", () => {
        clearInterval(pacerTimer);
        const minutes = (Date.now() - startedAt) / 60000;
        measuredWpm = Math.round(wordCount(data.text) / minutes);
        $("recall-notes").value = "";
        showReadStep("read-recall");
        $("recall-notes").focus();
    });

    $("recall-submit").addEventListener("click", () => {
        $("check-yours").textContent = $("recall-notes").value.trim() || "(nothing written)";
        $("check-original").textContent = data.text;
        $("check-wpm").textContent = measuredWpm;
        showReadStep("read-check");
    });

    document.querySelectorAll("[data-recall]").forEach((b) =>
        b.addEventListener("click", () => {
            const recall = Number(b.dataset.recall);
            const next = nextTarget(data.wpm, recall);
            logToday({ wpm: measuredWpm, recall });
            data.wpm = next;
            $("read-wpm").value = next;
            save();
            $("check-result").textContent =
                `Effective speed today: ${Math.round((measuredWpm * recall) / 100)} wpm ` +
                `(${measuredWpm} wpm × ${recall}% recall). Next target pace: ${next} wpm.`;
        })
    );

    $("read-again").addEventListener("click", () => {
        $("check-result").textContent = "";
        showReadStep("read-setup");
    });

    $("check-card-add").addEventListener("click", () => {
        const q = $("check-q").value.trim();
        const a = $("check-a").value.trim();
        if (!q || !a) return;
        addCards([{ q, a }]);
        logToday({ added: (data.log[today()]?.added || 0) + 1 });
        $("check-q").value = "";
        $("check-a").value = "";
        $("check-q").focus();
        $("check-card-msg").textContent = `Card added (${data.log[today()].added} today).`;
    });

    // ----- Review -----

    let queue = [];
    let relearning = new Set();

    function startReview() {
        queue = dueCards();
        relearning = new Set();
        showCard();
    }

    function showCard() {
        const card = queue[0];
        $("review-empty").hidden = !!card;
        $("review-card").hidden = !card;
        if (!card) return;
        $("review-left").textContent = `${queue.length} left`;
        $("review-q").textContent = card.q;
        $("review-attempt").value = "";
        $("review-a").textContent = card.a;
        $("review-answer").hidden = true;
        $("review-reveal").hidden = false;
        $("review-attempt").focus();
    }

    $("review-reveal").addEventListener("click", () => {
        $("review-answer").hidden = false;
        $("review-reveal").hidden = true;
    });

    document.querySelectorAll("[data-grade]").forEach((b) =>
        b.addEventListener("click", () => {
            const grade = Number(b.dataset.grade);
            const card = queue.shift();
            const idx = data.cards.findIndex((c) => c.id === card.id);
            data.cards[idx] = schedule(card, grade, today());

            // Score only the first attempt each day; forgotten cards come back once at the end.
            if (!relearning.has(card.id)) {
                const entry = data.log[today()] || {};
                logToday({
                    reviewed: (entry.reviewed || 0) + 1,
                    remembered: (entry.remembered || 0) + (grade > 0 ? 1 : 0),
                });
            }
            if (grade === 0 && !relearning.has(card.id)) {
                relearning.add(card.id);
                queue.push(data.cards[idx]);
            }
            save();
            showCard();
        })
    );

    // ----- Cards -----

    $("cards-add").addEventListener("click", () => {
        const cards = parseCards($("cards-bulk").value);
        if (!cards.length) {
            $("cards-msg").textContent = 'Nothing added. Use one card per line: "question | answer".';
            return;
        }
        addCards(cards);
        logToday({ added: (data.log[today()]?.added || 0) + cards.length });
        $("cards-bulk").value = "";
        $("cards-msg").textContent = `Added ${cards.length} card${cards.length > 1 ? "s" : ""}.`;
        renderCards();
    });

    function renderCards() {
        const list = $("cards-list");
        list.replaceChildren();
        $("cards-total").textContent = data.cards.length;
        data.cards.forEach((c) => {
            const li = document.createElement("li");
            const text = document.createElement("div");
            const q = document.createElement("strong");
            q.textContent = c.q;
            const meta = document.createElement("small");
            meta.textContent = ` → ${c.a} · next review ${c.due}`;
            text.append(q, meta);
            const del = document.createElement("button");
            del.className = "ghost";
            del.textContent = "Delete";
            del.setAttribute("aria-label", `Delete card: ${c.q}`);
            del.addEventListener("click", () => {
                if (!confirm("Delete this card?")) return;
                data.cards = data.cards.filter((x) => x.id !== c.id);
                save();
                renderCards();
            });
            li.append(text, del);
            list.append(li);
        });
    }

    // ----- Progress -----

    function renderProgress() {
        const days = Object.keys(data.log).sort();
        const now = today();
        const dayNum = days.length ? Math.round((new Date(now) - new Date(days[0])) / 86400000) + 1 : 0;
        const effective = (e) => (e.wpm != null ? Math.round((e.wpm * e.recall) / 100) : null);
        const drills = days.map((d) => effective(data.log[d])).filter((v) => v != null);
        const learned = data.cards.filter((c) => c.box >= LEARNED_BOX).length;
        const totals = days.reduce(
            (t, d) => ({ r: t.r + (data.log[d].reviewed || 0), ok: t.ok + (data.log[d].remembered || 0) }),
            { r: 0, ok: 0 }
        );

        $("prog-day").textContent = dayNum ? `Day ${dayNum} of 30` : "Not started yet";
        $("prog-streak").textContent = streak(data.log, now);
        $("prog-eff").textContent = drills.length ? `${drills[0]} → ${drills[drills.length - 1]}` : "–";
        $("prog-retention").textContent = totals.r ? `${Math.round((totals.ok / totals.r) * 100)}%` : "–";
        $("prog-learned").textContent = `${learned} / ${data.cards.length}`;

        const body = $("prog-rows");
        body.replaceChildren();
        days.slice(-30).reverse().forEach((d) => {
            const e = data.log[d];
            const cells = [
                d,
                e.wpm ?? "–",
                e.recall != null ? `${e.recall}%` : "–",
                effective(e) ?? "–",
                e.reviewed ? `${e.remembered}/${e.reviewed}` : "–",
                e.added || "–",
            ];
            const tr = document.createElement("tr");
            cells.forEach((v) => {
                const td = document.createElement("td");
                td.textContent = v;
                tr.append(td);
            });
            body.append(tr);
        });
    }

    $("export").addEventListener("click", () => {
        const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
        const a = Object.assign(document.createElement("a"), { href: url, download: `study-backup-${today()}.json` });
        a.click();
        URL.revokeObjectURL(url);
    });

    showTab("today");
}
