import React, { useEffect, useState } from 'react';
import { Root, View, Panel, Div, Spinner, Snackbar } from '@vkontakte/vkui';
import { initVK, getUserInfo } from './vk';
import { db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
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

  // Загрузка данных пользователя
  const loadUserData = async (userId: number) => {
    try {
      // Проверяем, главный ли админ
      if (isSuperAdmin(userId)) {
        setRole('superadmin');
        return;
      }

      // Проверяем, админ ли приложения
      const isAdmin = await isAppAdmin(userId);
      if (isAdmin) {
        setRole('admin');
        return;
      }

      // Проверяем, капитан ли
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
      console.error('Ошибка загрузки данных:', err);
      setRole('guest');
      setSnackbar('Не удалось загрузить данные');
    }
  };

  // Инициализация приложения
  useEffect(() => {
    const init = async () => {
      try {
        initVK();
        const userData = await getUserInfo();
        setUser(userData);
        await loadUserData(userData.id);
      } catch (err) {
        console.warn('Режим гостя:', err);
        setRole('guest');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Обработка выбора роли
  const handleRoleSelected = (newRole: UserRole) => {
    setSelectedRole(newRole);
  };

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

  // Если пользователь имеет несколько ролей — показываем выбор
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