interface NotesEditorProps {
  notes: string;
  onChange: (notes: string) => void;
  onSave: () => void;
}

export default function NotesEditor({ notes, onChange, onSave }: NotesEditorProps) {
  return (
    <div className="bg-white shadow rounded p-4">
      <h2 className="text-xl font-semibold mb-2">Notes</h2>
      <textarea
        className="w-full border rounded p-2"
        rows={5}
        value={notes}
        onChange={e => onChange(e.target.value)}
      />
      <button
        className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={onSave}
      >
        Save Notes
      </button>
    </div>
  );
}
