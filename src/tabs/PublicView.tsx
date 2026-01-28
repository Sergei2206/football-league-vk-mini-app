import React, { useState, useEffect } from 'react';
import { 
  Div, 
  Group, 
  Cell, 
  Spinner, 
  SegmentedControl,
  Title,
  Card,
  CardGrid,
  Caption
} from '@vkontakte/vkui';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

interface Tournament {
  id: string;
  name: string;
  type: 'league' | 'cup';
  format: string;
  startDate: any;
  season?: string;
}

const PublicView = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [activeTab, setActiveTab] = useState<string>('table');
  const [loading, setLoading] = useState(true);

  // Загружаем список турниров
  const loadTournaments = async () => {
    try {
      const q = query(collection(db, 'tournaments'), orderBy('startDate', 'desc'));
      const snapshot = await getDocs(q);
      const list: Tournament[] = [];
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        list.push({
          id: doc.id,
          name: data.name || '',
          type: data.type || 'league',
          format: data.format || 'football11',
          startDate: data.startDate || new Date(),
          season: data.season || '2025/2026'
        });
      });
      setTournaments(list);
    } catch (err) {
      console.error('Ошибка загрузки турниров:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTournaments();
  }, []);

  if (selectedTournament) {
    return (
      <Div>
        {/* Заголовок турнира */}
        <Group>
          <Title level="2" style={{ padding: '0 16px' }}>
            {selectedTournament.name}
          </Title>
          <Caption style={{ padding: '4px 16px 16px' }}>
            Сезон: {selectedTournament.season}
          </Caption>
        </Group>

        {/* Вкладки - используем SegmentedControl */}
        <Div style={{ padding: '0 16px' }}>
          <SegmentedControl
            value={activeTab}
            onChange={(value) => setActiveTab(value as string)}
            options={[
              { label: selectedTournament.type === 'league' ? 'Таблица' : 'Сетка', value: 'table' },
              { label: 'Расписание', value: 'schedule' },
              { label: 'Лучшие игроки', value: 'players' }
            ]}
            size="m"
          />
        </Div>

        {/* Контент вкладок */}
        <Div style={{ paddingTop: '16px' }}>
          {activeTab === 'table' && (
            <Group header="Турнирная таблица">
              <Cell>1. Команда А — 15 очков</Cell>
              <Cell>2. Команда Б — 12 очков</Cell>
              <Cell>3. Команда В — 9 очков</Cell>
            </Group>
          )}

          {activeTab === 'schedule' && (
            <Group header="Расписание матчей">
              <Cell>15.02.2026 — Команда А vs Команда Б</Cell>
              <Cell>22.02.2026 — Команда В vs Команда А</Cell>
              <Cell>01.03.2026 — Команда Б vs Команда В</Cell>
            </Group>
          )}

          {activeTab === 'players' && (
            <Group header="Лучшие игроки">
              <CardGrid size="s">
                <Card mode="outline">
                  <Div>
                    <div style={{ fontWeight: 'bold' }}>⚽ Лучший бомбардир</div>
                    <div>Иван Петров — 8 голов</div>
                  </Div>
                </Card>
                <Card mode="outline">
                  <Div>
                    <div style={{ fontWeight: 'bold' }}>🥅 Лучший вратарь</div>
                    <div>Сергей Сидоров — 4 сухих матча</div>
                  </Div>
                </Card>
              </CardGrid>
            </Group>
          )}
        </Div>

        {/* Кнопка назад */}
        <Div style={{ paddingTop: '16px' }}>
          <button 
            onClick={() => setSelectedTournament(null)}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#f2f3f5',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Назад к списку турниров
          </button>
        </Div>
      </Div>
    );
  }

  return (
    <Div>
      <Group header="Доступные турниры">
        {loading ? (
          <Div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Spinner size="medium" />
          </Div>
        ) : tournaments.length === 0 ? (
          <Cell>Нет доступных турниров</Cell>
        ) : (
          tournaments.map(t => (
            <Cell
              key={t.id}
              onClick={() => setSelectedTournament(t)}
            >
              {t.name} ({t.season})
              <div style={{ 
                fontSize: '13px', 
                color: 'var(--vkui--color_text_secondary)',
                marginTop: '4px'
              }}>
                {t.type === 'league' ? 'Чемпионат' : 'Кубок'} • {t.format}
              </div>
            </Cell>
          ))
        )}
      </Group>
    </Div>
  );
};

export default PublicView;