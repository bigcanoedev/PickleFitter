"use client";

import { motion } from "framer-motion";

export function PickleballLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      {/* Shadow on the ground */}
      <div className="relative h-24 w-16">
        <motion.img
          src="/logo.svg"
          alt=""
          className="w-12 h-12 absolute left-2"
          animate={{
            y: [0, -40, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: [0.33, 0, 0.67, 1], // custom bounce easing
            times: [0, 0.5, 1],
          }}
        />
        {/* Shadow that scales with bounce */}
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-black/10 rounded-full"
          animate={{
            width: [40, 24, 40],
            height: [8, 4, 8],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
      <motion.p
        className="text-sm text-muted-foreground font-medium"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {text}
      </motion.p>
    </div>
  );
}
