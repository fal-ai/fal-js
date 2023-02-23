import styles from './index.module.css';
import { generateImage } from '../services/koldstart/functions/generateImage';
import { getPyjokesVersion } from '../services/koldstart/functions/getPyjokesVersion';

export async function getServerSideProps(context) {
  // generateImage({ prompt: "" }, (data) => {
  //   console.log(data);
  // });
  getPyjokesVersion((data) => {
    console.log(data);
  });
  return {
    props: {}, // will be passed to the page component as props
  };
}

export function Index() {
  return (
    <div className="container mx-auto">
      <div className="bg-indigo-500 p-2 font-mono">Hello!</div>
    </div>
  );
}

export default Index;
