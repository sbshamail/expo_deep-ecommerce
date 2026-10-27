import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, View } from 'react-native';

import { answerQuestion } from '@/api/questions';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Text from '@/components/ui/Text';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/providers/auth/AuthProvider';
import { useTheme } from '@/providers/theme/ThemeProvider';
import { ShopQuestionRead } from '@/types/shop_types';

/** Bottom sheet to write (or edit) the answer to one question. */
export default function AnswerSheet({
  question,
  onClose,
  onAnswered,
}: {
  question: ShopQuestionRead | null;
  onClose: () => void;
  onAnswered: (q: ShopQuestionRead) => void;
}) {
  const { token } = useAuth();
  const { colors } = useTheme();
  const [answer, setAnswer] = useState('');
  const [prevId, setPrevId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset the draft whenever a different question opens (render-time sync).
  const id = question?.id ?? null;
  if (id !== prevId) {
    setPrevId(id);
    setAnswer(question?.answer ?? '');
    setError(null);
  }

  const submit = async () => {
    if (!question || !token) return;
    const text = answer.trim();
    if (!text) return setError('Write an answer first.');
    setSaving(true);
    setError(null);
    try {
      const updated = await answerQuestion(token, question.id, text);
      // The response has no product_name — keep the row's own.
      onAnswered({ ...question, ...updated });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save the answer.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={question !== null} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'flex-end' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={{ flex: 1, backgroundColor: '#00000066' }} onPress={onClose} />
        <View
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: Radius.lg,
            borderTopRightRadius: Radius.lg,
            padding: Spacing.md,
            gap: Spacing.sm + 4,
          }}>
          <Text variant="heading">{question?.answer ? 'Edit answer' : 'Answer question'}</Text>
          {question?.product_name ? (
            <Text variant="small" color="mutedForeground">
              About: {question.product_name}
            </Text>
          ) : null}
          <View style={{ backgroundColor: colors.muted, borderRadius: Radius.md, padding: Spacing.sm + 4 }}>
            <Text>{question?.question}</Text>
            <Text variant="small" color="mutedForeground">
              — {question?.author_name}
            </Text>
          </View>
          <Input
            placeholder="Type your answer…"
            value={answer}
            onChangeText={setAnswer}
            multiline
            autoFocus
            style={{ minHeight: 100, textAlignVertical: 'top' }}
          />
          {error ? (
            <Text variant="small" color="destructive">
              {error}
            </Text>
          ) : null}
          <Button title="Send answer" loading={saving} onPress={submit} />
          <Button variant="outline" title="Cancel" disabled={saving} onPress={onClose} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
