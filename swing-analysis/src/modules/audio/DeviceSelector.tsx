import React from 'react';
import type { AudioDevice } from '../../types/audio';

interface DeviceSelectorProps {
  devices: AudioDevice[];
  selectedDeviceId: string | null;
  onSelectDevice: (deviceId: string) => void;
  disabled?: boolean;
}

const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  devices,
  selectedDeviceId,
  onSelectDevice,
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSelectDevice(e.target.value);
  };

  if (devices.length === 0) {
    return (
      <div className="text-sm text-gray-400">
        No audio input devices found
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-400">Microphone</label>
      <select
        value={selectedDeviceId || ''}
        onChange={handleChange}
        disabled={disabled}
        className={`w-full bg-gray-700 text-white px-3 py-2 rounded-lg text-sm ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'
        }`}
      >
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DeviceSelector;