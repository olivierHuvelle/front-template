import { ResourceApi } from '@/core/api/ResourceApi'
import { createResourceService } from '@/core/service/ResourceService'
import { noteResource } from '@/features/note/note.resource'

const noteApi = new ResourceApi(noteResource)

export const noteService = createResourceService(noteApi)
