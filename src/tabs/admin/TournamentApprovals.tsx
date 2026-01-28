import React from 'react';
import { Group, Cell } from '@vkontakte/vkui';

const TournamentApprovals = () => {
  return (
    <Group header="Заявки на согласование">
      <Cell>Заявка от капитана Команды А на трансфер игрока Иванов И.И.</Cell>
      <Cell>Заявка от капитана Команды Б на трансфер игрока Петров П.П.</Cell>
      <Cell>Заявка от капитана Команды В на изменение логотипа</Cell>
    </Group>
  );
};

export default TournamentApprovals;