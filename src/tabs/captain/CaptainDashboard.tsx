// src/tabs/captain/CaptainDashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Group, Card, CardGrid, Title, Text, Button, Avatar, Div, Counter } from '@vkontakte/vkui';
import { Icon28Users3Outline, Icon28CalendarOutline } from '@vkontakte/icons';

interface CaptainDashboardProps {
  user: any;
  onNavigate: (view: string, panel: string) => void;
  onSnackbar: (message: string) => void;
  onSelectTournament: (tournament: any) => void;
}

const CaptainDashboard = ({ user, onNavigate, onSnackbar, onSelectTournament }: CaptainDashboardProps) => {
  const [teams, setTeams] = useState<any[]>([]);

  const loadTeams = useCallback(async () => {
    try {
      setTeams([]);
    } catch (error) {
      onSnackbar('Ошибка загрузки команд');
    }
  }, [onSnackbar]);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  const handleSelectTeam = (team: any) => {
    const tournament = { id: team.tournamentId, name: 'Турнир команды' };
    onSelectTournament(tournament);
    onNavigate('main', 'captain-tournament');
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
          <Icon28Users3Outline width={32} height={32} />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 8px' }}>
          Мои команды
        </h2>
        <p style={{ color: 'var(--vkui--color_text_secondary)' }}>
          Управление вашими футбольными командами
        </p>
      </Div>

      <Group 
        header={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Мои команды</span>
            <Counter>{teams.length}</Counter>
          </div>
        }
      >
        {teams.length === 0 ? (
          <Div style={{ textAlign: 'center', padding: '24px 0' }}>
            <Icon28Users3Outline width={48} height={48} style={{ color: 'var(--vkui--color_icon_secondary)', marginBottom: '16px' }} />
            <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
              У вас пока нет команд
            </Text>
          </Div>
        ) : (
          <CardGrid size="s">
            {teams.map(team => (
              <Card key={team.id} mode="shadow" onClick={() => handleSelectTeam(team)}>
                <Div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    {team.logoId ? (
                      <img 
                        src={`team-logos/${team.logoId}`} 
                        alt="Логотип"
                        style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '6px' }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <Avatar size={32} fallbackIcon={<Icon28Users3Outline />} />
                    )}
                    <Title level="3" style={{ fontSize: '16px', fontWeight: '600' }}>
                      {team.name}
                    </Title>
                  </div>
                  <Text style={{ color: 'var(--vkui--color_text_secondary)', fontSize: '14px' }}>
                    Турнир: {team.tournamentName || 'Не указан'}
                  </Text>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <Button size="s" mode="tertiary" before={<Icon28Users3Outline />}>
                      Состав
                    </Button>
                    <Button size="s" mode="tertiary" before={<Icon28CalendarOutline />}>
                      Матчи
                    </Button>
                  </div>
                </Div>
              </Card>
            ))}
          </CardGrid>
        )}
      </Group>

      <Group header="Быстрая статистика">
        <CardGrid size="s">
          <Card>
            <Div style={{ padding: '16px', textAlign: 'center' }}>
              <Text style={{ fontSize: '24px', fontWeight: '700', color: 'var(--vkui--color_text_accent)' }}>0</Text>
              <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>Игроков</Text>
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
              <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>Очков</Text>
            </Div>
          </Card>
        </CardGrid>
      </Group>
    </div>
  );
};

export default CaptainDashboard;

