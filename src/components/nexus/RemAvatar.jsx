import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function RemAvatar({ isListening = false, isSpeaking = false, isThinking = false, size = 'md' }) {
  const sizes = { sm: 'w-10 h-10', md: 'w-16 h-16', lg: 'w-24 h-24', xl: 'w-32 h-32' };

  return (
    <div className={cn("relative flex items-center justify-center", sizes[size])}>
      {(isListening || isSpeaking) && (
        <>
          <motion.div className="absolute inset-0 rounded-full border border-cyan/40" animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }} transition={{ duration: 1.5, repeat: Infinity }} />
          <motion.div className="absolute inset-0 rounded-full border border-cyan/20" animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }} />
        </>
      )}
      <motion.div
        className={cn("relative w-full h-full rounded-full flex items-center justify-center overflow-hidden border-2 transition-all duration-300",
          isListening ? "border-cyan" : isSpeaking ? "border-purple" : "border-border")}
        style={{ background: 'radial-gradient(circle at 30% 30%, hsl(195 100% 15%), hsl(220 18% 7%))' }}
        animate={isThinking ? { rotate: [0, 5, -5, 0] } : {}}
        transition={{ duration: 0.5, repeat: isThinking ? Infinity : 0 }}>
        <motion.div className="text-cyan font-bold select-none"
          style={{ fontSize: size === 'xl' ? '2rem' : size === 'lg' ? '1.5rem' : size === 'md' ? '1rem' : '0.75rem' }}
          animate={isSpeaking ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: isSpeaking ? Infinity : 0 }}>
          R
        </motion.div>
        <div className={cn("absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full border border-card",
          isListening ? "bg-cyan" : isSpeaking ? "bg-purple" : isThinking ? "bg-gold" : "bg-green-500")} />
      </motion.div>
      {isThinking && (
        <motion.div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-0.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {[0, 1, 2].map(i => (
            <motion.div key={i} className="w-1 h-1 rounded-full bg-cyan" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
