// AUTO-GENERATED - Do not edit manually
// Generated from types.gen.ts via scripts/generate-endpoint-maps.ts

import type {
  AiAvatarInput,
  AiAvatarMultiInput,
  AiAvatarMultiOutput,
  AiAvatarMultiTextInput,
  AiAvatarMultiTextOutput,
  AiAvatarOutput,
  AiAvatarSingleTextInput,
  AiAvatarSingleTextOutput,
  AmtInterpolationFrameInterpolationInput,
  AmtInterpolationFrameInterpolationOutput,
  AmtInterpolationInput,
  AmtInterpolationOutput,
  AnimatediffSparsectrlLcmInput,
  AnimatediffSparsectrlLcmOutput,
  AutoCaptionInput,
  AutoCaptionOutput,
  AvatarsAudioToVideoInput,
  AvatarsAudioToVideoInputType2,
  AvatarsAudioToVideoOutput,
  AvatarsAudioToVideoOutputType2,
  AvatarsTextToVideoInput,
  AvatarsTextToVideoInputType2,
  AvatarsTextToVideoOutput,
  AvatarsTextToVideoOutputType2,
  BenV2VideoInput,
  BenV2VideoOutput,
  BirefnetV2VideoInput,
  BirefnetV2VideoOutput,
  BriaVideoEraserEraseKeypointsInput,
  BriaVideoEraserEraseKeypointsOutput,
  BriaVideoEraserEraseMaskInput,
  BriaVideoEraserEraseMaskOutput,
  BriaVideoEraserErasePromptInput,
  BriaVideoEraserErasePromptOutput,
  BytedanceDreamactorV2Input,
  BytedanceDreamactorV2Output,
  BytedanceOmnihumanInput,
  BytedanceOmnihumanOutput,
  BytedanceOmnihumanV15Input,
  BytedanceOmnihumanV15Output,
  BytedanceSeedanceV15ProImageToVideoInput,
  BytedanceSeedanceV15ProImageToVideoOutput,
  BytedanceSeedanceV15ProTextToVideoInput,
  BytedanceSeedanceV15ProTextToVideoOutput,
  BytedanceSeedanceV1LiteImageToVideoInput,
  BytedanceSeedanceV1LiteImageToVideoOutput,
  BytedanceSeedanceV1LiteReferenceToVideoInput,
  BytedanceSeedanceV1LiteReferenceToVideoOutput,
  BytedanceSeedanceV1LiteTextToVideoInput,
  BytedanceSeedanceV1LiteTextToVideoOutput,
  BytedanceSeedanceV1ProFastImageToVideoInput,
  BytedanceSeedanceV1ProFastImageToVideoOutput,
  BytedanceSeedanceV1ProFastTextToVideoInput,
  BytedanceSeedanceV1ProFastTextToVideoOutput,
  BytedanceSeedanceV1ProImageToVideoInput,
  BytedanceSeedanceV1ProImageToVideoOutput,
  BytedanceSeedanceV1ProTextToVideoInput,
  BytedanceSeedanceV1ProTextToVideoOutput,
  BytedanceUpscalerUpscaleVideoInput,
  BytedanceUpscalerUpscaleVideoOutput,
  BytedanceVideoStylizeInput,
  BytedanceVideoStylizeOutput,
  Cogvideox5bImageToVideoInput,
  Cogvideox5bImageToVideoOutput,
  Cogvideox5bInput,
  Cogvideox5bOutput,
  Cogvideox5bVideoToVideoInput,
  Cogvideox5bVideoToVideoOutput,
  ControlnextInput,
  ControlnextOutput,
  CosmosPredict25DistilledTextToVideoInput,
  CosmosPredict25DistilledTextToVideoOutput,
  CosmosPredict25ImageToVideoInput,
  CosmosPredict25ImageToVideoOutput,
  CosmosPredict25TextToVideoInput,
  CosmosPredict25TextToVideoOutput,
  CosmosPredict25VideoToVideoInput,
  CosmosPredict25VideoToVideoOutput,
  CreatifyAuroraInput,
  CreatifyAuroraOutput,
  CrystalVideoUpscalerInput,
  CrystalVideoUpscalerOutput,
  DavinciMagihumanInput,
  DavinciMagihumanOutput,
  DepthAnythingVideoInput,
  DepthAnythingVideoOutput,
  DubbingInput,
  DubbingOutput,
  DwposeVideoInput,
  DwposeVideoOutput,
  EchomimicV3Input,
  EchomimicV3Output,
  EdittoInput,
  EdittoOutput,
  ElevenlabsDubbingInput,
  ElevenlabsDubbingOutput,
  Fabric10FastInput,
  Fabric10FastOutput,
  Fabric10Input,
  Fabric10Output,
  Fabric10TextInput,
  Fabric10TextOutput,
  FastAnimatediffTextToVideoInput,
  FastAnimatediffTextToVideoOutput,
  FastAnimatediffTurboTextToVideoInput,
  FastAnimatediffTurboTextToVideoOutput,
  FastAnimatediffTurboVideoToVideoInput,
  FastAnimatediffTurboVideoToVideoOutput,
  FastAnimatediffVideoToVideoInput,
  FastAnimatediffVideoToVideoOutput,
  FastSvdLcmInput,
  FastSvdLcmOutput,
  FastSvdLcmTextToVideoInput,
  FastSvdLcmTextToVideoOutput,
  FastSvdTextToVideoInput,
  FastSvdTextToVideoOutput,
  FfmpegApiComposeInput,
  FfmpegApiComposeOutput,
  FfmpegApiMergeAudioVideoInput,
  FfmpegApiMergeAudioVideoOutput,
  FfmpegApiMergeVideosInput,
  FfmpegApiMergeVideosOutput,
  FilmVideoInput,
  FilmVideoOutput,
  FlashvsrUpscaleVideoInput,
  FlashvsrUpscaleVideoOutput,
  FramepackF1Input,
  FramepackF1Output,
  FramepackFlf2vInput,
  FramepackFlf2vOutput,
  FramepackInput,
  FramepackOutput,
  GoalForceInput,
  GoalForceOutput,
  GrokImagineVideoEditVideoInput,
  GrokImagineVideoEditVideoOutput,
  GrokImagineVideoExtendVideoInput,
  GrokImagineVideoExtendVideoOutput,
  GrokImagineVideoImageToVideoInput,
  GrokImagineVideoImageToVideoOutput,
  GrokImagineVideoReferenceToVideoInput,
  GrokImagineVideoReferenceToVideoOutput,
  GrokImagineVideoTextToVideoInput,
  GrokImagineVideoTextToVideoOutput,
  HeygenAvatar3DigitalTwinInput,
  HeygenAvatar3DigitalTwinOutput,
  HeygenAvatar4DigitalTwinInput,
  HeygenAvatar4DigitalTwinOutput,
  HeygenAvatar4ImageToVideoInput,
  HeygenAvatar4ImageToVideoOutput,
  HeygenV2TranslatePrecisionInput,
  HeygenV2TranslatePrecisionOutput,
  HeygenV2TranslateSpeedInput,
  HeygenV2TranslateSpeedOutput,
  HeygenV2VideoAgentInput,
  HeygenV2VideoAgentOutput,
  HunyuanAvatarInput,
  HunyuanAvatarOutput,
  HunyuanCustomInput,
  HunyuanCustomOutput,
  HunyuanPortraitInput,
  HunyuanPortraitOutput,
  HunyuanVideoFoleyInput,
  HunyuanVideoFoleyOutput,
  HunyuanVideoImageToVideoInput,
  HunyuanVideoImageToVideoOutput,
  HunyuanVideoImg2VidLoraInput,
  HunyuanVideoImg2VidLoraOutput,
  HunyuanVideoInput,
  HunyuanVideoLoraInput,
  HunyuanVideoLoraOutput,
  HunyuanVideoLoraVideoToVideoInput,
  HunyuanVideoLoraVideoToVideoOutput,
  HunyuanVideoOutput,
  HunyuanVideoV15ImageToVideoInput,
  HunyuanVideoV15ImageToVideoOutput,
  HunyuanVideoV15TextToVideoInput,
  HunyuanVideoV15TextToVideoOutput,
  HunyuanVideoVideoToVideoInput,
  HunyuanVideoVideoToVideoOutput,
  InfinitalkInput,
  InfinitalkOutput,
  InfinitalkSingleTextInput,
  InfinitalkSingleTextOutput,
  InfinitalkVideoToVideoInput,
  InfinitalkVideoToVideoOutput,
  InfinityStarTextToVideoInput,
  InfinityStarTextToVideoOutput,
  Kandinsky5ProImageToVideoInput,
  Kandinsky5ProImageToVideoOutput,
  Kandinsky5ProTextToVideoInput,
  Kandinsky5ProTextToVideoOutput,
  Kandinsky5TextToVideoDistillInput,
  Kandinsky5TextToVideoDistillOutput,
  Kandinsky5TextToVideoInput,
  Kandinsky5TextToVideoOutput,
  KlingVideoAiAvatarV2ProInput,
  KlingVideoAiAvatarV2ProOutput,
  KlingVideoAiAvatarV2StandardInput,
  KlingVideoAiAvatarV2StandardOutput,
  KlingVideoLipsyncAudioToVideoInput,
  KlingVideoLipsyncAudioToVideoOutput,
  KlingVideoLipsyncTextToVideoInput,
  KlingVideoLipsyncTextToVideoOutput,
  KlingVideoO1ImageToVideoInput,
  KlingVideoO1ImageToVideoOutput,
  KlingVideoO1ReferenceToVideoInput,
  KlingVideoO1ReferenceToVideoOutput,
  KlingVideoO1StandardImageToVideoInput,
  KlingVideoO1StandardImageToVideoOutput,
  KlingVideoO1StandardReferenceToVideoInput,
  KlingVideoO1StandardReferenceToVideoOutput,
  KlingVideoO1StandardVideoToVideoEditInput,
  KlingVideoO1StandardVideoToVideoEditOutput,
  KlingVideoO1StandardVideoToVideoReferenceInput,
  KlingVideoO1StandardVideoToVideoReferenceOutput,
  KlingVideoO1VideoToVideoEditInput,
  KlingVideoO1VideoToVideoEditOutput,
  KlingVideoO1VideoToVideoReferenceInput,
  KlingVideoO1VideoToVideoReferenceOutput,
  KlingVideoO3ProImageToVideoInput,
  KlingVideoO3ProImageToVideoOutput,
  KlingVideoO3ProReferenceToVideoInput,
  KlingVideoO3ProReferenceToVideoOutput,
  KlingVideoO3ProTextToVideoInput,
  KlingVideoO3ProTextToVideoOutput,
  KlingVideoO3ProVideoToVideoEditInput,
  KlingVideoO3ProVideoToVideoEditOutput,
  KlingVideoO3ProVideoToVideoReferenceInput,
  KlingVideoO3ProVideoToVideoReferenceOutput,
  KlingVideoO3StandardImageToVideoInput,
  KlingVideoO3StandardImageToVideoOutput,
  KlingVideoO3StandardReferenceToVideoInput,
  KlingVideoO3StandardReferenceToVideoOutput,
  KlingVideoO3StandardTextToVideoInput,
  KlingVideoO3StandardTextToVideoOutput,
  KlingVideoO3StandardVideoToVideoEditInput,
  KlingVideoO3StandardVideoToVideoEditOutput,
  KlingVideoO3StandardVideoToVideoReferenceInput,
  KlingVideoO3StandardVideoToVideoReferenceOutput,
  KlingVideoV15ProEffectsInput,
  KlingVideoV15ProEffectsOutput,
  KlingVideoV15ProImageToVideoInput,
  KlingVideoV15ProImageToVideoOutput,
  KlingVideoV15ProTextToVideoInput,
  KlingVideoV15ProTextToVideoOutput,
  KlingVideoV16ProEffectsInput,
  KlingVideoV16ProEffectsOutput,
  KlingVideoV16ProElementsInput,
  KlingVideoV16ProElementsOutput,
  KlingVideoV16ProImageToVideoInput,
  KlingVideoV16ProImageToVideoOutput,
  KlingVideoV16ProTextToVideoInput,
  KlingVideoV16ProTextToVideoOutput,
  KlingVideoV16StandardEffectsInput,
  KlingVideoV16StandardEffectsOutput,
  KlingVideoV16StandardElementsInput,
  KlingVideoV16StandardElementsOutput,
  KlingVideoV16StandardImageToVideoInput,
  KlingVideoV16StandardImageToVideoOutput,
  KlingVideoV16StandardTextToVideoInput,
  KlingVideoV16StandardTextToVideoOutput,
  KlingVideoV1ProAiAvatarInput,
  KlingVideoV1ProAiAvatarOutput,
  KlingVideoV1StandardAiAvatarInput,
  KlingVideoV1StandardAiAvatarOutput,
  KlingVideoV1StandardEffectsInput,
  KlingVideoV1StandardEffectsOutput,
  KlingVideoV1StandardImageToVideoInput,
  KlingVideoV1StandardImageToVideoOutput,
  KlingVideoV1StandardTextToVideoInput,
  KlingVideoV1StandardTextToVideoOutput,
  KlingVideoV21MasterImageToVideoInput,
  KlingVideoV21MasterImageToVideoOutput,
  KlingVideoV21MasterTextToVideoInput,
  KlingVideoV21MasterTextToVideoOutput,
  KlingVideoV21ProImageToVideoInput,
  KlingVideoV21ProImageToVideoOutput,
  KlingVideoV21StandardImageToVideoInput,
  KlingVideoV21StandardImageToVideoOutput,
  KlingVideoV25TurboProImageToVideoInput,
  KlingVideoV25TurboProImageToVideoOutput,
  KlingVideoV25TurboProTextToVideoInput,
  KlingVideoV25TurboProTextToVideoOutput,
  KlingVideoV25TurboStandardImageToVideoInput,
  KlingVideoV25TurboStandardImageToVideoOutput,
  KlingVideoV26ProImageToVideoInput,
  KlingVideoV26ProImageToVideoOutput,
  KlingVideoV26ProMotionControlInput,
  KlingVideoV26ProMotionControlOutput,
  KlingVideoV26ProTextToVideoInput,
  KlingVideoV26ProTextToVideoOutput,
  KlingVideoV26StandardMotionControlInput,
  KlingVideoV26StandardMotionControlOutput,
  KlingVideoV2MasterImageToVideoInput,
  KlingVideoV2MasterImageToVideoOutput,
  KlingVideoV2MasterTextToVideoInput,
  KlingVideoV2MasterTextToVideoOutput,
  KlingVideoV3ProImageToVideoInput,
  KlingVideoV3ProImageToVideoOutput,
  KlingVideoV3ProMotionControlInput,
  KlingVideoV3ProMotionControlOutput,
  KlingVideoV3ProTextToVideoInput,
  KlingVideoV3ProTextToVideoOutput,
  KlingVideoV3StandardImageToVideoInput,
  KlingVideoV3StandardImageToVideoOutput,
  KlingVideoV3StandardMotionControlInput,
  KlingVideoV3StandardMotionControlOutput,
  KlingVideoV3StandardTextToVideoInput,
  KlingVideoV3StandardTextToVideoOutput,
  KreaWan14bTextToVideoInput,
  KreaWan14bTextToVideoOutput,
  KreaWan14bVideoToVideoInput,
  KreaWan14bVideoToVideoOutput,
  LatentsyncInput,
  LatentsyncOutput,
  LightxRecameraInput,
  LightxRecameraOutput,
  LightxRelightInput,
  LightxRelightOutput,
  LipsyncInput,
  LipsyncOutput,
  LiveAvatarInput,
  LiveAvatarOutput,
  LivePortraitInput,
  LivePortraitOutput,
  LongcatMultiAvatarImageAudioToVideoInput,
  LongcatMultiAvatarImageAudioToVideoOutput,
  LongcatSingleAvatarAudioToVideoInput,
  LongcatSingleAvatarAudioToVideoOutput,
  LongcatSingleAvatarImageAudioToVideoInput,
  LongcatSingleAvatarImageAudioToVideoOutput,
  LongcatVideoDistilledImageToVideo480pInput,
  LongcatVideoDistilledImageToVideo480pOutput,
  LongcatVideoDistilledImageToVideo720pInput,
  LongcatVideoDistilledImageToVideo720pOutput,
  LongcatVideoDistilledTextToVideo480pInput,
  LongcatVideoDistilledTextToVideo480pOutput,
  LongcatVideoDistilledTextToVideo720pInput,
  LongcatVideoDistilledTextToVideo720pOutput,
  LongcatVideoImageToVideo480pInput,
  LongcatVideoImageToVideo480pOutput,
  LongcatVideoImageToVideo720pInput,
  LongcatVideoImageToVideo720pOutput,
  LongcatVideoTextToVideo480pInput,
  LongcatVideoTextToVideo480pOutput,
  LongcatVideoTextToVideo720pInput,
  LongcatVideoTextToVideo720pOutput,
  Ltx219bAudioToVideoInput,
  Ltx219bAudioToVideoLoraInput,
  Ltx219bAudioToVideoLoraOutput,
  Ltx219bAudioToVideoOutput,
  Ltx219bDistilledAudioToVideoInput,
  Ltx219bDistilledAudioToVideoLoraInput,
  Ltx219bDistilledAudioToVideoLoraOutput,
  Ltx219bDistilledAudioToVideoOutput,
  Ltx219bDistilledExtendVideoInput,
  Ltx219bDistilledExtendVideoLoraInput,
  Ltx219bDistilledExtendVideoLoraOutput,
  Ltx219bDistilledExtendVideoOutput,
  Ltx219bDistilledImageToVideoInput,
  Ltx219bDistilledImageToVideoLoraInput,
  Ltx219bDistilledImageToVideoLoraOutput,
  Ltx219bDistilledImageToVideoOutput,
  Ltx219bDistilledTextToVideoInput,
  Ltx219bDistilledTextToVideoLoraInput,
  Ltx219bDistilledTextToVideoLoraOutput,
  Ltx219bDistilledTextToVideoOutput,
  Ltx219bDistilledVideoToVideoInput,
  Ltx219bDistilledVideoToVideoLoraInput,
  Ltx219bDistilledVideoToVideoLoraOutput,
  Ltx219bDistilledVideoToVideoOutput,
  Ltx219bExtendVideoInput,
  Ltx219bExtendVideoLoraInput,
  Ltx219bExtendVideoLoraOutput,
  Ltx219bExtendVideoOutput,
  Ltx219bImageToVideoInput,
  Ltx219bImageToVideoLoraInput,
  Ltx219bImageToVideoLoraOutput,
  Ltx219bImageToVideoOutput,
  Ltx219bTextToVideoInput,
  Ltx219bTextToVideoLoraInput,
  Ltx219bTextToVideoLoraOutput,
  Ltx219bTextToVideoOutput,
  Ltx219bVideoToVideoInput,
  Ltx219bVideoToVideoLoraInput,
  Ltx219bVideoToVideoLoraOutput,
  Ltx219bVideoToVideoOutput,
  Ltx2322bAudioToVideoInput,
  Ltx2322bAudioToVideoLoraInput,
  Ltx2322bAudioToVideoLoraOutput,
  Ltx2322bAudioToVideoOutput,
  Ltx2322bDistilledAudioToVideoInput,
  Ltx2322bDistilledAudioToVideoLoraInput,
  Ltx2322bDistilledAudioToVideoLoraOutput,
  Ltx2322bDistilledAudioToVideoOutput,
  Ltx2322bDistilledImageToVideoInput,
  Ltx2322bDistilledImageToVideoLoraInput,
  Ltx2322bDistilledImageToVideoLoraOutput,
  Ltx2322bDistilledImageToVideoOutput,
  Ltx2322bDistilledReferenceVideoToVideoInput,
  Ltx2322bDistilledReferenceVideoToVideoLoraInput,
  Ltx2322bDistilledReferenceVideoToVideoLoraOutput,
  Ltx2322bDistilledReferenceVideoToVideoOutput,
  Ltx2322bDistilledTextToVideoInput,
  Ltx2322bDistilledTextToVideoLoraInput,
  Ltx2322bDistilledTextToVideoLoraOutput,
  Ltx2322bDistilledTextToVideoOutput,
  Ltx2322bDistilledVideoToVideoInput,
  Ltx2322bDistilledVideoToVideoLoraInput,
  Ltx2322bDistilledVideoToVideoLoraOutput,
  Ltx2322bDistilledVideoToVideoOutput,
  Ltx2322bExtendVideoInput,
  Ltx2322bExtendVideoLoraInput,
  Ltx2322bExtendVideoLoraOutput,
  Ltx2322bExtendVideoOutput,
  Ltx2322bImageToVideoInput,
  Ltx2322bImageToVideoLoraInput,
  Ltx2322bImageToVideoLoraOutput,
  Ltx2322bImageToVideoOutput,
  Ltx2322bReferenceVideoToVideoInput,
  Ltx2322bReferenceVideoToVideoLoraInput,
  Ltx2322bReferenceVideoToVideoLoraOutput,
  Ltx2322bReferenceVideoToVideoOutput,
  Ltx2322bTextToVideoInput,
  Ltx2322bTextToVideoLoraInput,
  Ltx2322bTextToVideoLoraOutput,
  Ltx2322bTextToVideoOutput,
  Ltx2322bVideoToVideoInput,
  Ltx2322bVideoToVideoLoraInput,
  Ltx2322bVideoToVideoLoraOutput,
  Ltx2322bVideoToVideoOutput,
  Ltx23AudioToVideoInput,
  Ltx23AudioToVideoOutput,
  Ltx23ExtendVideoInput,
  Ltx23ExtendVideoOutput,
  Ltx23ImageToVideoFastInput,
  Ltx23ImageToVideoFastOutput,
  Ltx23ImageToVideoInput,
  Ltx23ImageToVideoOutput,
  Ltx23RetakeVideoInput,
  Ltx23RetakeVideoOutput,
  Ltx23TextToVideoFastInput,
  Ltx23TextToVideoFastOutput,
  Ltx23TextToVideoInput,
  Ltx23TextToVideoOutput,
  Ltx2AudioToVideoInput,
  Ltx2AudioToVideoOutput,
  Ltx2ExtendVideoInput,
  Ltx2ExtendVideoOutput,
  Ltx2ImageToVideoFastInput,
  Ltx2ImageToVideoFastOutput,
  Ltx2ImageToVideoInput,
  Ltx2ImageToVideoOutput,
  Ltx2RetakeVideoInput,
  Ltx2RetakeVideoOutput,
  Ltx2TextToVideoFastInput,
  Ltx2TextToVideoFastOutput,
  Ltx2TextToVideoInput,
  Ltx2TextToVideoOutput,
  LtxVideo13bDevExtendInput,
  LtxVideo13bDevExtendOutput,
  LtxVideo13bDevImageToVideoInput,
  LtxVideo13bDevImageToVideoOutput,
  LtxVideo13bDevInput,
  LtxVideo13bDevMulticonditioningInput,
  LtxVideo13bDevMulticonditioningOutput,
  LtxVideo13bDevOutput,
  LtxVideo13bDistilledExtendInput,
  LtxVideo13bDistilledExtendOutput,
  LtxVideo13bDistilledImageToVideoInput,
  LtxVideo13bDistilledImageToVideoOutput,
  LtxVideo13bDistilledInput,
  LtxVideo13bDistilledMulticonditioningInput,
  LtxVideo13bDistilledMulticonditioningOutput,
  LtxVideo13bDistilledOutput,
  LtxVideoImageToVideoInput,
  LtxVideoImageToVideoOutput,
  LtxVideoInput,
  LtxVideoLoraImageToVideoInput,
  LtxVideoLoraImageToVideoOutput,
  LtxVideoLoraMulticonditioningInput,
  LtxVideoLoraMulticonditioningOutput,
  LtxVideoOutput,
  LtxVideoV095ExtendInput,
  LtxVideoV095ExtendOutput,
  LtxVideoV095Input,
  LtxVideoV095MulticonditioningInput,
  LtxVideoV095MulticonditioningOutput,
  LtxVideoV095Output,
  Ltxv13B098DistilledExtendInput,
  Ltxv13B098DistilledExtendOutput,
  Ltxv13B098DistilledImageToVideoInput,
  Ltxv13B098DistilledImageToVideoOutput,
  Ltxv13B098DistilledInput,
  Ltxv13B098DistilledMulticonditioningInput,
  Ltxv13B098DistilledMulticonditioningOutput,
  Ltxv13B098DistilledOutput,
  LucyEditProInput,
  LucyEditProOutput,
  LucyI2vInput,
  LucyI2vOutput,
  LucyRestyleInput,
  LucyRestyleOutput,
  LumaDreamMachineRay2FlashImageToVideoInput,
  LumaDreamMachineRay2FlashImageToVideoOutput,
  LumaDreamMachineRay2FlashInput,
  LumaDreamMachineRay2FlashModifyInput,
  LumaDreamMachineRay2FlashModifyOutput,
  LumaDreamMachineRay2FlashOutput,
  LumaDreamMachineRay2FlashReframeInput,
  LumaDreamMachineRay2FlashReframeOutput,
  LumaDreamMachineRay2ImageToVideoInput,
  LumaDreamMachineRay2ImageToVideoOutput,
  LumaDreamMachineRay2Input,
  LumaDreamMachineRay2ModifyInput,
  LumaDreamMachineRay2ModifyOutput,
  LumaDreamMachineRay2Output,
  LumaDreamMachineRay2ReframeInput,
  LumaDreamMachineRay2ReframeOutput,
  LynxInput,
  LynxOutput,
  MagiDistilledExtendVideoInput,
  MagiDistilledExtendVideoOutput,
  MagiDistilledImageToVideoInput,
  MagiDistilledImageToVideoOutput,
  MagiDistilledInput,
  MagiDistilledOutput,
  MagiExtendVideoInput,
  MagiExtendVideoOutput,
  MagiImageToVideoInput,
  MagiImageToVideoOutput,
  MagiInput,
  MagiOutput,
  MareyI2vInput,
  MareyI2vOutput,
  MareyMotionTransferInput,
  MareyMotionTransferOutput,
  MareyPoseTransferInput,
  MareyPoseTransferOutput,
  MareyT2vInput,
  MareyT2vOutput,
  MinimaxHailuo02FastImageToVideoInput,
  MinimaxHailuo02FastImageToVideoOutput,
  MinimaxHailuo02ProImageToVideoInput,
  MinimaxHailuo02ProImageToVideoOutput,
  MinimaxHailuo02ProTextToVideoInput,
  MinimaxHailuo02ProTextToVideoOutput,
  MinimaxHailuo02StandardImageToVideoInput,
  MinimaxHailuo02StandardImageToVideoOutput,
  MinimaxHailuo02StandardTextToVideoInput,
  MinimaxHailuo02StandardTextToVideoOutput,
  MinimaxHailuo23FastProImageToVideoInput,
  MinimaxHailuo23FastProImageToVideoOutput,
  MinimaxHailuo23FastStandardImageToVideoInput,
  MinimaxHailuo23FastStandardImageToVideoOutput,
  MinimaxHailuo23ProImageToVideoInput,
  MinimaxHailuo23ProImageToVideoOutput,
  MinimaxHailuo23ProTextToVideoInput,
  MinimaxHailuo23ProTextToVideoOutput,
  MinimaxHailuo23StandardImageToVideoInput,
  MinimaxHailuo23StandardImageToVideoOutput,
  MinimaxHailuo23StandardTextToVideoInput,
  MinimaxHailuo23StandardTextToVideoOutput,
  MinimaxVideo01DirectorImageToVideoInput,
  MinimaxVideo01DirectorImageToVideoOutput,
  MinimaxVideo01DirectorInput,
  MinimaxVideo01DirectorOutput,
  MinimaxVideo01ImageToVideoInput,
  MinimaxVideo01ImageToVideoOutput,
  MinimaxVideo01Input,
  MinimaxVideo01LiveImageToVideoInput,
  MinimaxVideo01LiveImageToVideoOutput,
  MinimaxVideo01LiveInput,
  MinimaxVideo01LiveOutput,
  MinimaxVideo01Output,
  MinimaxVideo01SubjectReferenceInput,
  MinimaxVideo01SubjectReferenceOutput,
  MmaudioV2Input,
  MmaudioV2Output,
  MochiV1Input,
  MochiV1Output,
  MultishotMasterInput,
  MultishotMasterOutput,
  MusetalkInput,
  MusetalkOutput,
  OneToAllAnimation13bInput,
  OneToAllAnimation13bOutput,
  OneToAllAnimation14bInput,
  OneToAllAnimation14bOutput,
  OviImageToVideoInput,
  OviImageToVideoOutput,
  OviInput,
  OviOutput,
  PikaV15PikaffectsInput,
  PikaV15PikaffectsOutput,
  PikaV21ImageToVideoInput,
  PikaV21ImageToVideoOutput,
  PikaV21TextToVideoInput,
  PikaV21TextToVideoOutput,
  PikaV22ImageToVideoInput,
  PikaV22ImageToVideoOutput,
  PikaV22PikaframesInput,
  PikaV22PikaframesOutput,
  PikaV22PikascenesInput,
  PikaV22PikascenesOutput,
  PikaV22TextToVideoInput,
  PikaV22TextToVideoOutput,
  PikaV2PikadditionsInput,
  PikaV2PikadditionsOutput,
  PikaV2TurboImageToVideoInput,
  PikaV2TurboImageToVideoOutput,
  PikaV2TurboTextToVideoInput,
  PikaV2TurboTextToVideoOutput,
  PixverseC1ImageToVideoInput,
  PixverseC1ImageToVideoOutput,
  PixverseC1ReferenceToVideoInput,
  PixverseC1ReferenceToVideoOutput,
  PixverseC1TextToVideoInput,
  PixverseC1TextToVideoOutput,
  PixverseC1TransitionInput,
  PixverseC1TransitionOutput,
  PixverseExtendFastInput,
  PixverseExtendFastOutput,
  PixverseExtendInput,
  PixverseExtendOutput,
  PixverseLipsyncInput,
  PixverseLipsyncOutput,
  PixverseSoundEffectsInput,
  PixverseSoundEffectsOutput,
  PixverseSwapInput,
  PixverseSwapOutput,
  PixverseV35EffectsInput,
  PixverseV35EffectsOutput,
  PixverseV35ImageToVideoFastInput,
  PixverseV35ImageToVideoFastOutput,
  PixverseV35ImageToVideoInput,
  PixverseV35ImageToVideoOutput,
  PixverseV35TextToVideoFastInput,
  PixverseV35TextToVideoFastOutput,
  PixverseV35TextToVideoInput,
  PixverseV35TextToVideoOutput,
  PixverseV35TransitionInput,
  PixverseV35TransitionOutput,
  PixverseV45EffectsInput,
  PixverseV45EffectsOutput,
  PixverseV45ImageToVideoFastInput,
  PixverseV45ImageToVideoFastOutput,
  PixverseV45ImageToVideoInput,
  PixverseV45ImageToVideoOutput,
  PixverseV45TextToVideoFastInput,
  PixverseV45TextToVideoFastOutput,
  PixverseV45TextToVideoInput,
  PixverseV45TextToVideoOutput,
  PixverseV45TransitionInput,
  PixverseV45TransitionOutput,
  PixverseV4EffectsInput,
  PixverseV4EffectsOutput,
  PixverseV4ImageToVideoFastInput,
  PixverseV4ImageToVideoFastOutput,
  PixverseV4ImageToVideoInput,
  PixverseV4ImageToVideoOutput,
  PixverseV4TextToVideoFastInput,
  PixverseV4TextToVideoFastOutput,
  PixverseV4TextToVideoInput,
  PixverseV4TextToVideoOutput,
  PixverseV55EffectsInput,
  PixverseV55EffectsOutput,
  PixverseV55ImageToVideoInput,
  PixverseV55ImageToVideoOutput,
  PixverseV55TextToVideoInput,
  PixverseV55TextToVideoOutput,
  PixverseV55TransitionInput,
  PixverseV55TransitionOutput,
  PixverseV56ImageToVideoInput,
  PixverseV56ImageToVideoOutput,
  PixverseV56TextToVideoInput,
  PixverseV56TextToVideoOutput,
  PixverseV56TransitionInput,
  PixverseV56TransitionOutput,
  PixverseV5EffectsInput,
  PixverseV5EffectsOutput,
  PixverseV5ImageToVideoInput,
  PixverseV5ImageToVideoOutput,
  PixverseV5TextToVideoInput,
  PixverseV5TextToVideoOutput,
  PixverseV5TransitionInput,
  PixverseV5TransitionOutput,
  PixverseV6ExtendInput,
  PixverseV6ExtendOutput,
  PixverseV6ImageToVideoInput,
  PixverseV6ImageToVideoOutput,
  PixverseV6TextToVideoInput,
  PixverseV6TextToVideoOutput,
  PixverseV6TransitionInput,
  PixverseV6TransitionOutput,
  RifeVideoInput,
  RifeVideoOutput,
  SadtalkerInput,
  SadtalkerOutput,
  SadtalkerReferenceInput,
  SadtalkerReferenceOutput,
  Sam2VideoInput,
  Sam2VideoOutput,
  Sam31VideoInput,
  Sam31VideoOutput,
  Sam31VideoRleInput,
  Sam31VideoRleOutput,
  Sam3VideoInput,
  Sam3VideoOutput,
  Sam3VideoRleInput,
  Sam3VideoRleOutput,
  SanaVideoInput,
  SanaVideoOutput,
  ScailInput,
  ScailOutput,
  Seedance20FastImageToVideoInput,
  Seedance20FastImageToVideoOutput,
  Seedance20FastReferenceToVideoInput,
  Seedance20FastReferenceToVideoOutput,
  Seedance20FastTextToVideoInput,
  Seedance20FastTextToVideoOutput,
  Seedance20ImageToVideoInput,
  Seedance20ImageToVideoOutput,
  Seedance20ReferenceToVideoInput,
  Seedance20ReferenceToVideoOutput,
  Seedance20TextToVideoInput,
  Seedance20TextToVideoOutput,
  SeedvrUpscaleVideoInput,
  SeedvrUpscaleVideoOutput,
  SfxV15VideoToVideoInput,
  SfxV15VideoToVideoOutput,
  SfxV1VideoToVideoInput,
  SfxV1VideoToVideoOutput,
  SkyreelsI2vInput,
  SkyreelsI2vOutput,
  Sora2CharactersInput,
  Sora2CharactersOutput,
  Sora2ImageToVideoInput,
  Sora2ImageToVideoOutput,
  Sora2ImageToVideoProInput,
  Sora2ImageToVideoProOutput,
  Sora2TextToVideoInput,
  Sora2TextToVideoOutput,
  Sora2TextToVideoProInput,
  Sora2TextToVideoProOutput,
  Sora2VideoToVideoRemixInput,
  Sora2VideoToVideoRemixOutput,
  StableAvatarInput,
  StableAvatarOutput,
  StableVideoInput,
  StableVideoOutput,
  SteadyDancerInput,
  SteadyDancerOutput,
  SyncLipsyncInput,
  SyncLipsyncOutput,
  SyncLipsyncReact1Input,
  SyncLipsyncReact1Output,
  SyncLipsyncV2Input,
  SyncLipsyncV2Output,
  SyncLipsyncV2ProInput,
  SyncLipsyncV2ProOutput,
  SyncLipsyncV3Input,
  SyncLipsyncV3Output,
  T2vTurboInput,
  T2vTurboOutput,
  ThinksoundAudioInput,
  ThinksoundAudioOutput,
  ThinksoundInput,
  ThinksoundOutput,
  TopazUpscaleVideoInput,
  TopazUpscaleVideoOutput,
  TranspixarInput,
  TranspixarOutput,
  V26ImageToVideoFlashInput,
  V26ImageToVideoFlashOutput,
  V26ImageToVideoInput,
  V26ImageToVideoOutput,
  V26ReferenceToVideoFlashInput,
  V26ReferenceToVideoFlashOutput,
  V26ReferenceToVideoInput,
  V26ReferenceToVideoOutput,
  V26TextToVideoInput,
  V26TextToVideoOutput,
  Veo2ImageToVideoInput,
  Veo2ImageToVideoOutput,
  Veo2Input,
  Veo2Output,
  Veo31ExtendVideoInput,
  Veo31ExtendVideoOutput,
  Veo31FastExtendVideoInput,
  Veo31FastExtendVideoOutput,
  Veo31FastFirstLastFrameToVideoInput,
  Veo31FastFirstLastFrameToVideoOutput,
  Veo31FastImageToVideoInput,
  Veo31FastImageToVideoOutput,
  Veo31FastInput,
  Veo31FastOutput,
  Veo31FirstLastFrameToVideoInput,
  Veo31FirstLastFrameToVideoOutput,
  Veo31ImageToVideoInput,
  Veo31ImageToVideoOutput,
  Veo31Input,
  Veo31LiteFirstLastFrameToVideoInput,
  Veo31LiteFirstLastFrameToVideoOutput,
  Veo31LiteImageToVideoInput,
  Veo31LiteImageToVideoOutput,
  Veo31LiteInput,
  Veo31LiteOutput,
  Veo31Output,
  Veo31ReferenceToVideoInput,
  Veo31ReferenceToVideoOutput,
  Veo3FastImageToVideoInput,
  Veo3FastImageToVideoOutput,
  Veo3FastInput,
  Veo3FastOutput,
  Veo3ImageToVideoInput,
  Veo3ImageToVideoOutput,
  Veo3Input,
  Veo3Output,
  VideoAsPromptInput,
  VideoAsPromptOutput,
  VideoBackgroundRemovalFastInput,
  VideoBackgroundRemovalFastOutput,
  VideoBackgroundRemovalGreenScreenInput,
  VideoBackgroundRemovalGreenScreenOutput,
  VideoBackgroundRemovalInput,
  VideoBackgroundRemovalInputType2,
  VideoBackgroundRemovalOutput,
  VideoBackgroundRemovalOutputType2,
  VideoEraseKeypointsInput,
  VideoEraseKeypointsOutput,
  VideoEraseMaskInput,
  VideoEraseMaskOutput,
  VideoErasePromptInput,
  VideoErasePromptOutput,
  VideoIncreaseResolutionInput,
  VideoIncreaseResolutionOutput,
  VideoSoundEffectsGeneratorInput,
  VideoSoundEffectsGeneratorOutput,
  VideoUpscalerInput,
  VideoUpscalerOutput,
  ViduImageToVideoInput,
  ViduImageToVideoOutput,
  ViduQ1ImageToVideoInput,
  ViduQ1ImageToVideoOutput,
  ViduQ1ReferenceToVideoInput,
  ViduQ1ReferenceToVideoOutput,
  ViduQ1StartEndToVideoInput,
  ViduQ1StartEndToVideoOutput,
  ViduQ1TextToVideoInput,
  ViduQ1TextToVideoOutput,
  ViduQ2ImageToVideoProInput,
  ViduQ2ImageToVideoProOutput,
  ViduQ2ImageToVideoTurboInput,
  ViduQ2ImageToVideoTurboOutput,
  ViduQ2ReferenceToVideoProInput,
  ViduQ2ReferenceToVideoProOutput,
  ViduQ2TextToVideoInput,
  ViduQ2TextToVideoOutput,
  ViduQ2VideoExtensionProInput,
  ViduQ2VideoExtensionProOutput,
  ViduQ3ImageToVideoInput,
  ViduQ3ImageToVideoOutput,
  ViduQ3ImageToVideoTurboInput,
  ViduQ3ImageToVideoTurboOutput,
  ViduQ3ReferenceToVideoMixInput,
  ViduQ3ReferenceToVideoMixOutput,
  ViduQ3TextToVideoInput,
  ViduQ3TextToVideoOutput,
  ViduQ3TextToVideoTurboInput,
  ViduQ3TextToVideoTurboOutput,
  ViduReferenceToVideoInput,
  ViduReferenceToVideoOutput,
  ViduStartEndToVideoInput,
  ViduStartEndToVideoOutput,
  ViduTemplateToVideoInput,
  ViduTemplateToVideoOutput,
  Wan22VaceFunA14bDepthInput,
  Wan22VaceFunA14bDepthOutput,
  Wan22VaceFunA14bInpaintingInput,
  Wan22VaceFunA14bInpaintingOutput,
  Wan22VaceFunA14bOutpaintingInput,
  Wan22VaceFunA14bOutpaintingOutput,
  Wan22VaceFunA14bPoseInput,
  Wan22VaceFunA14bPoseOutput,
  Wan22VaceFunA14bReframeInput,
  Wan22VaceFunA14bReframeOutput,
  Wan25PreviewImageToVideoInput,
  Wan25PreviewImageToVideoOutput,
  Wan25PreviewTextToVideoInput,
  Wan25PreviewTextToVideoOutput,
  WanAlphaInput,
  WanAlphaOutput,
  WanAtiInput,
  WanAtiOutput,
  WanEffectsInput,
  WanEffectsOutput,
  WanFlf2vInput,
  WanFlf2vOutput,
  WanFunControlInput,
  WanFunControlOutput,
  WanI2vInput,
  WanI2vLoraInput,
  WanI2vLoraOutput,
  WanI2vOutput,
  WanMotionInput,
  WanMotionOutput,
  WanMoveInput,
  WanMoveOutput,
  WanProImageToVideoInput,
  WanProImageToVideoOutput,
  WanProTextToVideoInput,
  WanProTextToVideoOutput,
  WanT2vInput,
  WanT2vLoraInput,
  WanT2vLoraOutput,
  WanT2vOutput,
  WanV2214bAnimateMoveInput,
  WanV2214bAnimateMoveOutput,
  WanV2214bAnimateReplaceInput,
  WanV2214bAnimateReplaceOutput,
  WanV2214bSpeechToVideoInput,
  WanV2214bSpeechToVideoOutput,
  WanV225bImageToVideoInput,
  WanV225bImageToVideoOutput,
  WanV225bTextToVideoDistillInput,
  WanV225bTextToVideoDistillOutput,
  WanV225bTextToVideoFastWanInput,
  WanV225bTextToVideoFastWanOutput,
  WanV225bTextToVideoInput,
  WanV225bTextToVideoOutput,
  WanV22A14bImageToVideoInput,
  WanV22A14bImageToVideoLoraInput,
  WanV22A14bImageToVideoLoraOutput,
  WanV22A14bImageToVideoOutput,
  WanV22A14bImageToVideoTurboInput,
  WanV22A14bImageToVideoTurboOutput,
  WanV22A14bTextToVideoInput,
  WanV22A14bTextToVideoLoraInput,
  WanV22A14bTextToVideoLoraOutput,
  WanV22A14bTextToVideoOutput,
  WanV22A14bTextToVideoTurboInput,
  WanV22A14bTextToVideoTurboOutput,
  WanV22A14bVideoToVideoInput,
  WanV22A14bVideoToVideoOutput,
  WanV27EditVideoInput,
  WanV27EditVideoOutput,
  WanV27ImageToVideoInput,
  WanV27ImageToVideoOutput,
  WanV27ReferenceToVideoInput,
  WanV27ReferenceToVideoOutput,
  WanV27TextToVideoInput,
  WanV27TextToVideoOutput,
  WanVace13bInput,
  WanVace13bOutput,
  WanVace14bDepthInput,
  WanVace14bDepthOutput,
  WanVace14bInpaintingInput,
  WanVace14bInpaintingOutput,
  WanVace14bInput,
  WanVace14bOutpaintingInput,
  WanVace14bOutpaintingOutput,
  WanVace14bOutput,
  WanVace14bPoseInput,
  WanVace14bPoseOutput,
  WanVace14bReframeInput,
  WanVace14bReframeOutput,
  WanVaceAppsLongReframeInput,
  WanVaceAppsLongReframeOutput,
  WanVaceAppsVideoEditInput,
  WanVaceAppsVideoEditOutput,
  WanVaceInput,
  WanVaceOutput,
  WanVisionEnhancerInput,
  WanVisionEnhancerOutput,
  WorkflowUtilitiesAutoSubtitleInput,
  WorkflowUtilitiesAutoSubtitleOutput,
  WorkflowUtilitiesBlendVideoInput,
  WorkflowUtilitiesBlendVideoOutput,
  WorkflowUtilitiesReverseVideoInput,
  WorkflowUtilitiesReverseVideoOutput,
  WorkflowUtilitiesScaleVideoInput,
  WorkflowUtilitiesScaleVideoOutput,
  WorkflowUtilitiesTrimVideoInput,
  WorkflowUtilitiesTrimVideoOutput,
} from "./types.gen";

