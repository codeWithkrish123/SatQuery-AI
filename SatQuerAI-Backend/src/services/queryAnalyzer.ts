export interface IStructuredIntent {
  intent: 'satellite_information' | 'scene_analysis' | 'change_detection' | 'grounding';
  topic: string;
  location: string | null;
  satellite: string | null;
  requires_image_analysis: boolean;
  requires_external_data: boolean;
}

export class QueryAnalyzer {
  public static analyze(userQuery: string, hasImage: boolean = false): IStructuredIntent {
    const q = userQuery.toLowerCase();

    // Satellite extraction
    let satellite: string | null = null;
    if (q.includes('cartosat')) satellite = 'Cartosat-3';
    else if (q.includes('liss-iv') || q.includes('liss4') || q.includes('eos-04')) satellite = 'LISS-IV / EOS-04';
    else if (q.includes('risat')) satellite = 'RISAT-1A';
    else if (q.includes('oceansat')) satellite = 'Oceansat-3';
    else if (q.includes('sentinel-1') || q.includes('sentinel 1')) satellite = 'Sentinel-1 SAR';
    else if (q.includes('sentinel-2') || q.includes('sentinel 2')) satellite = 'Sentinel-2 Optical';
    else if (q.includes('landsat')) satellite = 'Landsat-9';
    else if (q.includes('xyz-999') || q.includes('xyz999')) satellite = 'XYZ-999';

    // Location extraction
    let location: string | null = null;
    if (q.includes('punjab')) location = 'Punjab';
    else if (q.includes('nubra') || q.includes('ladakh')) location = 'Nubra Valley, Ladakh';
    else if (q.includes('brahmaputra') || q.includes('assam')) location = 'Brahmaputra Floodplain, Assam';
    else if (q.includes('kutch') || q.includes('gujarat')) location = 'Kutch Corridor, Gujarat';
    else if (q.includes('thar') || q.includes('rajasthan')) location = 'Thar Desert, Rajasthan';

    // Intent determination
    let intent: 'satellite_information' | 'scene_analysis' | 'change_detection' | 'grounding' = 'satellite_information';
    if (q.includes('change') || q.includes('delta') || q.includes('before') || q.includes('shift') || q.includes('growth')) {
      intent = 'change_detection';
    } else if (q.includes('locate') || q.includes('find') || q.includes('bounding box') || q.includes('grounding') || q.includes('bbox')) {
      intent = 'grounding';
    } else if (hasImage || q.includes('image') || q.includes('scene') || q.includes('flood') || q.includes('water') || q.includes('reservoir') || q.includes('boundary') || q.includes('identify') || q.includes('detect') || q.includes('describe') || q.includes('risk') || q.includes('terrain')) {
      intent = 'scene_analysis';
    }

    return {
      intent,
      topic: userQuery.trim(),
      location,
      satellite,
      requires_image_analysis: hasImage || intent === 'change_detection' || intent === 'grounding' || intent === 'scene_analysis',
      requires_external_data: intent === 'satellite_information' || intent === 'scene_analysis'
    };
  }
}
