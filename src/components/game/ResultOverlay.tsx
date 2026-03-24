import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import anime from "animejs";
import type { Player } from "@/hooks/useGameState";
import { soundManager } from "@/utils/sounds";

interface ResultOverlayProps {
  winner: Player;
  onRestart: () => void;
}

const WINNER_DATA: Record<Player, { emoji: string; name: string }> = {
  1: { emoji: "🦊", name: "Player 1" },
  2: { emoji: "🐲", name: "Player 2" },
};

export function ResultOverlay({ winner, onRestart }: ResultOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleRestart = () => {
    soundManager.play('button');
    onRestart();
  };

  useEffect(() => {
    // Sparkle animation
    if (containerRef.current) {
      const sparkles = containerRef.current.querySelectorAll(".sparkle");
      anime({
        targets: sparkles,
        scale: [0, 1.5, 0],
        opacity: [0, 1, 0],
        translateX: () => anime.random(-100, 100),
        translateY: () => anime.random(-100, 100),
        duration: 1500,
        delay: anime.stagger(100),
        loop: true,
        easing: "easeInOutQuad",
      });
    }
  }, []);

  const data = WINNER_DATA[winner];

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Sparkles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="sparkle absolute text-3xl select-none"
          style={{ top: "50%", left: "50%" }}
        >
          {["✨", "⭐", "🌟", "💫"][i % 4]}
        </span>
      ))}

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.2 }}
        className="text-8xl mb-4"
      >
        {data.emoji}
      </motion.div>

      <motion.h1
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="font-display text-5xl md:text-6xl font-bold text-primary mb-2"
      >
        🏆 {data.name} Wins!
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-xl text-muted-foreground mb-8 font-body"
      >
        Amazing math skills! 🎉
      </motion.p>

      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        onClick={handleRestart}
        className="font-display text-xl font-bold px-8 py-4 rounded-2xl bg-primary text-primary-foreground hover:scale-105 transition-transform shadow-lg"
      >
        🔄 Play Again!
      </motion.button>
    </motion.div>
  );
}
