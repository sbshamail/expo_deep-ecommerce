import { ShopQuestionRead } from '@/types/shop_types';

import { apiFetch, apiList } from './client';

export type QuestionStatus = 'unanswered' | 'answered' | 'all';

export const listQuestions = (token: string, status: QuestionStatus) => {
  const q = new URLSearchParams({
    limit: '200',
    sort: JSON.stringify(['created_at', 'desc']),
  });
  if (status !== 'all') q.set('status', status);
  return apiList<ShopQuestionRead>(`/question/list?${q}`, { token });
};

export const answerQuestion = (token: string, id: number, answer: string) =>
  apiFetch<ShopQuestionRead>(`/question/answer/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ answer }),
    token,
  });

export const deleteQuestion = (token: string, id: number) =>
  apiFetch<unknown>(`/question/delete/${id}`, { method: 'DELETE', token });
