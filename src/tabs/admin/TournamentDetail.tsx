// src/tabs/admin/TournamentDetail.tsx
import React from 'react';
import { Group, Div, Button, Text } from '@vkontakte/vkui';

interface TournamentDetailProps {
  tournament: any;
  onNavigate: (view: string, panel: string) => void;
  onSnackbar: (message: string) => void;
  onBack: () => void;
}

const TournamentDetail = ({ tournament, onNavigate, onSnackbar, onBack }: TournamentDetailProps) => {
  return (
    <Div style={{ padding: '16px' }}>
      <Group header="Детали турнира">
        <Div>
          <Text style={{ marginBottom: '8px' }}>
            <strong>Название:</strong> {tournament?.name || 'Не указано'}
          </Text>
          <Text style={{ marginBottom: '8px' }}>
            <strong>Тип:</strong> {tournament?.type === 'league' ? 'Чемпионат' : 'Кубок'}
          </Text>
          <Text style={{ marginBottom: '8px' }}>
            <strong>Сезон:</strong> {tournament?.season || 'Не указан'}
          </Text>
          <Text>
            <strong>Формат:</strong> {tournament?.format || 'Не указан'}
          </Text>
        </Div>
      </Group>
      
      <Button 
        size="l" 
        mode="primary" 
        onClick={() => onNavigate('main', 'admin-dashboard')}
        style={{ marginTop: '16px', width: '100%' }}
      >
        Назад к турнирам
      </Button>
    </Div>
  );
};

export default TournamentDetail;

