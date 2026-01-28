import React, { useState, useEffect } from 'react';
import { 
  Div, 
  FormLayout, 
  Input, 
  Button, 
  Group, 
  Cell, 
  Snackbar,
  Spinner
} from '@vkontakte/vkui';
import vkBridge from '@vkontakte/vk-bridge';
import { getAppAdmins, addAppAdmin, removeAppAdmin } from '../utils/appAdmins';

interface SuperAdminPanelProps {
  user: any;
}

const SuperAdminPanel = ({ user }: SuperAdminPanelProps) => {
  const [admins, setAdmins] = useState<{ id: number; name?: string }[]>([]);
  const [newAdminId, setNewAdminId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const fetchUserNames = async (adminIds: number[]) => {
    const users: Record<number, string> = {};
    const promises = adminIds.map(async (id) => {
      try {
        const userData = await vkBridge.send('VKWebAppGetUserInfo', { user_id: id });
        users[id] = `${userData.first_name} ${userData.last_name}`;
      } catch (err) {
        console.warn(`Не удалось получить данные для ID ${id}`);
        users[id] = 'Пользователь не найден';
      }
    });
    await Promise.all(promises);
    return users;
  };

  const loadAdmins = async () => {
    try {
      setFetching(true);
      const data = await getAppAdmins();
      const adminIds = Array.isArray(data.admins) ? data.admins : [];
      const userNames = await fetchUserNames(adminIds);
      const adminsList = adminIds.map(id => ({
        id,
        name: userNames[id]
      }));
      setAdmins(adminsList);
    } catch (err) {
      console.error('Ошибка загрузки админов:', err);
      setSnackbar('Не удалось загрузить список админов');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleAddAdmin = async () => {
    const cleanId = newAdminId.replace(/\D/g, '');
    if (!cleanId) {
      setSnackbar('Введите корректный VK ID');
      return;
    }
    const id = parseInt(cleanId, 10);
    if (isNaN(id) || id <= 0) {
      setSnackbar('VK ID должен быть положительным числом');
      return;
    }
    try {
      setLoading(true);
      await addAppAdmin(id);
      setNewAdminId('');
      await loadAdmins();
      setSnackbar('Админ добавлен!');
    } catch (err: any) {
      console.error('Ошибка добавления админа:', err);
      setSnackbar('Не удалось добавить админа');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (id: number) => {
    if (id === user.id) {
      setSnackbar('Нельзя удалить себя');
      return;
    }
    try {
      await removeAppAdmin(id);
      await loadAdmins();
    } catch (err) {
      setSnackbar('Ошибка удаления админа');
    }
  };

  return (
    <Div>
      <Group>
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
            style={{ marginTop: '8px' }}
          >
            Добавить админа
          </Button>
        </FormLayout>
      </Group>

      <Group header="Список админов">
        {fetching ? (
          <Div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Spinner size="medium" />
          </Div>
        ) : admins.length === 0 ? (
          <Cell>Нет администраторов</Cell>
        ) : (
          admins.map(admin => (
            <Cell
              key={admin.id}
              after={
                admin.id !== user.id && (
                  <Button
                    size="s"
                    mode="secondary"
                    onClick={() => handleRemoveAdmin(admin.id)}
                  >
                    Удалить
                  </Button>
                )
              }
            >
              {admin.name || `ID: ${admin.id}`}
              <div style={{ 
                fontSize: '13px', 
                color: 'var(--vkui--color_text_secondary)',
                marginTop: '4px'
              }}>
                ID: {admin.id}
              </div>
            </Cell>
          ))
        )}
      </Group>

      {snackbar && (
        <Snackbar duration={3000} onClose={() => setSnackbar(null)}>
          {snackbar}
        </Snackbar>
      )}
    </Div>
  );
};

export default SuperAdminPanel;