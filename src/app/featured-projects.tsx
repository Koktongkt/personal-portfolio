import { featuredProjects } from "@/data/featured-projects";
import { ArrowIcon, GithubIcon } from "./icons";
import ProjectPreview from "./project-preview";

/* 130px keeps a 3x phone on the 400w file. CSS still paints the image full width. */
const imageSizes = "(max-width: 640px) 130px, (max-width: 900px) 50vw, 380px";

export default function FeaturedProjects() {
  return (
    <div className="featured">
      <div className="featured-head">
        <span>Featured projects</span>
        <a href="https://github.com/Koktongkt" target="_blank" rel="noopener noreferrer">
          More on GitHub <ArrowIcon />
        </a>
      </div>
      <ul className="featured-grid">
        {featuredProjects.map((project) => (
          <li key={project.slug}>
            <article className="project-card">
              <a className="project-shot" href={project.live} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden="true">
                <ProjectPreview slug={project.slug} alt={project.alt} imageSizes={imageSizes} webm800={project.webm800} />
              </a>
              <div className="project-body">
                <h3>{project.title}</h3>
                <p>{project.outcome}</p>
                <ul className="project-tags" aria-label="Built with">
                  {project.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                <div className="project-actions">
                  <a className="project-btn project-btn-live" href={project.live} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.title} live (opens in a new tab)`}>
                    Live <ArrowIcon />
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
