import { router, Stack } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';

import { deleteCategory, flattenTree, listCategoryTree, saveCategory } from '@/api/categories';
import Button from '@/components/ui/Button';
import { ToggleRow } from '@/components/ui/Field';
import FormScreen from '@/components/ui/FormScreen';
import ImagePickerField, { ImageItem } from '@/components/ui/ImagePickerField';
import Input from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/Notice';
import SelectField from '@/components/ui/SelectField';
import { Spacing } from '@/constants/theme';
import { appendImage } from '@/lib/images';
import { useAuth } from '@/providers/auth/AuthProvider';
import { CategoryTreeNode } from '@/types/shop_types';

const TOP_LEVEL = 0;

const collectIds = (node: CategoryTreeNode): number[] => [node.id, ...node.children.flatMap(collectIds)];

/** Create (`categoryId` = "new") and edit in one screen. */
export default function CategoryForm({ categoryId }: { categoryId: string }) {
  const { token, can } = useAuth();
  const editing = categoryId !== 'new';

  const [tree, setTree] = useState<CategoryTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [details, setDetails] = useState('');
  const [parentId, setParentId] = useState<number>(TOP_LEVEL);
  const [isActive, setIsActive] = useState(true);
  const [image, setImage] = useState<ImageItem[]>([]);
  const [originalParent, setOriginalParent] = useState<number>(TOP_LEVEL);

  useEffect(() => {
    let cancelled = false;
    listCategoryTree()
      .then((nodes) => {
        if (cancelled) return;
        setTree(nodes);
        if (!editing) return;
        const node = flattenTree(nodes).find((r) => r.node.id === Number(categoryId))?.node;
        if (!node) return setLoadError('Category not found');
        setName(node.name);
        setDetails(node.details ?? '');
        setParentId(node.parent_id ?? TOP_LEVEL);
        setOriginalParent(node.parent_id ?? TOP_LEVEL);
        setIsActive(node.is_active);
        setImage(node.image ? [{ uri: node.image.original, filename: node.image.filename }] : []);
      })
      .catch((e) => !cancelled && setLoadError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [editing, categoryId]);

  // A category can't become its own parent, or a child of its own descendants.
  const parentOptions = useMemo(() => {
    const flat = flattenTree(tree);
    const blocked = new Set(
      editing ? collectIds(flat.find((r) => r.node.id === Number(categoryId))?.node ?? ({ id: -1, children: [] } as unknown as CategoryTreeNode)) : [],
    );
    return [
      { value: TOP_LEVEL, label: 'None (top level)' },
      ...flat.filter((r) => !blocked.has(r.node.id)).map((r) => ({ value: r.node.id, label: r.node.name, depth: r.depth + 1 })),
    ];
  }, [tree, editing, categoryId]);

  const submit = async () => {
    if (name.trim().length < 2) return setError('Enter the category name.');
    if (!token) return;
    setError(null);
    setSaving(true);

    const form = new FormData();
    form.append('name', name.trim());
    form.append('details', details.trim());
    form.append('is_active', String(isActive));
    if (!editing && parentId !== TOP_LEVEL) form.append('parent_id', String(parentId));
    // On update only send a changed parent (0 = move to top level).
    if (editing && parentId !== originalParent) form.append('parent_id', String(parentId));
    if (image[0]?.file) appendImage(form, 'image', image[0].file);

    try {
      await saveCategory(token, editing ? Number(categoryId) : null, form);
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the category.');
      setSaving(false);
    }
  };

  const confirmDelete = () =>
    Alert.alert('Delete category?', `"${name}" will be removed. Products in it may need a new category.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!token) return;
          setSaving(true);
          try {
            await deleteCategory(token, Number(categoryId));
            router.back();
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Could not delete the category.');
            setSaving(false);
          }
        },
      },
    ]);

  if (loading) return <ActivityIndicator style={{ marginTop: Spacing.xl }} />;
  if (loadError) return <EmptyState title="Couldn't load the category" hint={loadError} />;

  return (
    <FormScreen
      error={error}
      footer={
        <>
          <Button title={editing ? 'Save changes' : 'Create category'} loading={saving} onPress={submit} />
          {editing && can('category:delete') ? (
            <Button variant="outline" title="Delete category" disabled={saving} onPress={confirmDelete} />
          ) : null}
        </>
      }>
      <Stack.Screen options={{ title: editing ? 'Edit category' : 'New category' }} />
      <ImagePickerField label="Image" items={image} onChange={setImage} size={96} />
      <Input label="Name *" value={name} onChangeText={setName} />
      <SelectField label="Parent category" options={parentOptions} value={parentId} onChange={setParentId} />
      <Input
        label="Description"
        value={details}
        onChangeText={setDetails}
        multiline
        style={{ minHeight: 90, textAlignVertical: 'top' }}
      />
      <ToggleRow label="Visible to customers" value={isActive} onValueChange={setIsActive} />
    </FormScreen>
  );
}
