import React, { useEffect, useState } from 'react';
import {
  Epic,
  View,
  Panel,
  PanelHeader,
  Tabbar,
  TabbarItem,
  Div,
  Spinner
} from '@vkontakte/vkui';

// Только подтверждённые иконки
import {
  Icon12Fire,
  Icon12Lock
} from '@vkontakte/icons';

import ScheduleTab from './ScheduleTab';
import StandingsTab from './StandingsTab';
import CupBracket from './CupBracket';
import TopScorersTab from './TopScorersTab';
import TopGoalkeepersTab from './TopGoalkeepersTab';

import { db } from '../firebase';
import { collection, query, getDocs } from 'firebase/firestore';

interface Tournament {
  id: string;
  type?: string;
  [key: string]: any;
}

const PublicTournamentView = ({ user }: { user?: any }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [activeStory, setActiveStory] = useState('schedule');

  useEffect(() => {
    const loadTournaments = async () => {
      try {
        const q = query(collection(db, 'tournaments'));
        const snapshot = await getDocs(q);
        const list: Tournament[] = [];
        snapshot.docs.forEach(doc => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setTournaments(list);
        if (list.length > 0) {
          setSelectedTournamentId(list[0].id);
        }
      } catch (err) {
        console.error('Ошибка загрузки турниров:', err);
      }
    };
    loadTournaments();
  }, []);

  if (!selectedTournamentId) {
    return (
      <Epic activeStory="empty">
        <View id="empty" activePanel="empty">
          <Panel id="empty">
            <PanelHeader>Турниры</PanelHeader>
            <Div>Нет активных турниров</Div>
          </Panel>
        </View>
        <Tabbar>
          <TabbarItem text="Матчи" selected={true} />
        </Tabbar>
      </Epic>
    );
  }

  const tournament = tournaments.find(t => t.id === selectedTournamentId);
  const isCup = tournament?.type === 'cup';

  // Создаем массив children для Epic
  const epicChildren = [
    // Расписание
    <View key="schedule" id="schedule" activePanel="schedule">
      <Panel id="schedule">
        <PanelHeader>Расписание</PanelHeader>
        <ScheduleTab tournamentId={selectedTournamentId} />
      </Panel>
    </View>,

    // Таблица или Сетка
    ...(isCup 
      ? [
          <View key="bracket" id="bracket" activePanel="bracket">
            <Panel id="bracket">
              <PanelHeader>Сетка кубка</PanelHeader>
              <CupBracket tournamentId={selectedTournamentId} />
            </Panel>
          </View>
        ]
      : [
          <View key="standings" id="standings" activePanel="standings">
            <Panel id="standings">
              <PanelHeader>Турнирная таблица</PanelHeader>
              <StandingsTab tournamentId={selectedTournamentId} />
            </Panel>
          </View>
        ]
    ),

    // Бомбардиры
    <View key="topScorers" id="topScorers" activePanel="topScorers">
      <Panel id="topScorers">
        <PanelHeader>Лучшие бомбардиры</PanelHeader>
        <TopScorersTab tournamentId={selectedTournamentId} />
      </Panel>
    </View>,

    // Вратари
    <View key="topKeepers" id="topKeepers" activePanel="topKeepers">
      <Panel id="topKeepers">
        <PanelHeader>Лучшие вратари</PanelHeader>
        <TopGoalkeepersTab tournamentId={selectedTournamentId} />
      </Panel>
    </View>
  ];

  return (
    <Epic
      activeStory={activeStory}
      tabbar={
        <Tabbar>
          <TabbarItem
            onClick={() => setActiveStory('schedule')}
            selected={activeStory === 'schedule'}
            text="Матчи"
          />
          
          {isCup ? (
            <TabbarItem
              onClick={() => setActiveStory('bracket')}
              selected={activeStory === 'bracket'}
              text="Сетка"
            />
          ) : (
            <TabbarItem
              onClick={() => setActiveStory('standings')}
              selected={activeStory === 'standings'}
              text="Таблица"
            />
          )}

          <TabbarItem
            onClick={() => setActiveStory('topScorers')}
            selected={activeStory === 'topScorers'}
            text="Бомбардиры"
          >
            <Icon12Fire />
          </TabbarItem>

          <TabbarItem
            onClick={() => setActiveStory('topKeepers')}
            selected={activeStory === 'topKeepers'}
            text="Вратари"
          >
            <Icon12Lock />
          </TabbarItem>
        </Tabbar>
      }
    >
      {epicChildren}
    </Epic>
  );
};

export default PublicTournamentView;