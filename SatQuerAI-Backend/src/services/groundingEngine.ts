import { QueryAnalyzer, IStructuredIntent } from './queryAnalyzer';
import { TrustedKnowledgeLayer, ISatelliteMetadata } from './trustedKnowledge';
import { RAGEngine, IEvidenceChunk } from './ragEngine';
import { colabBridge } from './colabBridge';

export interface ISourceCitation {
  source_id: string;
  title: string;
  url: string;
  source_type: string;
}

export interface IGroundedResponse {
  answer: string;
  sources: ISourceCitation[];
  evidence: Array<{ source_id: string; title: string; content: string; score: number }>;
  grounded: boolean;
  insufficient_evidence: boolean;
  ml_analysis: {
    model: string;
    prediction: string;
    confidence: number;
    model_version: string;
  } | null;
  structured_intent?: IStructuredIntent;
}

export class GroundingEngine {
  private static EVIDENCE_THRESHOLD = 0.70;

  public async processQuery(userQuery: string, imagePath: string | null = null): Promise<IGroundedResponse> {
    // 1. Query Understanding
    const intent = QueryAnalyzer.analyze(userQuery, !!imagePath);

    // 2. Reject Fake Satellites (e.g. XYZ-999)
    if (TrustedKnowledgeLayer.isFakeSatellite(userQuery)) {
      return {
        answer: `I could not verify the satellite specification for "${intent.satellite || userQuery}" from authoritative ISRO, NASA, or ESA catalog databases. The requested satellite does not exist in verified mission registries.`,
        sources: [],
        evidence: [],
        grounded: false,
        insufficient_evidence: true,
        ml_analysis: null,
        structured_intent: intent
      };
    }

    // 3. Authoritative Satellite Catalog Lookup
    const satelliteMeta = TrustedKnowledgeLayer.lookupSatellite(intent.satellite || userQuery);

    // 4. Vector RAG Evidence Retrieval
    const evidenceChunks = RAGEngine.retrieveEvidence(userQuery);
    const topEvidence = evidenceChunks.filter((c) => c.score >= GroundingEngine.EVIDENCE_THRESHOLD);

    // 5. ML Model Inference execution when required
    let mlResult: any = null;
    try {
      if (intent.requires_image_analysis || imagePath) {
      const activeModelName = process.env.GEMINI_API_KEY ? 'Google Gemini 1.5 Flash Vision' : 'SatQuery Earth Observation Vision Core';
      const activeModelVersion = process.env.GEMINI_API_KEY ? 'gemini-1.5-flash' : 'satquery-vl-1.0';

      if (intent.intent === 'change_detection') {
        const changeRes = await colabBridge.queryChangeDetection(userQuery, imagePath, imagePath);
        mlResult = {
          model: activeModelName,
          prediction: changeRes.answer,
          confidence: changeRes.confidence / 100,
          model_version: activeModelVersion
        };
      } else if (intent.intent === 'grounding') {
        const groundRes = await colabBridge.queryGrounding(userQuery, imagePath);
        mlResult = {
          model: activeModelName,
          prediction: groundRes.answer,
          confidence: groundRes.confidence / 100,
          model_version: activeModelVersion
        };
      } else {
        const vqaRes = await colabBridge.queryVQA(userQuery, imagePath);
        mlResult = {
          model: activeModelName,
          prediction: vqaRes.answer,
          confidence: vqaRes.confidence / 100,
          model_version: activeModelVersion
        };
      }
      }
    } catch (err: any) {
      console.warn(`[GroundingEngine] GPU Model Notice: ${err.message}. Defaulting to verified catalog & RAG evidence fallback.`);
    }

    // 6. Honest Error State when analysis is unavailable (No Fake/Canned Fallback)
    if (!satelliteMeta && topEvidence.length === 0 && !mlResult) {
      return {
        answer: null as any,
        error: true,
        errorMessage: "Analysis unavailable — the vision model service did not return a result. Check that the model GPU endpoint is active and try again.",
        sources: [],
        evidence: [],
        grounded: false,
        insufficient_evidence: true,
        ml_analysis: null,
        structured_intent: intent
      } as any;
    }

    // 7. Grounded Answer Synthesis
    let answerText = '';
    const sources: ISourceCitation[] = [];
    const evidencePayload: Array<{ source_id: string; title: string; content: string; score: number }> = [];

    if (satelliteMeta) {
      answerText += `Verified Specifications for ${satelliteMeta.satellite_name}:\n` +
        `• Operator: ${satelliteMeta.operator}\n` +
        `• Spatial Resolution: ${satelliteMeta.spatial_resolution}\n` +
        `• Temporal Revisit: ${satelliteMeta.temporal_resolution}\n` +
        `• Spectral Bands: ${satelliteMeta.spectral_bands.join(', ')}\n` +
        `• Orbit: ${satelliteMeta.orbit} (Launched: ${satelliteMeta.launch_date})\n`;

      sources.push({
        source_id: `CATALOG-${satelliteMeta.satellite_name}`,
        title: satelliteMeta.source_name,
        url: satelliteMeta.source_url,
        source_type: 'verified_catalog'
      });
    }

    for (const chunk of topEvidence) {
      if (!sources.some((s) => s.source_id === chunk.source_id)) {
        sources.push({
          source_id: chunk.source_id,
          title: chunk.title,
          url: chunk.url,
          source_type: chunk.source_type
        });
      }

      evidencePayload.push({
        source_id: chunk.source_id,
        title: chunk.title,
        content: chunk.content,
        score: chunk.score
      });

      if (!satelliteMeta) {
        answerText += `${chunk.content}\n`;
      }
    }

    if (mlResult) {
      sources.push({
        source_id: 'ML-GEMINI-VISION',
        title: 'Google Gemini 1.5 Flash Vision (Satellite Scene Inference)',
        url: 'https://ai.google.dev',
        source_type: 'visual_inference'
      });

      if (!satelliteMeta && topEvidence.length === 0) {
        answerText = mlResult.prediction;
      } else {
        answerText += `\nVisual Scene Analysis: ${mlResult.prediction}`;
      }
    }

    return {
      answer: answerText.trim(),
      sources,
      evidence: evidencePayload,
      grounded: true,
      insufficient_evidence: false,
      ml_analysis: mlResult,
      structured_intent: intent
    };
  }
}

export const groundingEngine = new GroundingEngine();
