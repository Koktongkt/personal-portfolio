import type { GithubSnapshot } from "@/lib/github";
import { ArrowIcon, ArrowUpRightIcon, GithubIcon } from "./icons";

const WEEKS_SHOWN = 53;

function formatDate(date: string, withDay = true) {
  return new Intl.DateTimeFormat("en", {
    day: withDay ? "numeric" : undefined,
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

const numberFormat = new Intl.NumberFormat("en");

/* The GitHub fallbacks are zero, so zero means "no data", not a real count. */
function stat(value: number) {
  return value > 0 ? numberFormat.format(value) : <span aria-label="Unavailable">–</span>;
}

export default function GithubPulse({ github }: { github: GithubSnapshot }) {
  const days = github.contributions.slice(-WEEKS_SHOWN * 7);
  const first = days[0];
  const last = days[days.length - 1];

  return (
    <div className="github-pulse" data-reveal="">
      <div className="github-pulse-header">
        <div className="github-identity">
          <span className="github-mark"><GithubIcon /></span>
          <div>
            <p>Live from GitHub</p>
            <strong>@{github.username}</strong>
          </div>
        </div>
        <a className="github-profile-link" href={github.profileUrl} target="_blank" rel="noopener noreferrer" aria-label="View GitHub profile (opens in a new tab)">
          View profile <ArrowUpRightIcon />
        </a>
      </div>

      <div className="github-body">
        <div className="contribution-panel">
          <div className="github-panel-label">
            <h3>Contribution activity</h3>
            <small>Past 12 months</small>
          </div>
          {days.length > 0 ? (
            <>
              <div
                className="contribution-scroll"
                role="img"
                aria-label={`${numberFormat.format(github.contributionTotal)} GitHub contributions in the past year`}
              >
                <div className="contribution-grid">
                  {days.map((day) => (
                    <span
                      className={`contribution-cell level-${day.level}`}
                      key={day.date}
                      title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${formatDate(day.date)}`}
                    />
                  ))}
                </div>
              </div>
              <div className="contribution-foot" aria-hidden="true">
                <span>{formatDate(first.date, false)} – {formatDate(last.date, false)}</span>
                <span className="contribution-legend">
                  Less<i className="level-0" /><i className="level-1" /><i className="level-2" /><i className="level-3" /><i className="level-4" />More
                </span>
              </div>
            </>
          ) : (
            <p className="github-empty">
              Contribution data is temporarily unavailable.{" "}
              <a href={github.profileUrl} target="_blank" rel="noopener noreferrer">View the live graph on GitHub</a>.
            </p>
          )}
          <dl className="github-stats">
            <div><dt>Contributions this year</dt><dd>{stat(github.contributionTotal)}</dd></div>
            <div><dt>Public repositories</dt><dd>{stat(github.publicRepos)}</dd></div>
          </dl>
        </div>

        <div className="activity-panel">
          <div className="github-panel-label">
            <h3>Recent activity</h3>
            <small>Public events</small>
          </div>
          {github.activities.length > 0 ? (
            <ul className="activity-list">
              {github.activities.map((activity) => (
                <li key={activity.id}>
                  <a href={activity.url} target="_blank" rel="noopener noreferrer">
                    <span className="activity-dot" aria-hidden="true" />
                    <span className="activity-copy">
                      <span>{activity.action}</span>
                      <strong>{activity.repo}</strong>
                    </span>
                    <time dateTime={activity.date}>{formatDate(activity.date)}</time>
                    <ArrowIcon />
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="github-empty">Recent public activity will appear here automatically.</p>
          )}
        </div>
      </div>
    </div>
  );
}
