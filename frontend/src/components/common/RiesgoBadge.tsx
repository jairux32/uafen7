import type { NivelRiesgo } from '../../types';

interface BadgeProps {
    nivel: NivelRiesgo;
    size?: 'sm' | 'md' | 'lg';
}

export default function RiesgoBadge({ nivel, size = 'md' }: BadgeProps) {
    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-0.5',
        lg: 'text-base px-3 py-1',
    };

    const colorClasses = {
        BAJO: 'badge-riesgo-bajo',
        MEDIO: 'badge-riesgo-medio',
        ALTO: 'badge-riesgo-alto',
        MUY_ALTO: 'badge-riesgo-muy-alto',
    };

    return (
        <span className={`badge ${colorClasses[nivel]} ${sizeClasses[size]}`}>
            {nivel.replace('_', ' ')}
        </span>
    );
}
