import React from 'react';
import { Icon } from '@iconify/react';

interface IconRendererProps {
    iconName?: string;
    className?: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ iconName, className }) => {
    if (!iconName) return <Icon icon="fluent-emoji-flat:books" className={className} />;

    // Direct ID usage or fallback to construction
    const iconId = iconName.includes(':')
        ? iconName
        : `fluent-emoji-flat:${iconName.toLowerCase().replace(/\s+/g, '-')}`;

    return <Icon icon={iconId} className={className} />;
};
