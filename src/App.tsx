import React, { useEffect, useState } from 'react';
import { Root, View, Panel, Div, Spinner, Snackbar, Alert } from '@vkontakte/vkui';
import vkBridge from '@vkontakte/vk-bridge';

// Утилиты
import { isAppAdmin, isSuperAdmin } from './utils/appAdmins';

// Компоненты
import RoleSelector from './tabs/RoleSelector';
import AdminDashboard from './tabs/AdminDashboard';
import SuperAdminPanel from './tabs/SuperAdminPanel';
import PublicView from './tabs/PublicView';

// Типы
type UserRole = 'guest' | 'captain' | 'admin' | 'superadmin';

interface Tournament {
  id: string;
  name: string;
  adminVkId: number;
  coAdmins?: number[];
  type: 'league' | 'cup';
  format: string;
  startDate: any;
  logoUrl?: string;
}

interface Team {
  id: string;
  name: string;
  tournamentId: string;
  captainVkId: number;
  logoUrl?: string;
}

const SUPER_ADMIN_ID = 91747933;

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<UserRole>('guest');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [isVKEnvironment, setIsVKEnvironment] = useState(false);

  // Инициализация VK Bridge
  useEffect(() => {
    const initApp = async () => {
      try {
        // Проверяем, поддерживает ли среда VK Bridge
        if (typeof window !== 'undefined' && vkBridge) {
          setIsVKEnvironment(true);
          
          // Инициализируем VK Bridge
          if (vkBridge.supports('VKWebAppInit')) {
            await vkBridge.send('VKWebAppInit');
          }

          // Получаем данные пользователя
          const userData = await vkBridge.send('VKWebAppGetUserInfo');
          setUser(userData);
          
          // Определяем роль
          await determineUserRole(userData.id);
        } else {
          // Не во ВКонтакте
          setIsVKEnvironment(false);
        }
      } catch (err) {
        console.error('Ошибка инициализации:', err);
        setIsVKEnvironment(false);
      } finally {
        setLoading(false);
      }
    };

    initApp();
  }, []);

  // Определение роли пользователя
  const determineUserRole = async (userId: number) => {
    try {
      // Главный админ
      if (userId === SUPER_ADMIN_ID) {
        setRole('superadmin');
        return;
      }

      // Админ приложения
      const isAdmin = await isAppAdmin(userId);
      if (isAdmin) {
        setRole('admin');
        return;
      }

      // Капитан команды
      const { db } = await import('./firebase');
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      
      const teamQ = query(collection(db, 'teams'), where('captainVkId', '==', userId));
      const teamSnap = await getDocs(teamQ);
      const userTeams: Team[] = [];
      teamSnap.docs.forEach(doc => userTeams.push({ id: doc.id, ...doc.data() } as Team));

      if (userTeams.length > 0) {
        setTeams(userTeams);
        setRole('captain');
      } else {
        setRole('guest');
      }
    } catch (err) {
      console.error('Ошибка определения роли:', err);
      setRole('guest');
      setSnackbar('Не удалось загрузить данные');
    }
  };

  // Обработка выбора роли
  const handleRoleSelected = (newRole: UserRole) => {
    setSelectedRole(newRole);
  };

  // Заглушка для внешних пользователей
  if (!isVKEnvironment && !loading) {
    return (
      <Div style={{ padding: 20, textAlign: 'center' }}>
        <h2>⚽ Футбольная Алмазная Лига</h2>
        <p>Приложение доступно только во ВКонтакте</p>
        <a href="https://vk.com/app54429454" style={{ color: '#0077ff' }}>
          Открыть в VK
        </a>
      </Div>
    );
  }

  if (loading) {
    return (
      <Root activeView="loading">
        <View id="loading" activePanel="loading">
          <Panel id="loading">
            <Div style={{ textAlign: 'center', padding: '20px' }}>
              <Spinner size="medium" />
            </Div>
          </Panel>
        </View>
      </Root>
    );
  }

  // Выбор роли при нескольких возможностях
  if ((role === 'admin' || role === 'superadmin') && teams.length > 0 && !selectedRole) {
    return <RoleSelector onRoleSelected={handleRoleSelected} />;
  }

  const effectiveRole = selectedRole || role;

  return (
    <Root activeView="main">
      <>
        <View id="main" activePanel="main">
          <Panel id="main">
            {effectiveRole === 'superadmin' ? (
              <SuperAdminPanel user={user} />
            ) : effectiveRole === 'admin' ? (
              <AdminDashboard user={user} tournaments={tournaments} />
            ) : effectiveRole === 'captain' ? (
              <PublicView user={user} teams={teams} />
            ) : (
              <PublicView />
            )}
          </Panel>
        </View>

        {snackbar && (
          <Snackbar duration={3000} onClose={() => setSnackbar(null)}>
            {snackbar}
          </Snackbar>
        )}
      </>
    </Root>
  );
};

export default App;