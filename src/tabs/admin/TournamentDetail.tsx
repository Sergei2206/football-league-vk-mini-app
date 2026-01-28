// src/tabs/admin/TournamentDetail.tsx
import React, { useState } from 'react';
import { Div, Group, Button } from '@vkontakte/vkui';
import TournamentOverview from './TournamentOverview';
import TournamentTeams from './TournamentTeams';
import TournamentApprovals from './TournamentApprovals';
import TournamentSettings from './TournamentSettings';
import TournamentSchedule from './TournamentSchedule';
import TournamentTable from './TournamentTable';
import MatchProtocols from './MatchProtocols';
import { Tournament } from '../../types';

interface TournamentDetailProps {
  tournament: Tournament;
  user: any;
  onBack: () => void;
  onSnackbar: (message: string) => void;
}

const TournamentDetail = ({ tournament, user, onBack, onSnackbar }: TournamentDetailProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'approvals' | 'settings' | 'schedule' | 'table' | 'protocols'>('overview');

  return (
    <Div>
      <Group>
        <div style={{ padding: '16px', fontSize: '18px', fontWeight: 'bold' }}>
          {tournament.name}
          {tournament.season && ` • Сезон ${tournament.season}`}
        </div>
      </Group>

      <Div style={{ padding: '0 16px 16px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button size="s" mode={activeTab === 'overview' ? 'primary' : 'secondary'} onClick={() => setActiveTab('overview')}>
            Обзор
          </Button>
          <Button size="s" mode={activeTab === 'teams' ? 'primary' : 'secondary'} onClick={() => setActiveTab('teams')}>
            Команды
          </Button>
          <Button size="s" mode={activeTab === 'table' ? 'primary' : 'secondary'} onClick={() => setActiveTab('table')}>
            Таблица
          </Button>
          <Button size="s" mode={activeTab === 'protocols' ? 'primary' : 'secondary'} onClick={() => setActiveTab('protocols')}>
            Протоколы
          </Button>
          <Button size="s" mode={activeTab === 'approvals' ? 'primary' : 'secondary'} onClick={() => setActiveTab('approvals')}>
            Согласование
          </Button>
          <Button size="s" mode={activeTab === 'settings' ? 'primary' : 'secondary'} onClick={() => setActiveTab('settings')}>
            Настройки
          </Button>
          <Button size="s" mode={activeTab === 'schedule' ? 'primary' : 'secondary'} onClick={() => setActiveTab('schedule')}>
            Расписание
          </Button>
        </div>
      </Div>

      <Div>
        {activeTab === 'overview' && (
          <TournamentOverview 
            tournament={tournament} 
            user={user} 
            onSnackbar={onSnackbar} 
          />
        )}
        {activeTab === 'teams' && (
          <TournamentTeams 
            tournament={tournament} 
            user={user} 
            onSnackbar={onSnackbar} 
          />
        )}
        {activeTab === 'table' && (
          <TournamentTable 
            tournament={tournament} 
            onSnackbar={onSnackbar} 
          />
        )}
        {activeTab === 'protocols' && (
          <MatchProtocols 
            tournament={tournament} 
            onSnackbar={onSnackbar} 
          />
        )}
        {activeTab === 'approvals' && <TournamentApprovals />}
        {activeTab === 'settings' && (
          <TournamentSettings 
            tournament={tournament} 
            onSnackbar={onSnackbar} 
          />
        )}
        {activeTab === 'schedule' && (
          <TournamentSchedule 
            tournament={tournament} 
            user={user} 
            onSnackbar={onSnackbar} 
          />
        )}
      </Div>

      <Div style={{ padding: '16px' }}>
        <Button size="l" mode="secondary" onClick={onBack}>
          Назад к списку турниров
        </Button>
      </Div>
    </Div>
  );
};

export default TournamentDetail;