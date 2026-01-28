export interface Tournament {
  id: string;
  name: string;
  adminVkId: number; // VK ID администратора (число)
  coAdmins?: number[]; // Массив VK ID со-админов (числа)
  type: 'league' | 'cup';
  format: 'football11' | 'mini8' | 'futsal'; // Правильные форматы игры
  season?: string;
  createdAt: Date;
  
  // Настройки чемпионата
  rounds?: number; // Количество кругов
  hasPlayoff?: boolean; // Есть ли стадия плей-офф
  playoffTeams?: number; // Сколько команд в плей-офф
  playoffWins?: number; // До скольки побед играется серия
  penaltiesAfterDraw?: boolean; // Назначать пенальти при ничьей
  winPoints?: number; // Очки за победу
  drawPoints?: number; // Очки за ничью
  penaltyWinPoints?: number; // Очки за ничью + победу по пенальти
  lossPoints?: number; // Очки за поражение
  
  // Общие настройки
  disqualificationCards?: number; // Карточки для дисквалификации
  matchDay?: string; // День проведения матчей
  isSeasonStarted?: boolean; // Начался ли сезон
  scheduleCreated?: boolean; // Создано ли расписание
}

export interface Team {
  id: string;
  tournamentId: string;
  name: string;
  captainVkId: number; // VK ID капитана (число)
  players?: Player[];
  logoUrl?: string;
  isSeasonStarted?: boolean;
  
  // Статистика команды
  matches?: number; // Количество матчей
  points?: number; // Очки
  wins?: number; // Победы
  draws?: number; // Ничьи
  losses?: number; // Поражения
  goalsFor?: number; // Забитые голы
  goalsAgainst?: number; // Пропущенные голы
  yellowCards?: number; // Жёлтые карточки
  redCards?: number; // Красные карточки
}

export interface Player {
  id: string;
  number: number; // Номер игрока
  name: string; // Фамилия Имя
  vkId?: number; // VK ID игрока (опционально, число)
  position: 'forward' | 'defender' | 'universal' | 'goalkeeper' | 'midfielder'; // Амплуа
}

export interface Match {
  id: string;
  tournamentId: string;
  team1Id: string;
  team2Id: string;
  team1Name: string;
  team2Name: string;
  date: Date;
  status: 'scheduled' | 'started' | 'completed';
  referees?: string[]; // Фамилии судей
  lineupSubmitted?: boolean; // Отправлен ли состав
  team1Players?: PlayerProtocol[]; // Состав команды 1
  team2Players?: PlayerProtocol[]; // Состав команды 2
  team1Score?: number; // Счёт команды 1
  team2Score?: number; // Счёт команды 2
  penaltiesTeam1?: number; // Пенальти команды 1
  penaltiesTeam2?: number; // Пенальти команды 2
  team1Points?: number; // Очки команды 1
  team2Points?: number; // Очки команды 2
  winner?: string; // Победитель (team1Id или team2Id)
}

export interface PlayerProtocol {
  playerId: string;
  playerName: string;
  number: number;
  goals: number; // Забитые голы
  yellowCards: number; // Жёлтые карточки
  redCards: number; // Красные карточки
}

export interface User {
  id: number; // VK ID пользователя (число)
  first_name: string;
  last_name: string;
  photo_50?: string;
}

// Типы для ролей
export type UserRole = 'guest' | 'admin' | 'superadmin' | 'captain';