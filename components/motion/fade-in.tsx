"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

/*
 * Entrada de tela: fade + translate suave (opacity 0->1, y 24->0), ease-out ~0.5s.
 * DESIGN_SPEC secao 4. reduced-motion: renderiza visivel, sem animacao.
 * O conteudo nunca fica escondido atras da transicao (anima no mount).
 */
interface FadeInProps extends HTMLMotionProps<"div"> {
  delay?: number;
}

export function FadeIn({ children, delay = 0, ...props }: FadeInProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
