import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { ResourceId } from '@/core/api/ResourceId'
import { ResourceQuery } from '@/core/query/ResourceQuery'
import { createResourceService } from '@/core/service/ResourceService'
import { NoteApi } from '@/features/note/note.api'
import { noteResource } from '@/features/note/note.resource'

const noteApi = new NoteApi(noteResource)
const noteQuery = new ResourceQuery(noteApi)

const resourceService = createResourceService(noteQuery)

function useTogglePinned() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: ResourceId) => noteApi.togglePinned(id),

    onSuccess: async (_, id) => {
      await noteQuery.invalidateResource(queryClient, id)
    },
  })
}

export const noteService = {
  ...resourceService,
  useTogglePinned,
}
