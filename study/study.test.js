// Run: node study/study.test.js
const assert = require("assert");
const { addDays, schedule, nextTarget, streak, parseCards, wordCount, INTERVALS } = require("./study.js");

assert.strictEqual(addDays("2026-01-31", 1), "2026-02-01");
assert.strictEqual(addDays("2026-03-01", -1), "2026-02-28");

const card = { id: "x", q: "q", a: "a", box: 0, due: "2026-01-01" };
assert.deepStrictEqual(schedule(card, 1, "2026-01-01"), { ...card, box: 1, due: "2026-01-03" });
assert.strictEqual(schedule(card, 2, "2026-01-01").box, 2);
assert.deepStrictEqual(schedule({ ...card, box: 4 }, 0, "2026-01-01"), { ...card, box: 0, due: "2026-01-02" });
assert.strictEqual(schedule({ ...card, box: INTERVALS.length - 1 }, 2, "2026-01-01").box, INTERVALS.length - 1);

assert.strictEqual(nextTarget(250, 70), 275);
assert.strictEqual(nextTarget(250, 50), 225);
assert.strictEqual(nextTarget(105, 10), 100);
assert.strictEqual(nextTarget(990, 90), 1000);

const log = { "2026-01-01": {}, "2026-01-02": {}, "2026-01-03": {} };
assert.strictEqual(streak(log, "2026-01-03"), 3);
assert.strictEqual(streak(log, "2026-01-04"), 3); // today not done yet
assert.strictEqual(streak(log, "2026-01-05"), 0);

assert.deepStrictEqual(parseCards("A? | B\nno separator\n | empty q\nX | y | z"), [
    { q: "A?", a: "B" },
    { q: "X", a: "y | z" },
]);

assert.strictEqual(wordCount("  one two\nthree  "), 3);

console.log("study.test.js: all checks passed");
