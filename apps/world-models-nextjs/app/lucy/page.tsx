"use client";

import {
  lucyRealtime,
  type LucyConnectionState,
  type LucyRealtimeSession,
} from "@fal-ai/client/realtime";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { fal, realtimeToken } from "../../lib/fal";

const lucy = lucyRealtime();

const CUSTOMER_CODE = `const camera = await navigator.mediaDevices.getUserMedia({
  video: true,
});
cameraPreview.srcObject = camera;
await cameraPreview.play();
const firstFrame = await captureFrame(cameraPreview);

const session = await fal.realtime.open(lucyRealtime(), {
  input: { prompt, image_url: firstFrame },
  localStream: camera,
  tokenProvider: getRealtimeToken,
  onRemoteStream: (stream) => {
    outputVideo.srcObject = stream;
  },
});`;

async function captureFrame(video: HTMLVideoElement): Promise<string> {
  if (
    video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
    video.videoWidth === 0
  ) {
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(
        () => reject(new Error("The camera did not produce a video frame")),
        5_000,
      );
      video.addEventListener(
        "loadeddata",
        () => {
          window.clearTimeout(timeout);
          resolve();
        },
        { once: true },
      );
    });
  }

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not capture the first camera frame");
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.86);
}

function messageForState(state: LucyConnectionState | "idle") {
  switch (state) {
    case "idle":
      return "Ready for camera permission";
    case "negotiating":
    case "connecting":
      return "Negotiating a private WebRTC connection";
    case "connected":
      return "Live";
    case "failed":
      return "Connection failed";
    case "closed":
      return "Session closed";
    default:
      return state;
  }
}

export default function LucyPage() {
  const [prompt, setPrompt] = useState(
    "A tiny explorer walking through a luminous paper-cut forest",
  );
  const [state, setState] = useState<LucyConnectionState | "idle">("idle");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const sessionRef = useRef<LucyRealtimeSession | null>(null);
  const cameraRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const outputVideoRef = useRef<HTMLVideoElement | null>(null);

  const stop = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = null;
    const session = sessionRef.current;
    sessionRef.current = null;
    await session?.close();
    cameraRef.current?.getTracks().forEach((track) => track.stop());
    cameraRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (outputVideoRef.current) outputVideoRef.current.srcObject = null;
    setState("idle");
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      void sessionRef.current?.close();
      cameraRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const start = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setState("negotiating");
    const abortController = new AbortController();
    abortRef.current = abortController;
    try {
      const camera = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      cameraRef.current = camera;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = camera;
        await localVideoRef.current.play();
      }
      if (!localVideoRef.current) {
        throw new Error("The camera preview is not mounted");
      }
      const firstFrame = await captureFrame(localVideoRef.current);

      sessionRef.current = await fal.realtime.open(lucy, {
        input: { prompt, image_url: firstFrame },
        localStream: camera,
        tokenProvider: realtimeToken,
        tokenExpirationSeconds: 120,
        abortSignal: abortController.signal,
        onConnectionStateChange: setState,
        onRemoteStream: (stream) => {
          if (!outputVideoRef.current) return;
          outputVideoRef.current.srcObject = stream;
          void outputVideoRef.current.play();
        },
        onError: (reason) => setError(reason.message),
      });
    } catch (reason) {
      if (!abortController.signal.aborted) {
        setError(reason instanceof Error ? reason.message : String(reason));
      }
      await stop();
    }
  };

  const isActive = state !== "idle" && state !== "closed";

  return (
    <main className="demo-page">
      <section className="demo-heading">
        <div>
          <p className="eyebrow">Lucy 2.5 · WebRTC extension</p>
          <h1>Turn a camera into a world.</h1>
        </div>
        <p>
          The app supplies a camera and a prompt. The extension handles tokens,
          SDP offers and answers, ICE candidates, remote tracks, and teardown.
        </p>
      </section>

      <section className="demo-workspace">
        <div className="stage stage-dark">
          <video
            ref={outputVideoRef}
            autoPlay
            muted
            playsInline
            aria-label="Lucy generated video"
          />
          <div className="stage-placeholder">
            <span className="orb" />
            <p>Lucy&apos;s generated stream appears here</p>
          </div>
          <div className="status-chip" data-state={state}>
            <span />
            {messageForState(state)}
          </div>
          <video
            className="camera-preview"
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            aria-label="Your camera preview"
          />
        </div>

        <form className="control-panel" onSubmit={start}>
          <p className="panel-kicker">Session input</p>
          <label htmlFor="lucy-prompt">What should Lucy create?</label>
          <textarea
            id="lucy-prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={5}
          />
          {error && <p className="error-message">{error}</p>}
          <div className="button-row">
            {!isActive ? (
              <button className="primary-button" type="submit">
                Allow camera &amp; start
              </button>
            ) : (
              <>
                <button
                  className="primary-button"
                  type="button"
                  onClick={() => sessionRef.current?.send({ prompt })}
                >
                  Update prompt
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => void stop()}
                >
                  End
                </button>
              </>
            )}
          </div>
          <p className="fine-print">
            Camera access stays in your browser and is released when the session
            ends.
          </p>
        </form>
      </section>

      <section className="code-section">
        <div>
          <p className="eyebrow">What the customer writes</p>
          <h2>The protocol is absent on purpose.</h2>
          <p>
            This is the actual shape used by the page above. Lucy-specific
            signaling lives behind <code>lucyRealtime()</code>.
          </p>
        </div>
        <pre>
          <code>{CUSTOMER_CODE}</code>
        </pre>
      </section>
    </main>
  );
}
