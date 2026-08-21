import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

export function RouteProgress() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setVisible(true);
    setDone(false);
    const timer = setTimeout(() => {
      setDone(true);
      setTimeout(() => setVisible(false), 400);
    }, 600);
    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-fuchsia-500 to-primary"
            initial={{ width: "0%" }}
            animate={{ width: done ? "100%" : "80%" }}
            transition={
              done
                ? { duration: 0.3, ease: "easeOut" }
                : { duration: 0.5, ease: "easeInOut" }
            }
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}