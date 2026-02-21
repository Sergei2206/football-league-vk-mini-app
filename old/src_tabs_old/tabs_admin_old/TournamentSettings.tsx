import React, { useState, useEffect } from 'react';
import { Group, Div, FormLayout, Input, Button } from '@vkontakte/vkui';
import { db } from '../../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface TournamentSettingsProps {
  tournament?: any;
  onSnackbar?: (message: string) => void;
}

const TournamentSettings = ({ tournament, onSnackbar }: TournamentSettingsProps) => {
  const [format, setFormat] = useState<'football11' | 'mini8' | 'futsal'>('football11');
  const [disqualificationCards, setDisqualificationCards] = useState<string>('2');
  const [rounds, setRounds] = useState<string>('2');
  const [hasPlayoff, setHasPlayoff] = useState<boolean>(true);
  const [playoffTeams, setPlayoffTeams] = useState<string>('8');
  const [playoffWins, setPlayoffWins] = useState<string>('1');
  const [penaltiesAfterDraw, setPenaltiesAfterDraw] = useState<boolean>(false);
  const [winPoints, setWinPoints] = useState<string>('3');
  const [drawPoints, setDrawPoints] = useState<string>('1');
  const [penaltyWinPoints, setPenaltyWinPoints] = useState<string>('2');
  const [lossPoints, setLossPoints] = useState<string>('0');
  const [matchDay, setMatchDay] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isSeasonStarted, setIsSeasonStarted] = useState<boolean>(false);

  useEffect(() => {
    if (!tournament) return;

    setIsSeasonStarted(tournament.isSeasonStarted || false);
    
    const validFormat = ['football11', 'mini8', 'futsal'].includes(tournament.format) 
      ? tournament.format as 'football11' | 'mini8' | 'futsal'
      : 'football11';
    setFormat(validFormat);
    setDisqualificationCards(String(tournament.disqualificationCards || 2));
    setMatchDay(tournament.matchDay || '');

    if (tournament.type === 'league') {
      setRounds(String(tournament.rounds || 2));
      setHasPlayoff(Boolean(tournament.hasPlayoff));
      setPlayoffTeams(String(tournament.playoffTeams || 4));
      setPlayoffWins(String(tournament.playoffWins || 1));
      setPenaltiesAfterDraw(Boolean(tournament.penaltiesAfterDraw));
      setWinPoints(String(tournament.winPoints || 3));
      setDrawPoints(String(tournament.drawPoints || 1));
      setPenaltyWinPoints(String(tournament.penaltyWinPoints || 2));
      setLossPoints(String(tournament.lossPoints || 0));
    } else {
      setHasPlayoff(true);
      setPlayoffTeams(String(tournament.playoffTeams || 8));
      setPlayoffWins(String(tournament.playoffWins || 1));
      setPenaltiesAfterDraw(Boolean(tournament.penaltiesAfterDraw));
    }
  }, [tournament]);

  const handleNumberChange = (value: string, setter: (val: string) => void, min: number = 0, max: number = 99) => {
    const num = parseInt(value);
    if (isNaN(num)) {
      setter('0');
    } else if (num < min) {
      setter(String(min));
    } else if (num > max) {
      setter(String(max));
    } else {
      setter(value);
    }
  };

  const handleSave = async () => {
    if (!tournament?.id) {
      onSnackbar?.('Ошибка: турнир не найден');
      return;
    }

    if (isSeasonStarted) {
      onSnackbar?.('Сезон уже начался. Настройки можно изменить только для следующего сезона.');
      return;
    }

    try {
      setLoading(true);

      const settingsData: any = {
        format,
        disqualificationCards: parseInt(disqualificationCards) || 2,
        matchDay,
        isSeasonStarted: false
      };

      if (tournament.type === 'league') {
        settingsData.rounds = parseInt(rounds) || 2;
        settingsData.hasPlayoff = hasPlayoff;
        settingsData.playoffTeams = parseInt(playoffTeams) || 4;
        settingsData.playoffWins = parseInt(playoffWins) || 1;
        settingsData.penaltiesAfterDraw = penaltiesAfterDraw;
        settingsData.winPoints = parseInt(winPoints) || 3;
        settingsData.drawPoints = parseInt(drawPoints) || 1;
        settingsData.penaltyWinPoints = parseInt(penaltyWinPoints) || 2;
        settingsData.lossPoints = parseInt(lossPoints) || 0;
      } else {
        settingsData.playoffTeams = parseInt(playoffTeams) || 8;
        settingsData.playoffWins = parseInt(playoffWins) || 1;
        settingsData.penaltiesAfterDraw = penaltiesAfterDraw;
      }

      await updateDoc(doc(db, 'tournaments', tournament.id), settingsData);
      onSnackbar?.('Настройки успешно сохранены!');
    } catch (error: any) {
      console.error('Ошибка сохранения:', error);
      onSnackbar?.(`Ошибка: ${error.message || 'Не удалось сохранить настройки'}`);
    } finally {
      setLoading(false);
    }
  };

  const isLeague = tournament?.type === 'league';
  const isCup = tournament?.type === 'cup';

  return (
    <Group header="Настройки турнира">
      <Div style={{ padding: '16px' }}>
        <FormLayout>
          {isSeasonStarted && (
            <Div style={{ 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffeaa7', 
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              color: '#856404'
            }}>
              ⚠️ Сезон уже начался. Эти настройки применяются только к новым сезонам.
            </Div>
          )}

          <div style={{ 
            fontSize: '14px', 
            color: 'var(--vkui--color_text_secondary)', 
            marginBottom: '6px'
          }}>
            Тип турнира
          </div>
          <div style={{ 
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid var(--vkui--color_field_border_alpha)',
            backgroundColor: 'var(--vkui--color_field_background)',
            color: 'var(--vkui--color_text_primary)',
            fontSize: '16px'
          }}>
            {isLeague ? 'Чемпионат' : 'Кубок'}
          </div>

          {/* Формат игры - ГАРАНТИРОВАННО РАБОЧИЙ ВАРИАНТ */}
          <div style={{ 
            fontSize: '14px', 
            color: 'var(--vkui--color_text_secondary)', 
            marginBottom: '6px',
            marginTop: '12px'
          }}>
            Формат игры
          </div>
          <div style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid var(--vkui--color_field_border_alpha)',
            backgroundColor: 'var(--vkui--color_field_background)',
            color: 'var(--vkui--color_text_primary)',
            fontSize: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative'
          }}>
            <span>
              {format === 'football11' ? 'Футбол 11×11' : 
               format === 'mini8' ? 'Мини-футбол 8×8' : 
               'Футзал 5×5'}
            </span>
            {!isSeasonStarted && (
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as 'football11' | 'mini8' | 'futsal')}
                style={{
                  position: 'absolute',
                  opacity: 0,
                  width: '100%',
                  height: '100%',
                  left: 0,
                  top: 0,
                  cursor: 'pointer'
                }}
              >
                <option value="football11">Футбол 11×11</option>
                <option value="mini8">Мини-футбол 8×8</option>
                <option value="futsal">Футзал 5×5</option>
              </select>
            )}
          </div>

          <div style={{ 
            fontSize: '14px', 
            color: 'var(--vkui--color_text_secondary)', 
            marginBottom: '6px',
            marginTop: '12px'
          }}>
            Количество карточек для дисквалификации
          </div>
          <Input
            type="number"
            value={disqualificationCards}
            onChange={(e) => handleNumberChange(e.target.value, setDisqualificationCards, 1, 10)}
            min="1"
            max="10"
            disabled={isSeasonStarted}
            style={{ padding: '10px 12px', opacity: isSeasonStarted ? 0.6 : 1 }}
          />

          {isLeague && (
            <>
              <div style={{ 
                fontSize: '14px', 
                color: 'var(--vkui--color_text_secondary)', 
                marginBottom: '6px',
                marginTop: '12px'
              }}>
                Количество кругов
              </div>
              <Input
                type="number"
                value={rounds}
                onChange={(e) => handleNumberChange(e.target.value, setRounds, 1, 4)}
                min="1"
                max="4"
                disabled={isSeasonStarted}
                style={{ padding: '10px 12px', opacity: isSeasonStarted ? 0.6 : 1 }}
              />

              <div style={{ 
                fontSize: '16px', 
                fontWeight: 'bold',
                marginTop: '20px',
                marginBottom: '12px'
              }}>
                Система начисления очков
              </div>

              <div style={{ 
                fontSize: '14px', 
                color: 'var(--vkui--color_text_secondary)', 
                marginBottom: '6px'
              }}>
                Очки за победу
              </div>
              <Input
                type="number"
                value={winPoints}
                onChange={(e) => handleNumberChange(e.target.value, setWinPoints, 0, 10)}
                disabled={isSeasonStarted}
                style={{ padding: '10px 12px', opacity: isSeasonStarted ? 0.6 : 1 }}
              />

              <div style={{ 
                fontSize: '14px', 
                color: 'var(--vkui--color_text_secondary)', 
                marginBottom: '6px',
                marginTop: '12px'
              }}>
                Очки за ничью
              </div>
              <Input
                type="number"
                value={drawPoints}
                onChange={(e) => handleNumberChange(e.target.value, setDrawPoints, 0, 10)}
                disabled={isSeasonStarted}
                style={{ padding: '10px 12px', opacity: isSeasonStarted ? 0.6 : 1 }}
              />

              <div style={{ 
                fontSize: '14px', 
                color: 'var(--vkui--color_text_secondary)', 
                marginBottom: '6px',
                marginTop: '12px'
              }}>
                Очки за ничью + победу по пенальти
              </div>
              <Input
                type="number"
                value={penaltyWinPoints}
                onChange={(e) => handleNumberChange(e.target.value, setPenaltyWinPoints, 0, 10)}
                disabled={isSeasonStarted}
                style={{ padding: '10px 12px', opacity: isSeasonStarted ? 0.6 : 1 }}
              />

              <div style={{ 
                fontSize: '14px', 
                color: 'var(--vkui--color_text_secondary)', 
                marginBottom: '6px',
                marginTop: '12px'
              }}>
                Очки за поражение
              </div>
              <Input
                type="number"
                value={lossPoints}
                onChange={(e) => handleNumberChange(e.target.value, setLossPoints, 0, 10)}
                disabled={isSeasonStarted}
                style={{ padding: '10px 12px', opacity: isSeasonStarted ? 0.6 : 1 }}
              />
            </>
          )}

          <div style={{ 
            fontSize: '16px', 
            fontWeight: 'bold',
            marginTop: '20px',
            marginBottom: '12px'
          }}>
            {isCup ? 'Турнирная сетка кубка' : 'Стадия плей-офф'}
          </div>

          {isLeague && (
            <div style={{ 
              fontSize: '14px', 
              color: 'var(--vkui--color_text_secondary)', 
              marginBottom: '6px'
            }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center',
                cursor: isSeasonStarted ? 'not-allowed' : 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={hasPlayoff}
                  onChange={(e) => !isSeasonStarted && setHasPlayoff(e.target.checked)}
                  disabled={isSeasonStarted}
                  style={{
                    marginRight: '10px',
                    width: '18px',
                    height: '18px',
                    opacity: isSeasonStarted ? 0.6 : 1
                  }}
                />
                <span style={{ 
                  color: 'var(--vkui--color_text_primary)',
                  opacity: isSeasonStarted ? 0.6 : 1
                }}>
                  Включить стадию плей-офф
                </span>
              </label>
            </div>
          )}

          {(isCup || (isLeague && hasPlayoff)) && (
            <>
              <div style={{ 
                fontSize: '14px', 
                color: 'var(--vkui--color_text_secondary)', 
                marginBottom: '6px',
                marginTop: '12px',
                paddingLeft: isLeague ? '28px' : '0'
              }}>
                Количество команд в сетке
              </div>
              <Input
                type="number"
                value={playoffTeams}
                onChange={(e) => handleNumberChange(e.target.value, setPlayoffTeams, 2, 32)}
                min="2"
                max="32"
                disabled={isSeasonStarted}
                style={{ padding: '10px 12px', opacity: isSeasonStarted ? 0.6 : 1 }}
              />

              <div style={{ 
                fontSize: '14px', 
                color: 'var(--vkui--color_text_secondary)', 
                marginBottom: '6px',
                marginTop: '12px',
                paddingLeft: isLeague ? '28px' : '0'
              }}>
                До скольки побед играется серия
              </div>
              <Input
                type="number"
                value={playoffWins}
                onChange={(e) => handleNumberChange(e.target.value, setPlayoffWins, 1, 7)}
                min="1"
                max="7"
                disabled={isSeasonStarted}
                style={{ padding: '10px 12px', opacity: isSeasonStarted ? 0.6 : 1 }}
              />
            </>
          )}

          <div style={{ 
            fontSize: '14px', 
            color: 'var(--vkui--color_text_secondary)', 
            marginBottom: '6px',
            marginTop: '12px'
          }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center',
              cursor: isSeasonStarted ? 'not-allowed' : 'pointer'
            }}>
              <input
                type="checkbox"
                checked={penaltiesAfterDraw}
                onChange={(e) => !isSeasonStarted && setPenaltiesAfterDraw(e.target.checked)}
                disabled={isSeasonStarted}
                style={{
                  marginRight: '10px',
                  width: '18px',
                  height: '18px',
                  opacity: isSeasonStarted ? 0.6 : 1
                }}
              />
              <span style={{ 
                color: 'var(--vkui--color_text_primary)',
                opacity: isSeasonStarted ? 0.6 : 1
              }}>
                Назначать пенальти при ничьей
              </span>
            </label>
          </div>

          <div style={{ 
            fontSize: '14px', 
            color: 'var(--vkui--color_text_secondary)', 
            marginBottom: '6px',
            marginTop: '12px'
          }}>
            День проведения матчей
          </div>
          <select
            value={matchDay}
            onChange={(e) => !isSeasonStarted && setMatchDay(e.target.value)}
            disabled={isSeasonStarted}
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
              backgroundSize: '16px 16px',
              opacity: isSeasonStarted ? 0.6 : 1
            }}
          >
            <option value="">Любой день</option>
            <option value="monday">Понедельник</option>
            <option value="tuesday">Вторник</option>
            <option value="wednesday">Среда</option>
            <option value="thursday">Четверг</option>
            <option value="friday">Пятница</option>
            <option value="saturday">Суббота</option>
            <option value="sunday">Воскресенье</option>
          </select>

          <Button
            size="l"
            mode="primary"
            onClick={handleSave}
            disabled={loading || isSeasonStarted}
            style={{ marginTop: '24px' }}
          >
            {loading ? 'Сохранение...' : 
             isSeasonStarted ? 'Настройки заблокированы' : 'Сохранить настройки'}
          </Button>
        </FormLayout>
      </Div>
    </Group>
  );
};

export default TournamentSettings;