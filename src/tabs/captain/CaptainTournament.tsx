import React, { useState } from 'react';
import { Div, Group, Button, PanelHeader, PanelHeaderButton } from '@vkontakte/vkui';
import { Icon28ChevronBack } from '@vkontakte/icons';
import TeamRoster from './TeamRoster';
import MatchSchedule from './MatchSchedule';
import CompletedMatches from './CompletedMatches';
import AddPlayer from './AddPlayer';

interface CaptainTournamentProps {
  tournament: any;
  user: any;
  onBack: () => void;
  onSnackbar: (message: string) => void;
}

const CaptainTournament = ({ tournament, user, onBack, onSnackbar }: CaptainTournamentProps) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'schedule' | 'completed' | 'add-player'>('roster');

  const handleBack = () => {
    if (activeTab === 'add-player') {
      setActiveTab('roster');
    } else {
      onBack();
    }
  };

  return (
    <Div>
      {/* Заголовок с кнопкой назад */}
      {activeTab !== 'roster' && (
        <PanelHeader
          before={
            <PanelHeaderButton onClick={handleBack}>
              <Icon28ChevronBack />
            </PanelHeaderButton>
          }
        >
          {activeTab === 'add-player' ? 'Добавить игрока' : tournament.name}
        </PanelHeader>
      )}

      {/* Основной контент */}
      {activeTab === 'roster' && (
        <>
          <Group>
            <div style={{ padding: '16px', fontSize: '18px', fontWeight: 'bold' }}>
              {tournament.name}
              {tournament.season && ` • Сезон ${tournament.season}`}
            </div>
          </Group>
          
          <Div style={{ padding: '0 16px 16px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Button size="s" mode="primary" onClick={() => setActiveTab('roster')}>
                Состав
              </Button>
              <Button size="s" mode="secondary" onClick={() => setActiveTab('schedule')}>
                Расписание
              </Button>
              <Button size="s" mode="secondary" onClick={() => setActiveTab('completed')}>
                Завершённые
              </Button>
            </div>
          </Div>
          
          <TeamRoster 
            tournament={tournament} 
            user={user} 
            onSnackbar={onSnackbar} 
            onAddPlayer={() => setActiveTab('add-player')}
          />
          
          <Div style={{ padding: '16px' }}>
            <Button size="l" mode="secondary" onClick={onBack}>
              Назад к турнирам
            </Button>
          </Div>
        </>
      )}
      
      {activeTab === 'schedule' && (
        <MatchSchedule 
          tournament={tournament} 
          user={user} 
          onSnackbar={onSnackbar} 
        />
      )}
      
      {activeTab === 'completed' && (
        <CompletedMatches 
          tournament={tournament} 
          user={user} 
          onSnackbar={onSnackbar} 
        />
      )}
      
      {activeTab === 'add-player' && (
        <AddPlayer
          tournament={tournament}
          user={user}
          onBack={() => setActiveTab('roster')}
          onSnackbar={onSnackbar}
        />
      )}
    </Div>
  );
};

export default CaptainTournament;