"use client";

import { useEffect } from "react";

/** Progressive enhancement: content remains visible without JavaScript. */
export default function HomeMotion() {
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!("IntersectionObserver" in window)) return;
    const animations = new Map<Element, Animation>();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (preference.matches || entry.target.contains(document.activeElement)) continue;
        const element = entry.target as HTMLElement;
        const siblings = Array.from(element.parentElement?.children ?? []);
        const staggered = element.matches(".benefit, .example-card, .steps article");
        const animation = element.animate(
          [{ opacity: 0, translate: "0 18px" }, { opacity: 1, translate: "0 0" }],
          { duration: 520, delay: staggered ? Math.min(siblings.indexOf(element), 3) * 65 : 0, easing: "cubic-bezier(.2,.7,.2,1)", fill: "backwards" },
        );
        animations.set(element, animation);
        animation.onfinish = () => animations.delete(element);
      }
    }, { threshold: 0.08 });

    document.querySelectorAll(".benefit, .how .section-heading, .steps article, .work-examples .section-heading, .examples-intro, .example-card, .faq .section-heading, .faq details, .footer").forEach(element => observer.observe(element));

    const cancelMotion = () => {
      if (preference.matches) {
        animations.forEach(animation => animation.cancel());
        animations.clear();
      }
    };
    const revealFocused = (event: FocusEvent) => {
      animations.forEach((animation, element) => {
        if (event.target instanceof Node && element.contains(event.target)) {
          animation.cancel();
          animations.delete(element);
        }
      });
    };
    preference.addEventListener("change", cancelMotion);
    document.addEventListener("focusin", revealFocused);
    return () => {
      observer.disconnect();
      animations.forEach(animation => animation.cancel());
      preference.removeEventListener("change", cancelMotion);
      document.removeEventListener("focusin", revealFocused);
    };
  }, []);
  return null;
}
