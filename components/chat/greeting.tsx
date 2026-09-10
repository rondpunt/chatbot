import { motion } from "framer-motion";

export const Greeting = () => (
  <div className="flex max-w-md flex-col items-center px-4" key="overview">
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="text-center font-semibold text-2xl tracking-tight text-foreground md:text-3xl"
      initial={{ opacity: 0, y: 10 }}
      transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      What can I help with?
    </motion.div>
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 text-center text-muted-foreground text-sm"
      initial={{ opacity: 0, y: 10 }}
      transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      Ask a question, write code, or explore ideas — powered by Groq.
    </motion.div>
  </div>
);

export const ChatErrorState = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) => (
  <div
    className="mx-auto flex w-full max-w-md flex-col items-center gap-3 rounded-bubble border border-destructive/30 bg-destructive/10 px-4 py-3 text-center"
    role="alert"
  >
    <p className="text-foreground text-sm">{message}</p>
    {onRetry ? (
      <button
        className="rounded-md border border-border bg-muted px-3 py-1.5 text-foreground text-sm transition-colors hover:bg-secondary"
        onClick={onRetry}
        type="button"
      >
        Try again
      </button>
    ) : null}
  </div>
);
