import React from 'react';
import { StickyNote, Plus, Trash2, Check, X } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import EmptyState from './EmptyState';

/**
 * Notas Rápidas do dashboard — lembretes estilo post-it persistidos no banco
 * (tabela quick_notes). Cada gestor vê e gerencia as próprias notas.
 */
interface QuickNote {
  id: number;
  content: string;
  color: string;
  is_done: number;
  created_at: string;
}

const NOTE_COLORS: Record<string, { bg: string; border: string; pin: string }> = {
  amber:   { bg: 'bg-amber-50',   border: 'border-amber-200/80',   pin: 'bg-amber-400' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200/80', pin: 'bg-emerald-500' },
  sky:     { bg: 'bg-sky-50',     border: 'border-sky-200/80',     pin: 'bg-sky-400' },
  rose:    { bg: 'bg-rose-50',    border: 'border-rose-200/80',    pin: 'bg-rose-400' },
};
const COLOR_KEYS = Object.keys(NOTE_COLORS);

export default function QuickNotes({ userId, token }: { userId: number | null; token: string }) {
  const [notes, setNotes] = React.useState<QuickNote[]>([]);
  const [adding, setAdding] = React.useState(false);
  const [newContent, setNewContent] = React.useState('');
  const [newColor, setNewColor] = React.useState('amber');
  const [saving, setSaving] = React.useState(false);

  const authFetch = React.useCallback((url: string, options: RequestInit = {}) =>
    fetch(url, { ...options, headers: { 'Content-Type': 'application/json', 'Authorization': token, ...(options.headers || {}) } }),
  [token]);

  const load = React.useCallback(async () => {
    if (!userId) return;
    try {
      const res = await authFetch(`/api/quick-notes?userId=${userId}`);
      const data = await res.json();
      if (data.success) setNotes(data.notes || []);
    } catch { /* silencioso */ }
  }, [userId, authFetch]);

  React.useEffect(() => { load(); }, [load]);

  const addNote = async () => {
    if (!newContent.trim() || !userId) return;
    setSaving(true);
    try {
      const res = await authFetch('/api/quick-notes', {
        method: 'POST',
        body: JSON.stringify({ userId, content: newContent.trim(), color: newColor }),
      });
      const data = await res.json();
      if (data.success) {
        setNewContent('');
        setAdding(false);
        load();
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleDone = async (note: QuickNote) => {
    setNotes(prev => prev.map(n => n.id === note.id ? { ...n, is_done: n.is_done ? 0 : 1 } : n));
    await authFetch(`/api/quick-notes/${note.id}`, {
      method: 'PUT',
      body: JSON.stringify({ is_done: note.is_done ? 0 : 1 }),
    });
  };

  const removeNote = async (id: number) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    await authFetch(`/api/quick-notes/${id}`, { method: 'DELETE' });
  };

  return (
    <Card
      title="Notas Rápidas"
      subtitle="Lembretes pessoais do gestor"
      icon={StickyNote}
      actions={
        <Button size="xs" variant="gold" icon={Plus} onClick={() => setAdding(a => !a)}>
          Nova Nota
        </Button>
      }
    >
      <div className="space-y-3">
        {adding && (
          <div className="border border-dashed border-amber-300 bg-amber-50/50 rounded-2xl p-3.5 space-y-3 animate-fade-in">
            <textarea
              autoFocus
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addNote(); }}
              placeholder="Escreva um lembrete... (Ctrl+Enter salva)"
              rows={2}
              className="w-full bg-white border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 resize-none transition-all"
            />
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                {COLOR_KEYS.map(c => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    className={`w-6 h-6 rounded-lg ${NOTE_COLORS[c].pin} transition-all cursor-pointer ${
                      newColor === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'opacity-50 hover:opacity-100'
                    }`}
                    title={c}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Button size="xs" variant="ghost" icon={X} onClick={() => { setAdding(false); setNewContent(''); }}>Cancelar</Button>
                <Button size="xs" variant="primary" icon={Check} loading={saving} onClick={addNote} disabled={!newContent.trim()}>Salvar</Button>
              </div>
            </div>
          </div>
        )}

        {notes.length === 0 && !adding ? (
          <EmptyState
            icon={StickyNote}
            title="Nenhuma nota ainda"
            message="Crie lembretes rápidos que ficam salvos no banco e te esperam no próximo login."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {notes.map(note => {
              const c = NOTE_COLORS[note.color] || NOTE_COLORS.amber;
              return (
                <div
                  key={note.id}
                  className={`group relative border ${c.border} ${c.bg} rounded-2xl p-3.5 pl-4 transition-all hover:shadow-md ${note.is_done ? 'opacity-55' : ''}`}
                >
                  <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-full ${c.pin}`} />
                  <p className={`text-xs font-semibold text-slate-700 leading-relaxed whitespace-pre-wrap break-words ${note.is_done ? 'line-through' : ''}`}>
                    {note.content}
                  </p>
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-[9px] text-slate-400 font-bold font-mono uppercase">
                      {new Date(note.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleDone(note)}
                        title={note.is_done ? 'Reabrir' : 'Concluir'}
                        className="p-1.5 rounded-lg hover:bg-white text-emerald-600 transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeNote(note.id)}
                        title="Excluir"
                        className="p-1.5 rounded-lg hover:bg-white text-rose-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
