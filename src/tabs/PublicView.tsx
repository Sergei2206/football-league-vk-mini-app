import React, { useState, useEffect } from 'react';
import { Div, Group, Cell, Spinner, Epic, Tabbar, TabbarItem, PanelHeader } from '@vkontakte/vkui';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

// Типы
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
  startDate: any; // Firestore Timestamp
  logoUrl?: string;
}

const PublicView = ({ user, teams }: PublicViewProps) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);
  const [activeStory, setActiveStory] = useState<'schedule' | 'standings' | 'scorers'>('schedule');
  const [loading, setLoading] = useState(true);

  // Загрузка турниров
  useEffect(() => {
    const loadTournaments = async () => {
      try {
        let snapshot;
        
        // Если пользователь — капитан, показываем только его турниры
        if (teams && teams.length > 0) {
          const tournamentIds = Array.from(new Set(teams.map(t => t.tournamentId)));
          const q = query(collection(db, 'tournaments'), where('__name__', 'in', tournamentIds));
          snapshot = await getDocs(q);
        } else {
          // Иначе — все турниры
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

        // Сортировка по дате (новые сверху)
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
  }, [teams]);

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
          <div id="schedule">Матчи (заглушка)</div>
          <div id="standings">Таблица (заглушка)</div>
          <div id="scorers">Бомбардиры (заглушка)</div>
        </Epic>
      )}
    </>
  );
};

export default PublicView;