import { ResourceApi } from '@/core/api/ResourceApi'
import { ResourceQuery } from '@/core/query/ResourceQuery'
import { createResourceService } from '@/core/service/ResourceService'
import { todoResource } from '@/features/todo/todo.resource'

const todoApi = new ResourceApi(todoResource)
const todoQuery = new ResourceQuery(todoApi)

export const todoService = createResourceService(todoQuery)
