import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { api } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';

export default function ContactPickerScreen() {
  const { invitationId } = useLocalSearchParams();
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
        });

        // Filter contacts with phone numbers
        const contactsWithPhones = data
          .filter((contact) => contact.phoneNumbers && contact.phoneNumbers.length > 0)
          .map((contact) => ({
            id: contact.id,
            name: contact.name || 'Unknown',
            phone: contact.phoneNumbers?.[0].number || '',
          }));

        setContacts(contactsWithPhones);
      } else {
        Alert.alert('Permission Denied', 'Please grant contacts permission to import contacts');
        // Add sample contacts for demo
        setContacts([
          { id: '1', name: 'John Doe', phone: '+91-9876543210' },
          { id: '2', name: 'Jane Smith', phone: '+91-9876543211' },
          { id: '3', name: 'Bob Johnson', phone: '+91-9876543212' },
          { id: '4', name: 'Alice Williams', phone: '+91-9876543213' },
          { id: '5', name: 'Charlie Brown', phone: '+91-9876543214' },
        ]);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Error', 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const toggleContact = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const handleSend = async () => {
    if (selectedContacts.size === 0) {
      Alert.alert('Error', 'Please select at least one contact');
      return;
    }

    setSending(true);
    try {
      const selectedContactsList = contacts.filter((c) => selectedContacts.has(c.id));
      
      await api.post('/invitations/send', {
        user_id: user?.id || '',
        invitation_id: invitationId,
        contacts: selectedContactsList,
      });

      Alert.alert(
        'Success',
        `Invitations sent to ${selectedContacts.size} contacts!`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send invitations');
    } finally {
      setSending(false);
    }
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContact = ({ item }: any) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => toggleContact(item.id)}
    >
      <View style={styles.contactLeft}>
        <View
          style={[
            styles.checkbox,
            selectedContacts.has(item.id) && styles.checkboxSelected,
          ]}
        >
          {selectedContacts.has(item.id) && (
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          )}
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactPhone}>{item.phone}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Contacts</Text>
        <TouchableOpacity onPress={() => setSelectedContacts(new Set(contacts.map((c) => c.id)))}>
          <Text style={styles.selectAllText}>Select All</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Selected Count */}
      <View style={styles.countBanner}>
        <Text style={styles.countText}>
          {selectedContacts.size} contact{selectedContacts.size !== 1 ? 's' : ''} selected
        </Text>
        {selectedContacts.size > 0 && (
          <TouchableOpacity onPress={() => setSelectedContacts(new Set())}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Contacts List */}
      {loading ? (
        <ActivityIndicator size="large" color="#8B5CF6" style={{ marginTop: 100 }} />
      ) : (
        <FlatList
          data={filteredContacts}
          renderItem={renderContact}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>No contacts found</Text>
            </View>
          }
        />
      )}

      {/* Send Button */}
      {selectedContacts.size > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.sendButton, sending && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#FFFFFF" />
                <Text style={styles.sendButtonText}>
                  Send to {selectedContacts.size} contact{selectedContacts.size !== 1 ? 's' : ''}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  countBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F3E8FF',
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  listContent: {
    paddingVertical: 8,
  },
  contactItem: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  contactPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sendButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});