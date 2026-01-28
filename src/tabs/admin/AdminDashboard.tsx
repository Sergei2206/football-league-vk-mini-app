import React, { useState, useEffect } from 'react';
import { Div, Button, Snackbar, FormLayout, Input } from '@vkontakte/vkui';
import { db } from '../../firebase';
import { collection, getDocs, query, where, deleteDoc, doc, addDoc } from 'firebase/firestore';
import { Tournament } from '../../types';
import TournamentList from './TournamentList';
import TournamentDetail from './TournamentDetail';

interface AdminDashboardProps {
  user: any;
}

const AdminDashboard = ({ user }: AdminDashboardProps) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState<{ id: string; name: string } | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const [tournamentName, setTournamentName] = useState('');
  const [tournamentType, setTournamentType] = useState<'league' | 'cup'>('league');
  const [isSeasonal, setIsSeasonal] = useState(false);
  const [seasonNumber, setSeasonNumber] = useState<string>('');

  const userId = Number(user?.id);

  useEffect(() => {
    if (isSeasonal) {
      setSeasonNumber(`${new Date().getFullYear()}/${new Date().getFullYear() + 1}`);
    } else {
      setSeasonNumber('');
    }
  }, [isSeasonal]);

  const loadTournaments = async () => {
    try {
      const q = query(collection(db, 'tournaments'), where('adminVkId', '==', userId));
      const snapshot = await getDocs(q);
      const list: Tournament[] = [];
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        list.push({
          id: doc.id,
          name: data.name || '',
          adminVkId: data.adminVkId || userId,
          coAdmins: data.coAdmins || [userId],
          type: data.type || 'league',
          format: data.format || 'football11',
          createdAt: data.createdAt,
          season: data.season,
          disqualificationCards: data.disqualificationCards,
          rounds: data.rounds,
          hasPlayoff: data.hasPlayoff,
          penaltiesAfterDraw: data.penaltiesAfterDraw,
          winPoints: data.winPoints,
          drawPoints: data.drawPoints,
          penaltyWinPoints: data.penaltyWinPoints,
          lossPoints: data.lossPoints,
          matchDay: data.matchDay
        });
      });
      setTournaments(list);
    } catch (err) {
      console.error('Ошибка загрузки турниров:', err);
      setSnackbar('Не удалось загрузить турниры');
    }
  };

  useEffect(() => {
    loadTournaments();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tournaments', id));
      await loadTournaments();
      setSnackbar('Турнир удалён');
    } catch (err) {
      console.error('Ошибка удаления:', err);
      setSnackbar('Не удалось удалить турнир');
    } finally {
      setDeleteAlert(null);
    }
  };

  const handleCreateTournament = async () => {
    if (!tournamentName.trim()) {
      setSnackbar('Введите название турнира');
      return;
    }

    try {
      const data = {
        name: tournamentName.trim(),
        adminVkId: userId,
        coAdmins: [userId],
        type: tournamentType,
        format: 'football11',
        createdAt: new Date(),
        ...(isSeasonal && { season: seasonNumber || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}` })
      };

      await addDoc(collection(db, 'tournaments'), data);
      
      setTournamentName('');
      setTournamentType('league');
      setIsSeasonal(false);
      setSeasonNumber('');
      
      setShowCreateModal(false);
      await loadTournaments();
      setSnackbar('Турнир создан!');
    } catch (err: any) {
      console.error('Подробная ошибка создания турнира:', err);
      setSnackbar(`Ошибка: ${err.message || 'Не удалось создать турнир'}`);
    }
  };

  if (selectedTournament) {
    return (
      <TournamentDetail 
        tournament={selectedTournament}
        user={user}
        onBack={() => setSelectedTournament(null)}
        onSnackbar={setSnackbar}
      />
    );
  }

  return (
    <Div>
      <TournamentList 
        tournaments={tournaments}
        onTournamentSelect={setSelectedTournament}
        onCreateTournamentClick={() => setShowCreateModal(true)}
        onDeleteAlert={setDeleteAlert}
      />

      {/* Модальное окно создания */}
      {showCreateModal && (
        <Div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Div style={{
            backgroundColor: 'var(--vkui--color_background_content)',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '400px',
            maxHeight: '80vh',
            overflowY: 'auto',
            padding: '20px'
          }}>
            <FormLayout>
              <Input
                value={tournamentName}
                onChange={(e) => setTournamentName(e.target.value)}
                placeholder="Название турнира"
              />
              
              <div style={{ marginBottom: '12px' }}>
                <div style={{ 
                  fontSize: '14px', 
                  color: 'var(--vkui--color_text_secondary)', 
                  marginBottom: '6px'
                }}>
                  Тип турнира
                </div>
                <select
                  value={tournamentType}
                  onChange={(e) => setTournamentType(e.target.value as 'league' | 'cup')}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--vkui--color_field_border_alpha)',
                    backgroundColor: 'var(--vkui--color_field_background)',
                    color: 'var(--vkui--color_text_primary)',
                    fontSize: '16px',
                    appearance: 'none',
                    backgroundImage: `url("image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3e%3cpath fill='%23000' d='M7 10l5 5 5-5z'/%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '16px 16px'
                  }}
                >
                  <option value="league">Чемпионат</option>
                  <option value="cup">Кубок</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={isSeasonal}
                    onChange={(e) => setIsSeasonal(e.target.checked)}
                    style={{
                      marginRight: '10px',
                      width: '18px',
                      height: '18px'
                    }}
                  />
                  <span style={{ color: 'var(--vkui--color_text_primary)' }}>
                    Сезонный турнир
                  </span>
                </label>
              </div>
              
              {isSeasonal && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ 
                    fontSize: '14px', 
                    color: 'var(--vkui--color_text_secondary)', 
                    marginBottom: '6px'
                  }}>
                    Номер сезона
                  </div>
                  <Input
                    type="text"
                    value={seasonNumber}
                    onChange={(e) => setSeasonNumber(e.target.value)}
                    placeholder={`Например: ${new Date().getFullYear()}/${new Date().getFullYear() + 1}`}
                    style={{
                      padding: '10px 12px'
                    }}
                  />
                </div>
              )}
              
              <Button
                size="l"
                mode="primary"
                onClick={handleCreateTournament}
                style={{ marginTop: '24px' }}
              >
                Создать турнир
              </Button>
              
              <Button
                size="l"
                mode="secondary"
                onClick={() => setShowCreateModal(false)}
                style={{ marginTop: '12px' }}
              >
                Отмена
              </Button>
            </FormLayout>
          </Div>
        </Div>
      )}

      {/* Модальное окно подтверждения удаления */}
      {deleteAlert && (
        <Div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Div style={{
            backgroundColor: 'var(--vkui--color_background_content)',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '350px',
            padding: '20px'
          }}>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '12px',
              textAlign: 'center'
            }}>
              Подтверждение
            </div>
            <div style={{ 
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              Удалить турнир "{deleteAlert.name}"?
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button
                size="l"
                mode="secondary"
                onClick={() => setDeleteAlert(null)}
                style={{ flex: 1 }}
              >
                Отмена
              </Button>
              <Button
                size="l"
                mode="primary"
                onClick={() => handleDelete(deleteAlert.id)}
                style={{ 
                  flex: 1,
                  backgroundColor: '#e64646',
                  borderColor: '#e64646'
                }}
              >
                Удалить
              </Button>
            </div>
          </Div>
        </Div>
      )}

      {snackbar && (
        <Snackbar duration={3000} onClose={() => setSnackbar(null)}>
          {snackbar}
        </Snackbar>
      )}
    </Div>
  );
};

export default AdminDashboard;