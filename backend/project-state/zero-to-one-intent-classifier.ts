export enum ZERO_INTENT {
  DISCUSSION = 'DISCUSSION',
  PLANNING = 'PLANNING',
  CREATION = 'CREATION',
  INVALID_MODIFICATION = 'INVALID_MODIFICATION',
}

export interface IntentClassification {
  intent: ZERO_INTENT;
  confidence: number;
  requiresClarification: boolean;
}

export class ZeroToOneIntentClassifier {
  // Tier-1: Structural Signal Detection (Highest Authority)
  private static detectTier1Signals(prompt: string): ZERO_INTENT | null {
    // INVALID_MODIFICATION signals (highest priority)
    const modificationRegex = /\b(add|change|fix|update|my app|the code|this project)\b/i;
    if (modificationRegex.test(prompt)) {
      return ZERO_INTENT.INVALID_MODIFICATION;
    }

    // CREATION signals
    const creationRegex = /\b(build|create|make|generate)\b/i;
    if (creationRegex.test(prompt) && !prompt.includes('?')) {
      return ZERO_INTENT.CREATION;
    }

    // PLANNING signals
    const planningRegex = /\b(design|architect|structure|plan|before we build|first let's)\b/i;
    if (planningRegex.test(prompt)) {
      return ZERO_INTENT.PLANNING;
    }

    // DISCUSSION signals
    const discussionRegex = /(\?|I'm thinking about|Would it make sense|What's the best way)/i;
    if (discussionRegex.test(prompt)) {
      return ZERO_INTENT.DISCUSSION;
    }

    return null;
  }

  // Tier-2: Contextual Signals (Secondary Authority)
  private static analyzeTier2Signals(prompt: string, currentIntent: ZERO_INTENT | null): number {
    let confidence = 0.5; // Start with medium confidence

    const isVague = prompt.length < 20 || prompt.split(' ').length < 5;
    const hasTechnicalTerms = /\b(api|database|auth|ui|backend|frontend)\b/i.test(prompt);

    if (currentIntent === ZERO_INTENT.CREATION) {
      if (!isVague && hasTechnicalTerms) {
        confidence = 0.95;
      } else if (!isVague) {
        confidence = 0.8;
      } else {
        confidence = 0.6;
      }
    } else if (currentIntent === ZERO_INTENT.PLANNING) {
      if (hasTechnicalTerms) {
        confidence = 0.9;
      }
    } else if (currentIntent === ZERO_INTENT.DISCUSSION) {
      if (isVague) {
        confidence = 0.85;
      }
    }

    return confidence;
  }

  public static classify(prompt: string): IntentClassification {
    const tier1Intent = this.detectTier1Signals(prompt);

    if (tier1Intent === ZERO_INTENT.INVALID_MODIFICATION) {
      return {
        intent: ZERO_INTENT.INVALID_MODIFICATION,
        confidence: 1.0,
        requiresClarification: false,
      };
    }

    let intent = tier1Intent;
    let confidence = this.analyzeTier2Signals(prompt, intent);

    // Conservative Default Resolution
    if (!intent) {
      intent = ZERO_INTENT.DISCUSSION; // Default to the most reversible action
      confidence = 0.7;
    }

    // Confidence Thresholding
    let requiresClarification = false;
    if (confidence < 0.6) {
      requiresClarification = true;
    }

    // Final override for very short prompts that aren't questions
    if (prompt.split(' ').length < 4 && !prompt.includes('?')) {
        intent = ZERO_INTENT.CREATION;
        confidence = 0.8;
        requiresClarification = false;
    }


    return {
      intent,
      confidence,
      requiresClarification,
    };
  }
}