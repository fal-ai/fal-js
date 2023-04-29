import { getJoke } from '../services/getJoke';

export async function getServerSideProps(context) {
  try {
    const result = await getJoke();
    return {
      props: {
        ...result,
      },
    };
  } catch (error) {
    return {
      props: {
        error: error.message,
      },
    };
  }
}

function Error(props) {
  if (!props.error) {
    return null;
  }
  return (
    <div
      className="p-4 mb-4 text-sm text-red-800 rounded bg-red-50 dark:bg-gray-800 dark:text-red-400"
      role="alert"
    >
      <span className="font-medium">Error</span> {props.error}
    </div>
  );
}

export function Index(props) {
  const handleClick = async (e) => {
    e.preventDefault();
    try {
      const joke = await getJoke();
      console.log(joke);
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <div className="min-h-screen dark:bg-gray-900 dark:text-white bg-white text-black">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 py-10">
        <h1 className="text-4xl font-bold mb-8">
          Hello <code>fal-serverless</code>
        </h1>
        <p className="text-lg mb-10">
          This page can access <strong>fal-serverless</strong> functions when
          it&apos;s rendering.
        </p>
        <Error error={props.error} />

        <button
          onClick={handleClick}
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold text-xl py-4 px-8 mx-auto rounded focus:outline-none focus:shadow-outline"
        >
          Get Joke
        </button>

        <p className="mt-10">
          Here&apos;s a joke: <strong>{props.joke}</strong>
        </p>
      </main>
    </div>
  );
}

export default Index;
