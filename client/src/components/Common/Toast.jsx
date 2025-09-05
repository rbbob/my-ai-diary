import React, { useState, useEffect } from 'react';
import { BsCheckCircle, BsExclamationTriangle, BsInfoCircle, BsX } from 'react-icons/bs';

const Toast = ({ type = 'info', message, duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose?.();
      }, 300); // アニメーション時間を待つ
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <BsCheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <BsExclamationTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <BsExclamationTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <BsInfoCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      default:
        return 'text-blue-800';
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`flex items-center p-4 border rounded-lg shadow-lg min-w-[300px] max-w-md ${getBackgroundColor()}`}>
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        
        <div className={`flex-1 text-sm font-medium ${getTextColor()}`}>
          {message}
        </div>
        
        <button
          onClick={handleClose}
          className={`flex-shrink-0 ml-3 p-1 rounded-full hover:bg-white hover:bg-opacity-50 transition-colors ${getTextColor()}`}
        >
          <BsX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;