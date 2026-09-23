import type { HttpRequestOptions } from '@/core/api/HttpClient'
import { ResourceApi } from '@/core/api/ResourceApi'
import type { ResourceId } from '@/core/api/ResourceId'
import { noteResource } from '@/features/note/note.resource'

export class NoteApi extends ResourceApi<
  typeof noteResource.schema.shape,
  typeof noteResource.$options
> {
  public async togglePinned(id: ResourceId, options?: HttpRequestOptions) {
    const response = await this.httpClient.post(
      `/notes/${encodeURIComponent(String(id))}/toggle-pinned`,
      undefined,
      options,
    )

    return this.serializer.deserialize(response)
  }
}
