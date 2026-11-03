"use client";

import { useEffect, useRef, type MouseEvent } from "react";

export default function FaqItem({ question, answer }: { question: string; answer: string }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);
  const answerRef = useRef<HTMLParagraphElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const targetRef = useRef<boolean | null>(null);

  function finish() {
    const details = detailsRef.current;
    animationRef.current?.cancel();
    animationRef.current = null;
    if (details) {
      if (targetRef.current !== null) details.open = targetRef.current;
      details.style.removeProperty("height");
      details.style.removeProperty("overflow");
      delete details.dataset.expanded;
    }
    targetRef.current = null;
  }

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stopOnPreference = () => { if (motion.matches) finish(); };
    window.addEventListener("resize", finish);
    motion.addEventListener("change", stopOnPreference);
    return () => {
      animationRef.current?.cancel();
      window.removeEventListener("resize", finish);
      motion.removeEventListener("change", stopOnPreference);
    };
  }, []);

  function toggle(event: MouseEvent<HTMLElement>) {
    const details = detailsRef.current;
    const summary = summaryRef.current;
    const answer = answerRef.current;
    if (!details || !summary || !answer) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !details.animate) return;
    event.preventDefault();
    const height = details.getBoundingClientRect().height;
    const open = !(targetRef.current ?? details.open);
    animationRef.current?.cancel();
    targetRef.current = open;
    details.dataset.expanded = String(open);
    details.style.height = `${height}px`;
    details.style.overflow = "hidden";
    // Keep native content visible while either direction is animating.
    details.open = true;
    const border = parseFloat(getComputedStyle(details).borderTopWidth) || 0;
    const end = summary.getBoundingClientRect().height + border + (open ? answer.getBoundingClientRect().height : 0);
    const animation = details.animate(
      { height: [`${height}px`, `${end}px`] },
      { duration: 280, easing: "cubic-bezier(.2,.7,.2,1)" },
    );
    animationRef.current = animation;
    animation.onfinish = () => { if (animationRef.current === animation) finish(); };
  }

  return <details ref={detailsRef}>
    <summary ref={summaryRef} onClick={toggle}>{question}<span className="plus" aria-hidden="true">+</span></summary>
    <p ref={answerRef}>{answer}</p>
  </details>;
}
