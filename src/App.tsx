import React, { useEffect, useState } from 'react';
import { Root, View, Panel, Div, Spinner, Snackbar } from '@vkontakte/vkui';
import vkBridge from '@vkontakte/vk-bridge';

// Утилиты
import { isAppAdmin } from './utils/appAdmins';

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
const isSuperAdmin = (userId: number) => userId === SUPER_ADMIN_ID;

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<UserRole>('guest');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [isVKEnvironment, setIsVKEnvironment] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        if (typeof window !== 'undefined' && vkBridge) {
          setIsVKEnvironment(true);
          
          if (vkBridge.supports('VKWebAppInit')) {
            await vkBridge.send('VKWebAppInit');
          }

          const userData = await vkBridge.send('VKWebAppGetUserInfo');
          setUser(userData);
          await determineUserRole(userData.id);
        } else {
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

  const determineUserRole = async (userId: number) => {
    try {
      if (isSuperAdmin(userId)) {
        setRole('superadmin');
        return;
      }

      const isAdmin = await isAppAdmin(userId);
      if (isAdmin) {
        setRole('admin');
        
        // Загрузка турниров админа
        const { db } = await import('./firebase');
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        
        const q = query(collection(db, 'tournaments'), where('adminVkId', '==', userId));
        const snapshot = await getDocs(q);
        const userTournaments: Tournament[] = [];
        snapshot.docs.forEach(doc => {
          userTournaments.push({ id: doc.id, ...doc.data() } as Tournament);
        });
        setTournaments(userTournaments);
        
        return;
      }

      // Проверка капитанов
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

  const handleRoleSelected = (newRole: UserRole) => {
    setSelectedRole(newRole);
  };

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