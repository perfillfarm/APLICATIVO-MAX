import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { User, CreditCard as Edit3, Save, Calendar, Mail, X, Camera } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { FirebaseService } from '@/services/FirebaseService';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface UserProfile {
  name: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  email: string;
  phone: string;
  startDate: string;
  profileImage?: string;
}

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const { user, userProfile, updateUserProfile } = useFirebaseAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState<UserProfile | null>(null);
  const [firstLoginDate, setFirstLoginDate] = useState<string>('');

  useEffect(() => {
    if (userProfile) {
      setProfile(userProfile);
      setTempProfile(userProfile);
    }
    loadFirstLoginDate();
  }, [userProfile]);


  const loadFirstLoginDate = async () => {
    try {
      if (user) {
        // Get user creation date from Firebase Auth
        const creationTime = user.metadata.creationTime;
        if (creationTime) {
          const firstDate = new Date(creationTime).toLocaleDateString();
          setFirstLoginDate(firstDate);
        } else {
          // Fallback: try to get from user profile or use current date
          const profile = await FirebaseService.getUserProfile(user.uid);
          if (profile?.createdAt) {
            const firstDate = new Date(profile.createdAt).toLocaleDateString();
            setFirstLoginDate(firstDate);
          } else {
            // Last fallback: use current date
            const currentDate = new Date().toLocaleDateString();
            setFirstLoginDate(currentDate);
          }
        }
        
      }
    } catch (error) {
      console.error('Error loading first login date:', error);
      // Fallback to current date if error
      const currentDate = new Date().toLocaleDateString();
      setFirstLoginDate(currentDate);
    }
  };

  const saveProfile = async () => {
    try {
      if (!tempProfile) return;
      
      console.log(`🔄 [${user?.uid}] Saving profile updates...`);
      await updateUserProfile(tempProfile);
      setProfile(tempProfile);
      setIsEditing(false);
      console.log(`💊 [${user?.uid}] Profile saved successfully`);
      Alert.alert(t('success'), t('profileUpdatedSuccess'));
    } catch (error) {
      console.error('Error saving profile:', error);
      console.error(`❌ [${user?.uid}] Failed to save profile:`, error);
      Alert.alert(t('error'), t('couldNotSaveProfile'));
    }
  };

  const startEditing = () => {
    setTempProfile(profile ? { ...profile } : null);
    setIsEditing(true);
  };

  const pickImage = async () => {
    try {
      console.log('📸 [Profile] pickImage function called');
      console.log(`📸 [Profile] Starting image picker for user ${user?.uid}`);
      
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('📸 [Profile] Gallery permission result:', permissionResult);
      
      if (permissionResult.granted === false) {
        console.log('📸 [Profile] Gallery permission denied');
        Alert.alert(t('permissionNeeded'), t('galleryPermission'));
        return;
      }

      // Launch image picker
      console.log('📸 [Profile] Launching image picker...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      console.log('📸 [Profile] Image picker result:', result);
      
      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log(`📸 [Profile] Image selected: ${imageUri}`);
        
        // Show loading state
        console.log('📸 [Profile] Starting upload process...');
        
        try {
          // Upload to Firebase Storage
          console.log('📸 [Profile] Uploading to Firebase Storage...');
          const downloadURL = await FirebaseService.uploadProfileImage(user!.uid, imageUri);
          console.log(`✅ [Profile] Image uploaded successfully: ${downloadURL}`);
          
          // Update temp profile with Firebase URL
          if (tempProfile) {
            console.log('📸 [Profile] Updating temp profile with new image URL');
            setTempProfile({ ...tempProfile, profileImageUrl: downloadURL });
          }
          
          Alert.alert(t('success'), t('imageUploadedSuccess'));
        } catch (error) {
          console.error('Error uploading image:', error);
          Alert.alert(t('error'), t('couldNotUploadImage'));
        }
      } else {
        console.log('📸 [Profile] Image selection canceled or failed');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      console.error('📸 [Profile] Error in pickImage:', error);
      Alert.alert(t('error'), t('couldNotSelectImage'));
    }
  };

  const takePhoto = async () => {
    try {
      console.log('📷 [Profile] takePhoto function called');
      console.log(`📷 [Profile] Starting camera for user ${user?.uid}`);
      
      // Request permission
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      console.log('📷 [Profile] Camera permission result:', permissionResult);
      
      if (permissionResult.granted === false) {
        console.log('📷 [Profile] Camera permission denied');
        Alert.alert(t('permissionNeeded'), t('cameraPermission'));
        return;
      }

      // Launch camera
      console.log('📷 [Profile] Launching camera...');
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      console.log('📷 [Profile] Camera result:', result);
      
      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log(`📷 [Profile] Photo taken: ${imageUri}`);
        
        // Show loading state
        console.log('📷 [Profile] Starting upload process...');
        
        try {
          // Upload to Firebase Storage
          console.log('📷 [Profile] Uploading to Firebase Storage...');
          const downloadURL = await FirebaseService.uploadProfileImage(user!.uid, imageUri);
          console.log(`✅ [Profile] Photo uploaded successfully: ${downloadURL}`);
          
          // Update temp profile with Firebase URL
          if (tempProfile) {
            console.log('📷 [Profile] Updating temp profile with new image URL');
            setTempProfile({ ...tempProfile, profileImageUrl: downloadURL });
          }
          
          Alert.alert(t('success'), t('imageUploadedSuccess'));
        } catch (error) {
          console.error('Error uploading photo:', error);
          Alert.alert(t('error'), t('couldNotUploadImage'));
        }
      } else {
        console.log('📷 [Profile] Photo capture canceled or failed');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      console.error('📷 [Profile] Error in takePhoto:', error);
      Alert.alert(t('error'), t('couldNotTakePhoto'));
    }
  };

  const showImageOptions = () => {
    console.log('📸 [Profile] showImageOptions called');
    Alert.alert(
      t('profilePhoto'),
      t('choosePhotoOption'),
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: t('gallery'), 
          onPress: () => {
            console.log('📸 [Profile] Gallery option selected');
            pickImage();
          }
        },
        { 
          text: t('camera'), 
          onPress: () => {
            console.log('📸 [Profile] Camera option selected');
            takePhoto();
          }
        },
      ]
    );
  };

  const cancelEdit = () => {
    setTempProfile(profile ? { ...profile } : null);
    setIsEditing(false);
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return '';
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return '';
  };

  const calculateDaysUsing = (startDate: string) => {
    if (!startDate) return '0';
    const start = new Date(startDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays.toString();
  };

  const ProfileField = ({ 
    icon: Icon, 
    label, 
    value, 
    onChangeText, 
    placeholder,
    readOnly = false
  }: any) => {
    return (
      <View>
        <Card style={{ marginBottom: 12 }} padding={16}>
          <View style={styles.fieldHeader}>
            <Icon size={20} color={theme.colors.primary} />
            <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
          </View>
          {isEditing ? (
            <TextInput
              style={[
                styles.fieldInput,
                {
                  color: theme.colors.text,
                  borderBottomColor: theme.colors.border,
                  opacity: readOnly ? 0.6 : 1,
                }
              ]}
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor={theme.colors.textSecondary}
              editable={!readOnly}
              autoCorrect={false}
              autoCapitalize="words"
              keyboardType="default"
              returnKeyType="next"
              blurOnSubmit={false}
              multiline={false}
            />
          ) : (
            <Text style={[styles.fieldValue, { color: theme.colors.text }]}>
              {value || t('notInformed')}
            </Text>
          )}
        </Card>
      </View>
    );
  };

  const GenderSelector = () => {
    return (
      <View>
        <Card style={{ marginBottom: 12 }} padding={16}>
          <View style={styles.fieldHeader}>
            <User size={20} color={theme.colors.primary} />
            <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>{t('profileGender')}</Text>
          </View>
          {isEditing ? (
            <View style={styles.genderContainer}>
              {['male', 'other'].map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.genderOption,
                    {
                      backgroundColor: tempProfile?.gender === gender ? theme.colors.primary : theme.colors.background,
                      borderColor: tempProfile?.gender === gender ? theme.colors.primary : theme.colors.border,
                    }
                  ]}
                  onPress={() => tempProfile && setTempProfile({ ...tempProfile, gender: gender as any })}
                >
                  <Text style={[
                    styles.genderOptionText,
                    {
                      color: tempProfile?.gender === gender ? '#ffffff' : theme.colors.textSecondary,
                    }
                  ]}>
                    {gender === 'male' ? t('male') : t('other')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={[styles.fieldValue, { color: theme.colors.text }]}>
              {profile?.gender === 'male' ? t('male') : profile?.gender === 'female' ? t('female') : t('other')}
            </Text>
          )}
        </Card>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header 
        title={
          <View style={styles.headerTitleContainer}>
            <User size={24} color="#ffffff" style={styles.headerIcon} />
            <Text style={styles.headerTitleText}>{t('profile')}</Text>
          </View>
        }
        subtitle={
          <View style={styles.headerSubtitleContainer}>
            <Text style={styles.headerSubtitleText}>{t('managePersonalInfo')}</Text>
          </View>
        }
        showOptions={false}
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        <Animated.View entering={FadeInDown.delay(400)}>
          <Card style={{ marginHorizontal: 20, marginBottom: 20 }} padding={24}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, { backgroundColor: theme.colors.background }]}>
                {(isEditing ? tempProfile?.profileImageUrl : profile?.profileImageUrl) ? (
                  <Image
                    source={{ uri: isEditing ? tempProfile?.profileImageUrl : profile?.profileImageUrl }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <User size={48} color={theme.colors.primary} />
                )}
              </View>
              
              {isEditing && (
                <TouchableOpacity
                  style={[styles.uploadButton, { backgroundColor: theme.colors.primary }]}
                  onPress={showImageOptions}
                >
                  <Camera size={20} color="#ffffff" />
                </TouchableOpacity>
              )}
            </View>
            
            <Text style={[styles.profileName, { color: theme.colors.text }]}>
              {profile?.name || t('nameNotInformed')}
            </Text>
            <Text style={[styles.profileSubtitle, { color: theme.colors.textSecondary }]}>
              {t('usingMaxTestorin')}
            </Text>
          </Card>
        </Animated.View>

        {/* Card de Controle de Edição */}
        <Animated.View entering={FadeInDown.delay(500)}>
          <Card style={{ marginHorizontal: 20, marginBottom: 20 }} padding={20}>
            <View style={styles.controlSection}>
              <Text style={[styles.controlTitle, { color: theme.colors.text }]}>
                {t('managePersonalData')}
              </Text>
              <Text style={[styles.controlSubtitle, { color: theme.colors.textSecondary }]}>
                {isEditing ? t('editModeActive') : t('viewOrEditInfo')}
              </Text>
              
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  { 
                    backgroundColor: isEditing ? theme.colors.warning : theme.colors.primary,
                  }
                ]}
                onPress={() => isEditing ? cancelEdit() : startEditing()}
                activeOpacity={0.7}
              >
                {isEditing ? (
                  <>
                    <X size={20} color="#ffffff" />
                    <Text style={styles.controlButtonText}>{t('cancelEdit')}</Text>
                  </>
                ) : (
                  <>
                    <Edit3 size={20} color="#ffffff" />
                    <Text style={styles.controlButtonText}>{t('editInformation')}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Card>
        </Animated.View>

        <View style={styles.form}>
          {/* Remover animações dos campos para evitar interferência */}
          <View>
            <ProfileField
              icon={User}
              label={t('fullName')}
              value={tempProfile?.name || ''}
              onChangeText={(text: string) => tempProfile && setTempProfile({ ...tempProfile, name: text })}
              placeholder={language === 'en' ? "Ex: John Silva Santos" : "Ex: João Silva Santos"}
            />

            <GenderSelector />

            <ProfileField
              icon={Mail}
              label={t('contactEmail')}
              value={tempProfile?.email || ''}
              onChangeText={(text: string) => tempProfile && setTempProfile({ ...tempProfile, email: text })}
              placeholder={language === 'en' ? "Ex: john@email.com" : "Ex: joao@email.com"}
            />

            <ProfileField
              icon={Calendar}
              label={t('treatmentStartDate')}
              value={firstLoginDate || tempProfile?.treatmentStartDate || ''}
              onChangeText={() => {}} // Read-only field
              placeholder={firstLoginDate ? firstLoginDate : (language === 'en' ? "Loading..." : "Carregando...")}
              readOnly={true}
            />

          </View>
        </View>

        {/* Card de Salvamento */}
        {isEditing && (
          <Animated.View entering={FadeInDown.delay(800)}>
            <Card style={{ marginHorizontal: 20, marginBottom: 20 }} padding={20}>
              <View style={styles.saveSection}>
                <Text style={[styles.saveTitle, { color: theme.colors.text }]}>
                  {t('saveChanges')}
                </Text>
                <Text style={[styles.saveSubtitle, { color: theme.colors.textSecondary }]}>
                  {t('confirmChanges')}
                </Text>
                
                <View style={styles.saveButtonContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.cancelButton, 
                      { 
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.border 
                      }
                    ]} 
                    onPress={cancelEdit}
                  >
                    <X size={18} color={theme.colors.textSecondary} />
                    <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>
                      {t('discard')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.saveButton, { backgroundColor: theme.colors.success }]} 
                    onPress={saveProfile}
                  >
                    <Save size={18} color="#ffffff" />
                    <Text style={styles.saveButtonText}>{t('saveData')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          </Animated.View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  avatarContainer: {
    alignItems: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  uploadButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  profileSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  controlSection: {
    alignItems: 'center',
  },
  controlTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  controlSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  controlButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  saveSection: {
    alignItems: 'center',
  },
  saveTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  saveSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  saveButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  fieldValue: {
    fontSize: 16,
    marginLeft: 28,
  },
  fieldInput: {
    fontSize: 16,
    marginLeft: 28,
    borderBottomWidth: 1,
    paddingBottom: 4,
  },
  genderContainer: {
    flexDirection: 'row',
    marginLeft: 28,
    gap: 8,
  },
  genderOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  genderOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginLeft: 8,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitleText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerSubtitleContainer: {
    marginTop: 2,
  },
  headerSubtitleText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },
});