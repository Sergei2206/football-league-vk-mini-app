// src/tabs/captain/MatchSchedule.tsx
import React from 'react';
import { Group, Div, Text } from '@vkontakte/vkui';
import { Icon28CalendarOutline } from '@vkontakte/icons';

interface MatchScheduleProps {
  tournament: any;
  user: any;
  onSnackbar: (message: string) => void;
}

const MatchSchedule = ({ tournament, user, onSnackbar }: MatchScheduleProps) => {
  return (
    <Div style={{ padding: '16px' }}>
      <Group header="Расписание матчей">
        <Div style={{ textAlign: 'center', padding: '32px 0' }}>
          <Icon28CalendarOutline width={48} height={48} style={{ color: 'var(--vkui--color_icon_secondary)', marginBottom: '16px' }} />
          <Text style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
            Расписание будет доступно позже
          </Text>
          <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
            Администратор турнира опубликует расписание матчей
          </Text>
        </Div>
      </Group>
    </Div>
  );
};

export default MatchSchedule;

