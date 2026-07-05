const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";

const NAV = [
  { label: "Home", href: "#home", active: true },
  { label: "Memory", href: "#memory" },
  { label: "Lenses", href: "#lenses" },
  { label: "Witness", href: "#witness" },
  { label: "Reach Us", href: "#memory" },
];

export function VideoBackground() {
  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      className="absolute inset-0 w-full h-full object-cover z-0"
      src={VIDEO_URL}
    />
  );
}

export function Navigation() {
  return (
    <nav className="relative z-10 flex flex-row justify-between items-center px-8 py-6 max-w-7xl mx-auto w-full">
      <a
        href="#home"
        className="text-3xl tracking-tight text-foreground"
        style={{ fontFamily: "'Instrument Serif', serif" }}
      >
        Dear Diary<sup className="text-xs">®</sup>
      </a>

      <div className="hidden md:flex items-center gap-8">
        {NAV.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`text-sm transition-colors ${
              item.active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
          </a>
        ))}
      </div>

      <a href="#memory">
        <button className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground hover:scale-[1.03] transition-transform">
          Begin Journey
        </button>
      </a>
    </nav>
  );
}

export function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen flex flex-col">
      <VideoBackground />

      <div className="relative z-10 flex flex-col flex-1">
        <Navigation />

        <div className="flex flex-col items-center text-center px-6 pt-32 pb-40 py-[90px] flex-1 justify-center">
          <h1
            className="animate-fade-rise text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-[-2.46px] max-w-7xl font-normal text-foreground"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Where <em className="not-italic text-muted-foreground">memories</em> rise{" "}
            <em className="not-italic text-muted-foreground">through the silence.</em>
          </h1>

          <p className="animate-fade-rise-delay text-muted-foreground text-base sm:text-lg max-w-2xl mt-8 leading-relaxed">
            Not a notes app — a living memory graph on your machine.{" "}
            <span className="text-foreground/90">Cognee</span> remembers every voice, connects every person,
            and lets you recall your entire life through four lenses. Amid the noise, we build silence you can query.
          </p>

          <a href="#memory" className="animate-fade-rise-delay-2 mt-12">
            <button className="liquid-glass rounded-full px-14 py-5 text-base text-foreground hover:scale-[1.03] transition-transform cursor-pointer">
              Begin Journey
            </button>
          </a>

          <p className="animate-fade-rise-delay-2 mt-16 text-xs text-muted-foreground tracking-[0.2em] uppercase">
            remember · recall · improve · forget
          </p>
        </div>
      </div>
    </section>
  );
}
