import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, MessageSquare } from 'lucide-react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

/* ── Comment store (local) ─────────────────────────────── */
export interface Comment {
  id: string;
  taskId: string;
  author: string;
  body: string;
  createdAt: string;
}

interface CommentsStore {
  comments: Comment[];
  addComment: (taskId: string, author: string, body: string) => void;
  deleteComment: (id: string) => void;
  getForTask: (taskId: string) => Comment[];
}

export const useComments = create<CommentsStore>()(
  persist(
    (set, get) => ({
      comments: [],
      addComment: (taskId, author, body) =>
        set((s) => ({
          comments: [
            ...s.comments,
            { id: crypto.randomUUID(), taskId, author, body, createdAt: new Date().toISOString() },
          ],
        })),
      deleteComment: (id) =>
        set((s) => ({ comments: s.comments.filter((c) => c.id !== id) })),
      getForTask: (taskId) => get().comments.filter((c) => c.taskId === taskId),
    }),
    { name: 'kapi-comments' }
  )
);

/* ── Component ─────────────────────────────────────────── */
interface TaskCommentsProps {
  taskId: string;
  currentUser?: string | null;
}

export default function TaskComments({ taskId, currentUser }: TaskCommentsProps) {
  const { addComment, deleteComment, getForTask } = useComments();
  const comments = getForTask(taskId);
  const [body, setBody] = useState('');

  const handleSend = () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    addComment(taskId, currentUser ?? 'Anónimo', trimmed);
    setBody('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <MessageSquare size={14} className="text-indigo-500" />
        Comentarios
        {comments.length > 0 && (
          <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded-full text-xs font-bold">
            {comments.length}
          </span>
        )}
      </div>

      {/* Comment list */}
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {comments.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-start gap-2.5 group"
            >
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {c.author.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 bg-gray-50 rounded-xl px-3 py-2">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold text-gray-700 truncate">{c.author}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-gray-400">
                      {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true, locale: es })}
                    </span>
                    <button
                      onClick={() => deleteComment(c.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{c.body}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {comments.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-3">Sin comentarios aún</p>
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Agregar comentario..."
          className="input py-2 flex-1 text-sm"
        />
        <button
          onClick={handleSend}
          disabled={!body.trim()}
          className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
