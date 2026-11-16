import { focusAreas, toolkit } from "@/data/site";
import { ArrowIcon } from "./icons";

export default function FocusAreas() {
  return (
    <div className="focus">
      <ul className="focus-grid">
        {focusAreas.map((area) => (
          <li key={area.title} className="focus-card" data-spotlight="" data-reveal="">
            <h3>{area.title}</h3>
            <p>{area.note}</p>
            <ul className="focus-proof" aria-label={`Where ${area.title.toLowerCase()} shows up on this page`}>
              {area.proof.map((item) => (
                <li key={item.label}>
                  <a href={item.href}>{item.label} <ArrowIcon /></a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <div className="toolkit" data-reveal="">
        <p id="toolkit-label">Used in the featured projects</p>
        <ul aria-labelledby="toolkit-label">
          {toolkit.map((tool) => (
            <li key={tool}>{tool}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
