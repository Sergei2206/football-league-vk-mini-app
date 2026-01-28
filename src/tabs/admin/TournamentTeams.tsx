import React, { useState, useEffect } from 'react';
import { Div, Group, Cell, FormLayout, Input, Button, Spinner } from '@vkontakte/vkui';
import { db } from '../../firebase';
import { collection, getDocs, query, where, deleteDoc, doc, addDoc, getDoc, setDoc } from 'firebase/firestore';

interface TournamentTeamsProps {
  tournament: any;
  user: any;
  onSnackbar: (message: string) => void;
}

interface VKUser {
  id: number;
  first_name?: string;
  last_name?: string;
  photo_50?: string;
}

const TournamentTeams = ({ tournament, user, onSnackbar }: TournamentTeamsProps) => {
  const [teamName, setTeamName] = useState('');
  const [captainVkId, setCaptainVkId] = useState('');
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [usersCache, setUsersCache] = useState<Record<number, VKUser>>({});

  // Получение данных пользователя из Firestore (создаём пустой документ если не существует)
  const getUserFromFirestore = async (userId: number): Promise<VKUser> => {
    if (usersCache[userId]) {
      return usersCache[userId];
    }
    
    try {
      const userRef = doc(db, 'vkUsers', userId.toString());
      const userDoc = await getDoc(userRef);
      
      let userData: VKUser;
      
      if (userDoc.exists()) {
        // Пользователь уже существует
        userData = userDoc.data() as VKUser;
      } else {
        // Создаём пустой документ для пользователя
        userData = { id: userId };
        await setDoc(userRef, userData);
      }
      
      setUsersCache(prev => ({
        ...prev,
        [userId]: userData
      }));
      
      return userData;
    } catch (err) {
      console.error('Ошибка работы с пользователем в Firestore:', err);
      // Возвращаем минимальные данные
      return { id: userId };
    }
  };

  const loadTeams = async () => {
    if (!tournament?.id) {
      console.log('Турнир не найден');
      return;
    }
    
    try {
      setLoading(true);
      const q = query(collection(db, 'teams'), where('tournamentId', '==', tournament.id));
      const snapshot = await getDocs(q);
      const teamsList: any[] = [];
      snapshot.docs.forEach(doc => {
        teamsList.push({ id: doc.id, ...doc.data() });
      });
      setTeams(teamsList);
      
      // Получаем данные всех капитанов
      for (const team of teamsList) {
        if (team.captainVkId && !usersCache[team.captainVkId]) {
          await getUserFromFirestore(team.captainVkId);
        }
      }
    } catch (err: any) {
      console.error('Ошибка загрузки команд:', err);
      onSnackbar(`Ошибка загрузки: ${err.message || 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, [tournament?.id]);

  const saveTeam = async () => {
    if (!teamName.trim() || !captainVkId.trim()) {
      onSnackbar('Заполните все поля');
      return;
    }
    
    if (!tournament?.id) {
      onSnackbar('Ошибка: турнир не найден');
      return;
    }
    
    try {
      const captainId = Number(captainVkId);
      if (isNaN(captainId)) {
        onSnackbar('VK ID должен быть числом');
        return;
      }
      
      // Создаём запись для капитана (даже если он ещё не заходил)
      await getUserFromFirestore(captainId);
      
      const teamData = {
        name: teamName.trim(),
        captainVkId: captainId,
        tournamentId: tournament.id,
        createdAt: new Date(),
        points: 0,
        matches: 0,
        wins: 0,
        draws: 0,
        losses: 0
      };
      
      await addDoc(collection(db, 'teams'), teamData);
      onSnackbar('Команда добавлена!');
      
      setTeamName('');
      setCaptainVkId('');
      await loadTeams();
    } catch (err: any) {
      console.error('Ошибка создания команды:', err);
      onSnackbar(`Ошибка: ${err.message || 'Не удалось создать команду'}`);
    }
  };

  const deleteTeam = async (teamId: string, teamName: string) => {
    try {
      await deleteDoc(doc(db, 'teams', teamId));
      await loadTeams();
      onSnackbar(`Команда "${teamName}" удалена`);
    } catch (err: any) {
      console.error('Ошибка удаления команды:', err);
      onSnackbar(`Ошибка: ${err.message || 'Не удалось удалить команду'}`);
    }
  };

  // Получение отображаемого имени пользователя
  const getUserName = (userId: number): string => {
    const user = usersCache[userId];
    if (user && user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return `ID: ${userId}`;
  };

  // Получение аватара пользователя
  const getUserAvatar = (userId: number): string => {
    const user = usersCache[userId];
    return user?.photo_50 || '';
  };

  return (
    <Group header="Управление командами">
      <Div style={{ padding: '16px' }}>
        <FormLayout>
          <Input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Название команды"
          />
          <Input
            value={captainVkId}
            onChange={(e) => setCaptainVkId(e.target.value)}
            placeholder="VK ID капитана"
            type="number"
          />
          <Button
            size="m"
            mode="primary"
            onClick={saveTeam}
            disabled={!teamName.trim() || !captainVkId.trim()}
            style={{ marginTop: '8px' }}
          >
            Добавить команду
          </Button>
        </FormLayout>
      </Div>
      
      {loading ? (
        <Div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Spinner size="medium" />
        </Div>
      ) : teams.length === 0 ? (
        <Div style={{ padding: '0 16px 16px' }}>
          <Cell>Нет добавленных команд</Cell>
        </Div>
      ) : (
        <Div style={{ padding: '0 16px 16px' }}>
          {teams.map(team => (
            <Cell
              key={team.id}
              before={
                getUserAvatar(team.captainVkId) && (
                  <img 
                    src={getUserAvatar(team.captainVkId)} 
                    alt="Аватар" 
                    style={{ width: '32px', height: '32px', borderRadius: '50%', marginRight: '12px' }}
                  />
                )
              }
              after={
                <Button
                  size="s"
                  mode="primary"
                  style={{ 
                    backgroundColor: '#e64646',
                    borderColor: '#e64646'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTeam(team.id, team.name);
                  }}
                >
                  Удалить
                </Button>
              }
            >
              {team.name}
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                Капитан: {getUserName(team.captainVkId)}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                Очки: {team.points} | Матчи: {team.matches}
              </div>
            </Cell>
          ))}
        </Div>
      )}
    </Group>
  );
};

export default TournamentTeams;