import vkBridge from '@vkontakte/vk-bridge';

// Проверяем, что приложение запущено во ВКонтакте
const isVKEnvironment = () => {
  return typeof window !== 'undefined' && 
         (window.location.search.includes('vk_app_id') || 
          window.location.href.includes('vk.com/app'));
};

export const initVK = () => {
  if (isVKEnvironment() && vkBridge.supports('VKWebAppInit')) {
    try {
      vkBridge.send('VKWebAppInit');
    } catch (error) {
      console.warn('VK Bridge init failed:', error);
    }
  }
};

export const getUserInfo = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!isVKEnvironment()) {
      // Фолбэк для локальной разработки
      resolve({
        id: 123456789,
        first_name: 'Гость',
        last_name: 'Тестовый',
        photo_200: '',
        is_guest: true
      });
      return;
    }

    try {
      vkBridge.send('VKWebAppGetUserInfo')
        .then(resolve)
        .catch(reject);
    } catch (error) {
      reject(error);
    }
  });
};