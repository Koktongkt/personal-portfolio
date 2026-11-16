import { socials } from "@/data/site";
import { SocialIcon } from "./icons";

export default function SocialLinks({ className }: { className: string }) {
  return (
    <ul className={`social-list ${className}`} aria-label="Social profiles">
      {socials.map((social) => (
        <li key={social.id}>
          <a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={`${social.label} profile (opens in a new tab)`}>
            <SocialIcon id={social.id} />
          </a>
        </li>
      ))}
    </ul>
  );
}
