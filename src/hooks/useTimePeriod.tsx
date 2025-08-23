
import { createContext, useContext, useState, ReactNode } from 'react';

interface TimePeriodContextType {
  timePeriod: string;
  setTimePeriod: (period: string) => void;
}

const TimePeriodContext = createContext<TimePeriodContextType | undefined>(undefined);

export const useTimePeriod = () => {
  const context = useContext(TimePeriodContext);
  if (!context) {
    throw new Error('useTimePeriod must be used within a TimePeriodProvider');
  }
  return context;
};

export const TimePeriodProvider = ({ children }: { children: ReactNode }) => {
  const [timePeriod, setTimePeriod] = useState('90');

  return (
    <TimePeriodContext.Provider value={{ timePeriod, setTimePeriod }}>
      {children}
    </TimePeriodContext.Provider>
  );
};
