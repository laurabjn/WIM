import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/authStack';
import { useTranslation } from 'react-i18next';
import { FontAwesome } from '@expo/vector-icons';

type Props = NativeStackScreenProps<AuthStackParamList, 'RegisterStart'>;

export const RegisterStartScreen: React.FC<Props> = ({ navigation }) => {
    const { t } = useTranslation('auth');
    
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.centerSection}>
            <Image
              source={require('../../../../assets/logo.jpg')}
              style={styles.logo}
              resizeMode="contain"
            />
            
            <Text style={styles.title}>{t('register.signUpTitle')}</Text>
          </View>

          <View style={styles.bottomSection}>
            <Text style={styles.legalText}>
              {t('register.usageConditions')}
            </Text>
            <TouchableOpacity style={styles.socialButton}>
              <View style={styles.socialContent}>
                <FontAwesome name="google" size={18} color="#000" style={styles.icon} />
                <Text style={styles.socialButtonText}>
                  {t('register.googleSignUp')}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <View style={styles.socialContent}>
                <FontAwesome name="apple" size={20} color="#000" style={styles.icon} />
                <Text style={styles.socialButtonText}>
                  {t('register.signUpWithApple')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('RegisterStep1')}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>{t('register.signUpWithEmail')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F3F4',
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F3F4',
    alignItems: 'center',
    justifyContent: 'center',
 },
  card: {
    width: '100%',
    maxWidth: 390,
    minHeight: 620,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 24,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 22,
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111111',
    textAlign: 'center',
    marginBottom: 90,
  },
  bottomSection: {
    gap: 12,
  },
  legalText: {
    fontSize: 11,
    lineHeight: 18,
    color: '#8B8B8B',
    textAlign: 'center',
    marginBottom: 18,
    paddingHorizontal: 12,
  },
  socialButton: {
    height: 50,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 10,
  },
  socialButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111111',
  },
  primaryButton: {
    height: 52,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E4E4',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
  },
});