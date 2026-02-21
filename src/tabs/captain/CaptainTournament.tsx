// src/tabs/captain/CaptainTournament.tsx
import React from 'react';
import { Group, Card, CardGrid, Title, Text, Div } from '@vkontakte/vkui';
import { Icon28Users3Outline, Icon28CalendarOutline, Icon28GraphOutline } from '@vkontakte/icons';

interface CaptainTournamentProps {
  tournament: any;
  user: any;
  onNavigate: (view: string, panel: string) => void;
  onSnackbar: (message: string) => void;
  onBack: () => void;
}

const CaptainTournament = ({ tournament, user, onNavigate, onSnackbar, onBack }: CaptainTournamentProps) => {
  const handleViewRoster = () => {
    onNavigate('main', 'team-roster');
  };

  const handleViewSchedule = () => {
    onNavigate('main', 'match-schedule');
  };

  const handleViewCompleted = () => {
    onNavigate('main', 'completed-matches');
  };

  return (
    <div style={{ padding: '0 16px' }}>
      <Div style={{ 
        textAlign: 'center', 
        padding: '24px 0',
        background: 'linear-gradient(135deg, #0077ff 0%, #0052cc 100%)',
        color: 'white',
        borderRadius: '16px',
        marginBottom: '24px'
      }}>
        <Title level="1" style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
          {tournament?.name || 'Команда'}
        </Title>
        <Text style={{ fontSize: '16px', opacity: 0.9 }}>
          {tournament?.type === 'league' ? 'Чемпионат' : 'Кубок'}
        </Text>
      </Div>

      <Group header="Управление командой">
        <CardGrid size="s">
          <Card mode="shadow" onClick={handleViewRoster}>
            <Div style={{ padding: '20px', textAlign: 'center' }}>
              <Icon28Users3Outline width={32} height={32} style={{ marginBottom: '12px', color: 'var(--vkui--color_icon_accent)' }} />
              <Title level="3" style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                Состав команды
              </Title>
              <Text style={{ color: 'var(--vkui--color_text_secondary)', fontSize: '14px' }}>
                Игроки и логотип
              </Text>
            </Div>
          </Card>
          <Card mode="shadow" onClick={handleViewSchedule}>
            <Div style={{ padding: '20px', textAlign: 'center' }}>
              <Icon28CalendarOutline width={32} height={32} style={{ marginBottom: '12px', color: 'var(--vkui--color_icon_accent)' }} />
              <Title level="3" style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                Расписание
              </Title>
              <Text style={{ color: 'var(--vkui--color_text_secondary)', fontSize: '14px' }}>
                Предстоящие матчи
              </Text>
            </Div>
          </Card>
          <Card mode="shadow" onClick={handleViewCompleted}>
            <Div style={{ padding: '20px', textAlign: 'center' }}>
              <Icon28GraphOutline width={32} height={32} style={{ marginBottom: '12px', color: 'var(--vkui--color_icon_accent)' }} />
              <Title level="3" style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                Результаты
              </Title>
              <Text style={{ color: 'var(--vkui--color_text_secondary)', fontSize: '14px' }}>
                Завершённые матчи
              </Text>
            </Div>
          </Card>
        </CardGrid>
      </Group>

      <Group header="Информация о турнире">
        <Div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <Text style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Формат игры</Text>
            <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
              {tournament?.format === 'football11' ? 'Футбол 11×11' :
               tournament?.format === 'mini8' ? 'Мини-футбол 8×8' :
               tournament?.format === 'futsal' ? 'Футзал 5×5' : 'Не указан'}
            </Text>
          </div>
          <div>
            <Text style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>День матчей</Text>
            <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
              {tournament?.matchDay || 'Любой день'}
            </Text>
          </div>
          {tournament?.type === 'league' && (
            <div>
              <Text style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Система очков</Text>
              <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
                Победа: {tournament?.winPoints || 3} • Ничья: {tournament?.drawPoints || 1} • Поражение: {tournament?.lossPoints || 0}
              </Text>
            </div>
          )}
        </Div>
      </Group>
    </div>
  );
};

export default CaptainTournament;

