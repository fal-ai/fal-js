"use client";

import {
  happyOysterRealtime,
  type HappyOysterEngine as FalHappyOysterEngine,
  type HappyOysterPhase,
  type HappyOysterRealtimeSession,
} from "@fal-ai/client/realtime";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { fal } from "../../lib/fal";

let engine: import("@happy-oyster/js-sdk").HappyOysterEngine | null = null;
let engineHost: string | null = null;

async function loadEngine({
  apiHost,
  token,
}: {
  apiHost: string;
  token: string;
}): Promise<FalHappyOysterEngine> {
  const sdk = await import("@happy-oyster/js-sdk");
  if (!engine || engineHost !== apiHost) {
    engine = new sdk.HappyOysterEngine({
      APIHost: apiHost,
      logLevel: "error",
    });
    engineHost = apiHost;
  }
  engine.updateToken(token);
  return engine as unknown as FalHappyOysterEngine;
}

const CUSTOMER_CODE = `const session = await fal.realtime.open(
  happyOysterRealtime({ loadEngine }),
  {
    world: {
      create: {
        mode: "adventure",
        prompt,
        perspective: "first_person",
      },
    },
    videoElement,
    onPhaseChange: setPhase,
  },
);

session.setCommand({ translation: "Front" });
session.setCommand(null); // release movement
await session.close();`;

const PHASE_LABELS: Record<HappyOysterPhase | "idle", string> = {
  idle: "Ready to compose",
  creating_world: "Submitting the world",
  building_world: "Building the persistent world",
  world_ready: "World ready",
  starting_session: "Starting a fal session",
  connecting_travel: "Connecting the travel stream",
  streaming: "Live inside the world",
  ended: "Travel ended",
};

export default function HappyOysterPage() {
  const [prompt, setPrompt] = useState(
    "An endless bioluminescent forest with floating stone paths and soft blue fog",
  );
  const [phase, setPhase] = useState<HappyOysterPhase | "idle">("idle");
  const [instruction, setInstruction] = useState("");
  const [worldName, setWorldName] = useState<string | null>(null);
  const [firstFrame, setFirstFrame] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSession, setHasSession] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sessionRef = useRef<HappyOysterRealtimeSession | null>(null);

  const extension = useMemo(
    () =>
      happyOysterRealtime({
        loadEngine,
      }),
    [],
  );

  const stop = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = null;
    const session = sessionRef.current;
    sessionRef.current = null;
    setHasSession(false);
    await session?.close();
    setPhase("idle");
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      void sessionRef.current?.close();
    };
  }, []);

  const start = async (event: FormEvent) => {
    event.preventDefault();
    if (!videoRef.current) return;
    setError(null);
    setWorldName(null);
    setFirstFrame(null);
    const abortController = new AbortController();
    abortRef.current = abortController;
    try {
      sessionRef.current = await fal.realtime.open(extension, {
        world: {
          create: {
            mode: "adventure",
            prompt,
            perspective: "first_person",
            resolution: "720p",
          },
        },
        videoElement: videoRef.current,
        abortSignal: abortController.signal,
        onPhaseChange: setPhase,
        onWorldStatus: (world) => setWorldName(world.name),
        onFirstFrame: setFirstFrame,
        onError: (reason) =>
          setError(reason instanceof Error ? reason.message : String(reason)),
      });
      setHasSession(true);
    } catch (reason) {
      if (!abortController.signal.aborted) {
        setError(reason instanceof Error ? reason.message : String(reason));
      }
      await stop();
    }
  };

  const move = (translation: string | null) => {
    sessionRef.current?.setCommand(translation ? { translation } : null);
  };

  const sendInstruction = async (event: FormEvent) => {
    event.preventDefault();
    const content = instruction.trim();
    if (!content || !sessionRef.current) return;
    await sessionRef.current.instruct(content);
    setInstruction("");
  };

  const isActive = phase !== "idle" && phase !== "ended";

  return (
    <main className="demo-page">
      <section className="demo-heading">
        <div>
          <p className="eyebrow">Happy Oyster · Custom RTC extension</p>
          <h1>Compose a world, then walk in.</h1>
        </div>
        <p>
          The app describes a world and renders a video. The extension handles
          build polling, tickets, heartbeats, token refresh, travel binding,
          movement cadence, and cleanup.
        </p>
      </section>

      <section className="demo-workspace">
        <div
          className="stage oyster-stage"
          style={
            firstFrame ? { backgroundImage: `url("${firstFrame}")` } : undefined
          }
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            aria-label="Happy Oyster world stream"
          />
          <div className="stage-placeholder">
            <span className="horizon" />
            <p>{worldName ?? "Your persistent world appears here"}</p>
          </div>
          <div className="status-chip" data-state={phase}>
            <span />
            {PHASE_LABELS[phase]}
          </div>
          {hasSession && (
            <div className="movement-pad" aria-label="World movement controls">
              <button
                type="button"
                onPointerDown={() => move("Front")}
                onPointerUp={() => move(null)}
                onPointerCancel={() => move(null)}
              >
                ↑
              </button>
              <div>
                <button
                  type="button"
                  onPointerDown={() => move("Left")}
                  onPointerUp={() => move(null)}
                  onPointerCancel={() => move(null)}
                >
                  ←
                </button>
                <button
                  type="button"
                  onPointerDown={() => move("Back")}
                  onPointerUp={() => move(null)}
                  onPointerCancel={() => move(null)}
                >
                  ↓
                </button>
                <button
                  type="button"
                  onPointerDown={() => move("Right")}
                  onPointerUp={() => move(null)}
                  onPointerCancel={() => move(null)}
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="control-panel">
          <form onSubmit={start}>
            <p className="panel-kicker">World input</p>
            <label htmlFor="oyster-prompt">What world should exist?</label>
            <textarea
              id="oyster-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              disabled={isActive}
              rows={5}
            />
            {error && <p className="error-message">{error}</p>}
            {!isActive ? (
              <button className="primary-button" type="submit">
                Compose &amp; enter
              </button>
            ) : (
              <button
                className="secondary-button"
                type="button"
                onClick={() => void stop()}
              >
                Leave world
              </button>
            )}
          </form>
          <form className="instruction-form" onSubmit={sendInstruction}>
            <label htmlFor="instruction">Direct the live world</label>
            <div>
              <input
                id="instruction"
                value={instruction}
                onChange={(event) => setInstruction(event.target.value)}
                placeholder="Make it begin to rain…"
                disabled={!hasSession}
              />
              <button
                type="submit"
                className="secondary-button"
                disabled={!hasSession}
              >
                Send
              </button>
            </div>
          </form>
          <p className="fine-print">
            World composition and live travel use your fal account and may incur
            model usage.
          </p>
        </div>
      </section>

      <section className="code-section">
        <div>
          <p className="eyebrow">What the customer writes</p>
          <h2>A different protocol, the same entry point.</h2>
          <p>
            Happy Oyster keeps its unique world and travel concepts. fal.js
            removes the infrastructure choreography, not the model&apos;s
            personality.
          </p>
        </div>
        <pre>
          <code>{CUSTOMER_CODE}</code>
        </pre>
      </section>
    </main>
  );
}
