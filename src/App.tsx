import React, { useState, useEffect } from 'react';
import {
  AppRoot,
  SplitLayout,
  SplitCol,
  View,
  Panel,
  PanelHeader,
  PanelHeaderBack,
  ConfigProvider,
  AdaptivityProvider,
  useAdaptivityWithJSMediaQueries,
  Snackbar,
  ScreenSpinner,
  Div,
  Title,
  Text,
  Card,
  CardGrid,
  Avatar,
  Counter
} from '@vkontakte/vkui';
import {
  Icon28UserCircleOutline,
  Icon28CupOutline,
  Icon28Users3Outline,
  Icon28ChevronBack
} from '@vkontakte/icons';

// Импорты компонентов
import PublicView from './tabs/PublicView';
import SuperAdminPanel from './tabs/SuperAdminPanel';
import AdminDashboard from './tabs/admin/AdminDashboard';
import TournamentDetail from './tabs/admin/TournamentDetail';
import CaptainDashboard from './tabs/captain/CaptainDashboard';
import CaptainTournament from './tabs/captain/CaptainTournament';
import TeamRoster from './tabs/captain/TeamRoster';
import AddPlayer from './tabs/captain/AddPlayer';
import MatchSchedule from './tabs/captain/MatchSchedule';
import CompletedMatches from './tabs/captain/CompletedMatches';

const NavigationIcon = ({ icon: Icon, label, counter, onClick, active }: any) => (
  <Div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '8px',
      borderRadius: '12px',
      backgroundColor: active ? 'var(--vkui--color_background_accent)' : 'transparent',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }}
    onClick={onClick}
  >
    <div style={{ position: 'relative' }}>
      <Icon width={24} height={24} fill={active ? 'white' : 'var(--vkui--color_icon_secondary)'} />
      {counter > 0 && (
        <Counter size="s" style={{ position: 'absolute', top: '-4px', right: '-4px' }}>
          {counter}
        </Counter>
      )}
    </div>
    <Text
      style={{
        fontSize: '12px',
        marginTop: '4px',
        color: active ? 'white' : 'var(--vkui--color_text_secondary)'
      }}
    >
      {label}
    </Text>
  </Div>
);

