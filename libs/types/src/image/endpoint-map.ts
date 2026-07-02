// AUTO-GENERATED - Do not edit manually
// Generated from types.gen.ts via scripts/generate-endpoint-maps.ts

import type {
  AuraFlowInput,
  AuraFlowOutput,
  AuraSrInput,
  AuraSrOutput,
  BackgroundRemovalInput,
  BackgroundRemovalOutput,
  BagelEditInput,
  BagelEditOutput,
  BagelInput,
  BagelOutput,
  BenV2ImageInput,
  BenV2ImageOutput,
  BirefnetInput,
  BirefnetOutput,
  BirefnetV2Input,
  BirefnetV2Output,
  BitdanceInput,
  BitdanceOutput,
  BriaBackgroundRemoveInput,
  BriaBackgroundRemoveOutput,
  BriaBackgroundReplaceInput,
  BriaBackgroundReplaceOutput,
  BriaEraserInput,
  BriaEraserOutput,
  BriaExpandInput,
  BriaExpandOutput,
  BriaGenfillInput,
  BriaGenfillOutput,
  BriaProductShotInput,
  BriaProductShotOutput,
  BriaReimagineInput,
  BriaReimagineOutput,
  BriaTextToImageBaseInput,
  BriaTextToImageBaseOutput,
  BriaTextToImageFastInput,
  BriaTextToImageFastOutput,
  BriaTextToImageHdInput,
  BriaTextToImageHdOutput,
  BytedanceDreaminaV31TextToImageInput,
  BytedanceDreaminaV31TextToImageOutput,
  BytedanceSeedreamV3TextToImageInput,
  BytedanceSeedreamV3TextToImageOutput,
  BytedanceSeedreamV45EditInput,
  BytedanceSeedreamV45EditOutput,
  BytedanceSeedreamV45TextToImageInput,
  BytedanceSeedreamV45TextToImageOutput,
  BytedanceSeedreamV4EditInput,
  BytedanceSeedreamV4EditOutput,
  BytedanceSeedreamV4TextToImageInput,
  BytedanceSeedreamV4TextToImageOutput,
  BytedanceSeedreamV5LiteEditInput,
  BytedanceSeedreamV5LiteEditOutput,
  BytedanceSeedreamV5LiteTextToImageInput,
  BytedanceSeedreamV5LiteTextToImageOutput,
  CartoonifyInput,
  CartoonifyOutput,
  CatVtonInput,
  CatVtonOutput,
  CcsrInput,
  CcsrOutput,
  ChainOfZoomInput,
  ChainOfZoomOutput,
  ChronoEditInput,
  ChronoEditLoraGalleryPaintbrushInput,
  ChronoEditLoraGalleryPaintbrushOutput,
  ChronoEditLoraGalleryUpscalerInput,
  ChronoEditLoraGalleryUpscalerOutput,
  ChronoEditLoraInput,
  ChronoEditLoraOutput,
  ChronoEditOutput,
  ClarityUpscalerInput,
  ClarityUpscalerOutput,
  CodeformerInput,
  CodeformerOutput,
  Cogview4Input,
  Cogview4Output,
  CreativeUpscalerInput,
  CreativeUpscalerOutput,
  CrystalUpscalerInput,
  CrystalUpscalerOutput,
  DdcolorInput,
  DdcolorOutput,
  DiffusionEdgeInput,
  DiffusionEdgeOutput,
  DocresDewarpInput,
  DocresDewarpOutput,
  DocresInput,
  DocresOutput,
  DrctSuperResolutionInput,
  DrctSuperResolutionOutput,
  DreamoInput,
  DreamoOutput,
  Dreamomni2EditInput,
  Dreamomni2EditOutput,
  DreamshaperInput,
  DreamshaperOutput,
  DwposeInput,
  DwposeOutput,
  EmbedProductInput,
  EmbedProductOutput,
  Emu35ImageEditImageInput,
  Emu35ImageEditImageOutput,
  Emu35ImageTextToImageInput,
  Emu35ImageTextToImageOutput,
  Era3dInput,
  Era3dOutput,
  ErnieImageInput,
  ErnieImageOutput,
  ErnieImageTurboInput,
  ErnieImageTurboOutput,
  EsrganInput,
  EsrganOutput,
  EvfSamInput,
  EvfSamOutput,
  FLiteStandardInput,
  FLiteStandardOutput,
  FLiteTextureInput,
  FLiteTextureOutput,
  FaceToStickerInput,
  FaceToStickerOutput,
  FashnTryonV15Input,
  FashnTryonV15Output,
  FashnTryonV16Input,
  FashnTryonV16Output,
  FastFooocusSdxlImageToImageInput,
  FastFooocusSdxlImageToImageOutput,
  FastFooocusSdxlInput,
  FastFooocusSdxlOutput,
  FastLcmDiffusionImageToImageInput,
  FastLcmDiffusionImageToImageOutput,
  FastLcmDiffusionInpaintingInput,
  FastLcmDiffusionInpaintingOutput,
  FastLcmDiffusionInput,
  FastLcmDiffusionOutput,
  FastLightningSdxlImageToImageInput,
  FastLightningSdxlImageToImageOutput,
  FastLightningSdxlInpaintingInput,
  FastLightningSdxlInpaintingOutput,
  FastLightningSdxlInput,
  FastLightningSdxlOutput,
  FastSdxlControlnetCannyImageToImageInput,
  FastSdxlControlnetCannyImageToImageOutput,
  FastSdxlControlnetCannyInpaintingInput,
  FastSdxlControlnetCannyInpaintingOutput,
  FastSdxlControlnetCannyInput,
  FastSdxlControlnetCannyOutput,
  FastSdxlImageToImageInput,
  FastSdxlImageToImageOutput,
  FastSdxlInpaintingInput,
  FastSdxlInpaintingOutput,
  FastSdxlInput,
  FastSdxlOutput,
  FfmpegApiExtractFrameInput,
  FfmpegApiExtractFrameOutput,
  FiboBbqPreviewGenerateInput,
  FiboBbqPreviewGenerateOutput,
  FiboEditAddObjectByTextInput,
  FiboEditAddObjectByTextOutput,
  FiboEditBlendInput,
  FiboEditBlendOutput,
  FiboEditColorizeInput,
  FiboEditColorizeOutput,
  FiboEditEditInput,
  FiboEditEditOutput,
  FiboEditEraseByTextInput,
  FiboEditEraseByTextOutput,
  FiboEditRelightInput,
  FiboEditRelightOutput,
  FiboEditReplaceObjectByTextInput,
  FiboEditReplaceObjectByTextOutput,
  FiboEditReseasonInput,
  FiboEditReseasonOutput,
  FiboEditRestoreInput,
  FiboEditRestoreOutput,
  FiboEditRestyleInput,
  FiboEditRestyleOutput,
  FiboEditRewriteTextInput,
  FiboEditRewriteTextOutput,
  FiboEditSketchToColoredImageInput,
  FiboEditSketchToColoredImageOutput,
  FiboGenerateInput,
  FiboGenerateOutput,
  FiboLiteGenerateInput,
  FiboLiteGenerateOutput,
  FilmInput,
  FilmOutput,
  FinegrainEraserBboxInput,
  FinegrainEraserBboxOutput,
  FinegrainEraserInput,
  FinegrainEraserMaskInput,
  FinegrainEraserMaskOutput,
  FinegrainEraserOutput,
  FireredImageEditInput,
  FireredImageEditOutput,
  FireredImageEditV11Input,
  FireredImageEditV11Output,
  Florence2LargeCaptionToPhraseGroundingInput,
  Florence2LargeCaptionToPhraseGroundingOutput,
  Florence2LargeDenseRegionCaptionInput,
  Florence2LargeDenseRegionCaptionOutput,
  Florence2LargeObjectDetectionInput,
  Florence2LargeObjectDetectionOutput,
  Florence2LargeOcrWithRegionInput,
  Florence2LargeOcrWithRegionOutput,
  Florence2LargeOpenVocabularyDetectionInput,
  Florence2LargeOpenVocabularyDetectionOutput,
  Florence2LargeReferringExpressionSegmentationInput,
  Florence2LargeReferringExpressionSegmentationOutput,
  Florence2LargeRegionProposalInput,
  Florence2LargeRegionProposalOutput,
  Florence2LargeRegionToSegmentationInput,
  Florence2LargeRegionToSegmentationOutput,
  FloweditInput,
  FloweditOutput,
  Flux1DevImageToImageInput,
  Flux1DevImageToImageOutput,
  Flux1DevInput,
  Flux1DevOutput,
  Flux1DevReduxInput,
  Flux1DevReduxOutput,
  Flux1KreaImageToImageInput,
  Flux1KreaImageToImageOutput,
  Flux1KreaInput,
  Flux1KreaOutput,
  Flux1KreaReduxInput,
  Flux1KreaReduxOutput,
  Flux1SchnellInput,
  Flux1SchnellOutput,
  Flux1SchnellReduxInput,
  Flux1SchnellReduxOutput,
  Flux1SrpoImageToImageInput,
  Flux1SrpoImageToImageOutput,
  Flux1SrpoInput,
  Flux1SrpoOutput,
  Flux2EditInput,
  Flux2EditOutput,
  Flux2FlashEditInput,
  Flux2FlashEditOutput,
  Flux2FlashInput,
  Flux2FlashOutput,
  Flux2FlexEditInput,
  Flux2FlexEditOutput,
  Flux2FlexInput,
  Flux2FlexOutput,
  Flux2Input,
  Flux2Klein4bBaseEditInput,
  Flux2Klein4bBaseEditLoraInput,
  Flux2Klein4bBaseEditLoraOutput,
  Flux2Klein4bBaseEditOutput,
  Flux2Klein4bBaseInput,
  Flux2Klein4bBaseLoraInput,
  Flux2Klein4bBaseLoraOutput,
  Flux2Klein4bBaseOutput,
  Flux2Klein4bEditInput,
  Flux2Klein4bEditLoraInput,
  Flux2Klein4bEditLoraOutput,
  Flux2Klein4bEditOutput,
  Flux2Klein4bInput,
  Flux2Klein4bLoraInput,
  Flux2Klein4bLoraOutput,
  Flux2Klein4bOutput,
  Flux2Klein9bBaseEditInput,
  Flux2Klein9bBaseEditLoraInput,
  Flux2Klein9bBaseEditLoraOutput,
  Flux2Klein9bBaseEditOutput,
  Flux2Klein9bBaseInput,
  Flux2Klein9bBaseLoraInput,
  Flux2Klein9bBaseLoraOutput,
  Flux2Klein9bBaseOutput,
  Flux2Klein9bEditInput,
  Flux2Klein9bEditLoraInput,
  Flux2Klein9bEditLoraOutput,
  Flux2Klein9bEditOutput,
  Flux2Klein9bInput,
  Flux2Klein9bLoraInput,
  Flux2Klein9bLoraOutput,
  Flux2Klein9bOutput,
  Flux2KleinRealtimeInput,
  Flux2KleinRealtimeOutput,
  Flux2LoraEditInput,
  Flux2LoraEditOutput,
  Flux2LoraGalleryAddBackgroundInput,
  Flux2LoraGalleryAddBackgroundOutput,
  Flux2LoraGalleryApartmentStagingInput,
  Flux2LoraGalleryApartmentStagingOutput,
  Flux2LoraGalleryBallpointPenSketchInput,
  Flux2LoraGalleryBallpointPenSketchOutput,
  Flux2LoraGalleryDigitalComicArtInput,
  Flux2LoraGalleryDigitalComicArtOutput,
  Flux2LoraGalleryFaceToFullPortraitInput,
  Flux2LoraGalleryFaceToFullPortraitOutput,
  Flux2LoraGalleryHdrStyleInput,
  Flux2LoraGalleryHdrStyleOutput,
  Flux2LoraGalleryMultipleAnglesInput,
  Flux2LoraGalleryMultipleAnglesOutput,
  Flux2LoraGalleryRealismInput,
  Flux2LoraGalleryRealismOutput,
  Flux2LoraGallerySatelliteViewStyleInput,
  Flux2LoraGallerySatelliteViewStyleOutput,
  Flux2LoraGallerySepiaVintageInput,
  Flux2LoraGallerySepiaVintageOutput,
  Flux2LoraGalleryVirtualTryonInput,
  Flux2LoraGalleryVirtualTryonOutput,
  Flux2LoraInput,
  Flux2LoraOutput,
  Flux2MaxEditInput,
  Flux2MaxEditOutput,
  Flux2MaxInput,
  Flux2MaxOutput,
  Flux2Output,
  Flux2ProEditInput,
  Flux2ProEditOutput,
  Flux2ProInput,
  Flux2ProOutput,
  Flux2TurboEditInput,
  Flux2TurboEditOutput,
  Flux2TurboInput,
  Flux2TurboOutput,
  FluxControlLoraCannyImageToImageInput,
  FluxControlLoraCannyImageToImageOutput,
  FluxControlLoraCannyInput,
  FluxControlLoraCannyOutput,
  FluxControlLoraDepthImageToImageInput,
  FluxControlLoraDepthImageToImageOutput,
  FluxControlLoraDepthInput,
  FluxControlLoraDepthOutput,
  FluxDevImageToImageInput,
  FluxDevImageToImageOutput,
  FluxDevInput,
  FluxDevOutput,
  FluxDevReduxInput,
  FluxDevReduxOutput,
  FluxDifferentialDiffusionInput,
  FluxDifferentialDiffusionOutput,
  FluxGeneralDifferentialDiffusionInput,
  FluxGeneralDifferentialDiffusionOutput,
  FluxGeneralImageToImageInput,
  FluxGeneralImageToImageOutput,
  FluxGeneralInpaintingInput,
  FluxGeneralInpaintingOutput,
  FluxGeneralInput,
  FluxGeneralOutput,
  FluxGeneralRfInversionInput,
  FluxGeneralRfInversionOutput,
  FluxKontextDevInput,
  FluxKontextDevOutput,
  FluxKontextLoraInpaintInput,
  FluxKontextLoraInpaintOutput,
  FluxKontextLoraInput,
  FluxKontextLoraOutput,
  FluxKontextLoraTextToImageInput,
  FluxKontextLoraTextToImageOutput,
  FluxKreaImageToImageInput,
  FluxKreaImageToImageOutput,
  FluxKreaInput,
  FluxKreaLoraImageToImageInput,
  FluxKreaLoraImageToImageOutput,
  FluxKreaLoraInpaintingInput,
  FluxKreaLoraInpaintingOutput,
  FluxKreaLoraInput,
  FluxKreaLoraOutput,
  FluxKreaLoraStreamInput,
  FluxKreaLoraStreamOutput,
  FluxKreaOutput,
  FluxKreaReduxInput,
  FluxKreaReduxOutput,
  FluxLoraCannyInput,
  FluxLoraCannyOutput,
  FluxLoraDepthInput,
  FluxLoraDepthOutput,
  FluxLoraFillInput,
  FluxLoraFillOutput,
  FluxLoraImageToImageInput,
  FluxLoraImageToImageOutput,
  FluxLoraInpaintingInput,
  FluxLoraInpaintingOutput,
  FluxLoraInput,
  FluxLoraOutput,
  FluxLoraStreamInput,
  FluxLoraStreamOutput,
  FluxProKontextInput,
  FluxProKontextMaxInput,
  FluxProKontextMaxMultiInput,
  FluxProKontextMaxMultiOutput,
  FluxProKontextMaxOutput,
  FluxProKontextMaxTextToImageInput,
  FluxProKontextMaxTextToImageOutput,
  FluxProKontextMultiInput,
  FluxProKontextMultiOutput,
  FluxProKontextOutput,
  FluxProKontextTextToImageInput,
  FluxProKontextTextToImageOutput,
  FluxProV11Input,
  FluxProV11Output,
  FluxProV11ReduxInput,
  FluxProV11ReduxOutput,
  FluxProV11UltraFinetunedInput,
  FluxProV11UltraFinetunedOutput,
  FluxProV11UltraInput,
  FluxProV11UltraOutput,
  FluxProV11UltraReduxInput,
  FluxProV11UltraReduxOutput,
  FluxProV1FillFinetunedInput,
  FluxProV1FillFinetunedOutput,
  FluxProV1FillInput,
  FluxProV1FillOutput,
  FluxPulidInput,
  FluxPulidOutput,
  FluxSchnellInput,
  FluxSchnellOutput,
  FluxSchnellReduxInput,
  FluxSchnellReduxOutput,
  FluxSrpoImageToImageInput,
  FluxSrpoImageToImageOutput,
  FluxSrpoInput,
  FluxSrpoOutput,
  FluxSubjectInput,
  FluxSubjectOutput,
  FluxVisionUpscalerInput,
  FluxVisionUpscalerOutput,
  FooocusImagePromptInput,
  FooocusImagePromptOutput,
  FooocusInpaintInput,
  FooocusInpaintOutput,
  FooocusInput,
  FooocusOutput,
  FooocusUpscaleOrVaryInput,
  FooocusUpscaleOrVaryOutput,
  Gemini25FlashImageEditInput,
  Gemini25FlashImageEditOutput,
  Gemini25FlashImageInput,
  Gemini25FlashImageOutput,
  Gemini31FlashImagePreviewEditInput,
  Gemini31FlashImagePreviewEditOutput,
  Gemini31FlashImagePreviewInput,
  Gemini31FlashImagePreviewOutput,
  Gemini3ProImagePreviewEditInput,
  Gemini3ProImagePreviewEditOutput,
  Gemini3ProImagePreviewInput,
  Gemini3ProImagePreviewOutput,
  GeminiFlashEditInput,
  GeminiFlashEditMultiInput,
  GeminiFlashEditMultiOutput,
  GeminiFlashEditOutput,
  GenfocusAllInFocusInput,
  GenfocusAllInFocusOutput,
  GenfocusInput,
  GenfocusOutput,
  GhiblifyInput,
  GhiblifyOutput,
  GlmImageImageToImageInput,
  GlmImageImageToImageOutput,
  GlmImageInput,
  GlmImageOutput,
  GptImage15EditInput,
  GptImage15EditOutput,
  GptImage15Input,
  GptImage15Output,
  GptImage1EditImageInput,
  GptImage1EditImageOutput,
  GptImage1MiniEditInput,
  GptImage1MiniEditOutput,
  GptImage1MiniInput,
  GptImage1MiniOutput,
  GptImage1TextToImageInput,
  GptImage1TextToImageOutput,
  GrokImagineImageEditInput,
  GrokImagineImageEditOutput,
  GrokImagineImageInput,
  GrokImagineImageOutput,
  HidreamE11Input,
  HidreamE11Output,
  HidreamI1DevInput,
  HidreamI1DevOutput,
  HidreamI1FastInput,
  HidreamI1FastOutput,
  HidreamI1FullImageToImageInput,
  HidreamI1FullImageToImageOutput,
  HidreamI1FullInput,
  HidreamI1FullOutput,
  HunyuanImageV21TextToImageInput,
  HunyuanImageV21TextToImageOutput,
  HunyuanImageV3InstructEditInput,
  HunyuanImageV3InstructEditOutput,
  HunyuanImageV3InstructTextToImageInput,
  HunyuanImageV3InstructTextToImageOutput,
  HunyuanImageV3TextToImageInput,
  HunyuanImageV3TextToImageOutput,
  HunyuanWorldInput,
  HunyuanWorldOutput,
  HyWuEditInput,
  HyWuEditOutput,
  IclightV2Input,
  IclightV2Output,
  IdeogramCharacterEditInput,
  IdeogramCharacterEditOutput,
  IdeogramCharacterInput,
  IdeogramCharacterOutput,
  IdeogramCharacterRemixInput,
  IdeogramCharacterRemixOutput,
  IdeogramUpscaleInput,
  IdeogramUpscaleOutput,
  IdeogramV2EditInput,
  IdeogramV2EditOutput,
  IdeogramV2Input,
  IdeogramV2Output,
  IdeogramV2RemixInput,
  IdeogramV2RemixOutput,
  IdeogramV2TurboEditInput,
  IdeogramV2TurboEditOutput,
  IdeogramV2TurboInput,
  IdeogramV2TurboOutput,
  IdeogramV2TurboRemixInput,
  IdeogramV2TurboRemixOutput,
  IdeogramV2aInput,
  IdeogramV2aOutput,
  IdeogramV2aRemixInput,
  IdeogramV2aRemixOutput,
  IdeogramV2aTurboInput,
  IdeogramV2aTurboOutput,
  IdeogramV2aTurboRemixInput,
  IdeogramV2aTurboRemixOutput,
  IdeogramV3EditInput,
  IdeogramV3EditOutput,
  IdeogramV3GenerateTransparentInput,
  IdeogramV3GenerateTransparentOutput,
  IdeogramV3Input,
  IdeogramV3LayerizeTextInput,
  IdeogramV3LayerizeTextOutput,
  IdeogramV3Output,
  IdeogramV3ReframeInput,
  IdeogramV3ReframeOutput,
  IdeogramV3RemixInput,
  IdeogramV3RemixOutput,
  IdeogramV3ReplaceBackgroundInput,
  IdeogramV3ReplaceBackgroundOutput,
  IllusionDiffusionInput,
  IllusionDiffusionOutput,
  Image2PixelInput,
  Image2PixelOutput,
  Image2SvgInput,
  Image2SvgOutput,
  ImageAppsV2AgeModifyInput,
  ImageAppsV2AgeModifyOutput,
  ImageAppsV2CityTeleportInput,
  ImageAppsV2CityTeleportOutput,
  ImageAppsV2ExpressionChangeInput,
  ImageAppsV2ExpressionChangeOutput,
  ImageAppsV2HairChangeInput,
  ImageAppsV2HairChangeOutput,
  ImageAppsV2HeadshotPhotoInput,
  ImageAppsV2HeadshotPhotoOutput,
  ImageAppsV2MakeupApplicationInput,
  ImageAppsV2MakeupApplicationOutput,
  ImageAppsV2ObjectRemovalInput,
  ImageAppsV2ObjectRemovalOutput,
  ImageAppsV2OutpaintInput,
  ImageAppsV2OutpaintOutput,
  ImageAppsV2PerspectiveInput,
  ImageAppsV2PerspectiveOutput,
  ImageAppsV2PhotoRestorationInput,
  ImageAppsV2PhotoRestorationOutput,
  ImageAppsV2PhotographyEffectsInput,
  ImageAppsV2PhotographyEffectsOutput,
  ImageAppsV2PortraitEnhanceInput,
  ImageAppsV2PortraitEnhanceOutput,
  ImageAppsV2ProductHoldingInput,
  ImageAppsV2ProductHoldingOutput,
  ImageAppsV2ProductPhotographyInput,
  ImageAppsV2ProductPhotographyOutput,
  ImageAppsV2RelightingInput,
  ImageAppsV2RelightingOutput,
  ImageAppsV2StyleTransferInput,
  ImageAppsV2StyleTransferOutput,
  ImageAppsV2TextureTransformInput,
  ImageAppsV2TextureTransformOutput,
  ImageAppsV2VirtualTryOnInput,
  ImageAppsV2VirtualTryOnOutput,
  ImageEditingAgeProgressionInput,
  ImageEditingAgeProgressionOutput,
  ImageEditingBabyVersionInput,
  ImageEditingBabyVersionOutput,
  ImageEditingBackgroundChangeInput,
  ImageEditingBackgroundChangeOutput,
  ImageEditingBroccoliHaircutInput,
  ImageEditingBroccoliHaircutOutput,
  ImageEditingCartoonifyInput,
  ImageEditingCartoonifyOutput,
  ImageEditingColorCorrectionInput,
  ImageEditingColorCorrectionOutput,
  ImageEditingExpressionChangeInput,
  ImageEditingExpressionChangeOutput,
  ImageEditingFaceEnhancementInput,
  ImageEditingFaceEnhancementOutput,
  ImageEditingHairChangeInput,
  ImageEditingHairChangeOutput,
  ImageEditingObjectRemovalInput,
  ImageEditingObjectRemovalOutput,
  ImageEditingPhotoRestorationInput,
  ImageEditingPhotoRestorationOutput,
  ImageEditingPlushieStyleInput,
  ImageEditingPlushieStyleOutput,
  ImageEditingProfessionalPhotoInput,
  ImageEditingProfessionalPhotoOutput,
  ImageEditingRealismInput,
  ImageEditingRealismOutput,
  ImageEditingReframeInput,
  ImageEditingReframeOutput,
  ImageEditingRetouchInput,
  ImageEditingRetouchOutput,
  ImageEditingSceneCompositionInput,
  ImageEditingSceneCompositionOutput,
  ImageEditingStyleTransferInput,
  ImageEditingStyleTransferOutput,
  ImageEditingTextRemovalInput,
  ImageEditingTextRemovalOutput,
  ImageEditingTimeOfDayInput,
  ImageEditingTimeOfDayOutput,
  ImageEditingWeatherEffectInput,
  ImageEditingWeatherEffectOutput,
  ImageEditingWojakStyleInput,
  ImageEditingWojakStyleOutput,
  ImageEditingYoutubeThumbnailsInput,
  ImageEditingYoutubeThumbnailsOutput,
  ImagePreprocessorsDepthAnythingV2Input,
  ImagePreprocessorsDepthAnythingV2Output,
  ImagePreprocessorsHedInput,
  ImagePreprocessorsHedOutput,
  ImagePreprocessorsLineartInput,
  ImagePreprocessorsLineartOutput,
  ImagePreprocessorsMidasInput,
  ImagePreprocessorsMidasOutput,
  ImagePreprocessorsMlsdInput,
  ImagePreprocessorsMlsdOutput,
  ImagePreprocessorsPidiInput,
  ImagePreprocessorsPidiOutput,
  ImagePreprocessorsSamInput,
  ImagePreprocessorsSamOutput,
  ImagePreprocessorsScribbleInput,
  ImagePreprocessorsScribbleOutput,
  ImagePreprocessorsTeedInput,
  ImagePreprocessorsTeedOutput,
  ImagePreprocessorsZoeInput,
  ImagePreprocessorsZoeOutput,
  Imagen3FastInput,
  Imagen3FastOutput,
  Imagen3Input,
  Imagen3Output,
  Imagen4PreviewFastInput,
  Imagen4PreviewFastOutput,
  Imagen4PreviewInput,
  Imagen4PreviewOutput,
  Imagen4PreviewUltraInput,
  Imagen4PreviewUltraOutput,
  ImageutilsDepthInput,
  ImageutilsDepthOutput,
  ImageutilsMarigoldDepthInput,
  ImageutilsMarigoldDepthOutput,
  ImageutilsRembgInput,
  ImageutilsRembgOutput,
  Imagineart15PreviewTextToImageInput,
  Imagineart15PreviewTextToImageOutput,
  Imagineart15ProPreviewTextToImageInput,
  Imagineart15ProPreviewTextToImageOutput,
  InpaintInput,
  InpaintOutput,
  InstantCharacterInput,
  InstantCharacterOutput,
  InvisibleWatermarkInput,
  InvisibleWatermarkOutput,
  IpAdapterFaceIdInput,
  IpAdapterFaceIdOutput,
  JanusInput,
  JanusOutput,
  JoyaiImageEditInput,
  JoyaiImageEditOutput,
  JuggernautFluxBaseImageToImageInput,
  JuggernautFluxBaseImageToImageOutput,
  JuggernautFluxBaseInput,
  JuggernautFluxBaseOutput,
  JuggernautFluxLightningInput,
  JuggernautFluxLightningOutput,
  JuggernautFluxLoraInpaintingInput,
  JuggernautFluxLoraInpaintingOutput,
  JuggernautFluxLoraInput,
  JuggernautFluxLoraOutput,
  JuggernautFluxProImageToImageInput,
  JuggernautFluxProImageToImageOutput,
  JuggernautFluxProInput,
  JuggernautFluxProOutput,
  KlingImageO1Input,
  KlingImageO1Output,
  KlingImageO3ImageToImageInput,
  KlingImageO3ImageToImageOutput,
  KlingImageO3TextToImageInput,
  KlingImageO3TextToImageOutput,
  KlingImageV3ImageToImageInput,
  KlingImageV3ImageToImageOutput,
  KlingImageV3TextToImageInput,
  KlingImageV3TextToImageOutput,
  KlingV15KolorsVirtualTryOnInput,
  KlingV15KolorsVirtualTryOnOutput,
  KolorsImageToImageInput,
  KolorsImageToImageOutput,
  KolorsInput,
  KolorsOutput,
  LayerDiffusionInput,
  LayerDiffusionOutput,
  LcmInput,
  LcmOutput,
  LcmSd15I2iInput,
  LcmSd15I2iOutput,
  LeffaPoseTransferInput,
  LeffaPoseTransferOutput,
  LeffaVirtualTryonInput,
  LeffaVirtualTryonOutput,
  LightningModelsInput,
  LightningModelsOutput,
  LivePortraitImageInput,
  LivePortraitImageOutput,
  LongcatImageEditInput,
  LongcatImageEditOutput,
  LongcatImageInput,
  LongcatImageOutput,
  LoraImageToImageInput,
  LoraImageToImageOutput,
  LoraInpaintInput,
  LoraInpaintOutput,
  LoraInput,
  LoraOutput,
  LucidfluxInput,
  LucidfluxOutput,
  LumaPhotonFlashInput,
  LumaPhotonFlashModifyInput,
  LumaPhotonFlashModifyOutput,
  LumaPhotonFlashOutput,
  LumaPhotonFlashReframeInput,
  LumaPhotonFlashReframeOutput,
  LumaPhotonInput,
  LumaPhotonModifyInput,
  LumaPhotonModifyOutput,
  LumaPhotonOutput,
  LumaPhotonReframeInput,
  LumaPhotonReframeOutput,
  LuminaImageV2Input,
  LuminaImageV2Output,
  MinimaxImage01Input,
  MinimaxImage01Output,
  MinimaxImage01SubjectReferenceInput,
  MinimaxImage01SubjectReferenceOutput,
  MixDehazeNetInput,
  MixDehazeNetOutput,
  Moondream3PreviewSegmentInput,
  Moondream3PreviewSegmentOutput,
  MoondreamNextDetectionInput,
  MoondreamNextDetectionOutput,
  NafnetDeblurInput,
  NafnetDeblurOutput,
  NafnetDenoiseInput,
  NafnetDenoiseOutput,
  NanoBanana2EditInput,
  NanoBanana2EditOutput,
  NanoBanana2Input,
  NanoBanana2Output,
  NanoBananaEditInput,
  NanoBananaEditOutput,
  NanoBananaInput,
  NanoBananaOutput,
  NanoBananaProEditInput,
  NanoBananaProEditOutput,
  NanoBananaProInput,
  NanoBananaProOutput,
  Nextstep1Input,
  Nextstep1Output,
  ObjectRemovalBboxInput,
  ObjectRemovalBboxOutput,
  ObjectRemovalInput,
  ObjectRemovalMaskInput,
  ObjectRemovalMaskOutput,
  ObjectRemovalOutput,
  OmniZeroInput,
  OmniZeroOutput,
  OmnigenV1Input,
  OmnigenV1Output,
  OmnigenV2Input,
  OmnigenV2Output,
  OnerewardInput,
  OnerewardOutput,
  OvisImageInput,
  OvisImageOutput,
  PasdInput,
  PasdOutput,
  PatinaInput,
  PatinaMaterialExtractInput,
  PatinaMaterialExtractOutput,
  PatinaMaterialInput,
  PatinaMaterialOutput,
  PatinaOutput,
  PhotaEditInput,
  PhotaEditOutput,
  PhotaEnhanceInput,
  PhotaEnhanceOutput,
  PhotaInput,
  PhotaOutput,
  PhotomakerInput,
  PhotomakerOutput,
  PhysicEditInput,
  PhysicEditOutput,
  PiflowInput,
  PiflowOutput,
  PixartSigmaInput,
  PixartSigmaOutput,
  PlaygroundV25ImageToImageInput,
  PlaygroundV25ImageToImageOutput,
  PlaygroundV25InpaintingInput,
  PlaygroundV25InpaintingOutput,
  PlaygroundV25Input,
  PlaygroundV25Output,
  PlushifyInput,
  PlushifyOutput,
  PonyV7Input,
  PonyV7Output,
  PostProcessingBlurInput,
  PostProcessingBlurOutput,
  PostProcessingChromaticAberrationInput,
  PostProcessingChromaticAberrationOutput,
  PostProcessingColorCorrectionInput,
  PostProcessingColorCorrectionOutput,
  PostProcessingColorTintInput,
  PostProcessingColorTintOutput,
  PostProcessingDesaturateInput,
  PostProcessingDesaturateOutput,
  PostProcessingDissolveInput,
  PostProcessingDissolveOutput,
  PostProcessingDodgeBurnInput,
  PostProcessingDodgeBurnOutput,
  PostProcessingGrainInput,
  PostProcessingGrainOutput,
  PostProcessingInput,
  PostProcessingOutput,
  PostProcessingParabolizeInput,
  PostProcessingParabolizeOutput,
  PostProcessingSharpenInput,
  PostProcessingSharpenOutput,
  PostProcessingSolarizeInput,
  PostProcessingSolarizeOutput,
  PostProcessingVignetteInput,
  PostProcessingVignetteOutput,
  PulidInput,
  PulidOutput,
  QwenImage2512Input,
  QwenImage2512LoraInput,
  QwenImage2512LoraOutput,
  QwenImage2512Output,
  QwenImage2EditInput,
  QwenImage2EditOutput,
  QwenImage2ProEditInput,
  QwenImage2ProEditOutput,
  QwenImage2ProTextToImageInput,
  QwenImage2ProTextToImageOutput,
  QwenImage2TextToImageInput,
  QwenImage2TextToImageOutput,
  QwenImageEdit2509Input,
  QwenImageEdit2509LoraGalleryAddBackgroundInput,
  QwenImageEdit2509LoraGalleryAddBackgroundOutput,
  QwenImageEdit2509LoraGalleryFaceToFullPortraitInput,
  QwenImageEdit2509LoraGalleryFaceToFullPortraitOutput,
  QwenImageEdit2509LoraGalleryGroupPhotoInput,
  QwenImageEdit2509LoraGalleryGroupPhotoOutput,
  QwenImageEdit2509LoraGalleryIntegrateProductInput,
  QwenImageEdit2509LoraGalleryIntegrateProductOutput,
  QwenImageEdit2509LoraGalleryLightingRestorationInput,
  QwenImageEdit2509LoraGalleryLightingRestorationOutput,
  QwenImageEdit2509LoraGalleryMultipleAnglesInput,
  QwenImageEdit2509LoraGalleryMultipleAnglesOutput,
  QwenImageEdit2509LoraGalleryNextSceneInput,
  QwenImageEdit2509LoraGalleryNextSceneOutput,
  QwenImageEdit2509LoraGalleryRemoveElementInput,
  QwenImageEdit2509LoraGalleryRemoveElementOutput,
  QwenImageEdit2509LoraGalleryRemoveLightingInput,
  QwenImageEdit2509LoraGalleryRemoveLightingOutput,
  QwenImageEdit2509LoraGalleryShirtDesignInput,
  QwenImageEdit2509LoraGalleryShirtDesignOutput,
  QwenImageEdit2509LoraInput,
  QwenImageEdit2509LoraOutput,
  QwenImageEdit2509Output,
  QwenImageEdit2511Input,
  QwenImageEdit2511LoraInput,
  QwenImageEdit2511LoraOutput,
  QwenImageEdit2511MultipleAnglesInput,
  QwenImageEdit2511MultipleAnglesOutput,
  QwenImageEdit2511Output,
  QwenImageEditImageToImageInput,
  QwenImageEditImageToImageOutput,
  QwenImageEditInpaintInput,
  QwenImageEditInpaintOutput,
  QwenImageEditInput,
  QwenImageEditLoraInput,
  QwenImageEditLoraOutput,
  QwenImageEditOutput,
  QwenImageEditPlusInput,
  QwenImageEditPlusLoraGalleryAddBackgroundInput,
  QwenImageEditPlusLoraGalleryAddBackgroundOutput,
  QwenImageEditPlusLoraGalleryFaceToFullPortraitInput,
  QwenImageEditPlusLoraGalleryFaceToFullPortraitOutput,
  QwenImageEditPlusLoraGalleryGroupPhotoInput,
  QwenImageEditPlusLoraGalleryGroupPhotoOutput,
  QwenImageEditPlusLoraGalleryIntegrateProductInput,
  QwenImageEditPlusLoraGalleryIntegrateProductOutput,
  QwenImageEditPlusLoraGalleryLightingRestorationInput,
  QwenImageEditPlusLoraGalleryLightingRestorationOutput,
  QwenImageEditPlusLoraGalleryMultipleAnglesInput,
  QwenImageEditPlusLoraGalleryMultipleAnglesOutput,
  QwenImageEditPlusLoraGalleryNextSceneInput,
  QwenImageEditPlusLoraGalleryNextSceneOutput,
  QwenImageEditPlusLoraGalleryRemoveElementInput,
  QwenImageEditPlusLoraGalleryRemoveElementOutput,
  QwenImageEditPlusLoraGalleryRemoveLightingInput,
  QwenImageEditPlusLoraGalleryRemoveLightingOutput,
  QwenImageEditPlusLoraGalleryShirtDesignInput,
  QwenImageEditPlusLoraGalleryShirtDesignOutput,
  QwenImageEditPlusLoraInput,
  QwenImageEditPlusLoraOutput,
  QwenImageEditPlusOutput,
  QwenImageImageToImageInput,
  QwenImageImageToImageOutput,
  QwenImageInput,
  QwenImageLayeredInput,
  QwenImageLayeredLoraInput,
  QwenImageLayeredLoraOutput,
  QwenImageLayeredOutput,
  QwenImageMaxEditInput,
  QwenImageMaxEditOutput,
  QwenImageMaxTextToImageInput,
  QwenImageMaxTextToImageOutput,
  QwenImageOutput,
  RealisticVisionInput,
  RealisticVisionOutput,
  Recraft20bInput,
  Recraft20bOutput,
  RecraftUpscaleCreativeInput,
  RecraftUpscaleCreativeOutput,
  RecraftUpscaleCrispInput,
  RecraftUpscaleCrispOutput,
  RecraftV3ImageToImageInput,
  RecraftV3ImageToImageOutput,
  RecraftV3TextToImageInput,
  RecraftV3TextToImageOutput,
  RecraftV4ProTextToImageInput,
  RecraftV4ProTextToImageOutput,
  RecraftV4ProTextToVectorInput,
  RecraftV4ProTextToVectorOutput,
  RecraftV4TextToImageInput,
  RecraftV4TextToImageOutput,
  RecraftV4TextToVectorInput,
  RecraftV4TextToVectorOutput,
  RecraftVectorizeInput,
  RecraftVectorizeOutput,
  Reimagine32Input,
  Reimagine32Output,
  RembgEnhanceInput,
  RembgEnhanceOutput,
  ReplaceBackgroundInput,
  ReplaceBackgroundOutput,
  RetoucherInput,
  RetoucherOutput,
  RifeInput,
  RifeOutput,
  RundiffusionPhotoFluxInput,
  RundiffusionPhotoFluxOutput,
  Sam2AutoSegmentInput,
  Sam2AutoSegmentOutput,
  Sam2ImageInput,
  Sam2ImageOutput,
  Sam31ImageInput,
  Sam31ImageOutput,
  Sam31ImageRleInput,
  Sam31ImageRleOutput,
  Sam3ImageInput,
  Sam3ImageOutput,
  Sam3ImageRleInput,
  Sam3ImageRleOutput,
  SanaInput,
  SanaOutput,
  SanaSprintInput,
  SanaSprintOutput,
  SanaV1516bInput,
  SanaV1516bOutput,
  SanaV1548bInput,
  SanaV1548bOutput,
  Sd15DepthControlnetInput,
  Sd15DepthControlnetOutput,
  SdxlControlnetUnionImageToImageInput,
  SdxlControlnetUnionImageToImageOutput,
  SdxlControlnetUnionInpaintingInput,
  SdxlControlnetUnionInpaintingOutput,
  SdxlControlnetUnionInput,
  SdxlControlnetUnionOutput,
  SeedvrUpscaleImageInput,
  SeedvrUpscaleImageOutput,
  SeedvrUpscaleImageSeamlessInput,
  SeedvrUpscaleImageSeamlessOutput,
  StableCascadeInput,
  StableCascadeOutput,
  StableCascadeSoteDiffusionInput,
  StableCascadeSoteDiffusionOutput,
  StableDiffusionV15Input,
  StableDiffusionV15Output,
  StableDiffusionV35LargeInput,
  StableDiffusionV35LargeOutput,
  StableDiffusionV35MediumInput,
  StableDiffusionV35MediumOutput,
  StableDiffusionV3MediumImageToImageInput,
  StableDiffusionV3MediumImageToImageOutput,
  StableDiffusionV3MediumInput,
  StableDiffusionV3MediumOutput,
  StarVectorInput,
  StarVectorOutput,
  Step1xEditInput,
  Step1xEditOutput,
  StepxEdit2Input,
  StepxEdit2Output,
  Swin2SrInput,
  Swin2SrOutput,
  Switti512Input,
  Switti512Output,
  SwittiInput,
  SwittiOutput,
  TheraInput,
  TheraOutput,
  TopazUpscaleImageInput,
  TopazUpscaleImageOutput,
  UnoInput,
  UnoOutput,
  UpscaleCreativeInput,
  UpscaleCreativeOutput,
  UsoInput,
  UsoOutput,
  V26ImageToImageInput,
  V26ImageToImageOutput,
  V26TextToImageInput,
  V26TextToImageOutput,
  VecglypherImageToSvgInput,
  VecglypherImageToSvgOutput,
  VecglypherInput,
  VecglypherOutput,
  ViduQ2ReferenceToImageInput,
  ViduQ2ReferenceToImageOutput,
  ViduQ2TextToImageInput,
  ViduQ2TextToImageOutput,
  ViduReferenceToImageInput,
  ViduReferenceToImageOutput,
  Wan25PreviewImageToImageInput,
  Wan25PreviewImageToImageOutput,
  Wan25PreviewTextToImageInput,
  Wan25PreviewTextToImageOutput,
  WanV225bTextToImageInput,
  WanV225bTextToImageOutput,
  WanV22A14bImageToImageInput,
  WanV22A14bImageToImageOutput,
  WanV22A14bTextToImageInput,
  WanV22A14bTextToImageLoraInput,
  WanV22A14bTextToImageLoraOutput,
  WanV22A14bTextToImageOutput,
  WanV27EditInput,
  WanV27EditOutput,
  WanV27ProEditInput,
  WanV27ProEditOutput,
  WanV27ProTextToImageInput,
  WanV27ProTextToImageOutput,
  WanV27TextToImageInput,
  WanV27TextToImageOutput,
  WorkflowUtilitiesExtractNthFrameInput,
  WorkflowUtilitiesExtractNthFrameOutput,
  ZImageBaseInput,
  ZImageBaseLoraInput,
  ZImageBaseLoraOutput,
  ZImageBaseOutput,
  ZImageTurboControlnetInput,
  ZImageTurboControlnetLoraInput,
  ZImageTurboControlnetLoraOutput,
  ZImageTurboControlnetOutput,
  ZImageTurboImageToImageInput,
  ZImageTurboImageToImageLoraInput,
  ZImageTurboImageToImageLoraOutput,
  ZImageTurboImageToImageOutput,
  ZImageTurboInpaintInput,
  ZImageTurboInpaintLoraInput,
  ZImageTurboInpaintLoraOutput,
  ZImageTurboInpaintOutput,
  ZImageTurboInput,
  ZImageTurboLoraInput,
  ZImageTurboLoraOutput,
  ZImageTurboOutput,
  ZImageTurboTilingInput,
  ZImageTurboTilingLoraInput,
  ZImageTurboTilingLoraOutput,
  ZImageTurboTilingOutput,
} from "./types.gen";

