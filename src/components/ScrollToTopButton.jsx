import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 250);
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      title="Voltar ao topo"
      className={`fixed bottom-6 right-6 p-3 rounded-full shadow-lg 
      transition-all duration-300 bg-gradient-to-r from-blue-600 to-cyan-500 
      text-white hover:from-cyan-500 hover:to-blue-600
      ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8 pointer-events-none"
      }
      focus:outline-none z-50 flex items-center justify-center`}
    >
      <ArrowUp size={22} />
    </button>
  );
}
