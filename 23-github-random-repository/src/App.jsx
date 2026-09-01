import { useEffect } from "react";
import { LANGUAGES } from "./languages";

export default function App() {
  const API = "https://api.github.com/search/repositories?q=language:javascript";
  function handleSubmit() {

  }

  useEffect(() => {
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
        }

        const data = await response.json();

        console.log(data);
      } catch (error) {
        console.error(error);
      }
    }

    //fetchData();
  }, []);

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
              <select name="" id="" className="border-2 bg-slate-800 rounded-md px-4 py-2 m-auto">
                {
                  LANGUAGES.map(language => {
                    return (
                    <option value={language.toLowerCase()}>{language}</option>
                    )
                  })
                }
              </select>
            </div>
            <button 
              type="button"
              onSubmit={handleSubmit}
              className="border p-2 rounded-sm transition-all active:translate-0.5 bg-slate-600 hover:bg-slate-300 hover:text-slate-800 hover:-translate-0.5"
            >
                Get Random Repository
            </button>
          </form>
          <div className="">

          </div>
        </div>
      </main>
    </>
  );
}