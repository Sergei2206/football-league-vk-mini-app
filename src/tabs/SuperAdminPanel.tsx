// src/tabs/SuperAdminPanel.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Group, List, Cell, Button, Div, FormLayout, Input, Counter } from '@vkontakte/vkui';
import { Icon28UserCircleOutline, Icon28CupOutline, Icon28SettingsOutline, Icon28AddOutline } from '@vkontakte/icons';

interface SuperAdminPanelProps {
  onSnackbar: (message: string) => void;
}

const SuperAdminPanel = ({ onSnackbar }: SuperAdminPanelProps) => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [newAdminId, setNewAdminId] = useState('');

  const loadAdmins = useCallback(async () => {
    try {
      setAdmins([]);
    } catch (error) {
      onSnackbar('Ошибка загрузки админов');
    }
  }, [onSnackbar]);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  const handleAddAdmin = () => {
    if (!newAdminId.trim()) {
      onSnackbar('Введите VK ID администратора');
      return;
    }
    onSnackbar('Администратор добавлен!');
    setNewAdminId('');
  };

  return (
    <div style={{ padding: '0 16px' }}>
      <Div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          borderRadius: '50%', 
          backgroundColor: 'var(--vkui--color_background_accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          color: 'white'
        }}>
          <Icon28UserCircleOutline width={32} height={32} />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 8px' }}>
          Супер Админка
        </h2>
        <p style={{ color: 'var(--vkui--color_text_secondary)' }}>
          Управление администраторами системы
        </p>
      </Div>

      <Group header="Добавить администратора">
        <FormLayout>
          <Input
            value={newAdminId}
            onChange={(e) => setNewAdminId(e.target.value)}
            placeholder="VK ID пользователя"
            type="number"
          />
          <Button
            size="l"
            mode="primary"
            before={<Icon28AddOutline />}
            onClick={handleAddAdmin}
            disabled={!newAdminId.trim()}
          >
            Добавить админа
          </Button>
        </FormLayout>
      </Group>

      <Group 
        header={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Список администраторов</span>
            <Counter>{admins.length}</Counter>
          </div>
        }
      >
        <List>
          {admins.length === 0 ? (
            <Div style={{ textAlign: 'center', color: 'var(--vkui--color_text_secondary)' }}>
              Нет администраторов
            </Div>
          ) : (
            admins.map(admin => (
              <Cell
                key={admin.id}
                before={<Icon28UserCircleOutline />}
                subtitle={`VK ID: ${admin.id}`}
              >
                {admin.first_name} {admin.last_name}
              </Cell>
            ))
          )}
        </List>
      </Group>

      <Group header="Настройки системы">
        <List>
          <Cell
            expandable
            before={<Icon28SettingsOutline />}
            onClick={() => onSnackbar('Настройки открыты')}
          >
            Общие настройки
          </Cell>
          <Cell
            expandable
            before={<Icon28CupOutline />}
            onClick={() => onSnackbar('Настройки турниров')}
          >
            Параметры турниров
          </Cell>
        </List>
      </Group>
    </div>
  );
};

export default SuperAdminPanel;