export type VideoEndpointMap = {
  "argil/avatars/audio-to-video": {
    input: AvatarsAudioToVideoInputType2;
    output: AvatarsAudioToVideoOutputType2;
  };
  "argil/avatars/text-to-video": {
    input: AvatarsTextToVideoInputType2;
    output: AvatarsTextToVideoOutputType2;
  };
  "bria/bria_video_eraser/erase/keypoints": {
    input: BriaVideoEraserEraseKeypointsInput;
    output: BriaVideoEraserEraseKeypointsOutput;
  };
  "bria/bria_video_eraser/erase/mask": {
    input: BriaVideoEraserEraseMaskInput;
    output: BriaVideoEraserEraseMaskOutput;
  };
  "bria/bria_video_eraser/erase/prompt": {
    input: BriaVideoEraserErasePromptInput;
    output: BriaVideoEraserErasePromptOutput;
  };
  "bria/video/background-removal": {
    input: VideoBackgroundRemovalInput;
    output: VideoBackgroundRemovalOutput;
  };
  "bria/video/erase/keypoints": {
    input: VideoEraseKeypointsInput;
    output: VideoEraseKeypointsOutput;
  };
  "bria/video/erase/mask": {
    input: VideoEraseMaskInput;
    output: VideoEraseMaskOutput;
  };
  "bria/video/erase/prompt": {
    input: VideoErasePromptInput;
    output: VideoErasePromptOutput;
  };
  "bria/video/increase-resolution": {
    input: VideoIncreaseResolutionInput;
    output: VideoIncreaseResolutionOutput;
  };
  "bytedance/lynx": {
    input: LynxInput;
    output: LynxOutput;
  };
  "bytedance/seedance-2.0/fast/image-to-video": {
    input: Seedance20FastImageToVideoInput;
    output: Seedance20FastImageToVideoOutput;
  };
  "bytedance/seedance-2.0/fast/reference-to-video": {
    input: Seedance20FastReferenceToVideoInput;
    output: Seedance20FastReferenceToVideoOutput;
  };
  "bytedance/seedance-2.0/fast/text-to-video": {
    input: Seedance20FastTextToVideoInput;
    output: Seedance20FastTextToVideoOutput;
  };
  "bytedance/seedance-2.0/image-to-video": {
    input: Seedance20ImageToVideoInput;
    output: Seedance20ImageToVideoOutput;
  };
  "bytedance/seedance-2.0/reference-to-video": {
    input: Seedance20ReferenceToVideoInput;
    output: Seedance20ReferenceToVideoOutput;
  };
  "bytedance/seedance-2.0/text-to-video": {
    input: Seedance20TextToVideoInput;
    output: Seedance20TextToVideoOutput;
  };
  "cassetteai/video-sound-effects-generator": {
    input: VideoSoundEffectsGeneratorInput;
    output: VideoSoundEffectsGeneratorOutput;
  };
  "clarityai/crystal-video-upscaler": {
    input: CrystalVideoUpscalerInput;
    output: CrystalVideoUpscalerOutput;
  };
  "decart/lucy-edit/pro": {
    input: LucyEditProInput;
    output: LucyEditProOutput;
  };
  "decart/lucy-i2v": {
    input: LucyI2vInput;
    output: LucyI2vOutput;
  };
  "decart/lucy-restyle": {
    input: LucyRestyleInput;
    output: LucyRestyleOutput;
  };
  "fal-ai/ai-avatar": {
    input: AiAvatarInput;
    output: AiAvatarOutput;
  };
  "fal-ai/ai-avatar/multi": {
    input: AiAvatarMultiInput;
    output: AiAvatarMultiOutput;
  };
  "fal-ai/ai-avatar/multi-text": {
    input: AiAvatarMultiTextInput;
    output: AiAvatarMultiTextOutput;
  };
  "fal-ai/ai-avatar/single-text": {
    input: AiAvatarSingleTextInput;
    output: AiAvatarSingleTextOutput;
  };
  "fal-ai/amt-interpolation": {
    input: AmtInterpolationInput;
    output: AmtInterpolationOutput;
  };
  "fal-ai/amt-interpolation/frame-interpolation": {
    input: AmtInterpolationFrameInterpolationInput;
    output: AmtInterpolationFrameInterpolationOutput;
  };
  "fal-ai/animatediff-sparsectrl-lcm": {
    input: AnimatediffSparsectrlLcmInput;
    output: AnimatediffSparsectrlLcmOutput;
  };
  "fal-ai/auto-caption": {
    input: AutoCaptionInput;
    output: AutoCaptionOutput;
  };
  "fal-ai/ben/v2/video": {
    input: BenV2VideoInput;
    output: BenV2VideoOutput;
  };
  "fal-ai/birefnet/v2/video": {
    input: BirefnetV2VideoInput;
    output: BirefnetV2VideoOutput;
  };
  "fal-ai/bytedance-upscaler/upscale/video": {
    input: BytedanceUpscalerUpscaleVideoInput;
    output: BytedanceUpscalerUpscaleVideoOutput;
  };
  "fal-ai/bytedance/dreamactor/v2": {
    input: BytedanceDreamactorV2Input;
    output: BytedanceDreamactorV2Output;
  };
  "fal-ai/bytedance/omnihuman": {
    input: BytedanceOmnihumanInput;
    output: BytedanceOmnihumanOutput;
  };
  "fal-ai/bytedance/omnihuman/v1.5": {
    input: BytedanceOmnihumanV15Input;
    output: BytedanceOmnihumanV15Output;
  };
  "fal-ai/bytedance/seedance/v1.5/pro/image-to-video": {
    input: BytedanceSeedanceV15ProImageToVideoInput;
    output: BytedanceSeedanceV15ProImageToVideoOutput;
  };
  "fal-ai/bytedance/seedance/v1.5/pro/text-to-video": {
    input: BytedanceSeedanceV15ProTextToVideoInput;
    output: BytedanceSeedanceV15ProTextToVideoOutput;
  };
  "fal-ai/bytedance/seedance/v1/lite/image-to-video": {
    input: BytedanceSeedanceV1LiteImageToVideoInput;
    output: BytedanceSeedanceV1LiteImageToVideoOutput;
  };
  "fal-ai/bytedance/seedance/v1/lite/reference-to-video": {
    input: BytedanceSeedanceV1LiteReferenceToVideoInput;
    output: BytedanceSeedanceV1LiteReferenceToVideoOutput;
  };
  "fal-ai/bytedance/seedance/v1/lite/text-to-video": {
    input: BytedanceSeedanceV1LiteTextToVideoInput;
    output: BytedanceSeedanceV1LiteTextToVideoOutput;
  };
  "fal-ai/bytedance/seedance/v1/pro/fast/image-to-video": {
    input: BytedanceSeedanceV1ProFastImageToVideoInput;
    output: BytedanceSeedanceV1ProFastImageToVideoOutput;
  };
  "fal-ai/bytedance/seedance/v1/pro/fast/text-to-video": {
    input: BytedanceSeedanceV1ProFastTextToVideoInput;
    output: BytedanceSeedanceV1ProFastTextToVideoOutput;
  };
  "fal-ai/bytedance/seedance/v1/pro/image-to-video": {
    input: BytedanceSeedanceV1ProImageToVideoInput;
    output: BytedanceSeedanceV1ProImageToVideoOutput;
  };
  "fal-ai/bytedance/seedance/v1/pro/text-to-video": {
    input: BytedanceSeedanceV1ProTextToVideoInput;
    output: BytedanceSeedanceV1ProTextToVideoOutput;
  };
  "fal-ai/bytedance/video-stylize": {
    input: BytedanceVideoStylizeInput;
    output: BytedanceVideoStylizeOutput;
  };
  "fal-ai/cogvideox-5b": {
    input: Cogvideox5bInput;
    output: Cogvideox5bOutput;
  };
  "fal-ai/cogvideox-5b/image-to-video": {
    input: Cogvideox5bImageToVideoInput;
    output: Cogvideox5bImageToVideoOutput;
  };
  "fal-ai/cogvideox-5b/video-to-video": {
    input: Cogvideox5bVideoToVideoInput;
    output: Cogvideox5bVideoToVideoOutput;
  };
  "fal-ai/controlnext": {
    input: ControlnextInput;
    output: ControlnextOutput;
  };
  "fal-ai/cosmos-predict-2.5/distilled/text-to-video": {
    input: CosmosPredict25DistilledTextToVideoInput;
    output: CosmosPredict25DistilledTextToVideoOutput;
  };
  "fal-ai/cosmos-predict-2.5/image-to-video": {
    input: CosmosPredict25ImageToVideoInput;
    output: CosmosPredict25ImageToVideoOutput;
  };
  "fal-ai/cosmos-predict-2.5/text-to-video": {
    input: CosmosPredict25TextToVideoInput;
    output: CosmosPredict25TextToVideoOutput;
  };
  "fal-ai/cosmos-predict-2.5/video-to-video": {
    input: CosmosPredict25VideoToVideoInput;
    output: CosmosPredict25VideoToVideoOutput;
  };
  "fal-ai/creatify/aurora": {
    input: CreatifyAuroraInput;
    output: CreatifyAuroraOutput;
  };
  "fal-ai/davinci-magihuman": {
    input: DavinciMagihumanInput;
    output: DavinciMagihumanOutput;
  };
  "fal-ai/depth-anything-video": {
    input: DepthAnythingVideoInput;
    output: DepthAnythingVideoOutput;
  };
  "fal-ai/dubbing": {
    input: DubbingInput;
    output: DubbingOutput;
  };
  "fal-ai/dwpose/video": {
    input: DwposeVideoInput;
    output: DwposeVideoOutput;
  };
  "fal-ai/echomimic-v3": {
    input: EchomimicV3Input;
    output: EchomimicV3Output;
  };
  "fal-ai/editto": {
    input: EdittoInput;
    output: EdittoOutput;
  };
  "fal-ai/elevenlabs/dubbing": {
    input: ElevenlabsDubbingInput;
    output: ElevenlabsDubbingOutput;
  };
  "fal-ai/fast-animatediff/text-to-video": {
    input: FastAnimatediffTextToVideoInput;
    output: FastAnimatediffTextToVideoOutput;
  };
  "fal-ai/fast-animatediff/turbo/text-to-video": {
    input: FastAnimatediffTurboTextToVideoInput;
    output: FastAnimatediffTurboTextToVideoOutput;
  };
  "fal-ai/fast-animatediff/turbo/video-to-video": {
    input: FastAnimatediffTurboVideoToVideoInput;
    output: FastAnimatediffTurboVideoToVideoOutput;
  };
  "fal-ai/fast-animatediff/video-to-video": {
    input: FastAnimatediffVideoToVideoInput;
    output: FastAnimatediffVideoToVideoOutput;
  };
  "fal-ai/fast-svd-lcm": {
    input: FastSvdLcmInput;
    output: FastSvdLcmOutput;
  };
  "fal-ai/fast-svd-lcm/text-to-video": {
    input: FastSvdLcmTextToVideoInput;
    output: FastSvdLcmTextToVideoOutput;
  };
  "fal-ai/fast-svd/text-to-video": {
    input: FastSvdTextToVideoInput;
    output: FastSvdTextToVideoOutput;
  };
  "fal-ai/ffmpeg-api/compose": {
    input: FfmpegApiComposeInput;
    output: FfmpegApiComposeOutput;
  };
  "fal-ai/ffmpeg-api/merge-audio-video": {
    input: FfmpegApiMergeAudioVideoInput;
    output: FfmpegApiMergeAudioVideoOutput;
  };
  "fal-ai/ffmpeg-api/merge-videos": {
    input: FfmpegApiMergeVideosInput;
    output: FfmpegApiMergeVideosOutput;
  };
  "fal-ai/film/video": {
    input: FilmVideoInput;
    output: FilmVideoOutput;
  };
  "fal-ai/flashvsr/upscale/video": {
    input: FlashvsrUpscaleVideoInput;
    output: FlashvsrUpscaleVideoOutput;
  };
  "fal-ai/framepack": {
    input: FramepackInput;
    output: FramepackOutput;
  };
  "fal-ai/framepack/f1": {
    input: FramepackF1Input;
    output: FramepackF1Output;
  };
  "fal-ai/framepack/flf2v": {
    input: FramepackFlf2vInput;
    output: FramepackFlf2vOutput;
  };
  "fal-ai/goal-force": {
    input: GoalForceInput;
    output: GoalForceOutput;
  };
  "fal-ai/heygen/avatar3/digital-twin": {
    input: HeygenAvatar3DigitalTwinInput;
    output: HeygenAvatar3DigitalTwinOutput;
  };
  "fal-ai/heygen/avatar4/digital-twin": {
    input: HeygenAvatar4DigitalTwinInput;
    output: HeygenAvatar4DigitalTwinOutput;
  };
  "fal-ai/heygen/avatar4/image-to-video": {
    input: HeygenAvatar4ImageToVideoInput;
    output: HeygenAvatar4ImageToVideoOutput;
  };
  "fal-ai/heygen/v2/translate/precision": {
    input: HeygenV2TranslatePrecisionInput;
    output: HeygenV2TranslatePrecisionOutput;
  };
  "fal-ai/heygen/v2/translate/speed": {
    input: HeygenV2TranslateSpeedInput;
    output: HeygenV2TranslateSpeedOutput;
  };
  "fal-ai/heygen/v2/video-agent": {
    input: HeygenV2VideoAgentInput;
    output: HeygenV2VideoAgentOutput;
  };
  "fal-ai/hunyuan-avatar": {
    input: HunyuanAvatarInput;
    output: HunyuanAvatarOutput;
  };
  "fal-ai/hunyuan-custom": {
    input: HunyuanCustomInput;
    output: HunyuanCustomOutput;
  };
  "fal-ai/hunyuan-portrait": {
    input: HunyuanPortraitInput;
    output: HunyuanPortraitOutput;
  };
  "fal-ai/hunyuan-video": {
    input: HunyuanVideoInput;
    output: HunyuanVideoOutput;
  };
  "fal-ai/hunyuan-video-foley": {
    input: HunyuanVideoFoleyInput;
    output: HunyuanVideoFoleyOutput;
  };
  "fal-ai/hunyuan-video-image-to-video": {
    input: HunyuanVideoImageToVideoInput;
    output: HunyuanVideoImageToVideoOutput;
  };
  "fal-ai/hunyuan-video-img2vid-lora": {
    input: HunyuanVideoImg2VidLoraInput;
    output: HunyuanVideoImg2VidLoraOutput;
  };
  "fal-ai/hunyuan-video-lora": {
    input: HunyuanVideoLoraInput;
    output: HunyuanVideoLoraOutput;
  };
  "fal-ai/hunyuan-video-lora/video-to-video": {
    input: HunyuanVideoLoraVideoToVideoInput;
    output: HunyuanVideoLoraVideoToVideoOutput;
  };
  "fal-ai/hunyuan-video-v1.5/image-to-video": {
    input: HunyuanVideoV15ImageToVideoInput;
    output: HunyuanVideoV15ImageToVideoOutput;
  };
  "fal-ai/hunyuan-video-v1.5/text-to-video": {
    input: HunyuanVideoV15TextToVideoInput;
    output: HunyuanVideoV15TextToVideoOutput;
  };
  "fal-ai/hunyuan-video/video-to-video": {
    input: HunyuanVideoVideoToVideoInput;
    output: HunyuanVideoVideoToVideoOutput;
  };
  "fal-ai/infinitalk": {
    input: InfinitalkInput;
    output: InfinitalkOutput;
  };
  "fal-ai/infinitalk/single-text": {
    input: InfinitalkSingleTextInput;
    output: InfinitalkSingleTextOutput;
  };
  "fal-ai/infinitalk/video-to-video": {
    input: InfinitalkVideoToVideoInput;
    output: InfinitalkVideoToVideoOutput;
  };
  "fal-ai/infinity-star/text-to-video": {
    input: InfinityStarTextToVideoInput;
    output: InfinityStarTextToVideoOutput;
  };
  "fal-ai/kandinsky5-pro/image-to-video": {
    input: Kandinsky5ProImageToVideoInput;
    output: Kandinsky5ProImageToVideoOutput;
  };
  "fal-ai/kandinsky5-pro/text-to-video": {
    input: Kandinsky5ProTextToVideoInput;
    output: Kandinsky5ProTextToVideoOutput;
  };
  "fal-ai/kandinsky5/text-to-video": {
    input: Kandinsky5TextToVideoInput;
    output: Kandinsky5TextToVideoOutput;
  };
  "fal-ai/kandinsky5/text-to-video/distill": {
    input: Kandinsky5TextToVideoDistillInput;
    output: Kandinsky5TextToVideoDistillOutput;
  };
  "fal-ai/kling-video/ai-avatar/v2/pro": {
    input: KlingVideoAiAvatarV2ProInput;
    output: KlingVideoAiAvatarV2ProOutput;
  };
  "fal-ai/kling-video/ai-avatar/v2/standard": {
    input: KlingVideoAiAvatarV2StandardInput;
    output: KlingVideoAiAvatarV2StandardOutput;
  };
  "fal-ai/kling-video/lipsync/audio-to-video": {
    input: KlingVideoLipsyncAudioToVideoInput;
    output: KlingVideoLipsyncAudioToVideoOutput;
  };
  "fal-ai/kling-video/lipsync/text-to-video": {
    input: KlingVideoLipsyncTextToVideoInput;
    output: KlingVideoLipsyncTextToVideoOutput;
  };
  "fal-ai/kling-video/o1/image-to-video": {
    input: KlingVideoO1ImageToVideoInput;
    output: KlingVideoO1ImageToVideoOutput;
  };
  "fal-ai/kling-video/o1/reference-to-video": {
    input: KlingVideoO1ReferenceToVideoInput;
    output: KlingVideoO1ReferenceToVideoOutput;
  };
  "fal-ai/kling-video/o1/standard/image-to-video": {
    input: KlingVideoO1StandardImageToVideoInput;
    output: KlingVideoO1StandardImageToVideoOutput;
  };
  "fal-ai/kling-video/o1/standard/reference-to-video": {
    input: KlingVideoO1StandardReferenceToVideoInput;
    output: KlingVideoO1StandardReferenceToVideoOutput;
  };
  "fal-ai/kling-video/o1/standard/video-to-video/edit": {
    input: KlingVideoO1StandardVideoToVideoEditInput;
    output: KlingVideoO1StandardVideoToVideoEditOutput;
  };
  "fal-ai/kling-video/o1/standard/video-to-video/reference": {
    input: KlingVideoO1StandardVideoToVideoReferenceInput;
    output: KlingVideoO1StandardVideoToVideoReferenceOutput;
  };
  "fal-ai/kling-video/o1/video-to-video/edit": {
    input: KlingVideoO1VideoToVideoEditInput;
    output: KlingVideoO1VideoToVideoEditOutput;
  };
  "fal-ai/kling-video/o1/video-to-video/reference": {
    input: KlingVideoO1VideoToVideoReferenceInput;
    output: KlingVideoO1VideoToVideoReferenceOutput;
  };
  "fal-ai/kling-video/o3/pro/image-to-video": {
    input: KlingVideoO3ProImageToVideoInput;
    output: KlingVideoO3ProImageToVideoOutput;
  };
  "fal-ai/kling-video/o3/pro/reference-to-video": {
    input: KlingVideoO3ProReferenceToVideoInput;
    output: KlingVideoO3ProReferenceToVideoOutput;
  };
  "fal-ai/kling-video/o3/pro/text-to-video": {
    input: KlingVideoO3ProTextToVideoInput;
    output: KlingVideoO3ProTextToVideoOutput;
  };
  "fal-ai/kling-video/o3/pro/video-to-video/edit": {
    input: KlingVideoO3ProVideoToVideoEditInput;
    output: KlingVideoO3ProVideoToVideoEditOutput;
  };
  "fal-ai/kling-video/o3/pro/video-to-video/reference": {
    input: KlingVideoO3ProVideoToVideoReferenceInput;
    output: KlingVideoO3ProVideoToVideoReferenceOutput;
  };
  "fal-ai/kling-video/o3/standard/image-to-video": {
    input: KlingVideoO3StandardImageToVideoInput;
    output: KlingVideoO3StandardImageToVideoOutput;
  };
  "fal-ai/kling-video/o3/standard/reference-to-video": {
    input: KlingVideoO3StandardReferenceToVideoInput;
    output: KlingVideoO3StandardReferenceToVideoOutput;
  };
  "fal-ai/kling-video/o3/standard/text-to-video": {
    input: KlingVideoO3StandardTextToVideoInput;
    output: KlingVideoO3StandardTextToVideoOutput;
  };
  "fal-ai/kling-video/o3/standard/video-to-video/edit": {
    input: KlingVideoO3StandardVideoToVideoEditInput;
    output: KlingVideoO3StandardVideoToVideoEditOutput;
  };
  "fal-ai/kling-video/o3/standard/video-to-video/reference": {
    input: KlingVideoO3StandardVideoToVideoReferenceInput;
    output: KlingVideoO3StandardVideoToVideoReferenceOutput;
  };
  "fal-ai/kling-video/v1.5/pro/effects": {
    input: KlingVideoV15ProEffectsInput;
    output: KlingVideoV15ProEffectsOutput;
  };
  "fal-ai/kling-video/v1.5/pro/image-to-video": {
    input: KlingVideoV15ProImageToVideoInput;
    output: KlingVideoV15ProImageToVideoOutput;
  };
  "fal-ai/kling-video/v1.5/pro/text-to-video": {
    input: KlingVideoV15ProTextToVideoInput;
    output: KlingVideoV15ProTextToVideoOutput;
  };
  "fal-ai/kling-video/v1.6/pro/effects": {
    input: KlingVideoV16ProEffectsInput;
    output: KlingVideoV16ProEffectsOutput;
  };
  "fal-ai/kling-video/v1.6/pro/elements": {
    input: KlingVideoV16ProElementsInput;
    output: KlingVideoV16ProElementsOutput;
  };
  "fal-ai/kling-video/v1.6/pro/image-to-video": {
    input: KlingVideoV16ProImageToVideoInput;
    output: KlingVideoV16ProImageToVideoOutput;
  };
  "fal-ai/kling-video/v1.6/pro/text-to-video": {
    input: KlingVideoV16ProTextToVideoInput;
    output: KlingVideoV16ProTextToVideoOutput;
  };
  "fal-ai/kling-video/v1.6/standard/effects": {
    input: KlingVideoV16StandardEffectsInput;
    output: KlingVideoV16StandardEffectsOutput;
  };
  "fal-ai/kling-video/v1.6/standard/elements": {
    input: KlingVideoV16StandardElementsInput;
    output: KlingVideoV16StandardElementsOutput;
  };
  "fal-ai/kling-video/v1.6/standard/image-to-video": {
    input: KlingVideoV16StandardImageToVideoInput;
    output: KlingVideoV16StandardImageToVideoOutput;
  };
  "fal-ai/kling-video/v1.6/standard/text-to-video": {
    input: KlingVideoV16StandardTextToVideoInput;
    output: KlingVideoV16StandardTextToVideoOutput;
  };
  "fal-ai/kling-video/v1/pro/ai-avatar": {
    input: KlingVideoV1ProAiAvatarInput;
    output: KlingVideoV1ProAiAvatarOutput;
  };
  "fal-ai/kling-video/v1/standard/ai-avatar": {
    input: KlingVideoV1StandardAiAvatarInput;
    output: KlingVideoV1StandardAiAvatarOutput;
  };
  "fal-ai/kling-video/v1/standard/effects": {
    input: KlingVideoV1StandardEffectsInput;
    output: KlingVideoV1StandardEffectsOutput;
  };
  "fal-ai/kling-video/v1/standard/image-to-video": {
    input: KlingVideoV1StandardImageToVideoInput;
    output: KlingVideoV1StandardImageToVideoOutput;
  };
  "fal-ai/kling-video/v1/standard/text-to-video": {
    input: KlingVideoV1StandardTextToVideoInput;
    output: KlingVideoV1StandardTextToVideoOutput;
  };
  "fal-ai/kling-video/v2.1/master/image-to-video": {
    input: KlingVideoV21MasterImageToVideoInput;
    output: KlingVideoV21MasterImageToVideoOutput;
  };
  "fal-ai/kling-video/v2.1/master/text-to-video": {
    input: KlingVideoV21MasterTextToVideoInput;
    output: KlingVideoV21MasterTextToVideoOutput;
  };
  "fal-ai/kling-video/v2.1/pro/image-to-video": {
    input: KlingVideoV21ProImageToVideoInput;
    output: KlingVideoV21ProImageToVideoOutput;
  };
  "fal-ai/kling-video/v2.1/standard/image-to-video": {
    input: KlingVideoV21StandardImageToVideoInput;
    output: KlingVideoV21StandardImageToVideoOutput;
  };
  "fal-ai/kling-video/v2.5-turbo/pro/image-to-video": {
    input: KlingVideoV25TurboProImageToVideoInput;
    output: KlingVideoV25TurboProImageToVideoOutput;
  };
  "fal-ai/kling-video/v2.5-turbo/pro/text-to-video": {
    input: KlingVideoV25TurboProTextToVideoInput;
    output: KlingVideoV25TurboProTextToVideoOutput;
  };
  "fal-ai/kling-video/v2.5-turbo/standard/image-to-video": {
    input: KlingVideoV25TurboStandardImageToVideoInput;
    output: KlingVideoV25TurboStandardImageToVideoOutput;
  };
  "fal-ai/kling-video/v2.6/pro/image-to-video": {
    input: KlingVideoV26ProImageToVideoInput;
    output: KlingVideoV26ProImageToVideoOutput;
  };
  "fal-ai/kling-video/v2.6/pro/motion-control": {
    input: KlingVideoV26ProMotionControlInput;
    output: KlingVideoV26ProMotionControlOutput;
  };
  "fal-ai/kling-video/v2.6/pro/text-to-video": {
    input: KlingVideoV26ProTextToVideoInput;
    output: KlingVideoV26ProTextToVideoOutput;
  };
  "fal-ai/kling-video/v2.6/standard/motion-control": {
    input: KlingVideoV26StandardMotionControlInput;
    output: KlingVideoV26StandardMotionControlOutput;
  };
  "fal-ai/kling-video/v2/master/image-to-video": {
    input: KlingVideoV2MasterImageToVideoInput;
    output: KlingVideoV2MasterImageToVideoOutput;
  };
  "fal-ai/kling-video/v2/master/text-to-video": {
    input: KlingVideoV2MasterTextToVideoInput;
    output: KlingVideoV2MasterTextToVideoOutput;
  };
  "fal-ai/kling-video/v3/pro/image-to-video": {
    input: KlingVideoV3ProImageToVideoInput;
    output: KlingVideoV3ProImageToVideoOutput;
  };
  "fal-ai/kling-video/v3/pro/motion-control": {
    input: KlingVideoV3ProMotionControlInput;
    output: KlingVideoV3ProMotionControlOutput;
  };
  "fal-ai/kling-video/v3/pro/text-to-video": {
    input: KlingVideoV3ProTextToVideoInput;
    output: KlingVideoV3ProTextToVideoOutput;
  };
  "fal-ai/kling-video/v3/standard/image-to-video": {
    input: KlingVideoV3StandardImageToVideoInput;
    output: KlingVideoV3StandardImageToVideoOutput;
  };
  "fal-ai/kling-video/v3/standard/motion-control": {
    input: KlingVideoV3StandardMotionControlInput;
    output: KlingVideoV3StandardMotionControlOutput;
  };
  "fal-ai/kling-video/v3/standard/text-to-video": {
    input: KlingVideoV3StandardTextToVideoInput;
    output: KlingVideoV3StandardTextToVideoOutput;
  };
  "fal-ai/krea-wan-14b/text-to-video": {
    input: KreaWan14bTextToVideoInput;
    output: KreaWan14bTextToVideoOutput;
  };
  "fal-ai/krea-wan-14b/video-to-video": {
    input: KreaWan14bVideoToVideoInput;
    output: KreaWan14bVideoToVideoOutput;
  };
  "fal-ai/latentsync": {
    input: LatentsyncInput;
    output: LatentsyncOutput;
  };
  "fal-ai/lightx/recamera": {
    input: LightxRecameraInput;
    output: LightxRecameraOutput;
  };
  "fal-ai/lightx/relight": {
    input: LightxRelightInput;
    output: LightxRelightOutput;
  };
  "fal-ai/live-avatar": {
    input: LiveAvatarInput;
    output: LiveAvatarOutput;
  };
  "fal-ai/live-portrait": {
    input: LivePortraitInput;
    output: LivePortraitOutput;
  };
  "fal-ai/longcat-multi-avatar/image-audio-to-video": {
    input: LongcatMultiAvatarImageAudioToVideoInput;
    output: LongcatMultiAvatarImageAudioToVideoOutput;
  };
  "fal-ai/longcat-single-avatar/audio-to-video": {
    input: LongcatSingleAvatarAudioToVideoInput;
    output: LongcatSingleAvatarAudioToVideoOutput;
  };
  "fal-ai/longcat-single-avatar/image-audio-to-video": {
    input: LongcatSingleAvatarImageAudioToVideoInput;
    output: LongcatSingleAvatarImageAudioToVideoOutput;
  };
  "fal-ai/longcat-video/distilled/image-to-video/480p": {
    input: LongcatVideoDistilledImageToVideo480pInput;
    output: LongcatVideoDistilledImageToVideo480pOutput;
  };
  "fal-ai/longcat-video/distilled/image-to-video/720p": {
    input: LongcatVideoDistilledImageToVideo720pInput;
    output: LongcatVideoDistilledImageToVideo720pOutput;
  };
  "fal-ai/longcat-video/distilled/text-to-video/480p": {
    input: LongcatVideoDistilledTextToVideo480pInput;
    output: LongcatVideoDistilledTextToVideo480pOutput;
  };
  "fal-ai/longcat-video/distilled/text-to-video/720p": {
    input: LongcatVideoDistilledTextToVideo720pInput;
    output: LongcatVideoDistilledTextToVideo720pOutput;
  };
  "fal-ai/longcat-video/image-to-video/480p": {
    input: LongcatVideoImageToVideo480pInput;
    output: LongcatVideoImageToVideo480pOutput;
  };
  "fal-ai/longcat-video/image-to-video/720p": {
    input: LongcatVideoImageToVideo720pInput;
    output: LongcatVideoImageToVideo720pOutput;
  };
  "fal-ai/longcat-video/text-to-video/480p": {
    input: LongcatVideoTextToVideo480pInput;
    output: LongcatVideoTextToVideo480pOutput;
  };
  "fal-ai/longcat-video/text-to-video/720p": {
    input: LongcatVideoTextToVideo720pInput;
    output: LongcatVideoTextToVideo720pOutput;
  };
  "fal-ai/ltx-2-19b/audio-to-video": {
    input: Ltx219bAudioToVideoInput;
    output: Ltx219bAudioToVideoOutput;
  };
  "fal-ai/ltx-2-19b/audio-to-video/lora": {
    input: Ltx219bAudioToVideoLoraInput;
    output: Ltx219bAudioToVideoLoraOutput;
  };
  "fal-ai/ltx-2-19b/distilled/audio-to-video": {
    input: Ltx219bDistilledAudioToVideoInput;
    output: Ltx219bDistilledAudioToVideoOutput;
  };
  "fal-ai/ltx-2-19b/distilled/audio-to-video/lora": {
    input: Ltx219bDistilledAudioToVideoLoraInput;
    output: Ltx219bDistilledAudioToVideoLoraOutput;
  };
  "fal-ai/ltx-2-19b/distilled/extend-video": {
    input: Ltx219bDistilledExtendVideoInput;
    output: Ltx219bDistilledExtendVideoOutput;
  };
  "fal-ai/ltx-2-19b/distilled/extend-video/lora": {
    input: Ltx219bDistilledExtendVideoLoraInput;
    output: Ltx219bDistilledExtendVideoLoraOutput;
  };
  "fal-ai/ltx-2-19b/distilled/image-to-video": {
    input: Ltx219bDistilledImageToVideoInput;
    output: Ltx219bDistilledImageToVideoOutput;
  };
  "fal-ai/ltx-2-19b/distilled/image-to-video/lora": {
    input: Ltx219bDistilledImageToVideoLoraInput;
    output: Ltx219bDistilledImageToVideoLoraOutput;
  };
  "fal-ai/ltx-2-19b/distilled/text-to-video": {
    input: Ltx219bDistilledTextToVideoInput;
    output: Ltx219bDistilledTextToVideoOutput;
  };
  "fal-ai/ltx-2-19b/distilled/text-to-video/lora": {
    input: Ltx219bDistilledTextToVideoLoraInput;
    output: Ltx219bDistilledTextToVideoLoraOutput;
  };
  "fal-ai/ltx-2-19b/distilled/video-to-video": {
    input: Ltx219bDistilledVideoToVideoInput;
    output: Ltx219bDistilledVideoToVideoOutput;
  };
  "fal-ai/ltx-2-19b/distilled/video-to-video/lora": {
    input: Ltx219bDistilledVideoToVideoLoraInput;
    output: Ltx219bDistilledVideoToVideoLoraOutput;
  };
  "fal-ai/ltx-2-19b/extend-video": {
    input: Ltx219bExtendVideoInput;
    output: Ltx219bExtendVideoOutput;
  };
  "fal-ai/ltx-2-19b/extend-video/lora": {
    input: Ltx219bExtendVideoLoraInput;
    output: Ltx219bExtendVideoLoraOutput;
  };
  "fal-ai/ltx-2-19b/image-to-video": {
    input: Ltx219bImageToVideoInput;
    output: Ltx219bImageToVideoOutput;
  };
  "fal-ai/ltx-2-19b/image-to-video/lora": {
    input: Ltx219bImageToVideoLoraInput;
    output: Ltx219bImageToVideoLoraOutput;
  };
  "fal-ai/ltx-2-19b/text-to-video": {
    input: Ltx219bTextToVideoInput;
    output: Ltx219bTextToVideoOutput;
  };
  "fal-ai/ltx-2-19b/text-to-video/lora": {
    input: Ltx219bTextToVideoLoraInput;
    output: Ltx219bTextToVideoLoraOutput;
  };
  "fal-ai/ltx-2-19b/video-to-video": {
    input: Ltx219bVideoToVideoInput;
    output: Ltx219bVideoToVideoOutput;
  };
  "fal-ai/ltx-2-19b/video-to-video/lora": {
    input: Ltx219bVideoToVideoLoraInput;
    output: Ltx219bVideoToVideoLoraOutput;
  };
  "fal-ai/ltx-2.3-22b/audio-to-video": {
    input: Ltx2322bAudioToVideoInput;
    output: Ltx2322bAudioToVideoOutput;
  };
  "fal-ai/ltx-2.3-22b/audio-to-video/lora": {
    input: Ltx2322bAudioToVideoLoraInput;
    output: Ltx2322bAudioToVideoLoraOutput;
  };
  "fal-ai/ltx-2.3-22b/distilled/audio-to-video": {
    input: Ltx2322bDistilledAudioToVideoInput;
    output: Ltx2322bDistilledAudioToVideoOutput;
  };
  "fal-ai/ltx-2.3-22b/distilled/audio-to-video/lora": {
    input: Ltx2322bDistilledAudioToVideoLoraInput;
    output: Ltx2322bDistilledAudioToVideoLoraOutput;
  };
  "fal-ai/ltx-2.3-22b/distilled/image-to-video": {
    input: Ltx2322bDistilledImageToVideoInput;
    output: Ltx2322bDistilledImageToVideoOutput;
  };
  "fal-ai/ltx-2.3-22b/distilled/image-to-video/lora": {
    input: Ltx2322bDistilledImageToVideoLoraInput;
    output: Ltx2322bDistilledImageToVideoLoraOutput;
  };
  "fal-ai/ltx-2.3-22b/distilled/reference-video-to-video": {
    input: Ltx2322bDistilledReferenceVideoToVideoInput;
    output: Ltx2322bDistilledReferenceVideoToVideoOutput;
  };
  "fal-ai/ltx-2.3-22b/distilled/reference-video-to-video/lora": {
    input: Ltx2322bDistilledReferenceVideoToVideoLoraInput;
    output: Ltx2322bDistilledReferenceVideoToVideoLoraOutput;
  };
  "fal-ai/ltx-2.3-22b/distilled/text-to-video": {
    input: Ltx2322bDistilledTextToVideoInput;
    output: Ltx2322bDistilledTextToVideoOutput;
  };
  "fal-ai/ltx-2.3-22b/distilled/text-to-video/lora": {
    input: Ltx2322bDistilledTextToVideoLoraInput;
    output: Ltx2322bDistilledTextToVideoLoraOutput;
  };
  "fal-ai/ltx-2.3-22b/distilled/video-to-video": {
    input: Ltx2322bDistilledVideoToVideoInput;
    output: Ltx2322bDistilledVideoToVideoOutput;
  };
  "fal-ai/ltx-2.3-22b/distilled/video-to-video/lora": {
    input: Ltx2322bDistilledVideoToVideoLoraInput;
    output: Ltx2322bDistilledVideoToVideoLoraOutput;
  };
  "fal-ai/ltx-2.3-22b/extend-video": {
    input: Ltx2322bExtendVideoInput;
    output: Ltx2322bExtendVideoOutput;
  };
  "fal-ai/ltx-2.3-22b/extend-video/lora": {
    input: Ltx2322bExtendVideoLoraInput;
    output: Ltx2322bExtendVideoLoraOutput;
  };
  "fal-ai/ltx-2.3-22b/image-to-video": {
    input: Ltx2322bImageToVideoInput;
    output: Ltx2322bImageToVideoOutput;
  };
  "fal-ai/ltx-2.3-22b/image-to-video/lora": {
    input: Ltx2322bImageToVideoLoraInput;
    output: Ltx2322bImageToVideoLoraOutput;
  };
  "fal-ai/ltx-2.3-22b/reference-video-to-video": {
    input: Ltx2322bReferenceVideoToVideoInput;
    output: Ltx2322bReferenceVideoToVideoOutput;
  };
  "fal-ai/ltx-2.3-22b/reference-video-to-video/lora": {
    input: Ltx2322bReferenceVideoToVideoLoraInput;
    output: Ltx2322bReferenceVideoToVideoLoraOutput;
  };
  "fal-ai/ltx-2.3-22b/text-to-video": {
    input: Ltx2322bTextToVideoInput;
    output: Ltx2322bTextToVideoOutput;
  };
  "fal-ai/ltx-2.3-22b/text-to-video/lora": {
    input: Ltx2322bTextToVideoLoraInput;
    output: Ltx2322bTextToVideoLoraOutput;
  };
  "fal-ai/ltx-2.3-22b/video-to-video": {
    input: Ltx2322bVideoToVideoInput;
    output: Ltx2322bVideoToVideoOutput;
  };
  "fal-ai/ltx-2.3-22b/video-to-video/lora": {
    input: Ltx2322bVideoToVideoLoraInput;
    output: Ltx2322bVideoToVideoLoraOutput;
  };
  "fal-ai/ltx-2.3/audio-to-video": {
    input: Ltx23AudioToVideoInput;
    output: Ltx23AudioToVideoOutput;
  };
  "fal-ai/ltx-2.3/extend-video": {
    input: Ltx23ExtendVideoInput;
    output: Ltx23ExtendVideoOutput;
  };
  "fal-ai/ltx-2.3/image-to-video": {
    input: Ltx23ImageToVideoInput;
    output: Ltx23ImageToVideoOutput;
  };
  "fal-ai/ltx-2.3/image-to-video/fast": {
    input: Ltx23ImageToVideoFastInput;
    output: Ltx23ImageToVideoFastOutput;
  };
  "fal-ai/ltx-2.3/retake-video": {
    input: Ltx23RetakeVideoInput;
    output: Ltx23RetakeVideoOutput;
  };
  "fal-ai/ltx-2.3/text-to-video": {
    input: Ltx23TextToVideoInput;
    output: Ltx23TextToVideoOutput;
  };
  "fal-ai/ltx-2.3/text-to-video/fast": {
    input: Ltx23TextToVideoFastInput;
    output: Ltx23TextToVideoFastOutput;
  };
  "fal-ai/ltx-2/audio-to-video": {
    input: Ltx2AudioToVideoInput;
    output: Ltx2AudioToVideoOutput;
  };
  "fal-ai/ltx-2/extend-video": {
    input: Ltx2ExtendVideoInput;
    output: Ltx2ExtendVideoOutput;
  };
  "fal-ai/ltx-2/image-to-video": {
    input: Ltx2ImageToVideoInput;
    output: Ltx2ImageToVideoOutput;
  };
  "fal-ai/ltx-2/image-to-video/fast": {
    input: Ltx2ImageToVideoFastInput;
    output: Ltx2ImageToVideoFastOutput;
  };
  "fal-ai/ltx-2/retake-video": {
    input: Ltx2RetakeVideoInput;
    output: Ltx2RetakeVideoOutput;
  };
  "fal-ai/ltx-2/text-to-video": {
    input: Ltx2TextToVideoInput;
    output: Ltx2TextToVideoOutput;
  };
  "fal-ai/ltx-2/text-to-video/fast": {
    input: Ltx2TextToVideoFastInput;
    output: Ltx2TextToVideoFastOutput;
  };
  "fal-ai/ltx-video": {
    input: LtxVideoInput;
    output: LtxVideoOutput;
  };
  "fal-ai/ltx-video-13b-dev": {
    input: LtxVideo13bDevInput;
    output: LtxVideo13bDevOutput;
  };
  "fal-ai/ltx-video-13b-dev/extend": {
    input: LtxVideo13bDevExtendInput;
    output: LtxVideo13bDevExtendOutput;
  };
  "fal-ai/ltx-video-13b-dev/image-to-video": {
    input: LtxVideo13bDevImageToVideoInput;
    output: LtxVideo13bDevImageToVideoOutput;
  };
  "fal-ai/ltx-video-13b-dev/multiconditioning": {
    input: LtxVideo13bDevMulticonditioningInput;
    output: LtxVideo13bDevMulticonditioningOutput;
  };
  "fal-ai/ltx-video-13b-distilled": {
    input: LtxVideo13bDistilledInput;
    output: LtxVideo13bDistilledOutput;
  };
  "fal-ai/ltx-video-13b-distilled/extend": {
    input: LtxVideo13bDistilledExtendInput;
    output: LtxVideo13bDistilledExtendOutput;
  };
  "fal-ai/ltx-video-13b-distilled/image-to-video": {
    input: LtxVideo13bDistilledImageToVideoInput;
    output: LtxVideo13bDistilledImageToVideoOutput;
  };
  "fal-ai/ltx-video-13b-distilled/multiconditioning": {
    input: LtxVideo13bDistilledMulticonditioningInput;
    output: LtxVideo13bDistilledMulticonditioningOutput;
  };
  "fal-ai/ltx-video-lora/image-to-video": {
    input: LtxVideoLoraImageToVideoInput;
    output: LtxVideoLoraImageToVideoOutput;
  };
  "fal-ai/ltx-video-lora/multiconditioning": {
    input: LtxVideoLoraMulticonditioningInput;
    output: LtxVideoLoraMulticonditioningOutput;
  };
  "fal-ai/ltx-video-v095": {
    input: LtxVideoV095Input;
    output: LtxVideoV095Output;
  };
  "fal-ai/ltx-video-v095/extend": {
    input: LtxVideoV095ExtendInput;
    output: LtxVideoV095ExtendOutput;
  };
  "fal-ai/ltx-video-v095/multiconditioning": {
    input: LtxVideoV095MulticonditioningInput;
    output: LtxVideoV095MulticonditioningOutput;
  };
  "fal-ai/ltx-video/image-to-video": {
    input: LtxVideoImageToVideoInput;
    output: LtxVideoImageToVideoOutput;
  };
  "fal-ai/ltxv-13b-098-distilled": {
    input: Ltxv13B098DistilledInput;
    output: Ltxv13B098DistilledOutput;
  };
  "fal-ai/ltxv-13b-098-distilled/extend": {
    input: Ltxv13B098DistilledExtendInput;
    output: Ltxv13B098DistilledExtendOutput;
  };
  "fal-ai/ltxv-13b-098-distilled/image-to-video": {
    input: Ltxv13B098DistilledImageToVideoInput;
    output: Ltxv13B098DistilledImageToVideoOutput;
  };
  "fal-ai/ltxv-13b-098-distilled/multiconditioning": {
    input: Ltxv13B098DistilledMulticonditioningInput;
    output: Ltxv13B098DistilledMulticonditioningOutput;
  };
  "fal-ai/luma-dream-machine/ray-2": {
    input: LumaDreamMachineRay2Input;
    output: LumaDreamMachineRay2Output;
  };
  "fal-ai/luma-dream-machine/ray-2-flash": {
    input: LumaDreamMachineRay2FlashInput;
    output: LumaDreamMachineRay2FlashOutput;
  };
  "fal-ai/luma-dream-machine/ray-2-flash/image-to-video": {
    input: LumaDreamMachineRay2FlashImageToVideoInput;
    output: LumaDreamMachineRay2FlashImageToVideoOutput;
  };
  "fal-ai/luma-dream-machine/ray-2-flash/modify": {
    input: LumaDreamMachineRay2FlashModifyInput;
    output: LumaDreamMachineRay2FlashModifyOutput;
  };
  "fal-ai/luma-dream-machine/ray-2-flash/reframe": {
    input: LumaDreamMachineRay2FlashReframeInput;
    output: LumaDreamMachineRay2FlashReframeOutput;
  };
  "fal-ai/luma-dream-machine/ray-2/image-to-video": {
    input: LumaDreamMachineRay2ImageToVideoInput;
    output: LumaDreamMachineRay2ImageToVideoOutput;
  };
  "fal-ai/luma-dream-machine/ray-2/modify": {
    input: LumaDreamMachineRay2ModifyInput;
    output: LumaDreamMachineRay2ModifyOutput;
  };
  "fal-ai/luma-dream-machine/ray-2/reframe": {
    input: LumaDreamMachineRay2ReframeInput;
    output: LumaDreamMachineRay2ReframeOutput;
  };
  "fal-ai/magi": {
    input: MagiInput;
    output: MagiOutput;
  };
  "fal-ai/magi-distilled": {
    input: MagiDistilledInput;
    output: MagiDistilledOutput;
  };
  "fal-ai/magi-distilled/extend-video": {
    input: MagiDistilledExtendVideoInput;
    output: MagiDistilledExtendVideoOutput;
  };
  "fal-ai/magi-distilled/image-to-video": {
    input: MagiDistilledImageToVideoInput;
    output: MagiDistilledImageToVideoOutput;
  };
  "fal-ai/magi/extend-video": {
    input: MagiExtendVideoInput;
    output: MagiExtendVideoOutput;
  };
  "fal-ai/magi/image-to-video": {
    input: MagiImageToVideoInput;
    output: MagiImageToVideoOutput;
  };
  "fal-ai/minimax/hailuo-02-fast/image-to-video": {
    input: MinimaxHailuo02FastImageToVideoInput;
    output: MinimaxHailuo02FastImageToVideoOutput;
  };
  "fal-ai/minimax/hailuo-02/pro/image-to-video": {
    input: MinimaxHailuo02ProImageToVideoInput;
    output: MinimaxHailuo02ProImageToVideoOutput;
  };
  "fal-ai/minimax/hailuo-02/pro/text-to-video": {
    input: MinimaxHailuo02ProTextToVideoInput;
    output: MinimaxHailuo02ProTextToVideoOutput;
  };
  "fal-ai/minimax/hailuo-02/standard/image-to-video": {
    input: MinimaxHailuo02StandardImageToVideoInput;
    output: MinimaxHailuo02StandardImageToVideoOutput;
  };
  "fal-ai/minimax/hailuo-02/standard/text-to-video": {
    input: MinimaxHailuo02StandardTextToVideoInput;
    output: MinimaxHailuo02StandardTextToVideoOutput;
  };
  "fal-ai/minimax/hailuo-2.3-fast/pro/image-to-video": {
    input: MinimaxHailuo23FastProImageToVideoInput;
    output: MinimaxHailuo23FastProImageToVideoOutput;
  };
  "fal-ai/minimax/hailuo-2.3-fast/standard/image-to-video": {
    input: MinimaxHailuo23FastStandardImageToVideoInput;
    output: MinimaxHailuo23FastStandardImageToVideoOutput;
  };
  "fal-ai/minimax/hailuo-2.3/pro/image-to-video": {
    input: MinimaxHailuo23ProImageToVideoInput;
    output: MinimaxHailuo23ProImageToVideoOutput;
  };
  "fal-ai/minimax/hailuo-2.3/pro/text-to-video": {
    input: MinimaxHailuo23ProTextToVideoInput;
    output: MinimaxHailuo23ProTextToVideoOutput;
  };
  "fal-ai/minimax/hailuo-2.3/standard/image-to-video": {
    input: MinimaxHailuo23StandardImageToVideoInput;
    output: MinimaxHailuo23StandardImageToVideoOutput;
  };
  "fal-ai/minimax/hailuo-2.3/standard/text-to-video": {
    input: MinimaxHailuo23StandardTextToVideoInput;
    output: MinimaxHailuo23StandardTextToVideoOutput;
  };
  "fal-ai/minimax/video-01": {
    input: MinimaxVideo01Input;
    output: MinimaxVideo01Output;
  };
  "fal-ai/minimax/video-01-director": {
    input: MinimaxVideo01DirectorInput;
    output: MinimaxVideo01DirectorOutput;
  };
  "fal-ai/minimax/video-01-director/image-to-video": {
    input: MinimaxVideo01DirectorImageToVideoInput;
    output: MinimaxVideo01DirectorImageToVideoOutput;
  };
  "fal-ai/minimax/video-01-live": {
    input: MinimaxVideo01LiveInput;
    output: MinimaxVideo01LiveOutput;
  };
  "fal-ai/minimax/video-01-live/image-to-video": {
    input: MinimaxVideo01LiveImageToVideoInput;
    output: MinimaxVideo01LiveImageToVideoOutput;
  };
  "fal-ai/minimax/video-01-subject-reference": {
    input: MinimaxVideo01SubjectReferenceInput;
    output: MinimaxVideo01SubjectReferenceOutput;
  };
  "fal-ai/minimax/video-01/image-to-video": {
    input: MinimaxVideo01ImageToVideoInput;
    output: MinimaxVideo01ImageToVideoOutput;
  };
  "fal-ai/mmaudio-v2": {
    input: MmaudioV2Input;
    output: MmaudioV2Output;
  };
  "fal-ai/mochi-v1": {
    input: MochiV1Input;
    output: MochiV1Output;
  };
  "fal-ai/multishot-master": {
    input: MultishotMasterInput;
    output: MultishotMasterOutput;
  };
  "fal-ai/musetalk": {
    input: MusetalkInput;
    output: MusetalkOutput;
  };
  "fal-ai/one-to-all-animation/1.3b": {
    input: OneToAllAnimation13bInput;
    output: OneToAllAnimation13bOutput;
  };
  "fal-ai/one-to-all-animation/14b": {
    input: OneToAllAnimation14bInput;
    output: OneToAllAnimation14bOutput;
  };
  "fal-ai/ovi": {
    input: OviInput;
    output: OviOutput;
  };
  "fal-ai/ovi/image-to-video": {
    input: OviImageToVideoInput;
    output: OviImageToVideoOutput;
  };
  "fal-ai/pika/v1.5/pikaffects": {
    input: PikaV15PikaffectsInput;
    output: PikaV15PikaffectsOutput;
  };
  "fal-ai/pika/v2.1/image-to-video": {
    input: PikaV21ImageToVideoInput;
    output: PikaV21ImageToVideoOutput;
  };
  "fal-ai/pika/v2.1/text-to-video": {
    input: PikaV21TextToVideoInput;
    output: PikaV21TextToVideoOutput;
  };
  "fal-ai/pika/v2.2/image-to-video": {
    input: PikaV22ImageToVideoInput;
    output: PikaV22ImageToVideoOutput;
  };
  "fal-ai/pika/v2.2/pikaframes": {
    input: PikaV22PikaframesInput;
    output: PikaV22PikaframesOutput;
  };
  "fal-ai/pika/v2.2/pikascenes": {
    input: PikaV22PikascenesInput;
    output: PikaV22PikascenesOutput;
  };
  "fal-ai/pika/v2.2/text-to-video": {
    input: PikaV22TextToVideoInput;
    output: PikaV22TextToVideoOutput;
  };
  "fal-ai/pika/v2/pikadditions": {
    input: PikaV2PikadditionsInput;
    output: PikaV2PikadditionsOutput;
  };
  "fal-ai/pika/v2/turbo/image-to-video": {
    input: PikaV2TurboImageToVideoInput;
    output: PikaV2TurboImageToVideoOutput;
  };
  "fal-ai/pika/v2/turbo/text-to-video": {
    input: PikaV2TurboTextToVideoInput;
    output: PikaV2TurboTextToVideoOutput;
  };
  "fal-ai/pixverse/c1/image-to-video": {
    input: PixverseC1ImageToVideoInput;
    output: PixverseC1ImageToVideoOutput;
  };
  "fal-ai/pixverse/c1/reference-to-video": {
    input: PixverseC1ReferenceToVideoInput;
    output: PixverseC1ReferenceToVideoOutput;
  };
  "fal-ai/pixverse/c1/text-to-video": {
    input: PixverseC1TextToVideoInput;
    output: PixverseC1TextToVideoOutput;
  };
  "fal-ai/pixverse/c1/transition": {
    input: PixverseC1TransitionInput;
    output: PixverseC1TransitionOutput;
  };
  "fal-ai/pixverse/extend": {
    input: PixverseExtendInput;
    output: PixverseExtendOutput;
  };
  "fal-ai/pixverse/extend/fast": {
    input: PixverseExtendFastInput;
    output: PixverseExtendFastOutput;
  };
  "fal-ai/pixverse/lipsync": {
    input: PixverseLipsyncInput;
    output: PixverseLipsyncOutput;
  };
  "fal-ai/pixverse/sound-effects": {
    input: PixverseSoundEffectsInput;
    output: PixverseSoundEffectsOutput;
  };
  "fal-ai/pixverse/swap": {
    input: PixverseSwapInput;
    output: PixverseSwapOutput;
  };
  "fal-ai/pixverse/v3.5/effects": {
    input: PixverseV35EffectsInput;
    output: PixverseV35EffectsOutput;
  };
  "fal-ai/pixverse/v3.5/image-to-video": {
    input: PixverseV35ImageToVideoInput;
    output: PixverseV35ImageToVideoOutput;
  };
  "fal-ai/pixverse/v3.5/image-to-video/fast": {
    input: PixverseV35ImageToVideoFastInput;
    output: PixverseV35ImageToVideoFastOutput;
  };
  "fal-ai/pixverse/v3.5/text-to-video": {
    input: PixverseV35TextToVideoInput;
    output: PixverseV35TextToVideoOutput;
  };
  "fal-ai/pixverse/v3.5/text-to-video/fast": {
    input: PixverseV35TextToVideoFastInput;
    output: PixverseV35TextToVideoFastOutput;
  };
  "fal-ai/pixverse/v3.5/transition": {
    input: PixverseV35TransitionInput;
    output: PixverseV35TransitionOutput;
  };
  "fal-ai/pixverse/v4.5/effects": {
    input: PixverseV45EffectsInput;
    output: PixverseV45EffectsOutput;
  };
  "fal-ai/pixverse/v4.5/image-to-video": {
    input: PixverseV45ImageToVideoInput;
    output: PixverseV45ImageToVideoOutput;
  };
  "fal-ai/pixverse/v4.5/image-to-video/fast": {
    input: PixverseV45ImageToVideoFastInput;
    output: PixverseV45ImageToVideoFastOutput;
  };
  "fal-ai/pixverse/v4.5/text-to-video": {
    input: PixverseV45TextToVideoInput;
    output: PixverseV45TextToVideoOutput;
  };
  "fal-ai/pixverse/v4.5/text-to-video/fast": {
    input: PixverseV45TextToVideoFastInput;
    output: PixverseV45TextToVideoFastOutput;
  };
  "fal-ai/pixverse/v4.5/transition": {
    input: PixverseV45TransitionInput;
    output: PixverseV45TransitionOutput;
  };
  "fal-ai/pixverse/v4/effects": {
    input: PixverseV4EffectsInput;
    output: PixverseV4EffectsOutput;
  };
  "fal-ai/pixverse/v4/image-to-video": {
    input: PixverseV4ImageToVideoInput;
    output: PixverseV4ImageToVideoOutput;
  };
  "fal-ai/pixverse/v4/image-to-video/fast": {
    input: PixverseV4ImageToVideoFastInput;
    output: PixverseV4ImageToVideoFastOutput;
  };
  "fal-ai/pixverse/v4/text-to-video": {
    input: PixverseV4TextToVideoInput;
    output: PixverseV4TextToVideoOutput;
  };
  "fal-ai/pixverse/v4/text-to-video/fast": {
    input: PixverseV4TextToVideoFastInput;
    output: PixverseV4TextToVideoFastOutput;
  };
  "fal-ai/pixverse/v5.5/effects": {
    input: PixverseV55EffectsInput;
    output: PixverseV55EffectsOutput;
  };
  "fal-ai/pixverse/v5.5/image-to-video": {
    input: PixverseV55ImageToVideoInput;
    output: PixverseV55ImageToVideoOutput;
  };
  "fal-ai/pixverse/v5.5/text-to-video": {
    input: PixverseV55TextToVideoInput;
    output: PixverseV55TextToVideoOutput;
  };
  "fal-ai/pixverse/v5.5/transition": {
    input: PixverseV55TransitionInput;
    output: PixverseV55TransitionOutput;
  };
  "fal-ai/pixverse/v5.6/image-to-video": {
    input: PixverseV56ImageToVideoInput;
    output: PixverseV56ImageToVideoOutput;
  };
  "fal-ai/pixverse/v5.6/text-to-video": {
    input: PixverseV56TextToVideoInput;
    output: PixverseV56TextToVideoOutput;
  };
  "fal-ai/pixverse/v5.6/transition": {
    input: PixverseV56TransitionInput;
    output: PixverseV56TransitionOutput;
  };
  "fal-ai/pixverse/v5/effects": {
    input: PixverseV5EffectsInput;
    output: PixverseV5EffectsOutput;
  };
  "fal-ai/pixverse/v5/image-to-video": {
    input: PixverseV5ImageToVideoInput;
    output: PixverseV5ImageToVideoOutput;
  };
  "fal-ai/pixverse/v5/text-to-video": {
    input: PixverseV5TextToVideoInput;
    output: PixverseV5TextToVideoOutput;
  };
  "fal-ai/pixverse/v5/transition": {
    input: PixverseV5TransitionInput;
    output: PixverseV5TransitionOutput;
  };
  "fal-ai/pixverse/v6/extend": {
    input: PixverseV6ExtendInput;
    output: PixverseV6ExtendOutput;
  };
  "fal-ai/pixverse/v6/image-to-video": {
    input: PixverseV6ImageToVideoInput;
    output: PixverseV6ImageToVideoOutput;
  };
  "fal-ai/pixverse/v6/text-to-video": {
    input: PixverseV6TextToVideoInput;
    output: PixverseV6TextToVideoOutput;
  };
  "fal-ai/pixverse/v6/transition": {
    input: PixverseV6TransitionInput;
    output: PixverseV6TransitionOutput;
  };
  "fal-ai/rife/video": {
    input: RifeVideoInput;
    output: RifeVideoOutput;
  };
  "fal-ai/sadtalker": {
    input: SadtalkerInput;
    output: SadtalkerOutput;
  };
  "fal-ai/sadtalker/reference": {
    input: SadtalkerReferenceInput;
    output: SadtalkerReferenceOutput;
  };
  "fal-ai/sam-3-1/video": {
    input: Sam31VideoInput;
    output: Sam31VideoOutput;
  };
  "fal-ai/sam-3-1/video-rle": {
    input: Sam31VideoRleInput;
    output: Sam31VideoRleOutput;
  };
  "fal-ai/sam-3/video": {
    input: Sam3VideoInput;
    output: Sam3VideoOutput;
  };
  "fal-ai/sam-3/video-rle": {
    input: Sam3VideoRleInput;
    output: Sam3VideoRleOutput;
  };
  "fal-ai/sam2/video": {
    input: Sam2VideoInput;
    output: Sam2VideoOutput;
  };
  "fal-ai/sana-video": {
    input: SanaVideoInput;
    output: SanaVideoOutput;
  };
  "fal-ai/scail": {
    input: ScailInput;
    output: ScailOutput;
  };
  "fal-ai/seedvr/upscale/video": {
    input: SeedvrUpscaleVideoInput;
    output: SeedvrUpscaleVideoOutput;
  };
  "fal-ai/skyreels-i2v": {
    input: SkyreelsI2vInput;
    output: SkyreelsI2vOutput;
  };
  "fal-ai/sora-2/characters": {
    input: Sora2CharactersInput;
    output: Sora2CharactersOutput;
  };
  "fal-ai/sora-2/image-to-video": {
    input: Sora2ImageToVideoInput;
    output: Sora2ImageToVideoOutput;
  };
  "fal-ai/sora-2/image-to-video/pro": {
    input: Sora2ImageToVideoProInput;
    output: Sora2ImageToVideoProOutput;
  };
  "fal-ai/sora-2/text-to-video": {
    input: Sora2TextToVideoInput;
    output: Sora2TextToVideoOutput;
  };
  "fal-ai/sora-2/text-to-video/pro": {
    input: Sora2TextToVideoProInput;
    output: Sora2TextToVideoProOutput;
  };
  "fal-ai/sora-2/video-to-video/remix": {
    input: Sora2VideoToVideoRemixInput;
    output: Sora2VideoToVideoRemixOutput;
  };
  "fal-ai/stable-avatar": {
    input: StableAvatarInput;
    output: StableAvatarOutput;
  };
  "fal-ai/stable-video": {
    input: StableVideoInput;
    output: StableVideoOutput;
  };
  "fal-ai/steady-dancer": {
    input: SteadyDancerInput;
    output: SteadyDancerOutput;
  };
  "fal-ai/sync-lipsync": {
    input: SyncLipsyncInput;
    output: SyncLipsyncOutput;
  };
  "fal-ai/sync-lipsync/react-1": {
    input: SyncLipsyncReact1Input;
    output: SyncLipsyncReact1Output;
  };
  "fal-ai/sync-lipsync/v2": {
    input: SyncLipsyncV2Input;
    output: SyncLipsyncV2Output;
  };
  "fal-ai/sync-lipsync/v2/pro": {
    input: SyncLipsyncV2ProInput;
    output: SyncLipsyncV2ProOutput;
  };
  "fal-ai/sync-lipsync/v3": {
    input: SyncLipsyncV3Input;
    output: SyncLipsyncV3Output;
  };
  "fal-ai/t2v-turbo": {
    input: T2vTurboInput;
    output: T2vTurboOutput;
  };
  "fal-ai/thinksound": {
    input: ThinksoundInput;
    output: ThinksoundOutput;
  };
  "fal-ai/thinksound/audio": {
    input: ThinksoundAudioInput;
    output: ThinksoundAudioOutput;
  };
  "fal-ai/topaz/upscale/video": {
    input: TopazUpscaleVideoInput;
    output: TopazUpscaleVideoOutput;
  };
  "fal-ai/transpixar": {
    input: TranspixarInput;
    output: TranspixarOutput;
  };
  "fal-ai/veo2": {
    input: Veo2Input;
    output: Veo2Output;
  };
  "fal-ai/veo2/image-to-video": {
    input: Veo2ImageToVideoInput;
    output: Veo2ImageToVideoOutput;
  };
  "fal-ai/veo3": {
    input: Veo3Input;
    output: Veo3Output;
  };
  "fal-ai/veo3.1": {
    input: Veo31Input;
    output: Veo31Output;
  };
  "fal-ai/veo3.1/extend-video": {
    input: Veo31ExtendVideoInput;
    output: Veo31ExtendVideoOutput;
  };
  "fal-ai/veo3.1/fast": {
    input: Veo31FastInput;
    output: Veo31FastOutput;
  };
  "fal-ai/veo3.1/fast/extend-video": {
    input: Veo31FastExtendVideoInput;
    output: Veo31FastExtendVideoOutput;
  };
  "fal-ai/veo3.1/fast/first-last-frame-to-video": {
    input: Veo31FastFirstLastFrameToVideoInput;
    output: Veo31FastFirstLastFrameToVideoOutput;
  };
  "fal-ai/veo3.1/fast/image-to-video": {
    input: Veo31FastImageToVideoInput;
    output: Veo31FastImageToVideoOutput;
  };
  "fal-ai/veo3.1/first-last-frame-to-video": {
    input: Veo31FirstLastFrameToVideoInput;
    output: Veo31FirstLastFrameToVideoOutput;
  };
  "fal-ai/veo3.1/image-to-video": {
    input: Veo31ImageToVideoInput;
    output: Veo31ImageToVideoOutput;
  };
  "fal-ai/veo3.1/lite": {
    input: Veo31LiteInput;
    output: Veo31LiteOutput;
  };
  "fal-ai/veo3.1/lite/first-last-frame-to-video": {
    input: Veo31LiteFirstLastFrameToVideoInput;
    output: Veo31LiteFirstLastFrameToVideoOutput;
  };
  "fal-ai/veo3.1/lite/image-to-video": {
    input: Veo31LiteImageToVideoInput;
    output: Veo31LiteImageToVideoOutput;
  };
  "fal-ai/veo3.1/reference-to-video": {
    input: Veo31ReferenceToVideoInput;
    output: Veo31ReferenceToVideoOutput;
  };
  "fal-ai/veo3/fast": {
    input: Veo3FastInput;
    output: Veo3FastOutput;
  };
  "fal-ai/veo3/fast/image-to-video": {
    input: Veo3FastImageToVideoInput;
    output: Veo3FastImageToVideoOutput;
  };
  "fal-ai/veo3/image-to-video": {
    input: Veo3ImageToVideoInput;
    output: Veo3ImageToVideoOutput;
  };
  "fal-ai/video-as-prompt": {
    input: VideoAsPromptInput;
    output: VideoAsPromptOutput;
  };
  "fal-ai/video-upscaler": {
    input: VideoUpscalerInput;
    output: VideoUpscalerOutput;
  };
  "fal-ai/vidu/image-to-video": {
    input: ViduImageToVideoInput;
    output: ViduImageToVideoOutput;
  };
  "fal-ai/vidu/q1/image-to-video": {
    input: ViduQ1ImageToVideoInput;
    output: ViduQ1ImageToVideoOutput;
  };
  "fal-ai/vidu/q1/reference-to-video": {
    input: ViduQ1ReferenceToVideoInput;
    output: ViduQ1ReferenceToVideoOutput;
  };
  "fal-ai/vidu/q1/start-end-to-video": {
    input: ViduQ1StartEndToVideoInput;
    output: ViduQ1StartEndToVideoOutput;
  };
  "fal-ai/vidu/q1/text-to-video": {
    input: ViduQ1TextToVideoInput;
    output: ViduQ1TextToVideoOutput;
  };
  "fal-ai/vidu/q2/image-to-video/pro": {
    input: ViduQ2ImageToVideoProInput;
    output: ViduQ2ImageToVideoProOutput;
  };
  "fal-ai/vidu/q2/image-to-video/turbo": {
    input: ViduQ2ImageToVideoTurboInput;
    output: ViduQ2ImageToVideoTurboOutput;
  };
  "fal-ai/vidu/q2/reference-to-video/pro": {
    input: ViduQ2ReferenceToVideoProInput;
    output: ViduQ2ReferenceToVideoProOutput;
  };
  "fal-ai/vidu/q2/text-to-video": {
    input: ViduQ2TextToVideoInput;
    output: ViduQ2TextToVideoOutput;
  };
  "fal-ai/vidu/q2/video-extension/pro": {
    input: ViduQ2VideoExtensionProInput;
    output: ViduQ2VideoExtensionProOutput;
  };
  "fal-ai/vidu/q3/image-to-video": {
    input: ViduQ3ImageToVideoInput;
    output: ViduQ3ImageToVideoOutput;
  };
  "fal-ai/vidu/q3/image-to-video/turbo": {
    input: ViduQ3ImageToVideoTurboInput;
    output: ViduQ3ImageToVideoTurboOutput;
  };
  "fal-ai/vidu/q3/reference-to-video/mix": {
    input: ViduQ3ReferenceToVideoMixInput;
    output: ViduQ3ReferenceToVideoMixOutput;
  };
  "fal-ai/vidu/q3/text-to-video": {
    input: ViduQ3TextToVideoInput;
    output: ViduQ3TextToVideoOutput;
  };
  "fal-ai/vidu/q3/text-to-video/turbo": {
    input: ViduQ3TextToVideoTurboInput;
    output: ViduQ3TextToVideoTurboOutput;
  };
  "fal-ai/vidu/reference-to-video": {
    input: ViduReferenceToVideoInput;
    output: ViduReferenceToVideoOutput;
  };
  "fal-ai/vidu/start-end-to-video": {
    input: ViduStartEndToVideoInput;
    output: ViduStartEndToVideoOutput;
  };
  "fal-ai/vidu/template-to-video": {
    input: ViduTemplateToVideoInput;
    output: ViduTemplateToVideoOutput;
  };
  "fal-ai/wan-22-vace-fun-a14b/depth": {
    input: Wan22VaceFunA14bDepthInput;
    output: Wan22VaceFunA14bDepthOutput;
  };
  "fal-ai/wan-22-vace-fun-a14b/inpainting": {
    input: Wan22VaceFunA14bInpaintingInput;
    output: Wan22VaceFunA14bInpaintingOutput;
  };
  "fal-ai/wan-22-vace-fun-a14b/outpainting": {
    input: Wan22VaceFunA14bOutpaintingInput;
    output: Wan22VaceFunA14bOutpaintingOutput;
  };
  "fal-ai/wan-22-vace-fun-a14b/pose": {
    input: Wan22VaceFunA14bPoseInput;
    output: Wan22VaceFunA14bPoseOutput;
  };
  "fal-ai/wan-22-vace-fun-a14b/reframe": {
    input: Wan22VaceFunA14bReframeInput;
    output: Wan22VaceFunA14bReframeOutput;
  };
  "fal-ai/wan-25-preview/image-to-video": {
    input: Wan25PreviewImageToVideoInput;
    output: Wan25PreviewImageToVideoOutput;
  };
  "fal-ai/wan-25-preview/text-to-video": {
    input: Wan25PreviewTextToVideoInput;
    output: Wan25PreviewTextToVideoOutput;
  };
  "fal-ai/wan-alpha": {
    input: WanAlphaInput;
    output: WanAlphaOutput;
  };
  "fal-ai/wan-ati": {
    input: WanAtiInput;
    output: WanAtiOutput;
  };
  "fal-ai/wan-effects": {
    input: WanEffectsInput;
    output: WanEffectsOutput;
  };
  "fal-ai/wan-flf2v": {
    input: WanFlf2vInput;
    output: WanFlf2vOutput;
  };
  "fal-ai/wan-fun-control": {
    input: WanFunControlInput;
    output: WanFunControlOutput;
  };
  "fal-ai/wan-i2v": {
    input: WanI2vInput;
    output: WanI2vOutput;
  };
  "fal-ai/wan-i2v-lora": {
    input: WanI2vLoraInput;
    output: WanI2vLoraOutput;
  };
  "fal-ai/wan-motion": {
    input: WanMotionInput;
    output: WanMotionOutput;
  };
  "fal-ai/wan-move": {
    input: WanMoveInput;
    output: WanMoveOutput;
  };
  "fal-ai/wan-pro/image-to-video": {
    input: WanProImageToVideoInput;
    output: WanProImageToVideoOutput;
  };
  "fal-ai/wan-pro/text-to-video": {
    input: WanProTextToVideoInput;
    output: WanProTextToVideoOutput;
  };
  "fal-ai/wan-t2v": {
    input: WanT2vInput;
    output: WanT2vOutput;
  };
  "fal-ai/wan-t2v-lora": {
    input: WanT2vLoraInput;
    output: WanT2vLoraOutput;
  };
  "fal-ai/wan-vace": {
    input: WanVaceInput;
    output: WanVaceOutput;
  };
  "fal-ai/wan-vace-1-3b": {
    input: WanVace13bInput;
    output: WanVace13bOutput;
  };
  "fal-ai/wan-vace-14b": {
    input: WanVace14bInput;
    output: WanVace14bOutput;
  };
  "fal-ai/wan-vace-14b/depth": {
    input: WanVace14bDepthInput;
    output: WanVace14bDepthOutput;
  };
  "fal-ai/wan-vace-14b/inpainting": {
    input: WanVace14bInpaintingInput;
    output: WanVace14bInpaintingOutput;
  };
  "fal-ai/wan-vace-14b/outpainting": {
    input: WanVace14bOutpaintingInput;
    output: WanVace14bOutpaintingOutput;
  };
  "fal-ai/wan-vace-14b/pose": {
    input: WanVace14bPoseInput;
    output: WanVace14bPoseOutput;
  };
  "fal-ai/wan-vace-14b/reframe": {
    input: WanVace14bReframeInput;
    output: WanVace14bReframeOutput;
  };
  "fal-ai/wan-vace-apps/long-reframe": {
    input: WanVaceAppsLongReframeInput;
    output: WanVaceAppsLongReframeOutput;
  };
  "fal-ai/wan-vace-apps/video-edit": {
    input: WanVaceAppsVideoEditInput;
    output: WanVaceAppsVideoEditOutput;
  };
  "fal-ai/wan-vision-enhancer": {
    input: WanVisionEnhancerInput;
    output: WanVisionEnhancerOutput;
  };
  "fal-ai/wan/v2.2-14b/animate/move": {
    input: WanV2214bAnimateMoveInput;
    output: WanV2214bAnimateMoveOutput;
  };
  "fal-ai/wan/v2.2-14b/animate/replace": {
    input: WanV2214bAnimateReplaceInput;
    output: WanV2214bAnimateReplaceOutput;
  };
  "fal-ai/wan/v2.2-14b/speech-to-video": {
    input: WanV2214bSpeechToVideoInput;
    output: WanV2214bSpeechToVideoOutput;
  };
  "fal-ai/wan/v2.2-5b/image-to-video": {
    input: WanV225bImageToVideoInput;
    output: WanV225bImageToVideoOutput;
  };
  "fal-ai/wan/v2.2-5b/text-to-video": {
    input: WanV225bTextToVideoInput;
    output: WanV225bTextToVideoOutput;
  };
  "fal-ai/wan/v2.2-5b/text-to-video/distill": {
    input: WanV225bTextToVideoDistillInput;
    output: WanV225bTextToVideoDistillOutput;
  };
  "fal-ai/wan/v2.2-5b/text-to-video/fast-wan": {
    input: WanV225bTextToVideoFastWanInput;
    output: WanV225bTextToVideoFastWanOutput;
  };
  "fal-ai/wan/v2.2-a14b/image-to-video": {
    input: WanV22A14bImageToVideoInput;
    output: WanV22A14bImageToVideoOutput;
  };
  "fal-ai/wan/v2.2-a14b/image-to-video/lora": {
    input: WanV22A14bImageToVideoLoraInput;
    output: WanV22A14bImageToVideoLoraOutput;
  };
  "fal-ai/wan/v2.2-a14b/image-to-video/turbo": {
    input: WanV22A14bImageToVideoTurboInput;
    output: WanV22A14bImageToVideoTurboOutput;
  };
  "fal-ai/wan/v2.2-a14b/text-to-video": {
    input: WanV22A14bTextToVideoInput;
    output: WanV22A14bTextToVideoOutput;
  };
  "fal-ai/wan/v2.2-a14b/text-to-video/lora": {
    input: WanV22A14bTextToVideoLoraInput;
    output: WanV22A14bTextToVideoLoraOutput;
  };
  "fal-ai/wan/v2.2-a14b/text-to-video/turbo": {
    input: WanV22A14bTextToVideoTurboInput;
    output: WanV22A14bTextToVideoTurboOutput;
  };
  "fal-ai/wan/v2.2-a14b/video-to-video": {
    input: WanV22A14bVideoToVideoInput;
    output: WanV22A14bVideoToVideoOutput;
  };
  "fal-ai/wan/v2.7/edit-video": {
    input: WanV27EditVideoInput;
    output: WanV27EditVideoOutput;
  };
  "fal-ai/wan/v2.7/image-to-video": {
    input: WanV27ImageToVideoInput;
    output: WanV27ImageToVideoOutput;
  };
  "fal-ai/wan/v2.7/reference-to-video": {
    input: WanV27ReferenceToVideoInput;
    output: WanV27ReferenceToVideoOutput;
  };
  "fal-ai/wan/v2.7/text-to-video": {
    input: WanV27TextToVideoInput;
    output: WanV27TextToVideoOutput;
  };
  "fal-ai/workflow-utilities/auto-subtitle": {
    input: WorkflowUtilitiesAutoSubtitleInput;
    output: WorkflowUtilitiesAutoSubtitleOutput;
  };
  "fal-ai/workflow-utilities/blend-video": {
    input: WorkflowUtilitiesBlendVideoInput;
    output: WorkflowUtilitiesBlendVideoOutput;
  };
  "fal-ai/workflow-utilities/reverse-video": {
    input: WorkflowUtilitiesReverseVideoInput;
    output: WorkflowUtilitiesReverseVideoOutput;
  };
  "fal-ai/workflow-utilities/scale-video": {
    input: WorkflowUtilitiesScaleVideoInput;
    output: WorkflowUtilitiesScaleVideoOutput;
  };
  "fal-ai/workflow-utilities/trim-video": {
    input: WorkflowUtilitiesTrimVideoInput;
    output: WorkflowUtilitiesTrimVideoOutput;
  };
  "mirelo-ai/sfx-v1.5/video-to-video": {
    input: SfxV15VideoToVideoInput;
    output: SfxV15VideoToVideoOutput;
  };
  "mirelo-ai/sfx-v1/video-to-video": {
    input: SfxV1VideoToVideoInput;
    output: SfxV1VideoToVideoOutput;
  };
  "moonvalley/marey/i2v": {
    input: MareyI2vInput;
    output: MareyI2vOutput;
  };
  "moonvalley/marey/motion-transfer": {
    input: MareyMotionTransferInput;
    output: MareyMotionTransferOutput;
  };
  "moonvalley/marey/pose-transfer": {
    input: MareyPoseTransferInput;
    output: MareyPoseTransferOutput;
  };
  "moonvalley/marey/t2v": {
    input: MareyT2vInput;
    output: MareyT2vOutput;
  };
  "veed/avatars/audio-to-video": {
    input: AvatarsAudioToVideoInput;
    output: AvatarsAudioToVideoOutput;
  };
  "veed/avatars/text-to-video": {
    input: AvatarsTextToVideoInput;
    output: AvatarsTextToVideoOutput;
  };
  "veed/fabric-1.0": {
    input: Fabric10Input;
    output: Fabric10Output;
  };
  "veed/fabric-1.0/fast": {
    input: Fabric10FastInput;
    output: Fabric10FastOutput;
  };
  "veed/fabric-1.0/text": {
    input: Fabric10TextInput;
    output: Fabric10TextOutput;
  };
  "veed/lipsync": {
    input: LipsyncInput;
    output: LipsyncOutput;
  };
  "veed/video-background-removal": {
    input: VideoBackgroundRemovalInputType2;
    output: VideoBackgroundRemovalOutputType2;
  };
  "veed/video-background-removal/fast": {
    input: VideoBackgroundRemovalFastInput;
    output: VideoBackgroundRemovalFastOutput;
  };
  "veed/video-background-removal/green-screen": {
    input: VideoBackgroundRemovalGreenScreenInput;
    output: VideoBackgroundRemovalGreenScreenOutput;
  };
  "wan/v2.6/image-to-video": {
    input: V26ImageToVideoInput;
    output: V26ImageToVideoOutput;
  };
  "wan/v2.6/image-to-video/flash": {
    input: V26ImageToVideoFlashInput;
    output: V26ImageToVideoFlashOutput;
  };
  "wan/v2.6/reference-to-video": {
    input: V26ReferenceToVideoInput;
    output: V26ReferenceToVideoOutput;
  };
  "wan/v2.6/reference-to-video/flash": {
    input: V26ReferenceToVideoFlashInput;
    output: V26ReferenceToVideoFlashOutput;
  };
  "wan/v2.6/text-to-video": {
    input: V26TextToVideoInput;
    output: V26TextToVideoOutput;
  };
  "xai/grok-imagine-video/edit-video": {
    input: GrokImagineVideoEditVideoInput;
    output: GrokImagineVideoEditVideoOutput;
  };
  "xai/grok-imagine-video/extend-video": {
    input: GrokImagineVideoExtendVideoInput;
    output: GrokImagineVideoExtendVideoOutput;
  };
  "xai/grok-imagine-video/image-to-video": {
    input: GrokImagineVideoImageToVideoInput;
    output: GrokImagineVideoImageToVideoOutput;
  };
  "xai/grok-imagine-video/reference-to-video": {
    input: GrokImagineVideoReferenceToVideoInput;
    output: GrokImagineVideoReferenceToVideoOutput;
  };
  "xai/grok-imagine-video/text-to-video": {
    input: GrokImagineVideoTextToVideoInput;
    output: GrokImagineVideoTextToVideoOutput;
  };
};

/** Union type of all video model endpoint IDs */
export type VideoModel = keyof VideoEndpointMap;

/** Get the input type for a specific video model */
export type VideoModelInput<T extends VideoModel> =
  VideoEndpointMap[T]["input"];

/** Get the output type for a specific video model */
export type VideoModelOutput<T extends VideoModel> =
  VideoEndpointMap[T]["output"];
