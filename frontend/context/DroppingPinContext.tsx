// context/PickingContext.tsx
import { createContext, useContext, useState } from "react";

const DroppingPinContext = createContext<{
  isDroppingPin: boolean;
  setIsDroppingPin: (val: boolean) => void;
}>({ isDroppingPin: false, setIsDroppingPin: () => {} });

export function DroppingPinProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDroppingPin, setIsDroppingPin] = useState(false);

  return (
    <DroppingPinContext.Provider value={{ isDroppingPin, setIsDroppingPin }}>
      {children}
    </DroppingPinContext.Provider>
  );
}

export const useDroppingPin = () => useContext(DroppingPinContext);
