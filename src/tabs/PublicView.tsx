import React, { useState, useEffect } from 'react';
import { Div, Group, Cell, Spinner, Epic, Tabbar, TabbarItem, PanelHeader } from '@vkontakte/vkui';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import ScheduleTab from './ScheduleTab';
import StandingsTab from './StandingsTab';
import TopScorersTab from './TopScorersTab';

const PublicView = () => {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);
  const [activeStory, setActiveStory] = useState<'schedule' | 'standings' | 'scorers'>('schedule');
  const [loading, setLoading] = useState(true);

  // Загрузка списка турниров
  useEffect(() => {
    const loadTournaments = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'tournaments'));
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        list.sort((a, b) => (b.startDate?.toDate?.() || 0) - (a.startDate?.toDate?.() || 0));
        setTournaments(list);
        
        if (list.length > 0 && !selectedTournament) {
          setSelectedTournament(list[0].id);
        }
      } catch (err) {
        console.error('Ошибка загрузки турниров:', err);
      } finally {
        setLoading(false);
      }
    };
    loadTournaments();
  }, []);

  if (loading) {
    return (
      <Div style={{ textAlign: 'center', padding: '20px' }}>
        <Spinner size="medium" />
      </Div>
    );
  }

  if (tournaments.length === 0) {
    return (
      <Div>
        <PanelHeader>Турниры</PanelHeader>
        <Div>Нет доступных турниров</Div>
      </Div>
    );
  }

  const tournament = tournaments.find(t => t.id === selectedTournament);

  return (
    <>
      {/* Выбор турнира */}
      <Group>
        {tournaments.map(t => (
          <Cell 
            key={t.id} 
            onClick={() => setSelectedTournament(t.id)}
            selected={selectedTournament === t.id}
          >
            {t.name}
          </Cell>
        ))}
      </Group>

      {/* Контент турнира */}
      {tournament && (
        <Epic
          activeStory={activeStory}
          tabbar={
            <Tabbar>
              <TabbarItem
                onClick={() => setActiveStory('schedule')}
                selected={activeStory === 'schedule'}
              >
                Матчи
              </TabbarItem>
              <TabbarItem
                onClick={() => setActiveStory('standings')}
                selected={activeStory === 'standings'}
              >
                Таблица
              </TabbarItem>
              <TabbarItem
                onClick={() => setActiveStory('scorers')}
                selected={activeStory === 'scorers'}
              >
                Бомбардиры
              </TabbarItem>
            </Tabbar>
          }
        >
          <ScheduleTab id="schedule" tournamentId={tournament.id} />
          <StandingsTab id="standings" tournamentId={tournament.id} />
          <TopScorersTab id="scorers" tournamentId={tournament.id} />
        </Epic>
      )}
    </>
  );
};

export default PublicView;