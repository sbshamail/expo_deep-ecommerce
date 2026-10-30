import { router, Stack } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert } from "react-native";

import { AIProductSuggestion } from "@/api/ai";
import { flattenTree, listCategoryTree } from "@/api/categories";
import { ApiError } from "@/api/client";
import { deleteProduct, readProduct, saveProduct } from "@/api/products";
import Button from "@/components/ui/Button";
import { Section, ToggleRow } from "@/components/ui/Field";
import FormScreen from "@/components/ui/FormScreen";
import ImagePickerField, { ImageItem } from "@/components/ui/ImagePickerField";
import Input from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/Notice";
import RichTextField from "@/components/ui/RichTextField";
import SelectField from "@/components/ui/SelectField";
import { Spacing } from "@/constants/theme";
import { appendImage } from "@/lib/images";
import { useAuth } from "@/providers/auth/AuthProvider";
import {
  CategoryTreeNode,
  ProductSingleRead,
  ProductVariantRead,
} from "@/types/shop_types";

import AIGenerateProduct from "./AIGenerateProduct";
import VariantEditor, { newVariant, VariantDraft } from "./VariantEditor";

const MAX_IMAGES = 5;

const toDraft = (p: ProductVariantRead): VariantDraft => ({
  ...newVariant(),
  id: p.id,
  price: p.price != null ? String(p.price) : "",
  discount: p.discount_price != null ? String(p.discount_price) : "",
  stock: String(p.stock),
  sku: p.sku ?? "",
  attrs: Object.entries(p.attributes ?? {}).map(([name, value]) => ({
    name,
    value,
  })),
  image: p.image ? [{ uri: p.image.original, filename: p.image.filename }] : [],
});

// An image with no file and no stored filename is an external URL (the AI
// import) that the backend downloads itself on save.
const isRemote = (i?: ImageItem) =>
  !!i && !i.file && !i.filename && i.uri.startsWith("http");

const isNum = (v: string) =>
  v.trim() !== "" && !Number.isNaN(Number(v)) && Number(v) >= 0;

