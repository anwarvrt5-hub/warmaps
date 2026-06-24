/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  username: string;
  role: 'admin' | 'user';
  level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  points: number;
  achievements: string[];
  searchCount: number;
}

export type ThreatLevel = 'low' | 'medium' | 'high';

export interface TrackerResult {
  id: string;
  phone: string;
  ip: string;
  country: string;
  province: string;
  city: string;
  zip: string;
  isp: string;
  lat: number;
  lon: number;
  timezone: string;
  connectionType: string;
  threatLevel: ThreatLevel;
  riskScore: number; // 0 - 100
  darkWebStatus: string;
  deviceBrand: string;
  proxyDetected: boolean;
  fingerprint: string;
  timestamp: string;
}

export interface CountryData {
  code: string; // e.g. "62"
  country: string; // e.g. "Indonesia"
  provinces: string[];
  cities: Record<string, string[]>; // province -> cities
  zipFormat: string;
  latRange: [number, number];
  lonRange: [number, number];
  ispList: string[];
  ipPrefixes: string[];
}

export interface SearchRecord {
  id: string;
  timestamp: string;
  type: 'phone' | 'ip' | 'bulk' | 'reverse';
  input: string;
  result: TrackerResult;
  isBookmarked: boolean;
}

export interface AlertRule {
  id: string;
  phone: string;
  label: string;
  active: boolean;
  timestamp: string;
}

export interface GlobalLog {
  id: string;
  username: string;
  type: string;
  input: string;
  country: string;
  city: string;
  timestamp: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string;
}

export interface ThemeColors {
  id: string;
  name: string;
  bg: string;
  panel: string;
  border: string;
  accent: string;
  glow: string;
  text: string;
  textMuted: string;
}
