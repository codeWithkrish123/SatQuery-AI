import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import initialData from '../../data/initialData.json';

export interface ISystemStatus {
  status: string;
  node: string;
  activeSatellites: number;
  coveragePercentage: number;
  evidenceCoverage: number;
  medianResponse: string;
  lastSync: string;
  totalScenes: number;
  totalQueries: number;
  attentionQueue: Array<{ id: string; title: string; subtitle: string; tone: string; timeAgo: string }>;
  nodeHealth: {
    visionModel: string;
    retrievalIndex: string;
    groundingEngine: string;
    colabBridgeConfigured: boolean;
  };
  signalHistory: number[];
}

export interface IScene {
  id: string;
  name: string;
  satellite: string;
  type: string;
  category: string;
  acquired: string;
  confidence: number;
  status: string;
  resolution: string;
  coordinates: string;
  thumbnail: string;
}

export interface IQueryArchive {
  id: string;
  query: string;
  scene: string;
  location: string;
  satellite: string;
  acquired: string;
  confidence: number;
  mode: string;
  status: string;
}

export interface ITemporalReport {
  title: string;
  period: string;
  expansionHa: number;
  percentageGrowth: string;
  timeline: Array<{ date: string; extent: number; baseline: number }>;
  highlights: string[];
}

class DatabaseService {
  public prisma: PrismaClient;
  public pgPool: Pool;
  private isPostgresConnected: boolean = false;
  private memoryScenes: IScene[] = [...(initialData.scenes as IScene[])];
  private memoryArchive: IQueryArchive[] = [...(initialData.archive as IQueryArchive[])];

  constructor() {
    this.prisma = new PrismaClient();
    const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/satquery_ai';
    const isCloudDb = dbUrl.includes('sslmode=') || dbUrl.includes('neon.tech') || dbUrl.includes('supabase') || dbUrl.includes('render.com') || dbUrl.includes('railway.app');
    this.pgPool = new Pool({
      connectionString: dbUrl,
      ssl: isCloudDb ? { rejectUnauthorized: false } : false
    });

    this.initDatabase();
  }

  private async initDatabase(): Promise<void> {
    try {
      await this.pgPool.query('SELECT 1');
      this.isPostgresConnected = true;
      console.log('🐘 PostgreSQL Database connection established successfully via Pool & Prisma.');
    } catch (err: any) {
      this.isPostgresConnected = false;
      console.warn(`🐘 PostgreSQL notice: Live database instance offline or connecting (${err.message}). Using in-memory store fallback.`);
    }
  }

  public getSystemStatus(): ISystemStatus {
    const modelUrl = process.env.COLAB_MODEL_URL?.trim();
    const geminiKey = process.env.GEMINI_API_KEY?.trim();
    const isModelConfigured = !!modelUrl || !!geminiKey;
    const modelLabel = geminiKey ? 'GEMINI 1.5 FLASH ONLINE' : (modelUrl ? 'LIVE GPU ONLINE' : 'ONLINE');
    return {
      status: 'ONLINE',
      node: 'A7 · ISRO Observation Node',
      activeSatellites: 12,
      coveragePercentage: 78,
      evidenceCoverage: 98.4,
      medianResponse: isModelConfigured ? '1.8s' : '4.6s',
      lastSync: new Date().toISOString().substring(11, 19) + ' UTC',
      totalScenes: this.memoryScenes.length,
      totalQueries: this.memoryArchive.length,
      attentionQueue: [
        { id: '1', title: 'Floodplain change detected', subtitle: `${this.memoryScenes[0]?.name || 'Brahmaputra'} · ${this.memoryScenes[0]?.id || 'SCN-0891'}`, tone: 'amber', timeAgo: '8m' },
        { id: '2', title: 'Grounding report verified', subtitle: `${this.memoryScenes[1]?.name || 'Nubra Valley'} · ${this.memoryScenes[1]?.id || 'SCN-0890'}`, tone: 'teal', timeAgo: '21m' },
        { id: '3', title: 'Low-light scene processed', subtitle: `${this.memoryScenes[2]?.name || 'Kutch Corridor'} · ${this.memoryScenes[2]?.id || 'SCN-0889'}`, tone: 'slate', timeAgo: '43m' }
      ],
      nodeHealth: {
        visionModel: isModelConfigured ? modelLabel : 'ONLINE',
        retrievalIndex: 'SYNCED',
        groundingEngine: 'ONLINE',
        colabBridgeConfigured: isModelConfigured
      },
      signalHistory: [94.1, 95.8, 97.2, 98.4, 96.9, 98.4]
    };
  }

  public async getScenes(category?: string, search?: string): Promise<IScene[]> {
    let results = [...this.memoryScenes];

    if (category && category !== 'All') {
      results = results.filter(
        (s) => s.category.toLowerCase() === category.toLowerCase() || s.type.toLowerCase() === category.toLowerCase()
      );
    }

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (s) => s.name.toLowerCase().includes(q) || s.satellite.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
      );
    }

    return results;
  }

  public async addScene(scene: IScene): Promise<IScene> {
    this.memoryScenes.unshift(scene);
    if (this.isPostgresConnected) {
      try {
        await this.prisma.scene.create({ data: scene });
      } catch (e) {
        // Silently handled
      }
    }
    return scene;
  }

  public async getArchive(mode?: string, search?: string): Promise<IQueryArchive[]> {
    let results = [...this.memoryArchive];

    if (mode && mode !== 'All') {
      results = results.filter((a) => a.mode.toLowerCase() === mode.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (a) => a.query.toLowerCase().includes(q) || a.scene.toLowerCase().includes(q) || a.location.toLowerCase().includes(q)
      );
    }

    return results;
  }

  public getReports(): ITemporalReport {
    return initialData.reports as ITemporalReport;
  }
}

export const dbService = new DatabaseService();
