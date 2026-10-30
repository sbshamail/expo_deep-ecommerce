import * as ImagePicker from 'expo-image-picker';

/** A photo chosen from the library, not uploaded yet. */
export interface PickedImage {
  uri: string;
  name: string;
  type: string;
  width?: number;
  height?: number;
}

const toPicked = (a: ImagePicker.ImagePickerAsset): PickedImage => ({
  uri: a.uri,
  name: a.fileName ?? `photo-${Date.now()}.jpg`,
  type: a.mimeType ?? 'image/jpeg',
  width: a.width,
  height: a.height,
});

/** Opens the photo library. Resolves to [] when cancelled or denied. */
export async function pickImages(max = 1): Promise<PickedImage[]> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: max > 1,
    selectionLimit: max,
    quality: 0.8,
  });
  return result.canceled ? [] : result.assets.map(toPicked);
}

/**
 * React Native's FormData takes a { uri, name, type } object where the
 * browser takes a File/Blob — the cast is the documented way to append it.
 */
export const appendImage = (form: FormData, key: string, image: PickedImage) =>
  form.append(key, { uri: image.uri, name: image.name, type: image.type } as unknown as Blob);
