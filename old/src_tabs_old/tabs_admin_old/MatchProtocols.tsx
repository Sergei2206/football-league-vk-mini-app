import React, { useState, useEffect } from 'react';
import { Group, Div, Cell, Button, FormLayout, Input, Spinner, Card } from '@vkontakte/vkui';
import { db } from '../../../firebase';
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';

interface Match {
  id: string;
  team1Id: string;
  team2Id: string;
  team1Name: string;
  team2Name: string;
  date: Date;
  status: 'scheduled' | 'started' | 'completed';
  referees?: string[];
  team1Players?: PlayerProtocol[];
  team2Players?: PlayerProtocol[];
  team1Score?: number;
  team2Score?: number;
  penaltiesTeam1?: number;
  penaltiesTeam2?: number;
}

interface PlayerProtocol {
  playerId: string;
  playerName: string;
  number: number;
  goals: number;
  yellowCards: number;
  redCards: number;
}

const MatchProtocols = ({ tournament, onSnackbar }: { tournament: any; onSnackbar: (message: string) => void }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // Загрузка матчей на текущую неделю
  const loadMatches = async () => {
    if (!tournament?.id) return;
    
    try {
      setLoading(true);
      
      // Получаем начало и конец текущей недели
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Понедельник
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Воскресенье
      
      const q = query(
        collection(db, 'matches'), 
        where('tournamentId', '==', tournament.id),
        where('date', '>=', startOfWeek),
        where('date', '<=', endOfWeek)
      );
      
      const snapshot = await getDocs(q);
      const matchesList: Match[] = [];
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        matchesList.push({
          id: docSnap.id,
          ...data,
          date: data.date.toDate()
        } as Match);
      }
      
      // Сортируем по дате
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
  }, [tournament?.id]);

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
    return <MatchProtocol match={selectedMatch} tournament={tournament} onBack={() => setSelectedMatch(null)} onSnackbar={onSnackbar} />;
  }

  if (loading) {
    return (
      <Div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Spinner size="medium" />
        <div style={{ marginTop: '8px' }}>Загрузка матчей...</div>
      </Div>
    );
  }

  if (matches.length === 0) {
    return (
      <Div style={{ padding: '16px' }}>
        <Card mode="outline" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
            Нет предстоящих матчей
          </div>
          <div style={{ color: '#666' }}>
            Матчи на этой неделе не запланированы
          </div>
        </Card>
      </Div>
    );
  }

  return (
    <Group header="Протоколы матчей">
      <Div style={{ padding: '0 16px 16px' }}>
        {matches.map(match => (
          <Cell
            key={match.id}
            onClick={() => handleMatchClick(match)}
            after={
              <Button size="s" mode="primary">
                {match.status === 'completed' ? 'Завершён' : 'Протокол'}
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
        ))}
      </Div>
    </Group>
  );
};

