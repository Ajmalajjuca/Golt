import React, { createContext, useContext, useState, useCallback } from 'react';
import { Alert, AlertType, AlertPosition } from '../components/Alert';

interface AlertOptions {
  type: AlertType;
  title: string;
  message?: string;
  duration?: number;
  position?: AlertPosition;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState<AlertOptions | null>(null);
  const [visible, setVisible] = useState(false);

  const showAlert = useCallback((options: AlertOptions) => {
    setAlertConfig(options);
    setVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setVisible(false);
    setTimeout(() => setAlertConfig(null), 300);
  }, []);

  const showSuccess = useCallback((title: string, message?: string) => {
    showAlert({ type: 'success', title, message });
  }, [showAlert]);

  const showError = useCallback((title: string, message?: string) => {
    showAlert({ type: 'error', title, message });
  }, [showAlert]);

  const showWarning = useCallback((title: string, message?: string) => {
    showAlert({ type: 'warning', title, message });
  }, [showAlert]);

  const showInfo = useCallback((title: string, message?: string) => {
    showAlert({ type: 'info', title, message });
  }, [showAlert]);

  return (
    <AlertContext.Provider
      value={{
        showAlert,
        hideAlert,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
      {alertConfig && (
        <Alert
          {...alertConfig}
          visible={visible}
          onClose={hideAlert}
        />
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};