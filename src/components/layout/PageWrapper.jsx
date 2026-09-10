import { motion } from "framer-motion";
export function PageWrapper({ children }) {
    return (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4, ease: "easeOut" }} className="pt-24 pb-12 min-h-screen">
      {children}
    </motion.div>);
}
