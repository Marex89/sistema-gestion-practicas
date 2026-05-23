# Tests / Test Plan

Purpose: provide a single reproducible test plan to bring up the stack from scratch, run per-service smoke tests and a short internal E2E.

Usage

```bash
chmod +x ./tests/run-tests.sh
./tests/run-tests.sh
```

Outputs
- Per-service logs: `tests/logs/<service>.log`
- E2E log: `tests/logs/e2e.log`

CI suggestion: run `./tests/run-tests.sh --no-build` in a runner with Docker and archive `tests/logs/` as artifacts.
