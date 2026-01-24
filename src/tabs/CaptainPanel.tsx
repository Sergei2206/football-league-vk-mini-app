import React, { useState, useEffect } from 'react';
import { Div, Button, Group, Cell, Caption, Spinner, Tabs, TabsItem } from '@vkontakte/vkui';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import AddPlayerForm from './AddPlayerForm';
import LogoUrlInput from '../components/LogoUrlInput';

interface Player {
  id: string;
  name: string;
  position: string;
  number: number;
  goals: number;
}

interface Team {
  id: string;
  name: string;
  logoUrl?: string;
}

const CaptainPanel = ({ 
  teamId, 
  tournamentId, 
  tournamentName, 
  teamLogo 
}: { 
  teamId: string; 
  tournamentId: string; 
  tournamentName: string; 
  teamLogo?: string; 
}) => {
  const [activeTab, setActiveTab] = useState<'players' | 'add' | 'logo'>('players');
  const [players, setPlayers] = useState<Player[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  // Загрузка данных команды
  const loadTeamData = async () => {
    try {
      setLoading(true);
      
      // Загрузка информации о команде
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      if (teamDoc.exists()) {
        const teamData = teamDoc.data();
        setTeam({
          id: teamDoc.id,
          name: teamData.name || 'Без названия',
          logoUrl: teamData.logoUrl
        });
      }
      
      // Загрузка игроков
      const q = query(collection(db, 'players'), where('teamId', '==', teamId));
      const snapshot = await getDocs(q);
      const playersList: Player[] = [];
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        playersList.push({
          id: doc.id,
          name: data.name || 'Без имени',
          position: data.position || 'Игрок',
          number: data.number || 0,
          goals: data.goals || 0
        });
      });
      
      playersList.sort((a, b) => a.number - b.number);
      setPlayers(playersList);
    } catch (err) {
      console.error('Ошибка загрузки данных команды:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeamData();
  }, [teamId]);

  const handlePlayerAdded = () => {
    loadTeamData();
    setActiveTab('players');
  };

  return (
    <Div>
      <Tabs>
        <TabsItem selected={activeTab === 'players'} onClick={() => setActiveTab('players')}>
          Состав
        </TabsItem>
        <TabsItem selected={activeTab === 'add'} onClick={() => setActiveTab('add')}>
          Добавить
        </TabsItem>
        <TabsItem selected={activeTab === 'logo'} onClick={() => setActiveTab('logo')}>
          Логотип
        </TabsItem>
      </Tabs>

      {activeTab === 'players' && (
        <Group header={<Div>Игроки команды</Div>}>
          {loading ? (
            <Div style={{ textAlign: 'center' }}>
              <Spinner size="medium" />
            </Div>
          ) : players.length === 0 ? (
            <Div>Нет добавленных игроков</Div>
          ) : (
            players.map(player => (
              <Cell
                key={player.id}
                before={<div style={{ minWidth: '24px', textAlign: 'center' }}>{player.number}</div>}
                subtitle={<Caption>{player.position} • {player.goals} гол(а)</Caption>}
              >
                {player.name}
              </Cell>
            ))
          )}
        </Group>
      )}

      {activeTab === 'add' && (
        <AddPlayerForm 
          teamId={teamId} 
          tournamentId={tournamentId}
          onPlayerAdded={handlePlayerAdded} 
        />
      )}

      {activeTab === 'logo' && team && (
        <LogoUrlInput 
          teamId={team.id}
          currentLogo={team.logoUrl}
          onLogoUpdated={loadTeamData} 
        />
      )}
    </Div>
  );
};

export default CaptainPanel;