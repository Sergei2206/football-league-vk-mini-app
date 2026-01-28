import React, { useState, useEffect } from 'react';
import { Group, Div, Cell, Button, Spinner } from '@vkontakte/vkui';
import { db } from '../../firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

interface Match {
  id: string;
  team1Id: string;
  team2Id: string;
  team1Name: string;
  team2Name: string;
  date: Date;
  status: 'scheduled' | 'started' | 'completed';
  lineupSubmitted?: boolean;
}

const MatchSchedule = ({ tournament, user, onSnackbar }: { tournament: any; user: any; onSnackbar: (message: string) => void }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const loadMatches = async () => {
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
      
      // Получаем матчи на текущую неделю
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      const matchesQuery = query(
        collection(db, 'matches'),
        where('tournamentId', '==', tournament.id),
        where('date', '>=', startOfWeek),
        where('date', '<=', endOfWeek)
      );
      
      const matchesSnapshot = await getDocs(matchesQuery);
      const matchesList: Match[] = [];
      
      for (const matchDoc of matchesSnapshot.docs) {
        const matchData = matchDoc.data();
        // Проверяем, играет ли команда капитана в этом матче
        if (matchData.team1Id === teamId || matchData.team2Id === teamId) {
          matchesList.push({
            id: matchDoc.id,
            ...matchData,
            date: matchData.date.toDate()
          } as Match);
        }
      }
      
      matchesList.sort((a, b) => a.date.getTime() - b.date.getTime());
      setMatches(matchesList);
    } catch (err: any) {
      console.error('Ошибка загрузки матчей:', err);
      onSnackbar(`Ошибка загрузки: ${err.message || 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, [tournament?.id, user?.id]);

  const handleMatchClick = async (match: Match) => {
    try {
      // Загружаем полные данные матча
      const matchRef = doc(db, 'matches', match.id);
      const matchSnap = await getDoc(matchRef);
      
      if (matchSnap.exists()) {
        const fullMatchData = {
          id: matchSnap.id,
          ...matchSnap.data(),
          date: matchSnap.data().date.toDate()
        } as Match;
        setSelectedMatch(fullMatchData);
      }
    } catch (err: any) {
      console.error('Ошибка загрузки матча:', err);
      onSnackbar('Не удалось загрузить матч');
    }
  };

  if (selectedMatch) {
    // Импортируем MatchLineup динамически или создадим отдельно
    return <div>Протокол матча будет здесь</div>;
  }

  if (loading) {
    return (
      <Div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Spinner size="medium" />
        <div style={{ marginTop: '8px' }}>Загрузка матчей...</div>
      </Div>
    );
  }

  return (
    <Group header="Расписание матчей">
      <Div style={{ padding: '0 16px 16px' }}>
        {matches.length === 0 ? (
          <Cell>Нет предстоящих матчей на этой неделе</Cell>
        ) : (
          matches.map(match => (
            <Cell
              key={match.id}
              onClick={() => handleMatchClick(match)}
              after={
                <Button size="s" mode={match.lineupSubmitted ? 'secondary' : 'primary'}>
                  {match.lineupSubmitted ? 'Состав отправлен' : 'Состав'}
                </Button>
              }
            >
              <div style={{ fontWeight: 'bold' }}>
                {match.team1Name} vs {match.team2Name}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                {match.date.toLocaleDateString('ru-RU')} • {match.status}
              </div>
            </Cell>
          ))
        )}
      </Div>
    </Group>
  );
};

export default MatchSchedule;