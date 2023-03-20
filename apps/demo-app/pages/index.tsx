import styles from './index.module.css';
import { generateImage } from '../services/koldstart/functions/stable-diffusion/generateImage';
import { getPyjokesVersion } from '../services/koldstart/functions/demo-script/getPyjokesVersion';

// import { stableDiffusion } from "@fal-ai/koldstart-icekubes";

export async function getServerSideProps(context) {
  generateImage({ prompt: '' }, (data) => {
    console.log(JSON.stringify(data, null, 2));
  });
  // getPyjokesVersion({ arg: "" }, (data) => {
  //   console.log(data);
  // });
  return {
    props: {}, // will be passed to the page component as props
  };
}

export function Index() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">
        Hello <code>koldstart-js</code>
      </h1>
      <p className="text-lg">
        This page can access koldstart functions when it's rendering.
      </p>
    </div>
  );
}

export default Index;
