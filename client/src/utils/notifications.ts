export const addNotification = (text: string) => {
  const existing = JSON.parse(localStorage.getItem('notifications') || '[]');

  const newNotif = {
    id: Date.now(),
    text,
    date: new Date().toISOString(),
  };

  localStorage.setItem(
    'notifications',
    JSON.stringify([newNotif, ...existing]),
  );
};
