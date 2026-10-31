/* eslint-disable @next/next/no-img-element -- static pre-sized WebP srcset, no optimizer round-trip */
import { featuredProjects } from "@/data/featured-projects";
import { ArrowIcon, GithubIcon } from "./icons";

const imageSizes = "(max-width: 640px) calc(100vw - 30px), (max-width: 900px) 50vw, 380px";

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
                <img
                  src={`/projects/${project.slug}.webp`}
                  srcSet={`/projects/${project.slug}-400.webp 400w, /projects/${project.slug}.webp 800w`}
                  sizes={imageSizes}
                  width={800}
                  height={500}
                  loading="lazy"
                  decoding="async"
                  alt={project.alt}
                />
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
