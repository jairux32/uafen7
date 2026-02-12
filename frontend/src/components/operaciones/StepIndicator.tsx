import { Check } from 'lucide-react';

interface Step {
    number: number;
    label: string;
}

interface StepIndicatorProps {
    steps: Step[];
    currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
    return (
        <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                    {/* Step Circle */}
                    <div className="flex flex-col items-center">
                        <div
                            className={`
                                w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg
                                transition-all duration-300
                                ${step.number < currentStep
                                    ? 'bg-green-500 text-white'
                                    : step.number === currentStep
                                        ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                                        : 'bg-gray-200 text-gray-500'
                                }
                            `}
                        >
                            {step.number < currentStep ? (
                                <Check className="w-6 h-6" />
                            ) : (
                                step.number
                            )}
                        </div>
                        <span
                            className={`
                                mt-2 text-sm font-medium
                                ${step.number === currentStep
                                    ? 'text-primary-600'
                                    : step.number < currentStep
                                        ? 'text-green-600'
                                        : 'text-gray-500'
                                }
                            `}
                        >
                            {step.label}
                        </span>
                    </div>

                    {/* Connector Line */}
                    {index < steps.length - 1 && (
                        <div
                            className={`
                                w-24 h-1 mx-4 transition-all duration-300
                                ${step.number < currentStep ? 'bg-green-500' : 'bg-gray-200'}
                            `}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
