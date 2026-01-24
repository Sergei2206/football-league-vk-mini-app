import React, { useEffect, useState } from 'react';
import { Root, View, Panel, PanelHeader, Spinner, Div } from '@vkontakte/vkui';
import { initVK, getUserInfo } from './vk';
import PublicTournamentView from './tabs/PublicTournamentView';

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    
    const initializeApp = async () => {
      try {
        initVK();
        const userData = await getUserInfo();
        
        // Проверяем, гость ли пользователь
        const isGuestUser = userData.is_guest || !userData.id;
        setIsGuest(isGuestUser);
        setUser(userData);
      } catch (error) {
        console.warn('Failed to get user info, using guest mode:', error);
        setIsGuest(true);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (loading) {
    return (
      <Root activeView="loading">
        <View id="loading" activePanel="loading">
          <Panel id="loading">
            <PanelHeader>Загрузка...</PanelHeader>
            <Div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <Spinner size="medium" />
            </Div>
          </Panel>
        </View>
      </Root>
    );
  }

  return (
    <Root activeView="main">
      <View id="main" activePanel="main">
        <Panel id="main">
          <PublicTournamentView user={isGuest ? null : user} />
        </Panel>
      </View>
    </Root>
  );
};

export default App;