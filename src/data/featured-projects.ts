export type FeaturedProject = {
  title: string;
  slug: string;
  outcome: string;
  live: string;
  code: string;
  tags: string[];
  alt: string;
};

export const featuredProjects: FeaturedProject[] = [
  {
    title: "Tiny Planet",
    slug: "tiny-planet",
    outcome: "A cozy Ghibli-style planet to explore: fishing, a steam train, seasons, a museum and procedural music, tuned to run smoothly in the browser.",
    live: "https://koktongkt.github.io/tiny-planet/",
    code: "https://github.com/Koktongkt/tiny-planet",
    tags: ["Three.js", "React Three Fiber", "Web Audio"],
    alt: "Tiny Planet: a small green planet with a river, train track, cottages and windmills",
  },
  {
    title: "Market Town",
    slug: "market-town",
    outcome: "A scroll-driven 3D toy town that turns each day's US market snapshot (indices, sectors, rates and jobs) into a floating island.",
    live: "https://koktongkt.github.io/market-town/",
    code: "https://github.com/Koktongkt/market-town",
    tags: ["React Three Fiber", "GSAP", "Data viz"],
    alt: "Market Town: a toy-town diorama with index towers, sector districts and rate signs",
  },
  {
    title: "Tradey Desk",
    slug: "tradey-desk",
    outcome: "A public audit dashboard for an AI paper-trading desk: each decision, the reviewers' verdicts, and results against the S&P 500.",
    live: "https://tradey-desk-psi.vercel.app",
    code: "https://github.com/Koktongkt/tradey-desk",
    tags: ["Python", "Multi-agent", "Vercel"],
    alt: "Tradey Desk dashboard showing desk status, paper balance and position watchdog",
  },
];
