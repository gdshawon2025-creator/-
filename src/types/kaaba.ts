export type CameraMode = 'orbit' | 'walk' | 'tawaf' | 'drone';

export type TimeOfDay = 'tahajjud' | 'fajr' | 'dhuhr' | 'maghrib';

export interface Landmark {
  id: string;
  nameBn: string;
  nameEn: string;
  nameAr: string;
  position: [number, number, number]; // 3D coordinates
  targetLookAt: [number, number, number];
  cameraDistance: number;
  cameraHeight: number;
  descriptionBn: string;
  descriptionEn: string;
  virtueBn: string;
  virtueEn: string;
  duaBn?: string;
  duaAr?: string;
  duaMeaningBn?: string;
  category: 'kaaba' | 'sacred_stone' | 'prayer_spot' | 'architecture';
}

export interface TawafDua {
  round: number;
  titleBn: string;
  titleEn: string;
  arabic: string;
  transliterationBn: string;
  transliterationEn: string;
  meaningBn: string;
  meaningEn: string;
  hadithNoteBn: string;
}

export interface AppSettings {
  language: 'bn' | 'en';
  crowdDensity: number; // 300 to 2000
  crowdSpeed: number; // 0.5 to 2.0
  soundEnabled: boolean;
  talbiyahPlaying: boolean;
  soundVolume: number;
  showLandmarkPins: boolean;
  walkSpeed: number;
}
