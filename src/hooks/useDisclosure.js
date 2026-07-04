import { useCallback, useState } from 'react';

/** Modal/drawer open state with an optional payload (e.g. the row being edited). */
export function useDisclosure(initial = false) {
  const [isOpen, setIsOpen] = useState(initial);
  const [payload, setPayload] = useState(null);

  const open = useCallback((data = null) => {
    setPayload(data);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setPayload(null);
  }, []);

  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  return { isOpen, open, close, toggle, payload };
}

export default useDisclosure;
