import vkBridge from '@vkontakte/vk-bridge';

export const initVK = () => {
  console.log('Попытка инициализации VK Bridge');
  try {
    if (vkBridge.supports('VKWebAppInit')) {
      vkBridge.send('VKWebAppInit');
      console.log('VKWebAppInit успешно отправлен');
    }
  } catch (error) {
    console.error('Ошибка инициализации VK Bridge:', error);
  }
};

export const getUserInfo = async () => {
  console.log('Запрос информации о пользователе');
  try {
    const userData = await vkBridge.send('VKWebAppGetUserInfo');
    console.log('Данные пользователя получены:', userData);
    return userData;
  } catch (error) {
    console.error('Ошибка получения данных пользователя:', error);
    throw error;
  }
};