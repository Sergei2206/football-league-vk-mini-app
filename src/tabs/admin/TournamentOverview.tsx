import React, { useState, useEffect } from 'react';
import { Group, Cell, Div, Button } from '@vkontakte/vkui';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc, addDoc, collection } from 'firebase/firestore';

interface TournamentOverviewProps {
  tournament: any;
  user: any;
  onSnackbar: (message: string) => void;
}

const TournamentOverview = ({ tournament, user, onSnackbar }: TournamentOverviewProps) => {
  const [currentTournament, setCurrentTournament] = useState(tournament);
  const [isSeasonStarted, setIsSeasonStarted] = useState(false);
  const [scheduleCreated, setScheduleCreated] = useState(false);

  const loadTournamentData = async () => {
    if (!tournament?.id) return;
    
    try {
      const docRef = doc(db, 'tournaments', tournament.id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCurrentTournament({
          id: tournament.id,
          ...data
        });
        setIsSeasonStarted(data.isSeasonStarted || false);
        setScheduleCreated(data.scheduleCreated || false);
      }
    } catch (err) {
      console.error('Ошибка загрузки данных турнира:', err);
    }
  };

  useEffect(() => {
    loadTournamentData();
  }, [tournament?.id]);

  const startSeason = async () => {
    if (!currentTournament?.id) return;
    
    try {
      await updateDoc(doc(db, 'tournaments', currentTournament.id), {
        isSeasonStarted: true
      });
      setIsSeasonStarted(true);
      onSnackbar('Сезон начат! Теперь изменения требуют согласования.');
    } catch (err) {
      console.error('Ошибка начала сезона:', err);
      onSnackbar('Не удалось начать сезон');
    }
  };

  const createNextSeason = async () => {
    if (!currentTournament) return;
    
    try {
      const currentYear = currentTournament.season ? parseInt(currentTournament.season.split('/')[0]) : new Date().getFullYear();
      const nextSeason = `${currentYear + 1}/${currentYear + 2}`;
      
      const data = {
        name: currentTournament.name,
        adminVkId: currentTournament.adminVkId,
        coAdmins: currentTournament.coAdmins,
        type: currentTournament.type,
        format: currentTournament.format,
        createdAt: new Date(),
        season: nextSeason,
        disqualificationCards: currentTournament.disqualificationCards,
        rounds: currentTournament.rounds,
        hasPlayoff: currentTournament.hasPlayoff,
        playoffTeams: currentTournament.playoffTeams,
        playoffWins: currentTournament.playoffWins,
        penaltiesAfterDraw: currentTournament.penaltiesAfterDraw,
        winPoints: currentTournament.winPoints,
        drawPoints: currentTournament.drawPoints,
        penaltyWinPoints: currentTournament.penaltyWinPoints,
        lossPoints: currentTournament.lossPoints,
        matchDay: currentTournament.matchDay
      };
      
      await addDoc(collection(db, 'tournaments'), data);
      onSnackbar('Следующий сезон создан!');
    } catch (err) {
      console.error('Ошибка создания следующего сезона:', err);
      onSnackbar('Не удалось создать следующий сезон');
    }
  };

  // Форматирование формата игры
  const getFormatLabel = (format: string) => {
    switch (format) {
      case 'football11': return 'Футбол 11×11';
      case 'mini8': return 'Мини-футбол 8×8';
      case 'futsal': return 'Футзал 5×5';
      default: return format;
    }
  };

  // Форматирование дня недели
  const getMatchDayLabel = (matchDay: string) => {
    const days: Record<string, string> = {
      'monday': 'Понедельник',
      'tuesday': 'Вторник',
      'wednesday': 'Среда',
      'thursday': 'Четверг',
      'friday': 'Пятница',
      'saturday': 'Суббота',
      'sunday': 'Воскресенье',
      '': 'Любой день'
    };
    return days[matchDay] || matchDay;
  };

  const isLeague = currentTournament?.type === 'league';
  const isCup = currentTournament?.type === 'cup';

  return (
    <Group>
      <Cell>
        <strong>Тип:</strong> {isLeague ? 'Чемпионат' : 'Кубок'}
      </Cell>
      <Cell>
        <strong>Формат:</strong> {getFormatLabel(currentTournament.format || 'football11')}
      </Cell>
      <Cell>
        <strong>Карточки для дисквалификации:</strong> {currentTournament.disqualificationCards || 2}
      </Cell>
      <Cell>
        <strong>День матчей:</strong> {getMatchDayLabel(currentTournament.matchDay || '')}
      </Cell>

      {/* Настройки специфичные для чемпионата */}
      {isLeague && (
        <>
          <Cell>
            <strong>Количество кругов:</strong> {currentTournament.rounds || 2}
          </Cell>
          <Cell>
            <strong>Система очков:</strong> Победа: {currentTournament.winPoints || 3}, 
            Ничья: {currentTournament.drawPoints || 1}, 
            Ничья+пенальти: {currentTournament.penaltyWinPoints || 2}, 
            Поражение: {currentTournament.lossPoints || 0}
          </Cell>
        </>
      )}

      {/* Настройки плей-офф/кубка */}
      {(isLeague && currentTournament.hasPlayoff) || isCup ? (
        <>
          <Cell>
            <strong>{isCup ? 'Турнирная сетка кубка' : 'Стадия плей-офф'}:</strong> Включена
          </Cell>
          <Cell>
            <strong>Количество команд в сетке:</strong> {currentTournament.playoffTeams || (isCup ? 8 : 4)}
          </Cell>
          <Cell>
            <strong>До скольки побед:</strong> {currentTournament.playoffWins || 1}
          </Cell>
        </>
      ) : isLeague && !currentTournament.hasPlayoff ? (
        <Cell>
          <strong>Стадия плей-офф:</strong> Отключена
        </Cell>
      ) : null}

      <Cell>
        <strong>Пенальти после ничьей:</strong> {currentTournament.penaltiesAfterDraw ? 'Да' : 'Нет'}
      </Cell>

      {currentTournament.season && (
        <Div style={{ padding: '16px' }}>
          <Button
            size="l"
            mode="primary"
            onClick={createNextSeason}
          >
            Создать следующий сезон
          </Button>
        </Div>
      )}
    </Group>
  );
};

export default TournamentOverview;