class UserStorage {
  constructor() {
    this.STORAGE_KEYS = {
      WELCOME_VIDEO_WATCHED: 'welcome_video_watched',
      WELCOME_VIDEO_USER_TYPE: 'welcome_video_user_type',
      ONBOARDING_DATA: 'onboarding_data',
      DEVICE_ID: 'device_id',
      USER_TOKEN: 'user_token',
      REDIRECT_PATH: 'redirectPath',
    };
  }
  setWelcomeVideoWatched(userType) {
    sessionStorage.setItem(this.STORAGE_KEYS.WELCOME_VIDEO_WATCHED, 'true');
    sessionStorage.setItem(this.STORAGE_KEYS.WELCOME_VIDEO_USER_TYPE, userType);
    const data = {
      watched: true,
      userType,
      timestamp: Date.now(),
    };
    localStorage.setItem(
      this.STORAGE_KEYS.WELCOME_VIDEO_WATCHED,
      JSON.stringify(data)
    );
  }

  getWelcomeVideoWatched() {
    const sessionWatched = sessionStorage.getItem(
      this.STORAGE_KEYS.WELCOME_VIDEO_WATCHED
    );
    if (sessionWatched === 'true') {
      return {
        watched: true,
        userType: sessionStorage.getItem(
          this.STORAGE_KEYS.WELCOME_VIDEO_USER_TYPE
        ),
      };
    }

    try {
      const localData = localStorage.getItem(
        this.STORAGE_KEYS.WELCOME_VIDEO_WATCHED
      );
      if (localData) {
        const parsed = JSON.parse(localData);
        return {
          watched: parsed.watched,
          userType: parsed.userType,
        };
      }
    } catch (e) {
      console.error('Erro ao ler dados do welcome video:', e);
    }

    return { watched: false, userType: null };
  }

  clearWelcomeVideoData() {
    sessionStorage.removeItem(this.STORAGE_KEYS.WELCOME_VIDEO_WATCHED);
    sessionStorage.removeItem(this.STORAGE_KEYS.WELCOME_VIDEO_USER_TYPE);
    localStorage.removeItem(this.STORAGE_KEYS.WELCOME_VIDEO_WATCHED);
  }

  setOnboardingData(data) {
    const onboardingData = {
      ...data,
      timestamp: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, 
    };
    localStorage.setItem(
      this.STORAGE_KEYS.ONBOARDING_DATA,
      JSON.stringify(onboardingData)
    );
  }

  getOnboardingData() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.ONBOARDING_DATA);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
          return parsed;
        } else {
          localStorage.removeItem(this.STORAGE_KEYS.ONBOARDING_DATA);
        }
      }
    } catch (e) {
      console.error('Erro ao ler dados de onboarding:', e);
    }
    return null;
  }

  getDeviceId() {
    return localStorage.getItem(this.STORAGE_KEYS.DEVICE_ID);
  }

  setDeviceId(deviceId) {
    localStorage.setItem(this.STORAGE_KEYS.DEVICE_ID, deviceId);
  }

  getUserToken() {
    return localStorage.getItem(this.STORAGE_KEYS.USER_TOKEN);
  }

  setUserToken(token) {
    localStorage.setItem(this.STORAGE_KEYS.USER_TOKEN, token);
  }

  getRedirectPath() {
    return localStorage.getItem(this.STORAGE_KEYS.REDIRECT_PATH);
  }

  setRedirectPath(path) {
    localStorage.setItem(this.STORAGE_KEYS.REDIRECT_PATH, path);
  }

  clearRedirectPath() {
    localStorage.removeItem(this.STORAGE_KEYS.REDIRECT_PATH);
  }

  clearAllUserData() {
    this.clearWelcomeVideoData();
    localStorage.removeItem(this.STORAGE_KEYS.ONBOARDING_DATA);
    localStorage.removeItem(this.STORAGE_KEYS.USER_TOKEN);
    localStorage.removeItem(this.STORAGE_KEYS.REDIRECT_PATH);
  }

  getAllData() {
    return {
      welcomeVideo: this.getWelcomeVideoWatched(),
      onboarding: this.getOnboardingData(),
      deviceId: this.getDeviceId(),
      userToken: this.getUserToken(),
      redirectPath: this.getRedirectPath(),
    };
  }
}

const userStorage = new UserStorage();
export default userStorage;
