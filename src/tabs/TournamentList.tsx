import React, { useEffect, useState } from 'react';
import { Group, Cell, Div, Spinner, Button, Caption } from '@vkontakte/vkui';
import { db } from '../firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

interface TournamentData {
  id: string;
  name: string;
  adminVkId: number;
  type: 'cup' | 'league';
  format: string;
  startDate: any; // Будет Date или Timestamp
  logoUrl?: string;
}

const TournamentList = ({ adminVkId }: { adminVkId: number }) => {
  const [tournaments, setTournaments] = useState<TournamentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTournaments = async () => {
      try {
        const q = query(collection(db, 'tournaments'), where('adminVkId', '==', adminVkId));
        const snapshot = await getDocs(q);
        const list: TournamentData[] = [];
        
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          // Безопасное извлечение даты
          let startDateVal: Date;
          if (data.startDate?.toDate) {
            startDateVal = data.startDate.toDate();
          } else if (data.startDate instanceof Date) {
            startDateVal = data.startDate;
          } else {
            startDateVal = new Date();
          }
          
          list.push({
            id: doc.id,
            name: data.name || 'Без названия',
            adminVkId: data.adminVkId || 0,
            type: data.type || 'league',
            format: data.format || 'football11',
            startDate: startDateVal,
            logoUrl: data.logoUrl
          });
        });
        
        // Сортировка по дате
        list.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
        setTournaments(list);
      } catch (err) {
        console.error('Ошибка загрузки турниров:', err);
      } finally {
        setLoading(false);
      }
    };
    loadTournaments();
  }, [adminVkId]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Удалить турнир? Все данные будут потеряны.')) {
      try {
        await deleteDoc(doc(db, 'tournaments', id));
        setTournaments(tournaments.filter(t => t.id !== id));
      } catch (err) {
        console.error('Ошибка удаления:', err);
      }
    }
  };

  if (loading) {
    return <Div style={{ textAlign: 'center' }}><Spinner size="medium" /></Div>;
  }

  return (
    <Group header={<Div>Мои турниры</Div>}>
      {tournaments.length === 0 ? (
        <Div>Нет созданных турниров</Div>
      ) : (
        tournaments.map(t => (
          <Cell
            key={t.id}
            subtitle={
              <div>
                <Caption>{t.type === 'cup' ? 'Кубок' : 'Чемпионат'} • {t.format}</Caption>
                <Caption level="2">{t.startDate.toLocaleDateString('ru-RU')}</Caption>
              </div>
            }
            after={
              <Button size="s" mode="secondary" onClick={() => handleDelete(t.id)}>
                Удалить
              </Button>
            }
          >
            {t.name}
          </Cell>
        ))
      )}
    </Group>
  );
};

export default TournamentList;