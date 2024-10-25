import { useState, useEffect } from 'react';

const useSticky = (ref, offset = 0) => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setIsSticky(rect.top <= offset);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [ref, offset]);

  return isSticky;
};

export default useSticky;
