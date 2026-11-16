import { featuredProjects } from "./featured-projects";

export const site = {
  url: "https://portfolio-lilac-beta-40.vercel.app",
  title: "Tan — Developer & AI Builder",
  description: "Personal portfolio exploring software, physical vision, and multi-agent AI systems.",
  email: "tan1995_@hotmail.com",
  phone: { href: "tel:+6581610164", label: "+65 81610164" },
} as const;

export const socials = [
  { id: "github", label: "GitHub", href: "https://github.com/Koktongkt" },
  { id: "x", label: "X", href: "https://x.com/KT2596612580139" },
  { id: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/kok-tong-tan-01b219159/" },
] as const;

export type SocialId = (typeof socials)[number]["id"];

export const navLinks = [
  { href: "#about", label: "About" },
  { href: "#work", label: "Work" },
  { href: "#hermes", label: "Hermes" },
  { href: "#now", label: "Now" },
] as const;

export const agents = [
  {
    name: "default",
    role: "Orchestrator",
    description: "Decomposes objectives and coordinates the system.",
    tools: "plan · route · review",
  },
  {
    name: "cody",
    role: "Software engineer",
    description: "Implements, tests, and ships full-stack work.",
    tools: "code · test · ship",
  },
  {
    name: "aivory",
    role: "AI researcher",
    description: "Investigates models, vision systems, and approaches.",
    tools: "search · compare · synthesize",
  },
  {
    name: "alpha_sage",
    role: "Financial, quant & macro analyst",
    description: "Evaluates opportunities through evidence, scenarios, and disciplined risk analysis.",
    tools: "fundamentals · macro · risk",
  },
] as const;

/**
 * The four areas come from the hero introduction. Each one points at something
 * already on this page, so the section never claims more than the site shows.
 */
export const focusAreas = [
  {
    title: "Applications",
    note: "Things you can open and try right now.",
    proof: [
      { label: "Tiny Planet", href: "#work" },
      { label: "Market Town", href: "#work" },
    ],
  },
  {
    title: "Large language models",
    note: "A personal AI team designed around how I work.",
    proof: [{ label: "Hermes agents", href: "#hermes" }],
  },
  {
    title: "Vision models",
    note: "Investigating models, vision systems, and approaches.",
    proof: [{ label: "@aivory", href: "#hermes" }],
  },
  {
    title: "Agentic workflows",
    note: "Exploring durable multi-agent workflows.",
    proof: [
      { label: "Tradey Desk", href: "#work" },
      { label: "Hermes", href: "#hermes" },
    ],
  },
] as const;

/** Every tag on a featured project, once, in first-seen order. */
export const toolkit = Array.from(new Set(featuredProjects.flatMap((project) => project.tags)));

export const nowItems = [
  "Building agentic portfolio management",
  "Exploring durable multi-agent workflows",
  "Improving how AI systems collaborate with people",
] as const;

export const workflowSteps = ["Idea", "Decompose", "Research + build", "Review", "Working result"] as const;
