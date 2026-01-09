import { ParsedWorkout, WorkoutStep, WorkoutBlock, IntensityType, INTENSITY_PACE_RANGES } from './types';

// Parse distance string like "2km", "800m", "500 m" to meters
function parseDistance(distanceStr: string): number {
  const normalized = distanceStr.trim().toLowerCase();
  const kmMatch = normalized.match(/([\d,]+)\s*km/);
  const mMatch = normalized.match(/([\d,]+)\s*m/);
  
  if (kmMatch) {
    return parseFloat(kmMatch[1].replace(',', '.')) * 1000;
  }
  if (mMatch) {
    return parseFloat(mMatch[1].replace(',', '.'));
  }
  return 0;
}

// Parse time string like "2'", "1'30\"", "30\"" to seconds
function parseTime(timeStr: string): number {
  const normalized = timeStr.trim();
  const minutesMatch = normalized.match(/(\d+)\s*['']/);
  const secondsMatch = normalized.match(/(\d+)\s*[""]/);
  
  let seconds = 0;
  if (minutesMatch) {
    seconds += parseInt(minutesMatch[1]) * 60;
  }
  if (secondsMatch) {
    seconds += parseInt(secondsMatch[1]);
  }
  return seconds;
}

// Extract intensity type from text
function extractIntensity(text: string): IntensityType | null {
  const upper = text.toUpperCase();
  if (upper.includes('TS')) return 'TS';
  if (upper.includes('TL')) return 'TL';
  if (upper.includes('TR')) return 'TR';
  if (upper.includes('CA') || upper.includes('CAMINAR')) return 'Ca';
  if (upper.includes('PA')) return 'PA';
  if (upper.includes('RC')) return 'RC';
  if (upper.includes('PL')) return 'PL';
  return null;
}

