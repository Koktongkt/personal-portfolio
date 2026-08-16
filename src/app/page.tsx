import Image from "next/image";
import { getGithubSnapshot } from "@/lib/github";

export const revalidate = 3600;

const agents = [
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
];

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill="none">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.52-1.34-1.29-1.69-1.29-1.69-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.72 1.27 3.39.97.1-.75.4-1.27.74-1.56-2.57-.29-5.27-1.28-5.27-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.16 1.18a10.96 10.96 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.71 5.38-5.29 5.67.42.36.79 1.06.79 2.14v3.17c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .7Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.11l11.97 15.64Z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
      <path d="M6.5 8.25H3.25V18.7H6.5V8.25ZM4.88 3.05A1.89 1.89 0 1 0 4.88 6.83 1.89 1.89 0 0 0 4.88 3.05ZM18.7 12.7c0-3.15-1.68-4.62-3.93-4.62-1.81 0-2.62 1-3.07 1.7V8.25H8.45V18.7h3.25v-5.17c0-1.36.26-2.68 1.95-2.68 1.67 0 1.69 1.56 1.69 2.77v5.08h3.25l.11-6Z" />
    </svg>
  );
}

function formatGithubDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

export default async function Home() {
  const github = await getGithubSnapshot();

  return (
    <main>
      <header className="site-header">
        <div className="brand-cluster">
          <a className="wordmark" href="#top" aria-label="KT home">KT<span>.</span></a>
          <span className="brand-divider" aria-hidden="true" />
          <div className="social-links" aria-label="Social profiles">
            <a href="https://github.com/Koktongkt" target="_blank" rel="noopener noreferrer" aria-label="GitHub profile"><GithubIcon /></a>
            <a href="https://x.com/KT2596612580139" target="_blank" rel="noopener noreferrer" aria-label="X profile"><XIcon /></a>
            <a href="https://www.linkedin.com/in/kok-tong-tan-01b219159/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile"><LinkedinIcon /></a>
          </div>
        </div>
        <nav aria-label="Main navigation">
          <a href="#work">Work</a>
          <a href="#hermes">Hermes</a>
          <a href="#about">About</a>
        </nav>
        <a className="header-cta" href="#contact">Let&apos;s talk <ArrowIcon /></a>
      </header>

      <section className="hero section-shell" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span className="status-dot" /> Building at the edge of reality, software and AI</p>
          <h1>I build systems that make ambitious ideas <em>real.</em></h1>
          <p className="hero-lede">Developer, builder, and AI experimenter working across applications, large language models, vision models, and agentic workflows.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#work">Explore my work <ArrowIcon /></a>
            <a className="button button-secondary" href="#hermes">Meet my hermes agents</a>
          </div>
        </div>

        <div className="terminal-wrap" aria-label="Hermes agent status preview">
          <div className="terminal-glow" />
          <div className="terminal">
            <div className="terminal-bar">
              <div className="window-dots"><i /><i /><i /></div>
              <span>KT / command-center</span>
              <span className="terminal-live">LIVE</span>
            </div>
            <div className="terminal-body">
              <p><span className="prompt">$</span> hermes agents status</p>
              <div className="agent-status-list">
                {agents.map((agent) => (
                  <div className="agent-status" key={agent.name}>
                    <span className="online-dot" />
                    <strong>{agent.name}</strong>
                    <span>{agent.role}</span>
                    <small>online</small>
                  </div>
                ))}
              </div>
              <div className="terminal-divider" />
              <p className="cursor-line"><span className="prompt">$</span> <i /></p>
            </div>
          </div>
          <p className="terminal-caption">A personal AI team designed around how I work.</p>
        </div>
      </section>

      <section className="manifesto section-shell" id="about">
        <p className="section-number">01 / ABOUT</p>
        <div className="manifesto-grid">
          <h2>Curious by default.<br />Practical by design.</h2>
          <div>
            <p>I enjoy turning fuzzy, ambitious ideas into systems people can actually use. My work moves between product engineering, AI research, and hands-on experimentation.</p>
            <p className="muted">This page is my discovery space as a problem-solver: a running log of what I’m building, what I’m learning, and the tools I’m shaping along the way.</p>
          </div>
        </div>
      </section>

      <section className="work section-shell" id="work">
        <div className="section-heading">
          <div><p className="section-number">02 / SELECTED WORK</p><h2>A few things worth<br />opening up.</h2></div>
          <p>Live view of what I&apos;m building and shipping on GitHub.</p>
        </div>

        <div className="github-pulse">
          <div className="github-pulse-header">
            <div className="github-identity">
              <span className="github-mark"><GithubIcon /></span>
              <div>
                <p>Live from GitHub</p>
                <a href={github.profileUrl} target="_blank" rel="noopener noreferrer">
                  @{github.username} <ArrowIcon />
                </a>
              </div>
            </div>
            <div className="github-stats" aria-label="GitHub profile statistics">
              <div><strong>{github.contributionTotal}</strong><span>contributions / year</span></div>
              <div><strong>{github.publicRepos}</strong><span>public repositories</span></div>
            </div>
          </div>

          <div className="contribution-panel">
            <div className="github-panel-label">
              <span>Contribution activity</span>
              <small>Past 12 months</small>
            </div>
            {github.contributions.length > 0 ? (
              <div className="contribution-scroll" role="img" aria-label={`${github.contributionTotal} GitHub contributions in the past year`}>
                <div className="contribution-grid">
                  {github.contributions.slice(-371).map((day) => (
                    <span
                      className={`contribution-cell level-${day.level}`}
                      key={day.date}
                      title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${formatGithubDate(day.date)}`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <p className="github-empty">Contribution data is temporarily unavailable. View the live graph on GitHub.</p>
            )}
            <div className="contribution-legend" aria-hidden="true">
              <span>Less</span><i className="level-0" /><i className="level-1" /><i className="level-2" /><i className="level-3" /><i className="level-4" /><span>More</span>
            </div>
          </div>

          <div className="github-content-grid">
            <div className="repo-panel">
              <div className="github-panel-label">
                <span>{github.repositoryLabel}</span>
                <a href={github.profileUrl} target="_blank" rel="noopener noreferrer">View all <ArrowIcon /></a>
              </div>
              <div className="repo-grid">
                {github.repositories.map((repo) => (
                  <a className="repo-card" href={github.profileUrl} target="_blank" rel="noopener noreferrer" aria-label={`View ${github.username} on GitHub`} key={repo.name}>
                    <div className="repo-card-top"><span className="repo-icon" aria-hidden="true" /><ArrowIcon /></div>
                    <h3>{repo.name}</h3>
                    <p>{repo.description || "An open-source project from my GitHub workspace."}</p>
                    <div className="repo-meta">
                      {repo.language && <span><i />{repo.language}</span>}
                      <span>☆ {repo.stargazers_count}</span>
                      <span>⑂ {repo.forks_count}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="activity-panel">
              <div className="github-panel-label"><span>Recent activity</span><small>Public events</small></div>
              {github.activities.length > 0 ? (
                <div className="activity-list">
                  {github.activities.map((activity) => (
                    <a href={github.profileUrl} target="_blank" rel="noopener noreferrer" aria-label={`View ${github.username} on GitHub`} key={activity.id}>
                      <span className="activity-dot" />
                      <span className="activity-copy">
                        <span>{activity.action}</span>
                        <strong>{activity.repo}</strong>
                        <small>{formatGithubDate(activity.date)}</small>
                      </span>
                      <ArrowIcon />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="github-empty">Recent public activity will appear here automatically.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="hermes-section" id="hermes">
        <div className="section-shell">
          <div className="hermes-intro">
            <div><p className="section-number light">03 / MY AI SYSTEM</p><h2>Not one assistant.<br />A small, focused team.</h2></div>
            <p>My Hermes setup separates orchestration, implementation, AI research, and financial analysis so each agent can stay close to the work it does best.</p>
          </div>
          <a
            className="nous-recommendation"
            href="https://nousresearch.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit Nous Research — opens in a new tab"
          >
            <Image
              src="/nous-research-art-v3.png"
              alt="Nous Research"
              width={110}
              height={112}
              unoptimized
            />
            <span className="nous-copy">
              <small>POWERING THE HERMES ECOSYSTEM</small>
              <strong>Explore open-source AI from Nous Research.</strong>
              <span>Models, research, and tools built to make advanced AI more open and useful.</span>
            </span>
            <span className="nous-link">Visit Nous Research <ArrowIcon /></span>
          </a>
          <div className="agent-topology">
            {agents.map((agent, index) => (
              <article className={`agent-card agent-${index}`} key={agent.name}>
                <div className="agent-card-top"><span>0{index + 1}</span><i /></div>
                <p className="agent-command">@{agent.name}</p>
                <h3>{agent.role}</h3>
                <p>{agent.description}</p>
                <div className="agent-tools">{agent.tools}</div>
              </article>
            ))}
            <svg className="connection-lines" viewBox="0 0 900 390" preserveAspectRatio="none" aria-hidden="true">
              <path d="M450 130V190M450 190H145V245M450 190V245M450 190H755V245" />
            </svg>
          </div>
          <div className="workflow-line">
            <span>Idea</span><i /><span>Decompose</span><i /><span>Research + build</span><i /><span>Review</span><i /><span>Working result</span>
          </div>
        </div>
      </section>

      <section className="now section-shell">
        <p className="section-number">04 / NOW</p>
        <div className="now-grid">
          <h2>Currently<br />in motion.</h2>
          <div className="now-list">
            <div><span>01</span><p>Building human-guided physical vision applications</p></div>
            <div><span>02</span><p>Exploring durable multi-agent workflows</p></div>
            <div><span>03</span><p>Improving how AI systems collaborate with people</p></div>
          </div>
        </div>
      </section>

      <section className="contact" id="contact">
        <div className="section-shell contact-inner">
          <p className="section-number light">05 / CONTACT</p>
          <h2>Have an interesting<br />problem?</h2>
          <p>I&apos;m always interested in thoughtful software, AI experiments, and ambitious technical ideas to solve real world problems.</p>
          <a className="contact-link" href="mailto:tan1995_@hotmail.com">Start a conversation <ArrowIcon /></a>
          <div className="contact-details">
            <a className="contact-phone" href="tel:+6581610164">
              <strong>+65 81610164</strong>
            </a>
            <div className="contact-socials" aria-label="Social profiles">
              <a href="https://github.com/Koktongkt" target="_blank" rel="noopener noreferrer" aria-label="GitHub profile"><GithubIcon /></a>
              <a href="https://x.com/KT2596612580139" target="_blank" rel="noopener noreferrer" aria-label="X profile"><XIcon /></a>
              <a href="https://www.linkedin.com/in/kok-tong-tan-01b219159/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile"><LinkedinIcon /></a>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer section-shell">
        <p>Designed and built by KT with hermes.</p>
      </footer>
    </main>
  );
}
