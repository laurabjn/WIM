import { StyleSheet } from 'react-native';

export const signupStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F4F5',
  },

  scrollContent: {
    flexGrow: 1,
  },

  container: {
    flex: 1,
    backgroundColor: '#F4F4F5',
  },

  content: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 80,
  },

  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  backButtonText: {
    fontSize: 16,
    color: '#111111',
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
  },

  form: {
    marginTop: 12,
  },

  housingContent: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 95,
  },

  input: {
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    marginBottom: 10,
    fontSize: 13,
    color: '#111111',
    backgroundColor: '#FFFFFF',
  },

  uploadField: {
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    justifyContent: 'center',
    marginBottom: 12,
  },

  uploadLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  uploadIcon: {
    fontSize: 14,
    marginRight: 10,
    color: '#111111',
  },

  uploadText: {
    fontSize: 13,
    color: '#111111',
    fontWeight: '500',
  },

  previewWrap: {
    marginTop: 10,
    gap: 8,
  },

  previewContainer: {
    marginBottom: 12,
    alignItems: 'flex-start',
  },

  previewImage: {
    width: 90,
    height: 90,
    borderRadius: 14,
    marginBottom: 6,
  },

  previewRemove: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },

  removePhotoText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
  },

  errorText: {
    marginTop: 10,
    fontSize: 12,
    color: '#DC2626',
    textAlign: 'center',
  },

  footer: {
    width: '100%',
    marginTop: 20,
  },

  buttonWrapper: {
    width: '100%',
    gap: 12,
    paddingBottom: 10,
  },

  primaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },

  secondaryButton: {
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryText: {
    fontSize: 14,
    color: '#111827',
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },

  title: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111111',
    textAlign: 'center',
    marginBottom: 90,
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

  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  welcomeTitle: {
    fontSize: 20,
    fontWeight: '600',
  },

  actions: {
    gap: 12,
  },
});