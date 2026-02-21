import React, { useEffect, useState } from 'react';
import { Group, Cell, Div, Spinner, Caption } from '@vkontakte/vkui';
import { db } from '../../firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

interface Goalkeeper {
  id: string;
  name: string;
  teamName?: string;
  cleanSheets: number;
}

const TopGoalkeepersTab = ({ tournamentId }: { tournamentId: string }) => {
  const [goalkeepers, setGoalkeepers] = useState<Goalkeeper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTopGoalkeepers = async () => {
      try {
        const q = query(
          collection(db, 'players'),
          where('tournamentId', '==', tournamentId),
          where('position', '==', 'Вратарь'),
          orderBy('cleanSheets', 'desc'),
          limit(20)
        );
        const snapshot = await getDocs(q);
        const goalkeepersList: Goalkeeper[] = [];
        
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          goalkeepersList.push({
            id: doc.id,
            name: data.name || 'Без имени',
            teamName: data.teamName,
            cleanSheets: data.cleanSheets || 0
          });
        });
        
        setGoalkeepers(goalkeepersList);
      } catch (err) {
        console.error('Ошибка загрузки вратарей:', err);
      } finally {
        setLoading(false);
      }
    };
    loadTopGoalkeepers();
  }, [tournamentId]);

  if (loading) {
    return <Div style={{ textAlign: 'center' }}><Spinner size="medium" /></Div>;
  }

  return (
    <Group header={<Div>Лучшие вратари</Div>}>
      {goalkeepers.length === 0 ? (
        <Div>Нет данных о сухих матчах</Div>
      ) : (
        goalkeepers.map((gk, i) => (
          <Cell key={gk.id} before={<div style={{ minWidth: '24px' }}>{i + 1}</div>}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <div>
                {gk.name}
                {gk.teamName && <Caption level="2">{gk.teamName}</Caption>}
              </div>
              <span style={{ fontWeight: 'bold' }}>{gk.cleanSheets}</span>
            </div>
          </Cell>
        ))
      )}
    </Group>
  );
};

export default TopGoalkeepersTab;