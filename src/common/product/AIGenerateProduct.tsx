import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { View } from 'react-native';

import { AIProductSuggestion, generateProduct } from '@/api/ai';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Text from '@/components/ui/Text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/providers/theme/ThemeProvider';

/**
 * "Generate with AI" panel — a product page URL (+ optional notes) goes to the
 * n8n import automation; the extracted suggestion is handed to `onApply` to
 * drop into the form for review. Nothing is saved here.
 */
export default function AIGenerateProduct({
  onApply,
}: {
  onApply: (suggestion: AIProductSuggestion) => void;
}) {
  const { colors } = useTheme();
  const [url, setUrl] = useState('');
  const [prompt, setPrompt] = useState(
    'Act as an expert e-commerce copywriter and technical SEO specialist.',
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      onApply(await generateProduct(url.trim(), prompt.trim()));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't generate product details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ borderStyle: 'dashed' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
        <Ionicons name="sparkles" size={18} color={colors.primary} />
        <Text style={{ fontWeight: '700' }}>Generate with AI</Text>
      </View>
      <Text variant="small" color="mutedForeground">
        Paste a product page URL — the automation scrapes it and fills in the fields below (including images) for you
        to review before saving.
      </Text>
      <Input
        value={url}
        onChangeText={setUrl}
        placeholder="https://example.com/products/…"
        keyboardType="url"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Input
        value={prompt}
        onChangeText={setPrompt}
        placeholder="Optional notes, e.g. don't send images or tags"
        multiline
        style={{ minHeight: 60, textAlignVertical: 'top' }}
      />
      {error ? (
        <Text variant="small" color="destructive">
          {error}
        </Text>
      ) : null}
      <Button title="Generate" loading={loading} disabled={!url.trim()} onPress={generate} />
    </Card>
  );
}
