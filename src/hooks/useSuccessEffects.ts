import { useCallback } from "react";
import toast from "react-hot-toast";

export const useSuccessEffects = () => {
  // Play success sound
  const playSuccessSound = useCallback(() => {
    try {
      // Create audio context for better browser support
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Success sound - create a pleasant chime
      const createSuccessSound = (
        frequency: number,
        duration: number,
        volume: number = 0.1
      ) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(
          frequency,
          audioContext.currentTime
        );
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(
          volume,
          audioContext.currentTime + 0.01
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + duration
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      };

      // Play a pleasant success chime sequence
      createSuccessSound(523.25, 0.2); // C5
      setTimeout(() => createSuccessSound(659.25, 0.2), 100); // E5
      setTimeout(() => createSuccessSound(783.99, 0.3), 200); // G5
    } catch (error) {
      console.log("Audio not supported:", error);
    }
  }, []);

  // Show confetti animation
  const showConfetti = useCallback(() => {
    // Create confetti elements
    const confettiContainer = document.createElement("div");
    confettiContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9998;
    `;
    document.body.appendChild(confettiContainer);

    // Create confetti pieces
    const colors = [
      "#FFD700",
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FECA57",
      "#FF9FF3",
      "#54A0FF",
    ];

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement("div");
      confetti.style.cssText = `
        position: absolute;
        width: 10px;
        height: 10px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${Math.random() * 100}%;
        animation: confetti-fall ${2 + Math.random() * 2}s linear forwards;
        border-radius: ${Math.random() > 0.5 ? "50%" : "0"};
        transform: rotate(${Math.random() * 360}deg);
      `;
      confettiContainer.appendChild(confetti);
    }

    // Add CSS animation
    const style = document.createElement("style");
    style.textContent = `
      @keyframes confetti-fall {
        0% {
          transform: translateY(-100vh) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(720deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);

    // Clean up after animation
    setTimeout(() => {
      document.body.removeChild(confettiContainer);
      document.head.removeChild(style);
    }, 4000);
  }, []);

  // Show floating success message with animation
  const showFloatingMessage = useCallback(
    (message: string, amount?: number) => {
      const messageContainer = document.createElement("div");
      messageContainer.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px 30px;
      border-radius: 15px;
      font-size: 18px;
      font-weight: bold;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      z-index: 9997;
      text-align: center;
      min-width: 300px;
      animation: success-popup 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    `;

      messageContainer.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; justify-content: center;">
        <div style="font-size: 24px;">🎉</div>
        <div>
          <div>${message}</div>
          ${
            amount
              ? `<div style="font-size: 16px; margin-top: 5px; color: #FFD700;">+${new Intl.NumberFormat(
                  "de-DE",
                  { style: "currency", currency: "EUR" }
                ).format(amount)}</div>`
              : ""
          }
        </div>
        <div style="font-size: 24px;">💰</div>
      </div>
    `;

      const style = document.createElement("style");
      style.textContent = `
      @keyframes success-popup {
        0% {
          transform: translate(-50%, -50%) scale(0.5);
          opacity: 0;
        }
        50% {
          transform: translate(-50%, -50%) scale(1.1);
        }
        100% {
          transform: translate(-50%, -50%) scale(1);
          opacity: 1;
        }
      }
      @keyframes success-fadeout {
        0% {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
        100% {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.8);
        }
      }
    `;
      document.head.appendChild(style);
      document.body.appendChild(messageContainer);

      // Fade out and remove
      setTimeout(() => {
        messageContainer.style.animation =
          "success-fadeout 0.5s ease-in-out forwards";
        setTimeout(() => {
          if (document.body.contains(messageContainer)) {
            document.body.removeChild(messageContainer);
          }
          if (document.head.contains(style)) {
            document.head.removeChild(style);
          }
        }, 500);
      }, 2500);
    },
    []
  );

  // Combined success effect
  const playSuccessEffects = useCallback(
    (message: string = "Đơn hàng mới đã được phân phối!", amount?: number) => {
      // Show toast notification with proper dismiss functionality
      toast.success(message, {
        duration: 3000,
        icon: "🎉",
        id: `success-${Date.now()}`, // Unique ID to prevent duplicates
        position: "top-right",
      });

      // Play sound and visual effects
      playSuccessSound();
      showConfetti();
      showFloatingMessage(message, amount);
    },
    [playSuccessSound, showConfetti, showFloatingMessage]
  );

  return {
    playSuccessSound,
    showConfetti,
    showFloatingMessage,
    playSuccessEffects,
  };
};
