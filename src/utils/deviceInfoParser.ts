export interface DeviceInfo {
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
}

export interface RiskIndicators {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskColor: string;
  riskBadgeClass: string;
  riskFactors: string[];
  timeToClick?: number;
  susiciousPattern: boolean;
}

export function parseUserAgent(userAgent: string): DeviceInfo {
  if (!userAgent) {
    return {
      deviceType: 'unknown',
      browser: 'Unknown',
      browserVersion: '',
      os: 'Unknown',
      osVersion: ''
    };
  }

  // Detect device type
  const deviceType = getDeviceType(userAgent);
  
  // Detect browser
  const browser = getBrowserInfo(userAgent);
  
  // Detect OS
  const os = getOSInfo(userAgent);

  return {
    deviceType,
    ...browser,
    ...os
  };
}

function getDeviceType(userAgent: string): DeviceInfo['deviceType'] {
  if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    return 'mobile';
  }
  if (/Tablet|iPad/i.test(userAgent)) {
    return 'tablet';
  }
  if (/Windows|Mac|Linux/i.test(userAgent)) {
    return 'desktop';
  }
  return 'unknown';
}

function getBrowserInfo(userAgent: string): { browser: string; browserVersion: string } {
  let browser = 'Unknown';
  let browserVersion = '';

  if (userAgent.includes('Chrome/') && !userAgent.includes('Edg')) {
    browser = 'Chrome';
    browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || '';
  } else if (userAgent.includes('Firefox/')) {
    browser = 'Firefox';
    browserVersion = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || '';
  } else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) {
    browser = 'Safari';
    browserVersion = userAgent.match(/Version\/([0-9.]+)/)?.[1] || '';
  } else if (userAgent.includes('Edg/')) {
    browser = 'Edge';
    browserVersion = userAgent.match(/Edg\/([0-9.]+)/)?.[1] || '';
  } else if (userAgent.includes('Opera/') || userAgent.includes('OPR/')) {
    browser = 'Opera';
    browserVersion = userAgent.match(/(Opera|OPR)\/([0-9.]+)/)?.[2] || '';
  }

  return { browser, browserVersion };
}

function getOSInfo(userAgent: string): { os: string; osVersion: string } {
  let os = 'Unknown';
  let osVersion = '';

  if (userAgent.includes('Windows')) {
    os = 'Windows';
    if (userAgent.includes('Windows NT 10.0')) osVersion = '10/11';
    else if (userAgent.includes('Windows NT 6.3')) osVersion = '8.1';
    else if (userAgent.includes('Windows NT 6.2')) osVersion = '8';
    else if (userAgent.includes('Windows NT 6.1')) osVersion = '7';
  } else if (userAgent.includes('Mac OS X')) {
    os = 'macOS';
    osVersion = userAgent.match(/Mac OS X ([0-9_]+)/)?.[1]?.replace(/_/g, '.') || '';
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
  } else if (userAgent.includes('Android')) {
    os = 'Android';
    osVersion = userAgent.match(/Android ([0-9.]+)/)?.[1] || '';
  } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    os = 'iOS';
    osVersion = userAgent.match(/OS ([0-9_]+)/)?.[1]?.replace(/_/g, '.') || '';
  }

  return { os, osVersion };
}

export function calculateTimeToClick(sentAt?: string, openedAt?: string, clickedAt?: string): number | null {
  if (!sentAt || !clickedAt) return null;
  
  const sentTime = new Date(sentAt).getTime();
  const clickTime = new Date(clickedAt).getTime();
  
  return Math.round((clickTime - sentTime) / 1000); // Return seconds
}

export function assessRisk(
  timeToClick?: number, 
  hasSubmittedData?: boolean, 
  hasReported?: boolean,
  deviceInfo?: DeviceInfo
): RiskIndicators {
  const riskFactors: string[] = [];
  let riskLevel: RiskIndicators['riskLevel'] = 'low';
  
  // User reported the phishing attempt (very good!)
  if (hasReported) {
    return {
      riskLevel: 'low',
      riskColor: 'text-green-600',
      riskBadgeClass: 'bg-green-100 text-green-800 border-green-200',
      riskFactors: ['Reported phishing attempt'],
      timeToClick,
      susiciousPattern: false
    };
  }
  
  // Submitted data (very bad!)
  if (hasSubmittedData) {
    riskFactors.push('Submitted credentials');
    riskLevel = 'critical';
  }
  
  // Time-based risk assessment
  if (timeToClick) {
    if (timeToClick < 5) {
      riskFactors.push('Extremely fast click (< 5s)');
      riskLevel = riskLevel === 'critical' ? 'critical' : 'high';
    } else if (timeToClick < 30) {
      riskFactors.push('Very fast click (< 30s)');
      riskLevel = riskLevel === 'critical' ? 'critical' : 'high';
    } else if (timeToClick < 300) {
      riskFactors.push('Quick click (< 5m)');
      riskLevel = riskLevel === 'critical' ? 'critical' : 'medium';
    }
  }
  
  // Device-based risk factors
  if (deviceInfo?.deviceType === 'mobile') {
    riskFactors.push('Mobile device (higher risk)');
  }
  
  const susiciousPattern = timeToClick ? timeToClick < 10 : false;
  
  // Determine final risk level and styling
  let riskColor = '';
  let riskBadgeClass = '';
  
  switch (riskLevel) {
    case 'critical':
      riskColor = 'text-red-600';
      riskBadgeClass = 'bg-red-100 text-red-800 border-red-200';
      break;
    case 'high':
      riskColor = 'text-orange-600';
      riskBadgeClass = 'bg-orange-100 text-orange-800 border-orange-200';
      break;
    case 'medium':
      riskColor = 'text-yellow-600';
      riskBadgeClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
      break;
    case 'low':
      riskColor = 'text-green-600';
      riskBadgeClass = 'bg-green-100 text-green-800 border-green-200';
      break;
  }
  
  return {
    riskLevel,
    riskColor,
    riskBadgeClass,
    riskFactors,
    timeToClick,
    susiciousPattern
  };
}