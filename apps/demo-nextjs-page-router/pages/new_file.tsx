import * as fal from '@fal-ai/serverless-client';

// This is a simple example of how to use the fal-js SDK to execute a workflow.
const result = fal.subscribe('fal-ai/fast-sdxl', {
  input: getWorkflow({}),
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === 'IN_PROGRESS') {
      update.logs.map((log) => log.message).forEach(console.log);
    }
  },
});

// This workflow is generated with ComfyUI-fal
const WORKFLOW = {
  prompt: {
    '3': {
      inputs: {
        seed: 156680208700286,
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
        ckpt_name: 'v1-5-pruned-emaonly.ckpt',
      },
      class_type: 'CheckpointLoaderSimple',
    },
    '5': {
      inputs: {
        width: 512,
        height: 512,
        batch_size: 1,
      },
      class_type: 'EmptyLatentImage',
    },
    '6': {
      inputs: {
        clip: ['4', 1],
      },
      class_type: 'CLIPTextEncode',
    },
    '7': {
      inputs: {
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
  },
  extra_data: {},
  fal_inputs_dev_info: {},
  fal_inputs: {},
};

function getWorkflow(object: any) {
  let newWorkflow = JSON.parse(JSON.stringify(WORKFLOW));
  newWorkflow.fal_inputs = {
    ...newWorkflow.fal_inputs,
    ...object,
  };

  return newWorkflow;
}
