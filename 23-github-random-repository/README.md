# GitHub Random Repository

[View the project requirements](https://roadmap.sh/projects/github-random-repo)

In this project, we create a random GitHub repository finder using React and the GitHub API.

The application includes:

* A programming-language selector
* Random repository discovery
* Repository names and descriptions
* Star, fork, and issue statistics
* Direct links to repositories on GitHub
* Loading and error states
* A button for finding another repository
* Clear feedback when no matching repository is available
* A responsive and accessible interface

React sends requests to the GitHub API, processes the returned repository data, selects a repository, and dynamically updates the interface with its details.

The goal of this project is to practise React fundamentals combined with API integration: `fetch`, effects, asynchronous state, error handling, and conditional rendering.

## Status

🚧 In progress. This folder currently contains only the React + Vite scaffold — no repository-finder functionality has been implemented yet.

## Tech Stack

* React + React DOM
* Vite
* Tailwind CSS (via the repository's shared stylesheet)

## Running Locally

From the repository root, after `npm install`:

```bash
npm run dev:23
```

Or from within this folder:

```bash
cd 23-github-random-repository
npm run dev
```

Send constructive feedback, including both criticism and praise, to [farhan.segujja@gmail.com](mailto:farhan.segujja@gmail.com).
