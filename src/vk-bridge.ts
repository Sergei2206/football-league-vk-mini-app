import bridge from '@vkontakte/vk-bridge';

export const isVKEnvironment = () => {
  return typeof window !== 'undefined' && !!(window as any).vk;
};

export const initVKBridge = async () => {
  if (!isVKEnvironment()) {
    console.log('🔧 Запуск в режиме разработки (вне VK)');
    return false;
  }
  
  try {
    await bridge.send('VKWebAppInit');
    return true;
  } catch (error) {
    console.error('❌ Ошибка инициализации VK Bridge:', error);
    return false;
  }
};

export const getUserInfo = async () => {
  if (!isVKEnvironment()) {
    console.log('👤 Используем тестового пользователя');
    return {
      id: 91747933,
      first_name: 'Сергей',
      last_name: 'Застрогин',
      photo_50: 'https://vk.com/images/question_50.png'
    };
  }
  
  try {
    const userData = await bridge.send('VKWebAppGetUserInfo');
    return userData;
  } catch (error) {
    console.error('❌ Ошибка получения данных:', error);
    return null;
  }
};

