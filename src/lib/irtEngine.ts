/**
 * Item Response Theory (IRT) Engine for AZ Academy
 * Implements the 3-Parameter Logistic Model (3PL) used in National Assessments (SNBT)
 */

export interface IRTQuestionParams {
  difficulty: number; // b: -3.0 to 3.0
  discrimination: number; // a: 0.5 to 2.5
  guessing: number; // c: 0.0 to 0.25 (e.g. 0.2 for 5 choices)
}

export interface StudentResponse {
  questionId: string;
  isCorrect: boolean;
  partialScore?: number; // For PG Kompleks (0.0 to 1.0)
  params: IRTQuestionParams;
}

/**
 * Calculate the probability of a correct response given student ability (theta)
 * using the 3-Parameter Logistic Model.
 */
export function calculateProbability(theta: number, params: IRTQuestionParams): number {
  const { difficulty, discrimination, guessing } = params;
  const D = 1.702; // Scaling constant to match normal ogive
  
  // P(theta) = c + (1 - c) / (1 + exp(-a * D * (theta - b)))
  const exponent = -discrimination * D * (theta - difficulty);
  const probability = guessing + (1 - guessing) / (1 + Math.exp(exponent));
  
  return probability;
}

/**
 * Estimate student ability (theta) using Maximum Likelihood Estimation (MLE).
 * This is a simplified Newton-Raphson approach.
 */
export function estimateAbilityMLE(responses: StudentResponse[]): number {
  let theta = 0.0; // Initial guess for ability (average)
  const maxIterations = 20;
  const tolerance = 0.001;

  for (let iter = 0; iter < maxIterations; iter++) {
    let firstDerivative = 0.0;
    let secondDerivative = 0.0;
    
    // Prevent estimating infinity for all correct or all wrong
    const allCorrect = responses.every(r => r.isCorrect);
    const allWrong = responses.every(r => !r.isCorrect);
    if (allCorrect) return 3.0; // Max ability cap
    if (allWrong) return -3.0; // Min ability cap

    for (const r of responses) {
      const p = calculateProbability(theta, r.params);
      const q = 1 - p;
      const u = r.partialScore !== undefined ? r.partialScore : (r.isCorrect ? 1 : 0);
      
      const { discrimination: a, guessing: c } = r.params;
      const D = 1.702;

      // First and second derivatives of the log-likelihood function for 3PL
      // Simplified approximation for scoring performance
      const dp_dtheta = a * D * q * (p - c) / (1 - c); 
      
      // Prevent division by zero
      if (p * q === 0) continue;
      
      firstDerivative += (u - p) * (dp_dtheta / (p * q));
      secondDerivative -= Math.pow(dp_dtheta, 2) / (p * q);
    }

    if (Math.abs(secondDerivative) < 1e-10) break;

    const delta = firstDerivative / secondDerivative;
    theta -= delta; // Newton-Raphson update

    // Cap theta to reasonable bounds (-4 to 4)
    if (theta > 4) theta = 4;
    if (theta < -4) theta = -4;

    if (Math.abs(delta) < tolerance) {
      break;
    }
  }

  return theta;
}

/**
 * Scale the theta (-4 to 4) to UTBK/SNBT scale (roughly 200 to 1000, mean 500, std 100)
 */
export function scaleThetaToScore(theta: number): number {
  const mean = 500;
  const std = 100;
  let score = mean + (theta * std);
  
  // Cap between 200 and 1000
  if (score < 200) score = 200;
  if (score > 1000) score = 1000;
  
  return parseFloat(score.toFixed(2));
}

/**
 * Full IRT Scoring pipeline for a subtest
 */
export function scoreSubtest(responses: StudentResponse[]): number {
  if (responses.length === 0) return 0;
  const theta = estimateAbilityMLE(responses);
  return scaleThetaToScore(theta);
}
