"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type MotionPanelProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

export function MotionPanel({ children, className, delay = 0 }: MotionPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
