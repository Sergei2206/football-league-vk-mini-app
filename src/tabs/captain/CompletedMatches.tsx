import React, { useState, useEffect } from 'react';
import { Group, Div, Cell, Spinner } from '@vkontakte/vkui';
import { db } from '../../firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

interface CompletedMatch {
  id: string;
  team1Name: string;
  team2Name: string;
  team1Score: number;
  team2Score: number;
  date: Date;
  penaltiesTeam1?: number;
  penaltiesTeam2?: number;
}

const CompletedMatches = ({ tournament, user, onSnackbar }: { tournament: any; user: any; onSnackbar: (message: string) => void }) => {
  const [matches, setMatches] = useState<CompletedMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCompletedMatches = async () => {
    if (!user?.id || !tournament?.id) return;
    
    try {
      setLoading(true);
      
      // Находим ID команды капитана
      const teamsQuery = query(
        collection(db, 'teams'),
        where('tournamentId', '==', tournament.id),
        where('captainVkId', '==', user.id)
      );
      
      const teamsSnapshot = await getDocs(teamsQuery);
      if (teamsSnapshot.empty) return;
      
      const teamId = teamsSnapshot.docs[0].id;
      
      // Получаем завершённые матчи
      const matchesQuery = query(
        collection(db, 'matches'),
        where('tournamentId', '==', tournament.id),
        where('status', '==', 'completed')
      );
      
      const matchesSnapshot = await getDocs(matchesQuery);
      const matchesList: CompletedMatch[] = [];
      
      for (const matchDoc of matchesSnapshot.docs) {
        const matchData = matchDoc.data();
        // Проверяем, играла ли команда капитана в этом матче
        if (matchData.team1Id === teamId || matchData.team2Id === teamId) {
          matchesList.push({
            id: matchDoc.id,
            team1Name: matchData.team1Name,
            team2Name: matchData.team2Name,
            team1Score: matchData.team1Score || 0,
            team2Score: matchData.team2Score || 0,
            date: matchData.date.toDate(),
            penaltiesTeam1: matchData.penaltiesTeam1,
            penaltiesTeam2: matchData.penaltiesTeam2
          });
        }
      }
      
      matchesList.sort((a, b) => b.date.getTime() - a.date.getTime()); // Последние матчи первыми
      setMatches(matchesList);
    } catch (err: any) {
      console.error('Ошибка загрузки завершённых матчей:', err);
      onSnackbar(`Ошибка загрузки: ${err.message || 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompletedMatches();
  }, [tournament?.id, user?.id]);

  if (loading) {
    return (
      <Div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Spinner size="medium" />
        <div style={{ marginTop: '8px' }}>Загрузка матчей...</div>
      </Div>
    );
  }

  return (
    <Group header="Завершённые матчи">
      <Div style={{ padding: '0 16px 16px' }}>
        {matches.length === 0 ? (
          <Cell>Нет завершённых матчей</Cell>
        ) : (
          matches.map(match => (
            <Cell key={match.id}>
              <div style={{ fontWeight: 'bold' }}>
                {match.team1Name} {match.team1Score} : {match.team2Score} {match.team2Name}
              </div>
              {match.penaltiesTeam1 !== undefined && match.penaltiesTeam2 !== undefined && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Пенальти: {match.penaltiesTeam1} : {match.penaltiesTeam2}
                </div>
              )}
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                {match.date.toLocaleDateString('ru-RU')}
              </div>
            </Cell>
          ))
        )}
      </Div>
    </Group>
  );
};

export default CompletedMatches;