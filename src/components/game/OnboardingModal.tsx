import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Settings } from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings?: () => void;
}

const onboardingSteps = [
  {
    title: "Selamat Datang di Matchmatch Battle! ⚡",
    content: "Game matematika 2-pemain yang seru dan cepat. Siapakah yang akan menjadi pemenang?",
    gif: "/demo/Demo Case Attack.gif",
    tips: "Klik 'Next' untuk melanjutkan petunjuk bermain"
  },
  {
    title: "Cara Bermain - Dasar 🎮",
    content: "Setiap pemain akan mendapat soal matematika yang harus dijawab dengan cepat. Jawaban benar akan memicu aksi spesial!",
    gif: "/demo/Demo Case Heal.gif",
    tips: "Kalian punya 6 detik untuk setiap soal"
  },
  {
    title: "Jenis Aksi - Attack ⚔️",
    content: "Jawaban benar dengan tipe 'Attack' akan mengurangi HP lawan. Damage bergantung pada nilai soal + bonus combo & speed.",
    gif: "/demo/Demo Case Attack.gif",
    tips: "Attack lebih efektif dengan combo x3+"
  },
  {
    title: "Jenis Aksi - Heal 💚",
    content: "Jawaban benar dengan tipe 'Heal' akan memulihkan HP-mu. Perfect untuk bertahan dari serangan lawan!",
    gif: "/demo/Demo Case Heal.gif",
    tips: "Heal bisa membawa HP kembali ke 100"
  },
  {
    title: "Jenis Aksi - Shield 🛡️",
    content: "Jawaban benar dengan tipe 'Shield' akan mengaktifkan perisai dan menambah max HP. Shield bisa menahan 1 serangan!",
    gif: "/demo/Demo Case Shield.gif",
    tips: "Shield mengurangi 10 damage dari serangan"
  },
  {
    title: "Game Settings ⚙️",
    content: "Kustomisasi pengalaman bermain kalian! Atur timer, nama pemain, dan avatar khusus untuk masing-masing pemain.",
    gif: "/demo/Change Theme Mode.gif",
    tips: "Klik icon ⚙️ di pojok kanan atas waiting screen untuk membuka settings"
  },
  {
    title: "Avatar Kustom 📸",
    content: "Pilih avatar yang unik! Upload foto, ambil foto langsung dari camera, atau pilih emoji favorit kalian.",
    gif: "/demo/Change Theme Mode.gif",
    tips: "Camera capture langsung tanpa perlu upload file!"
  },
  {
    title: "Timer Settings ⏱️",
    content: "Atur durasi timer sesuai kesulitan yang diinginkan. Dari 3 detik (sulit) hingga 15 detik (mudah).",
    gif: "/demo/Change Theme Mode.gif",
    tips: "Default 6 detik, tapi bisa disesuaikan preferensi"
  },
  {
    title: "Combo & Speed Bonus 🔥",
    content: "Jawaban benar berturut-turut membangun combo. Jawaban sangat cepat memberi speed bonus. Keduanya meningkatkan efek aksi!",
    gif: "/demo/Change Theme Mode.gif",
    tips: "Combo x3+ memberi bonus +5 damage/heal"
  },
  {
    title: "Kemenangan 🏆",
    content: "Pemain yang berhasil menjatuhkan HP lawan ke 0 adalah pemenangnya. Siap yang akan menang?",
    gif: "/demo/Demo Case Attack.gif",
    tips: "Strategi combo dan timing adalah kunci!"
  }
];

export function OnboardingModal({ isOpen, onClose, onOpenSettings }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (hasSeenOnboarding === 'true') {
      onClose();
    }
  }, [onClose]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    if (dontShowAgain) {
      localStorage.setItem('hasSeenOnboarding', 'true');
    }
    onClose();
  };

  const handleSkip = () => {
    if (dontShowAgain) {
      localStorage.setItem('hasSeenOnboarding', 'true');
    }
    onClose();
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {currentStepData.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* GIF Display */}
          <div className="relative w-full h-84 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg overflow-hidden">
            <img
              src={currentStepData.gif}
              alt={currentStepData.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                // Show fallback when image fails to load
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
              onLoad={(e) => {
                const target = e.target as HTMLImageElement;
                // Hide fallback when image loads successfully
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'none';
              }}
            />
            {/* Fallback if GIF doesn't load */}
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="text-6xl mb-2">⚡</div>
                <p className="text-sm">Demo gambar tidak tersedia</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <p className="text-lg text-center font-medium">
              {currentStepData.content}
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
                💡 {currentStepData.tips}
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center space-x-2">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 bg-primary'
                    : index < currentStep
                    ? 'w-2 bg-primary/50'
                    : 'w-2 bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Checkbox for "Don't show again" */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="dontShowAgain"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="dontShowAgain" className="text-sm text-muted-foreground">
              Jangan tampilkan lagi
            </label>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSkip}
                className="text-sm"
              >
                Skip
              </Button>
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  className="flex items-center space-x-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>
              )}
            </div>

            <div className="flex space-x-2">
              {/* Special button for settings step */}
              {currentStep === 5 && onOpenSettings && (
                <Button
                  variant="outline"
                  onClick={() => {
                    onOpenSettings();
                    onClose();
                  }}
                  className="flex items-center space-x-1"
                >
                  <Settings className="h-4 w-4" />
                  <span>Open Settings</span>
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                className="flex items-center space-x-1"
              >
                <span>{currentStep === onboardingSteps.length - 1 ? "Start Playing!" : "Next"}</span>
                {currentStep < onboardingSteps.length - 1 && (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
