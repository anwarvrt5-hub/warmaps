/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import NetworkParticles from './components/NetworkParticles';
import { User } from './types';

export default function App() {
  const [screen, setScreen] = useState<'splash' | 'login' | 'dashboard'>('splash');
  const [user, setUser] = useState<User | null>(null);

  // Styling and Themes
  const [activeThemeId, setActiveThemeId] = useState('frost');
  const [accentColor, setAccentColor] = useState('#00b4ff');
  const [isLightMode, setIsLightMode] = useState(false);

  // Hydrate theme settings from localStorage on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem('warmaps_theme_id');
    const savedAccent = localStorage.getItem('warmaps_accent_color');
    const savedLight = localStorage.getItem('warmaps_light_mode');
    
    if (savedTheme) setActiveThemeId(savedTheme);
    if (savedAccent) setAccentColor(savedAccent);
    if (savedLight === 'true') setIsLightMode(true);

    // Auto-login if session already exists
    const savedSession = localStorage.getItem('warmaps_active_session');
    if (savedSession) {
      setUser(JSON.parse(savedSession));
      setScreen('dashboard');
    }
  }, []);

  const handleSaveTheme = (themeId: string) => {
    setActiveThemeId(themeId);
    localStorage.setItem('warmaps_theme_id', themeId);
  };

  const handleSaveAccent = (color: string) => {
    setAccentColor(color);
    localStorage.setItem('warmaps_accent_color', color);
  };

  const handleSaveLightMode = (val: boolean) => {
    setIsLightMode(val);
    localStorage.setItem('warmaps_light_mode', String(val));
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('warmaps_active_session', JSON.stringify(loggedInUser));
    setScreen('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('warmaps_active_session');
    setScreen('login');
  };

  return (
    <div className={`relative min-h-screen w-full overflow-x-hidden ${isLightMode ? 'bg-slate-50 text-slate-800' : 'bg-[#05060a] bg-[radial-gradient(#1e2433_1px,transparent_1px)] bg-[size:40px_40px] text-[#e8edf5]'}`}>
      
      {/* Background Interactive Particles Constellation */}
      {screen !== 'splash' && (
        <NetworkParticles accentColor={accentColor} isLightMode={isLightMode} />
      )}

      {/* Screen Router */}
      {screen === 'splash' && (
        <SplashScreen
          accentColor={accentColor}
          onComplete={() => {
            // Check if user is already logged in, redirect straight to dashboard
            const savedSession = localStorage.getItem('warmaps_active_session');
            if (savedSession) {
              setScreen('dashboard');
            } else {
              setScreen('login');
            }
          }}
        />
      )}

      {screen === 'login' && (
        <LoginScreen
          accentColor={accentColor}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {screen === 'dashboard' && user && (
        <Dashboard
          user={user}
          onLogout={handleLogout}
          accentColor={accentColor}
          setAccentColor={handleSaveAccent}
          activeThemeId={activeThemeId}
          setActiveThemeId={handleSaveTheme}
          isLightMode={isLightMode}
          setIsLightMode={handleSaveLightMode}
        />
      )}
    </div>
  );
}