const App = () => {
  const { isDesktop } = useAdaptivityWithJSMediaQueries();
  const [activePanel, setActivePanel] = useState('public');
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'guest' | 'admin' | 'superadmin' | 'captain'>('guest');
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);

  useEffect(() => {
    const initUser = async () => {
      try {
        setUser({
          id: 91747933,
          first_name: 'Сергей',
          last_name: 'Застрогин',
          photo_50: 'https://vk.com/images/question_50.png'
        });
        setUserRole('captain');
      } catch (error) {
        console.error('Ошибка инициализации:', error);
      } finally {
        setLoading(false);
      }
    };
    initUser();
  }, []);

  const showSnackbar = (message: string) => {
    setSnackbar(message);
    setTimeout(() => setSnackbar(null), 3000);
  };

  const navigateTo = (view: string, panel: string) => {
    setActivePanel(panel);
  };

  const goBack = () => {
    if (activePanel === 'tournament-detail') {
      setActivePanel('admin-dashboard');
    } else if (activePanel === 'captain-tournament') {
      setActivePanel('captain-dashboard');
    } else if (activePanel === 'team-roster') {
      setActivePanel('captain-tournament');
    } else if (activePanel === 'add-player') {
      setActivePanel('team-roster');
    } else if (activePanel === 'match-schedule') {
      setActivePanel('captain-tournament');
    } else if (activePanel === 'completed-matches') {
      setActivePanel('captain-tournament');
    } else {
      setActivePanel('public');
    }
  };

  const shouldShowBackButton = () => {
    return ['tournament-detail', 'captain-tournament', 'team-roster', 'add-player', 'match-schedule', 'completed-matches'].includes(activePanel);
  };

  if (loading) {
    return (
      <AdaptivityProvider>
        <ConfigProvider appearance="light">
          <AppRoot>
            <ScreenSpinner state="loading" />
          </AppRoot>
        </ConfigProvider>
      </AdaptivityProvider>
    );
  }

  return (
    <AdaptivityProvider>
      <ConfigProvider appearance="light">
        <AppRoot>
          <SplitLayout
            header={!isDesktop && <PanelHeader separator={false} />}
            style={{ justifyContent: 'center' }}
          >
            <SplitCol
              spaced={isDesktop}
              animate={!isDesktop}
              width={isDesktop ? '560px' : '100%'}
              maxWidth={isDesktop ? '560px' : '100%'}
            >
              <View activePanel={activePanel}>
                <Panel id="public" nav="public">
                  <PanelHeader>Футбольная лига Мирный</PanelHeader>
                  <PublicView 
                    onNavigate={navigateTo} 
                    onSnackbar={showSnackbar}
                    tournaments={[]}
                  />
                </Panel>

                <Panel id="superadmin" nav="superadmin">
                  <PanelHeader>Супер Админка</PanelHeader>
                  <SuperAdminPanel onSnackbar={showSnackbar} />
                </Panel>

                <Panel id="admin-dashboard" nav="admin-dashboard">
                  <PanelHeader>Панель администратора</PanelHeader>
                  <AdminDashboard 
                    onNavigate={navigateTo} 
                    onSnackbar={showSnackbar}
                    onSelectTournament={setSelectedTournament}
                  />
                </Panel>

                <Panel id="tournament-detail" nav="tournament-detail">
                  <PanelHeader
                    before={shouldShowBackButton() && <PanelHeaderBack onClick={goBack} />}
                  >
                    {selectedTournament?.name || 'Турнир'}
                  </PanelHeader>
                  <TournamentDetail 
                    tournament={selectedTournament}
                    onNavigate={navigateTo}
                    onSnackbar={showSnackbar}
                    onBack={goBack}
                  />
                </Panel>

                <Panel id="captain-dashboard" nav="captain-dashboard">
                  <PanelHeader>Мои команды</PanelHeader>
                  <CaptainDashboard 
                    user={user}
                    onNavigate={navigateTo}
                    onSnackbar={showSnackbar}
                    onSelectTournament={setSelectedTournament}
                  />
                </Panel>

                <Panel id="captain-tournament" nav="captain-tournament">
                  <PanelHeader
                    before={shouldShowBackButton() && <PanelHeaderBack onClick={goBack} />}
                  >
                    {selectedTournament?.name || 'Команда'}
                  </PanelHeader>
                  <CaptainTournament 
                    tournament={selectedTournament}
                    user={user}
                    onNavigate={navigateTo}
                    onSnackbar={showSnackbar}
                    onBack={goBack}
                  />
                </Panel>

                <Panel id="team-roster" nav="team-roster">
                  <PanelHeader
                    before={<PanelHeaderBack onClick={goBack} />}
                  >
                    Состав команды
                  </PanelHeader>
                  <TeamRoster 
                    tournament={selectedTournament}
                    user={user}
                    onSnackbar={showSnackbar}
                    onAddPlayer={() => navigateTo('main', 'add-player')}
                  />
                </Panel>

                <Panel id="add-player" nav="add-player">
                  <PanelHeader
                    before={
                      <div
                        onClick={goBack}
                        aria-label="Назад"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          cursor: 'pointer'
                        }}
                      >
                        <Icon28ChevronBack />
                      </div>
                    }
                  >
                    Добавить игрока
                  </PanelHeader>
                  <AddPlayer 
                    tournament={selectedTournament}
                    user={user}
                    onBack={goBack}
                    onSnackbar={showSnackbar}
                  />
                </Panel>

                <Panel id="match-schedule" nav="match-schedule">
                  <PanelHeader
                    before={<PanelHeaderBack onClick={goBack} />}
                  >
                    Расписание матчей
                  </PanelHeader>
                  <MatchSchedule 
                    tournament={selectedTournament}
                    user={user}
                    onSnackbar={showSnackbar}
                  />
                </Panel>

                <Panel id="completed-matches" nav="completed-matches">
                  <PanelHeader
                    before={<PanelHeaderBack onClick={goBack} />}
                  >
                    Завершённые матчи
                  </PanelHeader>
                  <CompletedMatches 
                    tournament={selectedTournament}
                    user={user}
                    onSnackbar={showSnackbar}
                  />
                </Panel>
              </View>
            </SplitCol>

            {isDesktop && userRole !== 'guest' && (
              <SplitCol width="280px" maxWidth="280px" fixed>
                <Div style={{ padding: '20px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <Avatar size={48} fallbackIcon={<Icon28UserCircleOutline />} />
                    <div>
                      <Title level="3" style={{ fontSize: '16px', fontWeight: '600' }}>
                        {user?.first_name} {user?.last_name}
                      </Title>
                      <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
                        {userRole === 'superadmin' ? 'Супер Админ' : 
                         userRole === 'admin' ? 'Администратор' : 
                         userRole === 'captain' ? 'Капитан' : 'Гость'}
                      </Text>
                    </div>
                  </div>

                  <CardGrid size="s">
                    {userRole === 'superadmin' && (
                      <>
                        <Card>
                          <NavigationIcon
                            icon={Icon28CupOutline}
                            label="Турниры"
                            onClick={() => navigateTo('main', 'admin-dashboard')}
                            active={activePanel === 'admin-dashboard'}
                          />
                        </Card>
                        <Card>
                          <NavigationIcon
                            icon={Icon28Users3Outline}
                            label="Админы"
                            onClick={() => navigateTo('main', 'superadmin')}
                            active={activePanel === 'superadmin'}
                          />
                        </Card>
                      </>
                    )}

                    {userRole === 'admin' && (
                      <Card>
                        <NavigationIcon
                          icon={Icon28CupOutline}
                          label="Мои турниры"
                          onClick={() => navigateTo('main', 'admin-dashboard')}
                          active={activePanel === 'admin-dashboard'}
                        />
                      </Card>
                    )}

                    {userRole === 'captain' && (
                      <Card>
                        <NavigationIcon
                          icon={Icon28Users3Outline}
                          label="Мои команды"
                          onClick={() => navigateTo('main', 'captain-dashboard')}
                          active={activePanel === 'captain-dashboard'}
                        />
                      </Card>
                    )}
                  </CardGrid>
                </Div>
              </SplitCol>
            )}
          </SplitLayout>

          {snackbar && (
            <Snackbar
              layout="vertical"
              onClose={() => setSnackbar(null)}
              duration={3000}
            >
              {snackbar}
            </Snackbar>
          )}
        </AppRoot>
      </ConfigProvider>
    </AdaptivityProvider>
  );
};

export default App;

