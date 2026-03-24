import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import anime from "animejs";
import type { Player, QuestionType } from "@/hooks/useGameState";
import { HealthBar } from "./HealthBar";

const AVATARS: Record<Player, { emoji: string; name: string }> = {
  1: { emoji: "🦊", name: "Player 1" },
  2: { emoji: "🐲", name: "Player 2" },
};

interface PlayerCardProps {
  player: Player;
  hp: number;
  combo: number;
  shieldActive: boolean;
  onSubmit: (answer: number) => void;
  disabled: boolean;
  feedback: string | null;
  isTarget: boolean;
  questionType: QuestionType | null;
}

export function PlayerCard({
  player,
  hp,
  combo,
  shieldActive,
  onSubmit,
  disabled,
  feedback,
  isTarget,
  questionType,
}: PlayerCardProps) {
  const [input, setInput] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  // Shake on being attacked
  useEffect(() => {
    if (isTarget && questionType === "attack" && cardRef.current) {
      anime({
        targets: cardRef.current,
        translateX: [-8, 8, -6, 6, -3, 3, 0],
        duration: 500,
        easing: "easeInOutQuad",
      });
    }
  }, [isTarget, questionType, hp]);

  // Glow on heal
  useEffect(() => {
    if (feedback?.includes("Correct") && questionType === "heal" && cardRef.current) {
      anime({
        targets: cardRef.current,
        boxShadow: [
          "0 0 0px hsl(145 70% 45% / 0)",
          "0 0 30px hsl(145 70% 45% / 0.6)",
          "0 0 0px hsl(145 70% 45% / 0)",
        ],
        duration: 800,
        easing: "easeInOutQuad",
      });
    }
  }, [feedback, questionType]);

  const handleSubmit = useCallback(() => {
    const val = parseInt(input);
    if (isNaN(val)) return;
    onSubmit(val);
    setInput("");
  }, [input, onSubmit]);

  const handleNumPad = useCallback((digit: string) => {
    if (disabled) return;
    if (digit === "del") {
      setInput((prev) => prev.slice(0, -1));
    } else if (digit === "neg") {
      setInput((prev) => (prev.startsWith("-") ? prev.slice(1) : "-" + prev));
    } else if (digit === "go") {
      handleSubmit();
    } else {
      setInput((prev) => prev + digit);
    }
  }, [disabled, handleSubmit]);

  // Clear input on new question
  useEffect(() => {
    if (!disabled) setInput("");
  }, [disabled]);

  const avatar = AVATARS[player];
  const cardClass = player === 1 ? "player1-card" : "player2-card";

  const numButtons = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "neg", "0", "del"];

  return (
    <motion.div
      ref={cardRef}
      className={`${cardClass} flex flex-col items-center gap-3 w-full max-w-xs`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", delay: player * 0.1 }}
    >
      {/* Avatar */}
      <div className="text-6xl select-none relative">
        {avatar.emoji}
        {shieldActive && (
          <motion.span
            className="absolute -top-2 -right-2 text-2xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            🛡️
          </motion.span>
        )}
      </div>

      <h2 className="font-display text-xl font-bold text-foreground">
        {avatar.name}
      </h2>

      {/* Combo */}
      <AnimatePresence>
        {combo >= 2 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="text-sm font-bold text-combo font-display"
          >
            🔥 Combo x{combo}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HP */}
      <HealthBar hp={hp} maxHp={100} player={player} />

      {/* Answer display */}
      <div className="w-full mt-1 rounded-lg border-2 border-border bg-card text-foreground text-center text-2xl font-bold font-display h-12 flex items-center justify-center select-none">
        {input || <span className="text-muted-foreground text-lg">?</span>}
      </div>

      {/* Number pad */}
      <div className="grid grid-cols-3 gap-1.5 w-full">
        {numButtons.map((btn) => (
          <button
            key={btn}
            type="button"
            disabled={disabled}
            onClick={() => handleNumPad(btn)}
            className="h-10 rounded-lg font-display font-bold text-lg bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none select-none"
          >
            {btn === "neg" ? "±" : btn === "del" ? "⌫" : btn}
          </button>
        ))}
      </div>

      {/* Submit button */}
      <button
        type="button"
        disabled={disabled || input === ""}
        onClick={handleSubmit}
        className="w-full h-11 rounded-lg font-display font-bold text-lg bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none select-none"
      >
        GO ✅
      </button>
    </motion.div>
  );
}
