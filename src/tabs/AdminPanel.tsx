import React, { useState, useEffect } from 'react';
import {
  Div,
  FormLayout,
  Input,
  Select,
  Button,
  Tabs,
  TabsItem,
  Snackbar,
  Group,
  Cell,
  Caption
} from '@vkontakte/vkui';
import { addDoc, collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import LogoUrlInput from '../components/LogoUrlInput';

interface Tournament {
  id: string;
  name: string;
  adminVkId: number;
  type: 'cup' | 'league';
  format: string;
  startDate: Date;
  logoUrl?: string;
}

const AdminPanel = ({ user }: { user: { id: number; first_name: string; last_name: string } }) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'logo'>('list');
  const [name, setName] = useState('');
  const [format, setFormat] = useState('football11');
  const [type, setType] = useState<'league' | 'cup'>('league');
  const [startDate, setStartDate] = useState('');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  // Загрузка списка турниров
  const loadTournaments = async () => {
    try {
      const q = query(collection(db, 'tournaments'), where('adminVkId', '==', user.id));
      const snapshot = await getDocs(q);
      const list: Tournament[] = [];
      snapshot.docs.forEach(doc => {
        const data = doc.data();
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
      
      list.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
      setTournaments(list);
    } catch (err) {
      console.error('Ошибка загрузки турниров:', err);
      setSnackbar('Ошибка загрузки списка');
    }
  };

  // Создание турнира
  const handleCreateTournament = async () => {
    if (!name.trim() || !startDate) {
      setSnackbar('Заполните название и дату начала');
      return;
    }

    try {
      setUploading(true);
      const startDateObj = new Date(startDate);
      const docRef = await addDoc(collection(db, 'tournaments'), {
        name: name.trim(),
        adminVkId: user.id,
        type,
        format,
        startDate: startDateObj,
        createdAt: new Date()
      });

      // Сброс формы
      setName('');
      setStartDate('');
      setActiveTab('list');
      setSnackbar('Турнир успешно создан!');
      
      // Обновление списка
      loadTournaments();
    } catch (err) {
      console.error('Ошибка создания турнира:', err);
      setSnackbar('Ошибка при создании турнира');
    } finally {
      setUploading(false);
    }
  };

  // Удаление турнира
  const handleDeleteTournament = async (tournamentId: string) => {
    if (!window.confirm('Вы уверены? Все данные турнира будут удалены безвозвратно.')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'tournaments', tournamentId));
      setTournaments(tournaments.filter(t => t.id !== tournamentId));
      setSnackbar('Турнир удалён');
    } catch (err) {
      console.error('Ошибка удаления турнира:', err);
      setSnackbar('Ошибка при удалении');
    }
  };

  // Загружаем турниры при смене вкладки
  useEffect(() => {
    if (activeTab === 'list') {
      loadTournaments();
    }
  }, [activeTab, user.id]);

  const selectedTournament = tournaments.find(t => t.id === selectedTournamentId);

  return (
    <Div>
      <Tabs>
        <TabsItem selected={activeTab === 'list'} onClick={() => setActiveTab('list')}>
          Мои турниры
        </TabsItem>
        <TabsItem selected={activeTab === 'create'} onClick={() => setActiveTab('create')}>
          Создать
        </TabsItem>
        {selectedTournamentId && (
          <TabsItem selected={activeTab === 'logo'} onClick={() => setActiveTab('logo')}>
            Логотип
          </TabsItem>
        )}
      </Tabs>

      {activeTab === 'list' ? (
        <Group>
          {tournaments.length === 0 ? (
            <Div>У вас пока нет созданных турниров</Div>
          ) : (
            tournaments.map(tournament => (
              <Cell
                key={tournament.id}
                before={tournament.logoUrl && (
                  <img src={tournament.logoUrl} width="40" height="40" style={{ borderRadius: '4px', marginRight: '12px' }} />
                )}
                subtitle={
                  <div>
                    <Caption>{tournament.type === 'cup' ? 'Кубок' : 'Чемпионат'} • {tournament.format}</Caption>
                    <Caption level="2">{tournament.startDate.toLocaleDateString('ru-RU')}</Caption>
                  </div>
                }
                after={
                  <Button
                    size="s"
                    mode="secondary"
                    onClick={() => handleDeleteTournament(tournament.id)}
                  >
                    Удалить
                  </Button>
                }
                onClick={() => setSelectedTournamentId(tournament.id)}
              >
                {tournament.name}
              </Cell>
            ))
          )}
        </Group>
      ) : activeTab === 'create' ? (
        <FormLayout style={{ marginTop: 16 }}>
          <Input
            placeholder="Название турнира"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          
          <Select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            options={[
              { label: 'Футбол (11×11)', value: 'football11' },
              { label: 'Мини-футбол (7×7)', value: 'mini7' },
              { label: 'Футзал (5×5)', value: 'futsal' }
            ]}
          />
          
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as 'league' | 'cup')}
            options={[
              { label: 'Чемпионат', value: 'league' },
              { label: 'Кубок', value: 'cup' }
            ]}
          />
          
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          
          <Button
            size="l"
            mode="primary"
            loading={uploading}
            onClick={handleCreateTournament}
            style={{ marginTop: 16 }}
          >
            Создать турнир
          </Button>
        </FormLayout>
      ) : (
        selectedTournament && (
          <LogoUrlInput
            tournamentId={selectedTournament.id}
            currentLogo={selectedTournament.logoUrl}
            onLogoUpdated={loadTournaments}
          />
        )
      )}

      {snackbar && (
        <Snackbar
          duration={3000}
          onClose={() => setSnackbar(null)}
        >
          {snackbar}
        </Snackbar>
      )}
    </Div>
  );
};

export default AdminPanel;