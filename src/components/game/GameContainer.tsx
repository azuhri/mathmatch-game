import { motion } from "framer-motion";
import { useGameState } from "@/hooks/useGameState";
import { PlayerCard } from "./PlayerCard";
import { QuestionBox } from "./QuestionBox";
import { ResultOverlay } from "./ResultOverlay";
import { DarkModeToggle } from "./DarkModeToggle";
import { soundManager } from "@/utils/sounds";

export function GameContainer() {
  const { state, startGame, submitAnswer } = useGameState();

  const handleStart = () => {
    soundManager.play('button');
    startGame();
  };

  if (state.phase === "waiting") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
        <DarkModeToggle />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
          className="text-7xl"
        >
          ⚡
        </motion.div>
        <h1 className="font-display text-4xl md:text-6xl font-bold text-primary text-center">
          Mathmatch Battle!
        </h1>
        <p className="text-lg text-muted-foreground font-body text-center max-w-md">
          2-player math showdown! Answer questions fast to attack, heal, or shield. First to drop the opponent to 0 HP wins! 🏆
        </p>
        <div className="flex gap-6 text-5xl">
          <motion.span animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            🦊
          </motion.span>
          <span className="font-display text-4xl font-bold text-foreground self-center">VS</span>
          <motion.span animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}>
            🐲
          </motion.span>
        </div>
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
          className="font-display text-2xl font-bold px-10 py-5 rounded-2xl bg-primary text-primary-foreground shadow-lg"
        >
          🎮 Start Battle!
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-4">
      <DarkModeToggle />

      {state.winner && (
        <ResultOverlay winner={state.winner} onRestart={startGame} />
      )}

      <h1 className="font-display text-2xl md:text-3xl font-bold text-primary">
        ⚡ Matchmatch Battle!
        {/* Center question */}
        <div className="flex-1 flex flex-col items-center justify-center min-w-0 max-w-sm">
          <QuestionBox
            question={state.question}
            timer={state.timer}
            feedback={state.feedback}
          />
        </div>
      </h1>

      <div className="w-full max-w-5xl flex justify-between flex-col md:flex-row items-center md:items-start justify-center gap-4 md:gap-8">
        {/* Player 1 */}
        <PlayerCard
          player={1}
          hp={state.hp[0]}
          maxHp={state.maxHp[0]}
          combo={state.combo[0]}
          shieldActive={state.shieldActive[0]}
          onSubmit={(ans) => submitAnswer(1, ans)}
          disabled={!!state.winner}
          feedback={state.feedbackPlayer === 1 ? state.feedback : null}
          isTarget={state.feedbackPlayer === 2 && state.question?.type === "attack"}
          questionType={state.feedbackPlayer === 1 ? state.question?.type ?? null : null}
        />


        {/* Player 2 */}
        <PlayerCard
          player={2}
          hp={state.hp[1]}
          maxHp={state.maxHp[1]}
          combo={state.combo[1]}
          shieldActive={state.shieldActive[1]}
          onSubmit={(ans) => submitAnswer(2, ans)}
          disabled={!!state.winner}
          feedback={state.feedbackPlayer === 2 ? state.feedback : null}
          isTarget={state.feedbackPlayer === 1 && state.question?.type === "attack"}
          questionType={state.feedbackPlayer === 2 ? state.question?.type ?? null : null}
        />
      </div>
    </div>
  );
}
