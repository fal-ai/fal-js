// This workflow is generated with ComfyUI-fal
const WORKFLOW = {
  prompt: {
    '3': {
      inputs: {
        seed: 704126934460886,
        steps: 20,
        cfg: 8,
        sampler_name: 'euler',
        scheduler: 'normal',
        denoise: 1,
        model: ['4', 0],
        positive: ['6', 0],
        negative: ['7', 0],
        latent_image: ['5', 0],
      },
      class_type: 'KSampler',
    },
    '4': {
      inputs: {
        ckpt_name: 'sd_xl_1.0.safetensors',
      },
      class_type: 'CheckpointLoaderSimple',
    },
    '5': {
      inputs: {
        width: 1024,
        height: 1024,
        batch_size: 1,
      },
      class_type: 'EmptyLatentImage',
    },
    '6': {
      inputs: {
        text: ['10', 0],
        clip: ['4', 1],
      },
      class_type: 'CLIPTextEncode',
    },
    '7': {
      inputs: {
        text: ['11', 0],
        clip: ['4', 1],
      },
      class_type: 'CLIPTextEncode',
    },
    '8': {
      inputs: {
        samples: ['3', 0],
        vae: ['4', 2],
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
        name: 'prompt',
        value:
          'beautiful scenery nature glass bottle landscape, , purple galaxy bottle,',
      },
      class_type: 'StringInput_fal',
    },
    '11': {
      inputs: {
        name: 'negative_prompt',
        value: 'text, watermark',
      },
      class_type: 'StringInput_fal',
    },
  },
  extra_data: {},
  fal_inputs_dev_info: {
    prompt: {
      key: ['10', 'inputs', 'value'],
      class_type: 'StringInput_fal',
    },
    negative_prompt: {
      key: ['11', 'inputs', 'value'],
      class_type: 'StringInput_fal',
    },
  },
  fal_inputs: {
    prompt:
      'beautiful scenery nature glass bottle landscape, , purple galaxy bottle,',
    negative_prompt: 'text, watermark',
  },
};

export default function getWorkflow(object: any) {
  const newWorkflow = JSON.parse(JSON.stringify(WORKFLOW));
  newWorkflow.fal_inputs = {
    ...newWorkflow.fal_inputs,
    ...object,
  };

  return newWorkflow;
}
