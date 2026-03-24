import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const registerForPushNotifications = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Push notifications permission is required for booking updates and reminders'
      );
      return null;
    }

    // Get push token
    const token = await Notifications.getExpoPushTokenAsync();
    console.log('Push Token:', token.data);

    // Configure Android channel
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#8B5CF6',
      });
    }

    return token.data;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
};

export const sendLocalNotification = async (title: string, body: string, data: any = {}) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null,
  });
};

export const WeddingNotifications = {
  bookingConfirmed: (venueName: string) => ({
    title: '🎉 Booking Confirmed!',
    body: `Your booking at ${venueName} has been confirmed`,
  }),

  paymentSuccess: (amount: number) => ({
    title: '✅ Payment Successful',
    body: `Payment of ₹${amount.toLocaleString()} completed successfully`,
  }),

  weddingReminder: (daysLeft: number) => ({
    title: '💍 Wedding Reminder',
    body: `Only ${daysLeft} days left for your big day!`,
  }),

  invitationSent: (count: number) => ({
    title: '✉️ Invitations Sent',
    body: `Successfully sent invitations to ${count} contacts`,
  }),
};
