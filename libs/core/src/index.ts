import { koldstart } from './koldstart';

async function getDataDirectly() {
  const result = await koldstart('stable-difussion/generateImage')
    .run({
      input: {
        prompt: '',
      },
    })
    .data();
}

async function getPartialData() {
  const execution = koldstart('stable-difussion/generateImage').run({
    input: {
      prompt: '',
    },
  });
  execution.on('progress', ({ progress, partialData }) => {
    console.log(`Progress is ${progress}`);
  });
  const result = await execution.data();
}

export { koldstart };
