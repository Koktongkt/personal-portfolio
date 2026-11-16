"use client";

import { useEffect, useId, useRef, useState } from "react";
import { navLinks } from "@/data/site";
import { ArrowIcon } from "./icons";
import SocialLinks from "./social-links";

/** A section counts as current while it crosses a thin band just above mid-viewport. */
const SPY_MARGIN = "-42% 0px -52% 0px";

export default function SiteHeader() {
  const [current, setCurrent] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [atTop, setAtTop] = useState(false);
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ids = [...navLinks.map((link) => link.href.slice(1)), "contact", "top"];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const spy = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setCurrent(`#${entry.target.id}`);
        }
      },
      { rootMargin: SPY_MARGIN },
    );
    sections.forEach((section) => spy.observe(section));

    const onScroll = () => setAtTop(window.scrollY <= 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      spy.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || toggleRef.current?.contains(target)) return;
      setOpen(false);
    };
    const wide = window.matchMedia("(min-width: 861px)");
    const onWide = () => wide.matches && setOpen(false);

    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    wide.addEventListener("change", onWide);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  return (
    <header className={`site-header${atTop ? " is-top" : ""}${open ? " is-open" : ""}`}>
      <div className="nav-pill">
        <div className="brand-cluster">
          <a className="wordmark" href="#top" aria-label="KT home">KT<span>.</span></a>
          <span className="brand-divider" aria-hidden="true" />
          <SocialLinks className="social-links" />
        </div>

        <nav className="nav-desktop" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} aria-current={current === link.href ? "location" : undefined}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="nav-end">
          <a className="header-cta" href="#contact">Let&apos;s talk <ArrowIcon /></a>
          <button
            ref={toggleRef}
            className="nav-toggle"
            type="button"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span aria-hidden="true" /><span aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="nav-sheet" id={menuId} ref={menuRef} hidden={!open}>
        <nav aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-current={current === link.href ? "location" : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a href="#contact" onClick={() => setOpen(false)}>Contact</a>
        </nav>
        <SocialLinks className="nav-sheet-socials" />
      </div>
    </header>
  );
}
