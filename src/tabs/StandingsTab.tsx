import React, { useEffect, useState } from 'react';
import { Group, Cell, Div, Spinner, Caption } from '@vkontakte/vkui';
import { db } from '../firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

interface Team {
  id: string;
  name: string;
  stats: {
    points: number;
    goalsScored: number;
    goalsConceded: number;
    wins: number;
    draws: number;
    losses: number;
  };
}

const StandingsTab = ({ tournamentId }: { tournamentId: string }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStandings = async () => {
      try {
        const q = query(
          collection(db, 'teams'),
          where('tournamentId', '==', tournamentId),
          orderBy('stats.points', 'desc')
        );
        const snapshot = await getDocs(q);
        const teamsList: Team[] = [];
        
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          teamsList.push({
            id: doc.id,
            name: data.name || 'Без названия',
            stats: {
              points: data.stats?.points || 0,
              goalsScored: data.stats?.goalsScored || 0,
              goalsConceded: data.stats?.goalsConceded || 0,
              wins: data.stats?.wins || 0,
              draws: data.stats?.draws || 0,
              losses: data.stats?.losses || 0
            }
          });
        });
        
        setTeams(teamsList);
      } catch (err) {
        console.error('Ошибка загрузки таблицы:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStandings();
  }, [tournamentId]);

  if (loading) {
    return <Div style={{ textAlign: 'center' }}><Spinner size="medium" /></Div>;
  }

  return (
    <Group header={<Div>Турнирная таблица</Div>}>
      <Div>
        <Caption level="2" style={{ display: 'flex', justifyContent: 'space-between', padding: '0 16px' }}>
          <span>Команда</span>
          <span>М В Н П Г О</span>
        </Caption>
      </Div>
      {teams.length === 0 ? (
        <Div>Нет команд</Div>
      ) : (
        teams.map((team, i) => (
          <Cell key={team.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{i + 1}. {team.name}</span>
              <span>
                {team.stats.wins + team.stats.draws + team.stats.losses}{' '}
                {team.stats.wins} {team.stats.draws} {team.stats.losses}{' '}
                {team.stats.goalsScored}:{team.stats.goalsConceded}{' '}
                {team.stats.points}
              </span>
            </div>
          </Cell>
        ))
      )}
    </Group>
  );
};

export default StandingsTab;