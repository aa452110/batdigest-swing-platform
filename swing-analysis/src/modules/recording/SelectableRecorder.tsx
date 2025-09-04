import React from 'react';
import SelectableRecorderImpl from './SelectableRecorderImpl';
import type { SelectableRecorderProps } from './SelectableRecorderImpl';

const SelectableRecorder: React.FC<SelectableRecorderProps> = (props) => {
  return <SelectableRecorderImpl {...props} />;
};

export default SelectableRecorder;
