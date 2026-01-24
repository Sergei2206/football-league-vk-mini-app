import React, { useState, useEffect } from 'react';
import { Div, FormLayout, Input, Button, Group, Cell, Snackbar, Alert } from '@vkontakte/vkui';
import { getAppAdmins, addAppAdmin, removeAppAdmin, isSuperAdmin } from '../utils/appAdmins';

interface SuperAdminPanelProps {
  user: any;
}

const SuperAdminPanel = ({ user }: SuperAdminPanelProps) => {
  const [admins, setAdmins] = useState<number[]>([]);
  const [newAdminId, setNewAdminId] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ id: number; open: boolean }>({ id: 0, open: false });

  const loadAdmins = async () => {
    try {
      const data = await getAppAdmins();
      setAdmins(data.admins || []);
    } catch (err) {
      console.error('Ошибка загрузки админов:', err);
      setSnackbar('Не удалось загрузить список');
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleAddAdmin = async () => {
    const id = parseInt(newAdminId.trim(), 10);
    if (isNaN(id)) {
      setSnackbar('Неверный ID');
      return;
    }

    try {
      setLoading(true);
      await addAppAdmin(id);
      setNewAdminId('');
      await loadAdmins();
      setSnackbar('Администратор добавлен!');
    } catch (err) {
      console.error('Ошибка добавления:', err);
      setSnackbar('Не удалось добавить админа');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = (id: number) => {
    if (id === user.id) {
      setSnackbar('Нельзя удалить себя');
      return;
    }
    setAlert({ id, open: true });
  };

  const confirmRemoveAdmin = async () => {
    try {
      await removeAppAdmin(alert.id);
      await loadAdmins();
    } catch (err) {
      console.error('Ошибка удаления:', err);
      setSnackbar('Не удалось удалить админа');
    } finally {
      setAlert({ id: 0, open: false });
    }
  };

  if (!isSuperAdmin(user.id)) {
    return <Div>Доступ запрещён</Div>;
  }

  return (
    <Div>
      <Group header={<Div>Добавить администратора приложения</Div>}>
        <FormLayout>
          <Input
            placeholder="VK ID пользователя"
            value={newAdminId}
            onChange={(e) => setNewAdminId(e.target.value)}
          />
          <Button
            size="l"
            mode="primary"
            loading={loading}
            onClick={handleAddAdmin}
            style={{ marginTop: 8 }}
          >
            Добавить
          </Button>
        </FormLayout>
      </Group>

      <Group header={<Div>Список администраторов</Div>}>
        {admins.length === 0 ? (
          <Div>Нет администраторов</Div>
        ) : (
          admins.map(id => (
            <Cell
              key={id}
              after={
                id !== user.id && (
                  <Button
                    size="s"
                    mode="secondary"
                    onClick={() => handleRemoveAdmin(id)}
                  >
                    Удалить
                  </Button>
                )
              }
            >
              ID: {id} {id === user.id ? '(вы)' : ''}
            </Cell>
          ))
        )}
      </Group>

      {snackbar && (
        <Snackbar duration={3000} onClose={() => setSnackbar(null)}>
          {snackbar}
        </Snackbar>
      )}

      {alert.open && (
        <Alert
          actions={[
            {
              title: 'Отмена',
              autoClose: true,
              mode: 'cancel'
            },
            {
              title: 'Удалить',
              autoClose: true,
              mode: 'destructive',
              action: confirmRemoveAdmin
            }
          ]}
          onClose={() => setAlert({ id: 0, open: false })}
          header="Подтверждение"
          text="Вы уверены, что хотите удалить администратора?"
        />
      )}
    </Div>
  );
};

export default SuperAdminPanel;