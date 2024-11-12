export type ImageSize = {
  /**
   * The width of the generated image. Default value: `512`
   */
  width?: number;
  /**
   * The height of the generated image. Default value: `512`
   */
  height?: number;
};
export type Image = {
  /**
   * The URL where the file can be downloaded from.
   */
  url: string;
  /**
   * The mime type of the file.
   */
  content_type?: string | null;
  /**
   * The name of the file. It will be auto-generated if not provided.
   */
  file_name?: string | null;
  /**
   * The size of the file in bytes.
   */
  file_size?: number | null;
  /**
   * The width of the image in pixels.
   */
  width?: number | null;
  /**
   * The height of the image in pixels.
   */
  height?: number | null;
};
export type File = {
  /**
   * The URL where the file can be downloaded from.
   */
  url: string;
  /**
   * The mime type of the file.
   */
  content_type?: string;
  /**
   * The name of the file. It will be auto-generated if not provided.
   */
  file_name?: string;
  /**
   * The size of the file in bytes.
   */
  file_size?: number;
  /**
   * File data
   */
  file_data?: string;
};
export type RGBColor = {
  /**
   * Red color value
   */
  r?: number;
  /**
   * Green color value
   */
  g?: number;
  /**
   * Blue color value
   */
  b?: number;
};
export type LoraWeight = {
  /**
   * URL or the path to the LoRA weights. Or HF model name.
   */
  path: string;
  /**
   * The scale of the LoRA weight. This is used to scale the LoRA weight
   * before merging it with the base model. Default value: `1`
   */
  scale?: number;
  /**
   * If set to true, the embedding will be forced to be used.
   */
  force?: boolean;
};
export type IPAdapter = {
  /**
   * URL of the image to be used as the IP adapter.
   */
  ip_adapter_image_url: string | Blob | File | Array<string | Blob | File>;
  /**
   * The mask to use for the IP adapter. When using a mask, the ip-adapter image size and the mask size must be the same
   */
  ip_adapter_mask_url?: string | Blob | File;
  /**
   * URL or the path to the IP adapter weights.
   */
  path: string;
  /**
   * Subfolder in the model directory where the IP adapter weights are stored.
   */
  model_subfolder?: string;
  /**
   * Name of the weight file.
   */
  weight_name?: string;
  /**
   * URL or the path to the InsightFace model weights.
   */
  insight_face_model_path?: string;
  /**
   * The scale of the IP adapter weight. This is used to scale the IP adapter weight
   * before merging it with the base model. Default value: `1`
   */
  scale?: number;
  /**
   * The scale of the IP adapter weight. This is used to scale the IP adapter weight
   * before merging it with the base model.
   */
  scale_json?: Record<string, any>;
  /**
   * The factor to apply to the unconditional noising of the IP adapter.
   */
  unconditional_noising_factor?: number;
  /**
   * The value to set the image projection shortcut to. For FaceID plus V1 models,
   * this should be set to False. For FaceID plus V2 models, this should be set to True.
   * Default is True. Default value: `true`
   */
  image_projection_shortcut?: boolean;
};
export type ControlNetUnion = {
  /**
   * URL or the path to the control net weights.
   */
  path: string;
  /**
   * optional URL to the controlnet config.json file.
   */
  config_url?: string | Blob | File;
  /**
   * The optional variant if a Hugging Face repo key is used.
   */
  variant?: string;
  /**
   * The control images and modes to use for the control net.
   */
  controls: Array<ControlNetUnionInput>;
};
export type ControlNet = {
  /**
   * URL or the path to the control net weights.
   */
  path: string;
  /**
   * optional URL to the controlnet config.json file.
   */
  config_url?: string | Blob | File;
  /**
   * The optional variant if a Hugging Face repo key is used.
   */
  variant?: string;
  /**
   * URL of the image to be used as the control net.
   */
  image_url: string | Blob | File;
  /**
   * The mask to use for the controlnet. When using a mask, the control image size and the mask size must be the same and divisible by 32.
   */
  mask_url?: string | Blob | File;
  /**
   * The scale of the control net weight. This is used to scale the control net weight
   * before merging it with the base model. Default value: `1`
   */
  conditioning_scale?: number;
  /**
   * The percentage of the image to start applying the controlnet in terms of the total timesteps.
   */
  start_percentage?: number;
  /**
   * The percentage of the image to end applying the controlnet in terms of the total timesteps. Default value: `1`
   */
  end_percentage?: number;
  /**
   * The index of the IP adapter to be applied to the controlnet. This is only needed for InstantID ControlNets.
   */
  ip_adapter_index?: number;
};
export type ControlNetUnionInput = {
  /**
   * URL of the image to be used as the control image.
   */
  control_image_url: string | Blob | File;
  /**
   * URL of the mask for the control image.
   */
  mask_image_url?: string | Blob | File;
  /**
   * Control Mode for Flux Controlnet Union. Supported values are:
   * - canny: Uses the edges for guided generation.
   * - tile: Uses the tiles for guided generation.
   * - depth: Utilizes a grayscale depth map for guided generation.
   * - blur: Adds a blur to the image.
   * - pose: Uses the pose of the image for guided generation.
   * - gray: Converts the image to grayscale.
   * - low-quality: Converts the image to a low-quality image.
   */
  control_mode:
    | "canny"
    | "tile"
    | "depth"
    | "blur"
    | "pose"
    | "gray"
    | "low-quality";
  /**
   * The scale of the control net weight. This is used to scale the control net weight
   * before merging it with the base model. Default value: `1`
   */
  conditioning_scale?: number;
  /**
   * Threshold for mask. Default value: `0.5`
   */
  mask_threshold?: number;
  /**
   * The percentage of the image to start applying the controlnet in terms of the total timesteps.
   */
  start_percentage?: number;
  /**
   * The percentage of the image to end applying the controlnet in terms of the total timesteps. Default value: `1`
   */
  end_percentage?: number;
};
export type Embedding = {
  /**
   * URL or the path to the embedding weights.
   */
  path: string;
  /**
   * The list of tokens to use for the embedding. Default value: `<s0>,<s1>`
   */
  tokens?: Array<string>;
};
export type InputV2 = {
  /**
   * URL of the image to remove background from
   */
  image_url: string | Blob | File;
  /**
   * Model to use for background removal.
   * The 'General Use (Light)' model is the original model used in the BiRefNet repository.
   * The 'General Use (Light)' model is the original model used in the BiRefNet repository but trained with 2K images.
   * The 'General Use (Heavy)' model is a slower but more accurate model.
   * The 'Matting' model is a model trained specifically for matting images.
   * The 'Portrait' model is a model trained specifically for portrait images.
   * The 'General Use (Light)' model is recommended for most use cases.
   *
   * The corresponding models are as follows:
   * - 'General Use (Light)': BiRefNet-DIS_ep580.pth
   * - 'General Use (Heavy)': BiRefNet-massive-epoch_240.pth
   * - 'Portrait': BiRefNet-portrait-TR_P3M_10k-epoch_120.pth Default value: `"General Use (Light)"`
   */
  model?:
    | "General Use (Light)"
    | "General Use (Light 2K)"
    | "General Use (Heavy)"
    | "Matting"
    | "Portrait";
  /**
   * The resolution to operate on. The higher the resolution, the more accurate the output will be for high res input images. Default value: `"1024x1024"`
   */
  operating_resolution?: "1024x1024" | "2048x2048";
  /**
   * The format of the output image Default value: `"png"`
   */
  output_format?: "webp" | "png";
  /**
   * Whether to output the mask used to remove the background
   */
  output_mask?: boolean;
  /**
   * Whether to refine the foreground using the estimated mask Default value: `true`
   */
  refine_foreground?: boolean;
};
export type FalInputDevInfo = {
  /**
   * The key of the parameter that the input is associated with.
   */
  key: Array<string>;
  /**
   * The class type of the input node.
   */
  class_type: string;
};
export type WhisperChunk = {
  /**
   * Start and end timestamp of the chunk
   */
  timestamp: Array<void>;
  /**
   * Transcription of the chunk
   */
  text: string;
};
export type DiarizationSegment = {
  /**
   * Start and end timestamp of the segment
   */
  timestamp: Array<void>;
  /**
   * Speaker ID of the segment
   */
  speaker: string;
};
export type Frame = {
  /**
   * URL of the frame
   */
  url: string;
};
export type ImagePrompt = {
  /**
   *  Default value: `"ImagePrompt"`
   */
  type?: "ImagePrompt" | "PyraCanny" | "CPDS" | "FaceSwap";
  /**
   *
   */
  image_url?: string | Blob | File;
  /**
   *  Default value: `0.5`
   */
  stop_at?: number;
  /**
   *  Default value: `1`
   */
  weight?: number;
};
export type ReferenceFace = {
  /**
   * URL of the reference face image
   */
  image_url: string | Blob | File;
};
export type MoondreamInputParam = {
  /**
   * URL of the image to be processed
   */
  image_url: string | Blob | File;
  /**
   * Prompt to be used for the image Default value: `"Describe this image."`
   */
  prompt?: string;
};
export type PolygonOutputWithLabels = {
  /**
   * Results from the model
   */
  results: PolygonOutput;
  /**
   * Processed image
   */
  image?: Image;
};
export type OCRBoundingBoxSingle = {
  /**
   * X-coordinate of the top-left corner
   */
  x: number;
  /**
   * Y-coordinate of the top-left corner
   */
  y: number;
  /**
   * Width of the bounding box
   */
  w: number;
  /**
   * Height of the bounding box
   */
  h: number;
  /**
   * Label of the bounding box
   */
  label: string;
};
export type BoundingBox = {
  /**
   * X-coordinate of the top-left corner
   */
  x: number;
  /**
   * Y-coordinate of the top-left corner
   */
  y: number;
  /**
   * Width of the bounding box
   */
  w: number;
  /**
   * Height of the bounding box
   */
  h: number;
  /**
   * Label of the bounding box
   */
  label: string;
};
export type PolygonOutput = {
  /**
   * List of polygons
   */
  polygons: Array<Polygon>;
};
export type OCRBoundingBoxOutputWithLabels = {
  /**
   * Results from the model
   */
  results: OCRBoundingBox;
  /**
   * Processed image
   */
  image?: Image;
};
export type BoundingBoxes = {
  /**
   * List of bounding boxes
   */
  bboxes: Array<BoundingBox>;
};
export type OCRBoundingBox = {
  /**
   * List of quadrilateral boxes
   */
  quad_boxes: Array<OCRBoundingBoxSingle>;
};
export type BoundingBoxOutputWithLabels = {
  /**
   * Results from the model
   */
  results: BoundingBoxes;
  /**
   * Processed image
   */
  image?: Image;
};
export type Polygon = {
  /**
   * List of points
   */
  points: Array<Record<string, any>>;
  /**
   * Label of the polygon
   */
  label: string;
};
export type Region = {
  /**
   * X-coordinate of the top-left corner
   */
  x1: number;
  /**
   * Y-coordinate of the top-left corner
   */
  y1: number;
  /**
   * X-coordinate of the bottom-right corner
   */
  x2: number;
  /**
   * Y-coordinate of the bottom-right corner
   */
  y2: number;
};
export type BoxPrompt = {
  /**
   * X Min Coordinate of the box
   */
  x_min?: number;
  /**
   * Y Min Coordinate of the box
   */
  y_min?: number;
  /**
   * X Max Coordinate of the prompt
   */
  x_max?: number;
  /**
   * Y Max Coordinate of the prompt
   */
  y_max?: number;
};
export type PointPrompt = {
  /**
   * X Coordinate of the prompt Default value: `305`
   */
  x?: number;
  /**
   * Y Coordinate of the prompt Default value: `350`
   */
  y?: number;
  /**
   * Label of the prompt. 1 for foreground, 0 for background Default value: `"1"`
   */
  label?: "0" | "1";
};
export type FaceDetection = {
  /**
   * Bounding box of the face.
   */
  bbox: Array<number>;
  /**
   * Keypoints of the face.
   */
  kps?: Array<Array<number>>;
  /**
   * Keypoints of the face on the image.
   */
  kps_image: Image;
  /**
   * Confidence score of the detection.
   */
  det_score: number;
  /**
   * Embedding of the face.
   */
  embedding_file: File;
  /**
   * Either M or F if available.
   */
  sex?: string;
};
export type Color = {
  /**
   * Red value Default value: `128`
   */
  r?: number;
  /**
   * Green value Default value: `128`
   */
  g?: number;
  /**
   * Blue value Default value: `128`
   */
  b?: number;
};
export type AudioFile = {
  /**
   *
   */
  url: string;
  /**
   *  Default value: `"audio/wav"`
   */
  content_type?: string;
  /**
   *  Default value: `"8535dd59e911496a947daa35c07e67a3_tmplkcy6tut.wav"`
   */
  file_name?: string;
  /**
   * The size of the file in bytes.
   */
  file_size?: number | null;
};
export type FluxProV11UltraInput = {
  /**
   * The prompt to generate an image from.
   */
  prompt: string;
  /**
   * The size of the generated image. Default value: `landscape_4_3`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The same seed and the same prompt given to the same version of the model
   * will output the same image every time.
   */
  seed?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * The safety tolerance level for the generated image. 1 being the most strict and 5 being the most permissive. Default value: `"2"`
   */
  safety_tolerance?: "1" | "2" | "3" | "4" | "5" | "6";
};
export type FluxProV11UltraOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type FluxLoraFastTrainingInput = {
  /**
   * URL to zip archive with images. Try to use at least 4 images in general the more the better.
   *
   * In addition to images the archive can contain text files with captions. Each text file should have the same name as the image file it corresponds to.
   */
  images_data_url: string | Blob | File;
  /**
   * Trigger word to be used in the captions. If None, a trigger word will not be used.
   * If no captions are provide the trigger_word will be used instead of captions. If captions are the trigger word will not be used.
   */
  trigger_word?: string;
  /**
   * If True segmentation masks will be used in the weight the training loss. For people a face mask is used if possible. Default value: `true`
   */
  create_masks?: boolean;
  /**
   * Number of steps to train the LoRA on.
   */
  steps?: number;
  /**
   * If True, the training will be for a style. This will deactivate segmentation, captioning and will use trigger word instead. Use the trigger word to specify the style.
   */
  is_style?: boolean;
  /**
   * Specifies whether the input data is already in a processed format. When set to False (default), the system expects raw input where image files and their corresponding caption files share the same name (e.g., 'photo.jpg' and 'photo.txt'). Set to True if your data is already in a preprocessed format.
   */
  is_input_format_already_preprocessed?: boolean;
  /**
   * The format of the archive. If not specified, the format will be inferred from the URL.
   */
  data_archive_format?: string;
};
export type FluxLoraFastTrainingOutput = {
  /**
   * URL to the trained diffusers lora weights.
   */
  diffusers_lora_file: File;
  /**
   * URL to the training configuration file.
   */
  config_file: File;
};
export type RecraftV3Output = {
  /**
   * The ID of the created style, this ID can be used to reference the style in the future.
   */
  style_id: string;
};
export type RecraftV3Input = {
  /**
   *
   */
  prompt: string;
  /**
   *  Default value: `square_hd`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The style of the generated images. Vector images cost 2X as much. Default value: `"realistic_image"`
   */
  style?:
    | "any"
    | "realistic_image"
    | "digital_illustration"
    | "vector_illustration"
    | "realistic_image/b_and_w"
    | "realistic_image/hard_flash"
    | "realistic_image/hdr"
    | "realistic_image/natural_light"
    | "realistic_image/studio_portrait"
    | "realistic_image/enterprise"
    | "realistic_image/motion_blur"
    | "digital_illustration/pixel_art"
    | "digital_illustration/hand_drawn"
    | "digital_illustration/grain"
    | "digital_illustration/infantile_sketch"
    | "digital_illustration/2d_art_poster"
    | "digital_illustration/handmade_3d"
    | "digital_illustration/hand_drawn_outline"
    | "digital_illustration/engraving_color"
    | "digital_illustration/2d_art_poster_2"
    | "vector_illustration/engraving"
    | "vector_illustration/line_art"
    | "vector_illustration/line_circuit"
    | "vector_illustration/linocut";
  /**
   * An array of preferable colors Default value: ``
   */
  colors?: Array<RGBColor>;
  /**
   * The ID of the custom style reference (optional)
   */
  style_id?: string | null;
};
export type MinimaxVideoImageToVideoInput = {
  /**
   *
   */
  prompt: string;
  /**
   * URL of the image to use as the first frame
   */
  image_url: string | Blob | File;
  /**
   * Whether to use the model's prompt optimizer Default value: `true`
   */
  prompt_optimizer?: boolean;
};
export type MinimaxVideoImageToVideoOutput = {
  /**
   * The generated video
   */
  video: File;
};
export type AuraFlowInput = {
  /**
   * The prompt to generate images from
   */
  prompt: string;
  /**
   * The number of images to generate Default value: `1`
   */
  num_images?: number;
  /**
   * The seed to use for generating images
   */
  seed?: number;
  /**
   * Classifier free guidance scale Default value: `3.5`
   */
  guidance_scale?: number;
  /**
   * The number of inference steps to take Default value: `50`
   */
  num_inference_steps?: number;
  /**
   * Whether to perform prompt expansion (recommended) Default value: `true`
   */
  expand_prompt?: boolean;
};
export type AuraFlowOutput = {
  /**
   * The generated images
   */
  images: Array<Image>;
  /**
   * The seed used to generate the images
   */
  seed: number;
  /**
   * The expanded prompt
   */
  prompt: string;
};
export type FluxDevImageToImageInput = {
  /**
   * The URL of the image to generate an image from.
   */
  image_url: string | Blob | File;
  /**
   * The prompt to generate an image from.
   */
  prompt: string;
  /**
   * The strength of the initial image. Higher strength values are better for this model. Default value: `0.95`
   */
  strength?: number;
  /**
   * The size of the generated image. Default value: `landscape_4_3`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `40`
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of the model
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `3.5`
   */
  guidance_scale?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
};
export type FluxDevImageToImageOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type FluxDevInput = {
  /**
   * The URL of the image to generate an image from.
   */
  image_url: string | Blob | File;
  /**
   * The prompt to generate an image from.
   */
  prompt: string;
  /**
   * The strength of the initial image. Higher strength values are better for this model. Default value: `0.95`
   */
  strength?: number;
  /**
   * The size of the generated image. Default value: `landscape_4_3`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `40`
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of the model
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `3.5`
   */
  guidance_scale?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
};
export type FluxDevOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type FluxLoraOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type FluxLoraInput = {
  /**
   * The prompt to generate an image from.
   */
  prompt: string;
  /**
   * The size of the generated image.
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `28`
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of the model
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The LoRAs to use for the image generation. You can use any number of LoRAs
   * and they will be merged together to generate the final image. Default value: ``
   */
  loras?: Array<LoraWeight>;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `3.5`
   */
  guidance_scale?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  output_format?: "jpeg" | "png";
  /**
   * URL of image to use for inpainting. or img2img
   */
  image_url: string | Blob | File;
  /**
   * The strength to use for inpainting/image-to-image. Only used if the image_url is provided. 1.0 is completely remakes the image while 0.0 preserves the original. Default value: `0.85`
   */
  strength?: number;
  /**
   * The mask to area to Inpaint in.
   */
  mask_url: string | Blob | File;
};
export type FluxSchnellInput = {
  /**
   * The URL of the image to generate an image from.
   */
  image_url: string | Blob | File;
  /**
   * The prompt to generate an image from.
   */
  prompt: string;
  /**
   * The strength of the initial image. Higher strength values are better for this model. Default value: `0.95`
   */
  strength?: number;
  /**
   * The size of the generated image. Default value: `landscape_4_3`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `40`
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of the model
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `3.5`
   */
  guidance_scale?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
};
export type FluxSchnellOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type FluxProV11Input = {
  /**
   * The prompt to generate an image from.
   */
  prompt: string;
  /**
   * The size of the generated image. Default value: `landscape_4_3`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The same seed and the same prompt given to the same version of the model
   * will output the same image every time.
   */
  seed?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * The safety tolerance level for the generated image. 1 being the most strict and 5 being the most permissive. Default value: `"2"`
   */
  safety_tolerance?: "1" | "2" | "3" | "4" | "5" | "6";
};
export type FluxProV11Output = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type FluxProNewInput = {
  /**
   * The prompt to generate an image from.
   */
  prompt: string;
  /**
   * The size of the generated image. Default value: `landscape_4_3`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The same seed and the same prompt given to the same version of the model
   * will output the same image every time.
   */
  seed?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * The safety tolerance level for the generated image. 1 being the most strict and 5 being the most permissive. Default value: `"2"`
   */
  safety_tolerance?: "1" | "2" | "3" | "4" | "5" | "6";
};
export type FluxProNewOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type OmnigenV1Output = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type OmnigenV1Input = {
  /**
   * The prompt to generate an image from.
   */
  prompt: string;
  /**
   * URL of images to use while generating the image, Use <img><|image_1|></img> for the first image and so on. Default value: ``
   */
  input_image_urls?: Array<string>;
  /**
   * The size of the generated image. Default value: `square_hd`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `50`
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of the model
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `3`
   */
  guidance_scale?: number;
  /**
   * The Image Guidance scale is a measure of how close you want
   * the model to stick to your input image when looking for a related image to show you. Default value: `1.6`
   */
  img_guidance_scale?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  output_format?: "jpeg" | "png";
};
export type StableDiffusionV35LargeInput = {
  /**
   * The prompt to generate an image from.
   */
  prompt: string;
  /**
   * The negative prompt to use. Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The size of the generated image. Default value: `landscape_4_3`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `28`
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of the model
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `3.5`
   */
  guidance_scale?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  output_format?: "jpeg" | "png";
};
export type StableDiffusionV35LargeOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type StableDiffusionV35MediumOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type StableDiffusionV35MediumInput = {
  /**
   * The prompt to generate an image from.
   */
  prompt: string;
  /**
   * The negative prompt to use. Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The size of the generated image. Default value: `landscape_4_3`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `40`
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of the model
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `4.5`
   */
  guidance_scale?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  output_format?: "jpeg" | "png";
};
export type RecraftV3CreateStyleOutput = {
  /**
   * The ID of the created style, this ID can be used to reference the style in the future.
   */
  style_id: string;
};
export type RecraftV3CreateStyleInput = {
  /**
   *
   */
  prompt: string;
  /**
   *  Default value: `square_hd`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The style of the generated images. Vector images cost 2X as much. Default value: `"realistic_image"`
   */
  style?:
    | "any"
    | "realistic_image"
    | "digital_illustration"
    | "vector_illustration"
    | "realistic_image/b_and_w"
    | "realistic_image/hard_flash"
    | "realistic_image/hdr"
    | "realistic_image/natural_light"
    | "realistic_image/studio_portrait"
    | "realistic_image/enterprise"
    | "realistic_image/motion_blur"
    | "digital_illustration/pixel_art"
    | "digital_illustration/hand_drawn"
    | "digital_illustration/grain"
    | "digital_illustration/infantile_sketch"
    | "digital_illustration/2d_art_poster"
    | "digital_illustration/handmade_3d"
    | "digital_illustration/hand_drawn_outline"
    | "digital_illustration/engraving_color"
    | "digital_illustration/2d_art_poster_2"
    | "vector_illustration/engraving"
    | "vector_illustration/line_art"
    | "vector_illustration/line_circuit"
    | "vector_illustration/linocut";
  /**
   * An array of preferable colors Default value: ``
   */
  colors?: Array<RGBColor>;
  /**
   * The ID of the custom style reference (optional)
   */
  style_id?: string | null;
};
export type FluxRealismOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type FluxRealismInput = {
  /**
   * The prompt to generate an image from.
   */
  prompt: string;
  /**
   * The size of the generated image. Default value: `landscape_4_3`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `28`
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of the model
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `3.5`
   */
  guidance_scale?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * The strength of the model. Default value: `1`
   */
  strength?: number;
  /**
   * The output image format. Default value: `"jpeg"`
   */
  output_format?: "jpeg" | "png";
};
export type FluxLoraInpaintingOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type FluxLoraInpaintingInput = {
  /**
   * The prompt to generate an image from.
   */
  prompt: string;
  /**
   * The size of the generated image.
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `28`
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of the model
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The LoRAs to use for the image generation. You can use any number of LoRAs
   * and they will be merged together to generate the final image. Default value: ``
   */
  loras?: Array<LoraWeight>;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `3.5`
   */
  guidance_scale?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  output_format?: "jpeg" | "png";
  /**
   * URL of image to use for inpainting. or img2img
   */
  image_url: string | Blob | File;
  /**
   * The strength to use for inpainting/image-to-image. Only used if the image_url is provided. 1.0 is completely remakes the image while 0.0 preserves the original. Default value: `0.85`
   */
  strength?: number;
  /**
   * The mask to area to Inpaint in.
   */
  mask_url: string | Blob | File;
};
export type FluxLoraImageToImageOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type FluxLoraImageToImageInput = {
  /**
   * The prompt to generate an image from.
   */
  prompt: string;
  /**
   * The size of the generated image.
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `28`
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of the model
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The LoRAs to use for the image generation. You can use any number of LoRAs
   * and they will be merged together to generate the final image. Default value: ``
   */
  loras?: Array<LoraWeight>;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `3.5`
   */
  guidance_scale?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  output_format?: "jpeg" | "png";
  /**
   * URL of image to use for inpainting. or img2img
   */
  image_url: string | Blob | File;
  /**
   * The strength to use for inpainting/image-to-image. Only used if the image_url is provided. 1.0 is completely remakes the image while 0.0 preserves the original. Default value: `0.85`
   */
  strength?: number;
  /**
   * The mask to area to Inpaint in.
   */
  mask_url: string | Blob | File;
};
export type FluxGeneralInput = {
  /**
   * The prompt to generate an image from.
   */
  prompt: string;
  /**
   * The size of the generated image.
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `28`
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of the model
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The LoRAs to use for the image generation. You can use any number of LoRAs
   * and they will be merged together to generate the final image. Default value: ``
   */
  loras?: Array<LoraWeight>;
  /**
   * The controlnets to use for the image generation. Only one controlnet is supported at the moment. Default value: ``
   */
  controlnets?: Array<ControlNet>;
  /**
   * The controlnet unions to use for the image generation. Only one controlnet is supported at the moment. Default value: ``
   */
  controlnet_unions?: Array<ControlNetUnion>;
  /**
   * IP-Adapter to use for image generation. Default value: ``
   */
  ip_adapters?: Array<IPAdapter>;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `3.5`
   */
  guidance_scale?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `3.5`
   */
  real_cfg_scale?: number;
  /**
   * Uses classical CFG as in SD1.5, SDXL, etc. Increases generation times and price when set to be true.
   * If using XLabs IP-Adapter v1, this will be turned on!.
   */
  use_real_cfg?: boolean;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * URL of Image for Reference-Only
   */
  reference_image_url?: string | Blob | File;
  /**
   * Strength of reference_only generation. Only used if a reference image is provided. Default value: `0.65`
   */
  reference_strength?: number;
  /**
   * The percentage of the total timesteps when the reference guidance is to bestarted.
   */
  reference_start?: number;
  /**
   * The percentage of the total timesteps when the reference guidance is to be ended. Default value: `1`
   */
  reference_end?: number;
  /**
   * URL of image to use for inpainting. or img2img
   */
  image_url: string | Blob | File;
  /**
   * The strength to use for inpainting/image-to-image. Only used if the image_url is provided. 1.0 is completely remakes the image while 0.0 preserves the original. Default value: `0.85`
   */
  strength?: number;
  /**
   * The mask to area to Inpaint in.
   */
  mask_url: string | Blob | File;
};
export type FluxGeneralOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type FluxGeneralInpaintingInput = {
  /**
   * The prompt to generate an image from.
   */
  prompt: string;
  /**
   * The size of the generated image.
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `28`
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of the model
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The LoRAs to use for the image generation. You can use any number of LoRAs
   * and they will be merged together to generate the final image. Default value: ``
   */
  loras?: Array<LoraWeight>;
  /**
   * The controlnets to use for the image generation. Only one controlnet is supported at the moment. Default value: ``
   */
  controlnets?: Array<ControlNet>;
  /**
   * The controlnet unions to use for the image generation. Only one controlnet is supported at the moment. Default value: ``
   */
  controlnet_unions?: Array<ControlNetUnion>;
  /**
   * IP-Adapter to use for image generation. Default value: ``
   */
  ip_adapters?: Array<IPAdapter>;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `3.5`
   */
  guidance_scale?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `3.5`
   */
  real_cfg_scale?: number;
  /**
   * Uses classical CFG as in SD1.5, SDXL, etc. Increases generation times and price when set to be true.
   * If using XLabs IP-Adapter v1, this will be turned on!.
   */
  use_real_cfg?: boolean;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * URL of Image for Reference-Only
   */
  reference_image_url?: string | Blob | File;
  /**
   * Strength of reference_only generation. Only used if a reference image is provided. Default value: `0.65`
   */
  reference_strength?: number;
  /**
   * The percentage of the total timesteps when the reference guidance is to bestarted.
   */
  reference_start?: number;
  /**
   * The percentage of the total timesteps when the reference guidance is to be ended. Default value: `1`
   */
  reference_end?: number;
  /**
   * URL of image to use for inpainting. or img2img
   */
  image_url: string | Blob | File;
  /**
   * The strength to use for inpainting/image-to-image. Only used if the image_url is provided. 1.0 is completely remakes the image while 0.0 preserves the original. Default value: `0.85`
   */
  strength?: number;
  /**
   * The mask to area to Inpaint in.
   */
  mask_url: string | Blob | File;
};
export type FluxGeneralInpaintingOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type FluxGeneralImageToImageInput = {
  /**
   * The prompt to generate an image from.
   */
  prompt: string;
  /**
   * The size of the generated image.
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `28`
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of the model
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The LoRAs to use for the image generation. You can use any number of LoRAs
   * and they will be merged together to generate the final image. Default value: ``
   */
  loras?: Array<LoraWeight>;
  /**
   * The controlnets to use for the image generation. Only one controlnet is supported at the moment. Default value: ``
   */
  controlnets?: Array<ControlNet>;
  /**
   * The controlnet unions to use for the image generation. Only one controlnet is supported at the moment. Default value: ``
   */
  controlnet_unions?: Array<ControlNetUnion>;
  /**
   * IP-Adapter to use for image generation. Default value: ``
   */
  ip_adapters?: Array<IPAdapter>;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `3.5`
   */
  guidance_scale?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `3.5`
   */
  real_cfg_scale?: number;
  /**
   * Uses classical CFG as in SD1.5, SDXL, etc. Increases generation times and price when set to be true.
   * If using XLabs IP-Adapter v1, this will be turned on!.
   */
  use_real_cfg?: boolean;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * URL of Image for Reference-Only
   */
  reference_image_url?: string | Blob | File;
  /**
   * Strength of reference_only generation. Only used if a reference image is provided. Default value: `0.65`
   */
  reference_strength?: number;
  /**
   * The percentage of the total timesteps when the reference guidance is to bestarted.
   */
  reference_start?: number;
  /**
   * The percentage of the total timesteps when the reference guidance is to be ended. Default value: `1`
   */
  reference_end?: number;
  /**
   * URL of image to use for inpainting. or img2img
   */
  image_url: string | Blob | File;
  /**
   * The strength to use for inpainting/image-to-image. Only used if the image_url is provided. 1.0 is completely remakes the image while 0.0 preserves the original. Default value: `0.85`
   */
  strength?: number;
  /**
   * The mask to area to Inpaint in.
   */
  mask_url: string | Blob | File;
};
export type FluxGeneralImageToImageOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type FluxGeneralDifferentialDiffusionInput = {
  /**
   * The prompt to generate an image from.
   */
  prompt: string;
  /**
   * The size of the generated image.
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `28`
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of the model
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The LoRAs to use for the image generation. You can use any number of LoRAs
   * and they will be merged together to generate the final image. Default value: ``
   */
  loras?: Array<LoraWeight>;
  /**
   * The controlnets to use for the image generation. Only one controlnet is supported at the moment. Default value: ``
   */
  controlnets?: Array<ControlNet>;
  /**
   * The controlnet unions to use for the image generation. Only one controlnet is supported at the moment. Default value: ``
   */
  controlnet_unions?: Array<ControlNetUnion>;
  /**
   * IP-Adapter to use for image generation. Default value: ``
   */
  ip_adapters?: Array<IPAdapter>;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `3.5`
   */
  guidance_scale?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `3.5`
   */
  real_cfg_scale?: number;
  /**
   * Uses classical CFG as in SD1.5, SDXL, etc. Increases generation times and price when set to be true.
   * If using XLabs IP-Adapter v1, this will be turned on!.
   */
  use_real_cfg?: boolean;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * URL of Image for Reference-Only
   */
  reference_image_url?: string | Blob | File;
  /**
   * Strength of reference_only generation. Only used if a reference image is provided. Default value: `0.65`
   */
  reference_strength?: number;
  /**
   * The percentage of the total timesteps when the reference guidance is to bestarted.
   */
  reference_start?: number;
  /**
   * The percentage of the total timesteps when the reference guidance is to be ended. Default value: `1`
   */
  reference_end?: number;
  /**
   * URL of image to use for inpainting. or img2img
   */
  image_url: string | Blob | File;
  /**
   * The strength to use for inpainting/image-to-image. Only used if the image_url is provided. 1.0 is completely remakes the image while 0.0 preserves the original. Default value: `0.85`
   */
  strength?: number;
  /**
   * The mask to area to Inpaint in.
   */
  mask_url: string | Blob | File;
};
export type FluxGeneralDifferentialDiffusionOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type FluxGeneralRfInversionInput = {
  /**
   * The prompt to generate an image from.
   */
  prompt: string;
  /**
   * The size of the generated image.
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `28`
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of the model
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The LoRAs to use for the image generation. You can use any number of LoRAs
   * and they will be merged together to generate the final image. Default value: ``
   */
  loras?: Array<LoraWeight>;
  /**
   * The controlnets to use for the image generation. Only one controlnet is supported at the moment. Default value: ``
   */
  controlnets?: Array<ControlNet>;
  /**
   * The controlnet unions to use for the image generation. Only one controlnet is supported at the moment. Default value: ``
   */
  controlnet_unions?: Array<ControlNetUnion>;
  /**
   * IP-Adapter to use for image generation. Default value: ``
   */
  ip_adapters?: Array<IPAdapter>;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `3.5`
   */
  guidance_scale?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `3.5`
   */
  real_cfg_scale?: number;
  /**
   * Uses classical CFG as in SD1.5, SDXL, etc. Increases generation times and price when set to be true.
   * If using XLabs IP-Adapter v1, this will be turned on!.
   */
  use_real_cfg?: boolean;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * URL of Image for Reference-Only
   */
  reference_image_url?: string | Blob | File;
  /**
   * Strength of reference_only generation. Only used if a reference image is provided. Default value: `0.65`
   */
  reference_strength?: number;
  /**
   * The percentage of the total timesteps when the reference guidance is to bestarted.
   */
  reference_start?: number;
  /**
   * The percentage of the total timesteps when the reference guidance is to be ended. Default value: `1`
   */
  reference_end?: number;
  /**
   * URL of image to use for inpainting. or img2img
   */
  image_url: string | Blob | File;
  /**
   * The strength to use for inpainting/image-to-image. Only used if the image_url is provided. 1.0 is completely remakes the image while 0.0 preserves the original. Default value: `0.85`
   */
  strength?: number;
  /**
   * The mask to area to Inpaint in.
   */
  mask_url: string | Blob | File;
};
export type FluxGeneralRfInversionOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type IclightV2Output = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type IclightV2Input = {
  /**
   * The prompt to generate an image from.
   */
  prompt: string;
  /**
   * Negative Prompt for the image Default value: `""`
   */
  negative_prompt?: string;
  /**
   * URL of image to be used for relighting
   */
  image_url: string | Blob | File;
  /**
   * The size of the generated image.
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `28`
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of the model
   * will output the same image every time.
   */
  seed?: number;
  /**
   * Provide lighting conditions for the model Default value: `"None"`
   */
  initial_latent?: "None" | "Left" | "Right" | "Top" | "Bottom";
  /**
   * Use HR fix
   */
  enable_hr_fix?: boolean;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * The number of images to generate. Default value: `1`
   */
  cfg?: number;
  /**
   * Strength for low-resolution pass. Default value: `0.98`
   */
  lowres_denoise?: number;
  /**
   * Strength for high-resolution pass. Only used if enable_hr_fix is True. Default value: `0.95`
   */
  highres_denoise?: number;
  /**
   *  Default value: `0.5`
   */
  hr_downscale?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `3.5`
   */
  guidance_scale?: number;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  output_format?: "jpeg" | "png";
};
export type FluxDifferentialDiffusionInput = {
  /**
   * The prompt to generate an image from.
   */
  prompt: string;
  /**
   * URL of image to use as initial image.
   */
  image_url: string | Blob | File;
  /**
   * URL of change map.
   */
  change_map_image_url: string | Blob | File;
  /**
   * The strength to use for image-to-image. 1.0 is completely remakes the image while 0.0 preserves the original. Default value: `0.85`
   */
  strength?: number;
  /**
   * The number of inference steps to perform. Default value: `28`
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of the model
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `3.5`
   */
  guidance_scale?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
};
export type FluxDifferentialDiffusionOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type StableDiffusionV3MediumInput = {
  /**
   * The image URL to generate an image from.
   */
  image_url: string | Blob | File;
  /**
   * The prompt to generate an image from.
   */
  prompt: string;
  /**
   * The negative prompt to generate an image from. Default value: `""`
   */
  negative_prompt?: string;
  /**
   * If set to true, prompt will be upsampled with more details.
   */
  prompt_expansion?: boolean;
  /**
   * The size of the generated image. Defaults to the conditioning image's size.
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `28`
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `5`
   */
  guidance_scale?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * The strength of the image-to-image transformation. Default value: `0.9`
   */
  strength?: number;
};
export type StableDiffusionV3MediumOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
  /**
   * The number of images generated.
   */
  num_images: number;
};
export type StableDiffusionV3MediumImageToImageInput = {
  /**
   * The image URL to generate an image from.
   */
  image_url: string | Blob | File;
  /**
   * The prompt to generate an image from.
   */
  prompt: string;
  /**
   * The negative prompt to generate an image from. Default value: `""`
   */
  negative_prompt?: string;
  /**
   * If set to true, prompt will be upsampled with more details.
   */
  prompt_expansion?: boolean;
  /**
   * The size of the generated image. Defaults to the conditioning image's size.
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `28`
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `5`
   */
  guidance_scale?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * The strength of the image-to-image transformation. Default value: `0.9`
   */
  strength?: number;
};
export type StableDiffusionV3MediumImageToImageOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
  /**
   * The number of images generated.
   */
  num_images: number;
};
export type FastSdxlOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type FastSdxlInput = {
  /**
   * The URL of the image to use as a starting point for the generation.
   */
  image_url: string | Blob | File;
  /**
   * The URL of the mask to use for inpainting.
   */
  mask_url: string | Blob | File;
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The negative prompt to use.Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The size of the generated image. Default value: `square_hd`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `25`
   */
  num_inference_steps?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `7.5`
   */
  guidance_scale?: number;
  /**
   * determines how much the generated image resembles the initial image Default value: `0.95`
   */
  strength?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * The list of LoRA weights to use. Default value: ``
   */
  loras?: Array<LoraWeight>;
  /**
   * The list of embeddings to use. Default value: ``
   */
  embeddings?: Array<Embedding>;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * The version of the safety checker to use. v1 is the default CompVis safety checker. v2 uses a custom ViT model. Default value: `"v1"`
   */
  safety_checker_version?: "v1" | "v2";
  /**
   * If set to true, the prompt will be expanded with additional prompts.
   */
  expand_prompt?: boolean;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  format?: "jpeg" | "png";
  /**
   * An id bound to a request, can be used with response to identify the request
   * itself. Default value: `""`
   */
  request_id?: string;
};
export type LoraInput = {
  /**
   * The method to use for the sigmas. If set to 'custom', the sigmas will be set based
   * on the provided sigmas schedule in the `array` field.
   * Defaults to 'default' which means the scheduler will use the sigmas of the scheduler. Default value: `"default"`
   */
  method?: "default" | "array";
  /**
   * Sigmas schedule to be used if 'custom' method is selected. Default value: ``
   */
  array?: Array<number>;
};
export type LoraOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The latents saved for debugging.
   */
  debug_latents?: File;
  /**
   * The latents saved for debugging per pass.
   */
  debug_per_pass_latents?: File;
};
export type AuraSrInput = {
  /**
   * URL of the image to upscale.
   */
  image_url: string | Blob | File;
  /**
   * Upscaling factor. More coming soon. Default value: `"4"`
   */
  upscaling_factor?: "4";
  /**
   * Whether to use overlapping tiles for upscaling. Setting this to true helps remove seams but doubles the inference time.
   */
  overlapping_tiles?: boolean;
  /**
   * Checkpoint to use for upscaling. More coming soon. Default value: `"v1"`
   */
  checkpoint?: "v1" | "v2";
};
export type AuraSrOutput = {
  /**
   * Upscaled image
   */
  image: Image;
  /**
   * Timings for each step in the pipeline.
   */
  timings: Record<string, any>;
};
export type StableCascadeOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type StableCascadeInput = {
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The negative prompt to use. Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * Number of steps to run the first stage for. Default value: `20`
   */
  first_stage_steps?: number;
  /**
   * Number of steps to run the second stage for. Default value: `10`
   */
  second_stage_steps?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `4`
   */
  guidance_scale?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you.
   */
  second_stage_guidance_scale?: number;
  /**
   * The size of the generated image. Default value: `square_hd`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The same seed and the same prompt given to the same version of Stable Cascade
   * will output the same image every time.
   */
  seed?: number;
  /**
   * If set to false, the safety checker will be disabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * If set to true, the image will be returned as base64 encoded string.
   */
  sync_mode?: boolean;
};
export type MinimaxVideoInput = {
  /**
   *
   */
  prompt: string;
  /**
   * URL of the image to use as the first frame
   */
  image_url: string | Blob | File;
  /**
   * Whether to use the model's prompt optimizer Default value: `true`
   */
  prompt_optimizer?: boolean;
};
export type MinimaxVideoOutput = {
  /**
   * The generated video
   */
  video: File;
};
export type HaiperVideoV2Input = {
  /**
   *
   */
  prompt: string;
  /**
   * The duration of the generated video in seconds Default value: `"4"`
   */
  duration?: "4" | "6";
  /**
   * Whether to use the model's prompt enhancer Default value: `true`
   */
  prompt_enhancer?: boolean;
  /**
   * The same seed and the same prompt given to the same version of the model
   * will output the same video every time.
   */
  seed?: number;
  /**
   * URL of the image to use as the first frame
   */
  image_url: string | Blob | File;
};
export type HaiperVideoV2Output = {
  /**
   * The generated video
   */
  video: File;
};
export type HaiperVideoV2ImageToVideoInput = {
  /**
   *
   */
  prompt: string;
  /**
   * The duration of the generated video in seconds Default value: `"4"`
   */
  duration?: "4" | "6";
  /**
   * Whether to use the model's prompt enhancer Default value: `true`
   */
  prompt_enhancer?: boolean;
  /**
   * The same seed and the same prompt given to the same version of the model
   * will output the same video every time.
   */
  seed?: number;
  /**
   * URL of the image to use as the first frame
   */
  image_url: string | Blob | File;
};
export type HaiperVideoV2ImageToVideoOutput = {
  /**
   * The generated video
   */
  video: File;
};
export type MochiV1Output = {
  /**
   * The generated video
   */
  video: File;
};
export type MochiV1Input = {
  /**
   * The prompt to generate a video from.
   */
  prompt: string;
  /**
   * The seed to use for generating the video.
   */
  seed?: number;
  /**
   * Whether to enable prompt expansion. Default value: `true`
   */
  enable_prompt_expansion?: boolean;
};
export type LumaDreamMachineInput = {
  /**
   *
   */
  prompt: string;
  /**
   * The aspect ratio of the generated video Default value: `"16:9"`
   */
  aspect_ratio?: "16:9" | "9:16" | "4:3" | "3:4" | "21:9" | "9:21";
  /**
   * Whether the video should loop (end of video is blended with the beginning)
   */
  loop?: boolean;
};
export type LumaDreamMachineOutput = {
  /**
   * The generated video
   */
  video: File;
};
export type LumaDreamMachineImageToVideoInput = {
  /**
   *
   */
  prompt: string;
  /**
   * The aspect ratio of the generated video Default value: `"16:9"`
   */
  aspect_ratio?: "16:9" | "9:16" | "4:3" | "3:4" | "21:9" | "9:21";
  /**
   * Whether the video should loop (end of video is blended with the beginning)
   */
  loop?: boolean;
};
export type LumaDreamMachineImageToVideoOutput = {
  /**
   * The generated video
   */
  video: File;
};
export type KlingVideoV1StandardTextToVideoInput = {
  /**
   *
   */
  prompt: string;
  /**
   * The duration of the generated video in seconds Default value: `"5"`
   */
  duration?: "5" | "10";
  /**
   * The aspect ratio of the generated video frame Default value: `"16:9"`
   */
  aspect_ratio?: "16:9" | "9:16" | "1:1";
};
export type KlingVideoV1StandardTextToVideoOutput = {
  /**
   * The generated video
   */
  video: File;
};
export type KlingVideoV1StandardImageToVideoInput = {
  /**
   *
   */
  prompt: string;
  /**
   * The duration of the generated video in seconds Default value: `"5"`
   */
  duration?: "5" | "10";
  /**
   * The aspect ratio of the generated video frame Default value: `"16:9"`
   */
  aspect_ratio?: "16:9" | "9:16" | "1:1";
};
export type KlingVideoV1StandardImageToVideoOutput = {
  /**
   * The generated video
   */
  video: File;
};
export type KlingVideoV1ProTextToVideoInput = {
  /**
   *
   */
  prompt: string;
  /**
   * The duration of the generated video in seconds Default value: `"5"`
   */
  duration?: "5" | "10";
  /**
   * The aspect ratio of the generated video frame Default value: `"16:9"`
   */
  aspect_ratio?: "16:9" | "9:16" | "1:1";
};
export type KlingVideoV1ProTextToVideoOutput = {
  /**
   * The generated video
   */
  video: File;
};
export type KlingVideoV1ProImageToVideoInput = {
  /**
   *
   */
  prompt: string;
  /**
   * The duration of the generated video in seconds Default value: `"5"`
   */
  duration?: "5" | "10";
  /**
   * The aspect ratio of the generated video frame Default value: `"16:9"`
   */
  aspect_ratio?: "16:9" | "9:16" | "1:1";
};
export type KlingVideoV1ProImageToVideoOutput = {
  /**
   * The generated video
   */
  video: File;
};
export type Cogvideox5bOutput = {
  /**
   * The URL to the generated video
   */
  video: File;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated video. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * The prompt used for generating the video.
   */
  prompt: string;
};
export type Cogvideox5bInput = {
  /**
   * The prompt to generate the video from.
   */
  prompt: string;
  /**
   * The size of the generated video. Default value: `[object Object]`
   */
  video_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The negative prompt to generate video from Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The number of inference steps to perform. Default value: `50`
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of the model
   * will output the same video every time.
   */
  seed?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related video to show you. Default value: `7`
   */
  guidance_scale?: number;
  /**
   * Use RIFE for video interpolation Default value: `true`
   */
  use_rife?: boolean;
  /**
   * The target FPS of the video Default value: `16`
   */
  export_fps?: number;
};
export type Cogvideox5bVideoToVideoOutput = {
  /**
   * The URL to the generated video
   */
  video: File;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated video. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * The prompt used for generating the video.
   */
  prompt: string;
};
export type Cogvideox5bVideoToVideoInput = {
  /**
   * The prompt to generate the video from.
   */
  prompt: string;
  /**
   * The size of the generated video. Default value: `[object Object]`
   */
  video_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The negative prompt to generate video from Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The number of inference steps to perform. Default value: `50`
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of the model
   * will output the same video every time.
   */
  seed?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related video to show you. Default value: `7`
   */
  guidance_scale?: number;
  /**
   * Use RIFE for video interpolation Default value: `true`
   */
  use_rife?: boolean;
  /**
   * The target FPS of the video Default value: `16`
   */
  export_fps?: number;
};
export type Cogvideox5bImageToVideoOutput = {
  /**
   * The URL to the generated video
   */
  video: File;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated video. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * The prompt used for generating the video.
   */
  prompt: string;
};
export type Cogvideox5bImageToVideoInput = {
  /**
   * The prompt to generate the video from.
   */
  prompt: string;
  /**
   * The size of the generated video. Default value: `[object Object]`
   */
  video_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The negative prompt to generate video from Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The number of inference steps to perform. Default value: `50`
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of the model
   * will output the same video every time.
   */
  seed?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related video to show you. Default value: `7`
   */
  guidance_scale?: number;
  /**
   * Use RIFE for video interpolation Default value: `true`
   */
  use_rife?: boolean;
  /**
   * The target FPS of the video Default value: `16`
   */
  export_fps?: number;
};
export type StableVideoInput = {
  /**
   * The prompt to use as a starting point for the generation.
   */
  prompt: string;
  /**
   * The negative prompt to use as a starting point for the generation. Default value: `"unrealistic, saturated, high contrast, big nose, painting, drawing, sketch, cartoon, anime, manga, render, CG, 3d, watermark, signature, label"`
   */
  negative_prompt?: string;
  /**
   * The size of the generated video. Default value: `landscape_16_9`
   */
  video_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The motion bucket id determines the motion of the generated video. The
   * higher the number, the more motion there will be. Default value: `127`
   */
  motion_bucket_id?: number;
  /**
   * The conditoning augmentation determines the amount of noise that will be
   * added to the conditioning frame. The higher the number, the more noise
   * there will be, and the less the video will look like the initial image.
   * Increase it for more motion. Default value: `0.02`
   */
  cond_aug?: number;
};
export type StableVideoOutput = {
  /**
   * Generated video
   */
  video: File;
  /**
   * Seed for random number generator
   */
  seed: number;
};
export type FastSvdTextToVideoInput = {
  /**
   * The URL of the image to use as a starting point for the generation.
   */
  image_url: string | Blob | File;
  /**
   * The motion bucket id determines the motion of the generated video. The
   * higher the number, the more motion there will be. Default value: `127`
   */
  motion_bucket_id?: number;
  /**
   * The conditoning augmentation determines the amount of noise that will be
   * added to the conditioning frame. The higher the number, the more noise
   * there will be, and the less the video will look like the initial image.
   * Increase it for more motion. Default value: `0.02`
   */
  cond_aug?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The number of steps to run the model for. The higher the number the better
   * the quality and longer it will take to generate. Default value: `20`
   */
  steps?: number;
  /**
   * Enabling [DeepCache](https://github.com/horseee/DeepCache) will make the execution
   * faster, but might sometimes degrade overall quality. The higher the setting, the
   * faster the execution will be, but the more quality might be lost. Default value: `"none"`
   */
  deep_cache?: "none" | "minimum" | "medium" | "high";
  /**
   * The FPS of the generated video. The higher the number, the faster the video will
   * play. Total video length is 25 frames. Default value: `10`
   */
  fps?: number;
};
export type FastSvdTextToVideoOutput = {
  /**
   * The generated video file.
   */
  video: File;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
};
export type FastSvdLcmInput = {
  /**
   * The URL of the image to use as a starting point for the generation.
   */
  image_url: string | Blob | File;
  /**
   * The motion bucket id determines the motion of the generated video. The
   * higher the number, the more motion there will be. Default value: `127`
   */
  motion_bucket_id?: number;
  /**
   * The conditoning augmentation determines the amount of noise that will be
   * added to the conditioning frame. The higher the number, the more noise
   * there will be, and the less the video will look like the initial image.
   * Increase it for more motion. Default value: `0.02`
   */
  cond_aug?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The number of steps to run the model for. The higher the number the better
   * the quality and longer it will take to generate. Default value: `4`
   */
  steps?: number;
  /**
   * The FPS of the generated video. The higher the number, the faster the video will
   * play. Total video length is 25 frames. Default value: `10`
   */
  fps?: number;
};
export type FastSvdLcmOutput = {
  /**
   * The generated video file.
   */
  video: File;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
};
export type BirefnetInput = {
  /**
   * URL of the image to remove background from
   */
  image_url: string | Blob | File;
  /**
   * Model to use for background removal.
   * The 'General Use (Light)' model is the original model used in the BiRefNet repository.
   * The 'General Use (Heavy)' model is a slower but more accurate model.
   * The 'Portrait' model is a model trained specifically for portrait images.
   * The 'General Use (Light)' model is recommended for most use cases.
   *
   * The corresponding models are as follows:
   * - 'General Use (Light)': BiRefNet-DIS_ep580.pth
   * - 'General Use (Heavy)': BiRefNet-massive-epoch_240.pth
   * - 'Portrait': BiRefNet-portrait-TR_P3M_10k-epoch_120.pth Default value: `"General Use (Light)"`
   */
  model?: "General Use (Light)" | "General Use (Heavy)" | "Portrait";
  /**
   * The resolution to operate on. The higher the resolution, the more accurate the output will be for high res input images. Default value: `"1024x1024"`
   */
  operating_resolution?: "1024x1024" | "2048x2048";
  /**
   * The format of the output image Default value: `"png"`
   */
  output_format?: "webp" | "png";
  /**
   * Whether to output the mask used to remove the background
   */
  output_mask?: boolean;
  /**
   * Whether to refine the foreground using the estimated mask Default value: `true`
   */
  refine_foreground?: boolean;
};
export type BirefnetOutput = {
  /**
   * Image with background removed
   */
  image: Image;
  /**
   * Mask used to remove the background
   */
  mask_image?: Image;
};
export type BirefnetV2Input = {
  /**
   * URL of the image to remove background from
   */
  image_url: string | Blob | File;
  /**
   * Model to use for background removal.
   * The 'General Use (Light)' model is the original model used in the BiRefNet repository.
   * The 'General Use (Heavy)' model is a slower but more accurate model.
   * The 'Portrait' model is a model trained specifically for portrait images.
   * The 'General Use (Light)' model is recommended for most use cases.
   *
   * The corresponding models are as follows:
   * - 'General Use (Light)': BiRefNet-DIS_ep580.pth
   * - 'General Use (Heavy)': BiRefNet-massive-epoch_240.pth
   * - 'Portrait': BiRefNet-portrait-TR_P3M_10k-epoch_120.pth Default value: `"General Use (Light)"`
   */
  model?: "General Use (Light)" | "General Use (Heavy)" | "Portrait";
  /**
   * The resolution to operate on. The higher the resolution, the more accurate the output will be for high res input images. Default value: `"1024x1024"`
   */
  operating_resolution?: "1024x1024" | "2048x2048";
  /**
   * The format of the output image Default value: `"png"`
   */
  output_format?: "webp" | "png";
  /**
   * Whether to output the mask used to remove the background
   */
  output_mask?: boolean;
  /**
   * Whether to refine the foreground using the estimated mask Default value: `true`
   */
  refine_foreground?: boolean;
};
export type BirefnetV2Output = {
  /**
   * Image with background removed
   */
  image: Image;
  /**
   * Mask used to remove the background
   */
  mask_image?: Image;
};
export type FastSvdLcmTextToVideoInput = {
  /**
   * The URL of the image to use as a starting point for the generation.
   */
  image_url: string | Blob | File;
  /**
   * The motion bucket id determines the motion of the generated video. The
   * higher the number, the more motion there will be. Default value: `127`
   */
  motion_bucket_id?: number;
  /**
   * The conditoning augmentation determines the amount of noise that will be
   * added to the conditioning frame. The higher the number, the more noise
   * there will be, and the less the video will look like the initial image.
   * Increase it for more motion. Default value: `0.02`
   */
  cond_aug?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The number of steps to run the model for. The higher the number the better
   * the quality and longer it will take to generate. Default value: `4`
   */
  steps?: number;
  /**
   * The FPS of the generated video. The higher the number, the faster the video will
   * play. Total video length is 25 frames. Default value: `10`
   */
  fps?: number;
};
export type FastSvdLcmTextToVideoOutput = {
  /**
   * The generated video file.
   */
  video: File;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
};
export type CreativeUpscalerInput = {
  /**
   * The type of model to use for the upscaling. Default is SD_1_5 Default value: `"SD_1_5"`
   */
  model_type?: "SD_1_5" | "SDXL";
  /**
   * The image to upscale.
   */
  image_url: string | Blob | File;
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results. If no prompt is provide BLIP2 will be used to generate a prompt.
   */
  prompt?: string;
  /**
   * The scale of the output image. The higher the scale, the bigger the output image will be. Default value: `2`
   */
  scale?: number;
  /**
   * How much the output can deviate from the original Default value: `0.5`
   */
  creativity?: number;
  /**
   * How much detail to add Default value: `1`
   */
  detail?: number;
  /**
   * How much to preserve the shape of the original image Default value: `0.25`
   */
  shape_preservation?: number;
  /**
   * The suffix to add to the generated prompt. Not used for a custom prompt. This is useful to add a common ending to all prompts such as 'high quality' etc or embedding tokens. Default value: `" high quality, highly detailed, high resolution, sharp"`
   */
  prompt_suffix?: string;
  /**
   * The negative prompt to use.Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `"blurry, low resolution, bad, ugly, low quality, pixelated, interpolated, compression artifacts, noisey, grainy"`
   */
  negative_prompt?: string;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `7.5`
   */
  guidance_scale?: number;
  /**
   * The number of inference steps to use for generating the image. The more steps
   * the better the image will be but it will also take longer to generate. Default value: `20`
   */
  num_inference_steps?: number;
  /**
   * If set to true, the resulting image will be checked whether it includes any
   * potentially unsafe content. If it does, it will be replaced with a black
   * image. Default value: `true`
   */
  enable_safety_checks?: boolean;
  /**
   * If set to true, the image will not be processed by the CCSR model before
   * being processed by the creativity model.
   */
  skip_ccsr?: boolean;
  /**
   * Allow for large uploads that could take a very long time.
   */
  override_size_limits?: boolean;
  /**
   * The URL to the base model to use for the upscaling
   */
  base_model_url?: string | Blob | File;
  /**
   * The URL to the additional LORA model to use for the upscaling. Default is None
   */
  additional_lora_url?: string | Blob | File;
  /**
   * The scale of the additional LORA model to use for the upscaling. Default is 1.0 Default value: `1`
   */
  additional_lora_scale?: number;
  /**
   * The URL to the additional embeddings to use for the upscaling. Default is None
   */
  additional_embedding_url?: string | Blob | File;
};
export type CreativeUpscalerOutput = {
  /**
   * The generated image file info.
   */
  image: Image;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
};
export type ClarityUpscalerOutput = {
  /**
   * The URL of the generated image.
   */
  image: Image;
  /**
   * The seed used to generate the image.
   */
  seed: number;
  /**
   * The timings of the different steps in the workflow.
   */
  timings: Record<string, any>;
};
export type ClarityUpscalerInput = {
  /**
   * The URL of the image to upscale.
   */
  image_url: string | Blob | File;
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results. Default value: `"masterpiece, best quality, highres"`
   */
  prompt?: string;
  /**
   * The upscale factor Default value: `2`
   */
  upscale_factor?: number;
  /**
   * The negative prompt to use. Use it to address details that you don't want in the image. Default value: `"(worst quality, low quality, normal quality:2)"`
   */
  negative_prompt?: string;
  /**
   * The creativity of the model. The higher the creativity, the more the model will deviate from the prompt.
   * Refers to the denoise strength of the sampling. Default value: `0.35`
   */
  creativity?: number;
  /**
   * The resemblance of the upscaled image to the original image. The higher the resemblance, the more the model will try to keep the original image.
   * Refers to the strength of the ControlNet. Default value: `0.6`
   */
  resemblance?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `4`
   */
  guidance_scale?: number;
  /**
   * The number of inference steps to perform. Default value: `18`
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * If set to false, the safety checker will be disabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
};
export type CcsrInput = {
  /**
   * The text prompt you would like to convert to speech.
   */
  image_url: string | Blob | File;
  /**
   * The scale of the output image. The higher the scale, the bigger the output image will be. Default value: `2`
   */
  scale?: number;
  /**
   * If specified, a patch-based sampling strategy will be used for sampling. Default value: `"none"`
   */
  tile_diffusion?: "none" | "mix" | "gaussian";
  /**
   * Size of patch. Default value: `1024`
   */
  tile_diffusion_size?: number;
  /**
   * Stride of sliding patch. Default value: `512`
   */
  tile_diffusion_stride?: number;
  /**
   * If specified, a patch-based sampling strategy will be used for VAE decoding.
   */
  tile_vae?: boolean;
  /**
   * Size of VAE patch. Default value: `226`
   */
  tile_vae_decoder_size?: number;
  /**
   * Size of latent image Default value: `1024`
   */
  tile_vae_encoder_size?: number;
  /**
   * The number of steps to run the model for. The higher the number the better the quality and longer it will take to generate. Default value: `50`
   */
  steps?: number;
  /**
   * The ending point of uniform sampling strategy. Default value: `0.6667`
   */
  t_max?: number;
  /**
   * The starting point of uniform sampling strategy. Default value: `0.3333`
   */
  t_min?: number;
  /**
   * Type of color correction for samples. Default value: `"adain"`
   */
  color_fix_type?: "none" | "wavelet" | "adain";
  /**
   * Seed for reproducibility. Different seeds will make slightly different results.
   */
  seed?: number;
};
export type CcsrOutput = {
  /**
   * The generated image file info.
   */
  image: Image;
  /**
   * The seed used for the generation.
   */
  seed: number;
};
export type FastTurboDiffusionInput = {
  /**
   * The name of the model to use. Default value: `"stabilityai/sdxl-turbo"`
   */
  model_name?: "stabilityai/sdxl-turbo" | "stabilityai/sd-turbo";
  /**
   * The URL of the image to use as a starting point for the generation.
   */
  image_url: string | Blob | File;
  /**
   * The URL of the mask to use for inpainting.
   */
  mask_url: string | Blob | File;
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The negative prompt to use.Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The size of the generated image. Default value: `square`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `2`
   */
  num_inference_steps?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `1`
   */
  guidance_scale?: number;
  /**
   * determines how much the generated image resembles the initial image Default value: `0.95`
   */
  strength?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN. Default value: `true`
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * If set to true, the safety checker will be enabled.
   */
  enable_safety_checker?: boolean;
  /**
   * If set to true, the prompt will be expanded with additional prompts.
   */
  expand_prompt?: boolean;
};
export type FastTurboDiffusionOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
};
export type FastTurboDiffusionImageToImageInput = {
  /**
   * The name of the model to use. Default value: `"stabilityai/sdxl-turbo"`
   */
  model_name?: "stabilityai/sdxl-turbo" | "stabilityai/sd-turbo";
  /**
   * The URL of the image to use as a starting point for the generation.
   */
  image_url: string | Blob | File;
  /**
   * The URL of the mask to use for inpainting.
   */
  mask_url: string | Blob | File;
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The negative prompt to use.Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The size of the generated image. Default value: `square`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `2`
   */
  num_inference_steps?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `1`
   */
  guidance_scale?: number;
  /**
   * determines how much the generated image resembles the initial image Default value: `0.95`
   */
  strength?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN. Default value: `true`
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * If set to true, the safety checker will be enabled.
   */
  enable_safety_checker?: boolean;
  /**
   * If set to true, the prompt will be expanded with additional prompts.
   */
  expand_prompt?: boolean;
};
export type FastTurboDiffusionImageToImageOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
};
export type FastTurboDiffusionInpaintingInput = {
  /**
   * The name of the model to use. Default value: `"stabilityai/sdxl-turbo"`
   */
  model_name?: "stabilityai/sdxl-turbo" | "stabilityai/sd-turbo";
  /**
   * The URL of the image to use as a starting point for the generation.
   */
  image_url: string | Blob | File;
  /**
   * The URL of the mask to use for inpainting.
   */
  mask_url: string | Blob | File;
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The negative prompt to use.Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The size of the generated image. Default value: `square`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `2`
   */
  num_inference_steps?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `1`
   */
  guidance_scale?: number;
  /**
   * determines how much the generated image resembles the initial image Default value: `0.95`
   */
  strength?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN. Default value: `true`
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * If set to true, the safety checker will be enabled.
   */
  enable_safety_checker?: boolean;
  /**
   * If set to true, the prompt will be expanded with additional prompts.
   */
  expand_prompt?: boolean;
};
export type FastTurboDiffusionInpaintingOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
};
export type FastLcmDiffusionInput = {
  /**
   * The name of the model to use. Default value: `"stabilityai/stable-diffusion-xl-base-1.0"`
   */
  model_name?:
    | "stabilityai/stable-diffusion-xl-base-1.0"
    | "runwayml/stable-diffusion-v1-5";
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The negative prompt to use. Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The size of the generated image. Default value: `square_hd`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `6`
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `1.5`
   */
  guidance_scale?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN. Default value: `true`
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * The version of the safety checker to use. v1 is the default CompVis safety checker. v2 uses a custom ViT model. Default value: `"v1"`
   */
  safety_checker_version?: "v1" | "v2";
  /**
   * If set to true, the prompt will be expanded with additional prompts.
   */
  expand_prompt?: boolean;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  format?: "jpeg" | "png";
  /**
   * The rescale factor for the CFG.
   */
  guidance_rescale?: number;
  /**
   * An id bound to a request, can be used with response to identify the request
   * itself. Default value: `""`
   */
  request_id?: string;
};
export type FastLcmDiffusionOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type FastLcmDiffusionImageToImageInput = {
  /**
   * The name of the model to use. Default value: `"stabilityai/stable-diffusion-xl-base-1.0"`
   */
  model_name?:
    | "stabilityai/stable-diffusion-xl-base-1.0"
    | "runwayml/stable-diffusion-v1-5";
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The negative prompt to use. Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The size of the generated image. Default value: `square_hd`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `6`
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `1.5`
   */
  guidance_scale?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN. Default value: `true`
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * The version of the safety checker to use. v1 is the default CompVis safety checker. v2 uses a custom ViT model. Default value: `"v1"`
   */
  safety_checker_version?: "v1" | "v2";
  /**
   * If set to true, the prompt will be expanded with additional prompts.
   */
  expand_prompt?: boolean;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  format?: "jpeg" | "png";
  /**
   * The rescale factor for the CFG.
   */
  guidance_rescale?: number;
  /**
   * An id bound to a request, can be used with response to identify the request
   * itself. Default value: `""`
   */
  request_id?: string;
};
export type FastLcmDiffusionImageToImageOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type FastLcmDiffusionInpaintingInput = {
  /**
   * The name of the model to use. Default value: `"stabilityai/stable-diffusion-xl-base-1.0"`
   */
  model_name?:
    | "stabilityai/stable-diffusion-xl-base-1.0"
    | "runwayml/stable-diffusion-v1-5";
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The negative prompt to use. Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The size of the generated image. Default value: `square_hd`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `6`
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `1.5`
   */
  guidance_scale?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN. Default value: `true`
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * The version of the safety checker to use. v1 is the default CompVis safety checker. v2 uses a custom ViT model. Default value: `"v1"`
   */
  safety_checker_version?: "v1" | "v2";
  /**
   * If set to true, the prompt will be expanded with additional prompts.
   */
  expand_prompt?: boolean;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  format?: "jpeg" | "png";
  /**
   * The rescale factor for the CFG.
   */
  guidance_rescale?: number;
  /**
   * An id bound to a request, can be used with response to identify the request
   * itself. Default value: `""`
   */
  request_id?: string;
};
export type FastLcmDiffusionInpaintingOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type WhisperInput = {
  /**
   * URL of the audio file to transcribe. Supported formats: mp3, mp4, mpeg, mpga, m4a, wav or webm.
   */
  audio_url: string | Blob | File;
  /**
   * Task to perform on the audio file. Either transcribe or translate. Default value: `"transcribe"`
   */
  task?: "transcribe" | "translate";
  /**
   * Language of the audio file. If set to null, the language will be
   * automatically detected. Defaults to null.
   *
   * If translate is selected as the task, the audio will be translated to
   * English, regardless of the language selected.
   */
  language?:
    | "af"
    | "am"
    | "ar"
    | "as"
    | "az"
    | "ba"
    | "be"
    | "bg"
    | "bn"
    | "bo"
    | "br"
    | "bs"
    | "ca"
    | "cs"
    | "cy"
    | "da"
    | "de"
    | "el"
    | "en"
    | "es"
    | "et"
    | "eu"
    | "fa"
    | "fi"
    | "fo"
    | "fr"
    | "gl"
    | "gu"
    | "ha"
    | "haw"
    | "he"
    | "hi"
    | "hr"
    | "ht"
    | "hu"
    | "hy"
    | "id"
    | "is"
    | "it"
    | "ja"
    | "jw"
    | "ka"
    | "kk"
    | "km"
    | "kn"
    | "ko"
    | "la"
    | "lb"
    | "ln"
    | "lo"
    | "lt"
    | "lv"
    | "mg"
    | "mi"
    | "mk"
    | "ml"
    | "mn"
    | "mr"
    | "ms"
    | "mt"
    | "my"
    | "ne"
    | "nl"
    | "nn"
    | "no"
    | "oc"
    | "pa"
    | "pl"
    | "ps"
    | "pt"
    | "ro"
    | "ru"
    | "sa"
    | "sd"
    | "si"
    | "sk"
    | "sl"
    | "sn"
    | "so"
    | "sq"
    | "sr"
    | "su"
    | "sv"
    | "sw"
    | "ta"
    | "te"
    | "tg"
    | "th"
    | "tk"
    | "tl"
    | "tr"
    | "tt"
    | "uk"
    | "ur"
    | "uz"
    | "vi"
    | "yi"
    | "yo"
    | "yue"
    | "zh";
  /**
   * Whether to diarize the audio file. Defaults to false.
   */
  diarize?: boolean;
  /**
   * Level of the chunks to return. Either segment or word. Default value: `"segment"`
   */
  chunk_level?: "segment" | "word";
  /**
   * Version of the model to use. All of the models are the Whisper large variant. Default value: `"3"`
   */
  version?: "3";
  /**
   *  Default value: `64`
   */
  batch_size?: number;
  /**
   * Prompt to use for generation. Defaults to an empty string. Default value: `""`
   */
  prompt?: string;
  /**
   * Number of speakers in the audio file. Defaults to null.
   * If not provided, the number of speakers will be automatically
   * detected.
   */
  num_speakers?: number;
};
export type WhisperOutput = {
  /**
   * Transcription of the audio file
   */
  text: string;
  /**
   * Timestamp chunks of the audio file
   */
  chunks?: Array<WhisperChunk>;
  /**
   * List of languages that the audio file is inferred to be. Defaults to null.
   */
  inferred_languages: Array<
    | "af"
    | "am"
    | "ar"
    | "as"
    | "az"
    | "ba"
    | "be"
    | "bg"
    | "bn"
    | "bo"
    | "br"
    | "bs"
    | "ca"
    | "cs"
    | "cy"
    | "da"
    | "de"
    | "el"
    | "en"
    | "es"
    | "et"
    | "eu"
    | "fa"
    | "fi"
    | "fo"
    | "fr"
    | "gl"
    | "gu"
    | "ha"
    | "haw"
    | "he"
    | "hi"
    | "hr"
    | "ht"
    | "hu"
    | "hy"
    | "id"
    | "is"
    | "it"
    | "ja"
    | "jw"
    | "ka"
    | "kk"
    | "km"
    | "kn"
    | "ko"
    | "la"
    | "lb"
    | "ln"
    | "lo"
    | "lt"
    | "lv"
    | "mg"
    | "mi"
    | "mk"
    | "ml"
    | "mn"
    | "mr"
    | "ms"
    | "mt"
    | "my"
    | "ne"
    | "nl"
    | "nn"
    | "no"
    | "oc"
    | "pa"
    | "pl"
    | "ps"
    | "pt"
    | "ro"
    | "ru"
    | "sa"
    | "sd"
    | "si"
    | "sk"
    | "sl"
    | "sn"
    | "so"
    | "sq"
    | "sr"
    | "su"
    | "sv"
    | "sw"
    | "ta"
    | "te"
    | "tg"
    | "th"
    | "tk"
    | "tl"
    | "tr"
    | "tt"
    | "uk"
    | "ur"
    | "uz"
    | "vi"
    | "yi"
    | "yo"
    | "yue"
    | "zh"
  >;
  /**
   * Speaker diarization segments of the audio file. Only present if diarization is enabled.
   */
  diarization_segments: Array<DiarizationSegment>;
};
export type WizperInput = {
  /**
   * URL of the audio file to transcribe. Supported formats: mp3, mp4, mpeg, mpga, m4a, wav or webm.
   */
  audio_url: string | Blob | File;
  /**
   * Task to perform on the audio file. Either transcribe or translate. Default value: `"transcribe"`
   */
  task?: "transcribe" | "translate";
  /**
   * Language of the audio file.
   * If translate is selected as the task, the audio will be translated to
   * English, regardless of the language selected. Default value: `"en"`
   */
  language?:
    | "af"
    | "am"
    | "ar"
    | "as"
    | "az"
    | "ba"
    | "be"
    | "bg"
    | "bn"
    | "bo"
    | "br"
    | "bs"
    | "ca"
    | "cs"
    | "cy"
    | "da"
    | "de"
    | "el"
    | "en"
    | "es"
    | "et"
    | "eu"
    | "fa"
    | "fi"
    | "fo"
    | "fr"
    | "gl"
    | "gu"
    | "ha"
    | "haw"
    | "he"
    | "hi"
    | "hr"
    | "ht"
    | "hu"
    | "hy"
    | "id"
    | "is"
    | "it"
    | "ja"
    | "jw"
    | "ka"
    | "kk"
    | "km"
    | "kn"
    | "ko"
    | "la"
    | "lb"
    | "ln"
    | "lo"
    | "lt"
    | "lv"
    | "mg"
    | "mi"
    | "mk"
    | "ml"
    | "mn"
    | "mr"
    | "ms"
    | "mt"
    | "my"
    | "ne"
    | "nl"
    | "nn"
    | "no"
    | "oc"
    | "pa"
    | "pl"
    | "ps"
    | "pt"
    | "ro"
    | "ru"
    | "sa"
    | "sd"
    | "si"
    | "sk"
    | "sl"
    | "sn"
    | "so"
    | "sq"
    | "sr"
    | "su"
    | "sv"
    | "sw"
    | "ta"
    | "te"
    | "tg"
    | "th"
    | "tk"
    | "tl"
    | "tr"
    | "tt"
    | "uk"
    | "ur"
    | "uz"
    | "vi"
    | "yi"
    | "yo"
    | "yue"
    | "zh";
  /**
   * Level of the chunks to return. Default value: `"segment"`
   */
  chunk_level?: "segment";
  /**
   * Version of the model to use. All of the models are the Whisper large variant. Default value: `"3"`
   */
  version?: "3";
};
export type WizperOutput = {
  /**
   * Transcription of the audio file
   */
  text: string;
  /**
   * Timestamp chunks of the audio file
   */
  chunks: Array<WhisperChunk>;
};
export type FastLightningSdxlOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type FastLightningSdxlInput = {
  /**
   * The URL of the image to use as a starting point for the generation.
   */
  image_url: string | Blob | File;
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The size of the generated image. Default value: `square_hd`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `"4"`
   */
  num_inference_steps?: "1" | "2" | "4" | "8";
  /**
   * determines how much the generated image resembles the initial image Default value: `0.95`
   */
  strength?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * The list of embeddings to use. Default value: ``
   */
  embeddings?: Array<Embedding>;
  /**
   * If set to true, the safety checker will be enabled.
   */
  enable_safety_checker?: boolean;
  /**
   * If set to true, the prompt will be expanded with additional prompts.
   */
  expand_prompt?: boolean;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  format?: "jpeg" | "png";
};
export type FastLightningSdxlImageToImageOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type FastLightningSdxlImageToImageInput = {
  /**
   * The URL of the image to use as a starting point for the generation.
   */
  image_url: string | Blob | File;
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The size of the generated image. Default value: `square_hd`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `"4"`
   */
  num_inference_steps?: "1" | "2" | "4" | "8";
  /**
   * determines how much the generated image resembles the initial image Default value: `0.95`
   */
  strength?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * The list of embeddings to use. Default value: ``
   */
  embeddings?: Array<Embedding>;
  /**
   * If set to true, the safety checker will be enabled.
   */
  enable_safety_checker?: boolean;
  /**
   * If set to true, the prompt will be expanded with additional prompts.
   */
  expand_prompt?: boolean;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  format?: "jpeg" | "png";
};
export type FastLightningSdxlInpaintingOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type FastLightningSdxlInpaintingInput = {
  /**
   * The URL of the image to use as a starting point for the generation.
   */
  image_url: string | Blob | File;
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The size of the generated image. Default value: `square_hd`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `"4"`
   */
  num_inference_steps?: "1" | "2" | "4" | "8";
  /**
   * determines how much the generated image resembles the initial image Default value: `0.95`
   */
  strength?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * The list of embeddings to use. Default value: ``
   */
  embeddings?: Array<Embedding>;
  /**
   * If set to true, the safety checker will be enabled.
   */
  enable_safety_checker?: boolean;
  /**
   * If set to true, the prompt will be expanded with additional prompts.
   */
  expand_prompt?: boolean;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  format?: "jpeg" | "png";
};
export type HyperSdxlOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type HyperSdxlInput = {
  /**
   * The URL of the image to use as a starting point for the generation.
   */
  image_url: string | Blob | File;
  /**
   * The URL of the mask to use for inpainting.
   */
  mask_url: string | Blob | File;
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The size of the generated image. Default value: `square_hd`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `"1"`
   */
  num_inference_steps?: "1" | "2" | "4";
  /**
   * determines how much the generated image resembles the initial image Default value: `0.95`
   */
  strength?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * The list of embeddings to use. Default value: ``
   */
  embeddings?: Array<Embedding>;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * If set to true, the prompt will be expanded with additional prompts.
   */
  expand_prompt?: boolean;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  format?: "jpeg" | "png";
};
export type HyperSdxlImageToImageOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type HyperSdxlImageToImageInput = {
  /**
   * The URL of the image to use as a starting point for the generation.
   */
  image_url: string | Blob | File;
  /**
   * The URL of the mask to use for inpainting.
   */
  mask_url: string | Blob | File;
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The size of the generated image. Default value: `square_hd`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `"1"`
   */
  num_inference_steps?: "1" | "2" | "4";
  /**
   * determines how much the generated image resembles the initial image Default value: `0.95`
   */
  strength?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * The list of embeddings to use. Default value: ``
   */
  embeddings?: Array<Embedding>;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * If set to true, the prompt will be expanded with additional prompts.
   */
  expand_prompt?: boolean;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  format?: "jpeg" | "png";
};
export type HyperSdxlInpaintingOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type HyperSdxlInpaintingInput = {
  /**
   * The URL of the image to use as a starting point for the generation.
   */
  image_url: string | Blob | File;
  /**
   * The URL of the mask to use for inpainting.
   */
  mask_url: string | Blob | File;
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The size of the generated image. Default value: `square_hd`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `"1"`
   */
  num_inference_steps?: "1" | "2" | "4";
  /**
   * determines how much the generated image resembles the initial image Default value: `0.95`
   */
  strength?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * The list of embeddings to use. Default value: ``
   */
  embeddings?: Array<Embedding>;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * If set to true, the prompt will be expanded with additional prompts.
   */
  expand_prompt?: boolean;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  format?: "jpeg" | "png";
};
export type PlaygroundV25Output = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type PlaygroundV25Input = {
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The negative prompt to use. Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The size of the generated image. Default value: `square_hd`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `25`
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `3`
   */
  guidance_scale?: number;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * The list of embeddings to use. Default value: ``
   */
  embeddings?: Array<Embedding>;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * The version of the safety checker to use. v1 is the default CompVis safety checker. v2 uses a custom ViT model. Default value: `"v1"`
   */
  safety_checker_version?: "v1" | "v2";
  /**
   * If set to true, the prompt will be expanded with additional prompts.
   */
  expand_prompt?: boolean;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  format?: "jpeg" | "png";
  /**
   * The rescale factor for the CFG.
   */
  guidance_rescale?: number;
};
export type PlaygroundV25ImageToImageOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type PlaygroundV25ImageToImageInput = {
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The negative prompt to use. Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The size of the generated image. Default value: `square_hd`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `25`
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `3`
   */
  guidance_scale?: number;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * The list of embeddings to use. Default value: ``
   */
  embeddings?: Array<Embedding>;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * The version of the safety checker to use. v1 is the default CompVis safety checker. v2 uses a custom ViT model. Default value: `"v1"`
   */
  safety_checker_version?: "v1" | "v2";
  /**
   * If set to true, the prompt will be expanded with additional prompts.
   */
  expand_prompt?: boolean;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  format?: "jpeg" | "png";
  /**
   * The rescale factor for the CFG.
   */
  guidance_rescale?: number;
};
export type PlaygroundV25InpaintingOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type PlaygroundV25InpaintingInput = {
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The negative prompt to use. Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The size of the generated image. Default value: `square_hd`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `25`
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `3`
   */
  guidance_scale?: number;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * The list of embeddings to use. Default value: ``
   */
  embeddings?: Array<Embedding>;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * The version of the safety checker to use. v1 is the default CompVis safety checker. v2 uses a custom ViT model. Default value: `"v1"`
   */
  safety_checker_version?: "v1" | "v2";
  /**
   * If set to true, the prompt will be expanded with additional prompts.
   */
  expand_prompt?: boolean;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  format?: "jpeg" | "png";
  /**
   * The rescale factor for the CFG.
   */
  guidance_rescale?: number;
};
export type AmtInterpolationOutput = {
  /**
   * Generated video
   */
  video: File;
};
export type AmtInterpolationInput = {
  /**
   * Frames to interpolate
   */
  frames: Array<Frame>;
  /**
   * Output frames per second Default value: `24`
   */
  output_fps?: number;
  /**
   * Number of recursive interpolation passes Default value: `4`
   */
  recursive_interpolation_passes?: number;
};
export type AmtInterpolationFrameInterpolationOutput = {
  /**
   * Generated video
   */
  video: File;
};
export type AmtInterpolationFrameInterpolationInput = {
  /**
   * Frames to interpolate
   */
  frames: Array<Frame>;
  /**
   * Output frames per second Default value: `24`
   */
  output_fps?: number;
  /**
   * Number of recursive interpolation passes Default value: `4`
   */
  recursive_interpolation_passes?: number;
};
export type T2vTurboInput = {
  /**
   * The prompt to generate images from
   */
  prompt: string;
  /**
   * The seed to use for the random number generator
   */
  seed?: number | null;
  /**
   * The number of steps to sample Default value: `4`
   */
  num_inference_steps?: number;
  /**
   * The guidance scale Default value: `7.5`
   */
  guidance_scale?: number;
  /**
   * The number of frames to generate Default value: `16`
   */
  num_frames?: number;
  /**
   * The FPS of the exported video Default value: `8`
   */
  export_fps?: number;
};
export type T2vTurboOutput = {
  /**
   * The URL to the generated video
   */
  video: File;
};
export type Sd15DepthControlnetOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type Sd15DepthControlnetInput = {
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The URL of the control image.
   */
  control_image_url: string | Blob | File;
  /**
   * The scale of the controlnet conditioning. Default value: `0.5`
   */
  controlnet_conditioning_scale?: number;
  /**
   * The URL of the image to use as a starting point for the generation.
   */
  image_url: string | Blob | File;
  /**
   * The URL of the mask to use for inpainting.
   */
  mask_url: string | Blob | File;
  /**
   * The negative prompt to use.Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The size of the generated image. Leave it none to automatically infer from the control image.
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `35`
   */
  num_inference_steps?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `7.5`
   */
  guidance_scale?: number;
  /**
   * determines how much the generated image resembles the initial image Default value: `0.95`
   */
  strength?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * The list of LoRA weights to use. Default value: ``
   */
  loras?: Array<LoraWeight>;
  /**
   * If set to true, the safety checker will be enabled.
   */
  enable_safety_checker?: boolean;
  /**
   * If set to true, the prompt will be expanded with additional prompts.
   */
  expand_prompt?: boolean;
};
export type PhotomakerOutput = {
  /**
   *
   */
  images: Array<Image>;
  /**
   *
   */
  seed: number;
};
export type PhotomakerInput = {
  /**
   * The URL of the image archive containing the images you want to use.
   */
  image_archive_url: string | Blob | File;
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The base pipeline to use for generating the image. Default value: `"photomaker"`
   */
  base_pipeline?: "photomaker" | "photomaker-style";
  /**
   * Optional initial image for img2img
   */
  initial_image_url?: string | Blob | File;
  /**
   * How much noise to add to the latent image. O for no noise, 1 for maximum noise. Default value: `0.5`
   */
  initial_image_strength?: number;
  /**
   *  Default value: `"Photographic"`
   */
  style?:
    | "(No style)"
    | "Cinematic"
    | "Disney Character"
    | "Digital Art"
    | "Photographic"
    | "Fantasy art"
    | "Neonpunk"
    | "Enhance"
    | "Comic book"
    | "Lowpoly"
    | "Line art";
  /**
   * The negative prompt to use.Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * Increasing the amount of steps tells Stable Diffusion that it should take more steps
   * to generate your final result which can increase the amount of detail in your image. Default value: `50`
   */
  num_inference_steps?: number;
  /**
   *  Default value: `20`
   */
  style_strength?: number;
  /**
   * Number of images to generate in one request. Note that the higher the batch size,
   * the longer it will take to generate the images. Default value: `1`
   */
  num_images?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `5`
   */
  guidance_scale?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
};
export type LcmInput = {
  /**
   * The model to use for generating the image. Default value: `"sdv1-5"`
   */
  model?: "sdxl" | "sdv1-5";
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The base image to use for guiding the image generation on image-to-image
   * generations. If the either width or height of the image is larger than 1024
   * pixels, the image will be resized to 1024 pixels while keeping the aspect ratio.
   */
  image_url?: string | Blob | File;
  /**
   * The mask to use for guiding the image generation on image
   * inpainting. The model will focus on the mask area and try to fill it with
   * the most relevant content.
   *
   * The mask must be a black and white image where the white area is the area
   * that needs to be filled and the black area is the area that should be
   * ignored.
   *
   * The mask must have the same dimensions as the image passed as `image_url`.
   */
  mask_url?: string | Blob | File;
  /**
   * The strength of the image that is passed as `image_url`. The strength
   * determines how much the generated image will be similar to the image passed as
   * `image_url`. The higher the strength the more model gets "creative" and
   * generates an image that's different from the initial image. A strength of 1.0
   * means that the initial image is more or less ignored and the model will try to
   * generate an image that's as close as possible to the prompt. Default value: `0.8`
   */
  strength?: number;
  /**
   * The negative prompt to use.Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `1`
   */
  guidance_scale?: number;
  /**
   * The number of inference steps to use for generating the image. The more steps
   * the better the image will be but it will also take longer to generate. Default value: `4`
   */
  num_inference_steps?: number;
  /**
   * The size of the generated image. You can choose between some presets or
   * custom height and width that **must be multiples of 8**.
   *
   * If not provided:
   * - For text-to-image generations, the default size is 512x512.
   * - For image-to-image generations, the default size is the same as the input image.
   * - For inpainting generations, the default size is the same as the input image.
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. The function will return a list of images
   * with the same prompt and negative prompt but different seeds. Default value: `1`
   */
  num_images?: number;
  /**
   * If set to true, the resulting image will be checked whether it includes any
   * potentially unsafe content. If it does, it will be replaced with a black
   * image. Default value: `true`
   */
  enable_safety_checks?: boolean;
  /**
   * An id bound to a request, can be used with response to identify the request
   * itself. Default value: `""`
   */
  request_id?: string;
  /**
   * If set to true, the inpainting pipeline will only inpaint the provided mask
   * area. Only effective for inpainting pipelines.
   */
  inpaint_mask_only?: boolean;
  /**
   * If set to true, the inpainting pipeline will use controlnet inpainting.
   * Only effective for inpainting pipelines.
   */
  controlnet_inpaint?: boolean;
  /**
   * The url of the lora server to use for image generation.
   */
  lora_url?: string | Blob | File;
  /**
   * The scale of the lora server to use for image generation. Default value: `1`
   */
  lora_scale?: number;
};
export type LcmOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Number of inference steps used to generate the image. It will be the same value of the one passed in the
   * input or the default one in case none was passed. Default value: `4`
   */
  num_inference_steps?: number;
  /**
   * An id bound to a request, can be used with response to identify the request
   * itself. Default value: `""`
   */
  request_id?: string;
  /**
   * A list of booleans indicating whether the generated image contains any
   * potentially unsafe content. If the safety check is disabled, this field
   * will all will be false.
   */
  nsfw_content_detected: Array<boolean>;
};
export type LcmSd15I2iInput = {
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The image to use as a base.
   */
  image_url: string | Blob | File;
  /**
   * The strength of the image. Default value: `0.8`
   */
  strength?: number;
  /**
   * The negative prompt to use.Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `1`
   */
  guidance_scale?: number;
  /**
   * The number of inference steps to use for generating the image. The more steps
   * the better the image will be but it will also take longer to generate. Default value: `4`
   */
  num_inference_steps?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. The function will return a list of images
   * with the same prompt and negative prompt but different seeds. Default value: `1`
   */
  num_images?: number;
  /**
   * If set to true, the resulting image will be checked whether it includes any
   * potentially unsafe content. If it does, it will be replaced with a black
   * image. Default value: `true`
   */
  enable_safety_checks?: boolean;
  /**
   * An id bound to a request, can be used with response to identify the request
   * itself. Default value: `""`
   */
  request_id?: string;
};
export type LcmSd15I2iOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Number of inference steps used to generate the image. It will be the same value of the one passed in the
   * input or the default one in case none was passed. Default value: `4`
   */
  num_inference_steps?: number;
  /**
   * An id bound to a request, can be used with response to identify the request
   * itself. Default value: `""`
   */
  request_id?: string;
  /**
   * A list of booleans indicating whether the generated image contains any
   * potentially unsafe content. If the safety check is disabled, this field
   * will have a false for each generated image.
   */
  nsfw_content_detected: Array<boolean>;
};
export type FooocusInput = {
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results. Default value: `""`
   */
  prompt?: string;
  /**
   * The negative prompt to use. Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The style to use. Default value: `Fooocus Enhance,Fooocus V2,Fooocus Sharp`
   */
  styles?: Array<
    | "Fooocus V2"
    | "Fooocus Enhance"
    | "Fooocus Sharp"
    | "Fooocus Semi Realistic"
    | "Fooocus Masterpiece"
    | "Fooocus Photograph"
    | "Fooocus Negative"
    | "Fooocus Cinematic"
    | "SAI 3D Model"
    | "SAI Analog Film"
    | "SAI Anime"
    | "SAI Cinematic"
    | "SAI Comic Book"
    | "SAI Craft Clay"
    | "SAI Digital Art"
    | "SAI Enhance"
    | "SAI Fantasy Art"
    | "SAI Isometric"
    | "SAI Line Art"
    | "SAI Lowpoly"
    | "SAI Neonpunk"
    | "SAI Origami"
    | "SAI Photographic"
    | "SAI Pixel Art"
    | "SAI Texture"
    | "MRE Cinematic Dynamic"
    | "MRE Spontaneous Picture"
    | "MRE Artistic Vision"
    | "MRE Dark Dream"
    | "MRE Gloomy Art"
    | "MRE Bad Dream"
    | "MRE Underground"
    | "MRE Surreal Painting"
    | "MRE Dynamic Illustration"
    | "MRE Undead Art"
    | "MRE Elemental Art"
    | "MRE Space Art"
    | "MRE Ancient Illustration"
    | "MRE Brave Art"
    | "MRE Heroic Fantasy"
    | "MRE Dark Cyberpunk"
    | "MRE Lyrical Geometry"
    | "MRE Sumi E Symbolic"
    | "MRE Sumi E Detailed"
    | "MRE Manga"
    | "MRE Anime"
    | "MRE Comic"
    | "Ads Advertising"
    | "Ads Automotive"
    | "Ads Corporate"
    | "Ads Fashion Editorial"
    | "Ads Food Photography"
    | "Ads Gourmet Food Photography"
    | "Ads Luxury"
    | "Ads Real Estate"
    | "Ads Retail"
    | "Artstyle Abstract"
    | "Artstyle Abstract Expressionism"
    | "Artstyle Art Deco"
    | "Artstyle Art Nouveau"
    | "Artstyle Constructivist"
    | "Artstyle Cubist"
    | "Artstyle Expressionist"
    | "Artstyle Graffiti"
    | "Artstyle Hyperrealism"
    | "Artstyle Impressionist"
    | "Artstyle Pointillism"
    | "Artstyle Pop Art"
    | "Artstyle Psychedelic"
    | "Artstyle Renaissance"
    | "Artstyle Steampunk"
    | "Artstyle Surrealist"
    | "Artstyle Typography"
    | "Artstyle Watercolor"
    | "Futuristic Biomechanical"
    | "Futuristic Biomechanical Cyberpunk"
    | "Futuristic Cybernetic"
    | "Futuristic Cybernetic Robot"
    | "Futuristic Cyberpunk Cityscape"
    | "Futuristic Futuristic"
    | "Futuristic Retro Cyberpunk"
    | "Futuristic Retro Futurism"
    | "Futuristic Sci Fi"
    | "Futuristic Vaporwave"
    | "Game Bubble Bobble"
    | "Game Cyberpunk Game"
    | "Game Fighting Game"
    | "Game Gta"
    | "Game Mario"
    | "Game Minecraft"
    | "Game Pokemon"
    | "Game Retro Arcade"
    | "Game Retro Game"
    | "Game Rpg Fantasy Game"
    | "Game Strategy Game"
    | "Game Streetfighter"
    | "Game Zelda"
    | "Misc Architectural"
    | "Misc Disco"
    | "Misc Dreamscape"
    | "Misc Dystopian"
    | "Misc Fairy Tale"
    | "Misc Gothic"
    | "Misc Grunge"
    | "Misc Horror"
    | "Misc Kawaii"
    | "Misc Lovecraftian"
    | "Misc Macabre"
    | "Misc Manga"
    | "Misc Metropolis"
    | "Misc Minimalist"
    | "Misc Monochrome"
    | "Misc Nautical"
    | "Misc Space"
    | "Misc Stained Glass"
    | "Misc Techwear Fashion"
    | "Misc Tribal"
    | "Misc Zentangle"
    | "Papercraft Collage"
    | "Papercraft Flat Papercut"
    | "Papercraft Kirigami"
    | "Papercraft Paper Mache"
    | "Papercraft Paper Quilling"
    | "Papercraft Papercut Collage"
    | "Papercraft Papercut Shadow Box"
    | "Papercraft Stacked Papercut"
    | "Papercraft Thick Layered Papercut"
    | "Photo Alien"
    | "Photo Film Noir"
    | "Photo Glamour"
    | "Photo Hdr"
    | "Photo Iphone Photographic"
    | "Photo Long Exposure"
    | "Photo Neon Noir"
    | "Photo Silhouette"
    | "Photo Tilt Shift"
    | "Cinematic Diva"
    | "Abstract Expressionism"
    | "Academia"
    | "Action Figure"
    | "Adorable 3D Character"
    | "Adorable Kawaii"
    | "Art Deco"
    | "Art Nouveau"
    | "Astral Aura"
    | "Avant Garde"
    | "Baroque"
    | "Bauhaus Style Poster"
    | "Blueprint Schematic Drawing"
    | "Caricature"
    | "Cel Shaded Art"
    | "Character Design Sheet"
    | "Classicism Art"
    | "Color Field Painting"
    | "Colored Pencil Art"
    | "Conceptual Art"
    | "Constructivism"
    | "Cubism"
    | "Dadaism"
    | "Dark Fantasy"
    | "Dark Moody Atmosphere"
    | "Dmt Art Style"
    | "Doodle Art"
    | "Double Exposure"
    | "Dripping Paint Splatter Art"
    | "Expressionism"
    | "Faded Polaroid Photo"
    | "Fauvism"
    | "Flat 2d Art"
    | "Fortnite Art Style"
    | "Futurism"
    | "Glitchcore"
    | "Glo Fi"
    | "Googie Art Style"
    | "Graffiti Art"
    | "Harlem Renaissance Art"
    | "High Fashion"
    | "Idyllic"
    | "Impressionism"
    | "Infographic Drawing"
    | "Ink Dripping Drawing"
    | "Japanese Ink Drawing"
    | "Knolling Photography"
    | "Light Cheery Atmosphere"
    | "Logo Design"
    | "Luxurious Elegance"
    | "Macro Photography"
    | "Mandola Art"
    | "Marker Drawing"
    | "Medievalism"
    | "Minimalism"
    | "Neo Baroque"
    | "Neo Byzantine"
    | "Neo Futurism"
    | "Neo Impressionism"
    | "Neo Rococo"
    | "Neoclassicism"
    | "Op Art"
    | "Ornate And Intricate"
    | "Pencil Sketch Drawing"
    | "Pop Art 2"
    | "Rococo"
    | "Silhouette Art"
    | "Simple Vector Art"
    | "Sketchup"
    | "Steampunk 2"
    | "Surrealism"
    | "Suprematism"
    | "Terragen"
    | "Tranquil Relaxing Atmosphere"
    | "Sticker Designs"
    | "Vibrant Rim Light"
    | "Volumetric Lighting"
    | "Watercolor 2"
    | "Whimsical And Playful"
    | "Mk Chromolithography"
    | "Mk Cross Processing Print"
    | "Mk Dufaycolor Photograph"
    | "Mk Herbarium"
    | "Mk Punk Collage"
    | "Mk Mosaic"
    | "Mk Van Gogh"
    | "Mk Coloring Book"
    | "Mk Singer Sargent"
    | "Mk Pollock"
    | "Mk Basquiat"
    | "Mk Andy Warhol"
    | "Mk Halftone Print"
    | "Mk Gond Painting"
    | "Mk Albumen Print"
    | "Mk Aquatint Print"
    | "Mk Anthotype Print"
    | "Mk Inuit Carving"
    | "Mk Bromoil Print"
    | "Mk Calotype Print"
    | "Mk Color Sketchnote"
    | "Mk Cibulak Porcelain"
    | "Mk Alcohol Ink Art"
    | "Mk One Line Art"
    | "Mk Blacklight Paint"
    | "Mk Carnival Glass"
    | "Mk Cyanotype Print"
    | "Mk Cross Stitching"
    | "Mk Encaustic Paint"
    | "Mk Embroidery"
    | "Mk Gyotaku"
    | "Mk Luminogram"
    | "Mk Lite Brite Art"
    | "Mk Mokume Gane"
    | "Pebble Art"
    | "Mk Palekh"
    | "Mk Suminagashi"
    | "Mk Scrimshaw"
    | "Mk Shibori"
    | "Mk Vitreous Enamel"
    | "Mk Ukiyo E"
    | "Mk Vintage Airline Poster"
    | "Mk Vintage Travel Poster"
    | "Mk Bauhaus Style"
    | "Mk Afrofuturism"
    | "Mk Atompunk"
    | "Mk Constructivism"
    | "Mk Chicano Art"
    | "Mk De Stijl"
    | "Mk Dayak Art"
    | "Mk Fayum Portrait"
    | "Mk Illuminated Manuscript"
    | "Mk Kalighat Painting"
    | "Mk Madhubani Painting"
    | "Mk Pictorialism"
    | "Mk Pichwai Painting"
    | "Mk Patachitra Painting"
    | "Mk Samoan Art Inspired"
    | "Mk Tlingit Art"
    | "Mk Adnate Style"
    | "Mk Ron English Style"
    | "Mk Shepard Fairey Style"
  >;
  /**
   * You can choose Speed or Quality Default value: `"Extreme Speed"`
   */
  performance?: "Speed" | "Quality" | "Extreme Speed" | "Lightning";
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `4`
   */
  guidance_scale?: number;
  /**
   * The sharpness of the generated image. Use it to control how sharp the generated
   * image should be. Higher value means image and texture are sharper. Default value: `2`
   */
  sharpness?: number;
  /**
   * The size of the generated image. You can choose between some presets or
   * custom height and width that **must be multiples of 8**. Default value: `"1024x1024"`
   */
  aspect_ratio?: string;
  /**
   * Number of images to generate in one request Default value: `1`
   */
  num_images?: number;
  /**
   * The LoRAs to use for the image generation. You can use up to 5 LoRAs
   * and they will be merged together to generate the final image. Default value: `[object Object]`
   */
  loras?: Array<LoraWeight>;
  /**
   * Refiner (SDXL or SD 1.5) Default value: `"None"`
   */
  refiner_model?: "None" | "realisticVisionV60B1_v51VAE.safetensors";
  /**
   * Use 0.4 for SD1.5 realistic models; 0.667 for SD1.5 anime models
   * 0.8 for XL-refiners; or any value for switching two SDXL models. Default value: `0.8`
   */
  refiner_switch?: number;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  output_format?: "png" | "jpeg" | "webp";
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   *
   */
  image_prompt_1: ImagePrompt;
  /**
   *
   */
  image_prompt_2?: ImagePrompt;
  /**
   *
   */
  image_prompt_3?: ImagePrompt;
  /**
   *
   */
  image_prompt_4?: ImagePrompt;
  /**
   * The image to use as a reference for inpainting.
   */
  inpaint_image_url?: string | Blob | File;
  /**
   * The image to use as a mask for the generated image.
   */
  mask_image_url?: string | Blob | File;
  /**
   * The mode to use for inpainting. Default value: `"Inpaint or Outpaint (default)"`
   */
  inpaint_mode?:
    | "Inpaint or Outpaint (default)"
    | "Improve Detail (face, hand, eyes, etc.)"
    | "Modify Content (add objects, change background, etc.)";
  /**
   * Describe what you want to inpaint. Default value: `""`
   */
  inpaint_additional_prompt?: string;
  /**
   * The directions to outpaint. Default value: ``
   */
  outpaint_selections?: Array<"Left" | "Right" | "Top" | "Bottom">;
  /**
   * Mixing Image Prompt and Inpaint
   */
  mixing_image_prompt_and_inpaint?: boolean;
  /**
   * The image to upscale or vary.
   */
  uov_image_url?: string | Blob | File;
  /**
   * The method to use for upscaling or varying. Default value: `"Disabled"`
   */
  uov_method?:
    | "Disabled"
    | "Vary (Subtle)"
    | "Vary (Strong)"
    | "Upscale (1.5x)"
    | "Upscale (2x)"
    | "Upscale (Fast 2x)";
  /**
   * Mixing Image Prompt and Vary/Upscale
   */
  mixing_image_prompt_and_vary_upscale?: boolean;
  /**
   * If set to false, the safety checker will be disabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
};
export type FooocusOutput = {
  /**
   * The generated image file info.
   */
  images: Array<Image>;
  /**
   * The time taken for the generation process.
   */
  timings: Record<string, any>;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
};
export type AnimatediffV2vInput = {
  /**
   * URL of the video.
   */
  video_url: string | Blob | File;
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The negative prompt to use. Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `"(bad quality, worst quality:1.2), ugly faces, bad anime"`
   */
  negative_prompt?: string;
  /**
   * Increasing the amount of steps tells Stable Diffusion that it should take more steps
   * to generate your final result which can increase the amount of detail in your image. Default value: `25`
   */
  num_inference_steps?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `7`
   */
  guidance_scale?: number;
  /**
   * Base model to use for animation generation. Default value: `"cardosAnimev20"`
   */
  base_model?: "darkSushiMixMix_colorful" | "cardosAnimev20";
  /**
   * The list of LoRA weights to use. Default value: ``
   */
  loras?: Array<LoraWeight>;
  /**
   * Select every Nth frame from the video.
   * This can be used to reduce the number of frames to process, which can reduce the time and the cost.
   * However, it can also reduce the quality of the final video. Default value: `2`
   */
  select_every_nth_frame?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
};
export type AnimatediffV2vOutput = {
  /**
   * Generated video file.
   */
  video: File;
  /**
   * Seed used for generating the video.
   */
  seed: number;
  /**
   *
   */
  timings: Record<string, any>;
};
export type AnimatediffV2vTurboInput = {
  /**
   * URL of the video.
   */
  video_url: string | Blob | File;
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The negative prompt to use. Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `"(bad quality, worst quality:1.2), ugly faces, bad anime"`
   */
  negative_prompt?: string;
  /**
   * Increasing the amount of steps tells Stable Diffusion that it should take more steps
   * to generate your final result which can increase the amount of detail in your image. Default value: `25`
   */
  num_inference_steps?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `7`
   */
  guidance_scale?: number;
  /**
   * Base model to use for animation generation. Default value: `"cardosAnimev20"`
   */
  base_model?: "darkSushiMixMix_colorful" | "cardosAnimev20";
  /**
   * The list of LoRA weights to use. Default value: ``
   */
  loras?: Array<LoraWeight>;
  /**
   * Select every Nth frame from the video.
   * This can be used to reduce the number of frames to process, which can reduce the time and the cost.
   * However, it can also reduce the quality of the final video. Default value: `2`
   */
  select_every_nth_frame?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
};
export type AnimatediffV2vTurboOutput = {
  /**
   * Generated video file.
   */
  video: File;
  /**
   * Seed used for generating the video.
   */
  seed: number;
  /**
   *
   */
  timings: Record<string, any>;
};
export type FastAnimatediffTextToVideoInput = {
  /**
   * URL of the video.
   */
  video_url: string | Blob | File;
  /**
   * The first N number of seconds of video to animate. Default value: `3`
   */
  first_n_seconds?: number;
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The negative prompt to use. Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `"(bad quality, worst quality:1.2), ugly faces, bad anime"`
   */
  negative_prompt?: string;
  /**
   * The number of inference steps to perform. 4-12 is recommended for turbo mode. Default value: `8`
   */
  num_inference_steps?: number;
  /**
   * The strength of the input video in the final output. Default value: `0.7`
   */
  strength?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want the model to stick to your prompt when looking for a related image to show you. Default value: `1`
   */
  guidance_scale?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * Number of frames per second to extract from the video. Default value: `8`
   */
  fps?: number;
  /**
   * The motions to apply to the video.
   */
  motions?: Array<
    "zoom-out" | "zoom-in" | "pan-left" | "pan-right" | "tilt-up" | "tilt-down"
  >;
};
export type FastAnimatediffTextToVideoOutput = {
  /**
   * Generated video file.
   */
  video: File;
  /**
   * Seed used for generating the video.
   */
  seed: number;
};
export type FastAnimatediffVideoToVideoInput = {
  /**
   * URL of the video.
   */
  video_url: string | Blob | File;
  /**
   * The first N number of seconds of video to animate. Default value: `3`
   */
  first_n_seconds?: number;
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The negative prompt to use. Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `"(bad quality, worst quality:1.2), ugly faces, bad anime"`
   */
  negative_prompt?: string;
  /**
   * The number of inference steps to perform. 4-12 is recommended for turbo mode. Default value: `8`
   */
  num_inference_steps?: number;
  /**
   * The strength of the input video in the final output. Default value: `0.7`
   */
  strength?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want the model to stick to your prompt when looking for a related image to show you. Default value: `1`
   */
  guidance_scale?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * Number of frames per second to extract from the video. Default value: `8`
   */
  fps?: number;
  /**
   * The motions to apply to the video.
   */
  motions?: Array<
    "zoom-out" | "zoom-in" | "pan-left" | "pan-right" | "tilt-up" | "tilt-down"
  >;
};
export type FastAnimatediffVideoToVideoOutput = {
  /**
   * Generated video file.
   */
  video: File;
  /**
   * Seed used for generating the video.
   */
  seed: number;
};
export type FastAnimatediffTurboTextToVideoInput = {
  /**
   * URL of the video.
   */
  video_url: string | Blob | File;
  /**
   * The first N number of seconds of video to animate. Default value: `3`
   */
  first_n_seconds?: number;
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The negative prompt to use. Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `"(bad quality, worst quality:1.2), ugly faces, bad anime"`
   */
  negative_prompt?: string;
  /**
   * The number of inference steps to perform. 4-12 is recommended for turbo mode. Default value: `8`
   */
  num_inference_steps?: number;
  /**
   * The strength of the input video in the final output. Default value: `0.7`
   */
  strength?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want the model to stick to your prompt when looking for a related image to show you. Default value: `1`
   */
  guidance_scale?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * Number of frames per second to extract from the video. Default value: `8`
   */
  fps?: number;
  /**
   * The motions to apply to the video.
   */
  motions?: Array<
    "zoom-out" | "zoom-in" | "pan-left" | "pan-right" | "tilt-up" | "tilt-down"
  >;
};
export type FastAnimatediffTurboTextToVideoOutput = {
  /**
   * Generated video file.
   */
  video: File;
  /**
   * Seed used for generating the video.
   */
  seed: number;
};
export type FastAnimatediffTurboVideoToVideoInput = {
  /**
   * URL of the video.
   */
  video_url: string | Blob | File;
  /**
   * The first N number of seconds of video to animate. Default value: `3`
   */
  first_n_seconds?: number;
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The negative prompt to use. Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `"(bad quality, worst quality:1.2), ugly faces, bad anime"`
   */
  negative_prompt?: string;
  /**
   * The number of inference steps to perform. 4-12 is recommended for turbo mode. Default value: `8`
   */
  num_inference_steps?: number;
  /**
   * The strength of the input video in the final output. Default value: `0.7`
   */
  strength?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want the model to stick to your prompt when looking for a related image to show you. Default value: `1`
   */
  guidance_scale?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * Number of frames per second to extract from the video. Default value: `8`
   */
  fps?: number;
  /**
   * The motions to apply to the video.
   */
  motions?: Array<
    "zoom-out" | "zoom-in" | "pan-left" | "pan-right" | "tilt-up" | "tilt-down"
  >;
};
export type FastAnimatediffTurboVideoToVideoOutput = {
  /**
   * Generated video file.
   */
  video: File;
  /**
   * Seed used for generating the video.
   */
  seed: number;
};
export type IllusionDiffusionOutput = {
  /**
   * The generated image file info.
   */
  image: Image;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
};
export type IllusionDiffusionInput = {
  /**
   * Input image url.
   */
  image_url: string | Blob | File;
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The negative prompt to use. Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `7.5`
   */
  guidance_scale?: number;
  /**
   * The scale of the ControlNet. Default value: `1`
   */
  controlnet_conditioning_scale?: number;
  /**
   *
   */
  control_guidance_start?: number;
  /**
   *  Default value: `1`
   */
  control_guidance_end?: number;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed?: number;
  /**
   * Scheduler / sampler to use for the image denoising process. Default value: `"Euler"`
   */
  scheduler?: "DPM++ Karras SDE" | "Euler";
  /**
   * Increasing the amount of steps tells Stable Diffusion that it should take more steps
   * to generate your final result which can increase the amount of detail in your image. Default value: `40`
   */
  num_inference_steps?: number;
  /**
   * The size of the generated image. You can choose between some presets or
   * custom height and width that **must be multiples of 8**. Default value: `square_hd`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
};
export type ImageutilsDepthInput = {
  /**
   * Input image url.
   */
  image_url: string | Blob | File;
};
export type ImageutilsDepthOutput = {
  /**
   * Combined image of all detected masks
   */
  image?: Image;
};
export type ImageutilsRembgInput = {
  /**
   * Input image url.
   */
  image_url: string | Blob | File;
};
export type ImageutilsRembgOutput = {
  /**
   * Combined image of all detected masks
   */
  image?: Image;
};
export type EsrganOutput = {
  /**
   * Upscaled image
   */
  image: Image;
};
export type EsrganInput = {
  /**
   * Url to input image
   */
  image_url: string | Blob | File;
  /**
   * Rescaling factor Default value: `2`
   */
  scale?: number;
  /**
   * Tile size. Default is 0, that is no tile. When encountering the out-of-GPU-memory issue, please specify it, e.g., 400 or 200
   */
  tile?: number;
  /**
   * Upscaling a face
   */
  face?: boolean;
  /**
   * Model to use for upscaling Default value: `"RealESRGAN_x4plus"`
   */
  model?:
    | "RealESRGAN_x4plus"
    | "RealESRGAN_x2plus"
    | "RealESRGAN_x4plus_anime_6B"
    | "RealESRGAN_x4_v3"
    | "RealESRGAN_x4_wdn_v3"
    | "RealESRGAN_x4_anime_v3";
  /**
   * Output image format (png or jpeg) Default value: `"png"`
   */
  output_format?: "png" | "jpeg";
};
export type ControlnetsdxlOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
};
export type ControlnetsdxlInput = {
  /**
   * Url to input image
   */
  image_url: string | Blob | File;
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The scale of the ControlNet. Default value: `0.5`
   */
  controlnet_conditioning_scale?: number;
  /**
   * The negative prompt to use.Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * Increasing the amount of steps tells Stable Diffusion that it should take more steps
   * to generate your final result which can increase the amount of detail in your image. Default value: `50`
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
};
export type FastSdxlControlnetCannyOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
};
export type FastSdxlControlnetCannyInput = {
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The URL of the control image.
   */
  control_image_url: string | Blob | File;
  /**
   * The scale of the controlnet conditioning. Default value: `0.5`
   */
  controlnet_conditioning_scale?: number;
  /**
   * The URL of the image to use as a starting point for the generation.
   */
  image_url: string | Blob | File;
  /**
   * The URL of the mask to use for inpainting.
   */
  mask_url: string | Blob | File;
  /**
   * The negative prompt to use.Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The size of the generated image. Leave it none to automatically infer from the control image.
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `25`
   */
  num_inference_steps?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `7.5`
   */
  guidance_scale?: number;
  /**
   * determines how much the generated image resembles the initial image Default value: `0.95`
   */
  strength?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * The list of LoRA weights to use. Default value: ``
   */
  loras?: Array<LoraWeight>;
  /**
   * If set to true, the safety checker will be enabled.
   */
  enable_safety_checker?: boolean;
  /**
   * If set to true, the prompt will be expanded with additional prompts.
   */
  expand_prompt?: boolean;
};
export type FastSdxlControlnetCannyImageToImageOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
};
export type FastSdxlControlnetCannyImageToImageInput = {
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The URL of the control image.
   */
  control_image_url: string | Blob | File;
  /**
   * The scale of the controlnet conditioning. Default value: `0.5`
   */
  controlnet_conditioning_scale?: number;
  /**
   * The URL of the image to use as a starting point for the generation.
   */
  image_url: string | Blob | File;
  /**
   * The URL of the mask to use for inpainting.
   */
  mask_url: string | Blob | File;
  /**
   * The negative prompt to use.Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The size of the generated image. Leave it none to automatically infer from the control image.
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `25`
   */
  num_inference_steps?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `7.5`
   */
  guidance_scale?: number;
  /**
   * determines how much the generated image resembles the initial image Default value: `0.95`
   */
  strength?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * The list of LoRA weights to use. Default value: ``
   */
  loras?: Array<LoraWeight>;
  /**
   * If set to true, the safety checker will be enabled.
   */
  enable_safety_checker?: boolean;
  /**
   * If set to true, the prompt will be expanded with additional prompts.
   */
  expand_prompt?: boolean;
};
export type FastSdxlControlnetCannyInpaintingOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
};
export type FastSdxlControlnetCannyInpaintingInput = {
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The URL of the control image.
   */
  control_image_url: string | Blob | File;
  /**
   * The scale of the controlnet conditioning. Default value: `0.5`
   */
  controlnet_conditioning_scale?: number;
  /**
   * The URL of the image to use as a starting point for the generation.
   */
  image_url: string | Blob | File;
  /**
   * The URL of the mask to use for inpainting.
   */
  mask_url: string | Blob | File;
  /**
   * The negative prompt to use.Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The size of the generated image. Leave it none to automatically infer from the control image.
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `25`
   */
  num_inference_steps?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `7.5`
   */
  guidance_scale?: number;
  /**
   * determines how much the generated image resembles the initial image Default value: `0.95`
   */
  strength?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * The list of LoRA weights to use. Default value: ``
   */
  loras?: Array<LoraWeight>;
  /**
   * If set to true, the safety checker will be enabled.
   */
  enable_safety_checker?: boolean;
  /**
   * If set to true, the prompt will be expanded with additional prompts.
   */
  expand_prompt?: boolean;
};
export type InpaintInput = {
  /**
   * URL or HuggingFace ID of the base model to generate the image.
   */
  model_name: string;
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The negative prompt to use. Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * Input image for img2img or inpaint mode
   */
  image_url: string | Blob | File;
  /**
   * Input mask for inpaint mode. Black areas will be preserved, white areas will be inpainted.
   */
  mask_url: string | Blob | File;
  /**
   * Increasing the amount of steps tells Stable Diffusion that it should take more steps
   * to generate your final result which can increase the amount of detail in your image. Default value: `30`
   */
  num_inference_steps?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `7.5`
   */
  guidance_scale?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
};
export type InpaintOutput = {
  /**
   * The generated image files info.
   */
  image: Image;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
};
export type AnimatediffSparsectrlLcmInput = {
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The negative prompt to use. Use it to specify what you don't want. Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The type of controlnet to use for generating the video. The controlnet determines how the video will be animated. Default value: `"scribble"`
   */
  controlnet_type?: "scribble" | "rgb";
  /**
   * Increasing the amount of steps tells Stable Diffusion that it should take more steps to generate your final result which can increase the amount of detail in your image. Default value: `4`
   */
  num_inference_steps?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want the model to stick to your prompt when looking for a related image to show you. Default value: `1`
   */
  guidance_scale?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable
   * Diffusion will output the same image every time.
   */
  seed?: number;
  /**
   * The URL of the first keyframe to use for the generation.
   */
  keyframe_0_image_url?: string | Blob | File;
  /**
   * The frame index of the first keyframe to use for the generation.
   */
  keyframe_0_index?: number;
  /**
   * The URL of the second keyframe to use for the generation.
   */
  keyframe_1_image_url?: string | Blob | File;
  /**
   * The frame index of the second keyframe to use for the generation.
   */
  keyframe_1_index?: number;
  /**
   * The URL of the third keyframe to use for the generation.
   */
  keyframe_2_image_url?: string | Blob | File;
  /**
   * The frame index of the third keyframe to use for the generation.
   */
  keyframe_2_index?: number;
};
export type AnimatediffSparsectrlLcmOutput = {
  /**
   * Generated video file.
   */
  video: File;
  /**
   * The seed used to generate the video.
   */
  seed: number;
};
export type PulidInput = {
  /**
   * List of reference faces, ideally 4 images.
   */
  reference_images: Array<ReferenceFace>;
  /**
   * Prompt to generate the face from
   */
  prompt: string;
  /**
   * Negative prompt to generate the face from Default value: `"flaws in the eyes, flaws in the face, flaws, lowres, non-HDRi, low quality, worst quality,artifacts noise, text, watermark, glitch, deformed, mutated, ugly, disfigured, hands, low resolution, partially rendered objects,  deformed or partially rendered eyes, deformed, deformed eyeballs, cross-eyed,blurry"`
   */
  negative_prompt?: string;
  /**
   * Number of images to generate Default value: `1`
   */
  num_images?: number;
  /**
   * Guidance scale Default value: `1.2`
   */
  guidance_scale?: number;
  /**
   * Number of steps to take Default value: `4`
   */
  num_inference_steps?: number;
  /**
   * Random seed for reproducibility
   */
  seed?: number;
  /**
   * Size of the generated image Default value: `[object Object]`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * ID scale Default value: `0.8`
   */
  id_scale?: number;
  /**
   * Mode of generation Default value: `"fidelity"`
   */
  mode?: "fidelity" | "extreme style";
  /**
   * if you want to mix two ID image, please turn this on, otherwise, turn this off
   */
  id_mix?: boolean;
};
export type PulidOutput = {
  /**
   * List of generated images
   */
  images: Array<Image>;
  /**
   * Random seed used for reproducibility
   */
  seed: number;
};
export type IpAdapterFaceIdInput = {
  /**
   * The model type to use. 1_5 is the default and is recommended for most use cases. Default value: `"1_5-v1"`
   */
  model_type?:
    | "1_5-v1"
    | "1_5-v1-plus"
    | "1_5-v2-plus"
    | "SDXL-v1"
    | "SDXL-v2-plus"
    | "1_5-auraface-v1";
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * An image of a face to match. If an image with a size of 640x640 is not provided, it will be scaled and cropped to that size.
   */
  face_image_url?: string | Blob | File;
  /**
   * URL to zip archive with images of faces. The images embedding will be averaged to
   * create a more accurate face id.
   */
  face_images_data_url?: string | Blob | File;
  /**
   * The negative prompt to use.Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `"blurry, low resolution, bad, ugly, low quality, pixelated, interpolated, compression artifacts, noisey, grainy"`
   */
  negative_prompt?: string;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `7.5`
   */
  guidance_scale?: number;
  /**
   * The number of inference steps to use for generating the image. The more steps
   * the better the image will be but it will also take longer to generate. Default value: `50`
   */
  num_inference_steps?: number;
  /**
   * The number of samples for face id. The more samples the better the image will
   * be but it will also take longer to generate. Default is 4. Default value: `4`
   */
  num_samples?: number;
  /**
   * The width of the generated image. Default value: `512`
   */
  width?: number;
  /**
   * The height of the generated image. Default value: `512`
   */
  height?: number;
  /**
   * The size of the face detection model. The higher the number the more accurate
   * the detection will be but it will also take longer to run. The higher the number the more
   * likely it will fail to find a face as well. Lower it if you are having trouble
   * finding a face in the image. Default value: `640`
   */
  face_id_det_size?: number;
  /**
   * The URL to the base 1.5 model. Default is SG161222/Realistic_Vision_V4.0_noVAE Default value: `"SG161222/Realistic_Vision_V4.0_noVAE"`
   */
  base_1_5_model_repo?: string;
  /**
   * The URL to the base SDXL model. Default is SG161222/RealVisXL_V3.0 Default value: `"SG161222/RealVisXL_V3.0"`
   */
  base_sdxl_model_repo?: string;
};
export type IpAdapterFaceIdOutput = {
  /**
   * The generated image file info.
   */
  image: Image;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
};
export type ImageutilsMarigoldDepthInput = {
  /**
   * Input image url.
   */
  image_url: string | Blob | File;
};
export type ImageutilsMarigoldDepthOutput = {
  /**
   * Combined image of all detected masks
   */
  image?: Image;
};
export type StableAudioInput = {
  /**
   * The prompt to generate audio from
   */
  prompt: string;
  /**
   * The start point of the audio clip to generate
   */
  seconds_start?: number;
  /**
   * The duration of the audio clip to generate Default value: `30`
   */
  seconds_total?: number;
  /**
   * The number of steps to denoise the audio for Default value: `100`
   */
  steps?: number;
};
export type StableAudioOutput = {
  /**
   * The generated audio clip
   */
  audio_file: File;
};
export type DiffusionEdgeInput = {
  /**
   * The text prompt you would like to convert to speech.
   */
  image_url: string | Blob | File;
};
export type DiffusionEdgeOutput = {
  /**
   * The generated image file info.
   */
  image: Image;
};
export type TriposrOutput = {
  /**
   * Generated 3D object file.
   */
  model_mesh: File;
  /**
   * Inference timings.
   */
  timings: Record<string, any>;
  /**
   * Directory containing textures for the remeshed model.
   */
  remeshing_dir?: File;
};
export type TriposrInput = {
  /**
   * Path for the image file to be processed.
   */
  image_url: string | Blob | File;
  /**
   * Output format for the 3D model. Default value: `"glb"`
   */
  output_format?: "glb" | "obj";
  /**
   * Whether to remove the background from the input image. Default value: `true`
   */
  do_remove_background?: boolean;
  /**
   * Ratio of the foreground image to the original image. Default value: `0.9`
   */
  foreground_ratio?: number;
  /**
   * Resolution of the marching cubes. Above 512 is not recommended. Default value: `256`
   */
  mc_resolution?: number;
};
export type FooocusUpscaleOrVaryInput = {
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results. Default value: `""`
   */
  prompt?: string;
  /**
   * The negative prompt to use. Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The style to use. Default value: `Fooocus Enhance,Fooocus V2,Fooocus Sharp`
   */
  styles?: Array<
    | "Fooocus V2"
    | "Fooocus Enhance"
    | "Fooocus Sharp"
    | "Fooocus Semi Realistic"
    | "Fooocus Masterpiece"
    | "Fooocus Photograph"
    | "Fooocus Negative"
    | "Fooocus Cinematic"
    | "SAI 3D Model"
    | "SAI Analog Film"
    | "SAI Anime"
    | "SAI Cinematic"
    | "SAI Comic Book"
    | "SAI Craft Clay"
    | "SAI Digital Art"
    | "SAI Enhance"
    | "SAI Fantasy Art"
    | "SAI Isometric"
    | "SAI Line Art"
    | "SAI Lowpoly"
    | "SAI Neonpunk"
    | "SAI Origami"
    | "SAI Photographic"
    | "SAI Pixel Art"
    | "SAI Texture"
    | "MRE Cinematic Dynamic"
    | "MRE Spontaneous Picture"
    | "MRE Artistic Vision"
    | "MRE Dark Dream"
    | "MRE Gloomy Art"
    | "MRE Bad Dream"
    | "MRE Underground"
    | "MRE Surreal Painting"
    | "MRE Dynamic Illustration"
    | "MRE Undead Art"
    | "MRE Elemental Art"
    | "MRE Space Art"
    | "MRE Ancient Illustration"
    | "MRE Brave Art"
    | "MRE Heroic Fantasy"
    | "MRE Dark Cyberpunk"
    | "MRE Lyrical Geometry"
    | "MRE Sumi E Symbolic"
    | "MRE Sumi E Detailed"
    | "MRE Manga"
    | "MRE Anime"
    | "MRE Comic"
    | "Ads Advertising"
    | "Ads Automotive"
    | "Ads Corporate"
    | "Ads Fashion Editorial"
    | "Ads Food Photography"
    | "Ads Gourmet Food Photography"
    | "Ads Luxury"
    | "Ads Real Estate"
    | "Ads Retail"
    | "Artstyle Abstract"
    | "Artstyle Abstract Expressionism"
    | "Artstyle Art Deco"
    | "Artstyle Art Nouveau"
    | "Artstyle Constructivist"
    | "Artstyle Cubist"
    | "Artstyle Expressionist"
    | "Artstyle Graffiti"
    | "Artstyle Hyperrealism"
    | "Artstyle Impressionist"
    | "Artstyle Pointillism"
    | "Artstyle Pop Art"
    | "Artstyle Psychedelic"
    | "Artstyle Renaissance"
    | "Artstyle Steampunk"
    | "Artstyle Surrealist"
    | "Artstyle Typography"
    | "Artstyle Watercolor"
    | "Futuristic Biomechanical"
    | "Futuristic Biomechanical Cyberpunk"
    | "Futuristic Cybernetic"
    | "Futuristic Cybernetic Robot"
    | "Futuristic Cyberpunk Cityscape"
    | "Futuristic Futuristic"
    | "Futuristic Retro Cyberpunk"
    | "Futuristic Retro Futurism"
    | "Futuristic Sci Fi"
    | "Futuristic Vaporwave"
    | "Game Bubble Bobble"
    | "Game Cyberpunk Game"
    | "Game Fighting Game"
    | "Game Gta"
    | "Game Mario"
    | "Game Minecraft"
    | "Game Pokemon"
    | "Game Retro Arcade"
    | "Game Retro Game"
    | "Game Rpg Fantasy Game"
    | "Game Strategy Game"
    | "Game Streetfighter"
    | "Game Zelda"
    | "Misc Architectural"
    | "Misc Disco"
    | "Misc Dreamscape"
    | "Misc Dystopian"
    | "Misc Fairy Tale"
    | "Misc Gothic"
    | "Misc Grunge"
    | "Misc Horror"
    | "Misc Kawaii"
    | "Misc Lovecraftian"
    | "Misc Macabre"
    | "Misc Manga"
    | "Misc Metropolis"
    | "Misc Minimalist"
    | "Misc Monochrome"
    | "Misc Nautical"
    | "Misc Space"
    | "Misc Stained Glass"
    | "Misc Techwear Fashion"
    | "Misc Tribal"
    | "Misc Zentangle"
    | "Papercraft Collage"
    | "Papercraft Flat Papercut"
    | "Papercraft Kirigami"
    | "Papercraft Paper Mache"
    | "Papercraft Paper Quilling"
    | "Papercraft Papercut Collage"
    | "Papercraft Papercut Shadow Box"
    | "Papercraft Stacked Papercut"
    | "Papercraft Thick Layered Papercut"
    | "Photo Alien"
    | "Photo Film Noir"
    | "Photo Glamour"
    | "Photo Hdr"
    | "Photo Iphone Photographic"
    | "Photo Long Exposure"
    | "Photo Neon Noir"
    | "Photo Silhouette"
    | "Photo Tilt Shift"
    | "Cinematic Diva"
    | "Abstract Expressionism"
    | "Academia"
    | "Action Figure"
    | "Adorable 3D Character"
    | "Adorable Kawaii"
    | "Art Deco"
    | "Art Nouveau"
    | "Astral Aura"
    | "Avant Garde"
    | "Baroque"
    | "Bauhaus Style Poster"
    | "Blueprint Schematic Drawing"
    | "Caricature"
    | "Cel Shaded Art"
    | "Character Design Sheet"
    | "Classicism Art"
    | "Color Field Painting"
    | "Colored Pencil Art"
    | "Conceptual Art"
    | "Constructivism"
    | "Cubism"
    | "Dadaism"
    | "Dark Fantasy"
    | "Dark Moody Atmosphere"
    | "Dmt Art Style"
    | "Doodle Art"
    | "Double Exposure"
    | "Dripping Paint Splatter Art"
    | "Expressionism"
    | "Faded Polaroid Photo"
    | "Fauvism"
    | "Flat 2d Art"
    | "Fortnite Art Style"
    | "Futurism"
    | "Glitchcore"
    | "Glo Fi"
    | "Googie Art Style"
    | "Graffiti Art"
    | "Harlem Renaissance Art"
    | "High Fashion"
    | "Idyllic"
    | "Impressionism"
    | "Infographic Drawing"
    | "Ink Dripping Drawing"
    | "Japanese Ink Drawing"
    | "Knolling Photography"
    | "Light Cheery Atmosphere"
    | "Logo Design"
    | "Luxurious Elegance"
    | "Macro Photography"
    | "Mandola Art"
    | "Marker Drawing"
    | "Medievalism"
    | "Minimalism"
    | "Neo Baroque"
    | "Neo Byzantine"
    | "Neo Futurism"
    | "Neo Impressionism"
    | "Neo Rococo"
    | "Neoclassicism"
    | "Op Art"
    | "Ornate And Intricate"
    | "Pencil Sketch Drawing"
    | "Pop Art 2"
    | "Rococo"
    | "Silhouette Art"
    | "Simple Vector Art"
    | "Sketchup"
    | "Steampunk 2"
    | "Surrealism"
    | "Suprematism"
    | "Terragen"
    | "Tranquil Relaxing Atmosphere"
    | "Sticker Designs"
    | "Vibrant Rim Light"
    | "Volumetric Lighting"
    | "Watercolor 2"
    | "Whimsical And Playful"
    | "Mk Chromolithography"
    | "Mk Cross Processing Print"
    | "Mk Dufaycolor Photograph"
    | "Mk Herbarium"
    | "Mk Punk Collage"
    | "Mk Mosaic"
    | "Mk Van Gogh"
    | "Mk Coloring Book"
    | "Mk Singer Sargent"
    | "Mk Pollock"
    | "Mk Basquiat"
    | "Mk Andy Warhol"
    | "Mk Halftone Print"
    | "Mk Gond Painting"
    | "Mk Albumen Print"
    | "Mk Aquatint Print"
    | "Mk Anthotype Print"
    | "Mk Inuit Carving"
    | "Mk Bromoil Print"
    | "Mk Calotype Print"
    | "Mk Color Sketchnote"
    | "Mk Cibulak Porcelain"
    | "Mk Alcohol Ink Art"
    | "Mk One Line Art"
    | "Mk Blacklight Paint"
    | "Mk Carnival Glass"
    | "Mk Cyanotype Print"
    | "Mk Cross Stitching"
    | "Mk Encaustic Paint"
    | "Mk Embroidery"
    | "Mk Gyotaku"
    | "Mk Luminogram"
    | "Mk Lite Brite Art"
    | "Mk Mokume Gane"
    | "Pebble Art"
    | "Mk Palekh"
    | "Mk Suminagashi"
    | "Mk Scrimshaw"
    | "Mk Shibori"
    | "Mk Vitreous Enamel"
    | "Mk Ukiyo E"
    | "Mk Vintage Airline Poster"
    | "Mk Vintage Travel Poster"
    | "Mk Bauhaus Style"
    | "Mk Afrofuturism"
    | "Mk Atompunk"
    | "Mk Constructivism"
    | "Mk Chicano Art"
    | "Mk De Stijl"
    | "Mk Dayak Art"
    | "Mk Fayum Portrait"
    | "Mk Illuminated Manuscript"
    | "Mk Kalighat Painting"
    | "Mk Madhubani Painting"
    | "Mk Pictorialism"
    | "Mk Pichwai Painting"
    | "Mk Patachitra Painting"
    | "Mk Samoan Art Inspired"
    | "Mk Tlingit Art"
    | "Mk Adnate Style"
    | "Mk Ron English Style"
    | "Mk Shepard Fairey Style"
  >;
  /**
   * You can choose Speed or Quality Default value: `"Extreme Speed"`
   */
  performance?: "Speed" | "Quality" | "Extreme Speed" | "Lightning";
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `4`
   */
  guidance_scale?: number;
  /**
   * The sharpness of the generated image. Use it to control how sharp the generated
   * image should be. Higher value means image and texture are sharper. Default value: `2`
   */
  sharpness?: number;
  /**
   * The size of the generated image. You can choose between some presets or
   * custom height and width that **must be multiples of 8**. Default value: `"1024x1024"`
   */
  aspect_ratio?: string;
  /**
   * Number of images to generate in one request Default value: `1`
   */
  num_images?: number;
  /**
   * The LoRAs to use for the image generation. You can use up to 5 LoRAs
   * and they will be merged together to generate the final image. Default value: `[object Object]`
   */
  loras?: Array<LoraWeight>;
  /**
   * Refiner (SDXL or SD 1.5) Default value: `"None"`
   */
  refiner_model?: "None" | "realisticVisionV60B1_v51VAE.safetensors";
  /**
   * Use 0.4 for SD1.5 realistic models; 0.667 for SD1.5 anime models
   * 0.8 for XL-refiners; or any value for switching two SDXL models. Default value: `0.8`
   */
  refiner_switch?: number;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  output_format?: "png" | "jpeg" | "webp";
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   *
   */
  image_prompt_1: ImagePrompt;
  /**
   *
   */
  image_prompt_2?: ImagePrompt;
  /**
   *
   */
  image_prompt_3?: ImagePrompt;
  /**
   *
   */
  image_prompt_4?: ImagePrompt;
  /**
   * The image to use as a reference for inpainting.
   */
  inpaint_image_url?: string | Blob | File;
  /**
   * The image to use as a mask for the generated image.
   */
  mask_image_url?: string | Blob | File;
  /**
   * The mode to use for inpainting. Default value: `"Inpaint or Outpaint (default)"`
   */
  inpaint_mode?:
    | "Inpaint or Outpaint (default)"
    | "Improve Detail (face, hand, eyes, etc.)"
    | "Modify Content (add objects, change background, etc.)";
  /**
   * Describe what you want to inpaint. Default value: `""`
   */
  inpaint_additional_prompt?: string;
  /**
   * The directions to outpaint. Default value: ``
   */
  outpaint_selections?: Array<"Left" | "Right" | "Top" | "Bottom">;
  /**
   * Mixing Image Prompt and Inpaint
   */
  mixing_image_prompt_and_inpaint?: boolean;
  /**
   * The image to upscale or vary.
   */
  uov_image_url?: string | Blob | File;
  /**
   * The method to use for upscaling or varying. Default value: `"Disabled"`
   */
  uov_method?:
    | "Disabled"
    | "Vary (Subtle)"
    | "Vary (Strong)"
    | "Upscale (1.5x)"
    | "Upscale (2x)"
    | "Upscale (Fast 2x)";
  /**
   * Mixing Image Prompt and Vary/Upscale
   */
  mixing_image_prompt_and_vary_upscale?: boolean;
  /**
   * If set to false, the safety checker will be disabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
};
export type FooocusUpscaleOrVaryOutput = {
  /**
   * The generated image file info.
   */
  images: Array<Image>;
  /**
   * The time taken for the generation process.
   */
  timings: Record<string, any>;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
};
export type FooocusImagePromptInput = {
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results. Default value: `""`
   */
  prompt?: string;
  /**
   * The negative prompt to use. Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The style to use. Default value: `Fooocus Enhance,Fooocus V2,Fooocus Sharp`
   */
  styles?: Array<
    | "Fooocus V2"
    | "Fooocus Enhance"
    | "Fooocus Sharp"
    | "Fooocus Semi Realistic"
    | "Fooocus Masterpiece"
    | "Fooocus Photograph"
    | "Fooocus Negative"
    | "Fooocus Cinematic"
    | "SAI 3D Model"
    | "SAI Analog Film"
    | "SAI Anime"
    | "SAI Cinematic"
    | "SAI Comic Book"
    | "SAI Craft Clay"
    | "SAI Digital Art"
    | "SAI Enhance"
    | "SAI Fantasy Art"
    | "SAI Isometric"
    | "SAI Line Art"
    | "SAI Lowpoly"
    | "SAI Neonpunk"
    | "SAI Origami"
    | "SAI Photographic"
    | "SAI Pixel Art"
    | "SAI Texture"
    | "MRE Cinematic Dynamic"
    | "MRE Spontaneous Picture"
    | "MRE Artistic Vision"
    | "MRE Dark Dream"
    | "MRE Gloomy Art"
    | "MRE Bad Dream"
    | "MRE Underground"
    | "MRE Surreal Painting"
    | "MRE Dynamic Illustration"
    | "MRE Undead Art"
    | "MRE Elemental Art"
    | "MRE Space Art"
    | "MRE Ancient Illustration"
    | "MRE Brave Art"
    | "MRE Heroic Fantasy"
    | "MRE Dark Cyberpunk"
    | "MRE Lyrical Geometry"
    | "MRE Sumi E Symbolic"
    | "MRE Sumi E Detailed"
    | "MRE Manga"
    | "MRE Anime"
    | "MRE Comic"
    | "Ads Advertising"
    | "Ads Automotive"
    | "Ads Corporate"
    | "Ads Fashion Editorial"
    | "Ads Food Photography"
    | "Ads Gourmet Food Photography"
    | "Ads Luxury"
    | "Ads Real Estate"
    | "Ads Retail"
    | "Artstyle Abstract"
    | "Artstyle Abstract Expressionism"
    | "Artstyle Art Deco"
    | "Artstyle Art Nouveau"
    | "Artstyle Constructivist"
    | "Artstyle Cubist"
    | "Artstyle Expressionist"
    | "Artstyle Graffiti"
    | "Artstyle Hyperrealism"
    | "Artstyle Impressionist"
    | "Artstyle Pointillism"
    | "Artstyle Pop Art"
    | "Artstyle Psychedelic"
    | "Artstyle Renaissance"
    | "Artstyle Steampunk"
    | "Artstyle Surrealist"
    | "Artstyle Typography"
    | "Artstyle Watercolor"
    | "Futuristic Biomechanical"
    | "Futuristic Biomechanical Cyberpunk"
    | "Futuristic Cybernetic"
    | "Futuristic Cybernetic Robot"
    | "Futuristic Cyberpunk Cityscape"
    | "Futuristic Futuristic"
    | "Futuristic Retro Cyberpunk"
    | "Futuristic Retro Futurism"
    | "Futuristic Sci Fi"
    | "Futuristic Vaporwave"
    | "Game Bubble Bobble"
    | "Game Cyberpunk Game"
    | "Game Fighting Game"
    | "Game Gta"
    | "Game Mario"
    | "Game Minecraft"
    | "Game Pokemon"
    | "Game Retro Arcade"
    | "Game Retro Game"
    | "Game Rpg Fantasy Game"
    | "Game Strategy Game"
    | "Game Streetfighter"
    | "Game Zelda"
    | "Misc Architectural"
    | "Misc Disco"
    | "Misc Dreamscape"
    | "Misc Dystopian"
    | "Misc Fairy Tale"
    | "Misc Gothic"
    | "Misc Grunge"
    | "Misc Horror"
    | "Misc Kawaii"
    | "Misc Lovecraftian"
    | "Misc Macabre"
    | "Misc Manga"
    | "Misc Metropolis"
    | "Misc Minimalist"
    | "Misc Monochrome"
    | "Misc Nautical"
    | "Misc Space"
    | "Misc Stained Glass"
    | "Misc Techwear Fashion"
    | "Misc Tribal"
    | "Misc Zentangle"
    | "Papercraft Collage"
    | "Papercraft Flat Papercut"
    | "Papercraft Kirigami"
    | "Papercraft Paper Mache"
    | "Papercraft Paper Quilling"
    | "Papercraft Papercut Collage"
    | "Papercraft Papercut Shadow Box"
    | "Papercraft Stacked Papercut"
    | "Papercraft Thick Layered Papercut"
    | "Photo Alien"
    | "Photo Film Noir"
    | "Photo Glamour"
    | "Photo Hdr"
    | "Photo Iphone Photographic"
    | "Photo Long Exposure"
    | "Photo Neon Noir"
    | "Photo Silhouette"
    | "Photo Tilt Shift"
    | "Cinematic Diva"
    | "Abstract Expressionism"
    | "Academia"
    | "Action Figure"
    | "Adorable 3D Character"
    | "Adorable Kawaii"
    | "Art Deco"
    | "Art Nouveau"
    | "Astral Aura"
    | "Avant Garde"
    | "Baroque"
    | "Bauhaus Style Poster"
    | "Blueprint Schematic Drawing"
    | "Caricature"
    | "Cel Shaded Art"
    | "Character Design Sheet"
    | "Classicism Art"
    | "Color Field Painting"
    | "Colored Pencil Art"
    | "Conceptual Art"
    | "Constructivism"
    | "Cubism"
    | "Dadaism"
    | "Dark Fantasy"
    | "Dark Moody Atmosphere"
    | "Dmt Art Style"
    | "Doodle Art"
    | "Double Exposure"
    | "Dripping Paint Splatter Art"
    | "Expressionism"
    | "Faded Polaroid Photo"
    | "Fauvism"
    | "Flat 2d Art"
    | "Fortnite Art Style"
    | "Futurism"
    | "Glitchcore"
    | "Glo Fi"
    | "Googie Art Style"
    | "Graffiti Art"
    | "Harlem Renaissance Art"
    | "High Fashion"
    | "Idyllic"
    | "Impressionism"
    | "Infographic Drawing"
    | "Ink Dripping Drawing"
    | "Japanese Ink Drawing"
    | "Knolling Photography"
    | "Light Cheery Atmosphere"
    | "Logo Design"
    | "Luxurious Elegance"
    | "Macro Photography"
    | "Mandola Art"
    | "Marker Drawing"
    | "Medievalism"
    | "Minimalism"
    | "Neo Baroque"
    | "Neo Byzantine"
    | "Neo Futurism"
    | "Neo Impressionism"
    | "Neo Rococo"
    | "Neoclassicism"
    | "Op Art"
    | "Ornate And Intricate"
    | "Pencil Sketch Drawing"
    | "Pop Art 2"
    | "Rococo"
    | "Silhouette Art"
    | "Simple Vector Art"
    | "Sketchup"
    | "Steampunk 2"
    | "Surrealism"
    | "Suprematism"
    | "Terragen"
    | "Tranquil Relaxing Atmosphere"
    | "Sticker Designs"
    | "Vibrant Rim Light"
    | "Volumetric Lighting"
    | "Watercolor 2"
    | "Whimsical And Playful"
    | "Mk Chromolithography"
    | "Mk Cross Processing Print"
    | "Mk Dufaycolor Photograph"
    | "Mk Herbarium"
    | "Mk Punk Collage"
    | "Mk Mosaic"
    | "Mk Van Gogh"
    | "Mk Coloring Book"
    | "Mk Singer Sargent"
    | "Mk Pollock"
    | "Mk Basquiat"
    | "Mk Andy Warhol"
    | "Mk Halftone Print"
    | "Mk Gond Painting"
    | "Mk Albumen Print"
    | "Mk Aquatint Print"
    | "Mk Anthotype Print"
    | "Mk Inuit Carving"
    | "Mk Bromoil Print"
    | "Mk Calotype Print"
    | "Mk Color Sketchnote"
    | "Mk Cibulak Porcelain"
    | "Mk Alcohol Ink Art"
    | "Mk One Line Art"
    | "Mk Blacklight Paint"
    | "Mk Carnival Glass"
    | "Mk Cyanotype Print"
    | "Mk Cross Stitching"
    | "Mk Encaustic Paint"
    | "Mk Embroidery"
    | "Mk Gyotaku"
    | "Mk Luminogram"
    | "Mk Lite Brite Art"
    | "Mk Mokume Gane"
    | "Pebble Art"
    | "Mk Palekh"
    | "Mk Suminagashi"
    | "Mk Scrimshaw"
    | "Mk Shibori"
    | "Mk Vitreous Enamel"
    | "Mk Ukiyo E"
    | "Mk Vintage Airline Poster"
    | "Mk Vintage Travel Poster"
    | "Mk Bauhaus Style"
    | "Mk Afrofuturism"
    | "Mk Atompunk"
    | "Mk Constructivism"
    | "Mk Chicano Art"
    | "Mk De Stijl"
    | "Mk Dayak Art"
    | "Mk Fayum Portrait"
    | "Mk Illuminated Manuscript"
    | "Mk Kalighat Painting"
    | "Mk Madhubani Painting"
    | "Mk Pictorialism"
    | "Mk Pichwai Painting"
    | "Mk Patachitra Painting"
    | "Mk Samoan Art Inspired"
    | "Mk Tlingit Art"
    | "Mk Adnate Style"
    | "Mk Ron English Style"
    | "Mk Shepard Fairey Style"
  >;
  /**
   * You can choose Speed or Quality Default value: `"Extreme Speed"`
   */
  performance?: "Speed" | "Quality" | "Extreme Speed" | "Lightning";
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `4`
   */
  guidance_scale?: number;
  /**
   * The sharpness of the generated image. Use it to control how sharp the generated
   * image should be. Higher value means image and texture are sharper. Default value: `2`
   */
  sharpness?: number;
  /**
   * The size of the generated image. You can choose between some presets or
   * custom height and width that **must be multiples of 8**. Default value: `"1024x1024"`
   */
  aspect_ratio?: string;
  /**
   * Number of images to generate in one request Default value: `1`
   */
  num_images?: number;
  /**
   * The LoRAs to use for the image generation. You can use up to 5 LoRAs
   * and they will be merged together to generate the final image. Default value: `[object Object]`
   */
  loras?: Array<LoraWeight>;
  /**
   * Refiner (SDXL or SD 1.5) Default value: `"None"`
   */
  refiner_model?: "None" | "realisticVisionV60B1_v51VAE.safetensors";
  /**
   * Use 0.4 for SD1.5 realistic models; 0.667 for SD1.5 anime models
   * 0.8 for XL-refiners; or any value for switching two SDXL models. Default value: `0.8`
   */
  refiner_switch?: number;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  output_format?: "png" | "jpeg" | "webp";
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   *
   */
  image_prompt_1: ImagePrompt;
  /**
   *
   */
  image_prompt_2?: ImagePrompt;
  /**
   *
   */
  image_prompt_3?: ImagePrompt;
  /**
   *
   */
  image_prompt_4?: ImagePrompt;
  /**
   * The image to use as a reference for inpainting.
   */
  inpaint_image_url?: string | Blob | File;
  /**
   * The image to use as a mask for the generated image.
   */
  mask_image_url?: string | Blob | File;
  /**
   * The mode to use for inpainting. Default value: `"Inpaint or Outpaint (default)"`
   */
  inpaint_mode?:
    | "Inpaint or Outpaint (default)"
    | "Improve Detail (face, hand, eyes, etc.)"
    | "Modify Content (add objects, change background, etc.)";
  /**
   * Describe what you want to inpaint. Default value: `""`
   */
  inpaint_additional_prompt?: string;
  /**
   * The directions to outpaint. Default value: ``
   */
  outpaint_selections?: Array<"Left" | "Right" | "Top" | "Bottom">;
  /**
   * Mixing Image Prompt and Inpaint
   */
  mixing_image_prompt_and_inpaint?: boolean;
  /**
   * The image to upscale or vary.
   */
  uov_image_url?: string | Blob | File;
  /**
   * The method to use for upscaling or varying. Default value: `"Disabled"`
   */
  uov_method?:
    | "Disabled"
    | "Vary (Subtle)"
    | "Vary (Strong)"
    | "Upscale (1.5x)"
    | "Upscale (2x)"
    | "Upscale (Fast 2x)";
  /**
   * Mixing Image Prompt and Vary/Upscale
   */
  mixing_image_prompt_and_vary_upscale?: boolean;
  /**
   * If set to false, the safety checker will be disabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
};
export type FooocusImagePromptOutput = {
  /**
   * The generated image file info.
   */
  images: Array<Image>;
  /**
   * The time taken for the generation process.
   */
  timings: Record<string, any>;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
};
export type FooocusInpaintInput = {
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results. Default value: `""`
   */
  prompt?: string;
  /**
   * The negative prompt to use. Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The style to use. Default value: `Fooocus Enhance,Fooocus V2,Fooocus Sharp`
   */
  styles?: Array<
    | "Fooocus V2"
    | "Fooocus Enhance"
    | "Fooocus Sharp"
    | "Fooocus Semi Realistic"
    | "Fooocus Masterpiece"
    | "Fooocus Photograph"
    | "Fooocus Negative"
    | "Fooocus Cinematic"
    | "SAI 3D Model"
    | "SAI Analog Film"
    | "SAI Anime"
    | "SAI Cinematic"
    | "SAI Comic Book"
    | "SAI Craft Clay"
    | "SAI Digital Art"
    | "SAI Enhance"
    | "SAI Fantasy Art"
    | "SAI Isometric"
    | "SAI Line Art"
    | "SAI Lowpoly"
    | "SAI Neonpunk"
    | "SAI Origami"
    | "SAI Photographic"
    | "SAI Pixel Art"
    | "SAI Texture"
    | "MRE Cinematic Dynamic"
    | "MRE Spontaneous Picture"
    | "MRE Artistic Vision"
    | "MRE Dark Dream"
    | "MRE Gloomy Art"
    | "MRE Bad Dream"
    | "MRE Underground"
    | "MRE Surreal Painting"
    | "MRE Dynamic Illustration"
    | "MRE Undead Art"
    | "MRE Elemental Art"
    | "MRE Space Art"
    | "MRE Ancient Illustration"
    | "MRE Brave Art"
    | "MRE Heroic Fantasy"
    | "MRE Dark Cyberpunk"
    | "MRE Lyrical Geometry"
    | "MRE Sumi E Symbolic"
    | "MRE Sumi E Detailed"
    | "MRE Manga"
    | "MRE Anime"
    | "MRE Comic"
    | "Ads Advertising"
    | "Ads Automotive"
    | "Ads Corporate"
    | "Ads Fashion Editorial"
    | "Ads Food Photography"
    | "Ads Gourmet Food Photography"
    | "Ads Luxury"
    | "Ads Real Estate"
    | "Ads Retail"
    | "Artstyle Abstract"
    | "Artstyle Abstract Expressionism"
    | "Artstyle Art Deco"
    | "Artstyle Art Nouveau"
    | "Artstyle Constructivist"
    | "Artstyle Cubist"
    | "Artstyle Expressionist"
    | "Artstyle Graffiti"
    | "Artstyle Hyperrealism"
    | "Artstyle Impressionist"
    | "Artstyle Pointillism"
    | "Artstyle Pop Art"
    | "Artstyle Psychedelic"
    | "Artstyle Renaissance"
    | "Artstyle Steampunk"
    | "Artstyle Surrealist"
    | "Artstyle Typography"
    | "Artstyle Watercolor"
    | "Futuristic Biomechanical"
    | "Futuristic Biomechanical Cyberpunk"
    | "Futuristic Cybernetic"
    | "Futuristic Cybernetic Robot"
    | "Futuristic Cyberpunk Cityscape"
    | "Futuristic Futuristic"
    | "Futuristic Retro Cyberpunk"
    | "Futuristic Retro Futurism"
    | "Futuristic Sci Fi"
    | "Futuristic Vaporwave"
    | "Game Bubble Bobble"
    | "Game Cyberpunk Game"
    | "Game Fighting Game"
    | "Game Gta"
    | "Game Mario"
    | "Game Minecraft"
    | "Game Pokemon"
    | "Game Retro Arcade"
    | "Game Retro Game"
    | "Game Rpg Fantasy Game"
    | "Game Strategy Game"
    | "Game Streetfighter"
    | "Game Zelda"
    | "Misc Architectural"
    | "Misc Disco"
    | "Misc Dreamscape"
    | "Misc Dystopian"
    | "Misc Fairy Tale"
    | "Misc Gothic"
    | "Misc Grunge"
    | "Misc Horror"
    | "Misc Kawaii"
    | "Misc Lovecraftian"
    | "Misc Macabre"
    | "Misc Manga"
    | "Misc Metropolis"
    | "Misc Minimalist"
    | "Misc Monochrome"
    | "Misc Nautical"
    | "Misc Space"
    | "Misc Stained Glass"
    | "Misc Techwear Fashion"
    | "Misc Tribal"
    | "Misc Zentangle"
    | "Papercraft Collage"
    | "Papercraft Flat Papercut"
    | "Papercraft Kirigami"
    | "Papercraft Paper Mache"
    | "Papercraft Paper Quilling"
    | "Papercraft Papercut Collage"
    | "Papercraft Papercut Shadow Box"
    | "Papercraft Stacked Papercut"
    | "Papercraft Thick Layered Papercut"
    | "Photo Alien"
    | "Photo Film Noir"
    | "Photo Glamour"
    | "Photo Hdr"
    | "Photo Iphone Photographic"
    | "Photo Long Exposure"
    | "Photo Neon Noir"
    | "Photo Silhouette"
    | "Photo Tilt Shift"
    | "Cinematic Diva"
    | "Abstract Expressionism"
    | "Academia"
    | "Action Figure"
    | "Adorable 3D Character"
    | "Adorable Kawaii"
    | "Art Deco"
    | "Art Nouveau"
    | "Astral Aura"
    | "Avant Garde"
    | "Baroque"
    | "Bauhaus Style Poster"
    | "Blueprint Schematic Drawing"
    | "Caricature"
    | "Cel Shaded Art"
    | "Character Design Sheet"
    | "Classicism Art"
    | "Color Field Painting"
    | "Colored Pencil Art"
    | "Conceptual Art"
    | "Constructivism"
    | "Cubism"
    | "Dadaism"
    | "Dark Fantasy"
    | "Dark Moody Atmosphere"
    | "Dmt Art Style"
    | "Doodle Art"
    | "Double Exposure"
    | "Dripping Paint Splatter Art"
    | "Expressionism"
    | "Faded Polaroid Photo"
    | "Fauvism"
    | "Flat 2d Art"
    | "Fortnite Art Style"
    | "Futurism"
    | "Glitchcore"
    | "Glo Fi"
    | "Googie Art Style"
    | "Graffiti Art"
    | "Harlem Renaissance Art"
    | "High Fashion"
    | "Idyllic"
    | "Impressionism"
    | "Infographic Drawing"
    | "Ink Dripping Drawing"
    | "Japanese Ink Drawing"
    | "Knolling Photography"
    | "Light Cheery Atmosphere"
    | "Logo Design"
    | "Luxurious Elegance"
    | "Macro Photography"
    | "Mandola Art"
    | "Marker Drawing"
    | "Medievalism"
    | "Minimalism"
    | "Neo Baroque"
    | "Neo Byzantine"
    | "Neo Futurism"
    | "Neo Impressionism"
    | "Neo Rococo"
    | "Neoclassicism"
    | "Op Art"
    | "Ornate And Intricate"
    | "Pencil Sketch Drawing"
    | "Pop Art 2"
    | "Rococo"
    | "Silhouette Art"
    | "Simple Vector Art"
    | "Sketchup"
    | "Steampunk 2"
    | "Surrealism"
    | "Suprematism"
    | "Terragen"
    | "Tranquil Relaxing Atmosphere"
    | "Sticker Designs"
    | "Vibrant Rim Light"
    | "Volumetric Lighting"
    | "Watercolor 2"
    | "Whimsical And Playful"
    | "Mk Chromolithography"
    | "Mk Cross Processing Print"
    | "Mk Dufaycolor Photograph"
    | "Mk Herbarium"
    | "Mk Punk Collage"
    | "Mk Mosaic"
    | "Mk Van Gogh"
    | "Mk Coloring Book"
    | "Mk Singer Sargent"
    | "Mk Pollock"
    | "Mk Basquiat"
    | "Mk Andy Warhol"
    | "Mk Halftone Print"
    | "Mk Gond Painting"
    | "Mk Albumen Print"
    | "Mk Aquatint Print"
    | "Mk Anthotype Print"
    | "Mk Inuit Carving"
    | "Mk Bromoil Print"
    | "Mk Calotype Print"
    | "Mk Color Sketchnote"
    | "Mk Cibulak Porcelain"
    | "Mk Alcohol Ink Art"
    | "Mk One Line Art"
    | "Mk Blacklight Paint"
    | "Mk Carnival Glass"
    | "Mk Cyanotype Print"
    | "Mk Cross Stitching"
    | "Mk Encaustic Paint"
    | "Mk Embroidery"
    | "Mk Gyotaku"
    | "Mk Luminogram"
    | "Mk Lite Brite Art"
    | "Mk Mokume Gane"
    | "Pebble Art"
    | "Mk Palekh"
    | "Mk Suminagashi"
    | "Mk Scrimshaw"
    | "Mk Shibori"
    | "Mk Vitreous Enamel"
    | "Mk Ukiyo E"
    | "Mk Vintage Airline Poster"
    | "Mk Vintage Travel Poster"
    | "Mk Bauhaus Style"
    | "Mk Afrofuturism"
    | "Mk Atompunk"
    | "Mk Constructivism"
    | "Mk Chicano Art"
    | "Mk De Stijl"
    | "Mk Dayak Art"
    | "Mk Fayum Portrait"
    | "Mk Illuminated Manuscript"
    | "Mk Kalighat Painting"
    | "Mk Madhubani Painting"
    | "Mk Pictorialism"
    | "Mk Pichwai Painting"
    | "Mk Patachitra Painting"
    | "Mk Samoan Art Inspired"
    | "Mk Tlingit Art"
    | "Mk Adnate Style"
    | "Mk Ron English Style"
    | "Mk Shepard Fairey Style"
  >;
  /**
   * You can choose Speed or Quality Default value: `"Extreme Speed"`
   */
  performance?: "Speed" | "Quality" | "Extreme Speed" | "Lightning";
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `4`
   */
  guidance_scale?: number;
  /**
   * The sharpness of the generated image. Use it to control how sharp the generated
   * image should be. Higher value means image and texture are sharper. Default value: `2`
   */
  sharpness?: number;
  /**
   * The size of the generated image. You can choose between some presets or
   * custom height and width that **must be multiples of 8**. Default value: `"1024x1024"`
   */
  aspect_ratio?: string;
  /**
   * Number of images to generate in one request Default value: `1`
   */
  num_images?: number;
  /**
   * The LoRAs to use for the image generation. You can use up to 5 LoRAs
   * and they will be merged together to generate the final image. Default value: `[object Object]`
   */
  loras?: Array<LoraWeight>;
  /**
   * Refiner (SDXL or SD 1.5) Default value: `"None"`
   */
  refiner_model?: "None" | "realisticVisionV60B1_v51VAE.safetensors";
  /**
   * Use 0.4 for SD1.5 realistic models; 0.667 for SD1.5 anime models
   * 0.8 for XL-refiners; or any value for switching two SDXL models. Default value: `0.8`
   */
  refiner_switch?: number;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  output_format?: "png" | "jpeg" | "webp";
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   *
   */
  image_prompt_1: ImagePrompt;
  /**
   *
   */
  image_prompt_2?: ImagePrompt;
  /**
   *
   */
  image_prompt_3?: ImagePrompt;
  /**
   *
   */
  image_prompt_4?: ImagePrompt;
  /**
   * The image to use as a reference for inpainting.
   */
  inpaint_image_url?: string | Blob | File;
  /**
   * The image to use as a mask for the generated image.
   */
  mask_image_url?: string | Blob | File;
  /**
   * The mode to use for inpainting. Default value: `"Inpaint or Outpaint (default)"`
   */
  inpaint_mode?:
    | "Inpaint or Outpaint (default)"
    | "Improve Detail (face, hand, eyes, etc.)"
    | "Modify Content (add objects, change background, etc.)";
  /**
   * Describe what you want to inpaint. Default value: `""`
   */
  inpaint_additional_prompt?: string;
  /**
   * The directions to outpaint. Default value: ``
   */
  outpaint_selections?: Array<"Left" | "Right" | "Top" | "Bottom">;
  /**
   * Mixing Image Prompt and Inpaint
   */
  mixing_image_prompt_and_inpaint?: boolean;
  /**
   * The image to upscale or vary.
   */
  uov_image_url?: string | Blob | File;
  /**
   * The method to use for upscaling or varying. Default value: `"Disabled"`
   */
  uov_method?:
    | "Disabled"
    | "Vary (Subtle)"
    | "Vary (Strong)"
    | "Upscale (1.5x)"
    | "Upscale (2x)"
    | "Upscale (Fast 2x)";
  /**
   * Mixing Image Prompt and Vary/Upscale
   */
  mixing_image_prompt_and_vary_upscale?: boolean;
  /**
   * If set to false, the safety checker will be disabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
};
export type FooocusInpaintOutput = {
  /**
   * The generated image file info.
   */
  images: Array<Image>;
  /**
   * The time taken for the generation process.
   */
  timings: Record<string, any>;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
};
export type RetoucherInput = {
  /**
   * The URL of the image to be retouched.
   */
  image_url: string | Blob | File;
  /**
   * Seed for reproducibility. Different seeds will make slightly different results.
   */
  seed?: number;
};
export type RetoucherOutput = {
  /**
   * The generated image file info.
   */
  image: Image;
  /**
   * The seed used for the generation.
   */
  seed: number;
};
export type AnyLlmOutput = {
  /**
   * Generated output
   */
  output: string;
  /**
   * Whether the output is partial
   */
  partial?: boolean;
  /**
   * Error message if an error occurred
   */
  error?: string;
};
export type AnyLlmInput = {
  /**
   * Name of the model to use. Premium models are charged at 3x the rate of standard models, they include: anthropic/claude-3.5-sonnet, anthropic/claude-3-5-haiku, google/gemini-pro-1.5, openai/gpt-4o. Default value: `"google/gemini-flash-1.5"`
   */
  model?:
    | "anthropic/claude-3.5-sonnet"
    | "anthropic/claude-3-haiku"
    | "google/gemini-pro-1.5"
    | "google/gemini-flash-1.5"
    | "google/gemini-flash-1.5-8b"
    | "openai/gpt-4o";
  /**
   * Prompt to be used for the image
   */
  prompt: string;
  /**
   * System prompt to provide context or instructions to the model
   */
  system_prompt?: string;
  /**
   * URL of the image to be processed
   */
  image_url: string | Blob | File;
};
export type AnyLlmVisionOutput = {
  /**
   * Generated output
   */
  output: string;
  /**
   * Whether the output is partial
   */
  partial?: boolean;
  /**
   * Error message if an error occurred
   */
  error?: string;
};
export type AnyLlmVisionInput = {
  /**
   * Name of the model to use. Premium models are charged at 3x the rate of standard models, they include: anthropic/claude-3.5-sonnet, anthropic/claude-3-5-haiku, google/gemini-pro-1.5, openai/gpt-4o. Default value: `"google/gemini-flash-1.5"`
   */
  model?:
    | "anthropic/claude-3.5-sonnet"
    | "anthropic/claude-3-haiku"
    | "google/gemini-pro-1.5"
    | "google/gemini-flash-1.5"
    | "google/gemini-flash-1.5-8b"
    | "openai/gpt-4o";
  /**
   * Prompt to be used for the image
   */
  prompt: string;
  /**
   * System prompt to provide context or instructions to the model
   */
  system_prompt?: string;
  /**
   * URL of the image to be processed
   */
  image_url: string | Blob | File;
};
export type Llavav1513bInput = {
  /**
   * URL of the image to be processed
   */
  image_url: string | Blob | File;
  /**
   * Prompt to be used for the image
   */
  prompt: string;
  /**
   * Maximum number of tokens to generate Default value: `64`
   */
  max_tokens?: number;
  /**
   * Temperature for sampling Default value: `0.2`
   */
  temperature?: number;
  /**
   * Top P for sampling Default value: `1`
   */
  top_p?: number;
};
export type Llavav1513bOutput = {
  /**
   * Generated output
   */
  output: string;
  /**
   * Whether the output is partial
   */
  partial?: boolean;
};
export type LlavaNextInput = {
  /**
   * URL of the image to be processed
   */
  image_url: string | Blob | File;
  /**
   * Prompt to be used for the image
   */
  prompt: string;
  /**
   * Maximum number of tokens to generate Default value: `64`
   */
  max_tokens?: number;
  /**
   * Temperature for sampling Default value: `0.2`
   */
  temperature?: number;
  /**
   * Top P for sampling Default value: `1`
   */
  top_p?: number;
};
export type LlavaNextOutput = {
  /**
   * Generated output
   */
  output: string;
  /**
   * Whether the output is partial
   */
  partial?: boolean;
};
export type ImageutilsNsfwInput = {
  /**
   * Input image url.
   */
  image_url: string | Blob | File;
};
export type ImageutilsNsfwOutput = {
  /**
   * Combined image of all detected masks
   */
  image?: Image;
};
export type FastFooocusSdxlOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type FastFooocusSdxlInput = {
  /**
   * The URL of the image to use as a starting point for the generation.
   */
  image_url: string | Blob | File;
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The negative prompt to use.Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The size of the generated image. Leave it none to automatically infer from the prompt image.
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `8`
   */
  num_inference_steps?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `2`
   */
  guidance_scale?: number;
  /**
   * determines how much the generated image resembles the initial image Default value: `0.95`
   */
  strength?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * The list of embeddings to use. Default value: ``
   */
  embeddings?: Array<Embedding>;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * The version of the safety checker to use. v1 is the default CompVis safety checker. v2 uses a custom ViT model. Default value: `"v1"`
   */
  safety_checker_version?: "v1" | "v2";
  /**
   * If set to true, the prompt will be expanded with additional prompts. Default value: `true`
   */
  expand_prompt?: boolean;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  format?: "jpeg" | "png";
  /**
   * The rescale factor for the CFG.
   */
  guidance_rescale?: number;
  /**
   * If set to true, a smaller model will try to refine the output after it was processed. Default value: `true`
   */
  enable_refiner?: boolean;
};
export type FastFooocusSdxlImageToImageOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type FastFooocusSdxlImageToImageInput = {
  /**
   * The URL of the image to use as a starting point for the generation.
   */
  image_url: string | Blob | File;
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The negative prompt to use.Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The size of the generated image. Leave it none to automatically infer from the prompt image.
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `8`
   */
  num_inference_steps?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `2`
   */
  guidance_scale?: number;
  /**
   * determines how much the generated image resembles the initial image Default value: `0.95`
   */
  strength?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * The list of embeddings to use. Default value: ``
   */
  embeddings?: Array<Embedding>;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * The version of the safety checker to use. v1 is the default CompVis safety checker. v2 uses a custom ViT model. Default value: `"v1"`
   */
  safety_checker_version?: "v1" | "v2";
  /**
   * If set to true, the prompt will be expanded with additional prompts. Default value: `true`
   */
  expand_prompt?: boolean;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  format?: "jpeg" | "png";
  /**
   * The rescale factor for the CFG.
   */
  guidance_rescale?: number;
  /**
   * If set to true, a smaller model will try to refine the output after it was processed. Default value: `true`
   */
  enable_refiner?: boolean;
};
export type FaceToStickerInput = {
  /**
   * URL of the video.
   */
  image_url: string | Blob | File;
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The negative prompt to use. Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * Increasing the amount of steps tells Stable Diffusion that it should take more steps
   * to generate your final result which can increase the amount of detail in your image. Default value: `20`
   */
  num_inference_steps?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `4.5`
   */
  guidance_scale?: number;
  /**
   * The strength of the instant ID. Default value: `0.7`
   */
  instant_id_strength?: number;
  /**
   * The weight of the IP adapter. Default value: `0.2`
   */
  ip_adapter_weight?: number;
  /**
   * The amount of noise to add to the IP adapter. Default value: `0.5`
   */
  ip_adapter_noise?: number;
  /**
   * The size of the generated image. Default value: `square_hd`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * Whether to upscale the image 2x.
   */
  upscale?: boolean;
  /**
   * The number of steps to use for upscaling. Only used if `upscale` is `true`. Default value: `10`
   */
  upscale_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * If set to false, the safety checker will be disabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
};
export type FaceToStickerOutput = {
  /**
   * The generated images.
   */
  images: Array<Image>;
  /**
   * The generated face sticker image.
   */
  sticker_image: Image;
  /**
   * The generated face sticker image with the background removed.
   */
  sticker_image_background_removed: Image;
  /**
   * Seed used during the inference.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   * The key is the image type and the value is a boolean.
   */
  has_nsfw_concepts: any;
};
export type MoondreamBatchedInput = {
  /**
   * Model ID to use for inference Default value: `"vikhyatk/moondream2"`
   */
  model_id?: "vikhyatk/moondream2" | "fal-ai/moondream2-docci";
  /**
   * List of input prompts and image URLs
   */
  inputs: Array<MoondreamInputParam>;
  /**
   * Maximum number of new tokens to generate Default value: `64`
   */
  max_tokens?: number;
  /**
   * Temperature for sampling Default value: `0.2`
   */
  temperature?: number;
  /**
   * Top P for sampling Default value: `1`
   */
  top_p?: number;
  /**
   * Repetition penalty for sampling Default value: `1`
   */
  repetition_penalty?: number;
};
export type MoondreamBatchedOutput = {
  /**
   * List of generated outputs
   */
  outputs: Array<string>;
  /**
   * Whether the output is partial
   */
  partial?: boolean;
  /**
   * Timings for different parts of the process
   */
  timings: Record<string, any>;
  /**
   * Filenames of the images processed
   */
  filenames?: Array<string>;
};
export type SadtalkerInput = {
  /**
   * URL of the source image
   */
  source_image_url: string | Blob | File;
  /**
   * URL of the driven audio
   */
  driven_audio_url: string | Blob | File;
  /**
   * URL of the reference video
   */
  reference_pose_video_url: string | Blob | File;
  /**
   * The style of the pose
   */
  pose_style?: number;
  /**
   * The resolution of the face model Default value: `"256"`
   */
  face_model_resolution?: "256" | "512";
  /**
   * The scale of the expression Default value: `1`
   */
  expression_scale?: number;
  /**
   * The type of face enhancer to use
   */
  face_enhancer?: "gfpgan";
  /**
   * Whether to use still mode. Fewer head motion, works with preprocess `full`.
   */
  still_mode?: boolean;
  /**
   * The type of preprocessing to use Default value: `"crop"`
   */
  preprocess?: "crop" | "extcrop" | "resize" | "full" | "extfull";
};
export type SadtalkerOutput = {
  /**
   * URL of the generated video
   */
  video: File;
};
export type MusetalkInput = {
  /**
   * URL of the source video
   */
  source_video_url: string | Blob | File;
  /**
   * URL of the audio
   */
  audio_url: string | Blob | File;
};
export type MusetalkOutput = {
  /**
   * The generated video file.
   */
  video: File;
};
export type SadtalkerReferenceInput = {
  /**
   * URL of the source image
   */
  source_image_url: string | Blob | File;
  /**
   * URL of the driven audio
   */
  driven_audio_url: string | Blob | File;
  /**
   * URL of the reference video
   */
  reference_pose_video_url: string | Blob | File;
  /**
   * The style of the pose
   */
  pose_style?: number;
  /**
   * The resolution of the face model Default value: `"256"`
   */
  face_model_resolution?: "256" | "512";
  /**
   * The scale of the expression Default value: `1`
   */
  expression_scale?: number;
  /**
   * The type of face enhancer to use
   */
  face_enhancer?: "gfpgan";
  /**
   * Whether to use still mode. Fewer head motion, works with preprocess `full`.
   */
  still_mode?: boolean;
  /**
   * The type of preprocessing to use Default value: `"crop"`
   */
  preprocess?: "crop" | "extcrop" | "resize" | "full" | "extfull";
};
export type SadtalkerReferenceOutput = {
  /**
   * URL of the generated video
   */
  video: File;
};
export type LayerDiffusionInput = {
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results. Default value: `""`
   */
  prompt?: string;
  /**
   * The prompt to use for generating the negative image. Be as descriptive as possible for best results. Default value: `"text, watermark"`
   */
  negative_prompt?: string;
  /**
   * The guidance scale for the model. Default value: `8`
   */
  guidance_scale?: number;
  /**
   * The number of inference steps for the model. Default value: `20`
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * If set to false, the safety checker will be disabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
};
export type LayerDiffusionOutput = {
  /**
   * The URL of the generated image.
   */
  image: Image;
  /**
   * The seed used to generate the image.
   */
  seed: number;
};
export type StableDiffusionV15Input = {
  /**
   * The URL of the image to use as a starting point for the generation.
   */
  image_url: string | Blob | File;
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The negative prompt to use.Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The size of the generated image. Default value: `square`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `25`
   */
  num_inference_steps?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `7.5`
   */
  guidance_scale?: number;
  /**
   * determines how much the generated image resembles the initial image Default value: `0.95`
   */
  strength?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * The list of LoRA weights to use. Default value: ``
   */
  loras?: Array<LoraWeight>;
  /**
   * The list of embeddings to use. Default value: ``
   */
  embeddings?: Array<Embedding>;
  /**
   * If set to true, the safety checker will be enabled.
   */
  enable_safety_checker?: boolean;
  /**
   * If set to true, the prompt will be expanded with additional prompts.
   */
  expand_prompt?: boolean;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  format?: "jpeg" | "png";
};
export type StableDiffusionV15Output = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type LoraImageToImageInput = {
  /**
   * The method to use for the sigmas. If set to 'custom', the sigmas will be set based
   * on the provided sigmas schedule in the `array` field.
   * Defaults to 'default' which means the scheduler will use the sigmas of the scheduler. Default value: `"default"`
   */
  method?: "default" | "array";
  /**
   * Sigmas schedule to be used if 'custom' method is selected. Default value: ``
   */
  array?: Array<number>;
};
export type LoraImageToImageOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The latents saved for debugging.
   */
  debug_latents?: File;
  /**
   * The latents saved for debugging per pass.
   */
  debug_per_pass_latents?: File;
};
export type FastSdxlImageToImageOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type FastSdxlImageToImageInput = {
  /**
   * The URL of the image to use as a starting point for the generation.
   */
  image_url: string | Blob | File;
  /**
   * The URL of the mask to use for inpainting.
   */
  mask_url: string | Blob | File;
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The negative prompt to use.Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The size of the generated image. Default value: `square_hd`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `25`
   */
  num_inference_steps?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `7.5`
   */
  guidance_scale?: number;
  /**
   * determines how much the generated image resembles the initial image Default value: `0.95`
   */
  strength?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * The list of LoRA weights to use. Default value: ``
   */
  loras?: Array<LoraWeight>;
  /**
   * The list of embeddings to use. Default value: ``
   */
  embeddings?: Array<Embedding>;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * The version of the safety checker to use. v1 is the default CompVis safety checker. v2 uses a custom ViT model. Default value: `"v1"`
   */
  safety_checker_version?: "v1" | "v2";
  /**
   * If set to true, the prompt will be expanded with additional prompts.
   */
  expand_prompt?: boolean;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  format?: "jpeg" | "png";
  /**
   * An id bound to a request, can be used with response to identify the request
   * itself. Default value: `""`
   */
  request_id?: string;
};
export type FastSdxlInpaintingOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type FastSdxlInpaintingInput = {
  /**
   * The URL of the image to use as a starting point for the generation.
   */
  image_url: string | Blob | File;
  /**
   * The URL of the mask to use for inpainting.
   */
  mask_url: string | Blob | File;
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The negative prompt to use.Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The size of the generated image. Default value: `square_hd`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `25`
   */
  num_inference_steps?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `7.5`
   */
  guidance_scale?: number;
  /**
   * determines how much the generated image resembles the initial image Default value: `0.95`
   */
  strength?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * The list of LoRA weights to use. Default value: ``
   */
  loras?: Array<LoraWeight>;
  /**
   * The list of embeddings to use. Default value: ``
   */
  embeddings?: Array<Embedding>;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * The version of the safety checker to use. v1 is the default CompVis safety checker. v2 uses a custom ViT model. Default value: `"v1"`
   */
  safety_checker_version?: "v1" | "v2";
  /**
   * If set to true, the prompt will be expanded with additional prompts.
   */
  expand_prompt?: boolean;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  format?: "jpeg" | "png";
  /**
   * An id bound to a request, can be used with response to identify the request
   * itself. Default value: `""`
   */
  request_id?: string;
};
export type LoraInpaintInput = {
  /**
   * The method to use for the sigmas. If set to 'custom', the sigmas will be set based
   * on the provided sigmas schedule in the `array` field.
   * Defaults to 'default' which means the scheduler will use the sigmas of the scheduler. Default value: `"default"`
   */
  method?: "default" | "array";
  /**
   * Sigmas schedule to be used if 'custom' method is selected. Default value: ``
   */
  array?: Array<number>;
};
export type LoraInpaintOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The latents saved for debugging.
   */
  debug_latents?: File;
  /**
   * The latents saved for debugging per pass.
   */
  debug_per_pass_latents?: File;
};
export type PixartSigmaInput = {
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The negative prompt to use. Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The style to apply to the image. Default value: `"(No style)"`
   */
  style?:
    | "(No style)"
    | "Cinematic"
    | "Photographic"
    | "Anime"
    | "Manga"
    | "Digital Art"
    | "Pixel art"
    | "Fantasy art"
    | "Neonpunk"
    | "3D Model";
  /**
   * The size of the generated image. Default value: `square_hd`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `35`
   */
  num_inference_steps?: number;
  /**
   * The scheduler to use for the model. Default value: `"DPM-SOLVER"`
   */
  scheduler?: "DPM-SOLVER" | "SA-SOLVER";
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `4.5`
   */
  guidance_scale?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * If set to true, the safety checker will be enabled.
   */
  enable_safety_checker?: boolean;
};
export type PixartSigmaOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   * The timings of the different steps of the generation process.
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type DreamshaperOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type DreamshaperInput = {
  /**
   * The Dreamshaper model to use.
   */
  model_name?:
    | "Lykon/dreamshaper-xl-1-0"
    | "Lykon/dreamshaper-xl-v2-turbo"
    | "Lykon/dreamshaper-8";
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The negative prompt to use.Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   *  Default value: `[object Object]`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `25`
   */
  num_inference_steps?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `7.5`
   */
  guidance_scale?: number;
  /**
   * The list of LoRA weights to use. Default value: ``
   */
  loras?: Array<LoraWeight>;
  /**
   * The list of embeddings to use. Default value: ``
   */
  embeddings?: Array<Embedding>;
  /**
   * If set to true, the prompt will be expanded with additional prompts.
   */
  expand_prompt?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  format?: "jpeg" | "png";
  /**
   * The URL of the image to use as a starting point for the generation.
   */
  image_url: string | Blob | File;
  /**
   * The URL of the mask to use for inpainting.
   */
  mask_url: string | Blob | File;
  /**
   * determines how much the generated image resembles the initial image Default value: `0.95`
   */
  strength?: number;
  /**
   * The version of the safety checker to use. v1 is the default CompVis safety checker. v2 uses a custom ViT model. Default value: `"v1"`
   */
  safety_checker_version?: "v1" | "v2";
};
export type RealisticVisionOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type RealisticVisionInput = {
  /**
   * The Realistic Vision model to use.
   */
  model_name?: string;
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The negative prompt to use.Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   *  Default value: `[object Object]`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `25`
   */
  num_inference_steps?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `7.5`
   */
  guidance_scale?: number;
  /**
   * The list of LoRA weights to use. Default value: ``
   */
  loras?: Array<LoraWeight>;
  /**
   * The list of embeddings to use. Default value: ``
   */
  embeddings?: Array<Embedding>;
  /**
   * If set to true, the prompt will be expanded with additional prompts.
   */
  expand_prompt?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  format?: "jpeg" | "png";
  /**
   * The URL of the image to use as a starting point for the generation.
   */
  image_url: string | Blob | File;
  /**
   * The URL of the mask to use for inpainting.
   */
  mask_url: string | Blob | File;
  /**
   * determines how much the generated image resembles the initial image Default value: `0.95`
   */
  strength?: number;
  /**
   * The version of the safety checker to use. v1 is the default CompVis safety checker. v2 uses a custom ViT model. Default value: `"v1"`
   */
  safety_checker_version?: "v1" | "v2";
};
export type LightningModelsInput = {
  /**
   * The Lightning model to use.
   */
  model_name?: string;
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The negative prompt to use.Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   *  Default value: `[object Object]`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `5`
   */
  num_inference_steps?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `2`
   */
  guidance_scale?: number;
  /**
   * The list of LoRA weights to use. Default value: ``
   */
  loras?: Array<LoraWeight>;
  /**
   * The list of embeddings to use. Default value: ``
   */
  embeddings?: Array<Embedding>;
  /**
   * Scheduler / sampler to use for the image denoising process.
   */
  scheduler?:
    | "DPM++ 2M"
    | "DPM++ 2M Karras"
    | "DPM++ 2M SDE"
    | "DPM++ 2M SDE Karras"
    | "DPM++ SDE"
    | "DPM++ SDE Karras"
    | "KDPM 2A"
    | "Euler"
    | "Euler (trailing timesteps)"
    | "Euler A"
    | "LCM"
    | "EDMDPMSolverMultistepScheduler"
    | "TCDScheduler";
  /**
   * If set to true, the prompt will be expanded with additional prompts.
   */
  expand_prompt?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  format?: "jpeg" | "png";
  /**
   * The URL of the image to use as a starting point for the generation.
   */
  image_url: string | Blob | File;
  /**
   * determines how much the generated image resembles the initial image Default value: `0.95`
   */
  strength?: number;
  /**
   * The version of the safety checker to use. v1 is the default CompVis safety checker. v2 uses a custom ViT model. Default value: `"v1"`
   */
  safety_checker_version?: "v1" | "v2";
};
export type LightningModelsOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type OmniZeroOutput = {
  /**
   * The generated image.
   */
  image: Image;
};
export type OmniZeroInput = {
  /**
   * Prompt to guide the image generation.
   */
  prompt: string;
  /**
   * Negative prompt to guide the image generation. Default value: `""`
   */
  negative_prompt?: string;
  /**
   * Input image url.
   */
  image_url: string | Blob | File;
  /**
   * Composition image url.
   */
  composition_image_url: string | Blob | File;
  /**
   * Style image url.
   */
  style_image_url: string | Blob | File;
  /**
   * Identity image url.
   */
  identity_image_url: string | Blob | File;
  /**
   * Image strength. Default value: `0.75`
   */
  image_strength?: number;
  /**
   * Composition strength. Default value: `1`
   */
  composition_strength?: number;
  /**
   * Depth strength. Default value: `0.5`
   */
  depth_strength?: number;
  /**
   * Style strength. Default value: `1`
   */
  style_strength?: number;
  /**
   * Face strength. Default value: `1`
   */
  face_strength?: number;
  /**
   * Identity strength. Default value: `1`
   */
  identity_strength?: number;
  /**
   * Guidance scale. Default value: `5`
   */
  guidance_scale?: number;
  /**
   * Seed. Default value: `42`
   */
  seed?: number;
  /**
   * Number of images. Default value: `1`
   */
  number_of_images?: number;
};
export type CatVtonOutput = {
  /**
   * The output image.
   */
  image: Image;
};
export type CatVtonInput = {
  /**
   * Url for the human image.
   */
  human_image_url: string | Blob | File;
  /**
   * Url to the garment image.
   */
  garment_image_url: string | Blob | File;
  /**
   * Type of the Cloth to be tried on.
   *
   * Options:
   * upper: Upper body cloth
   * lower: Lower body cloth
   * overall: Full body cloth
   * inner: Inner cloth, like T-shirt inside a jacket
   * outer: Outer cloth, like a jacket over a T-shirt
   */
  cloth_type: "upper" | "lower" | "overall" | "inner" | "outer";
  /**
   * The size of the generated image. Default value: `portrait_4_3`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `30`
   */
  num_inference_steps?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `2.5`
   */
  guidance_scale?: number;
  /**
   * The same seed and the same input given to the same version of the model
   * will output the same image every time.
   */
  seed?: number;
};
export type DwposeOutput = {
  /**
   * The predicted pose image
   */
  image: Image;
};
export type DwposeInput = {
  /**
   * URL of the image to be processed
   */
  image_url: string | Blob | File;
};
export type StableCascadeSoteDiffusionOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type StableCascadeSoteDiffusionInput = {
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The negative prompt to use. Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * Number of steps to run the first stage for. Default value: `20`
   */
  first_stage_steps?: number;
  /**
   * Number of steps to run the second stage for. Default value: `10`
   */
  second_stage_steps?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `4`
   */
  guidance_scale?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you.
   */
  second_stage_guidance_scale?: number;
  /**
   * The size of the generated image. Default value: `square_hd`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The same seed and the same prompt given to the same version of Stable Cascade
   * will output the same image every time.
   */
  seed?: number;
  /**
   * If set to false, the safety checker will be disabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * If set to true, the image will be returned as base64 encoded string.
   */
  sync_mode?: boolean;
};
export type Florence2LargeCaptionOutput = {
  /**
   * Results from the model
   */
  results: string;
};
export type Florence2LargeCaptionInput = {
  /**
   * The URL of the image to be processed.
   */
  image_url: string | Blob | File;
  /**
   * Text input for the task
   */
  text_input: string;
};
export type Florence2LargeDetailedCaptionOutput = {
  /**
   * Results from the model
   */
  results: string;
};
export type Florence2LargeDetailedCaptionInput = {
  /**
   * The URL of the image to be processed.
   */
  image_url: string | Blob | File;
  /**
   * Text input for the task
   */
  text_input: string;
};
export type Florence2LargeMoreDetailedCaptionOutput = {
  /**
   * Results from the model
   */
  results: string;
};
export type Florence2LargeMoreDetailedCaptionInput = {
  /**
   * The URL of the image to be processed.
   */
  image_url: string | Blob | File;
  /**
   * Text input for the task
   */
  text_input: string;
};
export type Florence2LargeObjectDetectionOutput = {
  /**
   * Results from the model
   */
  results: string;
};
export type Florence2LargeObjectDetectionInput = {
  /**
   * The URL of the image to be processed.
   */
  image_url: string | Blob | File;
  /**
   * Text input for the task
   */
  text_input: string;
};
export type Florence2LargeDenseRegionCaptionOutput = {
  /**
   * Results from the model
   */
  results: string;
};
export type Florence2LargeDenseRegionCaptionInput = {
  /**
   * The URL of the image to be processed.
   */
  image_url: string | Blob | File;
  /**
   * Text input for the task
   */
  text_input: string;
};
export type Florence2LargeRegionProposalOutput = {
  /**
   * Results from the model
   */
  results: string;
};
export type Florence2LargeRegionProposalInput = {
  /**
   * The URL of the image to be processed.
   */
  image_url: string | Blob | File;
  /**
   * Text input for the task
   */
  text_input: string;
};
export type Florence2LargeCaptionToPhraseGroundingOutput = {
  /**
   * Results from the model
   */
  results: string;
};
export type Florence2LargeCaptionToPhraseGroundingInput = {
  /**
   * The URL of the image to be processed.
   */
  image_url: string | Blob | File;
  /**
   * Text input for the task
   */
  text_input: string;
};
export type Florence2LargeReferringExpressionSegmentationOutput = {
  /**
   * Results from the model
   */
  results: string;
};
export type Florence2LargeReferringExpressionSegmentationInput = {
  /**
   * The URL of the image to be processed.
   */
  image_url: string | Blob | File;
  /**
   * Text input for the task
   */
  text_input: string;
};
export type Florence2LargeRegionToSegmentationOutput = {
  /**
   * Results from the model
   */
  results: string;
};
export type Florence2LargeRegionToSegmentationInput = {
  /**
   * The URL of the image to be processed.
   */
  image_url: string | Blob | File;
  /**
   * Text input for the task
   */
  text_input: string;
};
export type Florence2LargeOpenVocabularyDetectionOutput = {
  /**
   * Results from the model
   */
  results: string;
};
export type Florence2LargeOpenVocabularyDetectionInput = {
  /**
   * The URL of the image to be processed.
   */
  image_url: string | Blob | File;
  /**
   * Text input for the task
   */
  text_input: string;
};
export type Florence2LargeRegionToCategoryOutput = {
  /**
   * Results from the model
   */
  results: string;
};
export type Florence2LargeRegionToCategoryInput = {
  /**
   * The URL of the image to be processed.
   */
  image_url: string | Blob | File;
  /**
   * Text input for the task
   */
  text_input: string;
};
export type Florence2LargeRegionToDescriptionOutput = {
  /**
   * Results from the model
   */
  results: string;
};
export type Florence2LargeRegionToDescriptionInput = {
  /**
   * The URL of the image to be processed.
   */
  image_url: string | Blob | File;
  /**
   * Text input for the task
   */
  text_input: string;
};
export type Florence2LargeOcrOutput = {
  /**
   * Results from the model
   */
  results: string;
};
export type Florence2LargeOcrInput = {
  /**
   * The URL of the image to be processed.
   */
  image_url: string | Blob | File;
  /**
   * Text input for the task
   */
  text_input: string;
};
export type Florence2LargeOcrWithRegionOutput = {
  /**
   * Results from the model
   */
  results: string;
};
export type Florence2LargeOcrWithRegionInput = {
  /**
   * The URL of the image to be processed.
   */
  image_url: string | Blob | File;
  /**
   * Text input for the task
   */
  text_input: string;
};
export type Era3dOutput = {
  /**
   * Images with background removed
   */
  images: Array<Image>;
  /**
   * Normal images with background removed
   */
  normal_images: Array<Image>;
  /**
   * Seed used for random number generation
   */
  seed: number;
};
export type Era3dInput = {
  /**
   * URL of the image to remove background from
   */
  image_url: string | Blob | File;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want the model to stick to your prompt when looking for a related image to show you. Default value: `4`
   */
  cfg?: number;
  /**
   * Number of steps to run the model for Default value: `40`
   */
  steps?: number;
  /**
   * Size of the image to crop to Default value: `400`
   */
  crop_size?: number;
  /**
   * Seed for random number generation Default value: `-1`
   */
  seed?: number;
  /**
   * Background removal Default value: `true`
   */
  background_removal?: boolean;
};
export type LivePortraitOutput = {
  /**
   * The generated video file.
   */
  video: File;
};
export type LivePortraitInput = {
  /**
   * URL of the image to be animated
   */
  image_url: string | Blob | File;
  /**
   * Amount to blink the eyes
   */
  blink?: number;
  /**
   * Amount to raise or lower eyebrows
   */
  eyebrow?: number;
  /**
   * Amount to wink
   */
  wink?: number;
  /**
   * Amount to move pupils horizontally
   */
  pupil_x?: number;
  /**
   * Amount to move pupils vertically
   */
  pupil_y?: number;
  /**
   * Amount to open mouth in 'aaa' shape
   */
  aaa?: number;
  /**
   * Amount to shape mouth in 'eee' position
   */
  eee?: number;
  /**
   * Amount to shape mouth in 'woo' position
   */
  woo?: number;
  /**
   * Amount to smile
   */
  smile?: number;
  /**
   * Amount to rotate the face in pitch
   */
  rotate_pitch?: number;
  /**
   * Amount to rotate the face in yaw
   */
  rotate_yaw?: number;
  /**
   * Amount to rotate the face in roll
   */
  rotate_roll?: number;
  /**
   * Whether to paste-back/stitch the animated face cropping from the face-cropping space to the original image space. Default value: `true`
   */
  flag_pasteback?: boolean;
  /**
   * Whether to crop the source portrait to the face-cropping space. Default value: `true`
   */
  flag_do_crop?: boolean;
  /**
   * Whether to conduct the rotation when flag_do_crop is True. Default value: `true`
   */
  flag_do_rot?: boolean;
  /**
   * Size of the output image. Default value: `512`
   */
  dsize?: number;
  /**
   * Scaling factor for the face crop. Default value: `2.3`
   */
  scale?: number;
  /**
   * Horizontal offset ratio for face crop.
   */
  vx_ratio?: number;
  /**
   * Vertical offset ratio for face crop. Positive values move up, negative values move down. Default value: `-0.125`
   */
  vy_ratio?: number;
  /**
   * Whether to enable the safety checker. If enabled, the model will check if the input image contains a face before processing it.
   * The safety checker will process the input image
   */
  enable_safety_checker?: boolean;
  /**
   * Output format Default value: `"jpeg"`
   */
  output_format?: "jpeg" | "png";
};
export type LivePortraitImageOutput = {
  /**
   * The generated video file.
   */
  video: File;
};
export type LivePortraitImageInput = {
  /**
   * URL of the image to be animated
   */
  image_url: string | Blob | File;
  /**
   * Amount to blink the eyes
   */
  blink?: number;
  /**
   * Amount to raise or lower eyebrows
   */
  eyebrow?: number;
  /**
   * Amount to wink
   */
  wink?: number;
  /**
   * Amount to move pupils horizontally
   */
  pupil_x?: number;
  /**
   * Amount to move pupils vertically
   */
  pupil_y?: number;
  /**
   * Amount to open mouth in 'aaa' shape
   */
  aaa?: number;
  /**
   * Amount to shape mouth in 'eee' position
   */
  eee?: number;
  /**
   * Amount to shape mouth in 'woo' position
   */
  woo?: number;
  /**
   * Amount to smile
   */
  smile?: number;
  /**
   * Amount to rotate the face in pitch
   */
  rotate_pitch?: number;
  /**
   * Amount to rotate the face in yaw
   */
  rotate_yaw?: number;
  /**
   * Amount to rotate the face in roll
   */
  rotate_roll?: number;
  /**
   * Whether to paste-back/stitch the animated face cropping from the face-cropping space to the original image space. Default value: `true`
   */
  flag_pasteback?: boolean;
  /**
   * Whether to crop the source portrait to the face-cropping space. Default value: `true`
   */
  flag_do_crop?: boolean;
  /**
   * Whether to conduct the rotation when flag_do_crop is True. Default value: `true`
   */
  flag_do_rot?: boolean;
  /**
   * Size of the output image. Default value: `512`
   */
  dsize?: number;
  /**
   * Scaling factor for the face crop. Default value: `2.3`
   */
  scale?: number;
  /**
   * Horizontal offset ratio for face crop.
   */
  vx_ratio?: number;
  /**
   * Vertical offset ratio for face crop. Positive values move up, negative values move down. Default value: `-0.125`
   */
  vy_ratio?: number;
  /**
   * Whether to enable the safety checker. If enabled, the model will check if the input image contains a face before processing it.
   * The safety checker will process the input image
   */
  enable_safety_checker?: boolean;
  /**
   * Output format Default value: `"jpeg"`
   */
  output_format?: "jpeg" | "png";
};
export type MusePoseInput = {
  /**
   * URL of the image to animate.
   */
  image_url: string | Blob | File;
  /**
   * The URL of the video to drive the animation
   */
  video_url: string | Blob | File;
  /**
   * The resolution to use for the pose detection. Default value: `512`
   */
  dwpose_detection_resolution?: number;
  /**
   * The resolution to use for the image during pose calculation. Default value: `720`
   */
  dwpose_image_resolution?: number;
  /**
   * The frame to align the pose to.
   */
  dwpose_align_frame?: number;
  /**
   * The width of the output video. Default value: `748`
   */
  width?: number;
  /**
   * The height of the output video. Default value: `748`
   */
  height?: number;
  /**
   * The length of the output video. Default value: `300`
   */
  length?: number;
  /**
   * The video slice frame number Default value: `48`
   */
  slice?: number;
  /**
   * The video slice overlap frame number Default value: `4`
   */
  overlap?: number;
  /**
   * Classifier free guidance Default value: `3.5`
   */
  cfg?: number;
  /**
   * The seed to use for the random number generator.
   */
  seed?: number;
  /**
   * DDIM sampling steps Default value: `20`
   */
  steps?: number;
  /**
   * The frames per second of the output video.
   */
  fps?: number;
  /**
   * Number of input frames to skip. Skipping 1 effectively reduces the fps in half. Default value: `1`
   */
  skip?: number;
};
export type MusePoseOutput = {
  /**
   * The generated video with the lip sync.
   */
  video: File;
};
export type KolorsInput = {
  /**
   * The prompt to use for generating the image. Be as descriptive as possible
   * for best results.
   */
  prompt: string;
  /**
   * The negative prompt to use. Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small
   * details (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show
   * you. Default value: `5`
   */
  guidance_scale?: number;
  /**
   * The number of inference steps to perform. Default value: `50`
   */
  num_inference_steps?: number;
  /**
   * Seed
   */
  seed?: number;
  /**
   * If set to true, the function will wait for the image to be generated and
   * uploaded before returning the response. This will increase the latency of
   * the function but it allows you to get the image directly in the response
   * without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * Enable safety checker. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * The size of the generated image. Default value: `square_hd`
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The scheduler to use for the model. Default value: `"EulerDiscreteScheduler"`
   */
  scheduler?:
    | "EulerDiscreteScheduler"
    | "EulerAncestralDiscreteScheduler"
    | "DPMSolverMultistepScheduler"
    | "DPMSolverMultistepScheduler_SDE_karras"
    | "UniPCMultistepScheduler"
    | "DEISMultistepScheduler";
};
export type KolorsOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   * The timings of the different steps of the generation process.
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in
   * the input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type SdxlControlnetUnionOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type SdxlControlnetUnionInput = {
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The scale of the controlnet conditioning. Default value: `0.5`
   */
  controlnet_conditioning_scale?: number;
  /**
   * The negative prompt to use. Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The size of the generated image. Leave it none to automatically infer from the control image.
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `35`
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `7.5`
   */
  guidance_scale?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * The list of LoRA weights to use. Default value: ``
   */
  loras?: Array<LoraWeight>;
  /**
   * The list of embeddings to use. Default value: ``
   */
  embeddings?: Array<Embedding>;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * The version of the safety checker to use. v1 is the default CompVis safety checker. v2 uses a custom ViT model. Default value: `"v1"`
   */
  safety_checker_version?: "v1" | "v2";
  /**
   * If set to true, the prompt will be expanded with additional prompts.
   */
  expand_prompt?: boolean;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  format?: "jpeg" | "png";
  /**
   * An id bound to a request, can be used with response to identify the request
   * itself. Default value: `""`
   */
  request_id?: string;
  /**
   * The URL of the control image.
   */
  openpose_image_url?: string | Blob | File;
  /**
   * Whether to preprocess the openpose image. Default value: `true`
   */
  openpose_preprocess?: boolean;
  /**
   * The URL of the control image.
   */
  depth_image_url?: string | Blob | File;
  /**
   * Whether to preprocess the depth image. Default value: `true`
   */
  depth_preprocess?: boolean;
  /**
   * The URL of the control image.
   */
  teed_image_url?: string | Blob | File;
  /**
   * Whether to preprocess the teed image. Default value: `true`
   */
  teed_preprocess?: boolean;
  /**
   * The URL of the control image.
   */
  canny_image_url?: string | Blob | File;
  /**
   * Whether to preprocess the canny image. Default value: `true`
   */
  canny_preprocess?: boolean;
  /**
   * The URL of the control image.
   */
  normal_image_url?: string | Blob | File;
  /**
   * Whether to preprocess the normal image. Default value: `true`
   */
  normal_preprocess?: boolean;
  /**
   * The URL of the control image.
   */
  segmentation_image_url?: string | Blob | File;
  /**
   * Whether to preprocess the segmentation image. Default value: `true`
   */
  segmentation_preprocess?: boolean;
};
export type SdxlControlnetUnionImageToImageOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type SdxlControlnetUnionImageToImageInput = {
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The scale of the controlnet conditioning. Default value: `0.5`
   */
  controlnet_conditioning_scale?: number;
  /**
   * The negative prompt to use. Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The size of the generated image. Leave it none to automatically infer from the control image.
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `35`
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `7.5`
   */
  guidance_scale?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * The list of LoRA weights to use. Default value: ``
   */
  loras?: Array<LoraWeight>;
  /**
   * The list of embeddings to use. Default value: ``
   */
  embeddings?: Array<Embedding>;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * The version of the safety checker to use. v1 is the default CompVis safety checker. v2 uses a custom ViT model. Default value: `"v1"`
   */
  safety_checker_version?: "v1" | "v2";
  /**
   * If set to true, the prompt will be expanded with additional prompts.
   */
  expand_prompt?: boolean;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  format?: "jpeg" | "png";
  /**
   * An id bound to a request, can be used with response to identify the request
   * itself. Default value: `""`
   */
  request_id?: string;
  /**
   * The URL of the control image.
   */
  openpose_image_url?: string | Blob | File;
  /**
   * Whether to preprocess the openpose image. Default value: `true`
   */
  openpose_preprocess?: boolean;
  /**
   * The URL of the control image.
   */
  depth_image_url?: string | Blob | File;
  /**
   * Whether to preprocess the depth image. Default value: `true`
   */
  depth_preprocess?: boolean;
  /**
   * The URL of the control image.
   */
  teed_image_url?: string | Blob | File;
  /**
   * Whether to preprocess the teed image. Default value: `true`
   */
  teed_preprocess?: boolean;
  /**
   * The URL of the control image.
   */
  canny_image_url?: string | Blob | File;
  /**
   * Whether to preprocess the canny image. Default value: `true`
   */
  canny_preprocess?: boolean;
  /**
   * The URL of the control image.
   */
  normal_image_url?: string | Blob | File;
  /**
   * Whether to preprocess the normal image. Default value: `true`
   */
  normal_preprocess?: boolean;
  /**
   * The URL of the control image.
   */
  segmentation_image_url?: string | Blob | File;
  /**
   * Whether to preprocess the segmentation image. Default value: `true`
   */
  segmentation_preprocess?: boolean;
};
export type SdxlControlnetUnionInpaintingOutput = {
  /**
   * The generated image files info.
   */
  images: Array<Image>;
  /**
   *
   */
  timings: Record<string, any>;
  /**
   * Seed of the generated Image. It will be the same value of the one passed in the
   * input or the randomly generated that was used in case none was passed.
   */
  seed: number;
  /**
   * Whether the generated images contain NSFW concepts.
   */
  has_nsfw_concepts: Array<boolean>;
  /**
   * The prompt used for generating the image.
   */
  prompt: string;
};
export type SdxlControlnetUnionInpaintingInput = {
  /**
   * The prompt to use for generating the image. Be as descriptive as possible for best results.
   */
  prompt: string;
  /**
   * The scale of the controlnet conditioning. Default value: `0.5`
   */
  controlnet_conditioning_scale?: number;
  /**
   * The negative prompt to use. Use it to address details that you don't want
   * in the image. This could be colors, objects, scenery and even the small details
   * (e.g. moustache, blurry, low resolution). Default value: `""`
   */
  negative_prompt?: string;
  /**
   * The size of the generated image. Leave it none to automatically infer from the control image.
   */
  image_size?:
    | ImageSize
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * The number of inference steps to perform. Default value: `35`
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of Stable Diffusion
   * will output the same image every time.
   */
  seed?: number;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want
   * the model to stick to your prompt when looking for a related image to show you. Default value: `7.5`
   */
  guidance_scale?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded
   * before returning the response. This will increase the latency of the function but
   * it allows you to get the image directly in the response without going through the CDN.
   */
  sync_mode?: boolean;
  /**
   * The number of images to generate. Default value: `1`
   */
  num_images?: number;
  /**
   * The list of LoRA weights to use. Default value: ``
   */
  loras?: Array<LoraWeight>;
  /**
   * The list of embeddings to use. Default value: ``
   */
  embeddings?: Array<Embedding>;
  /**
   * If set to true, the safety checker will be enabled. Default value: `true`
   */
  enable_safety_checker?: boolean;
  /**
   * The version of the safety checker to use. v1 is the default CompVis safety checker. v2 uses a custom ViT model. Default value: `"v1"`
   */
  safety_checker_version?: "v1" | "v2";
  /**
   * If set to true, the prompt will be expanded with additional prompts.
   */
  expand_prompt?: boolean;
  /**
   * The format of the generated image. Default value: `"jpeg"`
   */
  format?: "jpeg" | "png";
  /**
   * An id bound to a request, can be used with response to identify the request
   * itself. Default value: `""`
   */
  request_id?: string;
  /**
   * The URL of the control image.
   */
  openpose_image_url?: string | Blob | File;
  /**
   * Whether to preprocess the openpose image. Default value: `true`
   */
  openpose_preprocess?: boolean;
  /**
   * The URL of the control image.
   */
  depth_image_url?: string | Blob | File;
  /**
   * Whether to preprocess the depth image. Default value: `true`
   */
  depth_preprocess?: boolean;
  /**
   * The URL of the control image.
   */
  teed_image_url?: string | Blob | File;
  /**
   * Whether to preprocess the teed image. Default value: `true`
   */
  teed_preprocess?: boolean;
  /**
   * The URL of the control image.
   */
  canny_image_url?: string | Blob | File;
  /**
   * Whether to preprocess the canny image. Default value: `true`
   */
  canny_preprocess?: boolean;
  /**
   * The URL of the control image.
   */
  normal_image_url?: string | Blob | File;
  /**
   * Whether to preprocess the normal image. Default value: `true`
   */
  normal_preprocess?: boolean;
  /**
   * The URL of the control image.
   */
  segmentation_image_url?: string | Blob | File;
  /**
   * Whether to preprocess the segmentation image. Default value: `true`
   */
  segmentation_preprocess?: boolean;
};
export type Sam2ImageInput = {
  /**
   * The URL of the video to be segmented.
   */
  video_url: string | Blob | File;
  /**
   * List of prompts to segment the video Default value: ``
   */
  prompts?: Array<PointPrompt>;
  /**
   * Coordinates for boxes Default value: ``
   */
  box_prompts?: Array<BoxPrompt>;
};
export type Sam2ImageOutput = {
  /**
   * Segmented image.
   */
  image: Image;
};
export type Sam2VideoInput = {
  /**
   * The URL of the video to be segmented.
   */
  video_url: string | Blob | File;
  /**
   * List of prompts to segment the video Default value: ``
   */
  prompts?: Array<PointPrompt>;
  /**
   * Coordinates for boxes Default value: ``
   */
  box_prompts?: Array<BoxPrompt>;
};
export type Sam2VideoOutput = {
  /**
   * Segmented image.
   */
  image: Image;
};
export type ImageutilsSamInput = {
  /**
   * Input image url.
   */
  image_url: string | Blob | File;
};
export type ImageutilsSamOutput = {
  /**
   * Combined image of all detected masks
   */
  image?: Image;
};
export type MiniCpmInput = {
  /**
   * URL of the video to be analyzed
   */
  video_url: string | Blob | File;
  /**
   * Prompt to be used for the video description
   */
  prompt: string;
};
export type MiniCpmOutput = {
  /**
   * Response from the model
   */
  output: string;
};
export type MiniCpmVideoInput = {
  /**
   * URL of the video to be analyzed
   */
  video_url: string | Blob | File;
  /**
   * Prompt to be used for the video description
   */
  prompt: string;
};
export type MiniCpmVideoOutput = {
  /**
   * Response from the model
   */
  output: string;
};
export type ControlnextInput = {
  /**
   * URL of the reference image.
   */
  image_url: string | Blob | File;
  /**
   * URL of the input video.
   */
  video_url: string | Blob | File;
  /**
   * Height of the output video. Default value: `1024`
   */
  height?: number;
  /**
   * Width of the output video. Default value: `576`
   */
  width?: number;
  /**
   * Guidance scale for the diffusion process. Default value: `3`
   */
  guidance_scale?: number;
  /**
   * Number of inference steps. Default value: `25`
   */
  num_inference_steps?: number;
  /**
   * Maximum number of frames to process. Default value: `240`
   */
  max_frame_num?: number;
  /**
   * Number of frames to process in each batch. Default value: `24`
   */
  batch_frames?: number;
  /**
   * Number of overlapping frames between batches. Default value: `6`
   */
  overlap?: number;
  /**
   * Stride for sampling frames from the input video. Default value: `2`
   */
  sample_stride?: number;
  /**
   * Chunk size for decoding frames. Default value: `2`
   */
  decode_chunk_size?: number;
  /**
   * Motion bucket ID for the pipeline. Default value: `127`
   */
  motion_bucket_id?: number;
  /**
   * Frames per second for the output video. Default value: `7`
   */
  fps?: number;
  /**
   * Condition scale for ControlNeXt. Default value: `1`
   */
  controlnext_cond_scale?: number;
};
export type ControlnextOutput = {
  /**
   * The generated video.
   */
  video: File;
};
export type WorkflowutilsCannyOutput = {
  /**
   * The edge map.
   */
  image: Image;
};
export type WorkflowutilsCannyInput = {
  /**
   * Input image url.
   */
  image_url: string | Blob | File;
  /**
   * Threshold for the edge map. Default value: `0.5`
   */
  threshold?: number;
  /**
   * Size of the detection. Default value: `640`
   */
  det_size_width?: number;
  /**
   * Size of the detection. Default value: `640`
   */
  det_size_height?: number;
  /**
   * Maximum number of faces to detect. Default value: `1`
   */
  max_face_num?: number;
  /**
   * URL of the model weights. Default value: `"buffalo_l"`
   */
  model_url?: string | Blob | File;
  /**
   * Sorting of the faces. Default value: `"size"`
   */
  sorting?: string;
  /**
   * Whether to run in sync mode. Default value: `true`
   */
  sync_mode?: boolean;
};
export type ImagePreprocessorsDepthAnythingV2Output = {
  /**
   * Image with lines detected using the MLSD detector
   */
  image: Image;
};
export type ImagePreprocessorsDepthAnythingV2Input = {
  /**
   * URL of the image to process
   */
  image_url: string | Blob | File;
  /**
   * The model to use for the Scribble detector Default value: `"HED"`
   */
  model?: "HED" | "PiDi";
  /**
   * Whether to use the safe version of the Scribble detector
   */
  safe?: boolean;
};
export type ImagePreprocessorsHedOutput = {
  /**
   * Image with lines detected using the MLSD detector
   */
  image: Image;
};
export type ImagePreprocessorsHedInput = {
  /**
   * URL of the image to process
   */
  image_url: string | Blob | File;
  /**
   * The model to use for the Scribble detector Default value: `"HED"`
   */
  model?: "HED" | "PiDi";
  /**
   * Whether to use the safe version of the Scribble detector
   */
  safe?: boolean;
};
export type ImagePreprocessorsLineartOutput = {
  /**
   * Image with lines detected using the MLSD detector
   */
  image: Image;
};
export type ImagePreprocessorsLineartInput = {
  /**
   * URL of the image to process
   */
  image_url: string | Blob | File;
  /**
   * The model to use for the Scribble detector Default value: `"HED"`
   */
  model?: "HED" | "PiDi";
  /**
   * Whether to use the safe version of the Scribble detector
   */
  safe?: boolean;
};
export type ImagePreprocessorsMidasOutput = {
  /**
   * Image with lines detected using the MLSD detector
   */
  image: Image;
};
export type ImagePreprocessorsMidasInput = {
  /**
   * URL of the image to process
   */
  image_url: string | Blob | File;
  /**
   * The model to use for the Scribble detector Default value: `"HED"`
   */
  model?: "HED" | "PiDi";
  /**
   * Whether to use the safe version of the Scribble detector
   */
  safe?: boolean;
};
export type ImagePreprocessorsMlsdOutput = {
  /**
   * Image with lines detected using the MLSD detector
   */
  image: Image;
};
export type ImagePreprocessorsMlsdInput = {
  /**
   * URL of the image to process
   */
  image_url: string | Blob | File;
  /**
   * The model to use for the Scribble detector Default value: `"HED"`
   */
  model?: "HED" | "PiDi";
  /**
   * Whether to use the safe version of the Scribble detector
   */
  safe?: boolean;
};
export type ImagePreprocessorsPidiOutput = {
  /**
   * Image with lines detected using the MLSD detector
   */
  image: Image;
};
export type ImagePreprocessorsPidiInput = {
  /**
   * URL of the image to process
   */
  image_url: string | Blob | File;
  /**
   * The model to use for the Scribble detector Default value: `"HED"`
   */
  model?: "HED" | "PiDi";
  /**
   * Whether to use the safe version of the Scribble detector
   */
  safe?: boolean;
};
export type ImagePreprocessorsSamOutput = {
  /**
   * Image with lines detected using the MLSD detector
   */
  image: Image;
};
export type ImagePreprocessorsSamInput = {
  /**
   * URL of the image to process
   */
  image_url: string | Blob | File;
  /**
   * The model to use for the Scribble detector Default value: `"HED"`
   */
  model?: "HED" | "PiDi";
  /**
   * Whether to use the safe version of the Scribble detector
   */
  safe?: boolean;
};
export type ImagePreprocessorsScribbleOutput = {
  /**
   * Image with lines detected using the MLSD detector
   */
  image: Image;
};
export type ImagePreprocessorsScribbleInput = {
  /**
   * URL of the image to process
   */
  image_url: string | Blob | File;
  /**
   * The model to use for the Scribble detector Default value: `"HED"`
   */
  model?: "HED" | "PiDi";
  /**
   * Whether to use the safe version of the Scribble detector
   */
  safe?: boolean;
};
export type ImagePreprocessorsTeedOutput = {
  /**
   * Image with lines detected using the MLSD detector
   */
  image: Image;
};
export type ImagePreprocessorsTeedInput = {
  /**
   * URL of the image to process
   */
  image_url: string | Blob | File;
  /**
   * The model to use for the Scribble detector Default value: `"HED"`
   */
  model?: "HED" | "PiDi";
  /**
   * Whether to use the safe version of the Scribble detector
   */
  safe?: boolean;
};
export type ImagePreprocessorsZoeOutput = {
  /**
   * Image with lines detected using the MLSD detector
   */
  image: Image;
};
export type ImagePreprocessorsZoeInput = {
  /**
   * URL of the image to process
   */
  image_url: string | Blob | File;
  /**
   * The model to use for the Scribble detector Default value: `"HED"`
   */
  model?: "HED" | "PiDi";
  /**
   * Whether to use the safe version of the Scribble detector
   */
  safe?: boolean;
};
export type F5TtsOutput = {
  /**
   * The audio file containing the generated speech.
   */
  audio_url: AudioFile;
};
export type F5TtsInput = {
  /**
   * The text to be converted to speech.
   */
  gen_text: string;
  /**
   * The URL of the reference audio file.
   */
  ref_audio_url: string | Blob | File;
  /**
   * The reference text to be used for TTS. If not provided, an ASR (Automatic Speech Recognition) model will be used to generate the reference text. Default value: `""`
   */
  ref_text?: string;
  /**
   * The name of the model to be used for TTS.
   */
  model_type: "F5-TTS" | "E2-TTS";
  /**
   * Whether to remove the silence from the audio file. Default value: `true`
   */
  remove_silence?: boolean;
};
export type EndpointTypeMap = {
  "fal-ai/flux-pro/v1.1-ultra": {
    input: FluxProV11UltraInput;
    output: FluxProV11UltraOutput;
  };
  "fal-ai/flux-lora-fast-training": {
    input: FluxLoraFastTrainingInput;
    output: FluxLoraFastTrainingOutput;
  };
  "fal-ai/recraft-v3": {
    input: RecraftV3Input;
    output: RecraftV3Output;
  };
  "fal-ai/minimax-video/image-to-video": {
    input: MinimaxVideoImageToVideoInput;
    output: MinimaxVideoImageToVideoOutput;
  };
  "fal-ai/aura-flow": {
    input: AuraFlowInput;
    output: AuraFlowOutput;
  };
  "fal-ai/flux/dev/image-to-image": {
    input: FluxDevImageToImageInput;
    output: FluxDevImageToImageOutput;
  };
  "fal-ai/flux/dev": {
    input: FluxDevInput;
    output: FluxDevOutput;
  };
  "fal-ai/flux-lora": {
    input: FluxLoraInput;
    output: FluxLoraOutput;
  };
  "fal-ai/flux/schnell": {
    input: FluxSchnellInput;
    output: FluxSchnellOutput;
  };
  "fal-ai/flux-pro/v1.1": {
    input: FluxProV11Input;
    output: FluxProV11Output;
  };
  "fal-ai/flux-pro/new": {
    input: FluxProNewInput;
    output: FluxProNewOutput;
  };
  "fal-ai/omnigen-v1": {
    input: OmnigenV1Input;
    output: OmnigenV1Output;
  };
  "fal-ai/stable-diffusion-v35-large": {
    input: StableDiffusionV35LargeInput;
    output: StableDiffusionV35LargeOutput;
  };
  "fal-ai/stable-diffusion-v35-medium": {
    input: StableDiffusionV35MediumInput;
    output: StableDiffusionV35MediumOutput;
  };
  "fal-ai/recraft-v3/create-style": {
    input: RecraftV3CreateStyleInput;
    output: RecraftV3CreateStyleOutput;
  };
  "fal-ai/flux-realism": {
    input: FluxRealismInput;
    output: FluxRealismOutput;
  };
  "fal-ai/flux-lora/inpainting": {
    input: FluxLoraInpaintingInput;
    output: FluxLoraInpaintingOutput;
  };
  "fal-ai/flux-lora/image-to-image": {
    input: FluxLoraImageToImageInput;
    output: FluxLoraImageToImageOutput;
  };
  "fal-ai/flux-general": {
    input: FluxGeneralInput;
    output: FluxGeneralOutput;
  };
  "fal-ai/flux-general/inpainting": {
    input: FluxGeneralInpaintingInput;
    output: FluxGeneralInpaintingOutput;
  };
  "fal-ai/flux-general/image-to-image": {
    input: FluxGeneralImageToImageInput;
    output: FluxGeneralImageToImageOutput;
  };
  "fal-ai/flux-general/differential-diffusion": {
    input: FluxGeneralDifferentialDiffusionInput;
    output: FluxGeneralDifferentialDiffusionOutput;
  };
  "fal-ai/flux-general/rf-inversion": {
    input: FluxGeneralRfInversionInput;
    output: FluxGeneralRfInversionOutput;
  };
  "fal-ai/iclight-v2": {
    input: IclightV2Input;
    output: IclightV2Output;
  };
  "fal-ai/flux-differential-diffusion": {
    input: FluxDifferentialDiffusionInput;
    output: FluxDifferentialDiffusionOutput;
  };
  "fal-ai/stable-diffusion-v3-medium": {
    input: StableDiffusionV3MediumInput;
    output: StableDiffusionV3MediumOutput;
  };
  "fal-ai/stable-diffusion-v3-medium/image-to-image": {
    input: StableDiffusionV3MediumImageToImageInput;
    output: StableDiffusionV3MediumImageToImageOutput;
  };
  "fal-ai/fast-sdxl": {
    input: FastSdxlInput;
    output: FastSdxlOutput;
  };
  "fal-ai/lora": {
    input: LoraInput;
    output: LoraOutput;
  };
  "fal-ai/aura-sr": {
    input: AuraSrInput;
    output: AuraSrOutput;
  };
  "fal-ai/stable-cascade": {
    input: StableCascadeInput;
    output: StableCascadeOutput;
  };
  "fal-ai/minimax-video": {
    input: MinimaxVideoInput;
    output: MinimaxVideoOutput;
  };
  "fal-ai/haiper-video-v2": {
    input: HaiperVideoV2Input;
    output: HaiperVideoV2Output;
  };
  "fal-ai/haiper-video-v2/image-to-video": {
    input: HaiperVideoV2ImageToVideoInput;
    output: HaiperVideoV2ImageToVideoOutput;
  };
  "fal-ai/mochi-v1": {
    input: MochiV1Input;
    output: MochiV1Output;
  };
  "fal-ai/luma-dream-machine": {
    input: LumaDreamMachineInput;
    output: LumaDreamMachineOutput;
  };
  "fal-ai/luma-dream-machine/image-to-video": {
    input: LumaDreamMachineImageToVideoInput;
    output: LumaDreamMachineImageToVideoOutput;
  };
  "fal-ai/kling-video/v1/standard/text-to-video": {
    input: KlingVideoV1StandardTextToVideoInput;
    output: KlingVideoV1StandardTextToVideoOutput;
  };
  "fal-ai/kling-video/v1/standard/image-to-video": {
    input: KlingVideoV1StandardImageToVideoInput;
    output: KlingVideoV1StandardImageToVideoOutput;
  };
  "fal-ai/kling-video/v1/pro/text-to-video": {
    input: KlingVideoV1ProTextToVideoInput;
    output: KlingVideoV1ProTextToVideoOutput;
  };
  "fal-ai/kling-video/v1/pro/image-to-video": {
    input: KlingVideoV1ProImageToVideoInput;
    output: KlingVideoV1ProImageToVideoOutput;
  };
  "fal-ai/cogvideox-5b": {
    input: Cogvideox5bInput;
    output: Cogvideox5bOutput;
  };
  "fal-ai/cogvideox-5b/video-to-video": {
    input: Cogvideox5bVideoToVideoInput;
    output: Cogvideox5bVideoToVideoOutput;
  };
  "fal-ai/cogvideox-5b/image-to-video": {
    input: Cogvideox5bImageToVideoInput;
    output: Cogvideox5bImageToVideoOutput;
  };
  "fal-ai/stable-video": {
    input: StableVideoInput;
    output: StableVideoOutput;
  };
  "fal-ai/fast-svd/text-to-video": {
    input: FastSvdTextToVideoInput;
    output: FastSvdTextToVideoOutput;
  };
  "fal-ai/fast-svd-lcm": {
    input: FastSvdLcmInput;
    output: FastSvdLcmOutput;
  };
  "fal-ai/birefnet": {
    input: BirefnetInput;
    output: BirefnetOutput;
  };
  "fal-ai/birefnet/v2": {
    input: BirefnetV2Input;
    output: BirefnetV2Output;
  };
  "fal-ai/fast-svd-lcm/text-to-video": {
    input: FastSvdLcmTextToVideoInput;
    output: FastSvdLcmTextToVideoOutput;
  };
  "fal-ai/creative-upscaler": {
    input: CreativeUpscalerInput;
    output: CreativeUpscalerOutput;
  };
  "fal-ai/clarity-upscaler": {
    input: ClarityUpscalerInput;
    output: ClarityUpscalerOutput;
  };
  "fal-ai/ccsr": {
    input: CcsrInput;
    output: CcsrOutput;
  };
  "fal-ai/fast-turbo-diffusion": {
    input: FastTurboDiffusionInput;
    output: FastTurboDiffusionOutput;
  };
  "fal-ai/fast-turbo-diffusion/image-to-image": {
    input: FastTurboDiffusionImageToImageInput;
    output: FastTurboDiffusionImageToImageOutput;
  };
  "fal-ai/fast-turbo-diffusion/inpainting": {
    input: FastTurboDiffusionInpaintingInput;
    output: FastTurboDiffusionInpaintingOutput;
  };
  "fal-ai/fast-lcm-diffusion": {
    input: FastLcmDiffusionInput;
    output: FastLcmDiffusionOutput;
  };
  "fal-ai/fast-lcm-diffusion/image-to-image": {
    input: FastLcmDiffusionImageToImageInput;
    output: FastLcmDiffusionImageToImageOutput;
  };
  "fal-ai/fast-lcm-diffusion/inpainting": {
    input: FastLcmDiffusionInpaintingInput;
    output: FastLcmDiffusionInpaintingOutput;
  };
  "fal-ai/whisper": {
    input: WhisperInput;
    output: WhisperOutput;
  };
  "fal-ai/wizper": {
    input: WizperInput;
    output: WizperOutput;
  };
  "fal-ai/fast-lightning-sdxl": {
    input: FastLightningSdxlInput;
    output: FastLightningSdxlOutput;
  };
  "fal-ai/fast-lightning-sdxl/image-to-image": {
    input: FastLightningSdxlImageToImageInput;
    output: FastLightningSdxlImageToImageOutput;
  };
  "fal-ai/fast-lightning-sdxl/inpainting": {
    input: FastLightningSdxlInpaintingInput;
    output: FastLightningSdxlInpaintingOutput;
  };
  "fal-ai/hyper-sdxl": {
    input: HyperSdxlInput;
    output: HyperSdxlOutput;
  };
  "fal-ai/hyper-sdxl/image-to-image": {
    input: HyperSdxlImageToImageInput;
    output: HyperSdxlImageToImageOutput;
  };
  "fal-ai/hyper-sdxl/inpainting": {
    input: HyperSdxlInpaintingInput;
    output: HyperSdxlInpaintingOutput;
  };
  "fal-ai/playground-v25": {
    input: PlaygroundV25Input;
    output: PlaygroundV25Output;
  };
  "fal-ai/playground-v25/image-to-image": {
    input: PlaygroundV25ImageToImageInput;
    output: PlaygroundV25ImageToImageOutput;
  };
  "fal-ai/playground-v25/inpainting": {
    input: PlaygroundV25InpaintingInput;
    output: PlaygroundV25InpaintingOutput;
  };
  "fal-ai/amt-interpolation": {
    input: AmtInterpolationInput;
    output: AmtInterpolationOutput;
  };
  "fal-ai/amt-interpolation/frame-interpolation": {
    input: AmtInterpolationFrameInterpolationInput;
    output: AmtInterpolationFrameInterpolationOutput;
  };
  "fal-ai/t2v-turbo": {
    input: T2vTurboInput;
    output: T2vTurboOutput;
  };
  "fal-ai/sd15-depth-controlnet": {
    input: Sd15DepthControlnetInput;
    output: Sd15DepthControlnetOutput;
  };
  "fal-ai/photomaker": {
    input: PhotomakerInput;
    output: PhotomakerOutput;
  };
  "fal-ai/lcm": {
    input: LcmInput;
    output: LcmOutput;
  };
  "fal-ai/lcm-sd15-i2i": {
    input: LcmSd15I2iInput;
    output: LcmSd15I2iOutput;
  };
  "fal-ai/fooocus": {
    input: FooocusInput;
    output: FooocusOutput;
  };
  "fal-ai/animatediff-v2v": {
    input: AnimatediffV2vInput;
    output: AnimatediffV2vOutput;
  };
  "fal-ai/animatediff-v2v/turbo": {
    input: AnimatediffV2vTurboInput;
    output: AnimatediffV2vTurboOutput;
  };
  "fal-ai/fast-animatediff/text-to-video": {
    input: FastAnimatediffTextToVideoInput;
    output: FastAnimatediffTextToVideoOutput;
  };
  "fal-ai/fast-animatediff/video-to-video": {
    input: FastAnimatediffVideoToVideoInput;
    output: FastAnimatediffVideoToVideoOutput;
  };
  "fal-ai/fast-animatediff/turbo/text-to-video": {
    input: FastAnimatediffTurboTextToVideoInput;
    output: FastAnimatediffTurboTextToVideoOutput;
  };
  "fal-ai/fast-animatediff/turbo/video-to-video": {
    input: FastAnimatediffTurboVideoToVideoInput;
    output: FastAnimatediffTurboVideoToVideoOutput;
  };
  "fal-ai/illusion-diffusion": {
    input: IllusionDiffusionInput;
    output: IllusionDiffusionOutput;
  };
  "fal-ai/imageutils/depth": {
    input: ImageutilsDepthInput;
    output: ImageutilsDepthOutput;
  };
  "fal-ai/imageutils/rembg": {
    input: ImageutilsRembgInput;
    output: ImageutilsRembgOutput;
  };
  "fal-ai/esrgan": {
    input: EsrganInput;
    output: EsrganOutput;
  };
  "fal-ai/controlnetsdxl": {
    input: ControlnetsdxlInput;
    output: ControlnetsdxlOutput;
  };
  "fal-ai/fast-sdxl-controlnet-canny": {
    input: FastSdxlControlnetCannyInput;
    output: FastSdxlControlnetCannyOutput;
  };
  "fal-ai/fast-sdxl-controlnet-canny/image-to-image": {
    input: FastSdxlControlnetCannyImageToImageInput;
    output: FastSdxlControlnetCannyImageToImageOutput;
  };
  "fal-ai/fast-sdxl-controlnet-canny/inpainting": {
    input: FastSdxlControlnetCannyInpaintingInput;
    output: FastSdxlControlnetCannyInpaintingOutput;
  };
  "fal-ai/inpaint": {
    input: InpaintInput;
    output: InpaintOutput;
  };
  "fal-ai/animatediff-sparsectrl-lcm": {
    input: AnimatediffSparsectrlLcmInput;
    output: AnimatediffSparsectrlLcmOutput;
  };
  "fal-ai/pulid": {
    input: PulidInput;
    output: PulidOutput;
  };
  "fal-ai/ip-adapter-face-id": {
    input: IpAdapterFaceIdInput;
    output: IpAdapterFaceIdOutput;
  };
  "fal-ai/imageutils/marigold-depth": {
    input: ImageutilsMarigoldDepthInput;
    output: ImageutilsMarigoldDepthOutput;
  };
  "fal-ai/stable-audio": {
    input: StableAudioInput;
    output: StableAudioOutput;
  };
  "fal-ai/diffusion-edge": {
    input: DiffusionEdgeInput;
    output: DiffusionEdgeOutput;
  };
  "fal-ai/triposr": {
    input: TriposrInput;
    output: TriposrOutput;
  };
  "fal-ai/fooocus/upscale-or-vary": {
    input: FooocusUpscaleOrVaryInput;
    output: FooocusUpscaleOrVaryOutput;
  };
  "fal-ai/fooocus/image-prompt": {
    input: FooocusImagePromptInput;
    output: FooocusImagePromptOutput;
  };
  "fal-ai/fooocus/inpaint": {
    input: FooocusInpaintInput;
    output: FooocusInpaintOutput;
  };
  "fal-ai/retoucher": {
    input: RetoucherInput;
    output: RetoucherOutput;
  };
  "fal-ai/any-llm": {
    input: AnyLlmInput;
    output: AnyLlmOutput;
  };
  "fal-ai/any-llm/vision": {
    input: AnyLlmVisionInput;
    output: AnyLlmVisionOutput;
  };
  "fal-ai/llavav15-13b": {
    input: Llavav1513bInput;
    output: Llavav1513bOutput;
  };
  "fal-ai/llava-next": {
    input: LlavaNextInput;
    output: LlavaNextOutput;
  };
  "fal-ai/imageutils/nsfw": {
    input: ImageutilsNsfwInput;
    output: ImageutilsNsfwOutput;
  };
  "fal-ai/fast-fooocus-sdxl": {
    input: FastFooocusSdxlInput;
    output: FastFooocusSdxlOutput;
  };
  "fal-ai/fast-fooocus-sdxl/image-to-image": {
    input: FastFooocusSdxlImageToImageInput;
    output: FastFooocusSdxlImageToImageOutput;
  };
  "fal-ai/face-to-sticker": {
    input: FaceToStickerInput;
    output: FaceToStickerOutput;
  };
  "fal-ai/moondream/batched": {
    input: MoondreamBatchedInput;
    output: MoondreamBatchedOutput;
  };
  "fal-ai/sadtalker": {
    input: SadtalkerInput;
    output: SadtalkerOutput;
  };
  "fal-ai/musetalk": {
    input: MusetalkInput;
    output: MusetalkOutput;
  };
  "fal-ai/sadtalker/reference": {
    input: SadtalkerReferenceInput;
    output: SadtalkerReferenceOutput;
  };
  "fal-ai/layer-diffusion": {
    input: LayerDiffusionInput;
    output: LayerDiffusionOutput;
  };
  "fal-ai/stable-diffusion-v15": {
    input: StableDiffusionV15Input;
    output: StableDiffusionV15Output;
  };
  "fal-ai/lora/image-to-image": {
    input: LoraImageToImageInput;
    output: LoraImageToImageOutput;
  };
  "fal-ai/fast-sdxl/image-to-image": {
    input: FastSdxlImageToImageInput;
    output: FastSdxlImageToImageOutput;
  };
  "fal-ai/fast-sdxl/inpainting": {
    input: FastSdxlInpaintingInput;
    output: FastSdxlInpaintingOutput;
  };
  "fal-ai/lora/inpaint": {
    input: LoraInpaintInput;
    output: LoraInpaintOutput;
  };
  "fal-ai/pixart-sigma": {
    input: PixartSigmaInput;
    output: PixartSigmaOutput;
  };
  "fal-ai/dreamshaper": {
    input: DreamshaperInput;
    output: DreamshaperOutput;
  };
  "fal-ai/realistic-vision": {
    input: RealisticVisionInput;
    output: RealisticVisionOutput;
  };
  "fal-ai/lightning-models": {
    input: LightningModelsInput;
    output: LightningModelsOutput;
  };
  "fal-ai/omni-zero": {
    input: OmniZeroInput;
    output: OmniZeroOutput;
  };
  "fal-ai/cat-vton": {
    input: CatVtonInput;
    output: CatVtonOutput;
  };
  "fal-ai/dwpose": {
    input: DwposeInput;
    output: DwposeOutput;
  };
  "fal-ai/stable-cascade/sote-diffusion": {
    input: StableCascadeSoteDiffusionInput;
    output: StableCascadeSoteDiffusionOutput;
  };
  "fal-ai/florence-2-large/caption": {
    input: Florence2LargeCaptionInput;
    output: Florence2LargeCaptionOutput;
  };
  "fal-ai/florence-2-large/detailed-caption": {
    input: Florence2LargeDetailedCaptionInput;
    output: Florence2LargeDetailedCaptionOutput;
  };
  "fal-ai/florence-2-large/more-detailed-caption": {
    input: Florence2LargeMoreDetailedCaptionInput;
    output: Florence2LargeMoreDetailedCaptionOutput;
  };
  "fal-ai/florence-2-large/object-detection": {
    input: Florence2LargeObjectDetectionInput;
    output: Florence2LargeObjectDetectionOutput;
  };
  "fal-ai/florence-2-large/dense-region-caption": {
    input: Florence2LargeDenseRegionCaptionInput;
    output: Florence2LargeDenseRegionCaptionOutput;
  };
  "fal-ai/florence-2-large/region-proposal": {
    input: Florence2LargeRegionProposalInput;
    output: Florence2LargeRegionProposalOutput;
  };
  "fal-ai/florence-2-large/caption-to-phrase-grounding": {
    input: Florence2LargeCaptionToPhraseGroundingInput;
    output: Florence2LargeCaptionToPhraseGroundingOutput;
  };
  "fal-ai/florence-2-large/referring-expression-segmentation": {
    input: Florence2LargeReferringExpressionSegmentationInput;
    output: Florence2LargeReferringExpressionSegmentationOutput;
  };
  "fal-ai/florence-2-large/region-to-segmentation": {
    input: Florence2LargeRegionToSegmentationInput;
    output: Florence2LargeRegionToSegmentationOutput;
  };
  "fal-ai/florence-2-large/open-vocabulary-detection": {
    input: Florence2LargeOpenVocabularyDetectionInput;
    output: Florence2LargeOpenVocabularyDetectionOutput;
  };
  "fal-ai/florence-2-large/region-to-category": {
    input: Florence2LargeRegionToCategoryInput;
    output: Florence2LargeRegionToCategoryOutput;
  };
  "fal-ai/florence-2-large/region-to-description": {
    input: Florence2LargeRegionToDescriptionInput;
    output: Florence2LargeRegionToDescriptionOutput;
  };
  "fal-ai/florence-2-large/ocr": {
    input: Florence2LargeOcrInput;
    output: Florence2LargeOcrOutput;
  };
  "fal-ai/florence-2-large/ocr-with-region": {
    input: Florence2LargeOcrWithRegionInput;
    output: Florence2LargeOcrWithRegionOutput;
  };
  "fal-ai/era-3d": {
    input: Era3dInput;
    output: Era3dOutput;
  };
  "fal-ai/live-portrait": {
    input: LivePortraitInput;
    output: LivePortraitOutput;
  };
  "fal-ai/live-portrait/image": {
    input: LivePortraitImageInput;
    output: LivePortraitImageOutput;
  };
  "fal-ai/muse-pose": {
    input: MusePoseInput;
    output: MusePoseOutput;
  };
  "fal-ai/kolors": {
    input: KolorsInput;
    output: KolorsOutput;
  };
  "fal-ai/sdxl-controlnet-union": {
    input: SdxlControlnetUnionInput;
    output: SdxlControlnetUnionOutput;
  };
  "fal-ai/sdxl-controlnet-union/image-to-image": {
    input: SdxlControlnetUnionImageToImageInput;
    output: SdxlControlnetUnionImageToImageOutput;
  };
  "fal-ai/sdxl-controlnet-union/inpainting": {
    input: SdxlControlnetUnionInpaintingInput;
    output: SdxlControlnetUnionInpaintingOutput;
  };
  "fal-ai/sam2/image": {
    input: Sam2ImageInput;
    output: Sam2ImageOutput;
  };
  "fal-ai/sam2/video": {
    input: Sam2VideoInput;
    output: Sam2VideoOutput;
  };
  "fal-ai/imageutils/sam": {
    input: ImageutilsSamInput;
    output: ImageutilsSamOutput;
  };
  "fal-ai/mini-cpm": {
    input: MiniCpmInput;
    output: MiniCpmOutput;
  };
  "fal-ai/mini-cpm/video": {
    input: MiniCpmVideoInput;
    output: MiniCpmVideoOutput;
  };
  "fal-ai/controlnext": {
    input: ControlnextInput;
    output: ControlnextOutput;
  };
  "fal-ai/workflowutils/canny": {
    input: WorkflowutilsCannyInput;
    output: WorkflowutilsCannyOutput;
  };
  "fal-ai/image-preprocessors/depth-anything/v2": {
    input: ImagePreprocessorsDepthAnythingV2Input;
    output: ImagePreprocessorsDepthAnythingV2Output;
  };
  "fal-ai/image-preprocessors/hed": {
    input: ImagePreprocessorsHedInput;
    output: ImagePreprocessorsHedOutput;
  };
  "fal-ai/image-preprocessors/lineart": {
    input: ImagePreprocessorsLineartInput;
    output: ImagePreprocessorsLineartOutput;
  };
  "fal-ai/image-preprocessors/midas": {
    input: ImagePreprocessorsMidasInput;
    output: ImagePreprocessorsMidasOutput;
  };
  "fal-ai/image-preprocessors/mlsd": {
    input: ImagePreprocessorsMlsdInput;
    output: ImagePreprocessorsMlsdOutput;
  };
  "fal-ai/image-preprocessors/pidi": {
    input: ImagePreprocessorsPidiInput;
    output: ImagePreprocessorsPidiOutput;
  };
  "fal-ai/image-preprocessors/sam": {
    input: ImagePreprocessorsSamInput;
    output: ImagePreprocessorsSamOutput;
  };
  "fal-ai/image-preprocessors/scribble": {
    input: ImagePreprocessorsScribbleInput;
    output: ImagePreprocessorsScribbleOutput;
  };
  "fal-ai/image-preprocessors/teed": {
    input: ImagePreprocessorsTeedInput;
    output: ImagePreprocessorsTeedOutput;
  };
  "fal-ai/image-preprocessors/zoe": {
    input: ImagePreprocessorsZoeInput;
    output: ImagePreprocessorsZoeOutput;
  };
  "fal-ai/f5-tts": {
    input: F5TtsInput;
    output: F5TtsOutput;
  };
};
