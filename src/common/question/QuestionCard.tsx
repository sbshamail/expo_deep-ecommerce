import { View } from 'react-native';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import { Spacing } from '@/constants/theme';
import { formatDate } from '@/lib/format';
import { ShopQuestionRead } from '@/types/shop_types';

export default function QuestionCard({
  question,
  onAnswer,
  onDelete,
}: {
  question: ShopQuestionRead;
  onAnswer: () => void;
  onDelete: () => void;
}) {
  return (
    <Card>
      <Text variant="small" color="mutedForeground" numberOfLines={1}>
        {question.product_name ?? 'Product'} · {formatDate(question.created_at)}
      </Text>
      <Text style={{ fontWeight: '600' }}>{question.question}</Text>
      <Text variant="small" color="mutedForeground">
        Asked by {question.author_name}
      </Text>
      {question.answer ? (
        <View style={{ marginTop: Spacing.xs }}>
          <Text variant="small" color="success" style={{ fontWeight: '600' }}>
            Your answer
          </Text>
          <Text>{question.answer}</Text>
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs }}>
        <Button
          title={question.answer ? 'Edit answer' : 'Answer'}
          variant={question.answer ? 'outline' : 'primary'}
          onPress={onAnswer}
          style={{ flex: 1, paddingVertical: 10 }}
        />
        <Button title="Delete" variant="outline" onPress={onDelete} style={{ paddingVertical: 10, paddingHorizontal: 16 }} />
      </View>
    </Card>
  );
}
