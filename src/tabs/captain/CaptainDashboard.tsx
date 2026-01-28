import React, { useState, useEffect } from 'react';
import { Group, Div, Cell, Spinner } from '@vkontakte/vkui';
import { db } from '../../firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import CaptainTournament from './CaptainTournament';

interface Tournament {
  id: string;
  name: string;
  season?: string;
  type: 'league' | 'cup';
}

const CaptainDashboard = ({ user, onSnackbar }: { user: any; onSnackbar: (message: string) => void }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  const loadTournaments = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Ищем турниры, где пользователь является капитаном команды
      const teamsQuery = query(
        collection(db, 'teams'),
        where('captainVkId', '==', user.id)
      );
      
      const teamsSnapshot = await getDocs(teamsQuery);
      const tournamentIds: string[] = [];
      
      teamsSnapshot.docs.forEach(doc => {
        const teamData = doc.data();
        if (teamData.tournamentId && !tournamentIds.includes(teamData.tournamentId)) {
          tournamentIds.push(teamData.tournamentId);
        }
      });
      
      // Загружаем данные турниров
      const tournamentsList: Tournament[] = [];
      for (let i = 0; i < tournamentIds.length; i++) {
        const tournamentId = tournamentIds[i];
        const tournamentRef = doc(db, 'tournaments', tournamentId);
        const tournamentSnap = await getDoc(tournamentRef);
        
        if (tournamentSnap.exists()) {
          tournamentsList.push({
            id: tournamentSnap.id,
            ...tournamentSnap.data()
          } as Tournament);
        }
      }
      
      setTournaments(tournamentsList);
    } catch (err: any) {
      console.error('Ошибка загрузки турниров:', err);
      onSnackbar(`Ошибка загрузки: ${err.message || 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTournaments();
  }, [user?.id]);

  const handleTournamentClick = (tournament: Tournament) => {
    setSelectedTournament(tournament);
  };

  const handleBack = () => {
    setSelectedTournament(null);
  };

  if (selectedTournament) {
    return (
      <CaptainTournament 
        tournament={selectedTournament} 
        user={user} 
        onBack={handleBack} 
        onSnackbar={onSnackbar} 
      />
    );
  }

  if (loading) {
    return (
      <Div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Spinner size="medium" />
        <div style={{ marginTop: '8px' }}>Загрузка турниров...</div>
      </Div>
    );
  }

  return (
    <Group header="Мои турниры">
      <Div style={{ padding: '0 16px 16px' }}>
        {tournaments.length === 0 ? (
          <Cell>Нет турниров</Cell>
        ) : (
          tournaments.map(tournament => (
            <Cell
              key={tournament.id}
              onClick={() => handleTournamentClick(tournament)}
            >
              <div style={{ fontWeight: 'bold' }}>{tournament.name}</div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                {tournament.season && `Сезон ${tournament.season}`} • {tournament.type === 'league' ? 'Чемпионат' : 'Кубок'}
              </div>
            </Cell>
          ))
        )}
      </Div>
    </Group>
  );
};

export default CaptainDashboard;