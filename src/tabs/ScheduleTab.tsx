import React, { useEffect, useState } from 'react';
import { Group, Cell, Div, Spinner, Caption } from '@vkontakte/vkui';
import { db } from '../firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

interface Match {
  id: string;
  team1Name?: string;
  team2Name?: string;
  date?: any;
  status?: string;
  score1?: number;
  score2?: number;
}

const ScheduleTab = ({ tournamentId }: { tournamentId: string }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const q = query(
          collection(db, 'matches'),
          where('tournamentId', '==', tournamentId),
          orderBy('date', 'asc')
        );
        const snapshot = await getDocs(q);
        const matchesList: Match[] = [];
        
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          let dateVal: Date;
          if (data.date?.toDate) {
            dateVal = data.date.toDate();
          } else if (data.date instanceof Date) {
            dateVal = data.date;
          } else {
            dateVal = new Date();
          }
          
          matchesList.push({
            id: doc.id,
            team1Name: data.team1Name || 'Команда 1',
            team2Name: data.team2Name || 'Команда 2',
            date: dateVal,
            status: data.status || 'scheduled',
            score1: data.score1 || 0,
            score2: data.score2 || 0
          });
        });
        
        setMatches(matchesList);
      } catch (err) {
        console.error('Ошибка загрузки матчей:', err);
      } finally {
        setLoading(false);
      }
    };
    loadMatches();
  }, [tournamentId]);

  if (loading) {
    return <Div style={{ textAlign: 'center' }}><Spinner size="medium" /></Div>;
  }

  return (
    <Group header={<Div>Расписание матчей</Div>}>
      {matches.length === 0 ? (
        <Div>Нет запланированных матчей</Div>
      ) : (
        matches.map(match => (
          <Cell key={match.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div>{match.team1Name} — {match.team2Name}</div>
                <Caption level="2">{match.date.toLocaleDateString('ru-RU')}</Caption>
              </div>
              {match.status === 'completed' && (
                <div style={{ fontWeight: 'bold' }}>
                  {match.score1} : {match.score2}
                </div>
              )}
            </div>
          </Cell>
        ))
      )}
    </Group>
  );
};

export default ScheduleTab;