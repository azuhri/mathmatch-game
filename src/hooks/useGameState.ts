import { useState, useCallback, useRef, useEffect } from "react";
import { soundManager } from "@/utils/sounds";
import { GameSettingsData } from "@/components/game/GameSettings";

export type QuestionType = "attack" | "heal" | "shield";
export type Player = 1 | 2;

export interface Question {
  text: string;
  answer: number;
  type: QuestionType;
  value: number;
}

export interface GameState {
  hp: [number, number];
  maxHp: [number, number];
  question: Question | null;
  timer: number;
  combo: [number, number];
  phase: "waiting" | "playing" | "result";
  winner: Player | null;
  feedback: string | null;
  feedbackPlayer: Player | null;
  shieldActive: [boolean, boolean];
}

const TIMER_DURATION = 6;
const MAX_HP = 100;

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion(): Question {
  const types: QuestionType[] = ["attack", "attack", "attack", "heal", "shield"];
  const type = types[randInt(0, types.length - 1)];
  const ops = ["+", "-", "×", "÷"] as const;
  const op = ops[randInt(0, 3)];

  let a: number, b: number, answer: number, text: string;

  switch (op) {
    case "+":
      a = randInt(1, 50);
      b = randInt(1, 50);
      answer = a + b;
      text = `${a} + ${b}`;
      break;
    case "-":
      a = randInt(10, 60);
      b = randInt(1, a);
      answer = a - b;
      text = `${a} - ${b}`;
      break;
    case "×":
      a = randInt(2, 12);
      b = randInt(2, 12);
      answer = a * b;
      text = `${a} × ${b}`;
      break;
    case "÷":
      b = randInt(2, 10);
      answer = randInt(2, 10);
      a = b * answer;
      text = `${a} ÷ ${b}`;
      break;
  }

  const values: Record<QuestionType, number> = {
    attack: randInt(10, 20),
    heal: randInt(8, 15),
    shield: randInt(5, 10),
  };

  return { text: text!, answer: answer!, type, value: values[type] };
}

export function useGameState(settings?: GameSettingsData) {
  const [currentSettings, setCurrentSettings] = useState<GameSettingsData>(settings || {
    timerDuration: 6,
    player1Name: "Player 1",
    player2Name: "Player 2",
    player1Avatar: null,
    player2Avatar: null,
  });

  const [state, setState] = useState<GameState>({
    hp: [MAX_HP, MAX_HP],
    maxHp: [MAX_HP, MAX_HP],
    question: null,
    timer: currentSettings.timerDuration,
    combo: [0, 0],
    phase: "waiting",
    winner: null,
    feedback: null,
    feedbackPlayer: null,
    shieldActive: [false, false],
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answeredRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const nextQuestion = useCallback(() => {
    answeredRef.current = false;
    const q = generateQuestion();
    setState((s) => ({
      ...s,
      question: q,
      timer: currentSettings.timerDuration,
      feedback: null,
      feedbackPlayer: null,
      phase: "playing",
    }));

    clearTimer();
    timerRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.timer <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          soundManager.play('tick');
          return {
            ...prev,
            timer: 0,
            feedback: "⏰ Too Slow!",
            feedbackPlayer: null,
          };
        }
        soundManager.play('tick');
        return { ...prev, timer: prev.timer - 1 };
      });
    }, 1000);
  }, [currentSettings.timerDuration, clearTimer]);

  const startGame = useCallback(() => {
    setState({
      hp: [MAX_HP, MAX_HP],
      maxHp: [MAX_HP, MAX_HP],
      question: null,
      timer: currentSettings.timerDuration,
      combo: [0, 0],
      phase: "playing",
      winner: null,
      feedback: null,
      feedbackPlayer: null,
      shieldActive: [false, false],
    });
    setTimeout(() => nextQuestion(), 500);
  }, [currentSettings.timerDuration, nextQuestion]);

  const submitAnswer = useCallback(
    (player: Player, answer: number) => {
      if (answeredRef.current || !state.question) return;
      const q = state.question;

      if (answer !== q.answer) {
        // Wrong answer - break combo
        soundManager.play('wrong');
        setState((s) => {
          const newCombo: [number, number] = [...s.combo];
          newCombo[player - 1] = 0;
          return { ...s, combo: newCombo, feedback: "❌ Wrong!", feedbackPlayer: player };
        });
        return;
      }

      answeredRef.current = true;
      clearTimer();

      setState((s) => {
        const newHp: [number, number] = [...s.hp];
        const newMaxHp: [number, number] = [...s.maxHp];
        const newCombo: [number, number] = [...s.combo];
        const newShield: [boolean, boolean] = [...s.shieldActive];
        const opponent = player === 1 ? 1 : 0; // index
        const self = player - 1;

        newCombo[self] += 1;
        const comboBonus = newCombo[self] >= 3 ? 5 : 0;
        let feedback = "✅ Correct!";

        const fastBonus = s.timer >= currentSettings.timerDuration - 1 ? 3 : 0;
        if (fastBonus > 0) feedback = "⚡ Speed Bonus!";
        if (newCombo[self] >= 3) feedback = `🔥 Combo x${newCombo[self]}!`;

        // Play correct feedback sound
        if (fastBonus > 0) {
          soundManager.play('speedBonus');
        } else if (newCombo[self] >= 3) {
          soundManager.play('combo');
        } else {
          soundManager.play('correct');
        }

        switch (q.type) {
          case "attack": {
            soundManager.play('attack');
            let dmg = q.value + comboBonus + fastBonus;
            if (newShield[opponent]) {
              dmg = Math.max(0, dmg - 10);
              newShield[opponent] = false;
            }
            newHp[opponent] = Math.max(0, newHp[opponent] - dmg);
            break;
          }
          case "heal":
            soundManager.play('heal');
            newHp[self] = Math.min(newMaxHp[self], newHp[self] + q.value + comboBonus);
            break;
          case "shield":
            soundManager.play('shield');
            newShield[self] = true;
            // Increase maxHp by shield value and heal to that new max
            newMaxHp[self] += q.value;
            newHp[self] = Math.min(newMaxHp[self], newHp[self] + q.value);
            break;
        }

        // Reset opponent combo
        if (q.type === "attack") newCombo[opponent] = 0;

        const winner = newHp[0] <= 0 ? 2 : newHp[1] <= 0 ? 1 : null;
        if (winner) soundManager.play('gameOver');

        return {
          ...s,
          hp: newHp,
          maxHp: newMaxHp,
          combo: newCombo,
          shieldActive: newShield,
          feedback,
          feedbackPlayer: player,
          winner,
          phase: winner ? "result" : s.phase,
        };
      });

      // Auto next question after delay
      setTimeout(() => {
        setState((s) => {
          if (s.winner) return s;
          return s;
        });
        if (!state.winner) {
          setTimeout(() => nextQuestion(), 1200);
        }
      }, 100);
    },
    [state.question, state.winner, clearTimer, nextQuestion]
  );

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  // Auto-advance after timeout
  useEffect(() => {
    if (state.timer === 0 && state.phase === "playing" && !state.winner) {
      const t = setTimeout(() => nextQuestion(), 1500);
      return () => clearTimeout(t);
    }
  }, [state.timer, state.phase, state.winner, nextQuestion]);

  const updateSettings = useCallback((newSettings: GameSettingsData) => {
    setCurrentSettings(newSettings);
  }, []);

  return { state, startGame, submitAnswer, nextQuestion, currentSettings, updateSettings };
}
