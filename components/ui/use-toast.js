// Simple toast hook
import { useState } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const toast = ({ title, description, variant = 'default' }) => {
    console.log(`[${variant}] ${title}: ${description}`);
    // Implement your toast logic here
  };

  return { toast, toasts };
}
