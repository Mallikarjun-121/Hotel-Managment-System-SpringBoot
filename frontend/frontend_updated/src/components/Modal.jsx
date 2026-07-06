import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-meridian-950/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-paper-50 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto thin-scroll"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-paper-300/60 sticky top-0 bg-paper-50">
              <h2 className="font-display text-lg text-paper-950">{title}</h2>
              <button onClick={onClose} className="p-1.5 text-paper-500 hover:text-paper-900 rounded-full" aria-label="Close">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
