import React, { useEffect, useState } from 'react';
import { Group, Cell, Div, Title, Spinner } from '@vkontakte/vkui';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface MatchData {
  id: string;
  team1Name?: string;
  team2Name?: string;
  round?: string;
  [key: string]: any;
}

const CupBracket = ({ tournamentId }: { tournamentId: string }) => {
  const [rounds, setRounds] = useState<Record<string, MatchData[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const q = query(collection(db, 'matches'), where('tournamentId', '==', tournamentId));
        const snapshot = await getDocs(q);
        const matches: MatchData[] = [];
        
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          matches.push({
            id: doc.id,
            team1Name: data.team1Name,
            team2Name: data.team2Name,
            round: data.round // Может быть undefined
          });
        });

        const roundOrder = ['round_of_16', 'quarterfinal', 'semifinal', 'final'];
        const roundsObj: Record<string, MatchData[]> = {};
        
        roundOrder.forEach(round => {
          const roundMatches = matches.filter(m => m.round === round);
          if (roundMatches.length > 0) {
            const roundName = round === 'round_of_16' ? '1/8' : 
                             round === 'quarterfinal' ? '1/4' : 
                             round === 'semifinal' ? 'Полуфинал' : 'Финал';
            roundsObj[roundName] = roundMatches;
          }
        });

        setRounds(roundsObj);
      } catch (err) {
        console.error('Ошибка загрузки сетки:', err);
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
    <Group header={<Div>Сетка кубка</Div>}>
      {Object.keys(rounds).length === 0 ? (
        <Div>Нет матчей</Div>
      ) : (
        Object.entries(rounds).map(([roundName, matches]) => (
          <Div key={roundName}>
            <Title level="3" style={{ marginBottom: 8 }}>{roundName}</Title>
            {matches.map(m => (
              <Cell key={m.id}>
                {(m.team1Name || 'TBD')} — {(m.team2Name || 'TBD')}
              </Cell>
            ))}
          </Div>
        ))
      )}
    </Group>
  );
};

export default CupBracket;