// Parse a single step like "800 TR", "200 TS", "Rec.2'", "PL.1'30\""
function parseStep(stepText: string): WorkoutStep | null {
  const trimmed = stepText.trim();
  
  // Check for PL (Pausa en el lugar) - can be standalone like "PL.1'30\""
  if (trimmed.match(/^PL\.?\s*\d/i)) {
    const timeMatch = trimmed.match(/(\d+['"]?\s*\d*[""]?)/);
    if (timeMatch) {
      return {
        type: 'rest',
        duration: parseTime(timeMatch[1]),
      };
    }
  }
  
  // Check for rest/recovery - "Rec.2'", "Rec.1'30\"", "Rec. 3'"
  if (trimmed.match(/^rec\.?\s*\d/i) || trimmed.match(/^rest/i)) {
    const timeMatch = trimmed.match(/rec\.?\s*(\d+['"]?\s*\d*[""]?)/i);
    if (timeMatch) {
      return {
        type: 'rest',
        duration: parseTime(timeMatch[1]),
      };
    }
    return null;
  }
  
  // Check for distance-based run - "800 TR", "200 TS", "500TL"
  const distanceMatch = trimmed.match(/([\d,]+(?:\.[\d]+)?)\s*(km|m)/i);
  if (distanceMatch) {
    const distance = parseDistance(distanceMatch[0]);
    const intensity = extractIntensity(trimmed);
    
    return {
      type: 'run',
      distance,
      intensity: intensity ? {
        type: intensity,
        paceRange: INTENSITY_PACE_RANGES[intensity],
      } : undefined,
    };
  }
  
  // Check for time-based step
  const timeMatch = trimmed.match(/(\d+['"]?\s*\d*[""]?)/);
  if (timeMatch) {
    const duration = parseTime(timeMatch[1]);
    const intensity = extractIntensity(trimmed);
    
    return {
      type: intensity === 'PL' ? 'rest' : 'run',
      duration,
      intensity: intensity ? {
        type: intensity,
        paceRange: INTENSITY_PACE_RANGES[intensity],
      } : undefined,
    };
  }
  
  return null;
}

// Parse repetition block like "3 x (800 TR x 200 TS)" or nested "2 x (3 x 500TL Rec.1'30\")"
function parseRepetitionBlock(text: string): WorkoutBlock | null {
  // Match pattern like "3 x" or "2 x" at the start
  const repetitionMatch = text.match(/^(\d+)\s*x\s*(.+)$/i);
  if (!repetitionMatch) return null;
  
  const times = parseInt(repetitionMatch[1]);
  const content = repetitionMatch[2].trim();
  
  // Remove outer parentheses if present
  let cleanContent = content.replace(/^\((.+)\)$/, '$1');
  
  // Parse steps from the content (may include nested blocks)
  const steps = parseStepsFromText(cleanContent);
  
  if (steps.length === 0) return null;
  
  return {
    type: 'repetition',
    times,
    steps,
  };
}

// Helper function to split a step text that might contain multiple steps (e.g., "400 TL Rec.1'30"", "1km TR Rec. 3'")
function splitCombinedSteps(stepText: string): string[] {
  const steps: string[] = [];
  // Pattern: distance + intensity + recovery (e.g., "400 TL Rec.1'30"", "1km TR Rec. 3'")
  // This pattern matches: distance (km/m) + space + intensity (2 letters) + space + Rec. + time
  const combinedPattern = /^([\d,]+(?:\.[\d]+)?\s*(?:km|m))\s+([A-Z]{2})\s+(Rec\.?\s*\d+['"]?\s*\d*[""]?)/i;
  const match = stepText.match(combinedPattern);
  
  if (match) {
    // Split into run step and rest step
    steps.push(`${match[1]} ${match[2]}`); // e.g., "400 TL" or "1km TR"
    steps.push(match[3]); // e.g., "Rec.1'30"" or "Rec. 3'"
    return steps;
  }
  
  // If no combined pattern, return as single step
  return [stepText];
}

// Helper function to parse steps from text separated by "x" (may include nested blocks)
function parseStepsFromText(text: string): (WorkoutStep | WorkoutBlock)[] {
  const steps: (WorkoutStep | WorkoutBlock)[] = [];
  let currentStep = '';
  let parenDepth = 0;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '(') parenDepth++;
    if (char === ')') parenDepth--;
    
    // Check if we have a nested repetition block
    if (char === '(' && parenDepth === 1) {
      // Find the matching closing parenthesis
      let nestedParenDepth = 1;
      let j = i + 1;
      while (j < text.length && nestedParenDepth > 0) {
        if (text[j] === '(') nestedParenDepth++;
        if (text[j] === ')') nestedParenDepth--;
        j++;
      }
      
      const nestedContent = text.substring(i + 1, j - 1);
      // Check if it's a repetition block
      if (nestedContent.match(/^\d+\s*x/i)) {
        const nestedBlock = parseRepetitionBlock(nestedContent);
        if (nestedBlock) {
          steps.push(nestedBlock);
          i = j - 1;
          // Clear currentStep since we've processed the nested block
          currentStep = '';
          // Continue to process any content after the closing parenthesis
          continue;
        }
      }
    }
    
    // Split by "x" only when not inside parentheses and preceded by space
    if (char === 'x' && parenDepth === 0 && i > 0 && text[i - 1] === ' ') {
      if (currentStep.trim()) {
        // Check if currentStep contains multiple steps (e.g., "400 TL Rec.1'30"")
        const splitSteps = splitCombinedSteps(currentStep.trim());
        for (const stepText of splitSteps) {
          const step = parseStep(stepText);
          if (step) steps.push(step);
        }
        currentStep = '';
      }
      // Skip the 'x' and following space
      if (i + 1 < text.length && text[i + 1] === ' ') {
        i++;
      }
      continue;
    }
    
    currentStep += char;
  }
  
  // Add last step(s)
  if (currentStep.trim()) {
    // Check if it's a nested block
    if (currentStep.trim().match(/^\d+\s*x/i)) {
      const nestedBlock = parseRepetitionBlock(currentStep.trim());
      if (nestedBlock) {
        steps.push(nestedBlock);
      } else {
        const step = parseStep(currentStep.trim());
        if (step) steps.push(step);
      }
    } else {
      // Check if currentStep contains multiple steps
      const splitSteps = splitCombinedSteps(currentStep.trim());
      for (const stepText of splitSteps) {
        const step = parseStep(stepText);
        if (step) steps.push(step);
      }
    }
  }
  
  return steps;
}

// Main parser function
export function parseWorkout(workoutText: string, name?: string, date?: string): ParsedWorkout {
  const normalized = workoutText.trim();
  
  // Split by "+" to get main sections
  const sections = normalized.split('+').map(s => s.trim());
  
  const warmup: WorkoutStep = {
    type: 'warmup',
    lapButtonPress: true,
    intensity: {
      type: 'TS',
      paceRange: INTENSITY_PACE_RANGES.TS,
    },
  };
  
  const cooldown: WorkoutStep = {
    type: 'cooldown',
    lapButtonPress: true,
    intensity: {
      type: 'TS',
      paceRange: INTENSITY_PACE_RANGES.TS,
    },
  };
  
  const blocks: (WorkoutStep | WorkoutBlock)[] = [];
  
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    
    // Check if it's a repetition block (with or without parentheses)
    if (section.match(/^\d+\s*x/i) || section.match(/\(?\d+\s*x/i)) {
      const block = parseRepetitionBlock(section.replace(/^\(/, '').replace(/\)$/, ''));
      if (block) {
        blocks.push(block);
        continue;
      }
    }
    
    // Check if it starts with distance (likely warmup/cooldown)
    if (section.match(/^\d+[km]/i)) {
      const distanceMatch = section.match(/([\d,]+(?:\.[\d]+)?)\s*(km|m)/i);
      if (distanceMatch) {
        const distance = parseDistance(distanceMatch[0]);
        const intensity = extractIntensity(section);
        
        // First section is usually warmup, last is cooldown
        if (i === 0) {
          warmup.distance = distance;
          warmup.intensity = intensity ? {
            type: intensity,
            paceRange: INTENSITY_PACE_RANGES[intensity],
          } : warmup.intensity;
        } else if (i === sections.length - 1) {
          cooldown.distance = distance;
          cooldown.intensity = intensity ? {
            type: intensity,
            paceRange: INTENSITY_PACE_RANGES[intensity],
          } : cooldown.intensity;
        } else {
          // Middle distance sections become run steps
          const step: WorkoutStep = {
            type: 'run',
            distance,
            intensity: intensity ? {
              type: intensity,
              paceRange: INTENSITY_PACE_RANGES[intensity],
            } : undefined,
          };
          blocks.push(step);
        }
        continue;
      }
    }
    
    // Try to parse as a regular step
    const step = parseStep(section);
    if (step) {
      blocks.push(step);
    }
  }
  
  return {
    name,
    date,
    warmup,
    blocks,
    cooldown,
  };
}

