import { navLinks } from "@/data/site";
import SocialLinks from "./social-links";

export default function SiteFooter() {
  return (
    <footer className="footer section-shell">
      <div className="footer-top">
        <a className="wordmark" href="#top" aria-label="KT, back to top">KT<span>.</span></a>
        <nav aria-label="Footer navigation">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href}>{link.label}</a>
          ))}
          <a href="#contact">Contact</a>
        </nav>
        <SocialLinks className="footer-socials" />
      </div>
      <div className="footer-bottom">
        <p>Designed and built by KT with hermes.</p>
        <a className="to-top" href="#top">Back to top <span aria-hidden="true">↑</span></a>
      </div>
    </footer>
  );
}
