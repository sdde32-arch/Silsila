import React from 'react';
import { JourneyPath, JourneyPathProps } from './JourneyPath';

export interface QuranJourneyMapProps extends JourneyPathProps {}

export const QuranJourneyMap: React.FC<QuranJourneyMapProps> = (props) => {
  return <JourneyPath {...props} />;
};

export { JourneyPath } from './JourneyPath';
