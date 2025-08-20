import { motion } from "motion/react";

export default function PageWrapper({ children }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.3 }}
            className="page"
        >
            {children}
        </motion.div>
    );
};