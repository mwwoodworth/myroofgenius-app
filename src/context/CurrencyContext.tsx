'use client';
import {createContext, useContext, useState, ReactNode} from 'react';

interface CurrencyState {
  currency: string;
  setCurrency: (c: string) => void;
}

const CurrencyContext = createContext<CurrencyState>({
  currency: 'USD',
  setCurrency: () => {}
});

export function CurrencyProvider({children}: {children: ReactNode}) {
  const [currency, setCurrency] = useState('USD');
  return (
    <CurrencyContext.Provider value={{currency, setCurrency}}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
