import { ResourceApi } from '@/core/api/ResourceApi'
import { createResourceService } from '@/core/service/ResourceService'
import { todoResource } from '@/features/todo/todo.resource'

const todoApi = new ResourceApi(todoResource)

export const todoService = createResourceService(todoApi)
