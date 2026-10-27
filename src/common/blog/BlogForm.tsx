import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';

import { deleteBlog, readBlog, saveBlog, uploadMedia } from '@/api/blogs';
import Button from '@/components/ui/Button';
import FormScreen from '@/components/ui/FormScreen';
import ImagePickerField, { ImageItem } from '@/components/ui/ImagePickerField';
import Input from '@/components/ui/Input';
import { EmptyState, ErrorBanner } from '@/components/ui/Notice';
import Text from '@/components/ui/Text';
import { Spacing } from '@/constants/theme';
import { htmlToText, textToHtml } from '@/lib/format';
import { appendImage } from '@/lib/images';
import { useAuth } from '@/providers/auth/AuthProvider';

// Formatting the plain-text editor can't represent (it would be flattened on save).
const RICH = /<(img|ul|ol|a|table|blockquote|iframe|strong|em)\b/i;

/** Create (`blogId` = "new") and edit in one screen. Plain text → paragraphs. */
export default function BlogForm({ blogId }: { blogId: string }) {
  const { token } = useAuth();
  const editing = blogId !== 'new';

  const [loading, setLoading] = useState(editing);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRich, setHasRich] = useState(false);

  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [cover, setCover] = useState<ImageItem[]>([]);

  useEffect(() => {
    if (!editing || !token) return;
    let cancelled = false;
    readBlog(token, blogId)
      .then((blog) => {
        if (cancelled) return;
        setContent(htmlToText(blog.content));
        setHasRich(RICH.test(blog.content));
        setVideoUrl(blog.video?.url ?? '');
        setCover(blog.cover_image ? [{ uri: blog.cover_image.original, filename: blog.cover_image.filename }] : []);
      })
      .catch((e) => !cancelled && setLoadError(e instanceof Error ? e.message : 'Failed to load the post'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [editing, blogId, token]);

  const submit = async () => {
    if (!token) return;
    const url = videoUrl.trim();
    if (url && !/^https?:\/\//i.test(url)) return setError('Paste the full video link, starting with https://');
    if (!content.trim() && !cover.length && !url) return setError('Write something, or add a cover image or a video link.');
    setError(null);
    setSaving(true);
    try {
      let coverFilename: string | null = cover[0]?.filename ?? null;
      if (cover[0]?.file) {
        const form = new FormData();
        appendImage(form, 'files', cover[0].file);
        coverFilename = (await uploadMedia(token, form)).filename;
      }
      await saveBlog(token, editing ? Number(blogId) : null, {
        content: textToHtml(content),
        cover_image: coverFilename,
        video_url: url || null,
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the post.');
      setSaving(false);
    }
  };

  const confirmDelete = () =>
    Alert.alert('Delete this post?', "This can't be undone.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!token) return;
          setSaving(true);
          try {
            await deleteBlog(token, Number(blogId));
            router.back();
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Could not delete the post.');
            setSaving(false);
          }
        },
      },
    ]);

  if (loading) return <ActivityIndicator style={{ marginTop: Spacing.xl }} />;
  if (loadError) return <EmptyState title="Couldn't load the post" hint={loadError} />;

  return (
    <FormScreen
      error={error}
      footer={
        <>
          <Button title={editing ? 'Save changes' : 'Publish post'} loading={saving} onPress={submit} />
          {editing ? <Button variant="outline" title="Delete post" disabled={saving} onPress={confirmDelete} /> : null}
        </>
      }>
      <Stack.Screen options={{ title: editing ? 'Edit post' : 'New post' }} />
      {hasRich ? (
        <ErrorBanner message="This post has rich formatting (images, links or bold text) from the website. Saving it here keeps only the plain text." />
      ) : null}
      <ImagePickerField label="Cover image (optional)" items={cover} onChange={setCover} size={110} />
      <Input
        label="Post"
        placeholder={'Start with a headline on the first line,\nthen write your post…'}
        value={content}
        onChangeText={setContent}
        multiline
        style={{ minHeight: 220, textAlignVertical: 'top' }}
      />
      <Text variant="small" color="mutedForeground" style={{ marginTop: -Spacing.md }}>
        The first line becomes the title. Leave a blank line between paragraphs.
      </Text>
      <Input
        label="YouTube / Vimeo link (optional)"
        value={videoUrl}
        onChangeText={setVideoUrl}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />
    </FormScreen>
  );
}