export type ImageEndpointMap = {
  "bria/embed-product": {
    input: EmbedProductInput;
    output: EmbedProductOutput;
  };
  "bria/fibo-bbq-preview/generate": {
    input: FiboBbqPreviewGenerateInput;
    output: FiboBbqPreviewGenerateOutput;
  };
  "bria/fibo-edit/add_object_by_text": {
    input: FiboEditAddObjectByTextInput;
    output: FiboEditAddObjectByTextOutput;
  };
  "bria/fibo-edit/blend": {
    input: FiboEditBlendInput;
    output: FiboEditBlendOutput;
  };
  "bria/fibo-edit/colorize": {
    input: FiboEditColorizeInput;
    output: FiboEditColorizeOutput;
  };
  "bria/fibo-edit/edit": {
    input: FiboEditEditInput;
    output: FiboEditEditOutput;
  };
  "bria/fibo-edit/erase_by_text": {
    input: FiboEditEraseByTextInput;
    output: FiboEditEraseByTextOutput;
  };
  "bria/fibo-edit/relight": {
    input: FiboEditRelightInput;
    output: FiboEditRelightOutput;
  };
  "bria/fibo-edit/replace_object_by_text": {
    input: FiboEditReplaceObjectByTextInput;
    output: FiboEditReplaceObjectByTextOutput;
  };
  "bria/fibo-edit/reseason": {
    input: FiboEditReseasonInput;
    output: FiboEditReseasonOutput;
  };
  "bria/fibo-edit/restore": {
    input: FiboEditRestoreInput;
    output: FiboEditRestoreOutput;
  };
  "bria/fibo-edit/restyle": {
    input: FiboEditRestyleInput;
    output: FiboEditRestyleOutput;
  };
  "bria/fibo-edit/rewrite_text": {
    input: FiboEditRewriteTextInput;
    output: FiboEditRewriteTextOutput;
  };
  "bria/fibo-edit/sketch_to_colored_image": {
    input: FiboEditSketchToColoredImageInput;
    output: FiboEditSketchToColoredImageOutput;
  };
  "bria/fibo-lite/generate": {
    input: FiboLiteGenerateInput;
    output: FiboLiteGenerateOutput;
  };
  "bria/fibo/generate": {
    input: FiboGenerateInput;
    output: FiboGenerateOutput;
  };
  "bria/reimagine/3.2": {
    input: Reimagine32Input;
    output: Reimagine32Output;
  };
  "bria/replace-background": {
    input: ReplaceBackgroundInput;
    output: ReplaceBackgroundOutput;
  };
  "bria/upscale/creative": {
    input: UpscaleCreativeInput;
    output: UpscaleCreativeOutput;
  };
  "clarityai/crystal-upscaler": {
    input: CrystalUpscalerInput;
    output: CrystalUpscalerOutput;
  };
  "fal-ai/aura-flow": {
    input: AuraFlowInput;
    output: AuraFlowOutput;
  };
  "fal-ai/aura-sr": {
    input: AuraSrInput;
    output: AuraSrOutput;
  };
  "fal-ai/bagel": {
    input: BagelInput;
    output: BagelOutput;
  };
  "fal-ai/bagel/edit": {
    input: BagelEditInput;
    output: BagelEditOutput;
  };
  "fal-ai/ben/v2/image": {
    input: BenV2ImageInput;
    output: BenV2ImageOutput;
  };
  "fal-ai/birefnet": {
    input: BirefnetInput;
    output: BirefnetOutput;
  };
  "fal-ai/birefnet/v2": {
    input: BirefnetV2Input;
    output: BirefnetV2Output;
  };
  "fal-ai/bitdance": {
    input: BitdanceInput;
    output: BitdanceOutput;
  };
  "fal-ai/bria/background/remove": {
    input: BriaBackgroundRemoveInput;
    output: BriaBackgroundRemoveOutput;
  };
  "fal-ai/bria/background/replace": {
    input: BriaBackgroundReplaceInput;
    output: BriaBackgroundReplaceOutput;
  };
  "fal-ai/bria/eraser": {
    input: BriaEraserInput;
    output: BriaEraserOutput;
  };
  "fal-ai/bria/expand": {
    input: BriaExpandInput;
    output: BriaExpandOutput;
  };
  "fal-ai/bria/genfill": {
    input: BriaGenfillInput;
    output: BriaGenfillOutput;
  };
  "fal-ai/bria/product-shot": {
    input: BriaProductShotInput;
    output: BriaProductShotOutput;
  };
  "fal-ai/bria/reimagine": {
    input: BriaReimagineInput;
    output: BriaReimagineOutput;
  };
  "fal-ai/bria/text-to-image/base": {
    input: BriaTextToImageBaseInput;
    output: BriaTextToImageBaseOutput;
  };
  "fal-ai/bria/text-to-image/fast": {
    input: BriaTextToImageFastInput;
    output: BriaTextToImageFastOutput;
  };
  "fal-ai/bria/text-to-image/hd": {
    input: BriaTextToImageHdInput;
    output: BriaTextToImageHdOutput;
  };
  "fal-ai/bytedance/dreamina/v3.1/text-to-image": {
    input: BytedanceDreaminaV31TextToImageInput;
    output: BytedanceDreaminaV31TextToImageOutput;
  };
  "fal-ai/bytedance/seedream/v3/text-to-image": {
    input: BytedanceSeedreamV3TextToImageInput;
    output: BytedanceSeedreamV3TextToImageOutput;
  };
  "fal-ai/bytedance/seedream/v4.5/edit": {
    input: BytedanceSeedreamV45EditInput;
    output: BytedanceSeedreamV45EditOutput;
  };
  "fal-ai/bytedance/seedream/v4.5/text-to-image": {
    input: BytedanceSeedreamV45TextToImageInput;
    output: BytedanceSeedreamV45TextToImageOutput;
  };
  "fal-ai/bytedance/seedream/v4/edit": {
    input: BytedanceSeedreamV4EditInput;
    output: BytedanceSeedreamV4EditOutput;
  };
  "fal-ai/bytedance/seedream/v4/text-to-image": {
    input: BytedanceSeedreamV4TextToImageInput;
    output: BytedanceSeedreamV4TextToImageOutput;
  };
  "fal-ai/bytedance/seedream/v5/lite/edit": {
    input: BytedanceSeedreamV5LiteEditInput;
    output: BytedanceSeedreamV5LiteEditOutput;
  };
  "fal-ai/bytedance/seedream/v5/lite/text-to-image": {
    input: BytedanceSeedreamV5LiteTextToImageInput;
    output: BytedanceSeedreamV5LiteTextToImageOutput;
  };
  "fal-ai/cartoonify": {
    input: CartoonifyInput;
    output: CartoonifyOutput;
  };
  "fal-ai/cat-vton": {
    input: CatVtonInput;
    output: CatVtonOutput;
  };
  "fal-ai/ccsr": {
    input: CcsrInput;
    output: CcsrOutput;
  };
  "fal-ai/chain-of-zoom": {
    input: ChainOfZoomInput;
    output: ChainOfZoomOutput;
  };
  "fal-ai/chrono-edit": {
    input: ChronoEditInput;
    output: ChronoEditOutput;
  };
  "fal-ai/chrono-edit-lora": {
    input: ChronoEditLoraInput;
    output: ChronoEditLoraOutput;
  };
  "fal-ai/chrono-edit-lora-gallery/paintbrush": {
    input: ChronoEditLoraGalleryPaintbrushInput;
    output: ChronoEditLoraGalleryPaintbrushOutput;
  };
  "fal-ai/chrono-edit-lora-gallery/upscaler": {
    input: ChronoEditLoraGalleryUpscalerInput;
    output: ChronoEditLoraGalleryUpscalerOutput;
  };
  "fal-ai/clarity-upscaler": {
    input: ClarityUpscalerInput;
    output: ClarityUpscalerOutput;
  };
  "fal-ai/codeformer": {
    input: CodeformerInput;
    output: CodeformerOutput;
  };
  "fal-ai/cogview4": {
    input: Cogview4Input;
    output: Cogview4Output;
  };
  "fal-ai/creative-upscaler": {
    input: CreativeUpscalerInput;
    output: CreativeUpscalerOutput;
  };
  "fal-ai/ddcolor": {
    input: DdcolorInput;
    output: DdcolorOutput;
  };
  "fal-ai/diffusion-edge": {
    input: DiffusionEdgeInput;
    output: DiffusionEdgeOutput;
  };
  "fal-ai/docres": {
    input: DocresInput;
    output: DocresOutput;
  };
  "fal-ai/docres/dewarp": {
    input: DocresDewarpInput;
    output: DocresDewarpOutput;
  };
  "fal-ai/drct-super-resolution": {
    input: DrctSuperResolutionInput;
    output: DrctSuperResolutionOutput;
  };
  "fal-ai/dreamo": {
    input: DreamoInput;
    output: DreamoOutput;
  };
  "fal-ai/dreamomni2/edit": {
    input: Dreamomni2EditInput;
    output: Dreamomni2EditOutput;
  };
  "fal-ai/dreamshaper": {
    input: DreamshaperInput;
    output: DreamshaperOutput;
  };
  "fal-ai/dwpose": {
    input: DwposeInput;
    output: DwposeOutput;
  };
  "fal-ai/emu-3.5-image/edit-image": {
    input: Emu35ImageEditImageInput;
    output: Emu35ImageEditImageOutput;
  };
  "fal-ai/emu-3.5-image/text-to-image": {
    input: Emu35ImageTextToImageInput;
    output: Emu35ImageTextToImageOutput;
  };
  "fal-ai/era-3d": {
    input: Era3dInput;
    output: Era3dOutput;
  };
  "fal-ai/ernie-image": {
    input: ErnieImageInput;
    output: ErnieImageOutput;
  };
  "fal-ai/ernie-image/turbo": {
    input: ErnieImageTurboInput;
    output: ErnieImageTurboOutput;
  };
  "fal-ai/esrgan": {
    input: EsrganInput;
    output: EsrganOutput;
  };
  "fal-ai/evf-sam": {
    input: EvfSamInput;
    output: EvfSamOutput;
  };
  "fal-ai/f-lite/standard": {
    input: FLiteStandardInput;
    output: FLiteStandardOutput;
  };
  "fal-ai/f-lite/texture": {
    input: FLiteTextureInput;
    output: FLiteTextureOutput;
  };
  "fal-ai/face-to-sticker": {
    input: FaceToStickerInput;
    output: FaceToStickerOutput;
  };
  "fal-ai/fashn/tryon/v1.5": {
    input: FashnTryonV15Input;
    output: FashnTryonV15Output;
  };
  "fal-ai/fashn/tryon/v1.6": {
    input: FashnTryonV16Input;
    output: FashnTryonV16Output;
  };
  "fal-ai/fast-fooocus-sdxl": {
    input: FastFooocusSdxlInput;
    output: FastFooocusSdxlOutput;
  };
  "fal-ai/fast-fooocus-sdxl/image-to-image": {
    input: FastFooocusSdxlImageToImageInput;
    output: FastFooocusSdxlImageToImageOutput;
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
  "fal-ai/fast-sdxl": {
    input: FastSdxlInput;
    output: FastSdxlOutput;
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
  "fal-ai/fast-sdxl/image-to-image": {
    input: FastSdxlImageToImageInput;
    output: FastSdxlImageToImageOutput;
  };
  "fal-ai/fast-sdxl/inpainting": {
    input: FastSdxlInpaintingInput;
    output: FastSdxlInpaintingOutput;
  };
  "fal-ai/ffmpeg-api/extract-frame": {
    input: FfmpegApiExtractFrameInput;
    output: FfmpegApiExtractFrameOutput;
  };
  "fal-ai/film": {
    input: FilmInput;
    output: FilmOutput;
  };
  "fal-ai/finegrain-eraser": {
    input: FinegrainEraserInput;
    output: FinegrainEraserOutput;
  };
  "fal-ai/finegrain-eraser/bbox": {
    input: FinegrainEraserBboxInput;
    output: FinegrainEraserBboxOutput;
  };
  "fal-ai/finegrain-eraser/mask": {
    input: FinegrainEraserMaskInput;
    output: FinegrainEraserMaskOutput;
  };
  "fal-ai/firered-image-edit": {
    input: FireredImageEditInput;
    output: FireredImageEditOutput;
  };
  "fal-ai/firered-image-edit-v1.1": {
    input: FireredImageEditV11Input;
    output: FireredImageEditV11Output;
  };
  "fal-ai/florence-2-large/caption-to-phrase-grounding": {
    input: Florence2LargeCaptionToPhraseGroundingInput;
    output: Florence2LargeCaptionToPhraseGroundingOutput;
  };
  "fal-ai/florence-2-large/dense-region-caption": {
    input: Florence2LargeDenseRegionCaptionInput;
    output: Florence2LargeDenseRegionCaptionOutput;
  };
  "fal-ai/florence-2-large/object-detection": {
    input: Florence2LargeObjectDetectionInput;
    output: Florence2LargeObjectDetectionOutput;
  };
  "fal-ai/florence-2-large/ocr-with-region": {
    input: Florence2LargeOcrWithRegionInput;
    output: Florence2LargeOcrWithRegionOutput;
  };
  "fal-ai/florence-2-large/open-vocabulary-detection": {
    input: Florence2LargeOpenVocabularyDetectionInput;
    output: Florence2LargeOpenVocabularyDetectionOutput;
  };
  "fal-ai/florence-2-large/referring-expression-segmentation": {
    input: Florence2LargeReferringExpressionSegmentationInput;
    output: Florence2LargeReferringExpressionSegmentationOutput;
  };
  "fal-ai/florence-2-large/region-proposal": {
    input: Florence2LargeRegionProposalInput;
    output: Florence2LargeRegionProposalOutput;
  };
  "fal-ai/florence-2-large/region-to-segmentation": {
    input: Florence2LargeRegionToSegmentationInput;
    output: Florence2LargeRegionToSegmentationOutput;
  };
  "fal-ai/flowedit": {
    input: FloweditInput;
    output: FloweditOutput;
  };
  "fal-ai/flux-1/dev": {
    input: Flux1DevInput;
    output: Flux1DevOutput;
  };
  "fal-ai/flux-1/dev/image-to-image": {
    input: Flux1DevImageToImageInput;
    output: Flux1DevImageToImageOutput;
  };
  "fal-ai/flux-1/dev/redux": {
    input: Flux1DevReduxInput;
    output: Flux1DevReduxOutput;
  };
  "fal-ai/flux-1/krea": {
    input: Flux1KreaInput;
    output: Flux1KreaOutput;
  };
  "fal-ai/flux-1/krea/image-to-image": {
    input: Flux1KreaImageToImageInput;
    output: Flux1KreaImageToImageOutput;
  };
  "fal-ai/flux-1/krea/redux": {
    input: Flux1KreaReduxInput;
    output: Flux1KreaReduxOutput;
  };
  "fal-ai/flux-1/schnell": {
    input: Flux1SchnellInput;
    output: Flux1SchnellOutput;
  };
  "fal-ai/flux-1/schnell/redux": {
    input: Flux1SchnellReduxInput;
    output: Flux1SchnellReduxOutput;
  };
  "fal-ai/flux-1/srpo": {
    input: Flux1SrpoInput;
    output: Flux1SrpoOutput;
  };
  "fal-ai/flux-1/srpo/image-to-image": {
    input: Flux1SrpoImageToImageInput;
    output: Flux1SrpoImageToImageOutput;
  };
  "fal-ai/flux-2": {
    input: Flux2Input;
    output: Flux2Output;
  };
  "fal-ai/flux-2-flex": {
    input: Flux2FlexInput;
    output: Flux2FlexOutput;
  };
  "fal-ai/flux-2-flex/edit": {
    input: Flux2FlexEditInput;
    output: Flux2FlexEditOutput;
  };
  "fal-ai/flux-2-lora-gallery/add-background": {
    input: Flux2LoraGalleryAddBackgroundInput;
    output: Flux2LoraGalleryAddBackgroundOutput;
  };
  "fal-ai/flux-2-lora-gallery/apartment-staging": {
    input: Flux2LoraGalleryApartmentStagingInput;
    output: Flux2LoraGalleryApartmentStagingOutput;
  };
  "fal-ai/flux-2-lora-gallery/ballpoint-pen-sketch": {
    input: Flux2LoraGalleryBallpointPenSketchInput;
    output: Flux2LoraGalleryBallpointPenSketchOutput;
  };
  "fal-ai/flux-2-lora-gallery/digital-comic-art": {
    input: Flux2LoraGalleryDigitalComicArtInput;
    output: Flux2LoraGalleryDigitalComicArtOutput;
  };
  "fal-ai/flux-2-lora-gallery/face-to-full-portrait": {
    input: Flux2LoraGalleryFaceToFullPortraitInput;
    output: Flux2LoraGalleryFaceToFullPortraitOutput;
  };
  "fal-ai/flux-2-lora-gallery/hdr-style": {
    input: Flux2LoraGalleryHdrStyleInput;
    output: Flux2LoraGalleryHdrStyleOutput;
  };
  "fal-ai/flux-2-lora-gallery/multiple-angles": {
    input: Flux2LoraGalleryMultipleAnglesInput;
    output: Flux2LoraGalleryMultipleAnglesOutput;
  };
  "fal-ai/flux-2-lora-gallery/realism": {
    input: Flux2LoraGalleryRealismInput;
    output: Flux2LoraGalleryRealismOutput;
  };
  "fal-ai/flux-2-lora-gallery/satellite-view-style": {
    input: Flux2LoraGallerySatelliteViewStyleInput;
    output: Flux2LoraGallerySatelliteViewStyleOutput;
  };
  "fal-ai/flux-2-lora-gallery/sepia-vintage": {
    input: Flux2LoraGallerySepiaVintageInput;
    output: Flux2LoraGallerySepiaVintageOutput;
  };
  "fal-ai/flux-2-lora-gallery/virtual-tryon": {
    input: Flux2LoraGalleryVirtualTryonInput;
    output: Flux2LoraGalleryVirtualTryonOutput;
  };
  "fal-ai/flux-2-max": {
    input: Flux2MaxInput;
    output: Flux2MaxOutput;
  };
  "fal-ai/flux-2-max/edit": {
    input: Flux2MaxEditInput;
    output: Flux2MaxEditOutput;
  };
  "fal-ai/flux-2-pro": {
    input: Flux2ProInput;
    output: Flux2ProOutput;
  };
  "fal-ai/flux-2-pro/edit": {
    input: Flux2ProEditInput;
    output: Flux2ProEditOutput;
  };
  "fal-ai/flux-2/edit": {
    input: Flux2EditInput;
    output: Flux2EditOutput;
  };
  "fal-ai/flux-2/flash": {
    input: Flux2FlashInput;
    output: Flux2FlashOutput;
  };
  "fal-ai/flux-2/flash/edit": {
    input: Flux2FlashEditInput;
    output: Flux2FlashEditOutput;
  };
  "fal-ai/flux-2/klein/4b": {
    input: Flux2Klein4bInput;
    output: Flux2Klein4bOutput;
  };
  "fal-ai/flux-2/klein/4b/base": {
    input: Flux2Klein4bBaseInput;
    output: Flux2Klein4bBaseOutput;
  };
  "fal-ai/flux-2/klein/4b/base/edit": {
    input: Flux2Klein4bBaseEditInput;
    output: Flux2Klein4bBaseEditOutput;
  };
  "fal-ai/flux-2/klein/4b/base/edit/lora": {
    input: Flux2Klein4bBaseEditLoraInput;
    output: Flux2Klein4bBaseEditLoraOutput;
  };
  "fal-ai/flux-2/klein/4b/base/lora": {
    input: Flux2Klein4bBaseLoraInput;
    output: Flux2Klein4bBaseLoraOutput;
  };
  "fal-ai/flux-2/klein/4b/edit": {
    input: Flux2Klein4bEditInput;
    output: Flux2Klein4bEditOutput;
  };
  "fal-ai/flux-2/klein/4b/edit/lora": {
    input: Flux2Klein4bEditLoraInput;
    output: Flux2Klein4bEditLoraOutput;
  };
  "fal-ai/flux-2/klein/4b/lora": {
    input: Flux2Klein4bLoraInput;
    output: Flux2Klein4bLoraOutput;
  };
  "fal-ai/flux-2/klein/9b": {
    input: Flux2Klein9bInput;
    output: Flux2Klein9bOutput;
  };
  "fal-ai/flux-2/klein/9b/base": {
    input: Flux2Klein9bBaseInput;
    output: Flux2Klein9bBaseOutput;
  };
  "fal-ai/flux-2/klein/9b/base/edit": {
    input: Flux2Klein9bBaseEditInput;
    output: Flux2Klein9bBaseEditOutput;
  };
  "fal-ai/flux-2/klein/9b/base/edit/lora": {
    input: Flux2Klein9bBaseEditLoraInput;
    output: Flux2Klein9bBaseEditLoraOutput;
  };
  "fal-ai/flux-2/klein/9b/base/lora": {
    input: Flux2Klein9bBaseLoraInput;
    output: Flux2Klein9bBaseLoraOutput;
  };
  "fal-ai/flux-2/klein/9b/edit": {
    input: Flux2Klein9bEditInput;
    output: Flux2Klein9bEditOutput;
  };
  "fal-ai/flux-2/klein/9b/edit/lora": {
    input: Flux2Klein9bEditLoraInput;
    output: Flux2Klein9bEditLoraOutput;
  };
  "fal-ai/flux-2/klein/9b/lora": {
    input: Flux2Klein9bLoraInput;
    output: Flux2Klein9bLoraOutput;
  };
  "fal-ai/flux-2/klein/realtime": {
    input: Flux2KleinRealtimeInput;
    output: Flux2KleinRealtimeOutput;
  };
  "fal-ai/flux-2/lora": {
    input: Flux2LoraInput;
    output: Flux2LoraOutput;
  };
  "fal-ai/flux-2/lora/edit": {
    input: Flux2LoraEditInput;
    output: Flux2LoraEditOutput;
  };
  "fal-ai/flux-2/turbo": {
    input: Flux2TurboInput;
    output: Flux2TurboOutput;
  };
  "fal-ai/flux-2/turbo/edit": {
    input: Flux2TurboEditInput;
    output: Flux2TurboEditOutput;
  };
  "fal-ai/flux-control-lora-canny": {
    input: FluxControlLoraCannyInput;
    output: FluxControlLoraCannyOutput;
  };
  "fal-ai/flux-control-lora-canny/image-to-image": {
    input: FluxControlLoraCannyImageToImageInput;
    output: FluxControlLoraCannyImageToImageOutput;
  };
  "fal-ai/flux-control-lora-depth": {
    input: FluxControlLoraDepthInput;
    output: FluxControlLoraDepthOutput;
  };
  "fal-ai/flux-control-lora-depth/image-to-image": {
    input: FluxControlLoraDepthImageToImageInput;
    output: FluxControlLoraDepthImageToImageOutput;
  };
  "fal-ai/flux-differential-diffusion": {
    input: FluxDifferentialDiffusionInput;
    output: FluxDifferentialDiffusionOutput;
  };
  "fal-ai/flux-general": {
    input: FluxGeneralInput;
    output: FluxGeneralOutput;
  };
  "fal-ai/flux-general/differential-diffusion": {
    input: FluxGeneralDifferentialDiffusionInput;
    output: FluxGeneralDifferentialDiffusionOutput;
  };
  "fal-ai/flux-general/image-to-image": {
    input: FluxGeneralImageToImageInput;
    output: FluxGeneralImageToImageOutput;
  };
  "fal-ai/flux-general/inpainting": {
    input: FluxGeneralInpaintingInput;
    output: FluxGeneralInpaintingOutput;
  };
  "fal-ai/flux-general/rf-inversion": {
    input: FluxGeneralRfInversionInput;
    output: FluxGeneralRfInversionOutput;
  };
  "fal-ai/flux-kontext-lora": {
    input: FluxKontextLoraInput;
    output: FluxKontextLoraOutput;
  };
  "fal-ai/flux-kontext-lora/inpaint": {
    input: FluxKontextLoraInpaintInput;
    output: FluxKontextLoraInpaintOutput;
  };
  "fal-ai/flux-kontext-lora/text-to-image": {
    input: FluxKontextLoraTextToImageInput;
    output: FluxKontextLoraTextToImageOutput;
  };
  "fal-ai/flux-kontext/dev": {
    input: FluxKontextDevInput;
    output: FluxKontextDevOutput;
  };
  "fal-ai/flux-krea-lora": {
    input: FluxKreaLoraInput;
    output: FluxKreaLoraOutput;
  };
  "fal-ai/flux-krea-lora/image-to-image": {
    input: FluxKreaLoraImageToImageInput;
    output: FluxKreaLoraImageToImageOutput;
  };
  "fal-ai/flux-krea-lora/inpainting": {
    input: FluxKreaLoraInpaintingInput;
    output: FluxKreaLoraInpaintingOutput;
  };
  "fal-ai/flux-krea-lora/stream": {
    input: FluxKreaLoraStreamInput;
    output: FluxKreaLoraStreamOutput;
  };
  "fal-ai/flux-lora": {
    input: FluxLoraInput;
    output: FluxLoraOutput;
  };
  "fal-ai/flux-lora-canny": {
    input: FluxLoraCannyInput;
    output: FluxLoraCannyOutput;
  };
  "fal-ai/flux-lora-depth": {
    input: FluxLoraDepthInput;
    output: FluxLoraDepthOutput;
  };
  "fal-ai/flux-lora-fill": {
    input: FluxLoraFillInput;
    output: FluxLoraFillOutput;
  };
  "fal-ai/flux-lora/image-to-image": {
    input: FluxLoraImageToImageInput;
    output: FluxLoraImageToImageOutput;
  };
  "fal-ai/flux-lora/inpainting": {
    input: FluxLoraInpaintingInput;
    output: FluxLoraInpaintingOutput;
  };
  "fal-ai/flux-lora/stream": {
    input: FluxLoraStreamInput;
    output: FluxLoraStreamOutput;
  };
  "fal-ai/flux-pro/kontext": {
    input: FluxProKontextInput;
    output: FluxProKontextOutput;
  };
  "fal-ai/flux-pro/kontext/max": {
    input: FluxProKontextMaxInput;
    output: FluxProKontextMaxOutput;
  };
  "fal-ai/flux-pro/kontext/max/multi": {
    input: FluxProKontextMaxMultiInput;
    output: FluxProKontextMaxMultiOutput;
  };
  "fal-ai/flux-pro/kontext/max/text-to-image": {
    input: FluxProKontextMaxTextToImageInput;
    output: FluxProKontextMaxTextToImageOutput;
  };
  "fal-ai/flux-pro/kontext/multi": {
    input: FluxProKontextMultiInput;
    output: FluxProKontextMultiOutput;
  };
  "fal-ai/flux-pro/kontext/text-to-image": {
    input: FluxProKontextTextToImageInput;
    output: FluxProKontextTextToImageOutput;
  };
  "fal-ai/flux-pro/v1.1": {
    input: FluxProV11Input;
    output: FluxProV11Output;
  };
  "fal-ai/flux-pro/v1.1-ultra": {
    input: FluxProV11UltraInput;
    output: FluxProV11UltraOutput;
  };
  "fal-ai/flux-pro/v1.1-ultra-finetuned": {
    input: FluxProV11UltraFinetunedInput;
    output: FluxProV11UltraFinetunedOutput;
  };
  "fal-ai/flux-pro/v1.1-ultra/redux": {
    input: FluxProV11UltraReduxInput;
    output: FluxProV11UltraReduxOutput;
  };
  "fal-ai/flux-pro/v1.1/redux": {
    input: FluxProV11ReduxInput;
    output: FluxProV11ReduxOutput;
  };
  "fal-ai/flux-pro/v1/fill": {
    input: FluxProV1FillInput;
    output: FluxProV1FillOutput;
  };
  "fal-ai/flux-pro/v1/fill-finetuned": {
    input: FluxProV1FillFinetunedInput;
    output: FluxProV1FillFinetunedOutput;
  };
  "fal-ai/flux-pulid": {
    input: FluxPulidInput;
    output: FluxPulidOutput;
  };
  "fal-ai/flux-subject": {
    input: FluxSubjectInput;
    output: FluxSubjectOutput;
  };
  "fal-ai/flux-vision-upscaler": {
    input: FluxVisionUpscalerInput;
    output: FluxVisionUpscalerOutput;
  };
  "fal-ai/flux/dev": {
    input: FluxDevInput;
    output: FluxDevOutput;
  };
  "fal-ai/flux/dev/image-to-image": {
    input: FluxDevImageToImageInput;
    output: FluxDevImageToImageOutput;
  };
  "fal-ai/flux/dev/redux": {
    input: FluxDevReduxInput;
    output: FluxDevReduxOutput;
  };
  "fal-ai/flux/krea": {
    input: FluxKreaInput;
    output: FluxKreaOutput;
  };
  "fal-ai/flux/krea/image-to-image": {
    input: FluxKreaImageToImageInput;
    output: FluxKreaImageToImageOutput;
  };
  "fal-ai/flux/krea/redux": {
    input: FluxKreaReduxInput;
    output: FluxKreaReduxOutput;
  };
  "fal-ai/flux/schnell": {
    input: FluxSchnellInput;
    output: FluxSchnellOutput;
  };
  "fal-ai/flux/schnell/redux": {
    input: FluxSchnellReduxInput;
    output: FluxSchnellReduxOutput;
  };
  "fal-ai/flux/srpo": {
    input: FluxSrpoInput;
    output: FluxSrpoOutput;
  };
  "fal-ai/flux/srpo/image-to-image": {
    input: FluxSrpoImageToImageInput;
    output: FluxSrpoImageToImageOutput;
  };
  "fal-ai/fooocus": {
    input: FooocusInput;
    output: FooocusOutput;
  };
  "fal-ai/fooocus/image-prompt": {
    input: FooocusImagePromptInput;
    output: FooocusImagePromptOutput;
  };
  "fal-ai/fooocus/inpaint": {
    input: FooocusInpaintInput;
    output: FooocusInpaintOutput;
  };
  "fal-ai/fooocus/upscale-or-vary": {
    input: FooocusUpscaleOrVaryInput;
    output: FooocusUpscaleOrVaryOutput;
  };
  "fal-ai/gemini-25-flash-image": {
    input: Gemini25FlashImageInput;
    output: Gemini25FlashImageOutput;
  };
  "fal-ai/gemini-25-flash-image/edit": {
    input: Gemini25FlashImageEditInput;
    output: Gemini25FlashImageEditOutput;
  };
  "fal-ai/gemini-3-pro-image-preview": {
    input: Gemini3ProImagePreviewInput;
    output: Gemini3ProImagePreviewOutput;
  };
  "fal-ai/gemini-3-pro-image-preview/edit": {
    input: Gemini3ProImagePreviewEditInput;
    output: Gemini3ProImagePreviewEditOutput;
  };
  "fal-ai/gemini-3.1-flash-image-preview": {
    input: Gemini31FlashImagePreviewInput;
    output: Gemini31FlashImagePreviewOutput;
  };
  "fal-ai/gemini-3.1-flash-image-preview/edit": {
    input: Gemini31FlashImagePreviewEditInput;
    output: Gemini31FlashImagePreviewEditOutput;
  };
  "fal-ai/gemini-flash-edit": {
    input: GeminiFlashEditInput;
    output: GeminiFlashEditOutput;
  };
  "fal-ai/gemini-flash-edit/multi": {
    input: GeminiFlashEditMultiInput;
    output: GeminiFlashEditMultiOutput;
  };
  "fal-ai/genfocus": {
    input: GenfocusInput;
    output: GenfocusOutput;
  };
  "fal-ai/genfocus/all-in-focus": {
    input: GenfocusAllInFocusInput;
    output: GenfocusAllInFocusOutput;
  };
  "fal-ai/ghiblify": {
    input: GhiblifyInput;
    output: GhiblifyOutput;
  };
  "fal-ai/glm-image": {
    input: GlmImageInput;
    output: GlmImageOutput;
  };
  "fal-ai/glm-image/image-to-image": {
    input: GlmImageImageToImageInput;
    output: GlmImageImageToImageOutput;
  };
  "fal-ai/gpt-image-1-mini": {
    input: GptImage1MiniInput;
    output: GptImage1MiniOutput;
  };
  "fal-ai/gpt-image-1-mini/edit": {
    input: GptImage1MiniEditInput;
    output: GptImage1MiniEditOutput;
  };
  "fal-ai/gpt-image-1.5": {
    input: GptImage15Input;
    output: GptImage15Output;
  };
  "fal-ai/gpt-image-1.5/edit": {
    input: GptImage15EditInput;
    output: GptImage15EditOutput;
  };
  "fal-ai/gpt-image-1/edit-image": {
    input: GptImage1EditImageInput;
    output: GptImage1EditImageOutput;
  };
  "fal-ai/gpt-image-1/text-to-image": {
    input: GptImage1TextToImageInput;
    output: GptImage1TextToImageOutput;
  };
  "fal-ai/hidream-e1-1": {
    input: HidreamE11Input;
    output: HidreamE11Output;
  };
  "fal-ai/hidream-i1-dev": {
    input: HidreamI1DevInput;
    output: HidreamI1DevOutput;
  };
  "fal-ai/hidream-i1-fast": {
    input: HidreamI1FastInput;
    output: HidreamI1FastOutput;
  };
  "fal-ai/hidream-i1-full": {
    input: HidreamI1FullInput;
    output: HidreamI1FullOutput;
  };
  "fal-ai/hidream-i1-full/image-to-image": {
    input: HidreamI1FullImageToImageInput;
    output: HidreamI1FullImageToImageOutput;
  };
  "fal-ai/hunyuan_world": {
    input: HunyuanWorldInput;
    output: HunyuanWorldOutput;
  };
  "fal-ai/hunyuan-image/v2.1/text-to-image": {
    input: HunyuanImageV21TextToImageInput;
    output: HunyuanImageV21TextToImageOutput;
  };
  "fal-ai/hunyuan-image/v3/instruct/edit": {
    input: HunyuanImageV3InstructEditInput;
    output: HunyuanImageV3InstructEditOutput;
  };
  "fal-ai/hunyuan-image/v3/instruct/text-to-image": {
    input: HunyuanImageV3InstructTextToImageInput;
    output: HunyuanImageV3InstructTextToImageOutput;
  };
  "fal-ai/hunyuan-image/v3/text-to-image": {
    input: HunyuanImageV3TextToImageInput;
    output: HunyuanImageV3TextToImageOutput;
  };
  "fal-ai/hy-wu-edit": {
    input: HyWuEditInput;
    output: HyWuEditOutput;
  };
  "fal-ai/iclight-v2": {
    input: IclightV2Input;
    output: IclightV2Output;
  };
  "fal-ai/ideogram/character": {
    input: IdeogramCharacterInput;
    output: IdeogramCharacterOutput;
  };
  "fal-ai/ideogram/character/edit": {
    input: IdeogramCharacterEditInput;
    output: IdeogramCharacterEditOutput;
  };
  "fal-ai/ideogram/character/remix": {
    input: IdeogramCharacterRemixInput;
    output: IdeogramCharacterRemixOutput;
  };
  "fal-ai/ideogram/upscale": {
    input: IdeogramUpscaleInput;
    output: IdeogramUpscaleOutput;
  };
  "fal-ai/ideogram/v2": {
    input: IdeogramV2Input;
    output: IdeogramV2Output;
  };
  "fal-ai/ideogram/v2/edit": {
    input: IdeogramV2EditInput;
    output: IdeogramV2EditOutput;
  };
  "fal-ai/ideogram/v2/remix": {
    input: IdeogramV2RemixInput;
    output: IdeogramV2RemixOutput;
  };
  "fal-ai/ideogram/v2/turbo": {
    input: IdeogramV2TurboInput;
    output: IdeogramV2TurboOutput;
  };
  "fal-ai/ideogram/v2/turbo/edit": {
    input: IdeogramV2TurboEditInput;
    output: IdeogramV2TurboEditOutput;
  };
  "fal-ai/ideogram/v2/turbo/remix": {
    input: IdeogramV2TurboRemixInput;
    output: IdeogramV2TurboRemixOutput;
  };
  "fal-ai/ideogram/v2a": {
    input: IdeogramV2aInput;
    output: IdeogramV2aOutput;
  };
  "fal-ai/ideogram/v2a/remix": {
    input: IdeogramV2aRemixInput;
    output: IdeogramV2aRemixOutput;
  };
  "fal-ai/ideogram/v2a/turbo": {
    input: IdeogramV2aTurboInput;
    output: IdeogramV2aTurboOutput;
  };
  "fal-ai/ideogram/v2a/turbo/remix": {
    input: IdeogramV2aTurboRemixInput;
    output: IdeogramV2aTurboRemixOutput;
  };
  "fal-ai/ideogram/v3": {
    input: IdeogramV3Input;
    output: IdeogramV3Output;
  };
  "fal-ai/ideogram/v3/edit": {
    input: IdeogramV3EditInput;
    output: IdeogramV3EditOutput;
  };
  "fal-ai/ideogram/v3/generate-transparent": {
    input: IdeogramV3GenerateTransparentInput;
    output: IdeogramV3GenerateTransparentOutput;
  };
  "fal-ai/ideogram/v3/layerize-text": {
    input: IdeogramV3LayerizeTextInput;
    output: IdeogramV3LayerizeTextOutput;
  };
  "fal-ai/ideogram/v3/reframe": {
    input: IdeogramV3ReframeInput;
    output: IdeogramV3ReframeOutput;
  };
  "fal-ai/ideogram/v3/remix": {
    input: IdeogramV3RemixInput;
    output: IdeogramV3RemixOutput;
  };
  "fal-ai/ideogram/v3/replace-background": {
    input: IdeogramV3ReplaceBackgroundInput;
    output: IdeogramV3ReplaceBackgroundOutput;
  };
  "fal-ai/illusion-diffusion": {
    input: IllusionDiffusionInput;
    output: IllusionDiffusionOutput;
  };
  "fal-ai/image-apps-v2/age-modify": {
    input: ImageAppsV2AgeModifyInput;
    output: ImageAppsV2AgeModifyOutput;
  };
  "fal-ai/image-apps-v2/city-teleport": {
    input: ImageAppsV2CityTeleportInput;
    output: ImageAppsV2CityTeleportOutput;
  };
  "fal-ai/image-apps-v2/expression-change": {
    input: ImageAppsV2ExpressionChangeInput;
    output: ImageAppsV2ExpressionChangeOutput;
  };
  "fal-ai/image-apps-v2/hair-change": {
    input: ImageAppsV2HairChangeInput;
    output: ImageAppsV2HairChangeOutput;
  };
  "fal-ai/image-apps-v2/headshot-photo": {
    input: ImageAppsV2HeadshotPhotoInput;
    output: ImageAppsV2HeadshotPhotoOutput;
  };
  "fal-ai/image-apps-v2/makeup-application": {
    input: ImageAppsV2MakeupApplicationInput;
    output: ImageAppsV2MakeupApplicationOutput;
  };
  "fal-ai/image-apps-v2/object-removal": {
    input: ImageAppsV2ObjectRemovalInput;
    output: ImageAppsV2ObjectRemovalOutput;
  };
  "fal-ai/image-apps-v2/outpaint": {
    input: ImageAppsV2OutpaintInput;
    output: ImageAppsV2OutpaintOutput;
  };
  "fal-ai/image-apps-v2/perspective": {
    input: ImageAppsV2PerspectiveInput;
    output: ImageAppsV2PerspectiveOutput;
  };
  "fal-ai/image-apps-v2/photo-restoration": {
    input: ImageAppsV2PhotoRestorationInput;
    output: ImageAppsV2PhotoRestorationOutput;
  };
  "fal-ai/image-apps-v2/photography-effects": {
    input: ImageAppsV2PhotographyEffectsInput;
    output: ImageAppsV2PhotographyEffectsOutput;
  };
  "fal-ai/image-apps-v2/portrait-enhance": {
    input: ImageAppsV2PortraitEnhanceInput;
    output: ImageAppsV2PortraitEnhanceOutput;
  };
  "fal-ai/image-apps-v2/product-holding": {
    input: ImageAppsV2ProductHoldingInput;
    output: ImageAppsV2ProductHoldingOutput;
  };
  "fal-ai/image-apps-v2/product-photography": {
    input: ImageAppsV2ProductPhotographyInput;
    output: ImageAppsV2ProductPhotographyOutput;
  };
  "fal-ai/image-apps-v2/relighting": {
    input: ImageAppsV2RelightingInput;
    output: ImageAppsV2RelightingOutput;
  };
  "fal-ai/image-apps-v2/style-transfer": {
    input: ImageAppsV2StyleTransferInput;
    output: ImageAppsV2StyleTransferOutput;
  };
  "fal-ai/image-apps-v2/texture-transform": {
    input: ImageAppsV2TextureTransformInput;
    output: ImageAppsV2TextureTransformOutput;
  };
  "fal-ai/image-apps-v2/virtual-try-on": {
    input: ImageAppsV2VirtualTryOnInput;
    output: ImageAppsV2VirtualTryOnOutput;
  };
  "fal-ai/image-editing/age-progression": {
    input: ImageEditingAgeProgressionInput;
    output: ImageEditingAgeProgressionOutput;
  };
  "fal-ai/image-editing/baby-version": {
    input: ImageEditingBabyVersionInput;
    output: ImageEditingBabyVersionOutput;
  };
  "fal-ai/image-editing/background-change": {
    input: ImageEditingBackgroundChangeInput;
    output: ImageEditingBackgroundChangeOutput;
  };
  "fal-ai/image-editing/broccoli-haircut": {
    input: ImageEditingBroccoliHaircutInput;
    output: ImageEditingBroccoliHaircutOutput;
  };
  "fal-ai/image-editing/cartoonify": {
    input: ImageEditingCartoonifyInput;
    output: ImageEditingCartoonifyOutput;
  };
  "fal-ai/image-editing/color-correction": {
    input: ImageEditingColorCorrectionInput;
    output: ImageEditingColorCorrectionOutput;
  };
  "fal-ai/image-editing/expression-change": {
    input: ImageEditingExpressionChangeInput;
    output: ImageEditingExpressionChangeOutput;
  };
  "fal-ai/image-editing/face-enhancement": {
    input: ImageEditingFaceEnhancementInput;
    output: ImageEditingFaceEnhancementOutput;
  };
  "fal-ai/image-editing/hair-change": {
    input: ImageEditingHairChangeInput;
    output: ImageEditingHairChangeOutput;
  };
  "fal-ai/image-editing/object-removal": {
    input: ImageEditingObjectRemovalInput;
    output: ImageEditingObjectRemovalOutput;
  };
  "fal-ai/image-editing/photo-restoration": {
    input: ImageEditingPhotoRestorationInput;
    output: ImageEditingPhotoRestorationOutput;
  };
  "fal-ai/image-editing/plushie-style": {
    input: ImageEditingPlushieStyleInput;
    output: ImageEditingPlushieStyleOutput;
  };
  "fal-ai/image-editing/professional-photo": {
    input: ImageEditingProfessionalPhotoInput;
    output: ImageEditingProfessionalPhotoOutput;
  };
  "fal-ai/image-editing/realism": {
    input: ImageEditingRealismInput;
    output: ImageEditingRealismOutput;
  };
  "fal-ai/image-editing/reframe": {
    input: ImageEditingReframeInput;
    output: ImageEditingReframeOutput;
  };
  "fal-ai/image-editing/retouch": {
    input: ImageEditingRetouchInput;
    output: ImageEditingRetouchOutput;
  };
  "fal-ai/image-editing/scene-composition": {
    input: ImageEditingSceneCompositionInput;
    output: ImageEditingSceneCompositionOutput;
  };
  "fal-ai/image-editing/style-transfer": {
    input: ImageEditingStyleTransferInput;
    output: ImageEditingStyleTransferOutput;
  };
  "fal-ai/image-editing/text-removal": {
    input: ImageEditingTextRemovalInput;
    output: ImageEditingTextRemovalOutput;
  };
  "fal-ai/image-editing/time-of-day": {
    input: ImageEditingTimeOfDayInput;
    output: ImageEditingTimeOfDayOutput;
  };
  "fal-ai/image-editing/weather-effect": {
    input: ImageEditingWeatherEffectInput;
    output: ImageEditingWeatherEffectOutput;
  };
  "fal-ai/image-editing/wojak-style": {
    input: ImageEditingWojakStyleInput;
    output: ImageEditingWojakStyleOutput;
  };
  "fal-ai/image-editing/youtube-thumbnails": {
    input: ImageEditingYoutubeThumbnailsInput;
    output: ImageEditingYoutubeThumbnailsOutput;
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
  "fal-ai/image2pixel": {
    input: Image2PixelInput;
    output: Image2PixelOutput;
  };
  "fal-ai/image2svg": {
    input: Image2SvgInput;
    output: Image2SvgOutput;
  };
  "fal-ai/imagen3": {
    input: Imagen3Input;
    output: Imagen3Output;
  };
  "fal-ai/imagen3/fast": {
    input: Imagen3FastInput;
    output: Imagen3FastOutput;
  };
  "fal-ai/imagen4/preview": {
    input: Imagen4PreviewInput;
    output: Imagen4PreviewOutput;
  };
  "fal-ai/imagen4/preview/fast": {
    input: Imagen4PreviewFastInput;
    output: Imagen4PreviewFastOutput;
  };
  "fal-ai/imagen4/preview/ultra": {
    input: Imagen4PreviewUltraInput;
    output: Imagen4PreviewUltraOutput;
  };
  "fal-ai/imageutils/depth": {
    input: ImageutilsDepthInput;
    output: ImageutilsDepthOutput;
  };
  "fal-ai/imageutils/marigold-depth": {
    input: ImageutilsMarigoldDepthInput;
    output: ImageutilsMarigoldDepthOutput;
  };
  "fal-ai/imageutils/rembg": {
    input: ImageutilsRembgInput;
    output: ImageutilsRembgOutput;
  };
  "fal-ai/inpaint": {
    input: InpaintInput;
    output: InpaintOutput;
  };
  "fal-ai/instant-character": {
    input: InstantCharacterInput;
    output: InstantCharacterOutput;
  };
  "fal-ai/invisible-watermark": {
    input: InvisibleWatermarkInput;
    output: InvisibleWatermarkOutput;
  };
  "fal-ai/ip-adapter-face-id": {
    input: IpAdapterFaceIdInput;
    output: IpAdapterFaceIdOutput;
  };
  "fal-ai/janus": {
    input: JanusInput;
    output: JanusOutput;
  };
  "fal-ai/joyai-image-edit": {
    input: JoyaiImageEditInput;
    output: JoyaiImageEditOutput;
  };
  "fal-ai/kling-image/o1": {
    input: KlingImageO1Input;
    output: KlingImageO1Output;
  };
  "fal-ai/kling-image/o3/image-to-image": {
    input: KlingImageO3ImageToImageInput;
    output: KlingImageO3ImageToImageOutput;
  };
  "fal-ai/kling-image/o3/text-to-image": {
    input: KlingImageO3TextToImageInput;
    output: KlingImageO3TextToImageOutput;
  };
  "fal-ai/kling-image/v3/image-to-image": {
    input: KlingImageV3ImageToImageInput;
    output: KlingImageV3ImageToImageOutput;
  };
  "fal-ai/kling-image/v3/text-to-image": {
    input: KlingImageV3TextToImageInput;
    output: KlingImageV3TextToImageOutput;
  };
  "fal-ai/kling/v1-5/kolors-virtual-try-on": {
    input: KlingV15KolorsVirtualTryOnInput;
    output: KlingV15KolorsVirtualTryOnOutput;
  };
  "fal-ai/kolors": {
    input: KolorsInput;
    output: KolorsOutput;
  };
  "fal-ai/kolors/image-to-image": {
    input: KolorsImageToImageInput;
    output: KolorsImageToImageOutput;
  };
  "fal-ai/layer-diffusion": {
    input: LayerDiffusionInput;
    output: LayerDiffusionOutput;
  };
  "fal-ai/lcm": {
    input: LcmInput;
    output: LcmOutput;
  };
  "fal-ai/lcm-sd15-i2i": {
    input: LcmSd15I2iInput;
    output: LcmSd15I2iOutput;
  };
  "fal-ai/leffa/pose-transfer": {
    input: LeffaPoseTransferInput;
    output: LeffaPoseTransferOutput;
  };
  "fal-ai/leffa/virtual-tryon": {
    input: LeffaVirtualTryonInput;
    output: LeffaVirtualTryonOutput;
  };
  "fal-ai/lightning-models": {
    input: LightningModelsInput;
    output: LightningModelsOutput;
  };
  "fal-ai/live-portrait/image": {
    input: LivePortraitImageInput;
    output: LivePortraitImageOutput;
  };
  "fal-ai/longcat-image": {
    input: LongcatImageInput;
    output: LongcatImageOutput;
  };
  "fal-ai/longcat-image/edit": {
    input: LongcatImageEditInput;
    output: LongcatImageEditOutput;
  };
  "fal-ai/lora": {
    input: LoraInput;
    output: LoraOutput;
  };
  "fal-ai/lora/image-to-image": {
    input: LoraImageToImageInput;
    output: LoraImageToImageOutput;
  };
  "fal-ai/lora/inpaint": {
    input: LoraInpaintInput;
    output: LoraInpaintOutput;
  };
  "fal-ai/lucidflux": {
    input: LucidfluxInput;
    output: LucidfluxOutput;
  };
  "fal-ai/luma-photon": {
    input: LumaPhotonInput;
    output: LumaPhotonOutput;
  };
  "fal-ai/luma-photon/flash": {
    input: LumaPhotonFlashInput;
    output: LumaPhotonFlashOutput;
  };
  "fal-ai/luma-photon/flash/modify": {
    input: LumaPhotonFlashModifyInput;
    output: LumaPhotonFlashModifyOutput;
  };
  "fal-ai/luma-photon/flash/reframe": {
    input: LumaPhotonFlashReframeInput;
    output: LumaPhotonFlashReframeOutput;
  };
  "fal-ai/luma-photon/modify": {
    input: LumaPhotonModifyInput;
    output: LumaPhotonModifyOutput;
  };
  "fal-ai/luma-photon/reframe": {
    input: LumaPhotonReframeInput;
    output: LumaPhotonReframeOutput;
  };
  "fal-ai/lumina-image/v2": {
    input: LuminaImageV2Input;
    output: LuminaImageV2Output;
  };
  "fal-ai/minimax/image-01": {
    input: MinimaxImage01Input;
    output: MinimaxImage01Output;
  };
  "fal-ai/minimax/image-01/subject-reference": {
    input: MinimaxImage01SubjectReferenceInput;
    output: MinimaxImage01SubjectReferenceOutput;
  };
  "fal-ai/mix-dehaze-net": {
    input: MixDehazeNetInput;
    output: MixDehazeNetOutput;
  };
  "fal-ai/moondream-next/detection": {
    input: MoondreamNextDetectionInput;
    output: MoondreamNextDetectionOutput;
  };
  "fal-ai/moondream3-preview/segment": {
    input: Moondream3PreviewSegmentInput;
    output: Moondream3PreviewSegmentOutput;
  };
  "fal-ai/nafnet/deblur": {
    input: NafnetDeblurInput;
    output: NafnetDeblurOutput;
  };
  "fal-ai/nafnet/denoise": {
    input: NafnetDenoiseInput;
    output: NafnetDenoiseOutput;
  };
  "fal-ai/nano-banana": {
    input: NanoBananaInput;
    output: NanoBananaOutput;
  };
  "fal-ai/nano-banana-2": {
    input: NanoBanana2Input;
    output: NanoBanana2Output;
  };
  "fal-ai/nano-banana-2/edit": {
    input: NanoBanana2EditInput;
    output: NanoBanana2EditOutput;
  };
  "fal-ai/nano-banana-pro": {
    input: NanoBananaProInput;
    output: NanoBananaProOutput;
  };
  "fal-ai/nano-banana-pro/edit": {
    input: NanoBananaProEditInput;
    output: NanoBananaProEditOutput;
  };
  "fal-ai/nano-banana/edit": {
    input: NanoBananaEditInput;
    output: NanoBananaEditOutput;
  };
  "fal-ai/nextstep-1": {
    input: Nextstep1Input;
    output: Nextstep1Output;
  };
  "fal-ai/object-removal": {
    input: ObjectRemovalInput;
    output: ObjectRemovalOutput;
  };
  "fal-ai/object-removal/bbox": {
    input: ObjectRemovalBboxInput;
    output: ObjectRemovalBboxOutput;
  };
  "fal-ai/object-removal/mask": {
    input: ObjectRemovalMaskInput;
    output: ObjectRemovalMaskOutput;
  };
  "fal-ai/omni-zero": {
    input: OmniZeroInput;
    output: OmniZeroOutput;
  };
  "fal-ai/omnigen-v1": {
    input: OmnigenV1Input;
    output: OmnigenV1Output;
  };
  "fal-ai/omnigen-v2": {
    input: OmnigenV2Input;
    output: OmnigenV2Output;
  };
  "fal-ai/onereward": {
    input: OnerewardInput;
    output: OnerewardOutput;
  };
  "fal-ai/ovis-image": {
    input: OvisImageInput;
    output: OvisImageOutput;
  };
  "fal-ai/pasd": {
    input: PasdInput;
    output: PasdOutput;
  };
  "fal-ai/patina": {
    input: PatinaInput;
    output: PatinaOutput;
  };
  "fal-ai/patina/material": {
    input: PatinaMaterialInput;
    output: PatinaMaterialOutput;
  };
  "fal-ai/patina/material/extract": {
    input: PatinaMaterialExtractInput;
    output: PatinaMaterialExtractOutput;
  };
  "fal-ai/phota": {
    input: PhotaInput;
    output: PhotaOutput;
  };
  "fal-ai/phota/edit": {
    input: PhotaEditInput;
    output: PhotaEditOutput;
  };
  "fal-ai/phota/enhance": {
    input: PhotaEnhanceInput;
    output: PhotaEnhanceOutput;
  };
  "fal-ai/photomaker": {
    input: PhotomakerInput;
    output: PhotomakerOutput;
  };
  "fal-ai/physic-edit": {
    input: PhysicEditInput;
    output: PhysicEditOutput;
  };
  "fal-ai/piflow": {
    input: PiflowInput;
    output: PiflowOutput;
  };
  "fal-ai/pixart-sigma": {
    input: PixartSigmaInput;
    output: PixartSigmaOutput;
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
  "fal-ai/plushify": {
    input: PlushifyInput;
    output: PlushifyOutput;
  };
  "fal-ai/pony-v7": {
    input: PonyV7Input;
    output: PonyV7Output;
  };
  "fal-ai/post-processing": {
    input: PostProcessingInput;
    output: PostProcessingOutput;
  };
  "fal-ai/post-processing/blur": {
    input: PostProcessingBlurInput;
    output: PostProcessingBlurOutput;
  };
  "fal-ai/post-processing/chromatic-aberration": {
    input: PostProcessingChromaticAberrationInput;
    output: PostProcessingChromaticAberrationOutput;
  };
  "fal-ai/post-processing/color-correction": {
    input: PostProcessingColorCorrectionInput;
    output: PostProcessingColorCorrectionOutput;
  };
  "fal-ai/post-processing/color-tint": {
    input: PostProcessingColorTintInput;
    output: PostProcessingColorTintOutput;
  };
  "fal-ai/post-processing/desaturate": {
    input: PostProcessingDesaturateInput;
    output: PostProcessingDesaturateOutput;
  };
  "fal-ai/post-processing/dissolve": {
    input: PostProcessingDissolveInput;
    output: PostProcessingDissolveOutput;
  };
  "fal-ai/post-processing/dodge-burn": {
    input: PostProcessingDodgeBurnInput;
    output: PostProcessingDodgeBurnOutput;
  };
  "fal-ai/post-processing/grain": {
    input: PostProcessingGrainInput;
    output: PostProcessingGrainOutput;
  };
  "fal-ai/post-processing/parabolize": {
    input: PostProcessingParabolizeInput;
    output: PostProcessingParabolizeOutput;
  };
  "fal-ai/post-processing/sharpen": {
    input: PostProcessingSharpenInput;
    output: PostProcessingSharpenOutput;
  };
  "fal-ai/post-processing/solarize": {
    input: PostProcessingSolarizeInput;
    output: PostProcessingSolarizeOutput;
  };
  "fal-ai/post-processing/vignette": {
    input: PostProcessingVignetteInput;
    output: PostProcessingVignetteOutput;
  };
  "fal-ai/pulid": {
    input: PulidInput;
    output: PulidOutput;
  };
  "fal-ai/qwen-image": {
    input: QwenImageInput;
    output: QwenImageOutput;
  };
  "fal-ai/qwen-image-2/edit": {
    input: QwenImage2EditInput;
    output: QwenImage2EditOutput;
  };
  "fal-ai/qwen-image-2/pro/edit": {
    input: QwenImage2ProEditInput;
    output: QwenImage2ProEditOutput;
  };
  "fal-ai/qwen-image-2/pro/text-to-image": {
    input: QwenImage2ProTextToImageInput;
    output: QwenImage2ProTextToImageOutput;
  };
  "fal-ai/qwen-image-2/text-to-image": {
    input: QwenImage2TextToImageInput;
    output: QwenImage2TextToImageOutput;
  };
  "fal-ai/qwen-image-2512": {
    input: QwenImage2512Input;
    output: QwenImage2512Output;
  };
  "fal-ai/qwen-image-2512/lora": {
    input: QwenImage2512LoraInput;
    output: QwenImage2512LoraOutput;
  };
  "fal-ai/qwen-image-edit": {
    input: QwenImageEditInput;
    output: QwenImageEditOutput;
  };
  "fal-ai/qwen-image-edit-2509": {
    input: QwenImageEdit2509Input;
    output: QwenImageEdit2509Output;
  };
  "fal-ai/qwen-image-edit-2509-lora": {
    input: QwenImageEdit2509LoraInput;
    output: QwenImageEdit2509LoraOutput;
  };
  "fal-ai/qwen-image-edit-2509-lora-gallery/add-background": {
    input: QwenImageEdit2509LoraGalleryAddBackgroundInput;
    output: QwenImageEdit2509LoraGalleryAddBackgroundOutput;
  };
  "fal-ai/qwen-image-edit-2509-lora-gallery/face-to-full-portrait": {
    input: QwenImageEdit2509LoraGalleryFaceToFullPortraitInput;
    output: QwenImageEdit2509LoraGalleryFaceToFullPortraitOutput;
  };
  "fal-ai/qwen-image-edit-2509-lora-gallery/group-photo": {
    input: QwenImageEdit2509LoraGalleryGroupPhotoInput;
    output: QwenImageEdit2509LoraGalleryGroupPhotoOutput;
  };
  "fal-ai/qwen-image-edit-2509-lora-gallery/integrate-product": {
    input: QwenImageEdit2509LoraGalleryIntegrateProductInput;
    output: QwenImageEdit2509LoraGalleryIntegrateProductOutput;
  };
  "fal-ai/qwen-image-edit-2509-lora-gallery/lighting-restoration": {
    input: QwenImageEdit2509LoraGalleryLightingRestorationInput;
    output: QwenImageEdit2509LoraGalleryLightingRestorationOutput;
  };
  "fal-ai/qwen-image-edit-2509-lora-gallery/multiple-angles": {
    input: QwenImageEdit2509LoraGalleryMultipleAnglesInput;
    output: QwenImageEdit2509LoraGalleryMultipleAnglesOutput;
  };
  "fal-ai/qwen-image-edit-2509-lora-gallery/next-scene": {
    input: QwenImageEdit2509LoraGalleryNextSceneInput;
    output: QwenImageEdit2509LoraGalleryNextSceneOutput;
  };
  "fal-ai/qwen-image-edit-2509-lora-gallery/remove-element": {
    input: QwenImageEdit2509LoraGalleryRemoveElementInput;
    output: QwenImageEdit2509LoraGalleryRemoveElementOutput;
  };
  "fal-ai/qwen-image-edit-2509-lora-gallery/remove-lighting": {
    input: QwenImageEdit2509LoraGalleryRemoveLightingInput;
    output: QwenImageEdit2509LoraGalleryRemoveLightingOutput;
  };
  "fal-ai/qwen-image-edit-2509-lora-gallery/shirt-design": {
    input: QwenImageEdit2509LoraGalleryShirtDesignInput;
    output: QwenImageEdit2509LoraGalleryShirtDesignOutput;
  };
  "fal-ai/qwen-image-edit-2511": {
    input: QwenImageEdit2511Input;
    output: QwenImageEdit2511Output;
  };
  "fal-ai/qwen-image-edit-2511-multiple-angles": {
    input: QwenImageEdit2511MultipleAnglesInput;
    output: QwenImageEdit2511MultipleAnglesOutput;
  };
  "fal-ai/qwen-image-edit-2511/lora": {
    input: QwenImageEdit2511LoraInput;
    output: QwenImageEdit2511LoraOutput;
  };
  "fal-ai/qwen-image-edit-lora": {
    input: QwenImageEditLoraInput;
    output: QwenImageEditLoraOutput;
  };
  "fal-ai/qwen-image-edit-plus": {
    input: QwenImageEditPlusInput;
    output: QwenImageEditPlusOutput;
  };
  "fal-ai/qwen-image-edit-plus-lora": {
    input: QwenImageEditPlusLoraInput;
    output: QwenImageEditPlusLoraOutput;
  };
  "fal-ai/qwen-image-edit-plus-lora-gallery/add-background": {
    input: QwenImageEditPlusLoraGalleryAddBackgroundInput;
    output: QwenImageEditPlusLoraGalleryAddBackgroundOutput;
  };
  "fal-ai/qwen-image-edit-plus-lora-gallery/face-to-full-portrait": {
    input: QwenImageEditPlusLoraGalleryFaceToFullPortraitInput;
    output: QwenImageEditPlusLoraGalleryFaceToFullPortraitOutput;
  };
  "fal-ai/qwen-image-edit-plus-lora-gallery/group-photo": {
    input: QwenImageEditPlusLoraGalleryGroupPhotoInput;
    output: QwenImageEditPlusLoraGalleryGroupPhotoOutput;
  };
  "fal-ai/qwen-image-edit-plus-lora-gallery/integrate-product": {
    input: QwenImageEditPlusLoraGalleryIntegrateProductInput;
    output: QwenImageEditPlusLoraGalleryIntegrateProductOutput;
  };
  "fal-ai/qwen-image-edit-plus-lora-gallery/lighting-restoration": {
    input: QwenImageEditPlusLoraGalleryLightingRestorationInput;
    output: QwenImageEditPlusLoraGalleryLightingRestorationOutput;
  };
  "fal-ai/qwen-image-edit-plus-lora-gallery/multiple-angles": {
    input: QwenImageEditPlusLoraGalleryMultipleAnglesInput;
    output: QwenImageEditPlusLoraGalleryMultipleAnglesOutput;
  };
  "fal-ai/qwen-image-edit-plus-lora-gallery/next-scene": {
    input: QwenImageEditPlusLoraGalleryNextSceneInput;
    output: QwenImageEditPlusLoraGalleryNextSceneOutput;
  };
  "fal-ai/qwen-image-edit-plus-lora-gallery/remove-element": {
    input: QwenImageEditPlusLoraGalleryRemoveElementInput;
    output: QwenImageEditPlusLoraGalleryRemoveElementOutput;
  };
  "fal-ai/qwen-image-edit-plus-lora-gallery/remove-lighting": {
    input: QwenImageEditPlusLoraGalleryRemoveLightingInput;
    output: QwenImageEditPlusLoraGalleryRemoveLightingOutput;
  };
  "fal-ai/qwen-image-edit-plus-lora-gallery/shirt-design": {
    input: QwenImageEditPlusLoraGalleryShirtDesignInput;
    output: QwenImageEditPlusLoraGalleryShirtDesignOutput;
  };
  "fal-ai/qwen-image-edit/image-to-image": {
    input: QwenImageEditImageToImageInput;
    output: QwenImageEditImageToImageOutput;
  };
  "fal-ai/qwen-image-edit/inpaint": {
    input: QwenImageEditInpaintInput;
    output: QwenImageEditInpaintOutput;
  };
  "fal-ai/qwen-image-layered": {
    input: QwenImageLayeredInput;
    output: QwenImageLayeredOutput;
  };
  "fal-ai/qwen-image-layered/lora": {
    input: QwenImageLayeredLoraInput;
    output: QwenImageLayeredLoraOutput;
  };
  "fal-ai/qwen-image-max/edit": {
    input: QwenImageMaxEditInput;
    output: QwenImageMaxEditOutput;
  };
  "fal-ai/qwen-image-max/text-to-image": {
    input: QwenImageMaxTextToImageInput;
    output: QwenImageMaxTextToImageOutput;
  };
  "fal-ai/qwen-image/image-to-image": {
    input: QwenImageImageToImageInput;
    output: QwenImageImageToImageOutput;
  };
  "fal-ai/realistic-vision": {
    input: RealisticVisionInput;
    output: RealisticVisionOutput;
  };
  "fal-ai/recraft-20b": {
    input: Recraft20bInput;
    output: Recraft20bOutput;
  };
  "fal-ai/recraft/upscale/creative": {
    input: RecraftUpscaleCreativeInput;
    output: RecraftUpscaleCreativeOutput;
  };
  "fal-ai/recraft/upscale/crisp": {
    input: RecraftUpscaleCrispInput;
    output: RecraftUpscaleCrispOutput;
  };
  "fal-ai/recraft/v3/image-to-image": {
    input: RecraftV3ImageToImageInput;
    output: RecraftV3ImageToImageOutput;
  };
  "fal-ai/recraft/v3/text-to-image": {
    input: RecraftV3TextToImageInput;
    output: RecraftV3TextToImageOutput;
  };
  "fal-ai/recraft/v4/pro/text-to-image": {
    input: RecraftV4ProTextToImageInput;
    output: RecraftV4ProTextToImageOutput;
  };
  "fal-ai/recraft/v4/pro/text-to-vector": {
    input: RecraftV4ProTextToVectorInput;
    output: RecraftV4ProTextToVectorOutput;
  };
  "fal-ai/recraft/v4/text-to-image": {
    input: RecraftV4TextToImageInput;
    output: RecraftV4TextToImageOutput;
  };
  "fal-ai/recraft/v4/text-to-vector": {
    input: RecraftV4TextToVectorInput;
    output: RecraftV4TextToVectorOutput;
  };
  "fal-ai/recraft/vectorize": {
    input: RecraftVectorizeInput;
    output: RecraftVectorizeOutput;
  };
  "fal-ai/retoucher": {
    input: RetoucherInput;
    output: RetoucherOutput;
  };
  "fal-ai/rife": {
    input: RifeInput;
    output: RifeOutput;
  };
  "fal-ai/sam-3-1/image": {
    input: Sam31ImageInput;
    output: Sam31ImageOutput;
  };
  "fal-ai/sam-3-1/image-rle": {
    input: Sam31ImageRleInput;
    output: Sam31ImageRleOutput;
  };
  "fal-ai/sam-3/image": {
    input: Sam3ImageInput;
    output: Sam3ImageOutput;
  };
  "fal-ai/sam-3/image-rle": {
    input: Sam3ImageRleInput;
    output: Sam3ImageRleOutput;
  };
  "fal-ai/sam2/auto-segment": {
    input: Sam2AutoSegmentInput;
    output: Sam2AutoSegmentOutput;
  };
  "fal-ai/sam2/image": {
    input: Sam2ImageInput;
    output: Sam2ImageOutput;
  };
  "fal-ai/sana": {
    input: SanaInput;
    output: SanaOutput;
  };
  "fal-ai/sana/sprint": {
    input: SanaSprintInput;
    output: SanaSprintOutput;
  };
  "fal-ai/sana/v1.5/1.6b": {
    input: SanaV1516bInput;
    output: SanaV1516bOutput;
  };
  "fal-ai/sana/v1.5/4.8b": {
    input: SanaV1548bInput;
    output: SanaV1548bOutput;
  };
  "fal-ai/sd15-depth-controlnet": {
    input: Sd15DepthControlnetInput;
    output: Sd15DepthControlnetOutput;
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
  "fal-ai/seedvr/upscale/image": {
    input: SeedvrUpscaleImageInput;
    output: SeedvrUpscaleImageOutput;
  };
  "fal-ai/seedvr/upscale/image/seamless": {
    input: SeedvrUpscaleImageSeamlessInput;
    output: SeedvrUpscaleImageSeamlessOutput;
  };
  "fal-ai/stable-cascade": {
    input: StableCascadeInput;
    output: StableCascadeOutput;
  };
  "fal-ai/stable-cascade/sote-diffusion": {
    input: StableCascadeSoteDiffusionInput;
    output: StableCascadeSoteDiffusionOutput;
  };
  "fal-ai/stable-diffusion-v15": {
    input: StableDiffusionV15Input;
    output: StableDiffusionV15Output;
  };
  "fal-ai/stable-diffusion-v3-medium": {
    input: StableDiffusionV3MediumInput;
    output: StableDiffusionV3MediumOutput;
  };
  "fal-ai/stable-diffusion-v3-medium/image-to-image": {
    input: StableDiffusionV3MediumImageToImageInput;
    output: StableDiffusionV3MediumImageToImageOutput;
  };
  "fal-ai/stable-diffusion-v35-large": {
    input: StableDiffusionV35LargeInput;
    output: StableDiffusionV35LargeOutput;
  };
  "fal-ai/stable-diffusion-v35-medium": {
    input: StableDiffusionV35MediumInput;
    output: StableDiffusionV35MediumOutput;
  };
  "fal-ai/star-vector": {
    input: StarVectorInput;
    output: StarVectorOutput;
  };
  "fal-ai/step1x-edit": {
    input: Step1xEditInput;
    output: Step1xEditOutput;
  };
  "fal-ai/stepx-edit2": {
    input: StepxEdit2Input;
    output: StepxEdit2Output;
  };
  "fal-ai/swin2sr": {
    input: Swin2SrInput;
    output: Swin2SrOutput;
  };
  "fal-ai/switti": {
    input: SwittiInput;
    output: SwittiOutput;
  };
  "fal-ai/switti/512": {
    input: Switti512Input;
    output: Switti512Output;
  };
  "fal-ai/thera": {
    input: TheraInput;
    output: TheraOutput;
  };
  "fal-ai/topaz/upscale/image": {
    input: TopazUpscaleImageInput;
    output: TopazUpscaleImageOutput;
  };
  "fal-ai/uno": {
    input: UnoInput;
    output: UnoOutput;
  };
  "fal-ai/uso": {
    input: UsoInput;
    output: UsoOutput;
  };
  "fal-ai/vecglypher": {
    input: VecglypherInput;
    output: VecglypherOutput;
  };
  "fal-ai/vecglypher/image-to-svg": {
    input: VecglypherImageToSvgInput;
    output: VecglypherImageToSvgOutput;
  };
  "fal-ai/vidu/q2/reference-to-image": {
    input: ViduQ2ReferenceToImageInput;
    output: ViduQ2ReferenceToImageOutput;
  };
  "fal-ai/vidu/q2/text-to-image": {
    input: ViduQ2TextToImageInput;
    output: ViduQ2TextToImageOutput;
  };
  "fal-ai/vidu/reference-to-image": {
    input: ViduReferenceToImageInput;
    output: ViduReferenceToImageOutput;
  };
  "fal-ai/wan-25-preview/image-to-image": {
    input: Wan25PreviewImageToImageInput;
    output: Wan25PreviewImageToImageOutput;
  };
  "fal-ai/wan-25-preview/text-to-image": {
    input: Wan25PreviewTextToImageInput;
    output: Wan25PreviewTextToImageOutput;
  };
  "fal-ai/wan/v2.2-5b/text-to-image": {
    input: WanV225bTextToImageInput;
    output: WanV225bTextToImageOutput;
  };
  "fal-ai/wan/v2.2-a14b/image-to-image": {
    input: WanV22A14bImageToImageInput;
    output: WanV22A14bImageToImageOutput;
  };
  "fal-ai/wan/v2.2-a14b/text-to-image": {
    input: WanV22A14bTextToImageInput;
    output: WanV22A14bTextToImageOutput;
  };
  "fal-ai/wan/v2.2-a14b/text-to-image/lora": {
    input: WanV22A14bTextToImageLoraInput;
    output: WanV22A14bTextToImageLoraOutput;
  };
  "fal-ai/wan/v2.7/edit": {
    input: WanV27EditInput;
    output: WanV27EditOutput;
  };
  "fal-ai/wan/v2.7/pro/edit": {
    input: WanV27ProEditInput;
    output: WanV27ProEditOutput;
  };
  "fal-ai/wan/v2.7/pro/text-to-image": {
    input: WanV27ProTextToImageInput;
    output: WanV27ProTextToImageOutput;
  };
  "fal-ai/wan/v2.7/text-to-image": {
    input: WanV27TextToImageInput;
    output: WanV27TextToImageOutput;
  };
  "fal-ai/workflow-utilities/extract-nth-frame": {
    input: WorkflowUtilitiesExtractNthFrameInput;
    output: WorkflowUtilitiesExtractNthFrameOutput;
  };
  "fal-ai/z-image/base": {
    input: ZImageBaseInput;
    output: ZImageBaseOutput;
  };
  "fal-ai/z-image/base/lora": {
    input: ZImageBaseLoraInput;
    output: ZImageBaseLoraOutput;
  };
  "fal-ai/z-image/turbo": {
    input: ZImageTurboInput;
    output: ZImageTurboOutput;
  };
  "fal-ai/z-image/turbo/controlnet": {
    input: ZImageTurboControlnetInput;
    output: ZImageTurboControlnetOutput;
  };
  "fal-ai/z-image/turbo/controlnet/lora": {
    input: ZImageTurboControlnetLoraInput;
    output: ZImageTurboControlnetLoraOutput;
  };
  "fal-ai/z-image/turbo/image-to-image": {
    input: ZImageTurboImageToImageInput;
    output: ZImageTurboImageToImageOutput;
  };
  "fal-ai/z-image/turbo/image-to-image/lora": {
    input: ZImageTurboImageToImageLoraInput;
    output: ZImageTurboImageToImageLoraOutput;
  };
  "fal-ai/z-image/turbo/inpaint": {
    input: ZImageTurboInpaintInput;
    output: ZImageTurboInpaintOutput;
  };
  "fal-ai/z-image/turbo/inpaint/lora": {
    input: ZImageTurboInpaintLoraInput;
    output: ZImageTurboInpaintLoraOutput;
  };
  "fal-ai/z-image/turbo/lora": {
    input: ZImageTurboLoraInput;
    output: ZImageTurboLoraOutput;
  };
  "fal-ai/z-image/turbo/tiling": {
    input: ZImageTurboTilingInput;
    output: ZImageTurboTilingOutput;
  };
  "fal-ai/z-image/turbo/tiling/lora": {
    input: ZImageTurboTilingLoraInput;
    output: ZImageTurboTilingLoraOutput;
  };
  "imagineart/imagineart-1.5-preview/text-to-image": {
    input: Imagineart15PreviewTextToImageInput;
    output: Imagineart15PreviewTextToImageOutput;
  };
  "imagineart/imagineart-1.5-pro-preview/text-to-image": {
    input: Imagineart15ProPreviewTextToImageInput;
    output: Imagineart15ProPreviewTextToImageOutput;
  };
  "pixelcut/background-removal": {
    input: BackgroundRemovalInput;
    output: BackgroundRemovalOutput;
  };
  "rundiffusion-fal/juggernaut-flux-lora": {
    input: JuggernautFluxLoraInput;
    output: JuggernautFluxLoraOutput;
  };
  "rundiffusion-fal/juggernaut-flux-lora/inpainting": {
    input: JuggernautFluxLoraInpaintingInput;
    output: JuggernautFluxLoraInpaintingOutput;
  };
  "rundiffusion-fal/juggernaut-flux/base": {
    input: JuggernautFluxBaseInput;
    output: JuggernautFluxBaseOutput;
  };
  "rundiffusion-fal/juggernaut-flux/base/image-to-image": {
    input: JuggernautFluxBaseImageToImageInput;
    output: JuggernautFluxBaseImageToImageOutput;
  };
  "rundiffusion-fal/juggernaut-flux/lightning": {
    input: JuggernautFluxLightningInput;
    output: JuggernautFluxLightningOutput;
  };
  "rundiffusion-fal/juggernaut-flux/pro": {
    input: JuggernautFluxProInput;
    output: JuggernautFluxProOutput;
  };
  "rundiffusion-fal/juggernaut-flux/pro/image-to-image": {
    input: JuggernautFluxProImageToImageInput;
    output: JuggernautFluxProImageToImageOutput;
  };
  "rundiffusion-fal/rundiffusion-photo-flux": {
    input: RundiffusionPhotoFluxInput;
    output: RundiffusionPhotoFluxOutput;
  };
  "smoretalk-ai/rembg-enhance": {
    input: RembgEnhanceInput;
    output: RembgEnhanceOutput;
  };
  "wan/v2.6/image-to-image": {
    input: V26ImageToImageInput;
    output: V26ImageToImageOutput;
  };
  "wan/v2.6/text-to-image": {
    input: V26TextToImageInput;
    output: V26TextToImageOutput;
  };
  "xai/grok-imagine-image": {
    input: GrokImagineImageInput;
    output: GrokImagineImageOutput;
  };
  "xai/grok-imagine-image/edit": {
    input: GrokImagineImageEditInput;
    output: GrokImagineImageEditOutput;
  };
};

/** Union type of all image model endpoint IDs */
export type ImageModel = keyof ImageEndpointMap;

/** Get the input type for a specific image model */
export type ImageModelInput<T extends ImageModel> =
  ImageEndpointMap[T]["input"];

/** Get the output type for a specific image model */
export type ImageModelOutput<T extends ImageModel> =
  ImageEndpointMap[T]["output"];
