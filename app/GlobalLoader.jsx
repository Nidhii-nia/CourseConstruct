"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";

let apiCount = 0;

export default function GlobalLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  // 🔹 Listen for route change and show loader immediately
  useEffect(() => {
    setLoading(true);
  }, [pathname]);

  // 🔹 Track ALL axios API calls
  useEffect(() => {
    const reqInt = axios.interceptors.request.use((config) => {
      apiCount++;
      setLoading(true);
      return config;
    });

    const resInt = axios.interceptors.response.use(
      (response) => {
        apiCount--;
        checkIfDone();
        return response;
      },
      (error) => {
        apiCount--;
        checkIfDone();
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(reqInt);
      axios.interceptors.response.eject(resInt);
    };
  }, []);

  // 🔹 Wait until UI finishes rendering
  const checkIfDone = () => {
    if (apiCount === 0) {
      // Wait for next frame so UI is fully rendered
      requestAnimationFrame(() => {
        setLoading(false);
      });
    }
  };

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-white/90 dark:bg-black/90 flex justify-center items-center z-99999">
      <div className="animate-spin h-14 w-14 border-4 border-emerald-600 border-t-transparent rounded-full"></div>
    </div>
  );
}
