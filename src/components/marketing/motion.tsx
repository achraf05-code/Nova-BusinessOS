"use client";
/**
 * Shared motion primitives for the marketing site.
 *
 * - `Reveal` slides children up + fades them in once they enter the viewport
 * - `Stagger` orchestrates a list of children with sequential delays
 * - `prefersReducedMotion` is honored everywhere — no jank for users who opt out
 */
import {
  motion,
  type HTMLMotionProps,
  type Variants,
  useReducedMotion,
} from "framer-motion";
import React from "react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

interface RevealProps extends Omit<HTMLMotionProps<"div">, "variants"> {
  delay?: number;
}

export function Reveal({
  delay = 0,
  className,
  children,
  ...rest
}: RevealProps) {
  const reduce = useReducedMotion();
  const variants = reduce ? fadeIn : fadeUp;
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export const FadeUpItem = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.div variants={fadeUp} className={className}>
    {children}
  </motion.div>
);

export { motion };
