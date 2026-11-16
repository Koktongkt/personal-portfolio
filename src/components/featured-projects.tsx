import { featuredProjects } from "@/data/featured-projects";
import { ArrowIcon, ArrowUpRightIcon, GithubIcon } from "./icons";
import ProjectPreview from "./project-preview";

/* 130px keeps a 3x phone on the 400w file. CSS still paints the image full width. */
const leadSizes = "(max-width: 640px) 130px, (max-width: 960px) 100vw, 720px";
const cardSizes = "(max-width: 640px) 130px, (max-width: 960px) 50vw, 600px";

export default function FeaturedProjects() {
  return (
    <div className="featured">
      <div className="featured-head">
        <h3>Featured projects</h3>
        <a href="https://github.com/Koktongkt" target="_blank" rel="noopener noreferrer" aria-label="More on GitHub (opens in a new tab)">
          More on GitHub <ArrowIcon />
        </a>
      </div>
      <ul className="featured-grid">
        {featuredProjects.map((project, index) => (
          <li key={project.slug} className={index === 0 ? "is-lead" : undefined} data-reveal="">
            <article className="project-card" data-cursor="view" data-spotlight="">
              <a className="project-shot" data-cursor="play" href={project.live} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden="true">
                <ProjectPreview slug={project.slug} alt={project.alt} imageSizes={index === 0 ? leadSizes : cardSizes} />
              </a>
              <div className="project-body">
                <h4>{project.title}</h4>
                <p>{project.outcome}</p>
                <ul className="project-tags" aria-label="Built with">
                  {project.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                <div className="project-actions">
                  <a className="project-btn project-btn-live" href={project.live} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.title} live (opens in a new tab)`}>
                    Open live <ArrowUpRightIcon />
                  </a>
                  <a className="project-btn project-btn-code" href={project.code} target="_blank" rel="noopener noreferrer" aria-label={`View ${project.title} source on GitHub (opens in a new tab)`}>
                    <GithubIcon /> Code
                  </a>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
