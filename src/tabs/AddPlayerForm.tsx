import React, { useState } from 'react';
import { FormLayout, Input, Button, Div, Snackbar } from '@vkontakte/vkui';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

interface AddPlayerFormProps {
  teamId: string;
  tournamentId?: string; // Теперь опционально
  onPlayerAdded: () => void;
}

const AddPlayerForm = ({ teamId, tournamentId, onPlayerAdded }: AddPlayerFormProps) => {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [number, setNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim() || !number) {
      setSnackbar('Заполните имя и номер');
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, 'players'), {
        teamId,
        tournamentId, // Сохраняем связь с турниром
        name: name.trim(),
        position: position.trim() || 'Игрок',
        number: parseInt(number) || 0,
        goals: 0,
        yellowCards: 0,
        redCards: 0
      });
      
      setName('');
      setPosition('');
      setNumber('');
      onPlayerAdded();
      setSnackbar('Игрок добавлен!');
    } catch (err) {
      console.error('Ошибка добавления игрока:', err);
      setSnackbar('Ошибка при добавлении');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Div>
      <FormLayout>
        <Input
          placeholder="Имя игрока"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="Позиция"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        />
        <Input
          type="number"
          placeholder="Номер"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
        />
        <Button size="l" mode="primary" loading={loading} onClick={handleSubmit}>
          Добавить игрока
        </Button>
      </FormLayout>
      
      {snackbar && (
        <Snackbar duration={3000} onClose={() => setSnackbar(null)}>
          {snackbar}
        </Snackbar>
      )}
    </Div>
  );
};

export default AddPlayerForm;