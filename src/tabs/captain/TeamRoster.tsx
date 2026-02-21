// src/tabs/captain/TeamRoster.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Group, Div, Button, PopoutWrapper, List, Cell, Spinner } from '@vkontakte/vkui';
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
  const [isSeasonStarted, setIsSeasonStarted] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState('');
  const [availableLogos, setAvailableLogos] = useState<string[]>([]);
  const [showLogoMenu, setShowLogoMenu] = useState(false);
  const logoButtonRef = useRef<HTMLDivElement>(null);

  const loadTeamRoster = useCallback(async () => {
    if (!user?.id || !tournament?.id) return;
    
    try {
      setLoading(true);
      
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
  }, [user?.id, tournament?.id, onSnackbar]);

  const loadAvailableLogos = useCallback(async () => {
    try {
      const logoNames = Array.from({ length: 30 }, (_, i) => `logo${i + 1}.png`);
      
      const existingLogos = [];
      
      for (const logo of logoNames) {
        try {
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
  }, []);

  useEffect(() => {
    loadTeamRoster();
    loadAvailableLogos();
  }, [loadTeamRoster, loadAvailableLogos]);

  const handleDeletePlayer = async (playerToDelete: Player) => {
    if (isSeasonStarted) {
      onSnackbar('Удаление игроков запрещено после начала сезона');
      return;
    }
    
    try {
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
    } finally {
      setShowLogoMenu(false);
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

  const getCurrentLogoUrl = () => {
    if (selectedLogo) {
      return `team-logos/${selectedLogo}`;
    }
    return null;
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
        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '8px', fontWeight: '500' }}>Логотип команды</div>
          
          <div 
            ref={logoButtonRef}
            onClick={() => setShowLogoMenu(true)}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              backgroundColor: 'var(--vkui--color_background_secondary)',
              borderRadius: '8px',
              border: '1px solid var(--vkui--color_field_border_alpha)'
            }}
          >
            {getCurrentLogoUrl() ? (
              <img 
                src={getCurrentLogoUrl()!} 
                alt="Текущий логотип"
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#f0f0f0',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
                fontSize: '18px'
              }}>
                ⚽
              </div>
            )}
            <div>
              {selectedLogo ? getLogoDisplayName(selectedLogo) : 'Выберите логотип'}
            </div>
          </div>
          
          {showLogoMenu && (
            <PopoutWrapper
              onClick={() => setShowLogoMenu(false)}
              closing={!showLogoMenu}
            >
              <List style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {availableLogos.length > 0 ? (
                  availableLogos.map(filename => (
                    <Cell
                      key={filename}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLogoSelect(filename);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <img 
                        src={`team-logos/${filename}`} 
                        alt={getLogoDisplayName(filename)}
                        style={{ 
                          width: '32px', 
                          height: '32px', 
                          objectFit: 'contain'
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      {getLogoDisplayName(filename)}
                    </Cell>
                  ))
                ) : (
                  <Cell>Нет доступных логотипов</Cell>
                )}
              </List>
            </PopoutWrapper>
          )}
        </div>

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