// Компонент протокола отдельного матча
const MatchProtocol = ({ match, tournament, onBack, onSnackbar }: { 
  match: Match; 
  tournament: any; 
  onBack: () => void; 
  onSnackbar: (message: string) => void; 
}) => {
  const [referees, setReferees] = useState<string[]>(match.referees || ['', '', '']);
  const [team1Players, setTeam1Players] = useState<PlayerProtocol[]>(match.team1Players || []);
  const [team2Players, setTeam2Players] = useState<PlayerProtocol[]>(match.team2Players || []);
  const [team1Score, setTeam1Score] = useState<number>(match.team1Score || 0);
  const [team2Score, setTeam2Score] = useState<number>(match.team2Score || 0);
  const [penaltiesTeam1, setPenaltiesTeam1] = useState<number>(match.penaltiesTeam1 || 0);
  const [penaltiesTeam2, setPenaltiesTeam2] = useState<number>(match.penaltiesTeam2 || 0);
  const [activeTab, setActiveTab] = useState<'team1' | 'team2'>('team1');
  const [loading, setLoading] = useState(false);

  // Загрузка составов команд при монтировании
  useEffect(() => {
    const loadTeamPlayers = async () => {
      if (match.team1Players && match.team2Players) return;
      
      try {
        const team1Ref = doc(db, 'teams', match.team1Id);
        const team2Ref = doc(db, 'teams', match.team2Id);
        
        const [team1Snap, team2Snap] = await Promise.all([
          getDoc(team1Ref),
          getDoc(team2Ref)
        ]);
        
        const createPlayerProtocols = (players: any[] = [], teamName: string) => {
          return players.map((player, index) => ({
            playerId: player.id || `player_${index}`,
            playerName: player.name || `Игрок ${index + 1}`,
            number: player.number || index + 1,
            goals: 0,
            yellowCards: 0,
            redCards: 0
          }));
        };
        
        if (team1Snap.exists()) {
          const team1Data = team1Snap.data();
          setTeam1Players(createPlayerProtocols(team1Data.players, team1Data.name));
        }
        
        if (team2Snap.exists()) {
          const team2Data = team2Snap.data();
          setTeam2Players(createPlayerProtocols(team2Data.players, team2Data.name));
        }
      } catch (err) {
        console.error('Ошибка загрузки составов:', err);
      }
    };
    
    loadTeamPlayers();
  }, []);

  const handleStartMatch = async () => {
    try {
      setLoading(true);
      
      // Обновляем матч как начатый
      await updateDoc(doc(db, 'matches', match.id), {
        status: 'started',
        referees: referees.filter(ref => ref.trim() !== ''),
        team1Players,
        team2Players,
        startedAt: new Date()
      });
      
      onSnackbar('Матч начат!');
    } catch (err: any) {
      console.error('Ошибка начала матча:', err);
      onSnackbar(`Ошибка: ${err.message || 'Не удалось начать матч'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEndMatch = async () => {
    try {
      setLoading(true);
      
      // Рассчитываем очки согласно настройкам турнира
      let team1Points = 0;
      let team2Points = 0;
      let winner = '';
      
      if (team1Score > team2Score) {
        team1Points = tournament.winPoints || 3;
        team2Points = tournament.lossPoints || 0;
        winner = match.team1Id;
      } else if (team2Score > team1Score) {
        team2Points = tournament.winPoints || 3;
        team1Points = tournament.lossPoints || 0;
        winner = match.team2Id;
      } else {
        // Ничья
        if (tournament.penaltiesAfterDraw && penaltiesTeam1 !== penaltiesTeam2) {
          // Есть пенальти и определён победитель
          if (penaltiesTeam1 > penaltiesTeam2) {
            team1Points = tournament.penaltyWinPoints || 2;
            team2Points = tournament.lossPoints || 0;
            winner = match.team1Id;
          } else {
            team2Points = tournament.penaltyWinPoints || 2;
            team1Points = tournament.lossPoints || 0;
            winner = match.team2Id;
          }
        } else {
          // Обычная ничья
          team1Points = tournament.drawPoints || 1;
          team2Points = tournament.drawPoints || 1;
        }
      }
      
      // Обновляем матч как завершённый
      const matchData = {
        status: 'completed',
        team1Score,
        team2Score,
        team1Points,
        team2Points,
        winner,
        completedAt: new Date(),
        team1Players,
        team2Players
      };
      
      if (tournament.penaltiesAfterDraw && penaltiesTeam1 !== penaltiesTeam2) {
        Object.assign(matchData, {
          penaltiesTeam1,
          penaltiesTeam2
        });
      }
      
      await updateDoc(doc(db, 'matches', match.id), matchData);
      
      // Обновляем статистику команд
      await updateTeamStats(match.team1Id, team1Score, team1Points, team1Players);
      await updateTeamStats(match.team2Id, team2Score, team2Points, team2Players);
      
      onSnackbar('Матч завершён! Результаты сохранены.');
      onBack();
    } catch (err: any) {
      console.error('Ошибка завершения матча:', err);
      onSnackbar(`Ошибка: ${err.message || 'Не удалось завершить матч'}`);
    } finally {
      setLoading(false);
    }
  };

  const updateTeamStats = async (teamId: string, goals: number, points: number, players: PlayerProtocol[]) => {
    try {
      const teamRef = doc(db, 'teams', teamId);
      const teamSnap = await getDoc(teamRef);
      
      if (teamSnap.exists()) {
        const currentData = teamSnap.data();
        const yellowCards = players.reduce((sum, p) => sum + p.yellowCards, 0);
        const redCards = players.reduce((sum, p) => sum + p.redCards, 0);
        
        await updateDoc(teamRef, {
          matches: (currentData.matches || 0) + 1,
          points: (currentData.points || 0) + points,
          goalsFor: (currentData.goalsFor || 0) + goals,
          yellowCards: (currentData.yellowCards || 0) + yellowCards,
          redCards: (currentData.redCards || 0) + redCards,
          wins: (currentData.wins || 0) + (points === (tournament.winPoints || 3) ? 1 : 0),
          draws: (currentData.draws || 0) + (points === (tournament.drawPoints || 1) ? 1 : 0),
          losses: (currentData.losses || 0) + (points === (tournament.lossPoints || 0) ? 1 : 0)
        });
      }
    } catch (err) {
      console.error('Ошибка обновления статистики команды:', err);
    }
  };

  const updatePlayerGoals = (team: 'team1' | 'team2', index: number, goals: number) => {
    const setter = team === 'team1' ? setTeam1Players : setTeam2Players;
    const players = team === 'team1' ? team1Players : team2Players;
    
    const updated = [...players];
    updated[index] = { ...updated[index], goals };
    setter(updated);
    
    // Обновляем общий счёт
    const totalGoals = updated.reduce((sum, p) => sum + p.goals, 0);
    if (team === 'team1') {
      setTeam1Score(totalGoals);
    } else {
      setTeam2Score(totalGoals);
    }
  };

  const updatePlayerCards = (team: 'team1' | 'team2', index: number, yellow: number, red: number) => {
    const setter = team === 'team1' ? setTeam1Players : setTeam2Players;
    const players = team === 'team1' ? team1Players : team2Players;
    
    const updated = [...players];
    updated[index] = { ...updated[index], yellowCards: yellow, redCards: red };
    setter(updated);
  };

  const isStarted = match.status === 'started' || match.status === 'completed';

  return (
    <Group header={`Протокол матча: ${match.team1Name} vs ${match.team2Name}`}>
      <Div style={{ padding: '16px' }}>
        {!isStarted ? (
          <>
            <FormLayout>
              <div style={{ marginBottom: '12px', fontWeight: 'bold' }}>
                Судьи матча:
              </div>
              
              {referees.map((referee, index) => (
                <Input
                  key={index}
                  value={referee}
                  onChange={(e) => {
                    const newRefs = [...referees];
                    newRefs[index] = e.target.value;
                    setReferees(newRefs);
                  }}
                  placeholder={`Судья ${index + 1}`}
                />
              ))}
              
              <Button
                size="l"
                mode="primary"
                onClick={handleStartMatch}
                disabled={loading}
                style={{ marginTop: '24px' }}
              >
                {loading ? 'Начало матча...' : 'Начать матч'}
              </Button>
            </FormLayout>
          </>
        ) : (
          <>
            {/* Вкладки команд */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <Button
                size="s"
                mode={activeTab === 'team1' ? 'primary' : 'secondary'}
                onClick={() => setActiveTab('team1')}
              >
                {match.team1Name}
              </Button>
              <Button
                size="s"
                mode={activeTab === 'team2' ? 'primary' : 'secondary'}
                onClick={() => setActiveTab('team2')}
              >
                {match.team2Name}
              </Button>
            </div>

            {/* Таблица игроков */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '8px', borderBottom: '2px solid #e1e3e6' }}>№</th>
                    <th style={{ padding: '8px', borderBottom: '2px solid #e1e3e6' }}>Игрок</th>
                    <th style={{ padding: '8px', borderBottom: '2px solid #e1e3e6' }}>Голы</th>
                    <th style={{ padding: '8px', borderBottom: '2px solid #e1e3e6' }}>Ж</th>
                    <th style={{ padding: '8px', borderBottom: '2px solid #e1e3e6' }}>К</th>
                  </tr>
                </thead>
                <tbody>
                  {(activeTab === 'team1' ? team1Players : team2Players).map((player, index) => (
                    <tr key={player.playerId}>
                      <td style={{ padding: '8px', textAlign: 'center' }}>{player.number}</td>
                      <td style={{ padding: '8px' }}>{player.playerName}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <input
                          type="number"
                          value={player.goals}
                          onChange={(e) => updatePlayerGoals(activeTab, index, parseInt(e.target.value) || 0)}
                          min="0"
                          max="10"
                          style={{
                            width: '60px',
                            padding: '4px',
                            borderRadius: '4px',
                            border: '1px solid #e1e3e6'
                          }}
                        />
                      </td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <input
                          type="number"
                          value={player.yellowCards}
                          onChange={(e) => updatePlayerCards(activeTab, index, parseInt(e.target.value) || 0, player.redCards)}
                          min="0"
                          max="5"
                          style={{
                            width: '50px',
                            padding: '4px',
                            borderRadius: '4px',
                            border: '1px solid #e1e3e6'
                          }}
                        />
                      </td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <input
                          type="number"
                          value={player.redCards}
                          onChange={(e) => updatePlayerCards(activeTab, index, player.yellowCards, parseInt(e.target.value) || 0)}
                          min="0"
                          max="2"
                          style={{
                            width: '50px',
                            padding: '4px',
                            borderRadius: '4px',
                            border: '1px solid #e1e3e6'
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Счёт матча */}
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
                {team1Score} : {team2Score}
              </div>
              
              {/* Пенальти (если ничья и настроено) */}
              {tournament.penaltiesAfterDraw && team1Score === team2Score && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ marginBottom: '12px', fontWeight: 'bold' }}>
                    Серия пенальти:
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
                    <div>
                      <div>{match.team1Name}</div>
                      <input
                        type="number"
                        value={penaltiesTeam1}
                        onChange={(e) => setPenaltiesTeam1(parseInt(e.target.value) || 0)}
                        min="0"
                        max="20"
                        style={{
                          width: '80px',
                          padding: '8px',
                          borderRadius: '4px',
                          border: '1px solid #e1e3e6'
                        }}
                      />
                    </div>
                    <div style={{ alignSelf: 'center' }}>:</div>
                    <div>
                      <div>{match.team2Name}</div>
                      <input
                        type="number"
                        value={penaltiesTeam2}
                        onChange={(e) => setPenaltiesTeam2(parseInt(e.target.value) || 0)}
                        min="0"
                        max="20"
                        style={{
                          width: '80px',
                          padding: '8px',
                          borderRadius: '4px',
                          border: '1px solid #e1e3e6'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button
              size="l"
              mode="primary"
              onClick={handleEndMatch}
              disabled={loading}
              style={{ marginTop: '24px', width: '100%' }}
            >
              {loading ? 'Завершение матча...' : 'Завершить матч'}
            </Button>
          </>
        )}
        
        <Button
          size="l"
          mode="secondary"
          onClick={onBack}
          style={{ marginTop: '16px', width: '100%' }}
        >
          Назад к списку матчей
        </Button>
      </Div>
    </Group>
  );
};

export default MatchProtocols;