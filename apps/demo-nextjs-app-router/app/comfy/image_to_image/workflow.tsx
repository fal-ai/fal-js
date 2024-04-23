// This workflow is generated with ComfyUI-fal
const WORKFLOW = {
  prompt: {
    '3': {
      inputs: {
        seed: 280823642470253,
        steps: 20,
        cfg: 8,
        sampler_name: 'dpmpp_2m',
        scheduler: 'normal',
        denoise: 0.8700000000000001,
        model: ['14', 0],
        positive: ['6', 0],
        negative: ['7', 0],
        latent_image: ['12', 0],
      },
      class_type: 'KSampler',
    },
    '6': {
      inputs: {
        text: ['15', 0],
        clip: ['14', 1],
      },
      class_type: 'CLIPTextEncode',
    },
    '7': {
      inputs: {
        text: 'watermark, text\n',
        clip: ['14', 1],
      },
      class_type: 'CLIPTextEncode',
    },
    '8': {
      inputs: {
        samples: ['3', 0],
        vae: ['14', 2],
      },
      class_type: 'VAEDecode',
    },
    '9': {
      inputs: {
        filename_prefix: 'ComfyUI',
        images: ['8', 0],
      },
      class_type: 'SaveImage',
    },
    '10': {
      inputs: {
        image: 'example.png',
        upload: 'image',
      },
      class_type: 'LoadImage',
    },
    '12': {
      inputs: {
        pixels: ['10', 0],
        vae: ['14', 2],
      },
      class_type: 'VAEEncode',
    },
    '14': {
      inputs: {
        ckpt_name: 'v1-5-pruned-emaonly.ckpt',
      },
      class_type: 'CheckpointLoaderSimple',
    },
    '15': {
      inputs: {
        name: 'prompt',
        value:
          'photograph of victorian woman with wings, sky clouds, meadow grass\n',
      },
      class_type: 'StringInput_fal',
    },
  },
  extra_data: {},
  fal_inputs_dev_info: {
    loadimage_1: {
      key: ['10', 'inputs', 'image'],
      class_type: 'LoadImage',
    },
    prompt: {
      key: ['15', 'inputs', 'value'],
      class_type: 'StringInput_fal',
    },
  },
  fal_inputs: {
    loadimage_1: 'example_url',
    prompt:
      'photograph of victorian woman with wings, sky clouds, meadow grass\n',
  },
};

export default function getWorkflow(object: any) {
  let newWorkflow = JSON.parse(JSON.stringify(WORKFLOW));
  newWorkflow.fal_inputs = {
    ...newWorkflow.fal_inputs,
    ...object,
  };

  return newWorkflow;
}
