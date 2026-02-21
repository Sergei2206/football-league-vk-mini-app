// src/tabs/admin/AdminDashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Group, Card, CardGrid, Title, Text, Button, Avatar, Div, Counter } from '@vkontakte/vkui';
import { Icon28CupOutline, Icon28AddOutline, Icon28SettingsOutline, Icon28CalendarOutline } from '@vkontakte/icons';

interface AdminDashboardProps {
  onNavigate: (view: string, panel: string) => void;
  onSnackbar: (message: string) => void;
  onSelectTournament: (tournament: any) => void;
}

const AdminDashboard = ({ onNavigate, onSnackbar, onSelectTournament }: AdminDashboardProps) => {
  const [tournaments, setTournaments] = useState<any[]>([]);

  const loadTournaments = useCallback(async () => {
    try {
      setTournaments([]);
    } catch (error) {
      onSnackbar('Ошибка загрузки турниров');
    }
  }, [onSnackbar]);

  useEffect(() => {
    loadTournaments();
  }, [loadTournaments]);

  const handleCreateTournament = () => {
    onNavigate('main', 'tournament-editor');
  };

  const handleSelectTournament = (tournament: any) => {
    onSelectTournament(tournament);
    onNavigate('main', 'tournament-detail');
  };

  return (
    <div style={{ padding: '0 16px' }}>
      <Div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          borderRadius: '50%', 
          backgroundColor: 'var(--vkui--color_background_accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          color: 'white'
        }}>
          <Icon28CupOutline width={32} height={32} />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 8px' }}>
          Панель администратора
        </h2>
        <p style={{ color: 'var(--vkui--color_text_secondary)' }}>
          Управление вашими турнирами
        </p>
      </Div>

      <Group>
        <CardGrid size="s">
          <Card mode="shadow">
            <Div style={{ padding: '20px', textAlign: 'center' }}>
              <Icon28AddOutline width={32} height={32} style={{ marginBottom: '12px', color: 'var(--vkui--color_icon_accent)' }} />
              <Title level="3" style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                Новый турнир
              </Title>
              <Button size="s" mode="primary" onClick={handleCreateTournament}>
                Создать
              </Button>
            </Div>
          </Card>
          <Card mode="shadow">
            <Div style={{ padding: '20px', textAlign: 'center' }}>
              <Icon28SettingsOutline width={32} height={32} style={{ marginBottom: '12px', color: 'var(--vkui--color_icon_accent)' }} />
              <Title level="3" style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                Настройки
              </Title>
              <Button size="s" mode="secondary" onClick={() => onSnackbar('Настройки')}>
                Открыть
              </Button>
            </Div>
          </Card>
        </CardGrid>
      </Group>

      <Group 
        header={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Мои турниры</span>
            <Counter>{tournaments.length}</Counter>
          </div>
        }
      >
        {tournaments.length === 0 ? (
          <Div style={{ textAlign: 'center', padding: '24px 0' }}>
            <Icon28CupOutline width={48} height={48} style={{ color: 'var(--vkui--color_icon_secondary)', marginBottom: '16px' }} />
            <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
              У вас пока нет турниров
            </Text>
          </Div>
        ) : (
          <CardGrid size="s">
            {tournaments.map(tournament => (
              <Card key={tournament.id} mode="shadow" onClick={() => handleSelectTournament(tournament)}>
                <Div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <Avatar size={32} fallbackIcon={<Icon28CupOutline />} />
                    <Title level="3" style={{ fontSize: '16px', fontWeight: '600' }}>
                      {tournament.name}
                    </Title>
                  </div>
                  <Text style={{ color: 'var(--vkui--color_text_secondary)', fontSize: '14px' }}>
                    {tournament.type === 'league' ? 'Чемпионат' : 'Кубок'}
                    {tournament.isSeasonStarted && ' • Сезон начат'}
                  </Text>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <Button size="s" mode="tertiary" before={<Icon28SettingsOutline />}>
                      Настройки
                    </Button>
                    <Button size="s" mode="tertiary" before={<Icon28CalendarOutline />}>
                      Расписание
                    </Button>
                  </div>
                </Div>
              </Card>
            ))}
          </CardGrid>
        )}
      </Group>

      <Group header="Статистика">
        <CardGrid size="s">
          <Card>
            <Div style={{ padding: '16px', textAlign: 'center' }}>
              <Text style={{ fontSize: '24px', fontWeight: '700', color: 'var(--vkui--color_text_accent)' }}>0</Text>
              <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>Команд</Text>
            </Div>
          </Card>
          <Card>
            <Div style={{ padding: '16px', textAlign: 'center' }}>
              <Text style={{ fontSize: '24px', fontWeight: '700', color: 'var(--vkui--color_text_accent)' }}>0</Text>
              <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>Матчей</Text>
            </Div>
          </Card>
          <Card>
            <Div style={{ padding: '16px', textAlign: 'center' }}>
              <Text style={{ fontSize: '24px', fontWeight: '700', color: 'var(--vkui--color_text_accent)' }}>0</Text>
              <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>Игроков</Text>
            </Div>
          </Card>
        </CardGrid>
      </Group>
    </div>
  );
};

export default AdminDashboard;

