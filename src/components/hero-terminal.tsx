import type { CSSProperties } from "react";
import { agents } from "@/data/site";

const COMMAND = "hermes agents status";

/**
 * The page's one staged moment: the command types itself, then each agent
 * reports in. It is all CSS, so it also renders complete without scripting
 * and skips straight to the end state under reduced motion.
 */
export default function HeroTerminal() {
  return (
    <div className="terminal-wrap">
      <div className="terminal-glow" aria-hidden="true" />
      <div className="terminal" role="img" aria-label={`Terminal preview: ${COMMAND}. ${agents.length} Hermes agents online: ${agents.map((agent) => `${agent.name}, ${agent.role}`).join("; ")}.`}>
        <div className="terminal-bar" aria-hidden="true">
          <div className="window-dots"><i /><i /><i /></div>
          <span>KT / command-center</span>
          <span className="terminal-live"><i />Live</span>
        </div>
        <div className="terminal-body" aria-hidden="true">
          <p className="terminal-line">
            <span className="prompt">$</span>
            <span className="typed" style={{ "--chars": COMMAND.length } as CSSProperties}>{COMMAND}</span>
          </p>
          <div className="agent-status-list">
            {agents.map((agent, index) => (
              <div className="agent-status" key={agent.name} style={{ "--row": index } as CSSProperties}>
                <span className="online-dot" />
                <strong>{agent.name}</strong>
                <span>{agent.role}</span>
                <small>online</small>
              </div>
            ))}
          </div>
          <p className="terminal-summary">
            <span>{agents.length}/{agents.length} agents online</span>
          </p>
          <p className="cursor-line"><span className="prompt">$</span><i /></p>
        </div>
      </div>
      <p className="terminal-caption">A personal AI team designed around how I work.</p>
    </div>
  );
}
