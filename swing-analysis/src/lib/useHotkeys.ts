import { useEffect } from 'react';

type HotkeyHandler = (event: KeyboardEvent) => void;

interface HotkeyConfig {
  key: string;
  handler: HotkeyHandler;
  preventDefault?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
}

export const useHotkeys = (hotkeys: HotkeyConfig[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const hotkey of hotkeys) {
        // Check modifier keys
        if (hotkey.ctrl && !event.ctrlKey) continue;
        if (hotkey.shift && !event.shiftKey) continue;
        if (hotkey.alt && !event.altKey) continue;

        // Check main key
        if (event.key === hotkey.key) {
          if (hotkey.preventDefault) {
            event.preventDefault();
          }
          hotkey.handler(event);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hotkeys]);
};
