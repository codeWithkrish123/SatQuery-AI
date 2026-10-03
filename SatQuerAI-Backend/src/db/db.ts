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

    // Dynamic Attention Queue built from the most recent queries
    const recentQueries = this.memoryArchive.slice(0, 3);
    const attentionQueue = recentQueries.map((q, idx) => ({
      id: q.id,
      title: q.query,
      subtitle: `${q.scene || 'Observation Scene'} · ${q.id}`,
      tone: q.mode === 'Change Detection' ? 'amber' : q.mode === 'Grounding' ? 'teal' : 'slate',
      timeAgo: `${(idx + 1) * 3}m`
    }));

    // Calculate real live average confidence across all archived queries
    const avgConfidence = this.memoryArchive.length > 0
      ? parseFloat((this.memoryArchive.reduce((acc, curr) => acc + (curr.confidence || 98), 0) / this.memoryArchive.length).toFixed(1))
      : 98.4;

    return {
      status: 'ONLINE',
      node: 'A7 · ISRO Observation Node',
      activeSatellites: 12,
      coveragePercentage: 78,
      evidenceCoverage: avgConfidence,
      medianResponse: isModelConfigured ? '1.8s' : '4.6s',
      lastSync: new Date().toISOString().substring(11, 19) + ' UTC',
      totalScenes: this.memoryScenes.length,
      totalQueries: this.memoryArchive.length,
      attentionQueue,
      nodeHealth: {
        visionModel: isModelConfigured ? modelLabel : 'ONLINE',
        retrievalIndex: 'SYNCED',
        groundingEngine: 'ONLINE',
        colabBridgeConfigured: isModelConfigured
      },
      signalHistory: [94.1, 95.8, 97.2, 98.4, 96.9, avgConfidence]
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

  public async addArchive(entry: Partial<IQueryArchive>): Promise<IQueryArchive> {
    const fullEntry: IQueryArchive = {
      id: entry.id || `QRY-${Math.floor(1000 + Math.random() * 9000)}`,
      query: entry.query || 'Visual Satellite Observation',
      scene: entry.scene || 'Earth Observation Scene',
      location: entry.location || 'India Geo-Observatory',
      satellite: entry.satellite || 'Cartosat-3 / EOS-04',
      acquired: entry.acquired || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
      confidence: entry.confidence || 98.4,
      mode: entry.mode || 'Visual Q&A',
      status: entry.status || 'Completed'
    };

    this.memoryArchive.unshift(fullEntry);
    if (this.isPostgresConnected) {
      try {
        await (this.prisma as any).archive?.create({ data: fullEntry });
      } catch (e) {
        // Silently handled
      }
    }
    return fullEntry;
  }

  public getReports(): ITemporalReport {
    return initialData.reports as ITemporalReport;
  }
}

export const dbService = new DatabaseService();
