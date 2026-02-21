// src/tabs/captain/AddPlayer.tsx
import React, { useState } from 'react';
import { Group, Div, Button, Text } from '@vkontakte/vkui';
import { Icon28ChevronBack } from '@vkontakte/icons';
import { db } from '../../firebase';
import { collection, getDocs, query, where, doc, updateDoc, arrayUnion } from 'firebase/firestore';

interface AddPlayerProps {
  tournament: any;
  user: any;
  onBack: () => void;
  onSnackbar: (message: string) => void;
}

const AddPlayer = ({ tournament, user, onBack, onSnackbar }: AddPlayerProps) => {
  const [newPlayer, setNewPlayer] = useState({ 
    number: '', 
    name: '', 
    vkId: '', 
    position: 'forward' as const 
  });
  const [loading, setLoading] = useState(false);

  const handleAddPlayer = async () => {
    if (!newPlayer.number || !newPlayer.name) {
      onSnackbar('Заполните все обязательные поля');
      return;
    }
    
    const playerData: any = {
      id: `player_${Date.now()}`,
      number: parseInt(newPlayer.number) || 1,
      name: newPlayer.name.trim(),
      position: newPlayer.position
    };
    
    if (newPlayer.vkId && newPlayer.vkId.trim() !== '') {
      const vkIdNum = parseInt(newPlayer.vkId);
      if (!isNaN(vkIdNum)) {
        playerData.vkId = vkIdNum;
      }
    }
    
    try {
      setLoading(true);
      
      const teamsQuery = query(
        collection(db, 'teams'),
        where('tournamentId', '==', tournament.id),
        where('captainVkId', '==', user.id)
      );
      
      const teamsSnapshot = await getDocs(teamsQuery);
      
      if (!teamsSnapshot.empty) {
        const teamRef = doc(db, 'teams', teamsSnapshot.docs[0].id);
        await updateDoc(teamRef, {
          players: arrayUnion(playerData)
        });
        
        onSnackbar('Игрок добавлен!');
        onBack();
      } else {
        onSnackbar('Не удалось найти вашу команду');
      }
    } catch (err: any) {
      console.error('Ошибка добавления игрока:', err);
      onSnackbar(`Ошибка: ${err.message || 'Не удалось добавить игрока'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Group header="Добавить игрока">
      <Div style={{ padding: '16px' }}>
        <div style={{ marginBottom: '16px' }}>
          <Text style={{ display: 'block', marginBottom: '6px', color: 'var(--vkui--color_text_secondary)' }}>
            Номер
          </Text>
          <input
            value={newPlayer.number}
            onChange={(e) => setNewPlayer({...newPlayer, number: e.target.value})}
            type="number"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid var(--vkui--color_field_border_alpha)',
              backgroundColor: 'var(--vkui--color_field_background)',
              color: 'var(--vkui--color_text_primary)',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <Text style={{ display: 'block', marginBottom: '6px', color: 'var(--vkui--color_text_secondary)' }}>
            Фамилия Имя
          </Text>
          <input
            value={newPlayer.name}
            onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid var(--vkui--color_field_border_alpha)',
              backgroundColor: 'var(--vkui--color_field_background)',
              color: 'var(--vkui--color_text_primary)',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <Text style={{ display: 'block', marginBottom: '6px', color: 'var(--vkui--color_text_secondary)' }}>
            VK ID (опционально)
          </Text>
          <input
            value={newPlayer.vkId}
            onChange={(e) => setNewPlayer({...newPlayer, vkId: e.target.value})}
            type="number"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid var(--vkui--color_field_border_alpha)',
              backgroundColor: 'var(--vkui--color_field_background)',
              color: 'var(--vkui--color_text_primary)',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <Text style={{ display: 'block', marginBottom: '6px', color: 'var(--vkui--color_text_secondary)' }}>
            Амплуа
          </Text>
          <select
            value={newPlayer.position}
            onChange={(e) => setNewPlayer({...newPlayer, position: e.target.value as any})}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid var(--vkui--color_field_border_alpha)',
              backgroundColor: 'var(--vkui--color_field_background)',
              color: 'var(--vkui--color_text_primary)',
              fontSize: '16px'
            }}
          >
            <option value="forward">Нападающий</option>
            <option value="defender">Защитник</option>
            <option value="midfielder">Полузащитник</option>
            <option value="goalkeeper">Вратарь</option>
            <option value="universal">Универсал</option>
          </select>
        </div>

        <Button 
          size="l" 
          mode="primary" 
          onClick={handleAddPlayer} 
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? 'Добавление...' : 'Добавить игрока'}
        </Button>
      </Div>
    </Group>
  );
};

export default AddPlayer;

