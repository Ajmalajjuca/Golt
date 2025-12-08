import React, { useRef, useEffect } from 'react';
import { View, Modal, Text } from 'react-native';
import LottieView from 'lottie-react-native';

interface SuccessAnimationProps {
  visible: boolean;
  onAnimationFinish?: () => void;
  title?: string;
  message?: string;
}

export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  visible,
  onAnimationFinish,
  title = 'Success!',
  message,
}) => {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (visible && animationRef.current) {
      animationRef.current.play();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onAnimationFinish}
    >
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="bg-white rounded-3xl p-8 items-center w-4/5">
          <LottieView
            ref={animationRef}
            source={require('../../assets/animations/success.json')}
            autoPlay
            loop={false}
            style={{ width: 200, height: 200 }}
            onAnimationFinish={onAnimationFinish}
          />
          <Text className="text-2xl font-bold text-gray-900 mt-4">{title}</Text>
          {message && (
            <Text className="text-gray-600 text-center mt-2">{message}</Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

interface LoadingAnimationProps {
  visible: boolean;
  message?: string;
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  visible,
  message = 'Loading...',
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="bg-white rounded-3xl p-8 items-center">
          <LottieView
            source={require('../../assets/animations/loading.json')}
            autoPlay
            loop
            style={{ width: 150, height: 150 }}
          />
          <Text className="text-gray-900 font-semibold mt-4">{message}</Text>
        </View>
      </View>
    </Modal>
  );
};
