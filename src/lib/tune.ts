import { ComputedNote, TunePresetId } from "@/types";

type TunePresetDefinition = {
  description: string;
  frequencies: number[];
};

// Adapted from Tune.js by Andrew Bernstein & Ben Taylor (MIT):
// https://github.com/abbernie/tune
class Tune {
  private scale: number[] = [];
  private tonic = 440;

  loadScale(definition: TunePresetDefinition): void {
    this.scale = [];
    for (let i = 0; i < definition.frequencies.length - 1; i++) {
      this.scale.push(definition.frequencies[i] / definition.frequencies[0]);
    }
  }

  tonicize(newTonic: number): void {
    this.tonic = newTonic;
  }

  note(stepIn: number, octaveIn = 0): number {
    const octave = Math.floor(stepIn / this.scale.length) + octaveIn;
    let scaleDegree = stepIn % this.scale.length;

    while (scaleDegree < 0) {
      scaleDegree += this.scale.length;
    }

    const freq = this.tonic * this.scale[scaleDegree] * Math.pow(2, octave);
    return Math.floor(freq * 100000000000) / 100000000000;
  }

  get scaleLength(): number {
    return this.scale.length;
  }
}

const TUNE_PRESETS: Record<TunePresetId, TunePresetDefinition> = {
  ji_12: {
    description: "Basic JI with 7-limit tritone",
    frequencies: [
      261.6255653006, 279.06726965397, 294.32876096318, 313.95067836072, 327.03195662575,
      348.83408706747, 366.27579142084, 392.4383479509, 418.60090448096, 436.04260883433,
      470.92601754108, 490.54793493862, 523.2511306012,
    ],
  },
  ji_12a: {
    description: "7-limit 12-tone scale",
    frequencies: [
      261.6255653006, 279.06726965397, 294.32876096318, 305.22982618403, 327.03195662575,
      348.83408706747, 366.27579142084, 392.4383479509, 418.60090448096, 448.50096908674,
      457.84473927605, 490.54793493862, 523.2511306012,
    ],
  },
  ji_12b: {
    description: "alternate 7-limit 12-tone scale",
    frequencies: [
      261.6255653006, 272.52663052146, 290.69507255622, 305.22982618403, 327.03195662575,
      343.38355445704, 366.27579142084, 392.4383479509, 418.60090448096, 448.50096908674,
      457.84473927605, 490.54793493862, 523.2511306012,
    ],
  },
  ji_12c: {
    description: "Kurzweil \"Just with natural b7th\", is Sauveur Just with 7/4",
    frequencies: [
      261.6255653006, 272.52663052146, 294.32876096318, 313.95067836072, 327.03195662575,
      348.83408706747, 367.91095120397, 392.4383479509, 418.60090448096, 436.04260883433,
      457.84473927605, 490.54793493862, 523.2511306012,
    ],
  },
  johnston: {
    description: "Ben Johnston's combined otonal-utonal scale",
    frequencies: [
      261.6255653006, 275.93321340298, 294.32876096318, 315.35224388912, 327.03195662575,
      359.73515228832, 367.91095120397, 392.4383479509, 401.35740131342, 441.49314144476,
      457.84473927605, 490.54793493862, 523.2511306012,
    ],
  },
  ji_19: {
    description: "5-limit 19-tone scale",
    frequencies: [
      261.6255653006, 272.52663052146, 275.93321340298, 279.06726965397, 294.32876096318,
      306.59245933664, 313.95067836072, 327.03195662575, 348.83408706747, 353.19451315581,
      367.91095120397, 392.4383479509, 408.78994578219, 418.60090448096, 436.04260883433,
      441.49314144476, 459.88868900496, 470.92601754108, 490.54793493862, 523.2511306012,
    ],
  },
  johnston_21: {
    description: "Johnston 21-note just enharmonic scale",
    frequencies: [
      261.6255653006, 272.52663052146, 282.55561052465, 294.32876096318, 306.59245933664,
      313.95067836072, 327.03195662575, 334.88072358477, 340.65828815182, 348.83408706747,
      363.36884069528, 376.74081403286, 392.4383479509, 408.78994578219, 418.60090448096,
      436.04260883433, 454.2110508691, 470.92601754108, 490.54793493862, 502.32108537715,
      510.98743222773, 523.2511306012,
    ],
  },
  mean19: {
    description: "5/19-comma meantone scale, fifths beats three times third. A.J. Ellis no. 11",
    frequencies: [
      261.6255653006, 273.06170311607, 292.41066686775, 313.13068664042, 326.81820677503,
      349.97632128221, 365.27443420834, 391.15752841841, 408.25574814862, 437.18446858874,
      468.16306089008, 488.62733218513, 523.2511306012,
    ],
  },
  pyth_12: {
    description: "12-tone Pythagorean scale",
    frequencies: [
      261.6255653006, 279.38237857051, 294.32876096318, 310.07474405997, 331.11985608357,
      348.83408706747, 372.50983809402, 392.4383479509, 419.07356785577, 441.49314144476,
      465.11211608996, 496.67978412536, 523.2511306012,
    ],
  },
  pyth_31: {
    description: "31-tone Pythagorean scale",
    frequencies: [
      261.6255653006, 265.19499215873, 275.62199471997, 279.38237857051, 283.19406633357,
      294.32876096318, 298.34436617857, 310.07474405997, 314.30517589183, 318.59332496145,
      326.6631048533, 331.11985608357, 335.63741195089, 348.83408706747, 353.59332287831,
      367.49599295996, 372.50983809402, 377.59208844475, 392.4383479509, 397.79248823809,
      413.43299207996, 419.07356785577, 424.79110016094, 441.49314144476, 447.51654926786,
      465.11211608996, 471.45776383774, 477.8899872033, 489.99465727995, 496.67978412536,
      503.45611792634, 523.2511306012,
    ],
  },
  slendro: {
    description: "Observed Javanese Slendro scale, Helmholtz/Ellis p. 518, nr.94",
    frequencies: [
      261.6255653006, 298.45295203849, 346.01554587335, 398.38689497567, 455.51656649021,
      523.2511306012,
    ],
  },
  xenakis_chrom: {
    description: "Xenakis's Byzantine Liturgical mode, 5 + 19 + 6 parts",
    frequencies: [
      261.6255653006, 274.52698453615, 329.62755691287, 349.22823143301, 391.99543598175,
      411.32572372413, 493.88330125613, 523.2511306012,
    ],
  },
  couperin: {
    description: "Couperin modified meantone",
    frequencies: [
      261.6255653006, 273.37431312998, 292.50627485027, 309.28785294636, 327.03195662575,
      349.91912034749, 365.63284274659, 391.22147055517, 408.78994578219, 437.39890198442,
      465.24345038333, 489.02683710225, 523.2511306012,
    ],
  },
  partch_43: {
    description: "Harry Partch's 43-tone pure scale",
    frequencies: [
      261.6255653006, 264.89588486686, 269.80136421624, 274.70684356563, 279.06726965397,
      285.40970760065, 287.78812183066, 290.69507255622, 294.32876096318, 299.00064605783,
      305.22982618403, 310.07474405997, 313.95067836072, 319.76457981184, 327.03195662575,
      332.97799220076, 336.37572681506, 343.38355445704, 348.83408706747, 353.19451315581,
      359.73515228832, 366.27579142084, 373.75080757229, 380.54627680087, 387.59343007496,
      392.4383479509, 398.6675280771, 406.97310157871, 411.12588832951, 418.60090448096,
      428.11456140098, 436.04260883433, 441.49314144476, 448.50096908674, 457.84473927605,
      465.11211608996, 470.92601754108, 475.68284600109, 479.64686971777, 490.54793493862,
      498.33441009638, 507.3950357345, 516.79124009995, 523.2511306012,
    ],
  },
  ptolemy: {
    description: "Intense Diatonic Syntonon, also Zarlino's scale",
    frequencies: [
      261.6255653006, 294.32876096318, 327.03195662575, 348.83408706747, 392.4383479509,
      436.04260883433, 490.54793493862, 523.2511306012,
    ],
  },
  ptolemy_iast: {
    description: "Ptolemy's Iastia or Lydia tuning, mixture of Tonic Diatonic & Intense Diatonic",
    frequencies: [
      261.6255653006, 271.31540105247, 310.07474405997, 348.83408706747, 392.4383479509,
      418.60090448096, 470.92601754108, 523.2511306012,
    ],
  },
  ptolemy_meta: {
    description: "Metabolika lyra tuning, mixture of Soft Diatonic & Tonic Diatonic",
    frequencies: [
      261.6255653006, 274.70684356563, 305.22982618403, 348.83408706747, 392.4383479509,
      406.97310157871, 465.11211608996, 523.2511306012,
    ],
  },
  zarlino2: {
    description: "16-note choice system of Zarlino, Sopplimenti musicali (1588)",
    frequencies: [
      261.6255653006, 272.52663052146, 290.69507255622, 294.32876096318, 310.07474405997,
      313.95067836072, 327.03195662575, 348.83408706747, 363.36884069528, 367.91095120397,
      392.4383479509, 408.78994578219, 436.04260883433, 465.11211608996, 470.92601754108,
      490.54793493862, 523.2511306012,
    ],
  },
  "young-lm_piano": {
    description: "LaMonte Young's Well-Tempered Piano",
    frequencies: [
      261.6255653006, 289.72987407313, 294.32876096318, 300.46061014991, 343.38355445704,
      338.01818641865, 386.30649876417, 392.4383479509, 400.61414686654, 457.84473927605,
      450.69091522486, 515.07533168556, 523.2511306012,
    ],
  },
  helmholtz_pure: {
    description: "Helmholtz's two-keyboard harmonium tuning untempered",
    frequencies: [
      261.6255653006, 275.93321340298, 279.06726965397, 290.69507255622, 294.32876096318,
      306.59245933664, 310.07474405997, 327.03195662575, 330.74639366397, 344.91651675372,
      348.83408706747, 367.91095120397, 372.08969287196, 387.59343007496, 392.4383479509,
      408.78994578219, 413.43299207996, 436.04260883433, 441.49314144476, 459.88868900496,
      465.11211608996, 490.54793493862, 496.11959049595, 516.79124009995, 523.2511306012,
    ],
  },
};

