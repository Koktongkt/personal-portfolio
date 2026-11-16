import Image from "next/image";
import AgentSoulTeam from "@/components/agent-soul-team";
import CopyEmail from "@/components/copy-email";
import FeaturedProjects from "@/components/featured-projects";
import FocusAreas from "@/components/focus-areas";
import GithubPulse from "@/components/github-pulse";
import HeroTerminal from "@/components/hero-terminal";
import { ArrowIcon, ArrowUpRightIcon } from "@/components/icons";
import Orb from "@/components/orb";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import SocialLinks from "@/components/social-links";
import Threads from "@/components/threads";
import { agents, nowItems, site, workflowSteps } from "@/data/site";
import { getGithubSnapshot } from "@/lib/github";

export const revalidate = 3600;

export default async function Home() {
  const github = await getGithubSnapshot();

  return (
    <>
      <a className="skip-link" href="#content">Skip to content</a>
      <SiteHeader />

      <main id="content">
        <section className="hero" id="top">
          <Threads
            className="threads-backdrop"
            color={[1, 1, 1]}
            amplitude={1.5}
            distance={0.3}
            enableMouseInteraction
            aria-hidden="true"
          />
          <div className="hero-inner section-shell">
            <div className="hero-copy">
              <p className="eyebrow"><span className="status-dot" /> Building at the edge of reality, software and AI</p>
              <h1 data-cursor="text">I build systems that make ambitious ideas <em>real.</em></h1>
              <p className="hero-lede" data-cursor="text">Developer, builder, and AI experimenter working across applications, large language models, vision models, and agentic workflows.</p>
              <div className="hero-actions">
                <a className="button button-primary" href="#work">Explore my work <ArrowIcon /></a>
                <a className="button button-secondary" href="#hermes">Meet my hermes agents</a>
              </div>
            </div>
            <HeroTerminal />
          </div>
        </section>

        <section className="manifesto" id="about">
          <div className="about-orb" aria-hidden="true">
            <Orb hue={50} hoverIntensity={0.5} rotateOnHover forceHoverState={false} backgroundColor="#0a0a0b" />
          </div>
          <div className="section-shell">
            <p className="section-number"><span>01</span>About</p>
            <div className="manifesto-grid">
              <h2 data-reveal="">Curious by default.<br />Practical by design.</h2>
              <div className="manifesto-copy" data-reveal="">
                <p>I enjoy turning fuzzy, ambitious ideas into systems people can actually use. My work moves between product engineering, AI research, and hands-on experimentation.</p>
                <p className="muted">This page is my discovery space as a problem-solver: a running log of what I’m building, what I’m learning, and the tools I’m shaping along the way.</p>
              </div>
            </div>
            <FocusAreas />
          </div>
        </section>

        <section className="work" id="work">
          <div className="section-shell">
            <div className="section-heading" data-reveal="">
              <div>
                <p className="section-number"><span>02</span>Selected work</p>
                <h2>A few things worth<br />opening up.</h2>
              </div>
              <p>Things you can open and try right now, plus a live view of what I&apos;m shipping on GitHub.</p>
            </div>
            <FeaturedProjects />
            <GithubPulse github={github} />
          </div>
        </section>

        <section className="hermes-section" id="hermes">
          <div className="section-shell">
            <div className="hermes-intro" data-reveal="">
              <div>
                <p className="section-number light"><span>03</span>My AI system</p>
                <h2>Not one assistant.<br />A small, focused team.</h2>
              </div>
              <p>My Hermes setup separates orchestration, implementation, AI research, and financial analysis so each agent can stay close to the work it does best.</p>
            </div>
            <AgentSoulTeam agents={agents} />
            <ol className="workflow-line" data-reveal="" aria-label="How a request moves through the team">
              {workflowSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <a
              className="nous-recommendation"
              data-reveal=""
              href="https://nousresearch.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Nous Research (opens in a new tab)"
            >
              <Image src="/nous-research-art.webp" alt="" width={110} height={112} sizes="(max-width: 640px) 72px, 88px" />
              <span className="nous-copy">
                <small>Powering the Hermes ecosystem</small>
                <strong>Explore open-source AI from Nous Research.</strong>
                <span>Models, research, and tools built to make advanced AI more open and useful.</span>
              </span>
              <span className="nous-link">Visit Nous Research <ArrowUpRightIcon /></span>
            </a>
          </div>
        </section>

        <section className="now" id="now">
          <div className="section-shell">
            <p className="section-number"><span>04</span>Now</p>
            <div className="now-grid">
              <h2 data-reveal="">Currently<br />in motion.</h2>
              <ol className="now-list">
                {nowItems.map((item, index) => (
                  <li key={item} data-reveal="">
                    <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    <p>{item}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="contact" id="contact">
          <div className="section-shell">
            <div className="contact-panel">
              <p className="section-number light"><span>05</span>Contact</p>
              <h2 data-reveal="">Have an interesting<br />problem?</h2>
              <p className="contact-lede" data-reveal="">I&apos;m always interested in thoughtful software, AI experiments, and ambitious technical ideas to solve real world problems.</p>
              <div className="contact-actions" data-reveal="">
                <a className="contact-link" href={`mailto:${site.email}`}>Start a conversation <ArrowIcon /></a>
                <CopyEmail email={site.email} />
              </div>
              <div className="contact-details" data-reveal="">
                <a className="contact-phone" href={site.phone.href}>
                  <span>Phone</span>
                  <strong>{site.phone.label}</strong>
                </a>
                <SocialLinks className="contact-socials" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
