import React, { useState } from 'react';
import { Group, Div, Input, Button, Cell } from '@vkontakte/vkui';

interface TournamentScheduleProps {
  tournament: any;
  user: any;
  onSnackbar: (message: string) => void;
}

const TournamentSchedule = ({ tournament, user, onSnackbar }: TournamentScheduleProps) => {
  const [scheduleCreated, setScheduleCreated] = useState(false);
  const [firstMatchDate, setFirstMatchDate] = useState<string>('');
  const [schedule, setSchedule] = useState<string[]>([]);

  const generateSchedule = () => {
    if (!firstMatchDate) {
      onSnackbar('Выберите дату первого матча');
      return;
    }
    
    const startDate = new Date(firstMatchDate);
    const daysBetweenMatches = 7;
    const numberOfTeams = 8; // Заглушка - нужно получать реальное количество команд
    let totalRounds = 2; // Заглушка
    
    const roundsForLeague = (numberOfTeams - 1) * (tournament.rounds || 2);
    totalRounds = tournament.type === 'league' ? roundsForLeague : 4;
    
    const generatedSchedule = [];
    for (let i = 0; i < totalRounds; i++) {
      const matchDate = new Date(startDate);
      matchDate.setDate(startDate.getDate() + (i * daysBetweenMatches));
      generatedSchedule.push(matchDate.toISOString().split('T')[0]);
    }
    
    setSchedule(generatedSchedule);
    setScheduleCreated(true);
    onSnackbar('Расписание создано!');
  };

  return (
    <Group header="Расписание турнира">
      <Div style={{ padding: '16px' }}>
        {!scheduleCreated ? (
          <>
            <Input
              type="date"
              value={firstMatchDate}
              onChange={(e) => setFirstMatchDate(e.target.value)}
              placeholder="Дата первого матча"
            />
            <Button
              size="l"
              mode="primary"
              onClick={generateSchedule}
              style={{ marginTop: '16px' }}
              disabled={!firstMatchDate}
            >
              Создать расписание
            </Button>
          </>
        ) : (
          <Button
            size="l"
            mode="secondary"
            onClick={() => {
              setScheduleCreated(false);
              setSchedule([]);
            }}
          >
            Пересоздать расписание
          </Button>
        )}
      </Div>
      
      {schedule.length > 0 && (
        <Div style={{ padding: '0 16px 16px' }}>
          {schedule.map((date, index) => (
            <Cell key={index}>
              Тур {index + 1}: {date}
            </Cell>
          ))}
        </Div>
      )}
    </Group>
  );
};

export default TournamentSchedule;