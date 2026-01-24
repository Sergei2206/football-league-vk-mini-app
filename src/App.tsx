import React, { useEffect, useState } from 'react';
import { Root, View, Panel, Div, Spinner, Snackbar } from '@vkontakte/vkui';
import { initVK, getUserInfo } from './vk';
import { db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

// Компоненты
import RoleSelector from './tabs/RoleSelector';
import AdminDashboard from './tabs/AdminDashboard';
import PublicView from './tabs/PublicView';

// Типы
type UserRole = 'guest' | 'captain' | 'admin';

interface Tournament {
  id: string;
  name: string;
  adminVkId: number;
  coAdmins?: number[];
  type: 'league' | 'cup';
  format: string;
  startDate: any; // Firestore Timestamp
  logoUrl?: string;
}

interface Team {
  id: string;
  name: string;
  tournamentId: string;
  captainVkId: number;
  logoUrl?: string;
}

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<UserRole>('guest');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  // Определяем роли пользователя
  const loadUserRoles = async (userId: number) => {
    try {
      // Загружаем турниры, где пользователь — админ или со-админ
      const q1 = query(collection(db, 'tournaments'), where('adminVkId', '==', userId));
      const q2 = query(collection(db, 'tournaments'), where('coAdmins', 'array-contains', userId));
      
      const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      
      const userTournaments: Tournament[] = [];
      snap1.docs.forEach(doc => userTournaments.push({ id: doc.id, ...doc.data() } as Tournament));
      snap2.docs.forEach(doc => {
        const data = doc.data();
        if (data.adminVkId !== userId) {
          userTournaments.push({ id: doc.id, ...data } as Tournament);
        }
      });

      // Загружаем команды, где пользователь — капитан
      const teamQ = query(collection(db, 'teams'), where('captainVkId', '==', userId));
      const teamSnap = await getDocs(teamQ);
      const userTeams: Team[] = [];
      teamSnap.docs.forEach(doc => userTeams.push({ id: doc.id, ...doc.data() } as Team));

      // Определяем основную роль
      if (userTournaments.length > 0) {
        setTournaments(userTournaments);
        setTeams(userTeams);
        setRole('admin');
      } else if (userTeams.length > 0) {
        setTeams(userTeams);
        setRole('captain');
      } else {
        setRole('guest');
      }
    } catch (err) {
      console.error('Ошибка загрузки ролей:', err);
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
        await loadUserRoles(userData.id);
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
  if (role === 'admin' && teams.length > 0 && !selectedRole) {
    return <RoleSelector onRoleSelected={handleRoleSelected} />;
  }

  const effectiveRole = selectedRole || role;

  return (
    <Root activeView="main">
      <View id="main" activePanel="main">
        <Panel id="main">
          {effectiveRole === 'admin' ? (
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
    </Root>
  );
};

export default App;