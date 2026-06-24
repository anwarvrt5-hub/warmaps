/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CountryData, TrackerResult, ThreatLevel } from '../types';

// Seedable Random for consistent mock tracking results
function cyrb128(str: string) {
  let h1 = 1779033703, h2 = 3024734911, h3 = 3362625266, h4 = 502494325;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0];
}

function sfc32(a: number, b: number, c: number, d: number) {
  return function () {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    let t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

export function getSeededRandom(seedStr: string) {
  const seed = cyrb128(seedStr);
  return sfc32(seed[0], seed[1], seed[2], seed[3]);
}

export const COUNTRIES: CountryData[] = [
  {
    code: '62',
    country: 'Indonesia',
    provinces: ['DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Bali', 'Sumatera Utara', 'Sulawesi Selatan'],
    cities: {
      'DKI Jakarta': ['Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Barat', 'Jakarta Utara', 'Jakarta Timur'],
      'Jawa Barat': ['Bandung', 'Bekasi', 'Depok', 'Bogor', 'Cirebon'],
      'Jawa Tengah': ['Semarang', 'Surakarta', 'Magelang', 'Tegal'],
      'Jawa Timur': ['Surabaya', 'Malang', 'Sidoarjo', 'Banyuwangi'],
      'Bali': ['Denpasar', 'Badung', 'Ubud', 'Kuta'],
      'Sumatera Utara': ['Medan', 'Binjai', 'Pematangsiantar'],
      'Sulawesi Selatan': ['Makassar', 'Parepare', 'Palopo']
    },
    zipFormat: '401##',
    latRange: [-8.5, -6.0],
    lonRange: [106.5, 112.8],
    ispList: ['PT Telekomunikasi Selular (Telkomsel)', 'PT Indosat Ooredoo Hutchison', 'PT XL Axiata Tbk', 'PT Smartfren Telecom'],
    ipPrefixes: ['103.45', '182.253', '114.124', '36.85']
  },
  {
    code: '1',
    country: 'United States',
    provinces: ['California', 'New York', 'Texas', 'Florida', 'Washington', 'Illinois'],
    cities: {
      'California': ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento'],
      'New York': ['New York City', 'Buffalo', 'Rochester', 'Syracuse'],
      'Texas': ['Houston', 'Austin', 'Dallas', 'San Antonio', 'El Paso'],
      'Florida': ['Miami', 'Orlando', 'Tampa', 'Jacksonville'],
      'Washington': ['Seattle', 'Spokane', 'Tacoma', 'Bellevue'],
      'Illinois': ['Chicago', 'Aurora', 'Naperville', 'Rockford']
    },
    zipFormat: '902##',
    latRange: [25.0, 48.0],
    lonRange: [-124.0, -71.0],
    ispList: ['AT&T Mobility', 'Verizon Wireless', 'T-Mobile USA', 'Comcast Cable'],
    ipPrefixes: ['172.56', '72.210', '98.137', '64.233']
  },
  {
    code: '44',
    country: 'United Kingdom',
    provinces: ['England', 'Scotland', 'Wales', 'Northern Ireland'],
    cities: {
      'England': ['London', 'Manchester', 'Birmingham', 'Leeds', 'Bristol', 'Liverpool'],
      'Scotland': ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee'],
      'Wales': ['Cardiff', 'Swansea', 'Newport'],
      'Northern Ireland': ['Belfast', 'Derry', 'Lisburn']
    },
    zipFormat: 'EC1A ##',
    latRange: [50.5, 57.5],
    lonRange: [-5.5, 1.5],
    ispList: ['EE Limited', 'O2 UK', 'Vodafone UK', 'Three UK', 'BT Broadband'],
    ipPrefixes: ['82.165', '188.95', '92.40', '195.12']
  },
  {
    code: '60',
    country: 'Malaysia',
    provinces: ['Selangor', 'Kuala Lumpur', 'Penang', 'Johor', 'Sabah', 'Sarawak'],
    cities: {
      'Selangor': ['Petaling Jaya', 'Shah Alam', 'Klang', 'Subang Jaya'],
      'Kuala Lumpur': ['Kuala Lumpur City', 'Cheras', 'Kepong', 'Setapak'],
      'Penang': ['George Town', 'Bayal Lepas', 'Butterworth'],
      'Johor': ['Johor Bahru', 'Muar', 'Batu Pahat'],
      'Sabah': ['Kota Kinabalu', 'Sandakan', 'Tawau'],
      'Sarawak': ['Kuching', 'Miri', 'Sibu']
    },
    zipFormat: '503##',
    latRange: [1.5, 6.0],
    lonRange: [100.2, 115.0],
    ispList: ['Maxis Broadband', 'Celcom Axiata', 'Digi Telecommunications', 'U Mobile'],
    ipPrefixes: ['115.135', '60.50', '210.187', '175.139']
  },
  {
    code: '65',
    country: 'Singapore',
    provinces: ['Central Region', 'East Region', 'North Region', 'West Region'],
    cities: {
      'Central Region': ['Downtown Core', 'Bukit Merah', 'Queenstown', 'Rochor'],
      'East Region': ['Tampines', 'Bedok', 'Pasir Ris'],
      'North Region': ['Woodlands', 'Yishun', 'Sembawang'],
      'West Region': ['Jurong West', 'Clementi', 'Bukit Batok']
    },
    zipFormat: '098##',
    latRange: [1.25, 1.45],
    lonRange: [103.65, 104.0],
    ispList: ['Singtel Mobile', 'StarHub Mobile', 'M1 Limited', 'MyRepublic'],
    ipPrefixes: ['116.14', '203.116', '122.11', '101.127']
  },
  {
    code: '81',
    country: 'Japan',
    provinces: ['Tokyo', 'Osaka', 'Kyoto', 'Hokkaido', 'Aichi', 'Fukuoka'],
    cities: {
      'Tokyo': ['Shinjuku', 'Shibuya', 'Chiyoda', 'Minato', 'Koto'],
      'Osaka': ['Umeda', 'Namba', 'Chuo-ku', 'Yodogawa'],
      'Kyoto': ['Nakagyo-ku', 'Shimogyo-ku', 'Uji'],
      'Hokkaido': ['Sapporo', 'Asahikawa', 'Hakodate'],
      'Aichi': ['Nagoya', 'Toyota', 'Okazaki'],
      'Fukuoka': ['Hakata', 'Tenjin', 'Kitakyushu']
    },
    zipFormat: '100-00##',
    latRange: [33.0, 43.5],
    lonRange: [130.0, 142.0],
    ispList: ['NTT Docomo', 'SoftBank Mobile', 'KDDI (au)', 'Rakuten Mobile'],
    ipPrefixes: ['126.241', '133.1', '210.140', '118.238']
  },
  {
    code: '49',
    country: 'Germany',
    provinces: ['Bavaria', 'Berlin', 'Hamburg', 'North Rhine-Westphalia', 'Hesse'],
    cities: {
      'Bavaria': ['Munich', 'Nuremberg', 'Augsburg', 'Regensburg'],
      'Berlin': ['Mitte', 'Kreuzberg', 'Charlottenburg', 'Pankow'],
      'Hamburg': ['Altona', 'Eimsbüttel', 'Hamburg-Nord'],
      'North Rhine-Westphalia': ['Cologne', 'Düsseldorf', 'Dortmund', 'Essen'],
      'Hesse': ['Frankfurt', 'Wiesbaden', 'Kassel', 'Darmstadt']
    },
    zipFormat: '803##',
    latRange: [47.5, 54.5],
    lonRange: [6.0, 14.5],
    ispList: ['Deutsche Telekom', 'Vodafone Germany', 'Telefónica Germany (O2)', '1&1 AG'],
    ipPrefixes: ['80.187', '217.240', '93.200', '46.112']
  },
  {
    code: '33',
    country: 'France',
    provinces: ['Île-de-France', 'Provence-Alpes-Côte d\'Azur', 'Auvergne-Rhône-Alpes', 'Nouvelle-Aquitaine'],
    cities: {
      'Île-de-France': ['Paris', 'Boulogne-Billancourt', 'Saint-Denis', 'Versailles'],
      'Provence-Alpes-Côte d\'Azur': ['Marseille', 'Nice', 'Toulon', 'Cannes'],
      'Auvergne-Rhône-Alpes': ['Lyon', 'Grenoble', 'Saint-Étienne', 'Annecy'],
      'Nouvelle-Aquitaine': ['Bordeaux', 'Limoges', 'Poitiers', 'La Rochelle']
    },
    zipFormat: '750##',
    latRange: [43.0, 50.0],
    lonRange: [-1.5, 7.5],
    ispList: ['Orange France', 'SFR', 'Bouygues Telecom', 'Free Mobile'],
    ipPrefixes: ['90.80', '82.64', '176.128', '88.190']
  },
  {
    code: '61',
    country: 'Australia',
    provinces: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia'],
    cities: {
      'New South Wales': ['Sydney', 'Newcastle', 'Wollongong'],
      'Victoria': ['Melbourne', 'Geelong', 'Ballarat'],
      'Queensland': ['Brisbane', 'Gold Coast', 'Cairns', 'Townsville'],
      'Western Australia': ['Perth', 'Fremantle', 'Bunbury'],
      'South Australia': ['Adelaide', 'Mount Gambier']
    },
    zipFormat: '200#',
    latRange: [-38.0, -12.0],
    lonRange: [115.0, 153.0],
    ispList: ['Telstra Corporation', 'Optus Mobile', 'TPG Telecom (Vodafone)', 'Aussie Broadband'],
    ipPrefixes: ['1.124', '101.160', '120.144', '203.50']
  },
  {
    code: '91',
    country: 'India',
    provinces: ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana', 'West Bengal'],
    cities: {
      'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane'],
      'Delhi': ['New Delhi', 'Dwarka', 'Rohini', 'Connaught Place'],
      'Karnataka': ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru'],
      'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
      'Telangana': ['Hyderabad', 'Secunderabad', 'Warangal'],
      'West Bengal': ['Kolkata', 'Howrah', 'Darjeeling']
    },
    zipFormat: '4000##',
    latRange: [8.5, 33.0],
    lonRange: [69.0, 92.0],
    ispList: ['Reliance Jio Infocomm', 'Bharti Airtel', 'Vodafone Idea (Vi)', 'BSNL Mobile'],
    ipPrefixes: ['49.36', '103.80', '223.176', '106.220']
  },
  {
    code: '55',
    country: 'Brazil',
    provinces: ['São Paulo', 'Rio de Janeiro', 'Minas Gerais', 'Bahia', 'Rio Grande do Sul'],
    cities: {
      'São Paulo': ['São Paulo City', 'Campinas', 'Santos', 'São Bernardo do Campo'],
      'Rio de Janeiro': ['Rio de Janeiro City', 'Niterói', 'Copacabana', 'Petrópolis'],
      'Minas Gerais': ['Belo Horizonte', 'Uberlândia', 'Ouro Preto'],
      'Bahia': ['Salvador', 'Porto Seguro', 'Feira de Santana'],
      'Rio Grande do Sul': ['Porto Alegre', 'Gramado', 'Caxias do Sul']
    },
    zipFormat: '01000-###',
    latRange: [-30.0, -5.0],
    lonRange: [-55.0, -35.0],
    ispList: ['Vivo (Telefônica Brasil)', 'Claro Brasil', 'TIM Brasil', 'Oi Internet'],
    ipPrefixes: ['177.80', '201.50', '189.120', '200.140']
  },
  {
    code: '82',
    country: 'South Korea',
    provinces: ['Seoul', 'Gyeonggi', 'Busan', 'Incheon', 'Daegu', 'Jeju'],
    cities: {
      'Seoul': ['Gangnam-gu', 'Mapo-gu', 'Myeong-dong', 'Jongno-gu', 'Yongsan-gu'],
      'Gyeonggi': ['Suwon', 'Seongnam', 'Goyang', 'Yongin'],
      'Busan': ['Haeundae', 'Seomyeon', 'Suyeong'],
      'Incheon': ['Songdo', 'Bupyeong', 'Namdong'],
      'Daegu': ['Suseong-gu', 'Jung-gu'],
      'Jeju': ['Jeju City', 'Seogwipo']
    },
    zipFormat: '060##',
    latRange: [34.0, 38.0],
    lonRange: [126.0, 129.5],
    ispList: ['SK Telecom', 'KT Corporation', 'LG Uplus', 'SK Broadband'],
    ipPrefixes: ['112.144', '211.234', '1.208', '14.52']
  }
];

// Helper to fill with generic data for any codes we didn't specify above to reach 30+ supported codes easily
const extraCountries: { code: string; country: string; mainCity: string; isp: string; lat: number; lon: number }[] = [
  { code: '7', country: 'Russia', mainCity: 'Moscow', isp: 'MTS PJSC', lat: 55.7558, lon: 37.6173 },
  { code: '31', country: 'Netherlands', mainCity: 'Amsterdam', isp: 'KPN Mobile', lat: 52.3676, lon: 4.9041 },
  { code: '966', country: 'Saudi Arabia', mainCity: 'Riyadh', isp: 'STC Saudi', lat: 24.7136, lon: 46.6753 },
  { code: '66', country: 'Thailand', mainCity: 'Bangkok', isp: 'AIS Thailand', lat: 13.7563, lon: 100.5018 },
  { code: '84', country: 'Vietnam', mainCity: 'Hanoi', isp: 'Viettel Telecom', lat: 21.0285, lon: 105.8542 },
  { code: '63', country: 'Philippines', mainCity: 'Manila', isp: 'Smart Communications', lat: 14.5995, lon: 120.9842 },
  { code: '86', country: 'China', mainCity: 'Beijing', isp: 'China Mobile', lat: 39.9042, lon: 116.4074 },
  { code: '27', country: 'South Africa', mainCity: 'Johannesburg', isp: 'MTN South Africa', lat: -26.2041, lon: 28.0473 },
  { code: '52', country: 'Mexico', mainCity: 'Mexico City', isp: 'Telcel', lat: 19.4326, lon: -99.1332 },
  { code: '39', country: 'Italy', mainCity: 'Rome', isp: 'TIM Mobile', lat: 41.9028, lon: 12.4964 },
  { code: '34', country: 'Spain', mainCity: 'Madrid', isp: 'Movistar', lat: 40.4168, lon: -3.7038 },
  { code: '90', country: 'Turkey', mainCity: 'Istanbul', isp: 'Turkcell', lat: 41.0082, lon: 28.9784 },
  { code: '20', country: 'Egypt', mainCity: 'Cairo', isp: 'Vodafone Egypt', lat: 30.0444, lon: 31.2357 },
  { code: '41', country: 'Switzerland', mainCity: 'Zurich', isp: 'Swisscom', lat: 47.3769, lon: 8.5417 },
  { code: '64', country: 'New Zealand', mainCity: 'Auckland', isp: 'One New Zealand', lat: -36.8485, lon: 174.7633 },
  { code: '971', country: 'United Arab Emirates', mainCity: 'Dubai', isp: 'Etisalat UAE', lat: 25.2048, lon: 55.2708 },
  { code: '852', country: 'Hong Kong', mainCity: 'Hong Kong City', isp: 'HKT (CSL)', lat: 22.3193, lon: 114.1694 },
  { code: '32', country: 'Belgium', mainCity: 'Brussels', isp: 'Proximus Mobile', lat: 50.8503, lon: 4.3517 },
  { code: '46', country: 'Sweden', mainCity: 'Stockholm', isp: 'Telia Company', lat: 59.3293, lon: 18.0686 },
  { code: '43', country: 'Austria', mainCity: 'Vienna', isp: 'A1 Telekom', lat: 48.2082, lon: 16.3738 }
];

// Fill the rest up to 32 countries
extraCountries.forEach(ec => {
  COUNTRIES.push({
    code: ec.code,
    country: ec.country,
    provinces: ['Central District'],
    cities: { 'Central District': [ec.mainCity] },
    zipFormat: '#####',
    latRange: [ec.lat - 0.2, ec.lat + 0.2],
    lonRange: [ec.lon - 0.2, ec.lon + 0.2],
    ispList: [ec.isp],
    ipPrefixes: [`${Math.floor(Math.random() * 150) + 50}.${Math.floor(Math.random() * 200) + 10}`]
  });
});

// Parse phone country code and extract digits
export function parsePhoneCode(phone: string): { cleanPhone: string; matchedCountry: CountryData | null } {
  const clean = phone.replace(/[^0-9]/g, '');
  
  // Try to match longest country code prefix (e.g. "966", "852" vs "1" or "7")
  let bestMatch: CountryData | null = null;
  let maxLen = 0;
  
  for (const c of COUNTRIES) {
    if (clean.startsWith(c.code) && c.code.length > maxLen) {
      bestMatch = c;
      maxLen = c.code.length;
    }
  }
  
  // Also try looking up if they passed + sign or if they are Indonesian default without country code (e.g. starts with 0)
  if (!bestMatch && clean.startsWith('0')) {
    // default to Indonesia if number starts with 0 (default local behavior)
    bestMatch = COUNTRIES.find(c => c.code === '62') || null;
  }
  
  return {
    cleanPhone: clean,
    matchedCountry: bestMatch
  };
}

// Generate deterministically consistent simulated results
export function generateLocationByPhone(phone: string): TrackerResult {
  const parsed = parsePhoneCode(phone);
  const targetPhone = parsed.cleanPhone || '628123456789';
  const country = parsed.matchedCountry || COUNTRIES[0]; // fallback to Indo if unknown
  
  const rand = getSeededRandom(targetPhone);
  
  // Select Province
  const provinceIdx = Math.floor(rand() * country.provinces.length);
  const province = country.provinces[provinceIdx];
  
  // Select City
  const citiesInProvince = country.cities[province] || [province];
  const cityIdx = Math.floor(rand() * citiesInProvince.length);
  const city = citiesInProvince[cityIdx];
  
  // Select ISP
  const ispIdx = Math.floor(rand() * country.ispList.length);
  const isp = country.ispList[ispIdx];
  
  // Coordinates
  const lat = country.latRange[0] + rand() * (country.latRange[1] - country.latRange[0]);
  const lon = country.lonRange[0] + rand() * (country.lonRange[1] - country.lonRange[0]);
  
  // Zip
  const zip = country.zipFormat.replace(/#/g, () => String(Math.floor(rand() * 10)));
  
  // IP Address
  const prefix = country.ipPrefixes[Math.floor(rand() * country.ipPrefixes.length)];
  const ip = `${prefix}.${Math.floor(rand() * 254) + 1}.${Math.floor(rand() * 254) + 1}`;
  
  // Threat Level & Risk Score
  const riskScore = Math.floor(rand() * 100);
  let threatLevel: ThreatLevel = 'low';
  if (riskScore > 75) threatLevel = 'high';
  else if (riskScore > 40) threatLevel = 'medium';
  
  const darkWebHits = ['Not found', 'Leaked in 2024 Canva data breach', 'Leaked in Indonesian Telco Breach (2022)', 'Available in Telegram hacking forum', 'Found in DarkWeb Botnet logs'];
  const darkWebStatus = rand() > 0.7 ? darkWebHits[Math.floor(rand() * (darkWebHits.length - 1)) + 1] : darkWebHits[0];
  
  const devices = ['iPhone 14 Pro Max', 'Samsung Galaxy S23 Ultra', 'Xiaomi 13 Pro', 'Oppo Find X6', 'Google Pixel 8', 'Vivo V27 5G', 'Realme GT Neo 5'];
  const deviceBrand = devices[Math.floor(rand() * devices.length)];
  
  const proxyDetected = rand() > 0.75;
  const connections = ['4G LTE', '5G SA', 'Wi-Fi 6', '3G HSPA+'];
  const connectionType = connections[Math.floor(rand() * connections.length)];
  
  // Fingerprint (SHA-256 style)
  const hex = '0123456789abcdef';
  let fingerprint = '';
  for (let i = 0; i < 32; i++) {
    fingerprint += hex[Math.floor(rand() * 16)];
  }
  
  const timezoneOffset = Math.floor(lon / 15);
  const timezone = `UTC${timezoneOffset >= 0 ? '+' : ''}${timezoneOffset}`;

  return {
    id: `TRK-${Math.floor(rand() * 900000) + 100000}`,
    phone: `+${targetPhone}`,
    ip,
    country: country.country,
    province,
    city,
    zip,
    isp,
    lat,
    lon,
    timezone,
    connectionType,
    threatLevel,
    riskScore,
    darkWebStatus,
    deviceBrand,
    proxyDetected,
    fingerprint,
    timestamp: new Date().toISOString()
  };
}

// Generate deterministically consistent result by IP Address (for reverse lookup)
export function generateLocationByIP(ip: string): TrackerResult {
  const rand = getSeededRandom(ip);
  
  // Find country based on IP or random matching
  const countryIdx = Math.floor(rand() * COUNTRIES.length);
  const country = COUNTRIES[countryIdx];
  
  // Select Province
  const provinceIdx = Math.floor(rand() * country.provinces.length);
  const province = country.provinces[provinceIdx];
  
  // Select City
  const citiesInProvince = country.cities[province] || [province];
  const cityIdx = Math.floor(rand() * citiesInProvince.length);
  const city = citiesInProvince[cityIdx];
  
  // Select ISP
  const ispIdx = Math.floor(rand() * country.ispList.length);
  const isp = country.ispList[ispIdx];
  
  // Coordinates
  const lat = country.latRange[0] + rand() * (country.latRange[1] - country.latRange[0]);
  const lon = country.lonRange[0] + rand() * (country.lonRange[1] - country.lonRange[0]);
  
  // Zip
  const zip = country.zipFormat.replace(/#/g, () => String(Math.floor(rand() * 10)));
  
  // Phone number corresponding to country code
  let generatedPhone = country.code;
  const numDigits = country.code === '62' ? 10 : 8; // e.g. 62812xxxxxx
  if (country.code === '62') {
    generatedPhone += '8' + String(Math.floor(rand() * 8) + 1); // 81, 82, 85, etc.
    for (let i = 0; i < 9; i++) {
      generatedPhone += String(Math.floor(rand() * 10));
    }
  } else {
    for (let i = 0; i < numDigits; i++) {
      generatedPhone += String(Math.floor(rand() * 10));
    }
  }
  
  const riskScore = Math.floor(rand() * 100);
  let threatLevel: ThreatLevel = 'low';
  if (riskScore > 75) threatLevel = 'high';
  else if (riskScore > 40) threatLevel = 'medium';
  
  const darkWebHits = ['Not found', 'IP linked to phishing web servers', 'Found on credential harvesting botnet list', 'IP scanned in open shodan directories'];
  const darkWebStatus = rand() > 0.8 ? darkWebHits[Math.floor(rand() * (darkWebHits.length - 1)) + 1] : darkWebHits[0];
  
  const devices = ['iPhone 13', 'Samsung Galaxy S22', 'Huawei P60', 'Google Pixel 7', 'OnePlus 11'];
  const deviceBrand = devices[Math.floor(rand() * devices.length)];
  
  const proxyDetected = rand() > 0.5; // IPs have higher proxy chance
  const connectionType = rand() > 0.4 ? 'Fiber Broadband' : 'Cable Coaxial';
  
  // Fingerprint
  const hex = '0123456789abcdef';
  let fingerprint = '';
  for (let i = 0; i < 32; i++) {
    fingerprint += hex[Math.floor(rand() * 16)];
  }
  
  const timezoneOffset = Math.floor(lon / 15);
  const timezone = `UTC${timezoneOffset >= 0 ? '+' : ''}${timezoneOffset}`;

  return {
    id: `IP-${Math.floor(rand() * 900000) + 100000}`,
    phone: `+${generatedPhone}`,
    ip,
    country: country.country,
    province,
    city,
    zip,
    isp,
    lat,
    lon,
    timezone,
    connectionType,
    threatLevel,
    riskScore,
    darkWebStatus,
    deviceBrand,
    proxyDetected,
    fingerprint,
    timestamp: new Date().toISOString()
  };
}
