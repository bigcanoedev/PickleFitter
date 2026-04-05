"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Target,
  FlaskConical,
  Weight,
  Database,
  Layers,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

function CountUp({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = target;
    const duration = 1200;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count}</span>;
}

export function LandingHero() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-2 sm:px-4 overflow-hidden">
      <motion.div
        className="max-w-2xl space-y-8"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Bouncing pickleball */}
        <motion.div
          variants={fadeUp}
          className="flex justify-center pt-6"
        >
          <motion.img
            src="/logo.svg"
            alt="PickleFitter"
            className="w-16 h-16"
            animate={{
              y: [0, -12, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* Badge */}
        <motion.div
          variants={fadeUp}
          className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 rounded-full"
        >
          <Database className="w-3.5 h-3.5" />
          727 paddles &middot; Lab-tested data &middot; 10,000+ players matched
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1]"
        >
          Find the paddle
          <br />
          <span className="text-primary">that fits you.</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed"
        >
          Most players are using the wrong paddle. Real swing weight, twist weight,
          power, and spin data from lab testing — matched to your play style in 2 minutes.
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-center gap-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Button asChild size="lg" className="w-full sm:w-auto text-base px-8 py-6 font-bold gap-2">
              <Link href="/quiz">
                Find My Match
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-6 gap-2">
              <Link href="/database">
                <Database className="w-4 h-4" />
                Browse All Paddles
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-3 gap-3 sm:gap-6 pt-6 max-w-md mx-auto"
        >
          {[
            { icon: Database, value: 727, label: "Paddles" },
            { icon: Layers, value: 12, label: "Match Dimensions" },
            { icon: FlaskConical, value: 326, label: "Lab-Tested" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              className="flex flex-col items-center"
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <stat.icon className="w-5 h-5 text-primary mb-1" />
              <div className="text-2xl font-black text-foreground">
                <CountUp target={stat.value} />
              </div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Feature cards */}
        <motion.div
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-sm text-left"
        >
          {[
            {
              icon: Target,
              title: "Swing-Matched",
              desc: "Paddles matched to your swing speed, skill level, and play style.",
            },
            {
              icon: FlaskConical,
              title: "Lab-Tested Power",
              desc: "Real MPH and RPM data from independent lab testing, not manufacturer claims.",
            },
            {
              icon: Weight,
              title: "Lead Tape Optimizer",
              desc: "Exact tungsten placement calibrated to RDC measurements.",
            },
          ].map((card) => (
            <motion.div
              key={card.title}
              variants={fadeUp}
              whileHover={{ y: -4, boxShadow: "0 8px 25px -5px rgba(0,0,0,0.1)" }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-card border rounded-xl p-5 cursor-default"
            >
              <card.icon className="w-5 h-5 text-primary mb-2" />
              <div className="font-bold mb-1 text-foreground">{card.title}</div>
              <p className="text-muted-foreground">{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
