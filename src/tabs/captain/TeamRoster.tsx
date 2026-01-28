import React, { useState, useEffect } from 'react';
import { Group, Div, FormLayout, Input, Button, ModalRoot, ModalPage, ModalPageHeader, Spinner } from '@vkontakte/vkui';
import { db } from '../../firebase';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';

interface Player {
  id: string;
  number: number;
  name: string;
  vkId?: number;
  position: 'forward' | 'defender' | 'universal' | 'goalkeeper' | 'midfielder';
}

interface TeamRosterProps {
  tournament: any;
  user: any;
  onSnackbar: (message: string) => void;
  onAddPlayer: () => void;
}

const TeamRoster = ({ tournament, user, onSnackbar, onAddPlayer }: TeamRosterProps) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ 
    number: '', 
    name: '', 
    vkId: '', 
    position: 'forward' as const 
  });
  const [isSeasonStarted, setIsSeasonStarted] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState('');
  const [availableLogos, setAvailableLogos] = useState<string[]>([]);

  // Загрузка состава команды
  const loadTeamRoster = async () => {
    if (!user?.id || !tournament?.id) return;
    
    try {
      setLoading(true);
      
      // Находим команду капитана
      const teamsQuery = query(
        collection(db, 'teams'),
        where('tournamentId', '==', tournament.id),
        where('captainVkId', '==', user.id)
      );
      
      const teamsSnapshot = await getDocs(teamsQuery);
      
      if (!teamsSnapshot.empty) {
        const teamData = teamsSnapshot.docs[0].data();
        setPlayers(teamData.players || []);
        setIsSeasonStarted(teamData.isSeasonStarted || false);
        setSelectedLogo(teamData.logoId || '');
      }
    } catch (err: any) {
      console.error('Ошибка загрузки состава:', err);
      onSnackbar(`Ошибка загрузки: ${err.message || 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка списка доступных логотипов (до 30 файлов)
  const loadAvailableLogos = async () => {
    try {
      // Генерируем массив от logo1.png до logo30.png
      const logoNames = Array.from({ length: 30 }, (_, i) => `logo${i + 1}.png`);
      
      const existingLogos = [];
      
      // Проверяем каждый файл
      for (const logo of logoNames) {
        try {
          // Используем относительный путь без слэша в начале
          const response = await fetch(`team-logos/${logo}`, { method: 'HEAD' });
          if (response.ok) {
            existingLogos.push(logo);
          }
        } catch (error) {
          // Файл не существует - пропускаем
        }
      }
      
      setAvailableLogos(existingLogos);
    } catch (err) {
      console.error('Ошибка загрузки логотипов:', err);
      setAvailableLogos([]);
    }
  };

  useEffect(() => {
    loadTeamRoster();
    loadAvailableLogos();
  }, [tournament?.id, user?.id]);

  const handleAddPlayer = async () => {
    if (!newPlayer.number || !newPlayer.name) {
      onSnackbar('Заполните все обязательные поля');
      return;
    }
    
    // Создаем объект игрока БЕЗ undefined полей
    const playerData: any = {
      id: `player_${Date.now()}`,
      number: parseInt(newPlayer.number) || 1,
      name: newPlayer.name.trim(),
      position: newPlayer.position
    };
    
    // Добавляем vkId только если он есть
    if (newPlayer.vkId && newPlayer.vkId.trim() !== '') {
      const vkIdNum = parseInt(newPlayer.vkId);
      if (!isNaN(vkIdNum)) {
        playerData.vkId = vkIdNum;
      }
    }
    
    try {
      // Находим команду капитана
      const teamsQuery = query(
        collection(db, 'teams'),
        where('tournamentId', '==', tournament.id),
        where('captainVkId', '==', user.id)
      );
      
      const teamsSnapshot = await getDocs(teamsQuery);
      
      if (!teamsSnapshot.empty) {
        const teamRef = doc(db, 'teams', teamsSnapshot.docs[0].id);
        await updateDoc(teamRef, {
          players: [...(teamsSnapshot.docs[0].data().players || []), playerData]
        });
        
        setPlayers(prev => [...prev, playerData as Player]);
        setNewPlayer({ number: '', name: '', vkId: '', position: 'forward' });
        setIsAddingPlayer(false);
        onSnackbar('Игрок добавлен!');
      }
    } catch (err: any) {
      console.error('Ошибка добавления игрока:', err);
      onSnackbar(`Ошибка: ${err.message || 'Не удалось добавить игрока'}`);
    }
  };

  const handleDeletePlayer = async (playerToDelete: Player) => {
    if (isSeasonStarted) {
      onSnackbar('Удаление игроков запрещено после начала сезона');
      return;
    }
    
    try {
      // Находим команду капитана
      const teamsQuery = query(
        collection(db, 'teams'),
        where('tournamentId', '==', tournament.id),
        where('captainVkId', '==', user.id)
      );
      
      const teamsSnapshot = await getDocs(teamsQuery);
      
      if (!teamsSnapshot.empty) {
        const teamRef = doc(db, 'teams', teamsSnapshot.docs[0].id);
        const teamData = teamsSnapshot.docs[0].data();
        const updatedPlayers = (teamData.players || []).filter(
          (p: Player) => p.id !== playerToDelete.id
        );
        
        await updateDoc(teamRef, { players: updatedPlayers });
        setPlayers(updatedPlayers);
        onSnackbar('Игрок удалён!');
      }
    } catch (err: any) {
      console.error('Ошибка удаления игрока:', err);
      onSnackbar(`Ошибка: ${err.message || 'Не удалось удалить игрока'}`);
    }
  };

  const handleLogoSelect = async (logoFilename: string) => {
    try {
      // Находим команду капитана
      const teamsQuery = query(
        collection(db, 'teams'),
        where('tournamentId', '==', tournament.id),
        where('captainVkId', '==', user.id)
      );
      
      const teamsSnapshot = await getDocs(teamsQuery);
      
      if (!teamsSnapshot.empty) {
        const teamRef = doc(db, 'teams', teamsSnapshot.docs[0].id);
        await updateDoc(teamRef, { logoId: logoFilename });
        setSelectedLogo(logoFilename);
        onSnackbar('Логотип обновлён!');
      }
    } catch (err: any) {
      console.error('Ошибка обновления логотипа:', err);
      onSnackbar('Не удалось обновить логотип');
    }
  };

  const getPositionLabel = (position: string) => {
    const positions: Record<string, string> = {
      'forward': 'Нападающий',
      'defender': 'Защитник', 
      'universal': 'Универсал',
      'goalkeeper': 'Вратарь',
      'midfielder': 'Полузащитник'
    };
    return positions[position] || position;
  };

  const getLogoDisplayName = (filename: string) => {
    return filename.replace('.png', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <Div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Spinner size="medium" />
        <div style={{ marginTop: '8px' }}>Загрузка состава...</div>
      </Div>
    );
  }

  return (
    <Group header="Состав команды">
      <Div style={{ padding: '16px' }}>
        {/* Выбор логотипа */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '8px', fontWeight: '500' }}>Логотип команды</div>
          
          {availableLogos.length > 0 ? (
            <>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                Выберите логотип из доступной коллекции
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))', gap: '8px' }}>
                {availableLogos.map(filename => (
                  <div
                    key={filename}
                    onClick={() => handleLogoSelect(filename)}
                    style={{
                      cursor: 'pointer',
                      opacity: selectedLogo === filename ? 1 : 0.6,
                      border: selectedLogo === filename ? '2px solid var(--vkui--color_accent)' : '1px solid #e1e3e6',
                      borderRadius: '6px',
                      padding: '4px'
                    }}
                  >
                    <img 
                      // ИСПОЛЬЗУЕМ ОТНОСИТЕЛЬНЫЙ ПУТЬ БЕЗ СЛЕША В НАЧАЛЕ
                      src={`team-logos/${filename}`} 
                      alt={getLogoDisplayName(filename)}
                      style={{ 
                        width: '50px', 
                        height: '50px', 
                        objectFit: 'contain'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <div style={{ fontSize: '10px', textAlign: 'center', marginTop: '2px' }}>
                      {getLogoDisplayName(filename)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
              Нет доступных логотипов. Администратор может добавить их позже.
            </div>
          )}
        </div>

        {/* Список игроков */}
        {players.length === 0 ? (
          <Div>Состав пуст</Div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {players.map(player => (
              <div key={player.id} style={{
                padding: '12px',
                backgroundColor: 'var(--vkui--color_background_secondary)',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div><strong>{player.number}. {player.name}</strong></div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {getPositionLabel(player.position)}
                    {player.vkId && ` • VK ID: ${player.vkId}`}
                  </div>
                </div>
                {!isSeasonStarted && (
                  <Button 
                    size="s" 
                    mode="secondary" 
                    onClick={() => handleDeletePlayer(player)}
                    style={{ marginLeft: '12px' }}
                  >
                    Удалить
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Кнопка добавления игрока */}
        {!isSeasonStarted && (
          <Button
            size="l"
            mode="primary"
            onClick={onAddPlayer}
            style={{ marginTop: '16px' }}
          >
            Добавить игрока
          </Button>
        )}
      </Div>
    </Group>
  );
};

export default TeamRoster;