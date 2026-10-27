import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, View } from 'react-native';

import { deleteQuestion, listQuestions, QuestionStatus } from '@/api/questions';
import AnswerSheet from '@/common/question/AnswerSheet';
import QuestionCard from '@/common/question/QuestionCard';
import Chips from '@/components/ui/Chips';
import { EmptyState, ErrorBanner } from '@/components/ui/Notice';
import { Spacing } from '@/constants/theme';
import { useFetch } from '@/hooks/useFetch';
import { useAuth } from '@/providers/auth/AuthProvider';
import { ShopQuestionRead } from '@/types/shop_types';

export default function QuestionsScreen() {
  const { token } = useAuth();
  const [status, setStatus] = useState<QuestionStatus>('unanswered');
  const [active, setActive] = useState<ShopQuestionRead | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, error, loading, refreshing, reload, silentReload } = useFetch(
    (t) => listQuestions(t, status),
    status,
  );

  const confirmDelete = (q: ShopQuestionRead) =>
    Alert.alert('Delete this question?', 'It will also disappear from the product page.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!token) return;
          try {
            await deleteQuestion(token, q.id);
            silentReload();
          } catch (e) {
            setActionError(e instanceof Error ? e.message : 'Could not delete the question.');
          }
        },
      },
    ]);

  return (
    <View style={{ flex: 1 }}>
      <Chips
        value={status}
        onChange={setStatus}
        options={[
          { value: 'unanswered', label: 'Unanswered' },
          { value: 'answered', label: 'Answered' },
          { value: 'all', label: 'All' },
        ]}
      />
      <ErrorBanner message={actionError ?? error} />
      {loading ? (
        <ActivityIndicator style={{ marginTop: Spacing.xl }} />
      ) : (
        <FlatList
          data={data?.data ?? []}
          keyExtractor={(q) => String(q.id)}
          onRefresh={reload}
          refreshing={refreshing}
          contentContainerStyle={{ padding: Spacing.md, paddingTop: Spacing.xs, gap: Spacing.sm }}
          renderItem={({ item }) => (
            <QuestionCard question={item} onAnswer={() => setActive(item)} onDelete={() => confirmDelete(item)} />
          )}
          ListEmptyComponent={
            error ? undefined : (
              <EmptyState
                title={status === 'unanswered' ? 'No questions waiting' : 'No questions'}
                hint="Customers' product questions appear here."
              />
            )
          }
        />
      )}
      <AnswerSheet
        question={active}
        onClose={() => setActive(null)}
        onAnswered={() => {
          setActive(null);
          silentReload();
        }}
      />
    </View>
  );
}
