import React, { useEffect, useState } from 'react';
import { Root, View, Panel, Div, Spinner } from '@vkontakte/vkui';
import { initVK, getUserInfo } from './vk';
import RoleSelector from './tabs/RoleSelector';
import AdminDashboard from './tabs/AdminDashboard';
import PublicView from './tabs/PublicView';

type UserRole = 'guest' | 'captain' | 'admin';
interface UserContext {
  role: UserRole;
  tournaments?: any[];
  teams?: any[];
}

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [context, setContext] = useState<UserContext>({ role: 'guest' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        initVK();
        const userData = await getUserInfo();
        setUser(userData);
        const userContext = await determineUserRoles(userData.id);
        setContext(userContext);
      } catch (err) {
        setContext({ role: 'guest' });
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

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

  if (context.role === 'admin' && context.teams && context.teams.length > 0) {
    return <RoleSelector user={user} context={context} />;
  }

  switch (context.role) {
    case 'admin':
      return <AdminDashboard user={user} tournaments={context.tournaments || []} />;
    case 'captain':
      return <PublicView user={user} />; // или CaptainPanel
    default:
      return <PublicView />;
  }
};

// Имитация определения ролей (реализуй через Firebase)
const determineUserRoles = async (userId: number) => {
  // Здесь должен быть запрос к Firestore
  return { role: 'admin' as const, tournaments: [], teams: [] };
};

export default App;