/** Create (`productId` = "new") and edit in one screen. */
export default function ProductForm({ productId }: { productId: string }) {
  const { token, user, canInShop } = useAuth();
  const editing = productId !== "new";

  const [original, setOriginal] = useState<ProductSingleRead | null>(null);
  const [categories, setCategories] = useState<CategoryTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [thumbnail, setThumbnail] = useState<ImageItem[]>([]);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [tags, setTags] = useState("");
  // Not editable on mobile, but the AI import can fill them and the update
  // endpoint overwrites anything it receives, so they're kept in state.
  const [whatsInBox, setWhatsInBox] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [variants, setVariants] = useState<VariantDraft[]>(() => [
    newVariant(),
  ]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const [tree, product] = await Promise.all([
          listCategoryTree(),
          editing ? readProduct(token, productId) : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setCategories(tree);
        if (product) {
          setOriginal(product);
          setName(product.name);
          setShortDescription(product.short_description ?? "");
          setDescription(product.description ?? "");
          setCategoryId(product.category?.id ?? null);
          setTags((product.tags ?? []).join(", "));
          setWhatsInBox(product.whats_in_box ?? "");
          setMetaTitle(product.meta_title ?? "");
          setMetaDescription(product.meta_description ?? "");
          setVideoUrl(product.video_url ?? "");
          setIsActive(product.is_active);
          setIsFeatured(product.is_featured);
          setThumbnail(
            product.thumbnail
              ? [
                  {
                    uri: product.thumbnail.original,
                    filename: product.thumbnail.filename,
                  },
                ]
              : [],
          );
          setImages(
            (product.images ?? []).map((m) => ({
              uri: m.original,
              filename: m.filename,
            })),
          );
          setVariants(
            product.variants?.length
              ? product.variants.map(toDraft)
              : [newVariant()],
          );
        }
      } catch (e) {
        if (!cancelled)
          setLoadError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, editing, productId]);

  // The backend only accepts a last-level category on a product.
  const categoryOptions = useMemo(
    () =>
      flattenTree(categories).map(({ node, depth }) => ({
        value: node.id,
        label: node.name,
        depth,
        disabled: node.children.length > 0,
      })),
    [categories],
  );

  const validate = (): string | null => {
    if (name.trim().length < 2) return "Enter the product name.";
    if (!categoryId) return "Pick a category.";
    for (const [i, v] of variants.entries()) {
      const label = variants.length > 1 ? `Variant ${i + 1}: ` : "";
      if (!isNum(v.price)) return `${label}enter a valid price.`;
      if (!isNum(v.stock))
        return `${label}enter the stock quantity (0 or more).`;
      if (
        v.discount.trim() &&
        (!isNum(v.discount) || Number(v.discount) >= Number(v.price))
      )
        return `${label}sale price must be lower than the price.`;
      if (v.attrs.some((a) => !a.name.trim() !== !a.value.trim()))
        return `${label}fill both the option and its value (or remove the row).`;
    }
    return null;
  };

  const submit = async () => {
    const problem = validate();
    if (problem) return setError(problem);
    if (!token) return;
    setError(null);
    setSaving(true);

    const form = new FormData();
    form.append("name", name.trim());
    form.append("short_description", shortDescription.trim());
    form.append("description", description.trim());
    form.append("whats_in_box", whatsInBox);
    form.append("meta_title", metaTitle);
    form.append("meta_description", metaDescription);
    form.append("video_url", videoUrl);
    form.append("is_active", String(isActive));
    form.append("is_featured", String(isFeatured));
    form.append("category_id", String(categoryId));
    form.append(
      "tags",
      JSON.stringify(
        tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      ),
    );

    // Array order IS the variant position; the id marks an existing variant,
    // omitted variants are deleted by the backend.
    form.append(
      "variant_data",
      JSON.stringify(
        variants.map((v) => ({
          id: v.id,
          price: Number(v.price),
          discount_price: v.discount.trim() ? Number(v.discount) : null,
          stock: Math.floor(Number(v.stock)),
          sku: v.sku.trim() || null,
          ...(isRemote(v.image[0]) ? { image: v.image[0].uri } : {}),
          attributes: Object.fromEntries(
            v.attrs
              .filter((a) => a.name.trim())
              .map((a) => [a.name.trim(), a.value.trim()]),
          ),
        })),
      ),
    );
    variants.forEach((v, i) => {
      if (v.image[0]?.file)
        appendImage(form, `variant_image_${i}`, v.image[0].file);
    });

    if (thumbnail[0]?.file) appendImage(form, "thumbnail", thumbnail[0].file);
    else if (isRemote(thumbnail[0])) form.append("thumbnail", thumbnail[0].uri);
    for (const img of images) {
      if (img.file) appendImage(form, "images", img.file);
      else if (isRemote(img)) form.append("images", img.uri);
    }
    // Stored images the user removed are deleted by filename.
    const kept = new Set(images.map((i) => i.filename).filter(Boolean));
    for (const m of original?.images ?? []) {
      if (!kept.has(m.filename)) form.append("delete_images", m.filename);
    }

    try {
      await saveProduct(token, editing ? Number(productId) : null, form);
      router.back();
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "Could not save the product.",
      );
      setSaving(false);
    }
  };

  // Drops an AI suggestion into the form; only fields it actually found are
  // touched, and it all stays editable before saving.
  const applySuggestion = (s: AIProductSuggestion) => {
    if (s.name) setName(s.name);
    if (s.short_description) setShortDescription(s.short_description);
    if (s.description) setDescription(s.description);
    if (s.whats_in_box) setWhatsInBox(s.whats_in_box);
    if (s.meta_title) setMetaTitle(s.meta_title);
    if (s.meta_description) setMetaDescription(s.meta_description);
    if (s.video_url) setVideoUrl(s.video_url);
    if (s.tags?.length) setTags(s.tags.join(", "));
    if (s.thumbnail) setThumbnail([{ uri: s.thumbnail }]);
    if (s.images?.length)
      setImages(s.images.slice(0, MAX_IMAGES).map((uri) => ({ uri })));
    if (s.variants?.length) {
      setVariants(
        s.variants.map((v) => ({
          ...newVariant(),
          price: v.price != null ? String(v.price) : "1",
          discount: v.discount_price != null ? String(v.discount_price) : "",
          stock: v.stock != null ? String(v.stock) : "1",
          sku: v.sku ?? "",
          image: v.image ? [{ uri: v.image }] : [],
        })),
      );
    }
  };

  const confirmDelete = () =>
    Alert.alert(
      "Delete product?",
      `"${name}" and all its variants will be removed. This can't be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!token) return;
            setSaving(true);
            try {
              await deleteProduct(token, Number(productId));
              router.back();
            } catch (e) {
              setError(
                e instanceof Error
                  ? e.message
                  : "Could not delete the product.",
              );
              setSaving(false);
            }
          },
        },
      ],
    );

  if (loading) return <ActivityIndicator style={{ marginTop: Spacing.xl }} />;
  if (loadError)
    return <EmptyState title="Couldn't load the product" hint={loadError} />;

  const shopId = user?.default_shop_id;
  const readOnly = editing
    ? !canInShop(shopId, "product:update")
    : !canInShop(shopId, "product:create");

  return (
    <FormScreen
      error={error}
      footer={
        <>
          {!readOnly ? (
            <Button
              title={editing ? "Save changes" : "Create product"}
              loading={saving}
              onPress={submit}
            />
          ) : null}
          {editing && canInShop(shopId, "product:delete") ? (
            <Button
              variant="outline"
              title="Delete product"
              disabled={saving}
              onPress={confirmDelete}
            />
          ) : null}
        </>
      }
    >
      <Stack.Screen
        options={{ title: editing ? "Edit product" : "New product" }}
      />

      {!readOnly ? <AIGenerateProduct onApply={applySuggestion} /> : null}

      <Section title="Photos">
        <ImagePickerField
          label="Main photo"
          items={thumbnail}
          onChange={setThumbnail}
          size={96}
        />
        <ImagePickerField
          label={`More photos (up to ${MAX_IMAGES})`}
          items={images}
          onChange={setImages}
          max={MAX_IMAGES}
        />
      </Section>

      <Section title="Basics">
        <Input label="Name *" value={name} onChangeText={setName} />
        <SelectField
          label="Category *"
          placeholder="Choose a category"
          options={categoryOptions}
          value={categoryId}
          onChange={setCategoryId}
        />
        <RichTextField
          label="Short description"
          value={shortDescription}
          onChange={setShortDescription}
          placeholder="Short description"
          minHeight={70}
        />
        <RichTextField
          label="Full description"
          value={description}
          onChange={setDescription}
          placeholder="Product description"
          minHeight={140}
        />
        <Input
          label="Tags (comma separated)"
          value={tags}
          onChangeText={setTags}
          autoCapitalize="none"
        />
      </Section>

      <Section title="Price & stock">
        {variants.map((v, i) => (
          <VariantEditor
            key={v.key}
            index={i}
            variant={v}
            onChange={(next) =>
              setVariants(variants.map((x) => (x.key === v.key ? next : x)))
            }
            onRemove={
              variants.length > 1
                ? () => setVariants(variants.filter((x) => x.key !== v.key))
                : undefined
            }
          />
        ))}
        <Button
          variant="outline"
          title="+ Add another variant"
          onPress={() => setVariants([...variants, newVariant()])}
        />
      </Section>

      <Section title="Visibility">
        <ToggleRow
          label="Visible to customers"
          hint="Turn off to hide it from the store"
          value={isActive}
          onValueChange={setIsActive}
        />
        <ToggleRow
          label="Featured"
          hint="Highlight on the storefront"
          value={isFeatured}
          onValueChange={setIsFeatured}
        />
      </Section>
    </FormScreen>
  );
}
