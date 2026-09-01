import { useEffect, useState } from "react";
import { LANGUAGES } from "./languages";

export default function App() {
  const [language, setLanguage] = useState("javascript");
  const [repo, setRepo] = useState(null);

  const API = `https://api.github.com/search/repositories?q=language:${language}`;
  


    async function fetchData() {
      try {
        const token = import.meta.env.VITE_GITHUB_TOKEN;

        const response = await fetch(API, {
          headers: {
            Accept: "application/vnd.github+json",
            ...(token && {
              Authorization: `Bearer ${token}`,
            }),
          },
        });

        if (!response.ok) {
          throw new Error(
            `GitHub API request failed: ${response.status}`
          );
        } else {

          const data = await response.json();

          const maxIndex = data.items.length - 1;
          const minIndex = 0;
          const randomIndex = Math.floor(Math.random() * (maxIndex - minIndex + 1)) + minIndex;
          const randomRepo = data.items[randomIndex];

          setRepo(randomRepo);
          console.log(data)
        }

        
      } catch (error) {
        console.error(error);
      }
    }

    function handleSubmit() {
      fetchData()
    }

  return (
    <>
      <h1 className="fixed top-0 left-0 z-50 m-0 w-full bg-slate-800 px-4 py-4 text-center text-3xl font-bold text-emerald-100 shadow-md">
        GitHub Random Repository
      </h1>
      
      <main className="flex min-h-screen items-center justify-center bg-white p-6 pt-24 font-sans">
        <div className="max-w-md text-center">
          <form action="" className="border-2 bg-slate-800 text-emerald-100 p-4 rounded-2xl flex-col gap-5 flex">
            <div className="flex justify-between gap-2 items-center">
              <label className="">Language</label>
              <select
                className="border-2 bg-slate-800 rounded-md px-4 py-2 m-auto"
                value={language}
                onChange={(event) => {
                  setLanguage(event.target.value)
                  setRepo(null)}
                }
              >
                {
                  LANGUAGES.map(language => {
                    return (
                    <option 
                      value={language.toLowerCase()}
                      key={language}
                    >
                      {language}
                    </option>
                    )
                  })
                }
              </select>
            </div>
            <button 
              type="button"
              onClick={handleSubmit}
              className="border p-2 rounded-sm transition-all active:translate-0.5 bg-slate-600 hover:bg-slate-300 hover:text-slate-800 hover:-translate-0.5"
            >
                Get Random Repository
            </button>
          </form>
          {repo && (
            <div className="mt-6 rounded-xl border bg-amber-200 p-4 text-slate-700">
              <img
                src={repo.owner.avatar_url}
                alt={`${repo.owner.login} avatar`}
                className="mx-auto h-20 w-20 rounded-full border border-slate-800"
              />

              <h2 className="mt-3 text-xl font-bold">
                {repo.full_name}
              </h2>

              <p className="mt-2">
                {repo.description}
              </p>

              <div className="mt-4 flex justify-center gap-4 text-sm">
                <div className="rounded-md bg-white px-3 py-2">
                  <p className="font-bold">{repo.stargazers_count}</p>
                  <p>Stars</p>
                </div>

                <div className="rounded-md bg-white px-3 py-2">
                  <p className="font-bold">{repo.forks_count}</p>
                  <p>Forks</p>
                </div>

                <div className="rounded-md bg-white px-3 py-2">
                  <p className="font-bold">{repo.open_issues_count}</p>
                  <p>Open Issues</p>
                </div>
              </div>

              <a
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
              >
                <div className="mx-auto my-3 flex w-7/10 items-center justify-center gap-2 rounded-md border bg-slate-600 p-3 text-emerald-50 hover:bg-slate-900 hover:text-amber-200 md:w-1/2">
                  View Repository

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-arrow-up-right"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fillRule="evenodd"
                      d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h4.793L2.146 13.146a.5.5 0 0 0 .708.708L13 3.707V8.5a.5.5 0 0 0 1 0z"
                    />
                  </svg>
                </div>
              </a>
            </div>
          )}
        </div>
      </main>
    </>
  );
}