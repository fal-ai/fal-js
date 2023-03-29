import styles from './index.module.css';
import * as fal from '@fal/serverless-client';

fal.config({
  credentials: {
    userId: '',
    keyId: '',
    keySecret: '',
  },
});

export async function getServerSideProps(context) {
  console.log('About to call a fal serverless function from NodeJS');
  const result = await fal.run(
    'e300f60b-4a7c-44cd-871d-bea588ef43d6/jokes/add',
    {
      input: {
        joke: 'fal serverless is cool, so the joke is on you!',
      },
    }
  );
  console.log(result);
  const random = await fal.run(
    'e300f60b-4a7c-44cd-871d-bea588ef43d6/jokes/get',
    {
      method: 'get',
    }
  );
  console.log(random);
  return {
    props: {
      random,
      result,
    },
  };
}

export function Index(props) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">
        Hello <code>fal serverless</code>
      </h1>
      <p className="text-lg">
        This page can access <strong>fal serverless</strong> functions when
        it&apos;s rendering.
      </p>
      <p>
        Added joke with success?{' '}
        <strong>{props.result.success.toString()}</strong>
      </p>
      <p>
        Joke <strong>{props.random.joke}</strong>
      </p>
    </div>
  );
}

export default Index;
