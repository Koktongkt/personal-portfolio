"use client";

import { useEffect, useId, useRef, useState } from "react";
import soulDocuments from "@/data/agent-souls.json";

type Agent = {
  name: keyof typeof soulDocuments;
  role: string;
  description: string;
  tools: string;
};

type AgentSoulTeamProps = {
  agents: readonly Agent[];
};

function InlineMarkdown({ text }: { text: string }) {
  return text.split(/(\*\*.*?\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>
    ) : (
      part
    ),
  );
}

function SoulDocument({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const HeadingTag = level === 1 ? "h2" : level === 2 ? "h3" : "h4";
      blocks.push(<HeadingTag key={`heading-${index}`}><InlineMarkdown text={heading[2]} /></HeadingTag>);
      index += 1;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ""));
        index += 1;
      }
      blocks.push(
        <ul key={`list-${index}`}>
          {items.map((item, itemIndex) => <li key={`${item}-${itemIndex}`}><InlineMarkdown text={item} /></li>)}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      blocks.push(
        <ol key={`ordered-${index}`}>
          {items.map((item, itemIndex) => <li key={`${item}-${itemIndex}`}><InlineMarkdown text={item} /></li>)}
        </ol>,
      );
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,3})\s+/.test(lines[index].trim()) &&
      !/^[-*]\s+/.test(lines[index].trim()) &&
      !/^\d+\.\s+/.test(lines[index].trim())
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(<p key={`paragraph-${index}`}><InlineMarkdown text={paragraph.join(" ")} /></p>);
  }

  return <div className="soul-document">{blocks}</div>;
}

export default function AgentSoulTeam({ agents }: AgentSoulTeamProps) {
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!activeAgent) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveAgent(null);
      if (event.key === "Tab") {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      returnFocusRef.current?.focus();
    };
  }, [activeAgent]);

  const openSoul = (agent: Agent) => {
    returnFocusRef.current = document.activeElement as HTMLElement;
    setActiveAgent(agent);
  };

  return (
    <>
      <div className="agent-topology">
        {agents.map((agent, index) => (
          <article className={`agent-card agent-${index}`} key={agent.name}>
            <div className="agent-card-top"><span>0{index + 1}</span><i /></div>
            <p className="agent-command">@{agent.name}</p>
            <h3>{agent.role}</h3>
            <p>{agent.description}</p>
            <div className="agent-card-footer">
              <span className="agent-tools">{agent.tools}</span>
              <button className="soul-link" type="button" onClick={() => openSoul(agent)}>
                SOUL.md
              </button>
            </div>
          </article>
        ))}
        <svg className="connection-lines" viewBox="0 0 900 390" preserveAspectRatio="none" aria-hidden="true">
          <path d="M450 130V190M450 190H145V245M450 190V245M450 190H755V245" />
        </svg>
      </div>

      {activeAgent && (
        <div
          className="soul-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveAgent(null);
          }}
        >
          <section
            className="soul-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <header className="soul-modal-header">
              <div>
                <span>@{activeAgent.name}</span>
                <h2 id={titleId}>SOUL.md</h2>
              </div>
              <button
                ref={closeButtonRef}
                className="soul-modal-close"
                type="button"
                aria-label={`Close ${activeAgent.name} SOUL.md`}
                onClick={() => setActiveAgent(null)}
              >
                <span aria-hidden="true">×</span>
              </button>
            </header>
            <div className="soul-modal-scroll">
              <SoulDocument content={soulDocuments[activeAgent.name]} />
            </div>
          </section>
        </div>
      )}
    </>
  );
}
