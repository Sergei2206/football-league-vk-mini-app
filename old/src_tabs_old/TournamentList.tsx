import React from 'react';
import { Div, Group, Cell, PanelHeader } from '@vkontakte/vkui';

interface Tournament {
  id: string;
  name: string;
  adminVkId: number;
  type: string;
  startDate: any;
}

interface TournamentListProps {
  tournaments: Tournament[];
  onSelect: (tournament: Tournament) => void;
}

const TournamentList = ({ tournaments, onSelect }: TournamentListProps) => {
  return (
    <Group header={<PanelHeader>Мои турниры</PanelHeader>}>
      {tournaments.length === 0 ? (
        <Div>У вас пока нет турниров</Div>
      ) : (
        tournaments.map(tournament => (
          <Cell
            key={tournament.id}
            subtitle={tournament.type === 'cup' ? 'Кубок' : 'Чемпионат'}
            onClick={() => onSelect(tournament)}
          >
            {tournament.name}
          </Cell>
        ))
      )}
    </Group>
  );
};

export default TournamentList;