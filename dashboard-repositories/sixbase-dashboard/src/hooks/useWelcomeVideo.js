import { useState, useEffect } from 'react';
import { useUser } from '../providers/contextUser';
import userStorage from '../utils/storage';
import { getVideoConfig } from '../jsx/components/VideoConfig';

const useWelcomeVideo = () => {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [userType, setUserType] = useState(null);
  const { user } = useUser();

  useEffect(() => {
    const shouldShowVideo = () => {
      const videoData = userStorage.getWelcomeVideoWatched();
      if (videoData.watched) {
        return false;
      }

      if (!user) {
        return false;
      }

      if (!user.onboarding_completed) {
        return false;
      }

      return true;
    };

    const determineUserType = () => {
      if (!user) return null;

      const onboardingData = userStorage.getOnboardingData();

      if (onboardingData) {
        return onboardingData.user_type;
      }

      if (user.user_type === 3) return 'creator';
      if (user.user_type === 4) return 'marca';

      return null;
    };

    if (shouldShowVideo()) {
      const type = determineUserType();

      if (type && getVideoConfig(type)) {
        setUserType(type);
        setShowVideoModal(true);
      }
    }
  }, [user]);

  const handleVideoComplete = () => {
    userStorage.setWelcomeVideoWatched(userType);

    if (window.gtag) {
      window.gtag('event', 'video_complete', {
        event_category: 'onboarding',
        event_label: userType,
        value: 1,
      });
    }
  };

  const handleCloseModal = () => {
    setShowVideoModal(false);
  };

  const resetWelcomeVideo = () => {
    userStorage.clearWelcomeVideoData();
    setShowVideoModal(false);
  };

  return {
    showVideoModal,
    userType,
    handleVideoComplete,
    handleCloseModal,
    resetWelcomeVideo,
  };
};

export default useWelcomeVideo;
