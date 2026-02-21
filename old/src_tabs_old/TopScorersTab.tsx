import React, { useEffect, useState } from 'react';
import { Group, Cell, Div, Spinner, Caption } from '@vkontakte/vkui';
import { db } from '../../firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

interface Player {
  id: string;
  name: string;
  teamName?: string;
  goals: number;
}

const TopScorersTab = ({ tournamentId }: { tournamentId: string }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTopScorers = async () => {
      try {
        const q = query(
          collection(db, 'players'),
          where('tournamentId', '==', tournamentId),
          orderBy('goals', 'desc'),
          limit(20)
        );
        const snapshot = await getDocs(q);
        const playersList: Player[] = [];
        
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          playersList.push({
            id: doc.id,
            name: data.name || 'Без имени',
            teamName: data.teamName,
            goals: data.goals || 0
          });
        });
        
        setPlayers(playersList);
      } catch (err) {
        console.error('Ошибка загрузки бомбардиров:', err);
      } finally {
        setLoading(false);
      }
    };
    loadTopScorers();
  }, [tournamentId]);

  if (loading) {
    return <Div style={{ textAlign: 'center' }}><Spinner size="medium" /></Div>;
  }

  return (
    <Group header={<Div>Лучшие бомбардиры</Div>}>
      {players.length === 0 ? (
        <Div>Нет забитых голов</Div>
      ) : (
        players.map((player, i) => (
          <Cell key={player.id} before={<div style={{ minWidth: '24px' }}>{i + 1}</div>}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <div>
                {player.name}
                {player.teamName && <Caption level="2">{player.teamName}</Caption>}
              </div>
              <span style={{ fontWeight: 'bold' }}>{player.goals}</span>
            </div>
          </Cell>
        ))
      )}
    </Group>
  );
};

export default TopScorersTab;