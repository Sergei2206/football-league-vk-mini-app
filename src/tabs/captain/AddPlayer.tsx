import React, { useState } from 'react';
import { Group, Div, FormLayout, Input, Button, PanelHeaderButton } from '@vkontakte/vkui';
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

  // Диагностика входных данных
  console.log('=== ДИАГНОСТИКА AddPlayer ===');
  console.log('Турнир:', tournament?.id);
  console.log('Пользователь:', user?.id, 'Тип:', typeof user?.id);
  console.log('==============================');

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
      
      console.log('=== ЗАПРОС К FIRESTORE ===');
      console.log('Ищу команду где:');
      console.log('- tournamentId =', tournament.id);
      console.log('- captainVkId =', user.id, '(тип:', typeof user.id, ')');
      
      const teamsQuery = query(
        collection(db, 'teams'),
        where('tournamentId', '==', tournament.id),
        where('captainVkId', '==', user.id)
      );
      
      const teamsSnapshot = await getDocs(teamsQuery);
      
      console.log('Результат запроса:', teamsSnapshot.size, 'команд найдено');
      
      if (!teamsSnapshot.empty) {
        const teamDoc = teamsSnapshot.docs[0];
        const teamData = teamDoc.data();
        
        console.log('Данные команды:', teamData);
        console.log('captainVkId в команде:', teamData.captainVkId, 'Тип:', typeof teamData.captainVkId);
        console.log('Сравнение:', teamData.captainVkId, '===', user.id, '?', teamData.captainVkId === user.id);
        
        const teamRef = doc(db, 'teams', teamDoc.id);
        console.log('Попытка обновить документ:', teamDoc.id);
        
        await updateDoc(teamRef, {
          players: arrayUnion(playerData)
        });
        
        console.log('✅ Игрок успешно добавлен!');
        onSnackbar('Игрок добавлен!');
        onBack();
      } else {
        console.error('❌ Команда не найдена! Проверь данные турнира и пользователя.');
        onSnackbar('Не удалось найти вашу команду');
      }
    } catch (err: any) {
      console.error('=== КРИТИЧЕСКАЯ ОШИБКА ===');
      console.error('Тип ошибки:', err.constructor.name);
      console.error('Код ошибки:', err.code);
      console.error('Сообщение:', err.message);
      console.error('Полный объект ошибки:', err);
      
      if (err.code === 'permission-denied') {
        console.error('🔥 ПРОБЛЕМА С ПРАВАМИ ДОСТУПА FIREBASE!');
        console.error('Проверь следующее:');
        console.error('1. В Firestore у документа команды есть поле captainVkId');
        console.error('2. captainVkId имеет тип NUMBER (не string!)');
        console.error('3. Значение captainVkId равно твоему VK ID:', user.id);
        console.error('4. Firebase Rules для teams/update настроены правильно');
        console.error('5. Ты вошёл в приложение под правильным аккаунтом VK');
      }
      
      onSnackbar(`Ошибка: ${err.message || 'Не удалось добавить игрока'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PanelHeaderButton onClick={onBack} aria-label="Назад">
        <Icon28ChevronBack />
      </PanelHeaderButton>
      
      <Group header="Добавить игрока">
        <Div style={{ padding: '16px' }}>
          <FormLayout>
            <div style={{ 
              fontSize: '14px', 
              color: 'var(--vkui--color_text_secondary)', 
              marginBottom: '6px'
            }}>
              Номер
            </div>
            <Input
              value={newPlayer.number}
              onChange={(e) => setNewPlayer({...newPlayer, number: e.target.value})}
              type="number"
              style={{ padding: '10px 12px' }}
            />

            <div style={{ 
              fontSize: '14px', 
              color: 'var(--vkui--color_text_secondary)', 
              marginBottom: '6px',
              marginTop: '12px'
            }}>
              Фамилия Имя
            </div>
            <Input
              value={newPlayer.name}
              onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})}
              style={{ padding: '10px 12px' }}
            />

            <div style={{ 
              fontSize: '14px', 
              color: 'var(--vkui--color_text_secondary)', 
              marginBottom: '6px',
              marginTop: '12px'
            }}>
              VK ID (опционально)
            </div>
            <Input
              value={newPlayer.vkId}
              onChange={(e) => setNewPlayer({...newPlayer, vkId: e.target.value})}
              type="number"
              style={{ padding: '10px 12px' }}
            />

            <div style={{ 
              fontSize: '14px', 
              color: 'var(--vkui--color_text_secondary)', 
              marginBottom: '6px',
              marginTop: '12px'
            }}>
              Амплуа
            </div>
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
                fontSize: '16px',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3e%3cpath fill='%23000' d='M7 10l5 5 5-5z'/%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '16px 16px'
              }}
            >
              <option value="forward">Нападающий</option>
              <option value="defender">Защитник</option>
              <option value="midfielder">Полузащитник</option>
              <option value="goalkeeper">Вратарь</option>
              <option value="universal">Универсал</option>
            </select>

            <Button 
              size="l" 
              mode="primary" 
              onClick={handleAddPlayer} 
              disabled={loading}
              style={{ marginTop: '24px' }}
            >
              {loading ? 'Добавление...' : 'Добавить игрока'}
            </Button>
          </FormLayout>
        </Div>
      </Group>
    </>
  );
};

export default AddPlayer;