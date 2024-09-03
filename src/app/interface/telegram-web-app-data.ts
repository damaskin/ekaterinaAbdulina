export interface ITelegramWebAppData {
  initData: string;
  initDataUnsafe: InitDataUnsafe;
  version: string;
  platform: string;
  colorScheme: string;
  themeParams: ThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  isClosingConfirmationEnabled: boolean;
  isVerticalSwipesEnabled: boolean;
  headerColor: string;
  backgroundColor: string;
  BackButton: BackButton;
  MainButton: MainButton;
  SettingsButton: SettingsButton;
  HapticFeedback: HapticFeedback;
  CloudStorage: CloudStorage;
  BiometricManager: BiometricManager;
}

export interface InitDataUnsafe {
  query_id: string;
  user: User;
  auth_date: string;
  hash: string;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  language_code: string;
  is_premium: boolean;
  allows_write_to_pm: boolean;
}

export interface ThemeParams {
  accent_text_color: string;
  bg_color: string;
  button_color: string;
  button_text_color: string;
  destructive_text_color: string;
  header_bg_color: string;
  hint_color: string;
  link_color: string;
  secondary_bg_color: string;
  section_bg_color: string;
  section_header_text_color: string;
  section_separator_color: string;
  subtitle_text_color: string;
  text_color: string;
}

export interface BackButton {
  isVisible: boolean;
}

export interface MainButton {
  text: string;
  color: string;
  textColor: string;
  isVisible: boolean;
  isProgressVisible: boolean;
  isActive: boolean;
}

export interface SettingsButton {
  isVisible: boolean;
}

export interface HapticFeedback {
  // Add properties as needed
}

export interface CloudStorage {
  // Add properties as needed
}

export interface BiometricManager {
  isInited: boolean;
  isBiometricAvailable: boolean;
  biometricType: string;
  isAccessRequested: boolean;
  isAccessGranted: boolean;
  isBiometricTokenSaved: boolean;
  deviceId: string;
}
