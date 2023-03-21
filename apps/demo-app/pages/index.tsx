import styles from './index.module.css';
import { koldstart, config } from '@fal-ai/koldstart-core';

config({
  credentials: {
    keyId: '8cee2d6e-9d78-47f0-a5a5-2b971e5695b0',
    keySecret: '5afdf76502d0958ac0036929bd982f3a',
  },
});

export async function getServerSideProps(context) {
  console.log('About to call a Koldstart function from NodeJS');
  const result = await koldstart(
    'github|47358913/e300f60b-4a7c-44cd-871d-bea588ef43d6/jokes/add'
  ).run({
    input: {
      joke: 'Koldstart is cool, so the joke is on you!',
    },
  });
  console.log(result);
  const random = await koldstart(
    'github|47358913/e300f60b-4a7c-44cd-871d-bea588ef43d6/jokes/get'
  ).run({
    method: 'get',
  });
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
        Hello <code>koldstart-js</code>
      </h1>
      <p className="text-lg">
        This page can access koldstart functions when it's rendering.
      </p>
      <p>
        Koldstart added joke with success?{' '}
        <strong>{props.result.success.toString()}</strong>
      </p>
      <p>
        Koldstart joke <strong>{props.random.joke}</strong>
      </p>
    </div>
  );
}

export default Index;
