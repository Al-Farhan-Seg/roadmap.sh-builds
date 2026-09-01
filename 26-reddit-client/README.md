# Reddit Client

[View the project requirements](https://roadmap.sh/projects/reddit-client)

In this project, we create a customisable Reddit client using React and Reddit data.

The application includes:

* Multiple subreddit lanes
* A form for adding new subreddit lanes
* Controls for removing existing lanes
* Posts fetched from selected subreddits
* Post titles, scores, authors, and comment counts
* Direct links to posts on Reddit
* Independent loading and error states for each lane
* A responsive interface that supports multiple content columns

React manages the subreddit lanes, fetches post data, handles user interactions, and dynamically updates each lane without reloading the page.

The goal of this project is to practise React fundamentals combined with API integration: component composition, lifting state, effects, asynchronous data fetching, and managing multiple independent data sources.

## Status

🚧 In progress. This folder currently contains only the React + Vite scaffold — no Reddit client functionality has been implemented yet.

## Tech Stack

* React + React DOM
* Vite
* Tailwind CSS (via the repository's shared stylesheet)

## Running Locally

From the repository root, after `npm install`:

```bash
npm run dev:26
```

Or from within this folder:

```bash
cd 26-reddit-client
npm run dev
```

Send constructive feedback, including both criticism and praise, to [farhan.segujja@gmail.com](mailto:farhan.segujja@gmail.com).
