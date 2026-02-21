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
  Caption,
  PanelHeader
} from '@vkontakte/vkui';
import { db } from '../../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc,
  addDoc
} from 'firebase/firestore';
import LogoUrlInput from '../components/LogoUrlInput';

interface Tournament {
  id: string;
  name: string;
  adminVkId: number;
  coAdmins?: number[];
  type: 'league' | 'cup';
  format: string;
  startDate: any;
  logoUrl?: string;
}

interface Team {
  id: string;
  name: string;
  tournamentId: string;
  captainVkId: number;
  logoUrl?: string;
}

const AdminPanel = ({ user }: { user: any }) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'logo' | 'teams'>('list');
  const [name, setName] = useState('');
  const [format, setFormat] = useState('football11');
  const [type, setType] = useState<'league' | 'cup'>('league');
  const [startDate, setStartDate] = useState('');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamName, setTeamName] = useState('');
  const [captainVkId, setCaptainVkId] = useState('');
  const [snackbar, setSnackbar] = useState<string | null>(null);

  // Загрузка списка турниров
  const loadTournaments = async () => {
    try {
      const q = query(collection(db, 'tournaments'), where('adminVkId', '==', user.id));
      const snapshot = await getDocs(q);
      const list: Tournament[] = [];
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        list.push({
          id: doc.id,
          name: data.name || 'Без названия',
          adminVkId: data.adminVkId || 0,
          coAdmins: data.coAdmins || [],
          type: data.type || 'league',
          format: data.format || 'football11',
          startDate: data.startDate,
          logoUrl: data.logoUrl
        });
      });
      list.sort((a, b) => (b.startDate?.toDate?.() || 0) - (a.startDate?.toDate?.() || 0));
      setTournaments(list);
      
      if (list.length > 0 && !selectedTournament) {
        setSelectedTournament(list[0]);
        loadTeams(list[0].id);
      }
    } catch (err) {
      console.error('Ошибка загрузки турниров:', err);
      setSnackbar('Ошибка загрузки списка');
    }
  };

  // Загрузка команд турнира
  const loadTeams = async (tournamentId: string) => {
    try {
      const q = query(collection(db, 'teams'), where('tournamentId', '==', tournamentId));
      const snapshot = await getDocs(q);
      const list: Team[] = [];
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        list.push({
          id: doc.id,
          name: data.name || 'Без названия',
          tournamentId: data.tournamentId,
          captainVkId: data.captainVkId,
          logoUrl: data.logoUrl
        });
      });
      setTeams(list);
    } catch (err) {
      console.error('Ошибка загрузки команд:', err);
    }
  };

  // Создание турнира
  const handleCreateTournament = async () => {
    if (!name.trim() || !startDate) {
      setSnackbar('Заполните название и дату начала');
      return;
    }

    try {
      const startDateObj = new Date(startDate);
      const docRef = await addDoc(collection(db, 'tournaments'), {
        name: name.trim(),
        adminVkId: user.id,
        coAdmins: [user.id],
        type,
        format,
        startDate: startDateObj,
        createdAt: new Date()
      });

      setName('');
      setStartDate('');
      setActiveTab('list');
      setSnackbar('Турнир успешно создан!');
      loadTournaments();
    } catch (err) {
      console.error('Ошибка создания турнира:', err);
      setSnackbar('Ошибка при создании турнира');
    }
  };

  // Удаление турнира
  const handleDeleteTournament = async (tournamentId: string) => {
    if (!window.confirm('Удалить турнир со всеми данными?')) return;
    
    try {
      await deleteDoc(doc(db, 'tournaments', tournamentId));
      setTournaments(tournaments.filter(t => t.id !== tournamentId));
      setSelectedTournament(null);
      setSnackbar('Турнир удалён');
    } catch (err) {
      console.error('Ошибка удаления турнира:', err);
      setSnackbar('Ошибка при удалении');
    }
  };

  // Создание команды
  const handleCreateTeam = async () => {
    if (!teamName.trim() || !captainVkId.trim() || !selectedTournament) {
      setSnackbar('Заполните все поля');
      return;
    }

    const captainIdNum = parseInt(captainVkId.trim());
    if (isNaN(captainIdNum)) {
      setSnackbar('Неверный формат ID капитана');
      return;
    }

    try {
      await addDoc(collection(db, 'teams'), {
        name: teamName.trim(),
        tournamentId: selectedTournament.id,
        captainVkId: captainIdNum,
        createdAt: new Date()
      });

      setTeamName('');
      setCaptainVkId('');
      setSnackbar('Команда добавлена!');
      loadTeams(selectedTournament.id);
    } catch (err) {
      console.error('Ошибка создания команды:', err);
      setSnackbar('Ошибка при создании команды');
    }
  };

  // Инициализация
  useEffect(() => {
    loadTournaments();
  }, [user.id]);

  return (
    <Div>
      <Tabs>
        <TabsItem selected={activeTab === 'list'} onClick={() => setActiveTab('list')}>
          Мои турниры
        </TabsItem>
        <TabsItem selected={activeTab === 'create'} onClick={() => setActiveTab('create')}>
          Создать
        </TabsItem>
        {selectedTournament && (
          <>
            <TabsItem selected={activeTab === 'logo'} onClick={() => setActiveTab('logo')}>
              Логотип
            </TabsItem>
            <TabsItem selected={activeTab === 'teams'} onClick={() => {
              setActiveTab('teams');
              loadTeams(selectedTournament.id);
            }}>
              Команды
            </TabsItem>
          </>
        )}
      </Tabs>

      {activeTab === 'list' ? (
        <Group header={<PanelHeader>Ваши турниры</PanelHeader>}>
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
                    <Caption level="2">{tournament.startDate?.toDate?.().toLocaleDateString('ru-RU')}</Caption>
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
                onClick={() => {
                  setSelectedTournament(tournament);
                  loadTeams(tournament.id);
                }}
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
            onClick={handleCreateTournament}
            style={{ marginTop: 16 }}
          >
            Создать турнир
          </Button>
        </FormLayout>
      ) : activeTab === 'logo' && selectedTournament ? (
        <LogoUrlInput
          tournamentId={selectedTournament.id}
          currentLogo={selectedTournament.logoUrl}
          onLogoUpdated={loadTournaments}
        />
      ) : activeTab === 'teams' && selectedTournament ? (
        <Div>
          <Group header={<PanelHeader>Добавить команду</PanelHeader>}>
            <FormLayout>
              <Input
                placeholder="Название команды"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
              <Input
                placeholder="VK ID капитана"
                value={captainVkId}
                onChange={(e) => setCaptainVkId(e.target.value)}
              />
              <Button
                size="l"
                mode="primary"
                onClick={handleCreateTeam}
                style={{ marginTop: 8 }}
              >
                Добавить команду
              </Button>
            </FormLayout>
          </Group>

          <Group header={<PanelHeader>Список команд</PanelHeader>}>
            {teams.length === 0 ? (
              <Div>Нет добавленных команд</Div>
            ) : (
              teams.map(team => (
                <Cell
                  key={team.id}
                  before={team.logoUrl && (
                    <img src={team.logoUrl} width="32" height="32" style={{ borderRadius: '4px', marginRight: '12px' }} />
                  )}
                  subtitle={`Капитан ID: ${team.captainVkId}`}
                >
                  {team.name}
                </Cell>
              ))
            )}
          </Group>
        </Div>
      ) : null}

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