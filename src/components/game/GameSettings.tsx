import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Upload, X, Save, RotateCcw, Camera, Image } from "lucide-react";

interface GameSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: GameSettingsData) => void;
}

export interface GameSettingsData {
  timerDuration: number;
  player1Name: string;
  player2Name: string;
  player1Avatar: string | null;
  player2Avatar: string | null;
}

const DEFAULT_SETTINGS: GameSettingsData = {
  timerDuration: 6,
  player1Name: "Player 1",
  player2Name: "Player 2",
  player1Avatar: null,
  player2Avatar: null,
};

const AVATAR_EMOJIS = ["🦊", "🐲", "🐯", "🦁", "🐺", "🦅", "🐉", "🦌", "🐻", "🐼"];

export function GameSettings({ isOpen, onClose, onSettingsChange }: GameSettingsProps) {
  const [settings, setSettings] = useState<GameSettingsData>(DEFAULT_SETTINGS);
  const [tempAvatars, setTempAvatars] = useState<{ player1?: string; player2?: string }>({});
  const [cameraStreams, setCameraStreams] = useState<{ player1?: MediaStream; player2?: MediaStream }>({});
  const [showCamera, setShowCamera] = useState<{ player1?: boolean; player2?: boolean }>({});

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('gameSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Cleanup camera streams when component unmounts or camera is closed
    return () => {
      Object.values(cameraStreams).forEach(stream => {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      });
    };
  }, [cameraStreams]);

  const startCamera = async (player: 'player1' | 'player2') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      setCameraStreams(prev => ({ ...prev, [player]: stream }));
      setShowCamera(prev => ({ ...prev, [player]: true }));
      
      // Set video stream after a short delay to ensure DOM is ready
      setTimeout(() => {
        const video = document.getElementById(`camera-${player}`) as HTMLVideoElement;
        if (video) {
          video.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check camera permissions.');
    }
  };

  const stopCamera = (player: 'player1' | 'player2') => {
    const stream = cameraStreams[player];
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setCameraStreams(prev => ({ ...prev, [player]: undefined }));
    }
    setShowCamera(prev => ({ ...prev, [player]: false }));
  };

  const capturePhoto = (player: 'player1' | 'player2') => {
    const stream = cameraStreams[player];
    if (!stream) return;

    const video = document.getElementById(`camera-${player}`) as HTMLVideoElement;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setTempAvatars(prev => ({ ...prev, [player]: imageData }));
      setSettings(prev => ({
        ...prev,
        [`${player}Avatar`]: imageData
      }));
    }

    stopCamera(player);
  };

  const handleFileUpload = (player: 'player1' | 'player2', file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setTempAvatars(prev => ({ ...prev, [player]: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarSelect = (player: 'player1' | 'player2', emoji: string) => {
    setSettings(prev => ({
      ...prev,
      [`${player}Avatar`]: emoji
    }));
    setTempAvatars(prev => ({ ...prev, [player]: undefined }));
  };

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('gameSettings', JSON.stringify(settings));
    
    // Apply settings
    onSettingsChange(settings);
    
    // Clear temporary avatars from memory
    setTempAvatars({});
    onClose();
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setTempAvatars({});
    // Stop all cameras
    Object.keys(cameraStreams).forEach(player => {
      if (cameraStreams[player as keyof typeof cameraStreams]) {
        stopCamera(player as 'player1' | 'player2');
      }
    });
  };

  const getCurrentAvatar = (player: 'player1' | 'player2') => {
    const tempAvatar = tempAvatars[player];
    const savedAvatar = player === 'player1' ? settings.player1Avatar : settings.player2Avatar;
    
    if (tempAvatar) return tempAvatar;
    if (savedAvatar) return savedAvatar;
    return player === 'player1' ? "🦊" : "🐲";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Game Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Timer Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">⏱️ Timer Settings</h3>
            <div className="space-y-2">
              <Label htmlFor="timer-duration">Timer Duration: {settings.timerDuration} seconds</Label>
              <Slider
                id="timer-duration"
                min={3}
                max={15}
                step={1}
                value={[settings.timerDuration]}
                onValueChange={(value) => setSettings(prev => ({ ...prev, timerDuration: value[0] }))}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Set how long each question lasts (3-15 seconds)
              </p>
            </div>
          </div>

          {/* Player 1 Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">🎮 Player 1 Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="player1-name">Player Name</Label>
                <Input
                  id="player1-name"
                  value={settings.player1Name}
                  onChange={(e) => setSettings(prev => ({ ...prev, player1Name: e.target.value }))}
                  placeholder="Enter player name"
                  maxLength={20}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Avatar</Label>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={getCurrentAvatar('player1').startsWith('data:') ? getCurrentAvatar('player1') : undefined} />
                    <AvatarFallback className="text-2xl">
                      {getCurrentAvatar('player1').startsWith('data:') ? '👤' : getCurrentAvatar('player1')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('player1-upload')?.click()}
                      className="flex items-center gap-1"
                    >
                      <Upload className="h-4 w-4" />
                      Upload
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => showCamera.player1 ? stopCamera('player1') : startCamera('player1')}
                      className="flex items-center gap-1"
                    >
                      {showCamera.player1 ? <X className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                      {showCamera.player1 ? 'Stop' : 'Camera'}
                    </Button>
                    <input
                      id="player1-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload('player1', e.target.files[0])}
                    />
                  </div>
                </div>
                
                {/* Camera Preview */}
                <AnimatePresence>
                  {showCamera.player1 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <video
                        id="camera-player1"
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-48 object-cover rounded-lg bg-black"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => capturePhoto('player1')}
                          className="flex-1 flex items-center gap-2"
                        >
                          <Camera className="h-4 w-4" />
                          Capture Photo
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => stopCamera('player1')}
                        >
                          Cancel
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Emoji Avatar Selection */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {AVATAR_EMOJIS.map((emoji) => (
                    <Button
                      key={emoji}
                      variant={getCurrentAvatar('player1') === emoji ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleAvatarSelect('player1', emoji)}
                      className="text-lg p-2 h-8 w-8"
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Player 2 Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">🎮 Player 2 Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="player2-name">Player Name</Label>
                <Input
                  id="player2-name"
                  value={settings.player2Name}
                  onChange={(e) => setSettings(prev => ({ ...prev, player2Name: e.target.value }))}
                  placeholder="Enter player name"
                  maxLength={20}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Avatar</Label>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={getCurrentAvatar('player2').startsWith('data:') ? getCurrentAvatar('player2') : undefined} />
                    <AvatarFallback className="text-2xl">
                      {getCurrentAvatar('player2').startsWith('data:') ? '👤' : getCurrentAvatar('player2')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('player2-upload')?.click()}
                      className="flex items-center gap-1"
                    >
                      <Upload className="h-4 w-4" />
                      Upload
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => showCamera.player2 ? stopCamera('player2') : startCamera('player2')}
                      className="flex items-center gap-1"
                    >
                      {showCamera.player2 ? <X className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                      {showCamera.player2 ? 'Stop' : 'Camera'}
                    </Button>
                    <input
                      id="player2-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload('player2', e.target.files[0])}
                    />
                  </div>
                </div>
                
                {/* Camera Preview */}
                <AnimatePresence>
                  {showCamera.player2 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <video
                        id="camera-player2"
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-48 object-cover rounded-lg bg-black"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => capturePhoto('player2')}
                          className="flex-1 flex items-center gap-2"
                        >
                          <Camera className="h-4 w-4" />
                          Capture Photo
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => stopCamera('player2')}
                        >
                          Cancel
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Emoji Avatar Selection */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {AVATAR_EMOJIS.map((emoji) => (
                    <Button
                      key={emoji}
                      variant={getCurrentAvatar('player2') === emoji ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleAvatarSelect('player2', emoji)}
                      className="text-lg p-2 h-8 w-8"
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Default
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
