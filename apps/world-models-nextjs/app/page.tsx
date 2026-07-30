import Link from "next/link";

const OPEN_CODE = `const session = await fal.realtime.open(extension, {
  // the model's meaningful inputs
});

// Every extension can expose its own controls.
// Every session always has the same safe teardown.
await session.close();`;

export default function Home() {
  return (
    <main>
      <section className="hero">
        <p className="eyebrow">A customer-sized Next.js example</p>
        <h1>
          Two world models.
          <br />
          One way to open them.
        </h1>
        <p className="hero-copy">
          Lucy speaks WebRTC signaling. Happy Oyster builds persistent worlds,
          mints travel credentials, and uses its own SDK. The application sees
          one fal.js session lifecycle and only the controls that matter to its
          users.
        </p>
      </section>

      <section className="model-grid" aria-label="World model demos">
        <Link className="model-card lucy-card" href="/lucy">
          <div>
            <span className="number">01</span>
            <span className="pill">Camera → world</span>
          </div>
          <h2>Lucy 2.5</h2>
          <p>
            Allow the camera, describe a transformation, and receive the live
            generated world over WebRTC.
          </p>
          <span className="card-link">Open Lucy demo →</span>
        </Link>

        <Link className="model-card oyster-card" href="/happy-oyster">
          <div>
            <span className="number">02</span>
            <span className="pill">Persistent world</span>
          </div>
          <h2>Happy Oyster</h2>
          <p>
            Compose a world, wait for it to build, enter a live travel, and move
            through it without managing provider infrastructure.
          </p>
          <span className="card-link">Open Oyster demo →</span>
        </Link>
      </section>

      <section className="contract-section">
        <div>
          <p className="eyebrow">The whole idea</p>
          <h2>fal owns the lifecycle. Extensions own the protocol.</h2>
          <p>
            Customers can install fal-provided extensions, ship their own, or
            mix both. A custom world model does not have to pretend it works
            like Lucy or Happy Oyster.
          </p>
        </div>
        <pre>
          <code>{OPEN_CODE}</code>
        </pre>
      </section>
    </main>
  );
}
