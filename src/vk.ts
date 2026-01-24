import vkBridge from '@vkontakte/vk-bridge';

const isVKEnvironment = () => {
  return typeof window !== 'undefined' && 
         (window.location.search.includes('vk_app_id') || 
          window.location.hostname === 'vk.com');
};

export const initVK = () => {
  if (isVKEnvironment()) {
    console.log('VK Bridge initializing...');
    try {
      if (vkBridge.supports('VKWebAppInit')) {
        vkBridge.send('VKWebAppInit');
        console.log('VKWebAppInit sent');
      }
    } catch (error) {
      console.warn('VK Bridge init failed:', error);
    }
  } else {
    console.log('Not in VK environment');
  }
};

export const getUserInfo = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!isVKEnvironment()) {
      resolve({ id: 0, first_name: 'Гость', last_name: '', is_guest: true });
      return;
    }

    try {
      console.log('Requesting user info...');
      vkBridge.send('VKWebAppGetUserInfo')
        .then((userData) => {
          console.log('User data received:', userData);
          resolve(userData);
        })
        .catch(reject);
    } catch (error) {
      reject(error);
    }
  });
};