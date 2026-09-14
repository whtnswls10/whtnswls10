// Vercel Serverless Function: /api/activities
// Supabase REST API Direct Integration

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Detect Supabase Environment Variables injected by Vercel Integration
  const supabaseUrl = process.env.SUPABASE_URL || 
                      process.env.NEXT_PUBLIC_SUPABASE_URL || 
                      process.env.POSTGRES_SUPABASE_URL;

  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                      process.env.SUPABASE_ANON_KEY || 
                      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const isConfigured = Boolean(supabaseUrl && supabaseKey);

  // 1. GET: Fetch activities from Supabase or report status
  if (req.method === 'GET') {
    const { action } = req.query || {};

    if (action === 'status') {
      return res.status(200).json({
        connected: isConfigured,
        hasUrl: Boolean(supabaseUrl),
        hasKey: Boolean(supabaseKey),
        provider: 'Supabase via Vercel Integration',
        message: isConfigured 
          ? 'Supabase is connected to Vercel.' 
          : 'Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) are not detected in Vercel yet.'
      });
    }

    if (!isConfigured) {
      return res.status(200).json({
        source: 'local_fallback',
        connected: false,
        message: 'Supabase environment variables not configured on this instance.',
        activities: []
      });
    }

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/circle_activities?select=*&order=created_at.asc`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(200).json({
          source: 'error_fallback',
          connected: true,
          error: errText,
          message: 'Failed to query circle_activities table. Please ensure the table is created using supabase_schema.sql.',
          activities: []
        });
      }

      const rows = await response.json();
      // Map DB snake_case columns to camelCase if needed
      const activities = rows.map(r => ({
        id: r.id,
        title: r.title,
        category: r.category,
        categoryName: r.category_name || r.category,
        difficulty: r.difficulty,
        equationType: r.equation_type,
        equationFormula: r.equation_formula,
        targetGrade: r.target_grade || '고등학교 공통수학1',
        competency: r.competency || [],
        keywords: r.keywords || [],
        conceptSummary: r.concept_summary,
        parameters: r.parameters || {},
        steps: r.steps || [],
        evaluationCriteria: r.evaluation_criteria,
        realWorldApplication: r.real_world_application,
        createdAt: r.created_at
      }));

      return res.status(200).json({
        source: 'supabase',
        connected: true,
        count: activities.length,
        activities
      });
    } catch (err) {
      return res.status(500).json({
        error: err.message,
        message: 'Internal server error while fetching from Supabase.'
      });
    }
  }

  // 2. POST: Insert or Upsert activity into Supabase
  if (req.method === 'POST') {
    if (!isConfigured) {
      return res.status(200).json({
        success: false,
        source: 'local_only',
        message: 'Supabase credentials are not configured in Vercel environment variables. Saved to browser LocalStorage only.'
      });
    }

    try {
      const payload = req.body;
      if (!payload) {
        return res.status(400).json({ error: 'Request body is empty.' });
      }

      // Support single activity or bulk array
      const items = Array.isArray(payload) ? payload : [payload];

      const dbRows = items.map(act => ({
        id: act.id || `circle-act-${Date.now()}`,
        title: act.title,
        category: act.category,
        category_name: act.categoryName || act.category,
        difficulty: act.difficulty || '발전',
        equation_type: act.equationType,
        equation_formula: act.equationFormula,
        target_grade: act.targetGrade || '고등학교 1학년',
        competency: act.competency || ['문제해결'],
        keywords: act.keywords || ['원의방정식'],
        concept_summary: act.conceptSummary,
        parameters: act.parameters || {},
        steps: act.steps || [],
        evaluation_criteria: act.evaluationCriteria || '',
        real_world_application: act.realWorldApplication || '',
        created_at: act.createdAt || new Date().toISOString()
      }));

      // Upsert to Supabase
      const response = await fetch(`${supabaseUrl}/rest/v1/circle_activities`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates, return=representation'
        },
        body: JSON.stringify(dbRows)
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(400).json({
          success: false,
          error: errorText,
          message: 'Supabase returned an error. Check table structure and RLS policies.'
        });
      }

      const inserted = await response.json();
      return res.status(200).json({
        success: true,
        source: 'supabase',
        message: 'Successfully saved to Supabase database!',
        insertedCount: inserted.length,
        data: inserted
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message,
        message: 'Server error while saving to Supabase.'
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
