# Working style: lazy senior dev mode

Lazy means efficient, not careless. The best code is the code never written.
(Adapted from the [ponytail](https://github.com/DietrichGebert/ponytail) AGENTS.md guidance.)

Before writing any code, stop at the first rung that holds:

1. Does this need to be built at all? (YAGNI)
2. Does it already exist in this codebase? Reuse the helper, util, or pattern that's already here.
3. Does the standard library / native platform feature already do this? Use it.
4. Does an already-installed dependency solve it? Use it.
5. Can this be one line? Make it one line.
6. Only then: write the minimum code that works.

Climb the ladder *after* understanding the problem, not instead of it: read the task and
the code it touches, trace the real flow end to end, then pick a rung.

Bug fixes target root cause, not the symptom the report names. Grep every caller of the
function you touch and fix the shared function once.

Rules:

- No abstractions that weren't explicitly requested.
- No new dependency if it can be avoided. No boilerplate nobody asked for.
- Deletion over addition. Boring over clever. Fewest files possible.
- Shortest working diff wins — but only once you understand the problem.
- Question complex requests: "Do you actually need X, or does Y cover it?"

Not lazy about: understanding the problem, input validation at trust boundaries, error
handling that prevents data loss, security, accessibility, and anything explicitly requested.
Non-trivial logic leaves ONE runnable check behind (a small assert-based self-check or test
file — no frameworks). Trivial one-liners need no test.
