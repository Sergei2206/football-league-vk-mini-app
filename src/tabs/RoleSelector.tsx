import React from 'react';
import { Div, Group, Cell, PanelHeader } from '@vkontakte/vkui';

interface RoleSelectorProps {
  onRoleSelected: (role: 'admin' | 'captain' | 'guest') => void;
}

const RoleSelector = ({ onRoleSelected }: RoleSelectorProps) => {
  return (
    <Div>
      <Group header={<PanelHeader>Выберите роль</PanelHeader>}>
        <Cell 
          onClick={() => onRoleSelected('admin')} 
          subtitle="Управление турнирами"
        >
          Администратор
        </Cell>
        <Cell 
          onClick={() => onRoleSelected('captain')} 
          subtitle="Управление своей командой"
        >
          Капитан
        </Cell>
        <Cell 
          onClick={() => onRoleSelected('guest')} 
          subtitle="Только просмотр"
        >
          Гость
        </Cell>
      </Group>
    </Div>
  );
};

export default RoleSelector;