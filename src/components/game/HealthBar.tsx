import { motion } from "framer-motion";
import type { Player } from "@/hooks/useGameState";

interface HealthBarProps {
  hp: number;
  maxHp: number;
  player: Player;
}

export function HealthBar({ hp, maxHp, player }: HealthBarProps) {
  const pct = (hp / maxHp) * 100;
  const color =
    pct > 50
      ? player === 1
        ? "bg-player1"
        : "bg-player2"
      : pct > 25
      ? "bg-accent"
      : "bg-attack";

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1 font-display text-sm font-bold">
        <span>HP</span>
        <span>{hp}/{maxHp}</span>
      </div>
      <div className="hp-bar-track">
        <motion.div
          className={`hp-bar-fill ${color}`}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 15 }}
        />
      </div>
    </div>
  );
}
