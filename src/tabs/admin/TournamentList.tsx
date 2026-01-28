import React from 'react';
import { Group, Cell, Button } from '@vkontakte/vkui';
import { Tournament } from '../../types';

interface TournamentListProps {
  tournaments: Tournament[];
  onTournamentSelect: (tournament: Tournament) => void;
  onCreateTournamentClick: () => void;
  onDeleteAlert: (alert: { id: string; name: string }) => void;
}

const TournamentList = ({ tournaments, onTournamentSelect, onCreateTournamentClick, onDeleteAlert }: TournamentListProps) => {
  return (
    <>
      <Button size="l" mode="primary" onClick={onCreateTournamentClick}>
        Создать турнир
      </Button>

      <Group header="Ваши турниры">
        {tournaments.length === 0 ? (
          <Cell>Нет созданных турниров</Cell>
        ) : (
          tournaments.map(t => (
            <Cell
              key={t.id}
              onClick={() => onTournamentSelect(t)}
              after={
                <Button
                  size="s"
                  mode="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteAlert({ id: t.id!, name: t.name });
                  }}
                >
                  Удалить
                </Button>
              }
            >
              {t.name}
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                {t.type === 'league' ? 'Чемпионат' : 'Кубок'}
                {t.season && ` • Сезон ${t.season}`}
              </div>
            </Cell>
          ))
        )}
      </Group>
    </>
  );
};

export default TournamentList;