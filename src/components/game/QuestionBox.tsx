import { motion, AnimatePresence } from "framer-motion";
import type { Question } from "@/hooks/useGameState";

interface QuestionBoxProps {
  question: Question | null;
  timer: number;
  feedback: string | null;
}

const typeConfig = {
  attack: { icon: "⚔️", label: "Attack", className: "text-attack" },
  heal: { icon: "💚", label: "Heal", className: "text-heal" },
  shield: { icon: "🛡️", label: "Shield", className: "text-shield" },
};

export function QuestionBox({ question, timer, feedback }: QuestionBoxProps) {
  if (!question) return null;

  const config = typeConfig[question.type];
  const timerUrgent = timer <= 2;

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Type badge */}
      <motion.div
        key={question.text + question.type}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`font-display text-lg font-bold ${config.className} flex items-center gap-2`}
      >
        <span>{config.icon}</span>
        <span>{config.label} ({question.value})</span>
      </motion.div>

      {/* Timer */}
      <motion.div
        className={`font-display text-3xl font-bold ${
          timerUrgent ? "text-attack" : "text-foreground"
        }`}
        animate={timerUrgent ? { scale: [1, 1.2, 1] } : {}}
        transition={{ repeat: Infinity, duration: 0.5 }}
      >
        ⏱ {timer}s
      </motion.div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.text}
          initial={{ scale: 0.5, opacity: 0, rotateZ: -5 }}
          animate={{ scale: 1, opacity: 1, rotateZ: 0 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className="question-card text-center py-6 px-8"
        >
          <p className="font-display text-4xl md:text-5xl font-bold text-foreground">
            {question.text} = ?
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            className="feedback-text text-primary"
          >
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