function getUpperOctaveNoteName(rootNoteName: string): string {
  const match = rootNoteName.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) {
    return `${rootNoteName} (+8ve)`;
  }

  return `${match[1]}${Number(match[2]) + 1}`;
}

function tuneNoteName(index: number, stepsPerOctave: number, rootNoteName: string): string {
  if (index === 0) {
    return rootNoteName;
  }
  if (index === stepsPerOctave) {
    return getUpperOctaveNoteName(rootNoteName);
  }
  return `${index}/${stepsPerOctave}`;
}

export function generateTunePreset(
  rootFreq: number,
  rootNoteName: string,
  preset: TunePresetId,
): ComputedNote[] {
  const tune = new Tune();
  const definition = TUNE_PRESETS[preset];
  tune.loadScale(definition);
  tune.tonicize(rootFreq);

  const stepsPerOctave = tune.scaleLength;

  return Array.from({ length: stepsPerOctave + 1 }, (_, index) => {
    const frequency = tune.note(index);
    return {
      index,
      name: tuneNoteName(index, stepsPerOctave, rootNoteName),
      frequency,
      ratio: null,
      pipeLengthMeters: 0,
      centsFromRoot: Math.round(1200 * Math.log2(frequency / rootFreq) * 100) / 100,
    };
  });
}
