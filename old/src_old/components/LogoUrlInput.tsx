import React, { useState } from 'react';
import { Div, FormLayout, Input, Button, Snackbar } from '@vkontakte/vkui';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

interface LogoUrlInputProps {
  // Для турнира
  tournamentId?: string;
  // Для команды
  teamId?: string;
  // Общие пропсы
  currentLogo?: string;
  onLogoUpdated: (url: string) => void; // ← ИСПРАВЛЕНО: принимает URL
}

const LogoUrlInput = ({ 
  tournamentId, 
  teamId, 
  currentLogo, 
  onLogoUpdated 
}: LogoUrlInputProps) => {
  const [logoUrl, setLogoUrl] = useState(currentLogo || '');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const handleSave = async () => {
    if (!logoUrl.trim()) {
      setSnackbar('Введите URL логотипа');
      return;
    }

    try {
      setLoading(true);
      
      // Определяем, что обновляем — турнир или команду
      if (tournamentId) {
        await updateDoc(doc(db, 'tournaments', tournamentId), {
          logoUrl: logoUrl.trim(),
          updatedAt: new Date()
        });
      } else if (teamId) {
        await updateDoc(doc(db, 'teams', teamId), {
          logoUrl: logoUrl.trim(),
          updatedAt: new Date()
        });
      }
      
      setSnackbar('Логотип обновлён!');
      onLogoUpdated(logoUrl.trim()); // ← ПЕРЕДАЁМ URL
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      setSnackbar('Ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Div>
      <FormLayout>
        <Input
          placeholder="URL логотипа (например: https://i.ibb.co/.../logo.png)"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
        />
        
        <Div style={{ fontSize: '12px', color: '#818c99', marginTop: '-8px' }}>
          Загрузите изображение на ImgBB и вставьте прямую ссылку
        </Div>
        
        <Button 
          size="l" 
          mode="primary" 
          loading={loading}
          onClick={handleSave}
          style={{ marginTop: 16 }}
        >
          Сохранить логотип
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

export default LogoUrlInput;