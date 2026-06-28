"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion, type HTMLMotionProps } from "framer-motion";

/*
 * Scroll reveal para listas (partidas, ranking): stagger leve por item via delay,
 * useInView once. DESIGN_SPEC secao 4. reduced-motion: visivel imediatamente.
 * Reveal sempre realca um default ja visivel; nunca esconde conteudo de forma
 * permanente (anima ao entrar na viewport uma vez).
 */
interface RevealProps extends HTMLMotionProps<"div"> {
  delay?: number;
}

export function Reveal({ children, delay = 0, ...props }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={reduce || inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
