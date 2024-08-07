import { type Excalidraw } from "@excalidraw/excalidraw";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import {
  AppState,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types/types";
import { useCallback, useEffect, useState } from "react";
import initialDrawing from "./drawingState.json";

export type CanvasChangeEvent = {
  elements: readonly ExcalidrawElement[];
  appState: AppState;
  imageData: Uint8Array;
};

export type DrawingCanvasProps = {
  onCanvasChange: (event: CanvasChangeEvent) => void;
};

export async function blobToBase64(blob: Blob): Promise<string> {
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  return new Promise<string>((resolve) => {
    reader.onloadend = () => {
      resolve(reader.result?.toString() || "");
    };
  });
}

export async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
}

export function DrawingCanvas({ onCanvasChange }: DrawingCanvasProps) {
  const [ExcalidrawComponent, setExcalidrawComponent] = useState<
    typeof Excalidraw | null
  >(null);
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const [sceneData, setSceneData] = useState<any>(null);

  useEffect(() => {
    import("@excalidraw/excalidraw").then((comp) =>
      setExcalidrawComponent(comp.Excalidraw),
    );
    const onResize = () => {
      if (excalidrawAPI) {
        excalidrawAPI.refresh();
      }
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const handleCanvasChanges = useCallback(
    async (elements: readonly ExcalidrawElement[], appState: AppState) => {
      if (!excalidrawAPI || !elements || !elements.length) {
        return;
      }
      const { exportToBlob, convertToExcalidrawElements, serializeAsJSON } =
        await import("@excalidraw/excalidraw");

      const [boundingBoxElement] = convertToExcalidrawElements([
        {
          type: "rectangle",
          x: 0,
          y: 0,
          width: 512,
          height: 512,
          fillStyle: "solid",
          backgroundColor: "cyan",
        },
      ]);

      const newSceneData = serializeAsJSON(
        elements,
        appState,
        excalidrawAPI.getFiles(),
        "local",
      );
      if (newSceneData !== sceneData) {
        setSceneData(newSceneData);
        const blob = await exportToBlob({
          elements: [boundingBoxElement, ...elements],
          appState: {
            ...appState,
            frameRendering: {
              ...(appState.frameRendering || {}),
              clip: false,
            },
          },
          files: excalidrawAPI.getFiles(),
          mimeType: "image/webp",
          quality: 0.5,
          exportPadding: 0,
          getDimensions: () => {
            return { width: 512, height: 512 };
          },
        });
        const imageData = await blobToUint8Array(blob);
        onCanvasChange({ elements, appState, imageData });
      }
    },
    [excalidrawAPI, onCanvasChange, sceneData],
  );

  return (
    <div style={{ height: "560px", width: "560px" }}>
      {ExcalidrawComponent && (
        <ExcalidrawComponent
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          initialData={{ elements: initialDrawing as ExcalidrawElement[] }}
          onChange={handleCanvasChanges}
        />
      )}
    </div>
  );
}
