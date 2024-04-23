const WORKFLOW = {
  prompt: {
    '3': {
      inputs: {
        seed: 351912937281939,
        steps: 20,
        cfg: 2.5,
        sampler_name: 'euler',
        scheduler: 'karras',
        denoise: 1,
        model: ['14', 0],
        positive: ['12', 0],
        negative: ['12', 1],
        latent_image: ['12', 2],
      },
      class_type: 'KSampler',
    },
    '8': {
      inputs: {
        samples: ['3', 0],
        vae: ['15', 2],
      },
      class_type: 'VAEDecode',
    },
    '10': {
      inputs: {
        filename_prefix: 'ComfyUI',
        fps: 10,
        lossless: false,
        quality: 85,
        method: 'default',
        images: ['8', 0],
      },
      class_type: 'SaveAnimatedWEBP',
    },
    '12': {
      inputs: {
        width: 1024,
        height: 576,
        video_frames: 14,
        motion_bucket_id: 127,
        fps: 6,
        augmentation_level: 0,
        clip_vision: ['15', 1],
        init_image: ['23', 0],
        vae: ['15', 2],
      },
      class_type: 'SVD_img2vid_Conditioning',
    },
    '14': {
      inputs: {
        min_cfg: 1,
        model: ['15', 0],
      },
      class_type: 'VideoLinearCFGGuidance',
    },
    '15': {
      inputs: {
        ckpt_name: 'svd.safetensors',
      },
      class_type: 'ImageOnlyCheckpointLoader',
    },
    '23': {
      inputs: {
        image: '18.png',
        upload: 'image',
      },
      class_type: 'LoadImage',
    },
  },
  extra_data: {},
  fal_inputs_dev_info: {
    loadimage_1: {
      key: ['23', 'inputs', 'image'],
      class_type: 'LoadImage',
    },
  },
  fal_inputs: {
    loadimage_1: 'example_url',
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
