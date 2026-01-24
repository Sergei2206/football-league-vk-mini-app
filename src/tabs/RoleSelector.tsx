import React from 'react';
import { Div, Group, Cell, PanelHeader } from '@vkontakte/vkui';

interface RoleSelectorProps {
  onRoleSelected: (role: 'admin' | 'captain' | 'guest') => void;
}

const RoleSelector = ({ onRoleSelected }: RoleSelectorProps) => {
  return (
    <Div>
      <Group header={<PanelHeader>Выберите роль</PanelHeader>}>
        <Cell onClick={() => onRoleSelected('admin')} description="Управление турнирами">
          Администратор
        </Cell>
        <Cell onClick={() => onRoleSelected('captain')} description="Управление своей командой">
          Капитан
        </Cell>
        <Cell onClick={() => onRoleSelected('guest')} description="Только просмотр">
          Гость
        </Cell>
      </Group>
    </Div>
  );
};

export default RoleSelector;