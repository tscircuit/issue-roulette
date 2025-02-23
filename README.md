# Issue Roulette

Find random recent issues for the tscircuit project that are ready to be worked on. This tool helps contributors discover open issues, with a focus on recent and bountied issues.

## Features

- Displays random open issues from tscircuit repositories
- Prioritizes recent issues (last 7-30 days)
- Shows bounty amounts for issues with bounties
- Filters for bountied and non-bountied issues

## Local Setup

1. Clone the repository:
```bash
git clone https://github.com/tscircuit/issue-roulette.git
cd issue-roulette
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.sample .env.local
```
Edit `.env.local` and add your GitHub token. You can create a token at https://github.com/settings/tokens (needs repo scope).

4. Start the development server:
```bash
bun run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to get started, report bugs, and submit pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
