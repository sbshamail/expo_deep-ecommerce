import { BlogListRead, BlogRead, MediaRead } from '@/types/shop_types';

import { apiFetch, apiList } from './client';

export const listBlogs = (token: string) =>
  apiList<BlogListRead>(
    `/blog/list?${new URLSearchParams({
      limit: '200',
      sort: JSON.stringify(['created_at', 'desc']),
    })}`,
    { token },
  );

export const readBlog = (token: string, id: number | string) =>
  apiFetch<BlogRead>(`/blog/read/${id}`, { token });

export interface BlogPayload {
  content: string;
  /** Uploaded media filename; null clears the cover. */
  cover_image: string | null;
  /** null removes the video. */
  video_url: string | null;
}

export const saveBlog = (token: string, id: number | null, body: BlogPayload) =>
  apiFetch<BlogRead>(id ? `/blog/update/${id}` : '/blog/create', {
    method: id ? 'PUT' : 'POST',
    body: JSON.stringify(body),
    token,
  });

export const deleteBlog = (token: string, id: number) =>
  apiFetch<unknown>(`/blog/delete/${id}`, { method: 'DELETE', token });

/** Generic media upload — the blog stores only the returned filename. */
export const uploadMedia = async (token: string, form: FormData) => {
  const media = await apiFetch<MediaRead[]>('/media/create', {
    method: 'POST',
    body: form,
    token,
  });
  if (!media?.[0]) throw new Error('Image upload failed');
  return media[0];
};
