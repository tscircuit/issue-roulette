# Contributing

Thanks for helping improve Issue Roulette.

## Local Setup

1. Install dependencies:

   ```sh
   bun install
   ```

2. Copy the sample environment file:

   ```sh
   cp env.sample .env.local
   ```

3. Set `GITHUB_TOKEN` in `.env.local`. A token with public repository read access
   is enough for local development.

4. Start the app:

   ```sh
   bun run dev
   ```

5. Open `http://localhost:3000`.

## Checks

Before opening a pull request, run:

```sh
bun run check
```

## Pull Requests

Keep changes focused, include a short summary, and mention any issue your change
fixes.
