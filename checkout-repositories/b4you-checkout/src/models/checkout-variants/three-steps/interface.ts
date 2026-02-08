const _stepOtions = ["one", "two", "three"] as const;

export type StepTypes = (typeof _stepOtions)[number];
