// src/tabs/PublicView.tsx
import React from 'react';
import { Group, Card, CardGrid, Title, Text, Button, Avatar, Div, Cell, Caption } from '@vkontakte/vkui';
import { Icon28CupOutline, Icon28Users3Outline, Icon28CalendarOutline, Icon28ChevronRightOutline } from '@vkontakte/icons';

interface PublicViewProps {
  onNavigate: (view: string, panel: string) => void;
  onSnackbar: (message: string) => void;
  tournaments: any[];
}

const PublicView = ({ onNavigate, onSnackbar, tournaments }: PublicViewProps) => {
  const handleLogin = () => {
    onSnackbar('Вход через VK...');
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
        <Title level="1" style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
          Футбольная лига Мирный
        </Title>
        <Text style={{ fontSize: '16px', opacity: 0.9 }}>
          Официальная система управления турнирами
        </Text>
      </Div>

      <Group>
        <Div style={{ textAlign: 'center' }}>
          <Button 
            size="l" 
            mode="primary"
            before={<Icon28Users3Outline />}
            onClick={handleLogin}
            style={{ width: '100%', marginBottom: '16px' }}
          >
            Войти через VK
          </Button>
          <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
            После входа вы увидите доступные вам функции
          </Text>
        </Div>
      </Group>

      {tournaments.length > 0 && (
        <Group header="Доступные турниры">
          <CardGrid size="s">
            {tournaments.map(tournament => (
              <Card key={tournament.id} mode="shadow">
                <Div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <Avatar size={32} fallbackIcon={<Icon28CupOutline />} />
                    <Title level="3" style={{ fontSize: '16px', fontWeight: '600' }}>
                      {tournament.name}
                    </Title>
                  </div>
                  <Text style={{ color: 'var(--vkui--color_text_secondary)', marginBottom: '12px' }}>
                    {tournament.type === 'league' ? 'Чемпионат' : 'Кубок'} • {tournament.season || 'Текущий сезон'}
                  </Text>
                  <Button 
                    size="s" 
                    mode="tertiary"
                    after={<Icon28ChevronRightOutline />}
                    onClick={() => onNavigate('main', 'public-tournament')}
                  >
                    Подробнее
                  </Button>
                </Div>
              </Card>
            ))}
          </CardGrid>
        </Group>
      )}

      <Group header="Возможности платформы">
        <Cell before={<Icon28CupOutline />}>
          Для администраторов
          <Caption level="1" style={{ color: 'var(--vkui--color_text_secondary)' }}>
            Управление турнирами и расписанием
          </Caption>
        </Cell>
        <Cell before={<Icon28Users3Outline />}>
          Для капитанов
          <Caption level="1" style={{ color: 'var(--vkui--color_text_secondary)' }}>
            Состав команды и игроки
          </Caption>
        </Cell>
        <Cell before={<Icon28CalendarOutline />}>
          Для всех участников
          <Caption level="1" style={{ color: 'var(--vkui--color_text_secondary)' }}>
            Расписание и результаты матчей
          </Caption>
        </Cell>
      </Group>
    </div>
  );
};

export default PublicView;

