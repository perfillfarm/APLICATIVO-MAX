import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PurchaseData {
  id: string;
  customerName: string;
  location: string;
  product: string;
  timeAgo: string;
  avatar: string;
}

export const usePurchaseNotifications = () => {
  const { t, language } = useLanguage();
  const [currentNotification, setCurrentNotification] = useState<PurchaseData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sample purchase data
  const customerNames = [
    'Aiden Carter', 'Blake Thompson', 'Caleb Morgan', 'Damien Stone', 'Ethan Brooks',
    'Felix Bennett', 'Gavin Riley', 'Hugo Sinclair', 'Ian Parker', 'Jasper Cole',
    'Kevin Maddox', 'Liam Hayes', 'Mason Blake', 'Nolan Davis', 'Owen Walker',
    'Parker Reed', 'Quentin Moore', 'Ryan Foster', 'Sebastian Clarke', 'Tristan James',
    'Uriel Dawson', 'Victor Lane', 'Wyatt Collins', 'Xavier Hunt', 'Yannis Ford',
    'Zachary Wells', 'Axel Monroe', 'Declan Pierce', 'Finn Gallagher', 'Jaxon Cruz',
    'Luca Anderson', 'Miles Grant', 'Noah Turner', 'Elias Drake', 'Levi Spencer',
    'Ronan Mitchell', 'Theo West', 'Silas Knight', 'Troy Lawson', 'Julian Rivers'
  ];

  const products = [
    language === 'pt' ? 'Pacote 6 Frascos' : '6 Bottle Package',
    language === 'pt' ? 'Pacote 3 Frascos' : '3 Bottle Package',
    language === 'pt' ? 'Pacote 1 Frasco' : '1 Bottle Package'
  ];

  const timeOptions = [
    language === 'pt' ? '1 min atrás' : '1 min ago',
    language === 'pt' ? '2 min atrás' : '2 min ago',
    language === 'pt' ? '3 min atrás' : '3 min ago',
    language === 'pt' ? '5 min atrás' : '5 min ago',
    language === 'pt' ? '7 min atrás' : '7 min ago',
    language === 'pt' ? '10 min atrás' : '10 min ago',
    language === 'pt' ? '12 min atrás' : '12 min ago',
    language === 'pt' ? '15 min atrás' : '15 min ago'
  ];

  // Generate purchase data dynamically
  const purchaseData: PurchaseData[] = customerNames.map((name, index) => {
    const nameParts = name.split(' ');
    const avatar = nameParts[0].charAt(0) + nameParts[1].charAt(0);
    
    return {
      id: (index + 1).toString(),
      customerName: name,
      location: '',
      product: products[Math.floor(Math.random() * products.length)],
      timeAgo: timeOptions[Math.floor(Math.random() * timeOptions.length)],
      avatar: avatar,
    };
  });

  const showRandomNotification = () => {
    if (isVisible) return; // Don't show if one is already visible

    const randomIndex = Math.floor(Math.random() * purchaseData.length);
    const notification = purchaseData[randomIndex];
    
    setCurrentNotification(notification);
    setIsVisible(true);
  };

  const hideNotification = () => {
    setIsVisible(false);
    setCurrentNotification(null);
  };

  const startNotifications = () => {
    // Show first notification after 3 seconds
    timeoutRef.current = setTimeout(() => {
      showRandomNotification();
    }, 3000);

    // Then show notifications every 8-15 seconds
    intervalRef.current = setInterval(() => {
      if (!isVisible) {
        showRandomNotification();
      }
    }, Math.random() * 7000 + 8000); // Random between 8-15 seconds
  };

  const stopNotifications = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    hideNotification();
  };

  useEffect(() => {
    return () => {
      stopNotifications();
    };
  }, []);

  return {
    currentNotification,
    isVisible,
    hideNotification,
    startNotifications,
    stopNotifications,
  };
};