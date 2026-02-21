import React, { useState, useEffect } from 'react';
import { Group, Div, FormLayout, Input, Button } from '@vkontakte/vkui';
import { db } from '../../../firebase';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';

interface TournamentEditorProps {
  tournament?: any;
  user: any;
  onBack: () => void;
  onSnackbar: (message: string) => void;
}

const TournamentEditor = ({ tournament, user, onBack, onSnackbar }: TournamentEditorProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'league' | 'cup'>('league');
  const [format, setFormat] = useState<'football11' | 'mini8' | 'futsal'>('football11');
  const [season, setSeason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tournament) {
      setName(tournament.name || '');
      setType(tournament.type || 'league');
      setFormat((tournament.format || 'football11') as 'football11' | 'mini8' | 'futsal');
      setSeason(tournament.season || '');
    }
  }, [tournament]);

  const handleSave = async () => {
    if (!name.trim()) {
      onSnackbar('Введите название турнира');
      return;
    }

    try {
      setLoading(true);
      
      const tournamentData: any = {
        name: name.trim(),
        type,
        format,
        adminVkId: user.id,
        createdAt: new Date()
      };

      if (season.trim()) {
        tournamentData.season = season.trim();
      }

      if (tournament?.id) {
        // Обновление существующего турнира
        await updateDoc(doc(db, 'tournaments', tournament.id), tournamentData);
        onSnackbar('Турнир успешно обновлён!');
      } else {
        // Создание нового турнира
        await addDoc(collection(db, 'tournaments'), tournamentData);
        onSnackbar('Турнир успешно создан!');
      }
      
      onBack();
    } catch (error: any) {
      console.error('Ошибка сохранения турнира:', error);
      onSnackbar(`Ошибка: ${error.message || 'Не удалось сохранить турнир'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Group header={tournament ? "Редактирование турнира" : "Создание турнира"}>
      <Div style={{ padding: '16px' }}>
        <FormLayout>
          {/* Название турнира */}
          <div style={{ 
            fontSize: '14px', 
            color: 'var(--vkui--color_text_secondary)', 
            marginBottom: '6px'
          }}>
            Название турнира
          </div>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Введите название"
            style={{ padding: '10px 12px' }}
          />

          {/* Тип турнира */}
          <div style={{ 
            fontSize: '14px', 
            color: 'var(--vkui--color_text_secondary)', 
            marginBottom: '6px',
            marginTop: '12px'
          }}>
            Тип турнира
          </div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'league' | 'cup')}
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
            <option value="league">Чемпионат</option>
            <option value="cup">Кубок</option>
          </select>

          {/* Формат игры */}
          <div style={{ 
            fontSize: '14px', 
            color: 'var(--vkui--color_text_secondary)', 
            marginBottom: '6px',
            marginTop: '12px'
          }}>
            Формат игры
          </div>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as 'football11' | 'mini8' | 'futsal')}
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
            <option value="football11">Футбол 11×11</option>
            <option value="mini8">Мини-футбол 8×8</option>
            <option value="futsal">Футзал 5×5</option>
          </select>

          {/* Сезон */}
          <div style={{ 
            fontSize: '14px', 
            color: 'var(--vkui--color_text_secondary)', 
            marginBottom: '6px',
            marginTop: '12px'
          }}>
            Сезон (опционально)
          </div>
          <Input
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            placeholder="Например: 2025/2026"
            style={{ padding: '10px 12px' }}
          />

          <Button
            size="l"
            mode="primary"
            onClick={handleSave}
            disabled={loading}
            style={{ marginTop: '24px' }}
          >
            {loading ? 'Сохранение...' : tournament ? 'Обновить турнир' : 'Создать турнир'}
          </Button>

          <Button
            size="l"
            mode="secondary"
            onClick={onBack}
            style={{ marginTop: '16px' }}
          >
            Отмена
          </Button>
        </FormLayout>
      </Div>
    </Group>
  );
};

export default TournamentEditor;