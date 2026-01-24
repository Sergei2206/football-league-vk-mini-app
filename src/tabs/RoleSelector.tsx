import React from 'react';
import { Div, Group, Cell, PanelHeader } from '@vkontakte/vkui';
import { useNavigate } from '@vkontakte/vk-mini-apps-router';

interface RoleSelectorProps {
  user: any;
  context: {
    tournaments?: any[];
    teams?: any[];
  };
}

const RoleSelector = ({ user, context }: RoleSelectorProps) => {
  const navigate = useNavigate();

  return (
    <Div>
      <Group header={<PanelHeader>Выберите роль</PanelHeader>}>
        {context.tournaments && context.tournaments.length > 0 && (
          <Cell
            onClick={() => navigate('/admin')}
            description="Управление турнирами"
          >
            Администратор
          </Cell>
        )}

        {context.teams && context.teams.length > 0 && (
          <Cell
            onClick={() => navigate('/captain')}
            description={`Команды: ${context.teams.length}`}
          >
            Капитан
          </Cell>
        )}

        <Cell
          onClick={() => navigate('/public')}
          description="Только просмотр"
        >
          Гость
        </Cell>
      </Group>
    </Div>
  );
};

export default RoleSelector;