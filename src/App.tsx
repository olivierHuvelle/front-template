import { noteService } from '@/features/note/note.service'

function App() {
  const notes = noteService.useGetAll()
  const note = noteService.useGet(2)

  const createNote = noteService.useCreate()
  const updateNote = noteService.useUpdate()
  const deleteNote = noteService.useDelete()
  const togglePinned = noteService.useTogglePinned()

  if (notes.isPending || note.isPending) {
    return <div>Loading...</div>
  }

  if (notes.isError) {
    return <div>Failed to load notes: {notes.error.message}</div>
  }

  if (note.isError) {
    return <div>Failed to load note #1: {note.error.message}</div>
  }

  return (
    <main>
      <h1>Note integration</h1>

      <section>
        <h2>GET #1</h2>

        <pre>{JSON.stringify(note.data, null, 2)}</pre>
      </section>

      <section>
        <h2>CREATE</h2>

        <button
          type="button"
          disabled={createNote.isPending}
          onClick={() =>
            createNote.mutate({
              title: 'Created from React',
              content: 'Second resource integration test',
              category: 'personal',
              pinned: false,
            })
          }
        >
          {createNote.isPending ? 'Creating...' : 'Create Note'}
        </button>

        {createNote.isError && <p>Failed to create note: {createNote.error.message}</p>}

        {createNote.isSuccess && <pre>{JSON.stringify(createNote.data, null, 2)}</pre>}
      </section>

      <section>
        <h2>GET ALL / UPDATE / CUSTOM ACTION / DELETE</h2>

        {notes.data.map((item) => (
          <div key={item.id}>
            <span>
              #{item.id} — {item.title} — {item.category} — {item.pinned ? 'Pinned' : 'Not pinned'}
            </span>

            <button
              type="button"
              disabled={updateNote.isPending}
              onClick={() =>
                updateNote.mutate({
                  id: item.id,
                  data: {
                    title: `${item.title} updated`,
                  },
                })
              }
            >
              Update title
            </button>

            <button
              type="button"
              disabled={togglePinned.isPending}
              onClick={() => togglePinned.mutate(item.id)}
            >
              Toggle pinned
            </button>

            <button
              type="button"
              disabled={deleteNote.isPending}
              onClick={() => deleteNote.mutate(item.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </section>
    </main>
  )
}

export default App
