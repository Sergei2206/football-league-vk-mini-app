import React, { useState } from 'react';
import { Div, Tabs, TabsItem } from '@vkontakte/vkui';
import TournamentList from './TournamentList';
import TournamentEditor from './TournamentEditor';

const AdminDashboard = ({ user, tournaments }: { user: any; tournaments: any[] }) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [selectedTournament, setSelectedTournament] = useState<any>(null);

  return (
    <Div>
      <Tabs>
        <TabsItem selected={activeTab === 'list'} onClick={() => setActiveTab('list')}>
          Мои турниры
        </TabsItem>
        <TabsItem selected={activeTab === 'create'} onClick={() => {
          setSelectedTournament(null);
          setActiveTab('create');
        }}>
          Создать турнир
        </TabsItem>
      </Tabs>

      {activeTab === 'list' ? (
        <TournamentList tournaments={tournaments} onSelect={setSelectedTournament} />
      ) : (
        <TournamentEditor user={user} tournament={selectedTournament} onSaved={() => {}} />
      )}
    </Div>
  );
};

export default AdminDashboard;