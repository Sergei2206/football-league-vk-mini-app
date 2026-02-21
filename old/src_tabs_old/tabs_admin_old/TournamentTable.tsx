import React, { useState, useEffect } from 'react';
import { Group, Div, Spinner, Card } from '@vkontakte/vkui';
import { db } from '../../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { doc, getDoc } from 'firebase/firestore';

interface Team {
  id: string;
  name: string;
  points: number;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor?: number;
  goalsAgainst?: number;
  yellowCards?: number;
  redCards?: number;
  logoUrl?: string;
}

interface PlayoffMatch {
  team1: Team;
  team2: Team;
  team1Score?: number;
  team2Score?: number;
  winner?: Team;
}

const TournamentTable = ({ tournament, onSnackbar }: { tournament: any; onSnackbar: (message: string) => void }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCup, setIsCup] = useState(false);
  const [tournamentData, setTournamentData] = useState(tournament);

  // Загрузка актуальных данных турнира
  useEffect(() => {
    const loadTournamentData = async () => {
      if (!tournament?.id) return;
      try {
        const docRef = doc(db, 'tournaments', tournament.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTournamentData(data);
          setIsCup(data.type === 'cup');
        }
      } catch (err) {
        console.error('Ошибка загрузки данных турнира:', err);
      }
    };
    
    loadTournamentData();
  }, [tournament?.id]);

  const loadTeams = async () => {
    if (!tournament?.id) return;
    
    try {
      setLoading(true);
      
      const q = query(collection(db, 'teams'), where('tournamentId', '==', tournament.id));
      const snapshot = await getDocs(q);
      const teamsList: Team[] = [];
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        teamsList.push({
          id: doc.id,
          name: data.name || 'Команда без названия',
          points: data.points || 0,
          matches: data.matches || 0,
          wins: data.wins || 0,
          draws: data.draws || 0,
          losses: data.losses || 0,
          goalsFor: data.goalsFor || 0,
          goalsAgainst: data.goalsAgainst || 0,
          yellowCards: data.yellowCards || 0,
          redCards: data.redCards || 0,
          logoUrl: data.logoUrl || ''
        });
      });
      
      // Сортировка только для чемпионата
      let sortedTeams = teamsList;
      if (tournament.type === 'league') {
        sortedTeams = teamsList.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.wins !== a.wins) return b.wins - a.wins;
          const aGoalDiff = (a.goalsFor || 0) - (a.goalsAgainst || 0);
          const bGoalDiff = (b.goalsFor || 0) - (b.goalsAgainst || 0);
          if (bGoalDiff !== aGoalDiff) return bGoalDiff - aGoalDiff;
          if ((b.goalsFor || 0) !== (a.goalsFor || 0)) return (b.goalsFor || 0) - (a.goalsFor || 0);
          return a.name.localeCompare(b.name);
        });
      }
      
      setTeams(sortedTeams);
    } catch (err: any) {
      console.error('Ошибка загрузки турнирной таблицы:', err);
      onSnackbar(`Ошибка загрузки: ${err.message || 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, [tournament?.id]);

  const getPlaceColor = (index: number, totalTeams: number): string => {
    if (index === 0) return '#4CAF50';
    if (index === 1) return '#8BC34A';
    if (index === 2) return '#CDDC39';
    if (index === totalTeams - 1) return '#F44336';
    return 'var(--vkui--color_text_primary)';
  };

  const getPlaceBackground = (index: number, totalTeams: number): string => {
    if (index === 0) return 'rgba(76, 175, 80, 0.1)';
    if (index === 1) return 'rgba(139, 195, 74, 0.1)';
    if (index === 2) return 'rgba(205, 220, 57, 0.1)';
    if (index === totalTeams - 1) return 'rgba(244, 67, 54, 0.1)';
    return 'transparent';
  };

  // Генерация сетки плей-офф/кубка
  const generatePlayoffBracket = () => {
    if (!teams.length) return null;
    
    // Для кубка: все команды участвуют в сетке
    // Для чемпионата: только playoffTeams команд
    const playoffTeamsCount = isCup ? teams.length : (tournamentData?.playoffTeams || 4);
    const selectedTeams = teams.slice(0, playoffTeamsCount);
    
    if (selectedTeams.length < 2) return null;
    
    // Распределение по правилу: 1 vs последний, 2 vs предпоследний и т.д.
    const matches: PlayoffMatch[] = [];
    const half = Math.ceil(selectedTeams.length / 2);
    
    for (let i = 0; i < half; i++) {
      const team1 = selectedTeams[i];
      const team2Index = selectedTeams.length - 1 - i;
      const team2 = selectedTeams[team2Index];
      
      if (team2) {
        matches.push({ team1, team2 });
      }
    }
    
    return matches;
  };

  if (loading) {
    return (
      <Div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Spinner size="medium" />
        <div style={{ marginTop: '8px' }}>{isCup ? 'Загрузка турнирной сетки...' : 'Загрузка турнирной таблицы...'}</div>
      </Div>
    );
  }

  if (teams.length === 0) {
    return (
      <Div style={{ padding: '16px' }}>
        <Card mode="outline" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
            {isCup ? 'Турнирная сетка пуста' : 'Турнирная таблица пуста'}
          </div>
          <div style={{ color: '#666' }}>
            Добавьте команды для отображения {isCup ? 'сетки' : 'таблицы'}
          </div>
        </Card>
      </Div>
    );
  }

  const playoffMatches = generatePlayoffBracket();

  return (
    <Group header={isCup ? "Турнирная сетка кубка" : "Турнирная таблица"}>
      {!isCup && (
        <Div style={{ padding: '0 16px' }}>
          {/* Заголовок таблицы (только для чемпионата) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(40px, 1fr) minmax(160px, 2.5fr) repeat(9, minmax(40px, 1fr))',
            gap: '8px',
            padding: '12px 8px',
            backgroundColor: 'var(--vkui--color_background_secondary)',
            borderRadius: '8px',
            marginBottom: '8px',
            fontWeight: 'bold',
            fontSize: '12px',
            color: 'var(--vkui--color_text_secondary)'
          }}>
            <div style={{ textAlign: 'center' }}>М</div>
            <div>Команда</div>
            <div style={{ textAlign: 'center' }}>И</div>
            <div style={{ textAlign: 'center' }}>В</div>
            <div style={{ textAlign: 'center' }}>Н</div>
            <div style={{ textAlign: 'center' }}>П</div>
            <div style={{ textAlign: 'center' }}>З</div>
            <div style={{ textAlign: 'center' }}>П</div>
            <div style={{ textAlign: 'center' }}>Ж</div>
            <div style={{ textAlign: 'center' }}>К</div>
            <div style={{ textAlign: 'center' }}>О</div>
          </div>

          {/* Строки таблицы (только для чемпионата) */}
          {teams.map((team, index) => {
            const placeColor = getPlaceColor(index, teams.length);
            const placeBackground = getPlaceBackground(index, teams.length);
            
            return (
              <div
                key={team.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(40px, 1fr) minmax(160px, 2.5fr) repeat(9, minmax(40px, 1fr))',
                  gap: '8px',
                  padding: '12px 8px',
                  borderRadius: '8px',
                  backgroundColor: placeBackground,
                  transition: 'background-color 0.2s',
                  border: '1px solid var(--vkui--color_field_border_alpha)'
                }}
              >
                <div style={{ 
                  textAlign: 'center', 
                  fontWeight: 'bold',
                  color: placeColor
                }}>
                  {index + 1}
                </div>
                <div style={{ 
                  fontWeight: '500',
                  color: placeColor,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {team.logoUrl && (
                    <img 
                      src={team.logoUrl} 
                      alt="Логотип" 
                      style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '4px',
                        objectFit: 'cover'
                      }}
                    />
                  )}
                  {team.name}
                </div>
                <div style={{ textAlign: 'center' }}>{team.matches}</div>
                <div style={{ textAlign: 'center' }}>{team.wins}</div>
                <div style={{ textAlign: 'center' }}>{team.draws}</div>
                <div style={{ textAlign: 'center' }}>{team.losses}</div>
                <div style={{ textAlign: 'center' }}>{team.goalsFor || 0}</div>
                <div style={{ textAlign: 'center' }}>{team.goalsAgainst || 0}</div>
                <div style={{ textAlign: 'center' }}>{team.yellowCards || 0}</div>
                <div style={{ textAlign: 'center' }}>{team.redCards || 0}</div>
                <div style={{ 
                  textAlign: 'center', 
                  fontWeight: 'bold',
                  color: placeColor
                }}>
                  {team.points}
                </div>
              </div>
            );
          })}
        </Div>
      )}

      {/* Турнирная сетка (для кубка всегда, для чемпионата если есть плей-офф) */}
      {playoffMatches && playoffMatches.length > 0 && (
        <Div style={{ padding: '16px 16px 0' }}>
          {!isCup && (
            <div style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              🏆 Турнирная сетка плей-офф
            </div>
          )}
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            {playoffMatches.map((match, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: 'var(--vkui--color_background_secondary)',
                  borderRadius: '8px',
                  border: '1px solid var(--vkui--color_field_border_alpha)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {match.team1.logoUrl && (
                    <img 
                      src={match.team1.logoUrl} 
                      alt="Логотип" 
                      style={{ width: '20px', height: '20px', borderRadius: '3px' }}
                    />
                  )}
                  <span>{match.team1.name}</span>
                </div>
                
                <div style={{ 
                  minWidth: '60px', 
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: '#0077ff'
                }}>
                  vs
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexDirection: 'row-reverse' }}>
                  {match.team2.logoUrl && (
                    <img 
                      src={match.team2.logoUrl} 
                      alt="Логотип" 
                      style={{ width: '20px', height: '20px', borderRadius: '3px' }}
                    />
                  )}
                  <span>{match.team2.name}</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Показываем информацию о количестве побед */}
          {(tournamentData?.playoffWins && tournamentData.playoffWins > 1) && (
            <Div style={{ textAlign: 'center', fontSize: '12px', color: '#666', marginTop: '8px' }}>
              {isCup ? 'Турнир играется' : 'Серии играются'} до {tournamentData.playoffWins} {getWinWord(tournamentData.playoffWins)}
            </Div>
          )}
        </Div>
      )}

      {/* Легенда (только для чемпионата) */}
      {!isCup && (
        <Div style={{ padding: '16px', fontSize: '12px', color: '#666' }}>
          <div style={{ marginBottom: '8px' }}>
            <strong>Легенда:</strong>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                backgroundColor: '#4CAF50', 
                borderRadius: '2px' 
              }}></div>
              <span>1 место</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                backgroundColor: '#8BC34A', 
                borderRadius: '2px' 
              }}></div>
              <span>2 место</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                backgroundColor: '#CDDC39', 
                borderRadius: '2px' 
              }}></div>
              <span>3 место</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                backgroundColor: '#F44336', 
                borderRadius: '2px' 
              }}></div>
              <span>Последнее место</span>
            </div>
          </div>
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Ж</span> = <span style={{ color: '#FFC107' }}>Жёлтые карточки</span> | 
            <span>К</span> = <span style={{ color: '#F44336' }}>Красные карточки</span>
          </div>
        </Div>
      )}
    </Group>
  );
};

// Вспомогательная функция для склонения слова "победа"
const getWinWord = (count: number): string => {
  if (count % 10 === 1 && count % 100 !== 11) {
    return 'победы';
  } else if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) {
    return 'победы';
  } else {
    return 'побед';
  }
};

export default TournamentTable;