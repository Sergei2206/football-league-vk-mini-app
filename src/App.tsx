import React, { useEffect, useState } from 'react';
import {
  ConfigProvider,
  AdaptivityProvider,
  AppRoot,
  Root,
  View,
  Panel,
  Div,
  ScreenSpinner,
  Snackbar,
  PanelHeader,
  PanelHeaderButton,
  Cell,
  useAdaptivityWithJSMediaQueries
} from '@vkontakte/vkui';
import { Icon24MenuOutline } from '@vkontakte/icons';
import vkBridge from '@vkontakte/vk-bridge';

// Компоненты
import SuperAdminPanel from './tabs/SuperAdminPanel';
import AdminDashboard from './tabs/admin/AdminDashboard';
import PublicView from './tabs/PublicView';
import CaptainDashboard from './tabs/captain/CaptainDashboard';

// Утилиты
import { isAppAdmin } from './utils/appAdmins';
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { collection, getDocs, query, where } from 'firebase/firestore';

// Типы
type UserRole = 'guest' | 'admin' | 'superadmin' | 'captain';

const SUPER_ADMIN_ID = 91747933;
const isSuperAdmin = (userId: number) => userId === SUPER_ADMIN_ID;

const isCaptain = async (userId: number) => {
  try {
    const teamsQuery = query(
      collection(db, 'teams'),
      where('captainVkId', '==', userId)
    );
    const snapshot = await getDocs(teamsQuery);
    return !snapshot.empty;
  } catch (err) {
    console.error('Ошибка проверки капитана:', err);
    return false;
  }
};

const Sidebar = ({ 
  user, 
  availableRoles, 
  activeRole, 
  onRoleSelect, 
  onClose 
}: {
  user: any;
  availableRoles: UserRole[];
  activeRole: UserRole;
  onRoleSelect: (role: UserRole) => void;
  onClose: () => void;
}) => {
  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'superadmin': return 'Суперадмин';
      case 'admin': return 'Админ';
      case 'captain': return 'Капитан';
      case 'guest': return 'Гость';
      default: return 'Гость';
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '280px',
        height: '100vh',
        backgroundColor: '#ffffff',
        zIndex: 1001,
        boxShadow: '4px 0 16px rgba(0, 0, 0, 0.25)',
        overflowY: 'auto'
      }}
    >
      {/* Заголовок меню с аватаром */}
      <Div style={{ 
        padding: '20px 20px 16px',
        borderBottom: '1px solid #e1e3e6',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        {/* Маленький аватар-кружок */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '2px solid #e1e3e6'
        }}>
          {user?.photo_100 ? (
            <img 
              src={user.photo_100} 
              alt="Аватар" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#f2f3f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              {user?.first_name?.[0] || '?'}
            </div>
          )}
        </div>
        <div style={{ 
          fontSize: '16px', 
          fontWeight: 600,
          color: '#000000',
          lineHeight: 1.3,
          wordBreak: 'break-word'
        }}>
          {user?.first_name} {user?.last_name}
        </div>
      </Div>

      {/* Выбор ролей */}
      <Div style={{ padding: '20px 20px 20px' }}>
        <div style={{ 
          fontSize: '16px', 
          fontWeight: 600,
          color: '#000000',
          marginBottom: '14px'
        }}>
          Роли
        </div>
        {availableRoles.map((role: UserRole) => (
          <Cell
            key={role}
            onClick={() => {
              onRoleSelect(role);
              onClose();
            }}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '8px',
              backgroundColor: activeRole === role ? '#f2f3f5' : 'transparent',
              color: '#000000',
              fontWeight: activeRole === role ? 600 : 500,
              fontSize: '16px',
              transition: 'background-color 0.2s'
            }}
          >
            {getRoleLabel(role)}
          </Cell>
        ))}
      </Div>
    </div>
  );
};

const Overlay = ({ onClick }: { onClick: () => void }) => {
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000
      }}
      onClick={onClick}
    />
  );
};

const AppContent = () => {
  const [user, setUser] = useState<any>(null);
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([]);
  const [activeRole, setActiveRole] = useState<UserRole>('guest');
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  

  useEffect(() => {
    const initApp = async () => {
      try {
        if (vkBridge.supports('VKWebAppInit')) {
          await vkBridge.send('VKWebAppInit');
        }

        const userData = await vkBridge.send('VKWebAppGetUserInfo');
        setUser(userData);
        
        // === АВТОМАТИЧЕСКОЕ СОЗДАНИЕ/ОБНОВЛЕНИЕ ДАННЫХ ПОЛЬЗОВАТЕЛЯ ===
        const userRef = doc(db, 'vkUsers', userData.id.toString());
        await setDoc(userRef, { 
          id: userData.id, 
          first_name: userData.first_name,
          last_name: userData.last_name,
          photo_50: userData.photo_100 || ''
        }, { merge: true });
        // ========================================================
        
        // Определяем доступные роли
        const roles: UserRole[] = ['guest'];
        
        // Проверяем роль капитана
        if (await isCaptain(userData.id)) {
          roles.push('captain');
        }
        
        // Проверяем роль админа
        if (await isAppAdmin(userData.id)) {
          roles.push('admin');
        }
        
        // Проверяем роль суперадмина
        if (isSuperAdmin(userData.id)) {
          roles.push('superadmin');
        }
        
        setAvailableRoles(roles);
      } catch (err) {
        console.error('Ошибка инициализации:', err);
        setSnackbar('Не удалось загрузить приложение');
      } finally {
        setLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      initApp();
    } else {
      setLoading(false);
      setSnackbar('Приложение доступно только во ВКонтакте');
    }
  }, []);

  if (loading) {
    return (
      <Div style={{ textAlign: 'center', padding: '20px' }}>
        <ScreenSpinner size="large" />
      </Div>
    );
  }

  if (!user && !snackbar) {
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

  const handleRoleSelect = (role: UserRole) => {
    setActiveRole(role);
  };

  const toggleSidebar = () => {
    setShowSidebar(prev => !prev);
  };

  const renderMainContent = () => {
    switch (activeRole) {
      case 'superadmin':
        return <SuperAdminPanel user={user} />;
      case 'admin':
        return <AdminDashboard user={user} />;
      case 'captain':
        return <CaptainDashboard user={user} onSnackbar={(msg) => setSnackbar(msg)} />;
      default:
        return <PublicView />;
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <PanelHeader
        before={
          availableRoles.length > 1 ? (
            <PanelHeaderButton onClick={toggleSidebar}>
              <Icon24MenuOutline />
            </PanelHeaderButton>
          ) : null
        }
      >
      </PanelHeader>
      
      <Root activeView="main">
        <View id="main" activePanel="main">
          <Panel id="main">
            {renderMainContent()}
          </Panel>
        </View>
      </Root>

      {showSidebar && (
        <>
          <Overlay onClick={() => setShowSidebar(false)} />
          <Sidebar 
            user={user}
            availableRoles={availableRoles}
            activeRole={activeRole}
            onRoleSelect={handleRoleSelect}
            onClose={() => setShowSidebar(false)}
          />
        </>
      )}

      {snackbar && (
        <Snackbar duration={3000} onClose={() => setSnackbar(null)}>
          {snackbar}
        </Snackbar>
      )}
    </div>
  );
};

const App = () => {
  return (
    <ConfigProvider>
      <AdaptivityProvider>
        <AppRoot>
          <AppContent />
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  );
};

export default App;