# Issue Roulette

Find random recent issues for tscircuit that are ready to be
worked on.

## Local Setup

Install dependencies:

```sh
bun install
```

Create a local environment file:

```sh
cp env.sample .env.local
```

Set `GITHUB_TOKEN` in `.env.local`, then start the development server:

```sh
bun run dev
```

Open `http://localhost:3000` to use the app.

## Environment Variables

| Name | Required | Description |
| --- | --- | --- |
| `GITHUB_TOKEN` | Recommended | GitHub token used to fetch issue data with a higher rate limit. |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for local development and pull request
guidelines.
