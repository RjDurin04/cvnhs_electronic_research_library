/**
 * Iconify Offline Support
 * 
 * This file imports and registers icon collections locally to enable
 * offline icon rendering. Icons are bundled with the application instead
 * of being fetched from the Iconify CDN at runtime.
 */

import { addCollection } from '@iconify/react';
import { icons as fluentEmojiFlat } from '@iconify-json/fluent-emoji-flat';

// Register the fluent-emoji-flat icon collection for offline use
export function initializeOfflineIcons(): void {
    addCollection(fluentEmojiFlat);
}
