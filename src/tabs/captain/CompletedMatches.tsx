// src/tabs/captain/CompletedMatches.tsx
import React from 'react';
import { Group, Div, Text } from '@vkontakte/vkui';
import { Icon28GraphOutline } from '@vkontakte/icons';

interface CompletedMatchesProps {
  tournament: any;
  user: any;
  onSnackbar: (message: string) => void;
}

const CompletedMatches = ({ tournament, user, onSnackbar }: CompletedMatchesProps) => {
  return (
    <Div style={{ padding: '16px' }}>
      <Group header="Завершённые матчи">
        <Div style={{ textAlign: 'center', padding: '32px 0' }}>
          <Icon28GraphOutline width={48} height={48} style={{ color: 'var(--vkui--color_icon_secondary)', marginBottom: '16px' }} />
          <Text style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
            Результаты будут доступны позже
          </Text>
          <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
            После завершения матчей здесь появятся результаты
          </Text>
        </Div>
      </Group>
    </Div>
  );
};

export default CompletedMatches;

