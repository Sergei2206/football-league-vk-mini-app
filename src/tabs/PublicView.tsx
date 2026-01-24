import React, { useState, useEffect } from 'react';
import { Div, Group, Cell, Spinner, Epic, Tabbar, TabbarItem, PanelHeader } from '@vkontakte/vkui';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface PublicViewProps {
  user?: any;
  teams?: Array<{ id: string; tournamentId: string; [key: string]: any }>;
}

interface Tournament {
  id: string;
  name: string;
  adminVkId: number;
  coAdmins?: number[];
  type: string;
  format: string;
  startDate: any;
  logoUrl?: string;
}

const PublicView = ({ user, teams }: PublicViewProps) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);
  const [activeStory, setActiveStory] = useState<'schedule' | 'standings' | 'scorers'>('schedule');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTournaments = async () => {
      try {
        let snapshot;
        
        if (teams && teams.length > 0) {
          const tournamentIds = Array.from(new Set(teams.map(t => t.tournamentId)));
          const q = query(collection(db, 'tournaments'), where('__name__', 'in', tournamentIds));
          snapshot = await getDocs(q);
        } else {
          snapshot = await getDocs(collection(db, 'tournaments'));
        }

        const list: Tournament[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'Без названия',
            adminVkId: data.adminVkId || 0,
            coAdmins: data.coAdmins || [],
            type: data.type || 'league',
            format: data.format || 'football11',
            startDate: data.startDate,
            logoUrl: data.logoUrl
          };
        });

        list.sort((a, b) => {
          const dateA = a.startDate?.toDate?.() || new Date(0);
          const dateB = b.startDate?.toDate?.() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        
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
  }, [teams, selectedTournament]);

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
          <div id="schedule" style={{ padding: 16 }}>Матчи (заглушка)</div>
          <div id="standings" style={{ padding: 16 }}>Таблица (заглушка)</div>
          <div id="scorers" style={{ padding: 16 }}>Бомбардиры (заглушка)</div>
        </Epic>
      )}
    </>
  );
};

export default PublicView;